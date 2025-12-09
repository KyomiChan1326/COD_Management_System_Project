from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user_schema import UserResponse
from app.middleware.auth_middleware import get_db, get_current_admin

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    return db.query(User).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(404, "User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted"}
