# routers/exams.py
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

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
    university_id: int,
    department_id: int,
    class_level: int,
    year: int,
    semester: str,
    db: Session = Depends(get_db)
):
    exams = crud.get_exams_filtered(db, university_id, department_id, class_level, year, semester)
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