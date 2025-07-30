from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

import config

DATABASE_URL = config.settings.database_url

engine = create_engine(
    DATABASE_URL,
    pool_recycle=300,  # 300 saniye (5 dakika) boşta kalan bağlantıları otomatik olarak yenile
    pool_pre_ping=True # Havuzdan bir bağlantı almadan önce "canlı mı?" diye test et
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
