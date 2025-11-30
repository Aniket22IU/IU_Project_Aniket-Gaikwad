from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Any, Optional
import asyncio
import uuid
from datetime import datetime

from app.models.schemas import GNNOptimizationRequest, GreenZone, Coordinate
from app.models.gnn_model import UrbanPlanningGNN
from app.utils.geospatial import GeospatialProcessor

router = APIRouter()

# Global GNN model instance
gnn_model = None
geo_processor = GeospatialProcessor()

# Training job tracking
training_jobs = {}

@router.on_event("startup")
async def load_gnn_model():
    """Load the GNN model on startup"""
    global gnn_model
    try:
        gnn_model = UrbanPlanningGNN()
        print("GNN model loaded successfully")
    except Exception as e:
        print(f"Failed to load GNN model: {e}")
        gnn_model = None

@router.get("/status")
async def get_gnn_status():
    """Get GNN model status and capabilities"""
    return {
        "status": "available" if gnn_model else "unavailable",
        "model_loaded": gnn_model is not None,
        "capabilities": [
            "optimal_zone_prediction",
            "sustainability_optimization",
            "accessibility_analysis",
            "connectivity_optimization"
        ],
        "supported_zone_types": ["park", "garden", "forest", "wetland"],
        "timestamp": datetime.now().isoformat()
    }

@router.post("/optimize")
async def optimize_urban_planning(request: GNNOptimizationRequest):
    """Use GNN to optimize urban planning layout"""
    if not gnn_model:
        raise HTTPException(status_code=503, detail="GNN model not available")
    
    try:
        # Validate input coordinates
        if not geo_processor.validate_coordinates(request.region):
            raise HTTPException(status_code=400, detail="Invalid region coordinates")
        
        # Convert Pydantic models to dictionaries for processing
        region_coords = [coord.dict() for coord in request.region]
        existing_zones = [zone.dict() for zone in request.existing_zones]
        terrain_data = [terrain.dict() for terrain in request.terrain_data]
        
        # Run GNN optimization
        optimization_results = gnn_model.predict_optimal_zones(
            region_coords=region_coords,
            terrain_data=terrain_data,
            existing_zones=existing_zones,
            constraints=request.constraints or {}
        )
        
        # Calculate additional metrics
        all_zones = existing_zones + optimization_results['optimal_zones']
        
        # Enhanced analysis with GNN predictions
        enhanced_results = {
            "optimal_zones": optimization_results['optimal_zones'],
            "gnn_predictions": {
                "sustainability_score": optimization_results['sustainability_score'] * 100,
                "accessibility_score": optimization_results['accessibility_score'] * 100,
                "connectivity_score": optimization_results['connectivity_score'] * 100,
                "confidence": optimization_results['confidence']
            },
            "performance_metrics": calculate_performance_metrics(all_zones, region_coords),
            "optimization_insights": generate_optimization_insights(optimization_results),
            "recommendations": generate_gnn_recommendations(optimization_results, request.optimization_goals),
            "analysis_timestamp": datetime.now().isoformat()
        }
        
        return enhanced_results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GNN optimization failed: {str(e)}")

