# backend/app/models.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# Modelos de usuarios
class UserCreate(BaseModel):
    """
    Modelo para crear un nuevo usuario con perfil.

    Attributes:
        email (EmailStr): Correo electrónico del usuario.
        password (str): Contraseña del usuario.
        first_name (str): Nombre del usuario.
        last_name (str): Apellido del usuario.
        phone (str): Número de teléfono del usuario.
        id_role (int): ID del rol del usuario (por defecto 2, usuario normal).
    """
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str
    id_role: int = 2  # Por defecto, asumimos que es un usuario normal

class UserLogin(BaseModel):
    """
    Modelo para el inicio de sesión del usuario.

    Attributes:
        email (EmailStr): Correo electrónico del usuario.
        password (str): Contraseña del usuario.
    """
    email: EmailStr
    password: str

class UserOut(BaseModel):
    """
    Modelo para la respuesta de información del usuario.

    Attributes:
        id_user (int): ID del usuario.
        email (EmailStr): Correo electrónico del usuario.
        first_name (Optional[str]): Nombre del usuario.
        last_name (Optional[str]): Apellido del usuario.
        phone (Optional[str]): Número de teléfono del usuario.
        id_role (int): ID del rol del usuario.
        state (bool): Estado del usuario (activo/inactivo).
    """
    id_user: int
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    id_role: int
    state: bool

class UserUpdate(BaseModel):
    """
    Modelo para actualizar un usuario.

    Attributes:
        email (Optional[EmailStr]): Correo electrónico del usuario.
        first_name (Optional[str]): Nombre del usuario.
        last_name (Optional[str]): Apellido del usuario.
        phone (Optional[str]): Número de teléfono del usuario.
        id_role (Optional[int]): ID del rol del usuario.
    """
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    id_role: Optional[int] = None

class Token(BaseModel):
    """
    Modelo para el token de autenticación.

    Attributes:
        access_token (str): Token de acceso.
        token_type (str): Tipo de token (por defecto "bearer").
    """
    access_token: str
    token_type: str = "bearer"

# Modelos de servicios
class ServiceBase(BaseModel):
    """
    Modelo base para servicios.

    Attributes:
        name (str): Nombre del servicio.
        description (Optional[str]): Descripción del servicio.
        duration_minutes (int): Duración del servicio en minutos.
        price (float): Precio del servicio.
        state (bool): Estado del servicio (activo/inactivo).
    """
    name: str
    description: Optional[str] = None
    duration_minutes: int
    price: float
    state: bool = True

class ServiceOut(ServiceBase):
    """
    Modelo para la respuesta de información del servicio.

    Attributes:
        id_service (int): ID del servicio.
    """
    id_service: int