# schemas.py

from pydantic import BaseModel, EmailStr
from typing import List, Optional

# --- Question Schemas ---
class QuestionBase(BaseModel):
    question_text: str
    answer: str
    options: Optional[List[str]] = None

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    exam_id: int
    class Config:
        from_attributes = True

# --- Exam Schemas ---
class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None
    course_name: str
    year: int
    semester: str
    university_id: Optional[int] = None
    department_id: Optional[int] = None
    class_level_id: Optional[int] = None

class ExamCreate(ExamBase):
    questions: List[QuestionCreate] = []

class Exam(ExamBase):
    id: int
    user_id: int
    questions: List[Question] = []
    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Academic Entity Schemas ---

# University
class UniversityBase(BaseModel):
    name: str

class UniversityCreate(UniversityBase):
    pass

class University(UniversityBase):
    id: int
    class Config:
        from_attributes = True

# Department
class DepartmentBase(BaseModel):
    name: str
    university_id: int

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

# Class Level
class ClassLevelBase(BaseModel):
    level: int
    department_id: int

class ClassLevelCreate(ClassLevelBase):
    pass

class ClassLevel(ClassLevelBase):
    id: int
    class Config:
        from_attributes = True

# Diğer şemalarınız (Gemini vs.) burada kalabilir.
class GeminiOption(BaseModel):
    options: str
    text: str

class GeminiQuestionResponse(BaseModel):
    question: str
    options: List[GeminiOption]
    correct_ans: str

class GenerateQuestionRequest(BaseModel):
    original_question: str

class ExplainQuestionRequest(BaseModel):
    question: str
    options: List[GeminiOption]
    correct_answer: str
    user_answer: Optional[str] = None

class QuestionExplanationResponse(BaseModel):
    explanation: str

class QuestionUpload(BaseModel):
    question_text: str
    answer: str
    options: Optional[List[str]] = None

class QuestionsUploadRequest(BaseModel):
    exam_id: int
    questions: List[QuestionUpload]