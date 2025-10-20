# backend/app/core/logic_upload_excel.py
from ..database import get_conn
import pandas as pd
import time
from typing import Dict, Any

EXPECTED_COLUMNS = {"name", "description", "duration_minutes", "price", "state"}

def process_excel(file_content: bytes, filename: str, start_time: float, max_time: int = 180) -> Dict[str, Any]:
    """
    Procesa un archivo Excel y devuelve un resumen detallado de los resultados.
    
    Args:
        file_content: Contenido del archivo en bytes
        filename: Nombre del archivo
        start_time: Tiempo de inicio del proceso
        max_time: Tiempo máximo permitido en segundos
    
    Returns:
        Dict con estadísticas del proceso
    """
    results = {
        "filename": filename,
        "completed": 0,
        "skipped": 0,
        "failed": 0,
        "total": 0,
        "errors": []
    }

    try:
        df = pd.read_excel(file_content, engine='openpyxl')
        df = df.fillna('')  # Rellenar valores nulos
    except Exception as e:
        raise ValueError(f"No se pudo leer el archivo {filename}: {str(e)}")

    # Validar columnas
    missing_cols = EXPECTED_COLUMNS - set(df.columns)
    if missing_cols:
        raise ValueError(
            f"El archivo {filename} no tiene las columnas requeridas: {', '.join(missing_cols)}"
        )

    with get_conn() as conn:
        cur = conn.cursor(dictionary=True)
        
        for idx, row in df.iterrows():
            results["total"] += 1
            row_num = idx + 2  # +2 porque Excel empieza en 1 y hay header

            # Validar datos obligatorios
            if not row.get("name") or str(row["name"]).strip() == "":
                results["failed"] += 1
                results["errors"].append(f"Fila {row_num}: nombre vacío")
                continue

            try:
                # Validar duplicados
                cur.execute(
                    "SELECT id_service FROM service WHERE name = %s", 
                    (str(row["name"]).strip(),)
                )
                if cur.fetchone():
                    results["skipped"] += 1
                    continue

                # Validar y convertir datos
                duration = int(row["duration_minutes"])
                price = float(row["price"])
                state = bool(int(row["state"]) if str(row["state"]).isdigit() else row["state"])

                if duration <= 0:
                    raise ValueError("La duración debe ser mayor a 0")
                if price < 0:
                    raise ValueError("El precio no puede ser negativo")

                # Insertar
                cur.execute(
                    """INSERT INTO service (name, description, duration_minutes, price, state)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (
                        str(row["name"]).strip(),
                        str(row.get("description", "")).strip() or None,
                        duration,
                        price,
                        state,
                    ),
                )
                conn.commit()
                results["completed"] += 1

            except ValueError as ve:
                conn.rollback()
                results["failed"] += 1
                results["errors"].append(f"Fila {row_num}: {str(ve)}")
            except Exception as e:
                conn.rollback()
                results["failed"] += 1
                results["errors"].append(f"Fila {row_num}: error al insertar")

            # Control de timeout
            if time.time() - start_time > max_time:
                raise TimeoutError(
                    f"El proceso excedió el tiempo máximo ({max_time}s). "
                    f"Procesadas {results['completed'] + results['skipped'] + results['failed']} de {results['total']} filas."
                )

        cur.close()

    # Limitar errores a los primeros 10
    if len(results["errors"]) > 10:
        results["errors"] = results["errors"][:10] + [f"... y {len(results['errors']) - 10} errores más"]

    return results