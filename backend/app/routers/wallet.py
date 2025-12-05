from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from decimal import Decimal
from app.database import get_db
from app.services import WalletService

router = APIRouter()

# Schema dữ liệu đầu vào
class CODRequest(BaseModel):
    user_id: int
    order_id: str
    amount: Decimal # Dùng Decimal, không dùng float

@router.post("/cod-collect")
def collect_cod(request: CODRequest, db: Session = Depends(get_db)):
    """
    API Shipper xác nhận thu tiền (Trừ tiền ví Shipper)
    """
    # Vì thu tiền mặt -> Tiền ví Online bị trừ
    # Chuyển amount sang số âm
    deduct_amount = -abs(request.amount) 
    
    result = WalletService.process_transaction(
        db=db,
        user_id=request.user_id,
        amount=deduct_amount,
        tx_type="COD_COLLECT",
        ref_id=f"ORDER_{request.order_id}" # RefID unique
    )
    
    return result