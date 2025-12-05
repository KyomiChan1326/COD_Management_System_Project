# backend/main.py
import uvicorn
from fastapi import FastAPI
from app.database import engine, Base
from app.routers import wallet # Import router đã viết ở bước trước

# Tự động tạo bảng (wallets, transactions) nếu chưa có
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="COD Wallet System",
    description="Hệ thống ví điện tử và đối soát COD cho Logistics",
    version="1.0.0"
)

# Đăng ký các đường dẫn API
app.include_router(wallet.router, prefix="/api/wallet", tags=["Wallet"])

@app.get("/")
def read_root():
    return {"message": "Hệ thống COD Wallet đang chạy!"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)