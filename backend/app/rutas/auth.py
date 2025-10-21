#backend/app/rutas/auth.py
from fastapi import APIRouter, HTTPException
from datetime import timedelta
from ..core import user_logic
from ..security import create_access_token
from ..config import settings
from ..models import UserCreate, UserOut, UserLogin

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut)
def register(data: UserCreate):
    """
    Crea un nuevo usuario si el email no existe.
    
    Args:
        data (UserCreate): Datos del usuario a crear.
    
    Returns:
        UserOut: Datos del usuario creado.
    
    Raises:
        HTTPException: Si el email ya está registrado.
    """
    try:
        user = user_logic.get_user_by_email(data.email)
        if user:
            raise HTTPException(status_code=400, detail="Email already registered")
        new_user = user_logic.create_user(data)
        return UserOut(**new_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@router.post("/login")
def login(data: UserLogin):
    """
    Autentica usuario y genera token JWT.
    
    Args:
        data (UserLogin): Credenciales del usuario.
    
    Returns:
        dict: Token de acceso y tipo.
    
    Raises:
        HTTPException: Si las credenciales son inválidas.
    """
    try:
        user = user_logic.authenticate_user(data.email, data.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_access_token(
            {"sub": user["email"], "role": user["id_role"]},
            timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        return {"access_token": token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")