# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from fastapi.openapi.models import APIKey, APIKeyIn
from fastapi.openapi.utils import get_openapi
from app.rutas import auth, service, upload_excel 
from app.database import init_pool

app = FastAPI(
    title="Proyecto Reservas",
    version="1.0",
    description="Backend para la gestión de usuarios, servicios y reservas de un Centro de Belleza",
    openapi_tags=[
        {"name": "Auth", "description": "Registro y autenticación de usuarios"},
        {"name": "Services", "description": "Gestión de servicios (solo admin)"}
    ]
)

# Seguridad global para Swagger
app.openapi_schema = None
def custom_openapi():
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
# Esto permite que el frontend (Angular) se comunique con el backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # URL del frontend Angular
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los headers
)


app.include_router(auth.router)
app.include_router(service.router)
app.include_router(upload_excel.router)

@app.on_event("startup")
def startup():
    init_pool()

@app.get("/")
def ping():
    return {"msg": "ok"}