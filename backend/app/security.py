# backend/app/security.py
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from . import config

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """
    Genera un hash de la contraseña proporcionada.

    Args:
        password (str): Contraseña en texto plano.

    Returns:
        str: Hash de la contraseña.
    """
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    """
    Verifica si una contraseña en texto plano coincide con su hash.

    Args:
        plain (str): Contraseña en texto plano.
        hashed (str): Hash de la contraseña.

    Returns:
        bool: True si la contraseña coincide, False en caso contrario.
    """
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """
    Crea un token de acceso JWT.

    Args:
        data (dict): Datos a incluir en el token.
        expires_delta (timedelta | None): Tiempo de expiración del token.

    Returns:
        str: Token JWT codificado.

    Raises:
        Exception: Si hay un error al crear el token.
    """
    try:
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta if expires_delta 
            else timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, config.settings.SECRET_KEY, algorithm=config.settings.ALGORITHM)
        return encoded_jwt
    except Exception as e:
        raise Exception(f"Error al crear el token de acceso: {str(e)}")