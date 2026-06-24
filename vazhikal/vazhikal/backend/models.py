from sqlalchemy import Column, String, Integer, Text, DateTime, Float
from sqlalchemy.sql import func
from database import Base
import uuid

class Post(Base):
    __tablename__ = "posts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    location = Column(String)
    author = Column(String)
    votes = Column(Integer, default=0)
    cost = Column(String)
    duration = Column(String)
    image_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TravelPackage(Base):
    __tablename__ = "packages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    location = Column(String)
    price = Column(String)
    duration = Column(String)
    agency = Column(String)
    image_url = Column(String)
    rating = Column(Float, default=0.0)
    reviews_count = Column(Integer, default=0)
    highlights = Column(Text)  # store as comma separated string
    created_at = Column(DateTime(timezone=True), server_default=func.now())