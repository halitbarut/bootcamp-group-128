from fastapi import FastAPI

from routers import auth, exams

app = FastAPI(title="Çıkmış Sınavlar API")

app.include_router(auth.router)
app.include_router(exams.router)

@app.get("/")
def read_root():
    return {"message": "Hello World!"}
