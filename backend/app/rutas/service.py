#backend/app/rutas/service.py
from fastapi import APIRouter, HTTPException, Depends, Header
from ..core import service_logic, user_logic
from ..models import ServiceBase, ServiceOut
from jose import jwt, JWTError
from ..config import settings

router = APIRouter(prefix="/services", tags=["Services"])

def verify_admin_token(authorization: str = Header(...)):
    """
    Verifica que el token pertenezca a un administrador.
    
    Args:
        authorization (str): Token de autorización.
    
    Returns:
        dict: Datos del usuario administrador.
    
    Raises:
        HTTPException: Si el token es inválido o el usuario no es administrador.
    """
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

@router.get("/", response_model=list[ServiceOut])
def list_services():
    """
    Lista todos los servicios.
    
    Returns:
        list[ServiceOut]: Lista de servicios.
    
    Raises:
        HTTPException: Si hay un error al obtener los servicios.
    """
    try:
        return service_logic.get_all_services()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing services: {str(e)}")

@router.get("/{id_service}", response_model=ServiceOut)
def get_service(id_service: int):
    """
    Obtiene un servicio por su ID.
    
    Args:
        id_service (int): ID del servicio.
    
    Returns:
        ServiceOut: Datos del servicio.
    
    Raises:
        HTTPException: Si el servicio no se encuentra o hay un error.
    """
    try:
        service = service_logic.get_service_by_id(id_service)
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        return service
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting service: {str(e)}")

@router.post("/", dependencies=[Depends(verify_admin_token)])
def create_service(data: ServiceBase):
    """
    Crea un nuevo servicio.
    
    Args:
        data (ServiceBase): Datos del servicio a crear.
    
    Returns:
        dict: Mensaje de confirmación y ID del nuevo servicio.
    
    Raises:
        HTTPException: Si hay un error al crear el servicio.
    """
    try:
        new_id = service_logic.create_service(data.dict())
        return {"msg": "Service created", "id_service": new_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating service: {str(e)}")

@router.put("/{id_service}", dependencies=[Depends(verify_admin_token)])
def update_service(id_service: int, data: ServiceBase):
    """
    Actualiza un servicio existente.
    
    Args:
        id_service (int): ID del servicio a actualizar.
        data (ServiceBase): Nuevos datos del servicio.
    
    Returns:
        dict: Mensaje de confirmación.
    
    Raises:
        HTTPException: Si el servicio no se encuentra o hay un error al actualizarlo.
    """
    try:
        existing = service_logic.get_service_by_id(id_service)
        if not existing:
            raise HTTPException(status_code=404, detail="Service not found")
        service_logic.update_service(id_service, data.dict())
        return {"msg": "Service updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating service: {str(e)}")

@router.delete("/{id_service}", dependencies=[Depends(verify_admin_token)])
def delete_service(id_service: int):
    """
    Elimina un servicio.
    
    Args:
        id_service (int): ID del servicio a eliminar.
    
    Returns:
        dict: Mensaje de confirmación.
    
    Raises:
        HTTPException: Si el servicio no se encuentra o hay un error al eliminarlo.
    """
    try:
        existing = service_logic.get_service_by_id(id_service)
        if not existing:
            raise HTTPException(status_code=404, detail="Service not found")
        service_logic.delete_service(id_service)
        return {"msg": "Service deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting service: {str(e)}")