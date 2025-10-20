#backend/app/core/user_logic.py
from typing import Optional
from ..database import get_conn
from ..security import get_password_hash, verify_password

def get_user_by_email(email: str) -> Optional[dict]:
    with get_conn() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute(
            "SELECT id_user, email, password, id_role, state FROM user_account WHERE email = %s",
            (email,)
        )
        row = cur.fetchone()
        cur.close()
        return row

def create_user(email: str, password: str, id_role: int = 2) -> dict:
    hashed = get_password_hash(password)
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO user_account (email, password, id_role) VALUES (%s, %s, %s)",
            (email, hashed, id_role)
        )
        user_id = cur.lastrowid
        cur.close()
    return {"id_user": user_id, "email": email, "id_role": id_role, "state": True}

def authenticate_user(email: str, password: str) -> Optional[dict]:
    user = get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user["password"]):
        return None
    user.pop("password", None)
    return user