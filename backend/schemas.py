from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DiaryEntryBase(BaseModel):
    title: str
    content: str

class DiaryEntryCreate(DiaryEntryBase):
    pass

class DiaryEntry(DiaryEntryBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class ScheduleEntryBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime

class ScheduleEntryCreate(ScheduleEntryBase):
    pass

class ScheduleEntry(ScheduleEntryBase):
    id: int

    class Config:
        orm_mode = True
