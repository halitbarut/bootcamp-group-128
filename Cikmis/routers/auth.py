from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from passlib.context import CryptContext

import sys
import os

import security

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models import User
from schemas import UserCreate, Token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return security.verify_password(plain_password, hashed_password)


def get_password_hash(password):
    return security.get_password_hash(password)

@router.get("/auth")
def get_auth_info():
    return {"message": "Auth endpoint"}

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kayıtlı.")

    hashed_pw = security.get_password_hash(user.password)
    new_user = User(
        username=user.username, 
        email=user.email,
        password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Kayıt başarılı."}


@router.post("/login", response_model=Token)  # response_model ekle
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user or not security.verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = security.create_access_token(
        data={"sub": user.username}  # "sub" (subject) standardı kullanılır
    )
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Token'ı header'dan alır, çözer ve veritabanından kullanıcıyı getirir.
    Bu fonksiyon, diğer endpointler için bir dependency (bağımlılık) olarak kullanılacak.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik bilgileri doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Token'ı gizli anahtar (secret_key) ile çözümleriz.
        payload = jwt.decode(token, config.settings.secret_key, algorithms=[config.settings.algorithm])
        # Token içindeki 'sub' alanından kullanıcı email'ini alırız.
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Email ile kullanıcıyı veritabanından buluruz.
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)):

    # Örnek: if not current_user.is_active: raise HTTPException(...)
    return current_user