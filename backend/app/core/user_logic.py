# backend/app/core/user_logic.py
"""
Lógica de Usuarios
==================
Gestiona operaciones relacionadas con cuentas de usuario y perfiles.
Incluye creación, autenticación y consulta de datos combinando tablas
'user_account' y 'user_profile'.
"""

import logging
from typing import Optional
from ..database import get_conn
from ..security import get_password_hash, verify_password
from ..models import UserCreate

def get_user_by_email(email: str) -> Optional[dict]:
    """
    Busca un usuario por su correo electrónico.

    Args:
        email (str): Correo electrónico del usuario.

    Returns:
        dict | None: Información combinada del usuario y su perfil, o None si no existe.
    """
    try:
        with get_conn() as conn:
            cur = conn.cursor(dictionary=True)
            cur.execute(
                """
                SELECT ua.id_user, ua.email, ua.password, ua.id_role, ua.state,
                       up.first_name, up.last_name, up.phone
                FROM user_account ua
                LEFT JOIN user_profile up ON ua.id_user = up.id_user
                WHERE ua.email = %s
                """,
                (email,)
            )
            row = cur.fetchone()
            cur.close()
            return row
    except Exception as e:
        logging.error(f"Error al obtener usuario por email ({email}): {str(e)}")
        raise


def create_user(user_data: UserCreate) -> dict:
    """
    Crea un nuevo usuario junto con su perfil asociado.

    Args:
        user_data (UserCreate): Objeto con los datos del usuario.

    Returns:
        dict: Información del usuario recién creado.
    """
    try:
        hashed = get_password_hash(user_data.password)
        with get_conn() as conn:
            cur = conn.cursor()

            # Inserta el registro principal del usuario
            cur.execute(
                "INSERT INTO user_account (email, password, id_role) VALUES (%s, %s, %s)",
                (user_data.email, hashed, user_data.id_role)
            )
            id_user = cur.lastrowid

            # Inserta los datos del perfil asociado
            cur.execute(
                "INSERT INTO user_profile (id_user, first_name, last_name, phone) VALUES (%s, %s, %s, %s)",
                (id_user, user_data.first_name, user_data.last_name, user_data.phone)
            )

            conn.commit()
            cur.close()

        return {
            "id_user": id_user,
            "email": user_data.email,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "phone": user_data.phone,
            "id_role": user_data.id_role,
            "state": True
        }
    except Exception as e:
        logging.error(f"Error al crear usuario ({user_data.email}): {str(e)}")
        raise


def authenticate_user(email: str, password: str) -> Optional[dict]:
    """
    Autentica un usuario verificando su contraseña.

    Args:
        email (str): Correo electrónico del usuario.
        password (str): Contraseña sin cifrar ingresada por el usuario.

    Returns:
        dict | None: Datos del usuario si la autenticación es exitosa, de lo contrario None.
    """
    try:
        user = get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user["password"]):
            return None
        user.pop("password", None)
        return user
    except Exception as e:
        logging.error(f"Error al autenticar usuario ({email}): {str(e)}")
        raise