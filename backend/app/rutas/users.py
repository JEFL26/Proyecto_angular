# backend/app/rutas/users.py
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..core import user_logic
from ..models import UserOut, UserUpdate
from ..security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/test")
def test_auth(current_user: dict = Depends(get_current_user)):
    """
    Endpoint de prueba para verificar la autenticación.
    """
    return {"message": "Auth working", "user": current_user}

@router.get("/debug")
def debug_users():
    """
    Endpoint de debug para verificar usuarios sin autenticación.
    """
    try:
        users = user_logic.get_all_users()
        return {"message": "Debug successful", "users_count": len(users), "users": users}
    except Exception as e:
        return {"message": "Debug failed", "error": str(e)}

@router.get("/", response_model=List[UserOut])
def get_all_users(current_user: dict = Depends(get_current_user)):
    """
    Obtiene todos los usuarios registrados en el sistema.
    Solo accesible para administradores.
    
    Args:
        current_user (dict): Usuario autenticado actual.
    
    Returns:
        List[UserOut]: Lista de todos los usuarios.
    
    Raises:
        HTTPException: Si el usuario no es administrador.
    """
    # Verificar que el usuario sea administrador
    if current_user.get("role") != 1:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    try:
        users = user_logic.get_all_users()
        return [UserOut(**user) for user in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting users: {str(e)}")

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, current_user: dict = Depends(get_current_user)):
    """
    Obtiene un usuario específico por su ID.
    Solo accesible para administradores.
    
    Args:
        user_id (int): ID del usuario a obtener.
        current_user (dict): Usuario autenticado actual.
    
    Returns:
        UserOut: Datos del usuario.
    
    Raises:
        HTTPException: Si el usuario no es administrador o no existe.
    """
    # Verificar que el usuario sea administrador
    if current_user.get("role") != 1:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    try:
        user = user_logic.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return UserOut(**user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user: {str(e)}")

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    """
    Actualiza los datos de un usuario.
    Solo accesible para administradores.
    
    Args:
        user_id (int): ID del usuario a actualizar.
        user_data (UserUpdate): Datos a actualizar.
        current_user (dict): Usuario autenticado actual.
    
    Returns:
        UserOut: Datos actualizados del usuario.
    
    Raises:
        HTTPException: Si el usuario no es administrador o no existe.
    """
    # Verificar que el usuario sea administrador
    if current_user.get("role") != 1:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    try:
        # Verificar que el usuario existe
        existing_user = user_logic.get_user_by_id(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Actualizar usuario
        updated_user = user_logic.update_user(user_id, user_data.dict(exclude_unset=True))
        return UserOut(**updated_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")

@router.patch("/{user_id}/deactivate")
def deactivate_user(user_id: int, current_user: dict = Depends(get_current_user)):
    """
    Desactiva un usuario (soft delete).
    Solo accesible para administradores.
    
    Args:
        user_id (int): ID del usuario a desactivar.
        current_user (dict): Usuario autenticado actual.
    
    Returns:
        dict: Mensaje de confirmación.
    
    Raises:
        HTTPException: Si el usuario no es administrador o no existe.
    """
    # Verificar que el usuario sea administrador
    if current_user.get("role") != 1:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    try:
        # Verificar que el usuario existe
        existing_user = user_logic.get_user_by_id(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Desactivar usuario
        user_logic.deactivate_user(user_id)
        return {"message": "User deactivated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deactivating user: {str(e)}")

@router.patch("/{user_id}/activate")
def activate_user(user_id: int, current_user: dict = Depends(get_current_user)):
    """
    Reactiva un usuario.
    Solo accesible para administradores.
    
    Args:
        user_id (int): ID del usuario a reactivar.
        current_user (dict): Usuario autenticado actual.
    
    Returns:
        dict: Mensaje de confirmación.
    
    Raises:
        HTTPException: Si el usuario no es administrador o no existe.
    """
    # Verificar que el usuario sea administrador
    if current_user.get("role") != 1:
        raise HTTPException(status_code=403, detail="Access denied. Admin role required.")
    
    try:
        # Verificar que el usuario existe
        existing_user = user_logic.get_user_by_id(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Reactivar usuario
        user_logic.activate_user(user_id)
        return {"message": "User activated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error activating user: {str(e)}")
