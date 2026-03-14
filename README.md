# Ask YouTube

Ask YouTube is an application designed to query YouTube video transcripts in a conversational format. The core function is to fetch a video transcript, process the text into embeddings, and run a retrieval-augmented generation (RAG) pipeline to answer user questions purely based on the video context.

## Tech Stack Overview

### Backend Architecture
The backend is written in Python, using the built-in `http.server` instead of a framework like FastAPI or Flask. It orchestrates the RAG pipeline using LangChain.

Key components:
- Vector Store: FAISS for local, in-memory vector storage.
- Embeddings Model: HuggingFace (`BAAI/bge-small-en`).
- LLM Provider: Groq API (`openai/gpt-oss-20b` or equivalent) via LangChain.
- Transcript Extraction: `youtube_transcript_api` to automatically pull captions (with fallback for Hindi and English).
- Text Splitting: `RecursiveCharacterTextSplitter` configured for 1000-character chunks with a 200-character overlap.

Endpoints structure:
- `/load_video` (POST): Expects a `video_id`. Pulls the transcript, chunks it, embeds it, and saves it to the FAISS instance. Sets up the main retrieval chain.
- `/ask` (POST): Takes a user `question`. Passes the query to the in-memory LangChain pipeline, retrieves relevant document chunks from FAISS, and returns the LLM response. The prompt is strictly instructed to only use the retrieved context and ignore external knowledge.

### Frontend Architecture
The frontend is a Next.js application setup.
- Node environment
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4

## Running the Project Locally

You will need an active API key from Groq and a HuggingFace access token.

1. Add your API keys:
Create a `.env` file at the root of the project. Include the following variables:

```text
HUGGINGFACEHUB_API_TOKEN=your_hugging_face_token
GROQ_API_KEY=your_groq_api_key
```

2. Start the Backend:
Install the required Python dependencies. The primary libraries are `langchain`, `langchain-huggingface`, `langchain-groq`, `faiss-cpu`, `youtube-transcript-api`, and `python-dotenv`.

Run the server script:

```bash
python main.py
```
This binds the HTTP server to port 8000.

3. Start the Frontend:
Navigate into the frontend directory, install dependencies, and run the development server.

```bash
cd frontend
npm install
npm run dev
```

The UI will be accessible on localhost:3000.

## Workflow
After starting both servers, open the frontend application. Provide a YouTube video ID to index the text. Once indexing completes, you can ask questions. The LLM will parse the local vector store context and return a response based on the video data.
