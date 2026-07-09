import os 
from pathlib import Path
from dotenv import load_dotenv
from tenacity import retry, wait_exponential
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv(override=True)

MODEL = os.getenv("LLM_MODEL")

BASE_DIR=Path(__file__).resolve().parent.parent

DB_NAME=str(BASE_DIR/"preprocessed_db")
COLLECTION_NAME = "docs"
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL")
KNOWLEDGE_BASE_PATH = BASE_DIR / "knowledge-base"
AVERAGE_CHUNK_SIZE=100

wait = wait_exponential(multiplier=1, min=10, max=240)

openai=OpenAI()

class Result(BaseModel):
    page_content:str
    metadata:dict
    
class Chunk(BaseModel):
    headline:str=Field(
        description="A brief heading for this chunk, typically a few words, that is most likely to be surfaced in a query",
    )
    summary:str=Field(
        description="A few sentences summarizing the content of this chunk to answer common questions"
    )
    original_text:str=Field(
        description="The original text of this chunk from the provided document, exactly as is, not changed in any way"
    )
    
    def as_result(self, document):
        metadata={"source":document["source"], "type":document["type"]}
        return Result(
            page_content=self.headline + "\n\n" + self.summary + "\n\n" + self.original_text,
            metadata=metadata,
        )
        
class Chunks(BaseModel):
    chunks:list[Chunk]
    
if __name__ == "__main__":
    print("HI")