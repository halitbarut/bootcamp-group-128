# routers/academics.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import crud, schemas
from database import get_db

router = APIRouter(
    prefix="/academics",
    tags=["Academics"]
)

# --- University Endpoints ---

@router.post("/universities/", response_model=schemas.University)
def create_university(university: schemas.UniversityCreate, db: Session = Depends(get_db)):
    return crud.create_university(db=db, name=university.name)

@router.get("/universities/", response_model=List[schemas.University])
def read_universities(db: Session = Depends(get_db)):
    return crud.get_universities(db)

# --- Department Endpoints ---

@router.post("/departments/", response_model=schemas.Department)
def create_department(department: schemas.DepartmentCreate, db: Session = Depends(get_db)):
    return crud.create_department(db=db, name=department.name, university_id=department.university_id)

@router.get("/universities/{university_id}/departments/", response_model=List[schemas.Department])
def read_departments_for_university(university_id: int, db: Session = Depends(get_db)):
    departments = crud.get_departments_by_university(db, university_id=university_id)
    if not departments:
        raise HTTPException(status_code=404, detail="University not found or has no departments")
    return departments

# --- Class Level Endpoints ---

@router.post("/class-levels/", response_model=schemas.ClassLevel)
def create_class_level(class_level: schemas.ClassLevelCreate, db: Session = Depends(get_db)):
    return crud.create_class_level(db=db, level=class_level.level, department_id=class_level.department_id)

@router.get("/departments/{department_id}/classes/", response_model=List[schemas.ClassLevel])
def read_classes_for_department(department_id: int, db: Session = Depends(get_db)):
    classes = crud.get_classes_by_department(db, department_id=department_id)
    if not classes:
         raise HTTPException(status_code=404, detail="Department not found or has no class levels")
    return classes