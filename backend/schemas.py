from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class DiaryEntryBase(BaseModel):
    title: str
    content: str

class DiaryEntryCreate(DiaryEntryBase):
    created_at: datetime

class DiaryEntryUpdate(DiaryEntryBase):
    pass

class DiaryEntry(DiaryEntryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

class ScheduleEntryBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime

class ScheduleEntryCreate(ScheduleEntryBase):
    pass

class ScheduleEntry(ScheduleEntryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
