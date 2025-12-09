from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    phone = Column(String(20), unique=True, index=True)
    password_hash = Column(String(255))
    role = Column(String(20))  # admin | shipper | shop
    created_at = Column(DateTime, default=datetime.utcnow)
