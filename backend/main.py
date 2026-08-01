from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pathlib import Path
from uuid import uuid4

from database import SessionLocal, engine
import models, schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_UPLOAD_SIZE = 5 * 1024 * 1024
IMAGE_TYPES = {
    "image/jpeg": (".jpg", (b"\xff\xd8\xff",)),
    "image/png": (".png", (b"\x89PNG\r\n\x1a\n",)),
    "image/gif": (".gif", (b"GIF87a", b"GIF89a")),
    "image/webp": (".webp", (b"RIFF",)),
}

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Allow CORS for the frontend
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    image_type = IMAGE_TYPES.get(file.content_type or "")
    if image_type is None:
        raise HTTPException(status_code=415, detail="JPEG, PNG, GIF, or WebP images only")

    extension, signatures = image_type
    first_chunk = await file.read(1024 * 1024)
    is_valid_signature = any(first_chunk.startswith(signature) for signature in signatures)
    if file.content_type == "image/webp":
        is_valid_signature = first_chunk.startswith(b"RIFF") and first_chunk[8:12] == b"WEBP"
    if not is_valid_signature:
        raise HTTPException(status_code=400, detail="File content does not match its image type")

    destination = UPLOAD_DIR / f"{uuid4().hex}{extension}"
    total_size = len(first_chunk)
    try:
        with destination.open("wb") as buffer:
            buffer.write(first_chunk)
            while chunk := await file.read(1024 * 1024):
                total_size += len(chunk)
                if total_size > MAX_UPLOAD_SIZE:
                    raise HTTPException(status_code=413, detail="Image must be 5 MB or smaller")
                buffer.write(chunk)
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    return {"file_path": f"/uploads/{destination.name}"}

@app.get("/api/entries", response_model=List[schemas.DiaryEntry])
def get_entries(db: Session = Depends(get_db)):
    return db.query(models.DiaryEntry).all()

@app.post("/api/entries", response_model=schemas.DiaryEntry, status_code=201)
def create_entry(entry: schemas.DiaryEntryCreate, db: Session = Depends(get_db)):
    db_entry = models.DiaryEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/api/entries/{entry_id}", response_model=schemas.DiaryEntry)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.DiaryEntry).filter(models.DiaryEntry.id == entry_id).first()
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    return db_entry

@app.put("/api/entries/{entry_id}", response_model=schemas.DiaryEntry)
def update_entry(entry_id: int, updated_entry: schemas.DiaryEntryUpdate, db: Session = Depends(get_db)):
    db_entry = db.query(models.DiaryEntry).filter(models.DiaryEntry.id == entry_id).first()
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    for key, value in updated_entry.model_dump().items():
        setattr(db_entry, key, value)
        
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.delete("/api/entries/{entry_id}", status_code=204)
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.DiaryEntry).filter(models.DiaryEntry.id == entry_id).first()
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
        
    db.delete(db_entry)
    db.commit()
    return

@app.get("/api/schedule", response_model=List[schemas.ScheduleEntry])
def get_schedule_entries(db: Session = Depends(get_db)):
    return db.query(models.ScheduleEntry).all()

@app.post("/api/schedule", response_model=schemas.ScheduleEntry, status_code=201)
def create_schedule_entry(entry: schemas.ScheduleEntryCreate, db: Session = Depends(get_db)):
    db_entry = models.ScheduleEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/api/schedule/{entry_id}", response_model=schemas.ScheduleEntry)
def get_schedule_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.ScheduleEntry).filter(models.ScheduleEntry.id == entry_id).first()
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Schedule entry not found")
    return db_entry

@app.put("/api/schedule/{entry_id}", response_model=schemas.ScheduleEntry)
def update_schedule_entry(entry_id: int, updated_entry: schemas.ScheduleEntryCreate, db: Session = Depends(get_db)):
    db_entry = db.query(models.ScheduleEntry).filter(models.ScheduleEntry.id == entry_id).first()
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Schedule entry not found")

    for key, value in updated_entry.model_dump().items():
        setattr(db_entry, key, value)

    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.delete("/api/schedule/{entry_id}", status_code=204)
def delete_schedule_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.ScheduleEntry).filter(models.ScheduleEntry.id == entry_id).first()
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Schedule entry not found")
        
    db.delete(db_entry)
    db.commit()
    return
