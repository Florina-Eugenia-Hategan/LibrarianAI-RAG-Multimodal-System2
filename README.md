
# Smart Librarian – AI with RAG + Tool

Smart Librarian is an AI assistant for book recommendations, using Retrieval-Augmented Generation (RAG) and multimodal features (text, voice, image). It combines OpenAI GPT, ChromaDB, and a modern UI to deliver personalized suggestions for digital libraries.

---

## Project Overview
A chatbot AI that recommends books based on user interests, using OpenAI GPT + RAG (ChromaDB), and provides a detailed summary via a separate tool. Includes optional features: TTS, STT, image generation, and a modern React UI.

---

## Features & Requirements
- Book summaries database (`book_summaries.json`) with 10+ books
- ChromaDB vector store (local, persistent)
- Uses OpenAI embeddings (`text-embedding-3-small`)
- Retriever for semantic search by theme/context
- Chatbot (React UI) integrated with FastAPI backend
- Tool: `get_summary_by_title(title: str)` returns full summary
- Function calling: summary tool is called automatically after recommendation
- Optional: TTS (listen to recommendations), STT (voice input), image generation (DALL-E 3)
- Modern UI (React)

---

## Setup Instructions

### 1. Clone the repository
```
git clone https://github.com/Florina-Eugenia-Hategan/LibrarianAI-RAG-Multimodal-System2.git
cd Project_RAG
```

### 2. Backend Setup
- Go to `backend` folder
- Create `.env` file with your OpenAI API key:
  ```
  OPENAI_API_KEY=sk-...
  ```
- Install dependencies:
  ```
  pip install -r requirements.txt
  ```
- Load book summaries into ChromaDB (persistent vector DB):
  ```
  python load_summaries_to_chromadb.py
  ```
- Start FastAPI backend:
  ```
  python -m uvicorn app.main:app --reload
  ```

### 3. Frontend Setup
- Go to `frontend` folder
- Install dependencies:
  ```
  npm install
  ```
- Start React app:
  ```
  npm start
  ```
- Open browser at `http://localhost:3000`

---

## How to Test
- Ask for recommendations: "I want a book about friendship and magic."
- Try: "What do you recommend for someone who loves war stories?"
- Try: "What is 1984?"
- Rename or delete chats in sidebar
- Use microphone button for voice input (STT)
- Use volume button to listen to answer (TTS)
- See generated image for recommended book
- Try uploading a file or processing a link

---

## API Endpoints
- `POST /rag-query/` – Ask a question, get recommendation + summary
- `POST /get-summary/` – Get full summary for a book title
- `POST /generate-image/` – Get image for a book (DALL-E 3)
- `POST /upload-file/` – Upload and index a file
- `POST /process-link/` – Index content from a URL

---

## Example Test Questions
- "I want a book about freedom and social control."
- "What do you recommend if I love fantasy stories?"
- "What is 1984?"

---

## Dependencies
- Python, FastAPI, ChromaDB, OpenAI, React, Material-UI

---

## Data Persistence & Semantic Search
- Book summaries and chat messages are stored in a local vector database (ChromaDB) in the `chromadb_data` folder.
- Embeddings are generated using OpenAI (`text-embedding-3-small`).
- All data is indexed for semantic search by theme or context.
- Chat messages are automatically saved in the vector database during every interaction.
- You can list all saved books and chat messages using the provided API endpoints or scripts.

---

## Troubleshooting
- Asigură-te că ai OpenAI API key valid și acces la DALL-E 3 pentru generarea imaginilor.
- Dacă apar probleme la încărcarea rezumatelor, verifică formatul fișierului `book_summaries.json` și permisiunile folderului `chromadb_data`.
- Pentru orice eroare, verifică logurile backend și permisiunile API key.

---

Project is fully compliant with RAG requirements: persistent vector DB, OpenAI embeddings, and semantic retriever.
