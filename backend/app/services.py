from sqlalchemy.orm import Session
from sqlalchemy import select
from decimal import Decimal
from app.models import Wallet, Transaction
from fastapi import HTTPException

class WalletService:
    @staticmethod
    def process_transaction(db: Session, user_id: int, amount: Decimal, tx_type: str, ref_id: str):
        """
        Hàm xử lý tiền an toàn (Atomic Transaction)
        """
        try:
            # Bắt đầu transaction (tất cả thành công hoặc tất cả thất bại)
            # 1. Tìm ví và KHÓA DÒNG (Pessimistic Locking)
            # with_for_update() chặn các request khác sửa ví này cho đến khi xong
            stmt = select(Wallet).where(Wallet.user_id == user_id).with_for_update()
            wallet = db.execute(stmt).scalar_one_or_none()

            if not wallet:
                # Nếu chưa có ví, tạo mới (tùy logic)
                wallet = Wallet(user_id=user_id, balance=0)
                db.add(wallet)
                db.flush() # Để lấy ID

            # 2. Kiểm tra trùng lặp (Idempotency Check)
            stmt_check = select(Transaction).where(
                Transaction.reference_id == ref_id,
                Transaction.type == tx_type
            )
            existing_tx = db.execute(stmt_check).scalar_one_or_none()
            if existing_tx:
                # Nếu đã xử lý rồi thì trả về kết quả cũ, không trừ tiền nữa
                return {"status": "IGNORED", "new_balance": wallet.balance}

            # 3. Tính toán số dư
            current_balance = wallet.balance
            new_balance = current_balance + amount

            # Kiểm tra số dư âm (nếu cần)
            if new_balance < 0:
                raise HTTPException(status_code=400, detail="Số dư không đủ")

            # 4. Cập nhật Ví
            wallet.balance = new_balance

            # 5. Ghi log Transaction
            new_tx = Transaction(
                wallet_id=wallet.id,
                amount=amount,
                balance_before=current_balance,
                balance_after=new_balance,
                type=tx_type,
                reference_id=ref_id,
                status="SUCCESS"
            )
            db.add(new_tx)
            
            # Commit Transaction (Lưu vào DB)
            db.commit()
            db.refresh(wallet)
            
            return {"status": "SUCCESS", "new_balance": wallet.balance, "tx_id": new_tx.id}

        except Exception as e:
            db.rollback() # Hoàn tác nếu có lỗi bất kỳ
            raise e