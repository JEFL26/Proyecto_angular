# backend/app/database.py
from mysql.connector import pooling
from contextlib import contextmanager
from .config import settings

_pool = None

def init_pool():
    """
    Inicializa el pool de conexiones a MySQL.

    Returns:
        MySQLConnectionPool: Pool de conexiones a MySQL.
    """
    global _pool
    if _pool is None:
        try:
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
        except Exception as e:
            raise Exception(f"Error al inicializar el pool de conexiones: {str(e)}")
    return _pool

@contextmanager
def get_conn():
    """
    Proporciona una conexión del pool de manera segura.

    Yields:
        MySQLConnection: Una conexión a MySQL del pool.

    Raises:
        Exception: Si hay un error al obtener la conexión.
    """
    pool = init_pool()
    try:
        conn = pool.get_connection()
        yield conn
    except Exception as e:
        raise Exception(f"Error al obtener la conexión: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()

# Inicializar el pool al importar el módulo
try:
    init_pool()
except Exception as e:
    print(f"Error al inicializar el pool: {str(e)}")