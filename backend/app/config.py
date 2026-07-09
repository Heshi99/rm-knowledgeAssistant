from pathlib import Path
import os 
from dotenv import load_dotenv

load_dotenv()

BASE_DIR=Path(__file__).resolve().parent.parent


DB_NAME=str(BASE_DIR/"preprocessed_db")
KNOWLEDGE_BASE_PATH = BASE_DIR / "knowledge-base"
COLLECTION_NAME = "docs"

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")
LLM_MODEL = os.getenv("LLM_MODEL")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL")

