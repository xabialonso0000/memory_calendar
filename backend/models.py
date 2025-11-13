from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from database import Base

class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    created_at = Column(DateTime(timezone=True))

class ScheduleEntry(Base):
    __tablename__ = "schedule_entries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
