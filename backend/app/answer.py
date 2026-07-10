from pathlib import Path
# from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_ollama import ChatOllama
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.messages import SystemMessage, HumanMessage, convert_to_messages
from langchain_core.documents import Document

MODEL="llama3.2"

BASE_DIR = Path(__file__).resolve().parent.parent
DB_NAME = str(BASE_DIR / "preprocessed_db")

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
# embeddings="mxbai-embed-large"
RETRIEVAL_K = 10

SYSTEM_PROMPT = """
You are RM Knowledge Assistant, an AI assistant dedicated to answering questions about Kim Namjoon (RM), the leader of BTS.
Your role is to provide accurate, helpful, and well-structured answers using the supplied knowledge base context whenever it is relevant.
Guidelines:
- Base your answers primarily on the provided context.
- If the context contains the answer, use it faithfully without inventing or altering facts.
- If the context is incomplete but you are reasonably certain from well-established public knowledge, you may provide a brief answer and clearly distinguish it from the retrieved context.
- If you do not know the answer or the information is not available in the provided context, say so honestly instead of guessing.
- Keep responses clear, conversational, and informative.
- When appropriate, include important details such as dates, album names, songs, collaborations, speeches, awards, projects, or events mentioned in the context.
- If the user asks about opinions or interpretations, distinguish between factual information and interpretation.
- Never fabricate quotes, interviews, lyrics, or events.

Retrieved Context:
{context}
"""

vectorstore=Chroma(persist_directory=DB_NAME, embedding_function=embeddings)
retriever=vectorstore.as_retriever()
llm=ChatOllama(temperature=0, model=MODEL)

def fetch_context(quesstion:str)->list[Document]:
    # retrieve relevant context document for a question 
    return retriever.invoke(quesstion, k=RETRIEVAL_K)

def combined_question(question:str, history:list[dict]=[])-> str:
    # combine all user msgs into a single string
    
    prior = "\n".join(m["content"] for m in history if m["role"] == "user")
    return prior + "\n" + question

def answer_question(question:str, history:list[dict]=[])->tuple[str, list[Document]]:
    # answer the question with rag 
    combined=combined_question(question, history)
    docs=fetch_context(combined)
    context = "\n\n".join(doc.page_content for doc in docs)
    system_prompt = SYSTEM_PROMPT.format(context=context)
    messages = [SystemMessage(content=system_prompt)]
    messages.extend(convert_to_messages(history))
    messages.append(HumanMessage(content=question))
    response = llm.invoke(messages)
    return response.content, docs