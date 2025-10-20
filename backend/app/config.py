# backend/app/config.py
"""
Módulo de Configuración
=======================
Carga y valida las variables de entorno.
"""
from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
ENV_PATH = BASE_DIR.parent / ".env"  # PROYECTO_RESERVAS/.env


class Settings(BaseSettings):
    
    # Configuración de la aplicación
    APP_NAME: str = "Biblioteca Digital"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Configuración de MySQL
    MYSQL_HOST: str
    MYSQL_PORT: int = 3306
    MYSQL_USER: str
    MYSQL_PASSWORD: str
    MYSQL_DATABASE: str
    MYSQL_ROOT_PASSWORD: str
    
    # Configuración de seguridad
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        
    # Configuración de pydantic para cargar el archivo .env
        env_file = ENV_PATH
        case_sensitive = True


@lru_cache()

def get_settings() -> Settings:
    
  
    return Settings()

settings = get_settings()