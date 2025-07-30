from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

import config
import models
from database import engine
from routers import auth, exams, academics
import google.generativeai as genai

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Çıkmış Sınavlar API")

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://cikmis-front.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(exams.router)
app.include_router(academics.router)

try:
    genai.configure(api_key=config.settings.api_key)
except Exception as e:
    print(f"Gemini API yapılandırılamadı. Lütfen .env dosyasındaki API_KEY'i kontrol edin. Hata: {e}")

@app.get("/")
def read_root():
    return {"message": "Hello World!"}
