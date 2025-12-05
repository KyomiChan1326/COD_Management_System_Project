# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Dùng SQLite để test nhanh (tạo file cod_wallet.db trong thư mục hiện tại)
# Khi deploy thật, đổi dòng này thành URL của MySQL/PostgreSQL
SQLALCHEMY_DATABASE_URL = "sqlite:///./cod_wallet.db"
# Ví dụ MySQL: "mysql+pymysql://user:password@localhost/db_name"

# check_same_thread=False chỉ cần thiết cho SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Hàm Dependency để lấy DB session cho mỗi request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()