from fastapi import FastAPI

import config
import models
from database import engine
from routers import auth, exams
import google.generativeai as genai

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Çıkmış Sınavlar API")

app.include_router(auth.router)
app.include_router(exams.router)

try:
    genai.configure(api_key=config.settings.api_key)
except Exception as e:
    print(f"Gemini API yapılandırılamadı. Lütfen .env dosyasındaki API_KEY'i kontrol edin. Hata: {e}")

@app.get("/")
def read_root():
    return {"message": "Hello World!"}
