from fastapi import FastAPI

import models
from database import engine
from routers import auth, exams

models.Base.metadata.create_all(bind=engine)
app = FastAPI(title="Çıkmış Sınavlar API")

app.include_router(auth.router)
app.include_router(exams.router)

@app.get("/")
def read_root():
    return {"message": "Hello World!"}
