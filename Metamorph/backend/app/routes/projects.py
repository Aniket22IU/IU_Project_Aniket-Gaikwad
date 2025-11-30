from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.schemas import Project, ProjectCreate, Scenario
from app.config.database import get_db_session, ProjectModel

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_all_projects(db: Session = Depends(get_db_session)):
    """Get all projects"""
    projects = db.query(ProjectModel).order_by(ProjectModel.created_at.desc()).all()
    return [{
        "id": p.id,
        "name": p.name,
        "region": p.region,
        "status": p.status,
        "date": p.date,
        "scenario": p.scenario_data
    } for p in projects]

@router.get("/{project_id}")
async def get_project(project_id: str, db: Session = Depends(get_db_session)):
    """Get a specific project by ID"""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {
        "id": project.id,
        "name": project.name,
        "region": project.region,
        "status": project.status,
        "date": project.date,
        "scenario": project.scenario_data
    }

@router.post("/")
async def create_project(project_data: dict, db: Session = Depends(get_db_session)):
    """Create a new project"""
    project_id = str(uuid.uuid4())
    
    # Ensure scenario has an ID
    if "scenario" in project_data and not project_data["scenario"].get("id"):
        project_data["scenario"]["id"] = str(uuid.uuid4())
    
    db_project = ProjectModel(
        id=project_id,
        name=project_data["name"],
        region=project_data["region"],
        status=project_data.get("status", "draft"),
        scenario_data=project_data.get("scenario", {})
    )
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    return {
        "id": db_project.id,
        "name": db_project.name,
        "region": db_project.region,
        "status": db_project.status,
        "date": db_project.date,
        "scenario": db_project.scenario_data
    }

@router.put("/{project_id}")
async def update_project(project_id: str, project_data: dict, db: Session = Depends(get_db_session)):
    """Update an existing project"""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.name = project_data.get("name", project.name)
    project.region = project_data.get("region", project.region)
    project.status = project_data.get("status", project.status)
    project.scenario_data = project_data.get("scenario", project.scenario_data)
    
    db.commit()
    db.refresh(project)
    
    return {
        "id": project.id,
        "name": project.name,
        "region": project.region,
        "status": project.status,
        "date": project.date,
        "scenario": project.scenario_data
    }

@router.delete("/{project_id}")
async def delete_project(project_id: str, db: Session = Depends(get_db_session)):
    """Delete a project"""
    project = db.query(ProjectModel).filter(ProjectModel.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}

@router.post("/{project_id}/scenarios", response_model=Project)
async def add_scenario_to_project(project_id: str, scenario: Scenario):
    """Add or update scenario for a project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    project.scenario = scenario
    projects_db[project_id] = project
    
    return project

@router.get("/{project_id}/export")
async def export_project(project_id: str, format: str = "json"):
    """Export project data in various formats"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    
    if format.lower() == "json":
        return project.dict()
    elif format.lower() == "geojson":
        # Convert to GeoJSON format
        features = []
        
        # Add region as a feature
        if project.scenario.region:
            region_coords = [[coord.lng, coord.lat] for coord in project.scenario.region]
            region_coords.append(region_coords[0])  # Close the polygon
            
            features.append({
                "type": "Feature",
                "properties": {
                    "name": f"{project.name} - Region",
                    "type": "region"
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [region_coords]
                }
            })
        
        # Add green zones as features
        for zone in project.scenario.green_zones:
            if zone.coordinates:
                zone_coords = [[coord.lng, coord.lat] for coord in zone.coordinates]
                zone_coords.append(zone_coords[0])  # Close the polygon
                
                features.append({
                    "type": "Feature",
                    "properties": {
                        "name": zone.name,
                        "type": zone.type,
                        "area": zone.area,
                        "id": zone.id
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [zone_coords]
                    }
                })
        
        return {
            "type": "FeatureCollection",
            "features": features
        }
    else:
        raise HTTPException(status_code=400, detail="Unsupported export format")

@router.get("/search/")
async def search_projects(
    query: Optional[str] = None,
    region: Optional[str] = None,
    status: Optional[str] = None
):
    """Search projects by various criteria"""
    results = list(projects_db.values())
    
    if query:
        results = [p for p in results if query.lower() in p.name.lower()]
    
    if region:
        results = [p for p in results if region.lower() in p.region.lower()]
    
    if status:
        results = [p for p in results if p.status == status]
    
    return results