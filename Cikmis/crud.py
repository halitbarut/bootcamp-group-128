from sqlalchemy.orm import Session, selectinload

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

# Üniversite CRUD
def get_universities(db: Session) -> list[models.University]:
    return db.query(models.University).options(selectinload(models.University.departments)).all()

def get_university_by_id(db: Session, university_id: int) -> models.University | None:
    return db.query(models.University).filter(models.University.id == university_id).first()

def create_university(db: Session, name: str) -> models.University:
    db_university = models.University(name=name)
    db.add(db_university)
    db.commit()
    db.refresh(db_university)
    return db_university

def delete_university(db: Session, university_id: int) -> None:
    db_university = get_university_by_id(db, university_id)
    if not db_university:
        return None
    db.delete(db_university)
    db.commit()

# Bölüm CRUD
def get_departments_by_university(db: Session, university_id: int) -> list[models.Department]:
    return db.query(models.Department).filter(models.Department.university_id == university_id).options(selectinload(models.Department.classLevels)).all()

def get_department_by_id(db: Session, department_id: int) -> models.Department | None:
    return db.query(models.Department).filter(models.Department.id == department_id).first()

def create_department(db: Session, name: str, university_id: int) -> models.Department:
    db_department = models.Department(name=name, university_id=university_id)
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

def delete_department(db: Session, department_id: int) -> None:
    db_department = get_department_by_id(db, department_id)
    if not db_department:
        return None
    db.delete(db_department)
    db.commit()

# Sınıf seviyesi CRUD
def get_classes_by_department(db: Session, department_id: int) -> list[models.ClassLevel]:
    return db.query(models.ClassLevel).filter(models.ClassLevel.department_id == department_id).all()

def get_class_by_id(db: Session, class_id: int) -> models.ClassLevel | None:
    return db.query(models.ClassLevel).filter(models.ClassLevel.id == class_id).first()

def create_class_level(db: Session, level: int, department_id: int) -> models.ClassLevel:
    db_class = models.ClassLevel(level=level, department_id=department_id)
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

def delete_class_level(db: Session, class_id: int) -> None:
    db_class = get_class_by_id(db, class_id)
    if not db_class:
        return None
    db.delete(db_class)
    db.commit()

# Soru CRUD
def get_questions_by_exam(db: Session, exam_id: int) -> list[models.Question]:
    return db.query(models.Question).filter(models.Question.exam_id == exam_id).all()

def create_question(db: Session, exam_id: int, question_text: str, answer: str, options: str | None = None) -> models.Question:
    db_question = models.Question(
        exam_id=exam_id,
        question_text=question_text,
        answer=answer,
        options=options
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def delete_question(db: Session, question_id: int) -> None:
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not db_question:
        return None
    db.delete(db_question)
    db.commit()

# New function to get exams filtered
def get_exams_filtered(
    db: Session,
    university_id: int | None = None,
    department_id: int | None = None,
    class_level: int | None = None,
    year: int | None = None,
    semester: int | None = None,
) -> list[models.Exam]:
    query = db.query(models.Exam)

    if university_id:
        query = query.join(models.Question).join(models.ClassLevel).join(models.Department).join(models.University).filter(models.University.id == university_id)
    if department_id:
        query = query.join(models.Question).join(models.ClassLevel).join(models.Department).filter(models.Department.id == department_id)
    if class_level:
        query = query.join(models.Question).join(models.ClassLevel).filter(models.ClassLevel.level == class_level)
    if year:
        # Assuming `Exam` model has a 'year' column. If not, you'll need to add it or infer from elsewhere.
        # For now, let's assume `Exam` has `year` and `semester` columns.
        query = query.filter(models.Exam.year == year)
    if semester:
        # Assuming `Exam` model has a 'semester' column
        query = query.filter(models.Exam.semester == semester)

    return query.all()

def create_questions_bulk(db: Session, exam_id: int, questions_data: list[QuestionCreate]) -> list[models.Question]:
    db_questions = []
    for q_data in questions_data:
        options_json = q_data.options
        if isinstance(options_json, list):
            options_json = ";".join(options_json) # Convert list of options to a string for JSON column if needed

        db_question = models.Question(
            exam_id=exam_id,
            question_text=q_data.question_text,
            answer=q_data.answer,
            options=options_json # Store as JSON or a delimited string
        )
        db_questions.append(db_question)
        db.add(db_question)
    db.commit()
    for q in db_questions:
        db.refresh(q)
    return db_questions