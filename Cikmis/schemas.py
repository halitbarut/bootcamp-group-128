from pydantic import BaseModel, EmailStr
from typing import List, Optional

class QuestionBase(BaseModel):
    question_text: str
    answer: str
    options: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int
    exam_id: int

    class Config:
        orm_mode = True

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
        orm_mode = True

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None