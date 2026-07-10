from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from answer import answer_question

app = FastAPI(title="RM Knowledge Assistant")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str
    history: list[dict] = []


@app.get("/")
def home():
    return {"message": "RM Knowledge Assistant API"}


@app.post("/chat")
def chat(request: ChatRequest):

    answer, docs = answer_question(
        request.question,
        request.history,
    )

    context = [
        {
            "source": doc.metadata.get("source", ""),
            "content": doc.page_content,
        }
        for doc in docs
    ]

    return {
        "answer": answer,
        "context": context,
    }