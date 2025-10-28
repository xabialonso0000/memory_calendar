from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import SessionLocal, engine
import models, schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

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

@app.get("/api/entries", response_model=List[schemas.DiaryEntry])
def get_entries(db: Session = Depends(get_db)):
    return db.query(models.DiaryEntry).all()

@app.post("/api/entries", response_model=schemas.DiaryEntry, status_code=201)
def create_entry(entry: schemas.DiaryEntryCreate, db: Session = Depends(get_db)):
    db_entry = models.DiaryEntry(**entry.dict())
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
def update_entry(entry_id: int, updated_entry: schemas.DiaryEntryCreate, db: Session = Depends(get_db)):
    db_entry = db.query(models.DiaryEntry).filter(models.DiaryEntry.id == entry_id).first()
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    for key, value in updated_entry.dict().items():
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
    db_entry = models.ScheduleEntry(**entry.dict())
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

    for key, value in updated_entry.dict().items():
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