
#backend/app/core/service_logic.py
from ..database import get_conn

def get_all_services():
    with get_conn() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM service")
        rows = cur.fetchall()
        cur.close()
        return rows

def get_service_by_id(id_service: int):
    with get_conn() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM service WHERE id_service = %s", (id_service,))
        row = cur.fetchone()
        cur.close()
        return row

def create_service(data: dict):
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO service (name, description, duration_minutes, price, state)
               VALUES (%s, %s, %s, %s, %s)""",
            (data["name"], data.get("description"), data["duration_minutes"], data["price"], data["state"])
        )
        conn.commit()
        new_id = cur.lastrowid
        cur.close()
    return new_id

def update_service(id_service: int, data: dict):
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute(
            """UPDATE service SET name=%s, description=%s, duration_minutes=%s, price=%s, state=%s
               WHERE id_service=%s""",
            (data["name"], data.get("description"), data["duration_minutes"], data["price"], data["state"], id_service)
        )
        conn.commit()
        cur.close()

def delete_service(id_service: int):
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM service WHERE id_service = %s", (id_service,))
        conn.commit()
        cur.close()