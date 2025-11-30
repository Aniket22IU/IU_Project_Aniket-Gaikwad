from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ZoneType(str, Enum):
    park = "park"
    garden = "garden"
    forest = "forest"
    wetland = "wetland"

class ProjectStatus(str, Enum):
    draft = "draft"
    completed = "completed"
    shared = "shared"

class Coordinate(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)

class TerrainData(BaseModel):
    elevation: float
    slope: float
    soil_type: str
    water_presence: bool
    coordinates: Coordinate

class GreenZone(BaseModel):
    id: str
    name: str
    area: float = Field(..., gt=0)
    type: ZoneType
    coordinates: List[Coordinate]

class Comment(BaseModel):
    id: str
    author: str
    text: str
    timestamp: datetime = Field(default_factory=datetime.now)

class GNNPredictions(BaseModel):
    optimal_zones: List[GreenZone] = []
    traffic_flow: float = 0.0
    environmental_impact: float = 0.0
    social_connectivity: float = 0.0
    confidence: float = 0.0

class Scenario(BaseModel):
    id: str
    name: str
    timestamp: datetime = Field(default_factory=datetime.now)
    region: List[Coordinate]
    green_zones: List[GreenZone] = []
    coverage: float = 0.0
    sustainability_score: float = 0.0
    accessibility_score: float = 0.0
    population_served: int = 0
    status: ProjectStatus = ProjectStatus.draft
    comments: List[Comment] = []
    gnn_predictions: Optional[GNNPredictions] = None

class Project(BaseModel):
    id: str
    name: str
    region: str
    status: ProjectStatus = ProjectStatus.draft
    date: datetime = Field(default_factory=datetime.now)
    scenario: Scenario
    user_id: str = "default_user"

class ProjectCreate(BaseModel):
    name: str
    region: str
    scenario: Scenario

class AnalysisRequest(BaseModel):
    region: List[Coordinate]
    green_zones: List[GreenZone]
    terrain_data: Optional[List[TerrainData]] = None
    constraints: Optional[Dict[str, Any]] = None

class GNNOptimizationRequest(BaseModel):
    region: List[Coordinate]
    existing_zones: List[GreenZone]
    terrain_data: List[TerrainData]
    population_data: Optional[Dict[str, Any]] = None
    constraints: Optional[Dict[str, Any]] = None
    optimization_goals: Optional[List[str]] = ["sustainability", "accessibility", "connectivity"]