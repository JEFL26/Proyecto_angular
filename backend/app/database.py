# backend/app/database.py
from mysql.connector import pooling
from contextlib import contextmanager
from .config import settings

_pool = None

def init_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="fastapi_pool",
            pool_size=5,
            host=settings.MYSQL_HOST,
            port=settings.MYSQL_PORT,
            user=settings.MYSQL_USER,
            password=settings.MYSQL_PASSWORD,
            database=settings.MYSQL_DATABASE,
            autocommit=True
        )
    return _pool

# def ensure_tables():
#     with get_conn() as conn:
#         cur = conn.cursor()
#         with open("database/init.sql") as f:
#             sql_script = f.read()
#         for stmt in sql_script.split(";"):
#             if stmt.strip():
#                 cur.execute(stmt)
#         cur.close()


@contextmanager
def get_conn():
    pool = init_pool()
    conn = pool.get_connection()
    try:
        yield conn
    finally:
        conn.close()

init_pool()
