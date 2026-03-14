import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
from dotenv import load_dotenv

from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnableParallel, RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser

load_dotenv()
hf_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")
groq_api_key = os.getenv("GROQ_API_KEY")

#set hf cache dir to local folder
os.environ["HF_HOME"] = os.path.join(os.getcwd(), ".cache", "huggingface")

#drop ssl env var that causes issues
os.environ.pop("SSLKEYLOGFILE", None)

#store state
current_vector_store = None
main_chain = None

def format_docs(retrieved_docs):
    return "\n\n".join(doc.page_content for doc in retrieved_docs)

class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        #allow cors
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_POST(self):
        global current_vector_store, main_chain
        
        parsed_path = urlparse(self.path)
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            req_data = json.loads(post_data.decode('utf-8'))
        except json.JSONDecodeError:
            self._set_headers(400)
            self.wfile.write(json.dumps({"detail": "Invalid JSON"}).encode('utf-8'))
            return

        if parsed_path.path == "/load_video":
            video_id = req_data.get("video_id")
            if not video_id:
                self._set_headers(400)
                self.wfile.write(json.dumps({"detail": "video_id is required"}).encode('utf-8'))
                return
                
            try:
                #fetch transcript
                ytt_api = YouTubeTranscriptApi()
                transcript_list = ytt_api.fetch(video_id, languages=["hi", "en"])
                transcript = " ".join([t.text for t in transcript_list])

                #split text
                splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
                chunks = splitter.create_documents([transcript])

                #create vector store
                embeddings = HuggingFaceEmbeddings(
                    model_name="BAAI/bge-small-en",
                    model_kwargs={"token": hf_token}
                )
                current_vector_store = FAISS.from_documents(chunks, embeddings)

                #setup retriever
                retriever = current_vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 4})

                # setup llm
                llm = ChatGroq(
                    model="openai/gpt-oss-20b",
                    temperature=0.5,
                    groq_api_key=groq_api_key
                )

                prompt = PromptTemplate(
                    template="""
                      You are a helpful assistant.
                      Answer ONLY from the provided transcript context.
                      If the context is insufficient, just say you don't know.

                      {context}
                      Question: {question}
                    """,
                    input_variables=['context', 'question']
                )

                parallel_chain = RunnableParallel({
                    'context': retriever | RunnableLambda(format_docs),
                    'question': RunnablePassthrough()
                })
                
                parser = StrOutputParser()
                main_chain = parallel_chain | prompt | llm | parser

                self._set_headers(200)
                self.wfile.write(json.dumps({"message": "Video indexed successfully"}).encode('utf-8'))
            except Exception as e:
                print(f"Error loading video: {e}")
                self._set_headers(500)
                self.wfile.write(json.dumps({"detail": str(e)}).encode('utf-8'))

        elif parsed_path.path == "/ask":
            question = req_data.get("question")
            if not question:
                self._set_headers(400)
                self.wfile.write(json.dumps({"detail": "question is required"}).encode('utf-8'))
                return
                
            if not main_chain:
                self._set_headers(400)
                self.wfile.write(json.dumps({"detail": "No video loaded yet."}).encode('utf-8'))
                return
            
            try:
                response = main_chain.invoke(question)
                self._set_headers(200)
                self.wfile.write(json.dumps({"answer": response}).encode('utf-8'))
            except Exception as e:
                print(f"Error asking question: {e}")
                self._set_headers(500)
                self.wfile.write(json.dumps({"detail": str(e)}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"detail": "Not found"}).encode('utf-8'))

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"Starting standard lib HTTP server on port {port}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
