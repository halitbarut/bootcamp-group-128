from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    exams = relationship("Exam", back_populates="owner")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="exams")
    questions = relationship("Question", back_populates="exam", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"))
    question_text = Column(String, index=True)
    answer = Column(String, index=True)
    options = Column(String)
    exam = relationship("Exam", back_populates="questions")

    # endpoint'ler için eklenen modeller 
class University(Base):
    __tablename__ = "universities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    departments = relationship("Department", back_populates="university")


class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"))

    university = relationship("University", back_populates="departments")
    class_levels = relationship("ClassLevel", back_populates="department")


class ClassLevel(Base):
    __tablename__ = "class_levels"
    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"))

    department = relationship("Department", back_populates="class_levels")