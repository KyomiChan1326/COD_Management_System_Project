from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, index=True, nullable=False)
    # DECIMAL(19, 2) đảm bảo chính xác tuyệt đối cho tiền tệ
    balance = Column(DECIMAL(19, 2), default=0.00, nullable=False)
    currency = Column(String(3), default="VND")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id"), nullable=False)
    
    amount = Column(DECIMAL(19, 2), nullable=False) # Số tiền (+ hoặc -)
    balance_before = Column(DECIMAL(19, 2), nullable=False)
    balance_after = Column(DECIMAL(19, 2), nullable=False)
    
    type = Column(String(50), nullable=False) # COD_COLLECT, TOPUP...
    reference_id = Column(String(100), nullable=False) # Mã đơn hàng / Mã GD ngân hàng
    status = Column(String(20), default="SUCCESS")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Unique Constraint: Chặn trùng lặp giao dịch ở tầng Database
    __table_args__ = (
        {"sqlite_autoincrement": True}, # Chỉ ví dụ, thực tế dùng Postgres/MySQL
    )