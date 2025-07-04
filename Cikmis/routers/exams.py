from fastapi import APIRouter

# crud.py daki fonksiyonları kullanarak CRUD işlemlerini gerçekleştiren endpointler (/add_exam, /get_exam, /update_exam, /delete_exam)
router = APIRouter(
    prefix="/exams",
    tags=["Exams"],
)