from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    phone: str
    password: str
    role: str

class UserLogin(BaseModel):
    phone: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    phone: str
    role: str

    class Config:
        orm_mode = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
