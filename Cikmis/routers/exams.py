# routers/exams.py
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from starlette import status

import database
import crud
import schemas

from services import ai_service

router = APIRouter(
    prefix="/exams",
    tags=["Exams"]
)

# Veritabanı bağlantısı
get_db = database.get_db

# 📌 1. Üniversite listesini getir
@router.get("/universities", response_model=List[schemas.University])
def get_universities(db: Session = Depends(get_db)):
    return crud.get_universities(db)

# 📌 2. Seçilen üniversitenin bölümlerini getir
@router.get("/universities/{university_id}/departments", response_model=List[schemas.Department])
def get_departments(university_id: int, db: Session = Depends(get_db)):
    return crud.get_departments_by_university(db, university_id)

# 📌 3. Seçilen bölümün sınıflarını getir
@router.get("/departments/{department_id}/classes", response_model=List[schemas.ClassLevel])
def get_classes(department_id: int, db: Session = Depends(get_db)):
    return crud.get_classes_by_department(db, department_id)

# 📌 4. Belirli üniversite, bölüm, sınıf, yıl ve döneme göre sınavları getir
@router.get("/", response_model=List[schemas.Exam])
def get_filtered_exams(
    db: Session = Depends(get_db),
    university_id: Optional[int] = None,
    department_id: Optional[int] = None,
    class_level: Optional[int] = None,
    year: Optional[int] = None,
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
):
    exam = crud.get_exam_by_id(db, exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found.")

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