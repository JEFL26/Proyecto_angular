
#backend/app/rutas/service.py
from fastapi import APIRouter, HTTPException, Depends, Header
from ..core import service_logic, user_logic
from ..models import ServiceBase, ServiceOut
from jose import jwt, JWTError
from ..config import settings

router = APIRouter(prefix="/services", tags=["Services"])

# === Verificación mínima del token ===
def verify_admin_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        user = user_logic.get_user_by_email(email)
        if not user or user["id_role"] != 1:  # solo admin (id_role=1)
            raise HTTPException(status_code=403, detail="Not authorized")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# === Endpoints ===
@router.get("/", response_model=list[ServiceOut])
def list_services():
    return service_logic.get_all_services()

@router.get("/{id_service}", response_model=ServiceOut)
def get_service(id_service: int):
    service = service_logic.get_service_by_id(id_service)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.post("/", dependencies=[Depends(verify_admin_token)])
def create_service(data: ServiceBase):
    new_id = service_logic.create_service(data.dict())
    return {"msg": "Service created", "id_service": new_id}

@router.put("/{id_service}", dependencies=[Depends(verify_admin_token)])
def update_service(id_service: int, data: ServiceBase):
    existing = service_logic.get_service_by_id(id_service)
    if not existing:
        raise HTTPException(status_code=404, detail="Service not found")
    service_logic.update_service(id_service, data.dict())
    return {"msg": "Service updated"}

@router.delete("/{id_service}", dependencies=[Depends(verify_admin_token)])
def delete_service(id_service: int):
    existing = service_logic.get_service_by_id(id_service)
    if not existing:
        raise HTTPException(status_code=404, detail="Service not found")
    service_logic.delete_service(id_service)
    return {"msg": "Service deleted"}