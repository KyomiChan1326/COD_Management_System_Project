from pydantic import BaseModel

class UserRegister(BaseModel):
    name: str
    phone: str
    password: str

class UserLogin(BaseModel):
    phone: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