@router.post("/predict-impact")
async def predict_environmental_impact(request: GNNOptimizationRequest):
    """Predict environmental impact using GNN"""
    if not gnn_model:
        raise HTTPException(status_code=503, detail="GNN model not available")
    
    try:
        # Convert inputs
        region_coords = [coord.dict() for coord in request.region]
        existing_zones = [zone.dict() for zone in request.existing_zones]
        terrain_data = [terrain.dict() for terrain in request.terrain_data]
        
        # Get GNN predictions
        predictions = gnn_model.predict_optimal_zones(
            region_coords=region_coords,
            terrain_data=terrain_data,
            existing_zones=existing_zones
        )
        
        # Calculate environmental impact predictions
        impact_predictions = {
            "air_quality_improvement": predict_air_quality_impact(predictions, existing_zones),
            "carbon_sequestration_potential": predict_carbon_sequestration(predictions),
            "biodiversity_enhancement": predict_biodiversity_impact(predictions),
            "water_management_efficiency": predict_water_management(predictions, terrain_data),
            "heat_island_reduction": predict_heat_reduction(predictions),
            "noise_pollution_reduction": predict_noise_reduction(predictions),
            "overall_environmental_score": 0  # Will be calculated below
        }
        
        # Calculate overall environmental score
        impact_predictions["overall_environmental_score"] = sum(
            impact_predictions[key] for key in impact_predictions if key != "overall_environmental_score"
        ) / 6
        
        return {
            "environmental_impact": impact_predictions,
            "confidence": predictions['confidence'],
            "methodology": "Graph Neural Network with spatial-temporal analysis",
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Environmental impact prediction failed: {str(e)}")

@router.post("/train")
async def initiate_model_training(
    background_tasks: BackgroundTasks,
    training_data: Dict[str, Any]
):
    """Initiate GNN model training with new data"""
    job_id = str(uuid.uuid4())
    
    # Store training job info
    training_jobs[job_id] = {
        "status": "initiated",
        "start_time": datetime.now(),
        "progress": 0,
        "estimated_completion": None
    }
    
    # Add background training task
    background_tasks.add_task(train_gnn_model, job_id, training_data)
    
    return {
        "job_id": job_id,
        "status": "initiated",
        "message": "Model training started in background",
        "estimated_time_minutes": 30
    }

@router.get("/training-status/{job_id}")
async def get_training_status(job_id: str):
    """Get status of a training job"""
    if job_id not in training_jobs:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    return training_jobs[job_id]

@router.post("/scenario-comparison")
async def compare_scenarios(scenarios: List[GNNOptimizationRequest]):
    """Compare multiple urban planning scenarios using GNN"""
    if not gnn_model:
        raise HTTPException(status_code=503, detail="GNN model not available")
    
    if len(scenarios) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 scenarios can be compared")
    
    try:
        comparison_results = []
        
        for i, scenario in enumerate(scenarios):
            # Convert inputs
            region_coords = [coord.dict() for coord in scenario.region]
            existing_zones = [zone.dict() for zone in scenario.existing_zones]
            terrain_data = [terrain.dict() for terrain in scenario.terrain_data]
            
            # Get GNN predictions for this scenario
            predictions = gnn_model.predict_optimal_zones(
                region_coords=region_coords,
                terrain_data=terrain_data,
                existing_zones=existing_zones
            )
            
            scenario_result = {
                "scenario_id": i + 1,
                "sustainability_score": predictions['sustainability_score'] * 100,
                "accessibility_score": predictions['accessibility_score'] * 100,
                "connectivity_score": predictions['connectivity_score'] * 100,
                "confidence": predictions['confidence'],
                "optimal_zones_count": len(predictions['optimal_zones']),
                "total_green_area": sum(zone['area'] for zone in predictions['optimal_zones'])
            }
            
            comparison_results.append(scenario_result)
        
        # Rank scenarios
        ranked_scenarios = rank_scenarios(comparison_results)
        
        return {
            "scenario_comparison": comparison_results,
            "ranking": ranked_scenarios,
            "best_scenario": ranked_scenarios[0] if ranked_scenarios else None,
            "comparison_metrics": generate_comparison_insights(comparison_results),
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scenario comparison failed: {str(e)}")

@router.post("/real-time-optimization")
async def real_time_optimization(
    region: List[Coordinate],
    constraints: Dict[str, Any],
    optimization_goals: List[str]
):
    """Perform real-time optimization based on changing constraints"""
    if not gnn_model:
        raise HTTPException(status_code=503, detail="GNN model not available")
    
    try:
        # Generate synthetic terrain data for the region
        region_coords = [coord.dict() for coord in region]
        terrain_data = geo_processor.generate_terrain_grid(region_coords, grid_size=30)
        
        # Run optimization with current constraints
        predictions = gnn_model.predict_optimal_zones(
            region_coords=region_coords,
            terrain_data=terrain_data,
            existing_zones=[],
            constraints=constraints
        )
        
        # Apply real-time adjustments based on goals
        adjusted_zones = apply_goal_based_adjustments(
            predictions['optimal_zones'], 
            optimization_goals
        )
        
        return {
            "optimized_zones": adjusted_zones,
            "real_time_metrics": {
                "optimization_time_ms": 150,  # Simulated processing time
                "zones_generated": len(adjusted_zones),
                "goals_addressed": optimization_goals,
                "constraint_satisfaction": calculate_constraint_satisfaction(adjusted_zones, constraints)
            },
            "adaptive_recommendations": generate_adaptive_recommendations(adjusted_zones, constraints),
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Real-time optimization failed: {str(e)}")

# Helper functions

async def train_gnn_model(job_id: str, training_data: Dict[str, Any]):
    """Background task for training the GNN model"""
    try:
        training_jobs[job_id]["status"] = "training"
        
        # Simulate training process
        for progress in range(0, 101, 10):
            training_jobs[job_id]["progress"] = progress
            await asyncio.sleep(2)  # Simulate training time
        
        training_jobs[job_id]["status"] = "completed"
        training_jobs[job_id]["completion_time"] = datetime.now()
        
    except Exception as e:
        training_jobs[job_id]["status"] = "failed"
        training_jobs[job_id]["error"] = str(e)

def calculate_performance_metrics(zones: List[Dict], region_coords: List[Dict]) -> Dict[str, float]:
    """Calculate performance metrics for the optimization"""
    if not zones:
        return {"coverage": 0, "efficiency": 0, "diversity": 0}
    
    # Calculate coverage
    total_zone_area = sum(zone.get('area', 0) for zone in zones)
    region_area = geo_processor.calculate_polygon_area(
        geo_processor.create_region_polygon(region_coords)
    )
    coverage = (total_zone_area / region_area * 100) if region_area > 0 else 0
    
    # Calculate efficiency (area per zone)
    efficiency = total_zone_area / len(zones) if zones else 0
    
    # Calculate diversity
    zone_types = set(zone.get('type', 'park') for zone in zones)
    diversity = len(zone_types) / 4 * 100  # 4 possible zone types
    
    return {
        "coverage": min(100, coverage),
        "efficiency": min(100, efficiency / 1000),  # Normalize
        "diversity": diversity
    }

def generate_optimization_insights(results: Dict) -> List[str]:
    """Generate insights from GNN optimization results"""
    insights = []
    
    confidence = results.get('confidence', 0)
    if confidence > 0.8:
        insights.append("High confidence in optimal zone placement")
    elif confidence > 0.6:
        insights.append("Moderate confidence - consider additional constraints")
    else:
        insights.append("Low confidence - more data needed for better optimization")
    
    sustainability = results.get('sustainability_score', 0)
    if sustainability > 0.8:
        insights.append("Excellent sustainability potential identified")
    elif sustainability > 0.6:
        insights.append("Good sustainability with room for improvement")
    
    insights.append("GNN identified optimal spatial relationships between zones")
    insights.append("Machine learning enhanced traditional planning approaches")
    
    return insights

def generate_gnn_recommendations(results: Dict, goals: Optional[List[str]] = None) -> List[str]:
    """Generate recommendations based on GNN results and goals"""
    recommendations = []
    
    if not goals:
        goals = ["sustainability", "accessibility", "connectivity"]
    
    if "sustainability" in goals:
        recommendations.append("Prioritize native species selection for long-term sustainability")
    
    if "accessibility" in goals:
        recommendations.append("Ensure pedestrian pathways connect all green zones")
    
    if "connectivity" in goals:
        recommendations.append("Implement green corridors for wildlife movement")
    
    # Add GNN-specific recommendations
    recommendations.extend([
        "Consider micro-climate effects in zone placement",
        "Optimize for seasonal usage patterns",
        "Integrate smart city sensors for adaptive management"
    ])
    
    return recommendations

def predict_air_quality_impact(predictions: Dict, existing_zones: List[Dict]) -> float:
    """Predict air quality improvement using GNN results"""
    optimal_zones = predictions.get('optimal_zones', [])
    total_area = sum(zone.get('area', 0) for zone in optimal_zones + existing_zones)
    
    # Trees filter approximately 48 pounds of CO2 per year per tree
    # Estimate trees per area and calculate impact
    estimated_trees = total_area / 100  # Rough estimate
    co2_reduction = estimated_trees * 48 * 0.453592  # Convert to kg
    
    return min(100, co2_reduction / 1000 * 20)  # Normalize to 0-100

def predict_carbon_sequestration(predictions: Dict) -> float:
    """Predict carbon sequestration potential"""
    optimal_zones = predictions.get('optimal_zones', [])
    
    sequestration_rates = {
        'park': 2.5,    # tons CO2/hectare/year
        'garden': 1.5,
        'forest': 4.0,
        'wetland': 3.0
    }
    
    total_sequestration = 0
    for zone in optimal_zones:
        zone_type = zone.get('type', 'park')
        area_hectares = zone.get('area', 0) / 10000  # Convert sq m to hectares
        rate = sequestration_rates.get(zone_type, 2.0)
        total_sequestration += area_hectares * rate
    
    return min(100, total_sequestration * 10)  # Normalize

def predict_biodiversity_impact(predictions: Dict) -> float:
    """Predict biodiversity enhancement"""
    optimal_zones = predictions.get('optimal_zones', [])
    
    biodiversity_scores = {
        'park': 60,
        'garden': 40,
        'forest': 90,
        'wetland': 85
    }
    
    if not optimal_zones:
        return 0
    
    weighted_score = sum(
        biodiversity_scores.get(zone.get('type', 'park'), 50) * zone.get('area', 0)
        for zone in optimal_zones
    )
    total_area = sum(zone.get('area', 0) for zone in optimal_zones)
    
    return weighted_score / total_area if total_area > 0 else 0

def predict_water_management(predictions: Dict, terrain_data: List[Dict]) -> float:
    """Predict water management efficiency"""
    optimal_zones = predictions.get('optimal_zones', [])
    
    # Green infrastructure helps with stormwater management
    total_area = sum(zone.get('area', 0) for zone in optimal_zones)
    base_score = min(80, total_area / 10000 * 60)
    
    # Bonus for wetlands and water-adjacent zones
    water_bonus = 0
    for zone in optimal_zones:
        if zone.get('type') == 'wetland':
            water_bonus += 10
    
    return min(100, base_score + water_bonus)

def predict_heat_reduction(predictions: Dict) -> float:
    """Predict urban heat island reduction"""
    optimal_zones = predictions.get('optimal_zones', [])
    
    cooling_effects = {
        'park': 3.0,    # degrees Celsius reduction
        'garden': 2.0,
        'forest': 4.0,
        'wetland': 3.5
    }
    
    total_cooling = sum(
        cooling_effects.get(zone.get('type', 'park'), 2.5) * zone.get('area', 0) / 1000
        for zone in optimal_zones
    )
    
    return min(100, total_cooling * 5)  # Normalize

def predict_noise_reduction(predictions: Dict) -> float:
    """Predict noise pollution reduction"""
    optimal_zones = predictions.get('optimal_zones', [])
    
    noise_reduction_db = {
        'park': 5,      # decibel reduction
        'garden': 3,
        'forest': 8,
        'wetland': 4
    }
    
    total_reduction = sum(
        noise_reduction_db.get(zone.get('type', 'park'), 4) * zone.get('area', 0) / 1000
        for zone in optimal_zones
    )
    
    return min(100, total_reduction * 8)  # Normalize

def rank_scenarios(scenarios: List[Dict]) -> List[Dict]:
    """Rank scenarios based on multiple criteria"""
    # Calculate composite score for each scenario
    for scenario in scenarios:
        composite_score = (
            scenario['sustainability_score'] * 0.4 +
            scenario['accessibility_score'] * 0.3 +
            scenario['connectivity_score'] * 0.2 +
            scenario['confidence'] * 100 * 0.1
        )
        scenario['composite_score'] = composite_score
    
    # Sort by composite score (descending)
    return sorted(scenarios, key=lambda x: x['composite_score'], reverse=True)

def generate_comparison_insights(scenarios: List[Dict]) -> Dict[str, Any]:
    """Generate insights from scenario comparison"""
    if not scenarios:
        return {}
    
    # Calculate statistics
    sustainability_scores = [s['sustainability_score'] for s in scenarios]
    accessibility_scores = [s['accessibility_score'] for s in scenarios]
    
    return {
        "best_sustainability": max(sustainability_scores),
        "best_accessibility": max(accessibility_scores),
        "average_confidence": sum(s['confidence'] for s in scenarios) / len(scenarios),
        "total_scenarios_analyzed": len(scenarios),
        "recommendation": "Choose scenario with highest composite score for balanced optimization"
    }

def apply_goal_based_adjustments(zones: List[Dict], goals: List[str]) -> List[Dict]:
    """Apply adjustments based on optimization goals"""
    adjusted_zones = zones.copy()
    
    if "sustainability" in goals:
        # Prioritize forest and wetland zones
        for zone in adjusted_zones:
            if zone.get('type') in ['forest', 'wetland']:
                zone['priority'] = 'high'
    
    if "accessibility" in goals:
        # Ensure zones are well-distributed
        for zone in adjusted_zones:
            zone['accessibility_features'] = ['pathways', 'public_transport_access']
    
    if "connectivity" in goals:
        # Add corridor recommendations
        for zone in adjusted_zones:
            zone['connectivity_features'] = ['wildlife_corridors', 'green_pathways']
    
    return adjusted_zones

def calculate_constraint_satisfaction(zones: List[Dict], constraints: Dict[str, Any]) -> float:
    """Calculate how well the zones satisfy given constraints"""
    if not constraints:
        return 100.0
    
    satisfaction_score = 100.0
    
    # Check area constraints
    if 'min_total_area' in constraints:
        total_area = sum(zone.get('area', 0) for zone in zones)
        if total_area < constraints['min_total_area']:
            satisfaction_score -= 20
    
    # Check zone type constraints
    if 'required_zone_types' in constraints:
        zone_types = set(zone.get('type') for zone in zones)
        required_types = set(constraints['required_zone_types'])
        missing_types = required_types - zone_types
        satisfaction_score -= len(missing_types) * 15
    
    return max(0, satisfaction_score)

def generate_adaptive_recommendations(zones: List[Dict], constraints: Dict[str, Any]) -> List[str]:
    """Generate adaptive recommendations for real-time optimization"""
    recommendations = []
    
    if len(zones) < 3:
        recommendations.append("Consider adding more green zones for better coverage")
    
    zone_types = set(zone.get('type') for zone in zones)
    if len(zone_types) < 3:
        recommendations.append("Increase diversity by adding different zone types")
    
    total_area = sum(zone.get('area', 0) for zone in zones)
    if total_area < 10000:  # Less than 1 hectare
        recommendations.append("Increase total green space area for greater impact")
    
    recommendations.append("Monitor real-time usage patterns for adaptive management")
    recommendations.append("Implement IoT sensors for environmental monitoring")
    
    return recommendations