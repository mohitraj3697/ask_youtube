import os
import traceback
from dotenv import load_dotenv

from youtube_transcript_api import YouTubeTranscriptApi
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

load_dotenv()
hf_token = os.getenv("HUGGINGFACEHUB_API_TOKEN")

# Set HuggingFace cache directory to a local folder to avoid PermissionError
os.environ["HF_HOME"] = os.path.join(os.getcwd(), ".cache", "huggingface")

try:
    print("Fetching Transcript...")
    video_id = "dQw4w9WgXcQ"
    ytt_api = YouTubeTranscriptApi()
    transcript_list = ytt_api.fetch(video_id, languages=["hi", "en"])
    transcript = " ".join([t.text for t in transcript_list])

    print("Splitting Texts...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.create_documents([transcript])

    print("Creating Embeddings...")
    embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-en",
        model_kwargs={"token": hf_token}
    )
    
    print("Creating FAISS Vector Store...")
    current_vector_store = FAISS.from_documents(chunks, embeddings)
    
    print("Success!")
except Exception as e:
    print("ERROR CAUGHT:")
    traceback.print_exc()
