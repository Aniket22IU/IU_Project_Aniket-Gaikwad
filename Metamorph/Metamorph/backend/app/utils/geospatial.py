import geopandas as gpd
import pandas as pd
from shapely.geometry import Point, Polygon, MultiPolygon
from shapely.ops import unary_union
import rasterio
from rasterio.features import rasterize
from rasterio.transform import from_bounds
import numpy as np
from typing import List, Dict, Tuple, Optional
import folium
from geopy.distance import geodesic

class GeospatialProcessor:
    """Handle geospatial operations for urban planning"""
    
    def __init__(self):
        self.crs = "EPSG:4326"  # WGS84
    
    def create_region_polygon(self, coordinates: List[Dict]) -> Polygon:
        """Create a Shapely polygon from coordinate list"""
        if len(coordinates) < 3:
            raise ValueError("Need at least 3 coordinates to create a polygon")
        
        coords = [(coord['lng'], coord['lat']) for coord in coordinates]
        return Polygon(coords)
    
    def calculate_polygon_area(self, polygon: Polygon) -> float:
        """Calculate area in square meters using geodesic calculations"""
        if polygon.is_empty:
            return 0.0
        
        # Convert to GeoDataFrame for accurate area calculation
        gdf = gpd.GeoDataFrame([1], geometry=[polygon], crs=self.crs)
        
        # Project to appropriate UTM zone for area calculation
        utm_crs = gdf.estimate_utm_crs()
        gdf_projected = gdf.to_crs(utm_crs)
        
        return float(gdf_projected.geometry.area.iloc[0])
    
    def calculate_coverage_percentage(self, green_zones: List[Dict], region_coords: List[Dict]) -> float:
        """Calculate green space coverage percentage"""
        if not green_zones or not region_coords:
            return 0.0
        
        # Create region polygon
        region_polygon = self.create_region_polygon(region_coords)
        region_area = self.calculate_polygon_area(region_polygon)
        
        if region_area == 0:
            return 0.0
        
        # Calculate total green zone area
        total_green_area = 0.0
        for zone in green_zones:
            if 'coordinates' in zone and len(zone['coordinates']) >= 3:
                zone_polygon = self.create_region_polygon(zone['coordinates'])
                zone_area = self.calculate_polygon_area(zone_polygon)
                total_green_area += zone_area
        
        return (total_green_area / region_area) * 100
    
    def generate_terrain_grid(self, region_coords: List[Dict], grid_size: int = 50) -> List[Dict]:
        """Generate a grid of terrain data points within the region"""
        region_polygon = self.create_region_polygon(region_coords)
        bounds = region_polygon.bounds  # (minx, miny, maxx, maxy)
        
        terrain_points = []
        
        # Create grid
        x_step = (bounds[2] - bounds[0]) / grid_size
        y_step = (bounds[3] - bounds[1]) / grid_size
        
        for i in range(grid_size):
            for j in range(grid_size):
                lng = bounds[0] + i * x_step
                lat = bounds[1] + j * y_step
                point = Point(lng, lat)
                
                if region_polygon.contains(point):
                    # Generate synthetic terrain data
                    terrain_data = self._generate_synthetic_terrain(lat, lng)
                    terrain_points.append(terrain_data)
        
        return terrain_points
    
    def _generate_synthetic_terrain(self, lat: float, lng: float) -> Dict:
        """Generate synthetic terrain data for a point"""
        # Use coordinates to create deterministic but varied terrain
        np.random.seed(int((lat + lng) * 10000) % 2**32)
        
        # Elevation based on distance from center (simulate hills)
        base_elevation = abs(np.sin(lat * 10) * np.cos(lng * 10)) * 100
        elevation = base_elevation + np.random.normal(0, 10)
        
        # Slope based on elevation variation
        slope = min(45, abs(np.random.normal(elevation / 10, 5)))
        
        # Soil type based on elevation and location
        if elevation < 20:
            soil_types = ['clay', 'loam']
        elif elevation < 60:
            soil_types = ['loam', 'sand']
        else:
            soil_types = ['rocky', 'sand']
        
        soil_type = np.random.choice(soil_types)
        
        # Water presence more likely in low elevation areas
        water_probability = max(0.1, 0.8 - (elevation / 100))
        water_presence = np.random.random() < water_probability
        
        return {
            'coordinates': {'lat': lat, 'lng': lng},
            'elevation': float(elevation),
            'slope': float(slope),
            'soil_type': soil_type,
            'water_presence': water_presence
        }
    
    def calculate_accessibility_score(self, green_zones: List[Dict], 
                                    population_centers: List[Dict] = None) -> float:
        """Calculate accessibility score based on distance to population centers"""
        if not green_zones:
            return 0.0
        
        # If no population centers provided, generate synthetic ones
        if not population_centers:
            population_centers = self._generate_population_centers(green_zones)
        
        total_accessibility = 0.0
        
        for pop_center in population_centers:
            pop_point = Point(pop_center['lng'], pop_center['lat'])
            min_distance = float('inf')
            
            # Find closest green zone
            for zone in green_zones:
                if 'coordinates' in zone and zone['coordinates']:
                    zone_coords = zone['coordinates']
                    zone_center_lat = sum(c['lat'] for c in zone_coords) / len(zone_coords)
                    zone_center_lng = sum(c['lng'] for c in zone_coords) / len(zone_coords)
                    
                    distance = geodesic(
                        (pop_center['lat'], pop_center['lng']),
                        (zone_center_lat, zone_center_lng)
                    ).meters
                    
                    min_distance = min(min_distance, distance)
            
            # Convert distance to accessibility score (closer = better)
            if min_distance < float('inf'):
                accessibility = max(0, 100 - (min_distance / 50))  # 50m = 100% accessible
                total_accessibility += accessibility * pop_center.get('population', 1000)
        
        total_population = sum(pc.get('population', 1000) for pc in population_centers)
        return total_accessibility / total_population if total_population > 0 else 0.0
    
    def _generate_population_centers(self, green_zones: List[Dict]) -> List[Dict]:
        """Generate synthetic population centers around green zones"""
        if not green_zones:
            return []
        
        # Calculate bounding box of all green zones
        all_coords = []
        for zone in green_zones:
            if 'coordinates' in zone:
                all_coords.extend(zone['coordinates'])
        
        if not all_coords:
            return []
        
        min_lat = min(c['lat'] for c in all_coords)
        max_lat = max(c['lat'] for c in all_coords)
        min_lng = min(c['lng'] for c in all_coords)
        max_lng = max(c['lng'] for c in all_coords)
        
        # Generate population centers
        population_centers = []
        for i in range(5):  # 5 population centers
            lat = np.random.uniform(min_lat, max_lat)
            lng = np.random.uniform(min_lng, max_lng)
            population = np.random.randint(500, 5000)
            
            population_centers.append({
                'lat': lat,
                'lng': lng,
                'population': population
            })
        
        return population_centers
    
    def calculate_connectivity_score(self, green_zones: List[Dict]) -> float:
        """Calculate connectivity score between green zones"""
        if len(green_zones) < 2:
            return 0.0
        
        total_connectivity = 0.0
        connections = 0
        
        for i, zone1 in enumerate(green_zones):
            for zone2 in green_zones[i+1:]:
                if 'coordinates' in zone1 and 'coordinates' in zone2:
                    # Calculate distance between zone centers
                    zone1_coords = zone1['coordinates']
                    zone2_coords = zone2['coordinates']
                    
                    if zone1_coords and zone2_coords:
                        center1_lat = sum(c['lat'] for c in zone1_coords) / len(zone1_coords)
                        center1_lng = sum(c['lng'] for c in zone1_coords) / len(zone1_coords)
                        center2_lat = sum(c['lat'] for c in zone2_coords) / len(zone2_coords)
                        center2_lng = sum(c['lng'] for c in zone2_coords) / len(zone2_coords)
                        
                        distance = geodesic(
                            (center1_lat, center1_lng),
                            (center2_lat, center2_lng)
                        ).meters
                        
                        # Connectivity decreases with distance
                        connectivity = max(0, 100 - (distance / 20))  # 20m = 100% connected
                        total_connectivity += connectivity
                        connections += 1
        
        return total_connectivity / connections if connections > 0 else 0.0
    
    def create_folium_map(self, region_coords: List[Dict], green_zones: List[Dict] = None) -> str:
        """Create an interactive Folium map"""
        if not region_coords:
            return ""
        
        # Calculate center
        center_lat = sum(c['lat'] for c in region_coords) / len(region_coords)
        center_lng = sum(c['lng'] for c in region_coords) / len(region_coords)
        
        # Create map
        m = folium.Map(location=[center_lat, center_lng], zoom_start=15)
        
        # Add region boundary
        region_coords_folium = [[c['lat'], c['lng']] for c in region_coords]
        folium.Polygon(
            locations=region_coords_folium,
            color='blue',
            weight=2,
            fillColor='lightblue',
            fillOpacity=0.2,
            popup='Planning Region'
        ).add_to(m)
        
        # Add green zones
        if green_zones:
            zone_colors = {
                'park': 'green',
                'garden': 'lightgreen',
                'forest': 'darkgreen',
                'wetland': 'blue'
            }
            
            for zone in green_zones:
                if 'coordinates' in zone and zone['coordinates']:
                    zone_coords = [[c['lat'], c['lng']] for c in zone['coordinates']]
                    color = zone_colors.get(zone.get('type', 'park'), 'green')
                    
                    folium.Polygon(
                        locations=zone_coords,
                        color=color,
                        weight=2,
                        fillColor=color,
                        fillOpacity=0.6,
                        popup=f"{zone.get('name', 'Green Zone')} ({zone.get('type', 'park')})"
                    ).add_to(m)
        
        return m._repr_html_()
    
    def validate_coordinates(self, coordinates: List[Dict]) -> bool:
        """Validate coordinate format and values"""
        if not coordinates or len(coordinates) < 3:
            return False
        
        for coord in coordinates:
            if not isinstance(coord, dict):
                return False
            
            if 'lat' not in coord or 'lng' not in coord:
                return False
            
            try:
                lat = float(coord['lat'])
                lng = float(coord['lng'])
                
                if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
                    return False
            except (ValueError, TypeError):
                return False
        
        return True
    
    def simplify_polygon(self, coordinates: List[Dict], tolerance: float = 0.0001) -> List[Dict]:
        """Simplify polygon to reduce coordinate count"""
        if len(coordinates) <= 4:
            return coordinates
        
        polygon = self.create_region_polygon(coordinates)
        simplified = polygon.simplify(tolerance, preserve_topology=True)
        
        if hasattr(simplified, 'exterior'):
            coords = list(simplified.exterior.coords)[:-1]  # Remove duplicate last point
            return [{'lat': lat, 'lng': lng} for lng, lat in coords]
        
        return coordinates