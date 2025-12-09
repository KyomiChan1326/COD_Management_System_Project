from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserLogin, TokenResponse, UserResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.middleware.auth_middleware import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):

    existed = db.query(User).filter(User.phone == user.phone).first()
    if existed:
        raise HTTPException(status_code=400, detail="Phone already registered")

    new_user = User(
        name=user.name,
        phone=user.phone,
        password_hash=hash_password(user.password),
        role=user.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid phone or password")

    token = create_access_token({"sub": str(user.id), "role": user.role})

    return TokenResponse(access_token=token)
