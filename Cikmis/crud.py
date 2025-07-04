from sqlalchemy.orm import Session

import models
import security
from schemas import UserCreate


# kullanıcı CRUD işlemleri için gerekli fonksiyonlar (create_user, get_user_by_email, update_user, delete_user)
# sınav CRUD işlemleri için gerekli fonksiyonlar (get_all_exams, get_exam_by_id, create_exam, *update_exam, *delete_exam)


def get_user_by_email(db: Session, email: str) -> models.User | None:
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: UserCreate) -> models.User:
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> models.User | bool:
    user = get_user_by_email(db, email)
    if not user or not security.verify_password(password, user.hashed_password):
        return False
    return user

def update_user(db: Session, user_id: int, user_update: UserCreate) -> models.User:
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    db_user.email = user_update.email
    if user_update.password:
        db_user.hashed_password = security.get_password_hash(user_update.password)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> None:
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    db.delete(db_user)
    db.commit()
    return None

def get_all_exams(db: Session, skip: int = 0, limit: int = 100) -> list[models.Exam]:
    return db.query(models.Exam).offset(skip).limit(limit).all()

def get_exam_by_id(db: Session, exam_id: int) -> models.Exam | None:
    return db.query(models.Exam).filter(models.Exam.id == exam_id).first()

def create_exam(db: Session, exam: models.Exam, user_id: int) -> models.Exam:
    db_exam = models.Exam(**exam.model_dump(), user_id=user_id)
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

