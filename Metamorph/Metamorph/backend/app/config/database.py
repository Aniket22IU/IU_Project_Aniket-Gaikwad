from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from typing import Generator

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/urban_planner")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Metadata for database operations
metadata = MetaData()

def init_db():
    """Initialize database tables"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error creating tables: {e}")

def get_db_session() -> Generator:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Database models (if using SQLAlchemy instead of in-memory storage)
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from datetime import datetime

class ProjectModel(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    region = Column(String, nullable=False)
    status = Column(String, default="draft")
    date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, default="default_user")
    scenario_data = Column(JSON)  # Store scenario as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AnalysisResultModel(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, nullable=False)
    analysis_type = Column(String, nullable=False)  # 'basic', 'environmental', 'social', 'gnn'
    results = Column(JSON)  # Store results as JSON
    confidence_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class TrainingJobModel(Base):
    __tablename__ = "training_jobs"
    
    id = Column(String, primary_key=True, index=True)
    status = Column(String, default="initiated")  # 'initiated', 'training', 'completed', 'failed'
    progress = Column(Integer, default=0)
    start_time = Column(DateTime, default=datetime.utcnow)
    completion_time = Column(DateTime)
    error_message = Column(Text)
    training_data = Column(JSON)

class TerrainDataModel(Base):
    __tablename__ = "terrain_data"
    
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float)
    slope = Column(Float)
    soil_type = Column(String)
    water_presence = Column(Boolean, default=False)
    region_id = Column(String)  # Link to project region
    created_at = Column(DateTime, default=datetime.utcnow)