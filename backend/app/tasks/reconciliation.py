import pandas as pd
from sqlalchemy.orm import Session
from app.services import WalletService
from decimal import Decimal

def process_bank_statement_file(file_path: str, db: Session):
    """
    Đọc file Excel/CSV ngân hàng và cộng tiền tự động
    """
    # 1. Đọc file bằng Pandas
    df = pd.read_excel(file_path) # Hoặc pd.read_csv
    
    results = []

    # 2. Duyệt từng dòng
    for index, row in df.iterrows():
        bank_desc = row['description'] # Ví dụ: "NAP TIEN USER 123"
        amount = Decimal(str(row['amount'])) # Chuyển sang Decimal
        bank_tx_id = str(row['transaction_id'])
        
        # 3. Logic tách User ID từ nội dung (Regex)
        # Giả sử nội dung là "COD 123"
        import re
        match = re.search(r'COD\s+(\d+)', bank_desc)
        
        if match:
            user_id = int(match.group(1))
            
            # 4. Gọi Service lõi để cộng tiền
            # Tái sử dụng hàm process_transaction để đảm bảo an toàn
            try:
                res = WalletService.process_transaction(
                    db=db,
                    user_id=user_id,
                    amount=amount, # Cộng tiền (số dương)
                    tx_type="BANK_TOPUP",
                    ref_id=bank_tx_id # Dùng mã GD ngân hàng làm khóa chống trùng
                )
                results.append({"bank_tx": bank_tx_id, "status": res['status']})
            except Exception as e:
                 results.append({"bank_tx": bank_tx_id, "status": "ERROR", "msg": str(e)})
        else:
             results.append({"bank_tx": bank_tx_id, "status": "SKIPPED", "msg": "No User ID found"})
             
    return results