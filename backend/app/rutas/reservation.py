# backend/app/rutas/reservation.py
from fastapi import APIRouter, HTTPException, Depends, Header
from ..core import reservation_logic, user_logic
from ..models import ReservationCreate, ReservationOut
from jose import jwt, JWTError
from ..config import settings

router = APIRouter(prefix="/reservations", tags=["Reservations"])

def get_current_user(authorization: str = Header(...)):
    """
    Obtiene el usuario actual desde el token JWT.
    
    Args:
        authorization (str): Token de autorización.
    
    Returns:
        dict: Datos del usuario autenticado.
    
    Raises:
        HTTPException: Si el token es inválido.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        user = user_logic.get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

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
    user = get_current_user(authorization)
    if user["id_role"] != 1:  # solo admin (id_role=1)
        raise HTTPException(status_code=403, detail="Not authorized")
    return user

@router.post("/", response_model=dict)
def create_reservation(data: ReservationCreate, user: dict = Depends(get_current_user)):
    """
    Crea una nueva reserva para el usuario autenticado.
    
    Args:
        data (ReservationCreate): Datos de la reserva.
        user (dict): Usuario autenticado.
    
    Returns:
        dict: Mensaje de confirmación y ID de la nueva reserva.
    
    Raises:
        HTTPException: Si hay un error al crear la reserva.
    """
    try:
        new_id = reservation_logic.create_reservation(user["id_user"], data.dict())
        return {"msg": "Reservation created successfully", "id_reservation": new_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating reservation: {str(e)}")

@router.get("/my-reservations", response_model=list[ReservationOut])
def get_my_reservations(user: dict = Depends(get_current_user)):
    """
    Obtiene todas las reservas del usuario autenticado.
    
    Args:
        user (dict): Usuario autenticado.
    
    Returns:
        list[ReservationOut]: Lista de reservas del usuario.
    
    Raises:
        HTTPException: Si hay un error al obtener las reservas.
    """
    try:
        reservations = reservation_logic.get_user_reservations(user["id_user"])
        return reservations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting reservations: {str(e)}")

@router.get("/", response_model=list[ReservationOut])
def get_all_reservations(user: dict = Depends(verify_admin_token)):
    """
    Obtiene todas las reservas del sistema (solo para administradores).
    
    Args:
        user (dict): Usuario administrador.
    
    Returns:
        list[ReservationOut]: Lista de todas las reservas.
    
    Raises:
        HTTPException: Si hay un error al obtener las reservas.
    """
    try:
        reservations = reservation_logic.get_all_reservations()
        return reservations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting reservations: {str(e)}")

@router.get("/{id_reservation}", response_model=ReservationOut)
def get_reservation(id_reservation: int, user: dict = Depends(get_current_user)):
    """
    Obtiene una reserva por su ID.
    
    Args:
        id_reservation (int): ID de la reserva.
        user (dict): Usuario autenticado.
    
    Returns:
        ReservationOut: Datos de la reserva.
    
    Raises:
        HTTPException: Si la reserva no se encuentra o no pertenece al usuario.
    """
    try:
        reservation = reservation_logic.get_reservation_by_id(id_reservation)
        if not reservation:
            raise HTTPException(status_code=404, detail="Reservation not found")
        
        # Verificar que la reserva pertenece al usuario (a menos que sea admin)
        if user["id_role"] != 1 and reservation["id_user"] != user["id_user"]:
            raise HTTPException(status_code=403, detail="Not authorized to view this reservation")
        
        return reservation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting reservation: {str(e)}")

@router.patch("/{id_reservation}/cancel")
def cancel_reservation(id_reservation: int, user: dict = Depends(get_current_user)):
    """
    Cancela una reserva del usuario autenticado.
    
    Args:
        id_reservation (int): ID de la reserva.
        user (dict): Usuario autenticado.
    
    Returns:
        dict: Mensaje de confirmación.
    
    Raises:
        HTTPException: Si hay un error al cancelar la reserva.
    """
    try:
        reservation_logic.cancel_reservation(id_reservation, user["id_user"])
        return {"msg": "Reservation cancelled successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cancelling reservation: {str(e)}")

@router.patch("/{id_reservation}/status/{id_status}")
def update_reservation_status(
    id_reservation: int, 
    id_status: int,
    user: dict = Depends(verify_admin_token)
):
    """
    Actualiza el estado de una reserva (solo para administradores).
    
    Args:
        id_reservation (int): ID de la reserva.
        id_status (int): Nuevo ID del estado.
        user (dict): Usuario administrador.
    
    Returns:
        dict: Mensaje de confirmación.
    
    Raises:
        HTTPException: Si hay un error al actualizar el estado.
    """
    try:
        reservation_logic.update_reservation_status(id_reservation, id_status)
        return {"msg": "Reservation status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating reservation status: {str(e)}")

@router.delete("/{id_reservation}")
def delete_reservation(id_reservation: int, user: dict = Depends(verify_admin_token)):
    """
    Elimina lógicamente una reserva (solo para administradores).
    
    Args:
        id_reservation (int): ID de la reserva.
        user (dict): Usuario administrador.
    
    Returns:
        dict: Mensaje de confirmación.
    
    Raises:
        HTTPException: Si hay un error al eliminar la reserva.
    """
    try:
        reservation_logic.delete_reservation(id_reservation)
        return {"msg": "Reservation deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting reservation: {str(e)}")

