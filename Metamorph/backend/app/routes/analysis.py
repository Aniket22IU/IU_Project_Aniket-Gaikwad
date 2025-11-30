from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import numpy as np
from datetime import datetime

from app.models.schemas import AnalysisRequest, TerrainData, GreenZone, Coordinate
from app.utils.geospatial import GeospatialProcessor

router = APIRouter()
geo_processor = GeospatialProcessor()

@router.post("/run")
async def run_analysis(request: AnalysisRequest):
    """Run comprehensive urban planning analysis"""
    try:
        # Validate input data
        if not geo_processor.validate_coordinates(request.region):
            raise HTTPException(status_code=400, detail="Invalid region coordinates")
        
        # Calculate coverage percentage
        coverage = geo_processor.calculate_coverage_percentage(
            [zone.dict() for zone in request.green_zones],
            [coord.dict() for coord in request.region]
        )
        
        # Calculate accessibility score
        accessibility_score = geo_processor.calculate_accessibility_score(
            [zone.dict() for zone in request.green_zones]
        )
        
        # Calculate connectivity score
        connectivity_score = geo_processor.calculate_connectivity_score(
            [zone.dict() for zone in request.green_zones]
        )
        
        # Calculate sustainability score based on multiple factors
        sustainability_score = calculate_sustainability_score(
            coverage, accessibility_score, connectivity_score, request.terrain_data
        )
        
        # Estimate population served
        population_served = estimate_population_served(request.green_zones, coverage)
        
        # Generate recommendations
        recommendations = generate_recommendations(
            coverage, sustainability_score, accessibility_score, connectivity_score
        )
        
        return {
            "coverage": round(coverage, 2),
            "sustainability_score": round(sustainability_score, 2),
            "accessibility_score": round(accessibility_score, 2),
            "connectivity_score": round(connectivity_score, 2),
            "population_served": population_served,
            "recommendations": recommendations,
            "analysis_timestamp": datetime.now().isoformat(),
            "metrics": {
                "total_green_area": sum(zone.area for zone in request.green_zones),
                "zone_count": len(request.green_zones),
                "zone_diversity": calculate_zone_diversity(request.green_zones)
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/terrain")
async def generate_terrain_analysis(coordinates: List[Coordinate]):
    """Generate terrain analysis for given coordinates"""
    try:
        coord_dicts = [coord.dict() for coord in coordinates]
        terrain_data = geo_processor.generate_terrain_grid(coord_dicts, grid_size=20)
        
        # Calculate terrain statistics
        elevations = [t['elevation'] for t in terrain_data]
        slopes = [t['slope'] for t in terrain_data]
        
        terrain_stats = {
            "elevation": {
                "min": min(elevations) if elevations else 0,
                "max": max(elevations) if elevations else 0,
                "mean": np.mean(elevations) if elevations else 0,
                "std": np.std(elevations) if elevations else 0
            },
            "slope": {
                "min": min(slopes) if slopes else 0,
                "max": max(slopes) if slopes else 0,
                "mean": np.mean(slopes) if slopes else 0,
                "std": np.std(slopes) if slopes else 0
            },
            "soil_distribution": calculate_soil_distribution(terrain_data),
            "water_coverage": calculate_water_coverage(terrain_data)
        }
        
        return {
            "terrain_data": terrain_data,
            "statistics": terrain_stats,
            "suitability_analysis": analyze_terrain_suitability(terrain_data)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terrain analysis failed: {str(e)}")

@router.post("/environmental-impact")
async def assess_environmental_impact(request: AnalysisRequest):
    """Assess environmental impact of the urban planning scenario"""
    try:
        impact_metrics = {
            "air_quality_improvement": calculate_air_quality_impact(request.green_zones),
            "carbon_sequestration": calculate_carbon_sequestration(request.green_zones),
            "biodiversity_index": calculate_biodiversity_index(request.green_zones),
            "water_management": assess_water_management(request.green_zones, request.terrain_data),
            "heat_island_reduction": calculate_heat_island_reduction(request.green_zones),
            "noise_reduction": calculate_noise_reduction(request.green_zones)
        }
        
        # Overall environmental score
        environmental_score = np.mean(list(impact_metrics.values()))
        
        return {
            "environmental_score": round(environmental_score, 2),
            "impact_metrics": impact_metrics,
            "recommendations": generate_environmental_recommendations(impact_metrics),
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Environmental impact assessment failed: {str(e)}")

@router.post("/social-impact")
async def assess_social_impact(request: AnalysisRequest):
    """Assess social impact and community benefits"""
    try:
        social_metrics = {
            "community_access": geo_processor.calculate_accessibility_score(
                [zone.dict() for zone in request.green_zones]
            ),
            "recreational_opportunities": calculate_recreational_score(request.green_zones),
            "health_benefits": calculate_health_benefits(request.green_zones),
            "social_cohesion": calculate_social_cohesion_score(request.green_zones),
            "property_value_impact": estimate_property_value_impact(request.green_zones),
            "equity_distribution": assess_equity_distribution(request.green_zones, request.region)
        }
        
        # Overall social score
        social_score = np.mean(list(social_metrics.values()))
        
        return {
            "social_score": round(social_score, 2),
            "social_metrics": social_metrics,
            "community_benefits": generate_community_benefits(social_metrics),
            "analysis_timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Social impact assessment failed: {str(e)}")

def calculate_sustainability_score(coverage: float, accessibility: float, 
                                 connectivity: float, terrain_data: List[TerrainData] = None) -> float:
    """Calculate overall sustainability score"""
    base_score = (coverage * 0.4 + accessibility * 0.3 + connectivity * 0.3)
    
    # Adjust based on terrain suitability
    if terrain_data:
        terrain_bonus = 0
        for terrain in terrain_data:
            if terrain.water_presence:
                terrain_bonus += 5
            if terrain.slope < 15:  # Gentle slopes are better
                terrain_bonus += 3
            if terrain.soil_type in ['loam', 'clay']:  # Good soil types
                terrain_bonus += 2
        
        terrain_bonus = min(20, terrain_bonus / len(terrain_data))
        base_score += terrain_bonus
    
    return min(100, base_score)

def estimate_population_served(green_zones: List[GreenZone], coverage: float) -> int:
    """Estimate population served by green spaces"""
    total_area = sum(zone.area for zone in green_zones)
    # Assume 50 people served per 1000 sq meters of green space
    base_population = int(total_area / 1000 * 50)
    
    # Adjust based on coverage
    coverage_multiplier = 1 + (coverage / 100)
    
    return int(base_population * coverage_multiplier)

def generate_recommendations(coverage: float, sustainability: float, 
                           accessibility: float, connectivity: float) -> List[str]:
    """Generate actionable recommendations"""
    recommendations = []
    
    if coverage < 20:
        recommendations.append("Increase green space coverage to meet WHO recommendations (9 sq m per person)")
    
    if sustainability < 70:
        recommendations.append("Incorporate native plant species to improve ecosystem sustainability")
    
    if accessibility < 60:
        recommendations.append("Add pedestrian pathways and public transport connections to green spaces")
    
    if connectivity < 50:
        recommendations.append("Create green corridors to connect isolated green spaces")
    
    # Always include some positive recommendations
    recommendations.extend([
        "Consider adding water features for biodiversity and cooling effects",
        "Implement smart irrigation systems for water conservation",
        "Add community gardens to increase social engagement"
    ])
    
    return recommendations

def calculate_zone_diversity(green_zones: List[GreenZone]) -> float:
    """Calculate diversity index of green zone types"""
    if not green_zones:
        return 0.0
    
    zone_types = {}
    for zone in green_zones:
        zone_types[zone.type] = zone_types.get(zone.type, 0) + 1
    
    total_zones = len(green_zones)
    diversity = 0
    
    for count in zone_types.values():
        proportion = count / total_zones
        if proportion > 0:
            diversity -= proportion * np.log(proportion)
    
    # Normalize to 0-100 scale
    max_diversity = np.log(4)  # 4 zone types
    return (diversity / max_diversity) * 100 if max_diversity > 0 else 0

def calculate_soil_distribution(terrain_data: List[Dict]) -> Dict[str, float]:
    """Calculate distribution of soil types"""
    if not terrain_data:
        return {}
    
    soil_counts = {}
    for terrain in terrain_data:
        soil_type = terrain.get('soil_type', 'unknown')
        soil_counts[soil_type] = soil_counts.get(soil_type, 0) + 1
    
    total = len(terrain_data)
    return {soil: (count / total) * 100 for soil, count in soil_counts.items()}

def calculate_water_coverage(terrain_data: List[Dict]) -> float:
    """Calculate percentage of area with water presence"""
    if not terrain_data:
        return 0.0
    
    water_points = sum(1 for terrain in terrain_data if terrain.get('water_presence', False))
    return (water_points / len(terrain_data)) * 100

def analyze_terrain_suitability(terrain_data: List[Dict]) -> Dict[str, Any]:
    """Analyze terrain suitability for different green space types"""
    suitability = {
        'park': {'suitable_points': 0, 'percentage': 0},
        'garden': {'suitable_points': 0, 'percentage': 0},
        'forest': {'suitable_points': 0, 'percentage': 0},
        'wetland': {'suitable_points': 0, 'percentage': 0}
    }
    
    if not terrain_data:
        return suitability
    
    for terrain in terrain_data:
        elevation = terrain.get('elevation', 0)
        slope = terrain.get('slope', 0)
        soil_type = terrain.get('soil_type', 'loam')
        water_presence = terrain.get('water_presence', False)
        
        # Park suitability: gentle slopes, good drainage
        if slope < 10 and soil_type in ['loam', 'sand']:
            suitability['park']['suitable_points'] += 1
        
        # Garden suitability: flat areas, good soil
        if slope < 5 and soil_type in ['loam', 'clay']:
            suitability['garden']['suitable_points'] += 1
        
        # Forest suitability: varied terrain, good soil retention
        if elevation > 20 and soil_type in ['loam', 'clay']:
            suitability['forest']['suitable_points'] += 1
        
        # Wetland suitability: low elevation, water presence
        if elevation < 30 and water_presence:
            suitability['wetland']['suitable_points'] += 1
    
    total_points = len(terrain_data)
    for zone_type in suitability:
        suitability[zone_type]['percentage'] = (
            suitability[zone_type]['suitable_points'] / total_points
        ) * 100
    
    return suitability

# Environmental impact calculation functions
def calculate_air_quality_impact(green_zones: List[GreenZone]) -> float:
    """Calculate air quality improvement score"""
    total_area = sum(zone.area for zone in green_zones)
    # Trees can filter 27 kg of CO2 per year per 100 sq m
    co2_reduction = (total_area / 100) * 27
    return min(100, co2_reduction / 1000 * 10)  # Normalize to 0-100

def calculate_carbon_sequestration(green_zones: List[GreenZone]) -> float:
    """Calculate carbon sequestration potential"""
    sequestration_rates = {'park': 2.5, 'garden': 1.5, 'forest': 4.0, 'wetland': 3.0}
    
    total_sequestration = 0
    for zone in green_zones:
        rate = sequestration_rates.get(zone.type, 2.0)
        total_sequestration += zone.area * rate / 1000  # tons CO2 per year
    
    return min(100, total_sequestration * 5)  # Normalize to 0-100

def calculate_biodiversity_index(green_zones: List[GreenZone]) -> float:
    """Calculate biodiversity potential"""
    biodiversity_scores = {'park': 60, 'garden': 40, 'forest': 90, 'wetland': 85}
    
    if not green_zones:
        return 0
    
    weighted_score = sum(
        biodiversity_scores.get(zone.type, 50) * zone.area 
        for zone in green_zones
    )
    total_area = sum(zone.area for zone in green_zones)
    
    return weighted_score / total_area if total_area > 0 else 0

def assess_water_management(green_zones: List[GreenZone], terrain_data: List[TerrainData] = None) -> float:
    """Assess water management capabilities"""
    water_management_score = 0
    
    # Green spaces help with stormwater management
    total_area = sum(zone.area for zone in green_zones)
    base_score = min(80, total_area / 10000 * 50)  # Normalize based on area
    
    # Bonus for wetlands
    wetland_area = sum(zone.area for zone in green_zones if zone.type == 'wetland')
    wetland_bonus = min(20, wetland_area / 1000 * 10)
    
    return base_score + wetland_bonus

def calculate_heat_island_reduction(green_zones: List[GreenZone]) -> float:
    """Calculate urban heat island reduction potential"""
    cooling_effects = {'park': 3.0, 'garden': 2.0, 'forest': 4.0, 'wetland': 3.5}
    
    total_cooling = sum(
        cooling_effects.get(zone.type, 2.5) * zone.area / 1000
        for zone in green_zones
    )
    
    return min(100, total_cooling * 2)  # Normalize to 0-100

def calculate_noise_reduction(green_zones: List[GreenZone]) -> float:
    """Calculate noise reduction potential"""
    noise_reduction_rates = {'park': 5, 'garden': 3, 'forest': 8, 'wetland': 4}
    
    total_reduction = sum(
        noise_reduction_rates.get(zone.type, 4) * zone.area / 1000
        for zone in green_zones
    )
    
    return min(100, total_reduction * 3)  # Normalize to 0-100

def generate_environmental_recommendations(impact_metrics: Dict[str, float]) -> List[str]:
    """Generate environmental recommendations based on impact metrics"""
    recommendations = []
    
    if impact_metrics['air_quality_improvement'] < 50:
        recommendations.append("Increase tree density to improve air quality")
    
    if impact_metrics['carbon_sequestration'] < 60:
        recommendations.append("Add more forest areas for better carbon sequestration")
    
    if impact_metrics['biodiversity_index'] < 70:
        recommendations.append("Create diverse habitats to support local wildlife")
    
    if impact_metrics['water_management'] < 65:
        recommendations.append("Implement rain gardens and bioswales for stormwater management")
    
    return recommendations

# Social impact calculation functions
def calculate_recreational_score(green_zones: List[GreenZone]) -> float:
    """Calculate recreational opportunities score"""
    recreational_values = {'park': 80, 'garden': 60, 'forest': 70, 'wetland': 50}
    
    if not green_zones:
        return 0
    
    weighted_score = sum(
        recreational_values.get(zone.type, 60) * zone.area
        for zone in green_zones
    )
    total_area = sum(zone.area for zone in green_zones)
    
    return weighted_score / total_area if total_area > 0 else 0

def calculate_health_benefits(green_zones: List[GreenZone]) -> float:
    """Calculate health benefits score"""
    # Green spaces provide mental health, physical activity, and air quality benefits
    total_area = sum(zone.area for zone in green_zones)
    
    # WHO recommends 9 sq m of green space per person
    # Assume population density of 100 people per hectare
    recommended_area = 9 * 100  # 900 sq m per hectare
    
    health_score = min(100, (total_area / recommended_area) * 100)
    return health_score

def calculate_social_cohesion_score(green_zones: List[GreenZone]) -> float:
    """Calculate social cohesion potential"""
    # Parks and gardens promote social interaction
    social_zones = [zone for zone in green_zones if zone.type in ['park', 'garden']]
    social_area = sum(zone.area for zone in social_zones)
    
    return min(100, social_area / 5000 * 80)  # Normalize based on social area

def estimate_property_value_impact(green_zones: List[GreenZone]) -> float:
    """Estimate property value impact"""
    # Green spaces typically increase nearby property values by 5-15%
    total_area = sum(zone.area for zone in green_zones)
    
    # Larger and more diverse green spaces have higher impact
    diversity_bonus = len(set(zone.type for zone in green_zones)) * 5
    area_impact = min(70, total_area / 10000 * 50)
    
    return min(100, area_impact + diversity_bonus)

def assess_equity_distribution(green_zones: List[GreenZone], region: List[Coordinate]) -> float:
    """Assess equitable distribution of green spaces"""
    if not green_zones or not region:
        return 0
    
    # Simple equity assessment based on spatial distribution
    # More sophisticated analysis would consider demographics
    
    # Calculate center of region
    center_lat = sum(coord.lat for coord in region) / len(region)
    center_lng = sum(coord.lng for coord in region) / len(region)
    
    # Calculate distribution of green zones relative to center
    distances = []
    for zone in green_zones:
        if zone.coordinates:
            zone_center_lat = sum(coord.lat for coord in zone.coordinates) / len(zone.coordinates)
            zone_center_lng = sum(coord.lng for coord in zone.coordinates) / len(zone.coordinates)
            
            distance = ((zone_center_lat - center_lat) ** 2 + (zone_center_lng - center_lng) ** 2) ** 0.5
            distances.append(distance)
    
    if not distances:
        return 0
    
    # Lower standard deviation indicates more equitable distribution
    std_dev = np.std(distances)
    equity_score = max(0, 100 - std_dev * 10000)  # Normalize and invert
    
    return equity_score

def generate_community_benefits(social_metrics: Dict[str, float]) -> List[str]:
    """Generate list of community benefits"""
    benefits = []
    
    if social_metrics['community_access'] > 70:
        benefits.append("Improved access to recreational facilities")
    
    if social_metrics['health_benefits'] > 60:
        benefits.append("Enhanced physical and mental health opportunities")
    
    if social_metrics['social_cohesion'] > 50:
        benefits.append("Increased community interaction and social cohesion")
    
    if social_metrics['property_value_impact'] > 60:
        benefits.append("Positive impact on local property values")
    
    benefits.extend([
        "Reduced healthcare costs through improved air quality",
        "Enhanced quality of life for residents",
        "Increased tourism and economic activity"
    ])
    
    return benefits