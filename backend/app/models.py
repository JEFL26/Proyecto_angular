#backend/app/models.py

#funciona como los schemas

from pydantic import BaseModel, EmailStr
from typing import Optional

# Modelos de usuarios

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

    # modelos de servicios

class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: int
    price: float
    state: bool = True

class ServiceOut(ServiceBase):
    id_service: int
