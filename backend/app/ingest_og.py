import os 
from pathlib import Path
from dotenv import load_dotenv
from tenacity import retry, wait_exponential
from openai import OpenAI
from pydantic import BaseModel, Field
from litellm import completion 
from multiprocessing import Pool
from tqdm import tqdm
from chromadb import PersistentClient

load_dotenv(override=True)

WORKERS=1
MODEL = "ollama/llama3.2:1b"

BASE_DIR=Path(__file__).resolve().parent.parent

DB_NAME=str(BASE_DIR/"preprocessed_db")
COLLECTION_NAME = "docs"
EMBEDDING_MODEL = "mxbai-embed-large"
KNOWLEDGE_BASE_PATH = BASE_DIR / "knowledge-base"
AVERAGE_CHUNK_SIZE=100

wait = wait_exponential(multiplier=1, min=10, max=240)

openai=OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"
)

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
    
    # def as_result(self, document):
    #     metadata={"source":document["source"], "type":document["type"]}
    #     return Result(
    #         page_content=self.headline + "\n\n" + self.summary + "\n\n" + self.original_text,
    #         metadata=metadata,
    #     )
    def as_result(self, document):
        metadata = {
        "source": document["source"]
        }

        return Result(
        page_content=self.headline + "\n\n" +
                     self.summary + "\n\n" +
                     self.original_text,
        metadata=metadata,
    )
class Chunks(BaseModel):
    chunks:list[Chunk]
    
    
# def fetch_documents():
#     # without langchain - Langchain Directory Loader
#     documents=[]
    
#     for folder in KNOWLEDGE_BASE_PATH.iterdir():
#         doc_type=folder.name
#         for file in folder.rglob("*.md"):
#             with open(file, "r", encoding="utf-8") as f:
#                 documents.append({"type":doc_type, "source":file.as_posix(), "text":f.read()})
    
#     print(f"Loaded{len(documents)} documents")            
#     return documents

def fetch_documents():
    documents = []

    for file in KNOWLEDGE_BASE_PATH.glob("*.md"):

        with open(file, "r", encoding="utf-8") as f:

            documents.append({
                "source": file.name,
                "text": f.read()
            })

    print(f"Loaded {len(documents)} documents")
    
    return documents

    
def make_prompt(document):
    how_many=(len(document["text"]) // AVERAGE_CHUNK_SIZE) +1 
    
    return f"""
    You are preparing a knowledge base for an AI aasistant that
    answers questions about Kim Namjoon (RM of BTS).
    
    The document you are processing is retrieved from :
    Source : {document["source"]}
    
    Your task is to split this document into coherent, overlappipng chunks 
    that are suitable for Retrieval Augmented Generation(RAG)
    
    Requirements:
    - Split the document into logical selections rather than fixed size chunks.
    - Ensure the entire document is covered without omitting any information.
    - Create approximately {how_many} chunks, but adjust the number if it 
    improves readability and retrieval quality.
    - Include an overlap between consecutive chunks (around 20–25% or 
    roughly 50 words) so important information isn't lost across chunk 
    boundaries.
    - Each chunk should focus on a single topic or idea whenever possible.
    
    For every chunk, provide:
    headline - A short, descriptive title that captures the main topic of the chunk.
    summary -  A concise summary (2-4 sentences) highlighting the key facts, names, dates, events, works, or concepts discussed in the chunk. This summary should help retrieve the chunk for relevant user questions.
    original_text - The exact text from the document corresponding to this chunk. Do not rewrite, paraphrase, or modify it.

Here is the document:
{document["text"]}
Return the response as a list of chunks following the required schema.
    """        
    
def make_messages(document):
    return [
        {"role":"user",
         "content":make_prompt(document)},
    ]   
    
# @retry(wait=wait)
# def process_document(document):
#     messages = make_messages(document)
#     response = completion(model=MODEL,api_base="http://localhost:11434",messages=messages)
#     print(response.choices[0].message.content)
#     reply=response.choices[0].message.content
#     doc_as_chunks=Chunks.model_validate_json(reply).chunks
#     return [chunk.as_result(document) for chunk in doc_as_chunks]
    
    
def process_document(document):
    print(f"\nProcessing: {document['source']}")

    messages = make_messages(document)

    print("Calling Ollama...")

    response = completion(
        model=MODEL,
        api_base="http://localhost:11434",
        messages=messages,
        response_format=Chunks,
    )

    print("Response received!")

    reply = response.choices[0].message.content

    doc_as_chunks = Chunks.model_validate_json(reply).chunks

    print("Parsed JSON!")

    return [chunk.as_result(document) for chunk in doc_as_chunks]

def create_chunks(documents):
    chunks=[]
    with Pool(processes=WORKERS) as pool:
        for result in tqdm(pool.imap_unordered(process_document, documents), total=len(documents)):
            chunks.extend(result)
    
    return chunks

def create_embeddings(chunks):
    chroma=PersistentClient(path=DB_NAME)

    if COLLECTION_NAME in [c.name for c in chroma.list_collections()]:
        chroma.delete_collection(COLLECTION_NAME)
        
    texts=[chunk.page_content for chunk in chunks]
    emb=openai.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts
    )
    
    # vectors=[e.embedding for e in emb]
    vectors = [e.embedding for e in emb.data]
    
    collection=chroma.get_or_create_collection(COLLECTION_NAME)
    
    ids=[str(i) for i in range(len(chunks))]
    metas=[chunk.metadata for chunk in chunks]
    
    collection.add(ids=ids, embeddings=vectors, documents=texts, metadatas=metas)
    print(f"Vectorstore created with {collection.count()} documents.")
    
        
if __name__ == "__main__":
   documents=fetch_documents()
   chunks=create_chunks(documents)
   create_embeddings(chunks)
   print("Ingestion Completed")