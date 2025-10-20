from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Header
from typing import List
from jose import jwt, JWTError
from ..config import settings
from ..core import user_logic, logic_upload_excel
import time

router = APIRouter(prefix="/upload", tags=["Excel Upload"])

# Validación token admin
def verify_admin_token(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        user = user_logic.get_user_by_email(email)
        if not user or user["id_role"] != 1:
            raise HTTPException(status_code=403, detail="Not authorized")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/excel", dependencies=[Depends(verify_admin_token)])
async def upload_excel(files: List[UploadFile] = File(...),
                       max_processing_time: int = 240  # 4 minutos en segundos
                       ):
    start_time = time.time()

    if len(files) > 5:
        raise HTTPException(status_code=400, detail="No se pueden subir más de 5 archivos.")

    results = []
    summary = {
        "total_files": 0,
        "total_processed": 0,
        "completed": 0,
        "skipped": 0,
        "failed": 0
    }

    for file in files:
        if not (file.filename.endswith(".xls") or file.filename.endswith(".xlsx")):
            raise HTTPException(status_code=400, detail=f"Formato no válido: {file.filename}")

        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"El archivo {file.filename} excede 5 MB")

        try:
            file_result = logic_upload_excel.process_excel(
                content, 
                file.filename, 
                start_time, 
                max_time=max_processing_time
            )
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=str(ve))
        except TimeoutError as te:
            raise HTTPException(status_code=408, detail=str(te))

        # Acumular resultados
        results.append(file_result)
        summary["total_files"] += 1
        summary["total_processed"] += file_result["total"]
        summary["completed"] += file_result["completed"]
        summary["skipped"] += file_result["skipped"]
        summary["failed"] += file_result["failed"]

    return {
        "summary": summary,
        "details": results
    }