# backend/app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.rutas import auth, service, upload_excel 
from app.database import init_pool, get_conn
from mysql.connector import Error as MySQLError
import logging

app = FastAPI(
    title="Proyecto Reservas",
    version="1.0",
    description="Backend para la gestión de usuarios, servicios y reservas de un Centro de Belleza",
    openapi_tags=[
        {"name": "Auth", "description": "Registro y autenticación de usuarios"},
        {"name": "Services", "description": "Gestión de servicios (solo admin)"}
    ]
)

def custom_openapi():
    """
    Personaliza el esquema OpenAPI para incluir autenticación JWT.

    Returns:
        dict: Esquema OpenAPI personalizado.
    """
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # URL del frontend Angular
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router)
app.include_router(service.router)
app.include_router(upload_excel.router)

@app.on_event("startup")
async def startup():
    """
    Inicializa el pool de conexiones a la base de datos al iniciar la aplicación.
    """
    try:
        init_pool()
    except Exception as e:
        logging.error(f"Error al inicializar el pool de conexiones: {str(e)}")

@app.get("/")
async def ping():
    """
    Endpoint simple para verificar que la API está funcionando.

    Returns:
        dict: Mensaje de estado OK.
    """
    return {"msg": "API is running"}

@app.get("/health")
async def health_check():
    """
    Realiza una verificación de salud de la API y la conexión a la base de datos.

    Returns:
        dict: Estado de salud de la API y la base de datos.

    Raises:
        HTTPException: Si hay un problema con la conexión a la base de datos.
    """
    try:
        with get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return {
            "status": "healthy",
            "api": "running",
            "database": "connected"
        }
    except MySQLError as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")