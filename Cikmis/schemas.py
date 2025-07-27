from pydantic import BaseModel, EmailStr
from typing import List, Optional

class QuestionBase(BaseModel):
    question_text: str
    answer: str
    options: Optional[list] = None

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    exam_id: int

    class Config:
        from_attributes = True

class ExamBase(BaseModel):
    title: str
    description: Optional[str] = None

class ExamCreate(ExamBase):
    questions: List[QuestionCreate] = []

class Exam(ExamBase):
    id: int
    user_id: int
    questions: List[Question] = []

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

 # Endpoint'lere özel ek şemalar 
class University(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class Department(BaseModel):
    id: int
    name: str
    university_id: int

    class Config:
        from_attributes = True

class ClassLevel(BaseModel):
    id: int
    level: int
    department_id: int

    class Config:
        from_attributes = True

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