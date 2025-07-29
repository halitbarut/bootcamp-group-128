# routers/exams.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

<<<<<<< Updated upstream
from starlette import status

import database
import crud
import schemas

from services import ai_service
=======
import crud, schemas
from database import get_db
from routers.auth import get_current_active_user # Bu satırı kendi auth yapınıza göre düzenleyin
>>>>>>> Stashed changes

router = APIRouter(
    prefix="/exams",
    tags=["Exams"]
)

@router.post("/", response_model=schemas.Exam)
def create_exam(
    exam: schemas.ExamCreate, 
    db: Session = Depends(get_db), 
    current_user: schemas.User = Depends(get_current_active_user)
):
    """
    Yeni bir sınav ve ona ait soruları oluşturur.
    - title, course_name, year, semester zorunludur.
    - university_id, department_id, class_level_id opsiyoneldir.
    - questions listesi en az bir soru içermelidir (isteğe bağlı kural).
    """
    return crud.create_exam(db=db, exam=exam, user_id=current_user.id)


@router.get("/", response_model=List[schemas.Exam])
def search_exams(
    university_id: Optional[int] = None,
    department_id: Optional[int] = None,
    class_level_id: Optional[int] = None,
    course_name: Optional[str] = None,
    year: Optional[int] = None,
<<<<<<< Updated upstream
    semester: Optional[int] = None,
):
    exams = crud.get_exams_filtered(db, university_id, department_id, class_level, year, semester) # get_exams_filtered fonksiyonunu yaz.
    if not exams:
        raise HTTPException(status_code=404, detail="No exams found for the selected filters.")
    return exams

# 📌 5. Seçilen sınavın sorularını getir
@router.get("/{exam_id}/questions", response_model=List[schemas.Question])
def get_questions_by_exam(exam_id: int, db: Session = Depends(get_db)):
    questions = crud.get_questions_by_exam(db, exam_id)
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this exam.")
    return questions

# 📌 Gemini ile Benzer Soru Oluşturma Endpoint'i
@router.post("/generate-similar-question",
             response_model=schemas.GeminiQuestionResponse,
             summary="Benzer Soru Oluştur (Gemini)")
def generate_similar_question(request: schemas.GenerateQuestionRequest):
    return ai_service.generate_question_with_ai(request.original_question)

# 📌 Bir Soruyu Açıklama Endpoint'i (Gemini)
@router.post("/explain-question",
             response_model=schemas.QuestionExplanationResponse,
             summary="Soruyu Açıkla (Gemini)")
def explain_question(request: schemas.ExplainQuestionRequest):
    return ai_service.explain_question_with_ai(request)

# 📌 Yeni: Text olarak soruları yükleme endpoint'i
@router.post("/{exam_id}/upload-questions", status_code=status.HTTP_201_CREATED, response_model=List[schemas.Question])
def upload_questions_to_exam(
        exam_id: int,
        questions_data: List[schemas.QuestionUpload],
        db: Session = Depends(get_db)
=======
    semester: Optional[str] = None,
    db: Session = Depends(get_db)
>>>>>>> Stashed changes
):
    """
    Belirtilen kriterlere göre sınavları filtreleyerek listeler.
    Tüm parametreler opsiyoneldir.
    """
    exams = crud.get_exams_filtered(
        db=db,
        university_id=university_id,
        department_id=department_id,
        class_level_id=class_level_id,
        course_name=course_name,
        year=year,
        semester=semester
    )
    return exams

<<<<<<< Updated upstream
    questions_to_create = []
    for q_data in questions_data:
        questions_to_create.append(
            schemas.QuestionCreate(
                question_text=q_data.question_text,
                answer=q_data.answer,
                options=q_data.options
            )
        )
    created_questions = crud.create_questions_bulk(db, exam_id, questions_to_create)
    return created_questions


@router.post("/", response_model=schemas.Exam, status_code=status.HTTP_201_CREATED)
def create_exam(exam: schemas.ExamCreate, db: Session = Depends(get_db)):
    user_id = 1 # bu kısım elden geçirilecek. Şuan geçici olarak 1 olarak ayarlandı.
    return crud.create_exam(db=db, exam=exam, user_id=user_id)
=======
@router.get("/{exam_id}", response_model=schemas.Exam)
def read_exam(exam_id: int, db: Session = Depends(get_db)):
    db_exam = crud.get_exam_by_id(db, exam_id=exam_id)
    if db_exam is None:
        raise HTTPException(status_code=404, detail="Exam not found")
    return db_exam
>>>>>>> Stashed changes
