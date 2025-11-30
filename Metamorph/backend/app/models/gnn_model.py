import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv, GATConv, global_mean_pool  # type: ignore
from torch_geometric.data import Data, Batch  # type: ignore
import numpy as np
from typing import List, Dict, Tuple
import geopandas as gpd  # type: ignore
from shapely.geometry import Point, Polygon  # type: ignore
import networkx as nx

class UrbanGNN(torch.nn.Module):
    def __init__(self, input_dim: int = 10, hidden_dim: int = 64, output_dim: int = 4):
        super(UrbanGNN, self).__init__()
        
        # Graph Attention layers for spatial relationships
        self.gat1 = GATConv(input_dim, hidden_dim, heads=4, dropout=0.1)
        self.gat2 = GATConv(hidden_dim * 4, hidden_dim, heads=2, dropout=0.1)
        
        # Graph Convolutional layers for feature propagation
        self.gcn1 = GCNConv(hidden_dim * 2, hidden_dim)
        self.gcn2 = GCNConv(hidden_dim, hidden_dim // 2)
        
        # Output layers for different predictions
        self.zone_classifier = torch.nn.Linear(hidden_dim // 2, 4)  # 4 zone types
        self.sustainability_predictor = torch.nn.Linear(hidden_dim // 2, 1)
        self.accessibility_predictor = torch.nn.Linear(hidden_dim // 2, 1)
        self.connectivity_predictor = torch.nn.Linear(hidden_dim // 2, 1)
        
        self.dropout = torch.nn.Dropout(0.2)
        
    def forward(self, x, edge_index, batch=None):
        # Graph Attention Network layers
        x = F.elu(self.gat1(x, edge_index))
        x = self.dropout(x)
        x = F.elu(self.gat2(x, edge_index))
        
        # Graph Convolutional layers
        x = F.elu(self.gcn1(x, edge_index))
        x = self.dropout(x)
        x = F.elu(self.gcn2(x, edge_index))
        
        # Global pooling for graph-level predictions
        if batch is not None:
            graph_embedding = global_mean_pool(x, batch)
        else:
            graph_embedding = torch.mean(x, dim=0, keepdim=True)
        
        # Multiple output heads
        zone_logits = self.zone_classifier(x)
        sustainability = torch.sigmoid(self.sustainability_predictor(graph_embedding))
        accessibility = torch.sigmoid(self.accessibility_predictor(graph_embedding))
        connectivity = torch.sigmoid(self.connectivity_predictor(graph_embedding))
        
        return {
            'zone_predictions': zone_logits,
            'sustainability': sustainability,
            'accessibility': accessibility,
            'connectivity': connectivity,
            'node_embeddings': x
        }

class UrbanPlanningGNN:
    def __init__(self, model_path: str = None):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = UrbanGNN().to(self.device)
        
        if model_path:
            self.load_model(model_path)
        else:
            self._initialize_pretrained_weights()
    
    def _initialize_pretrained_weights(self):
        """Initialize with reasonable weights for urban planning"""
        for module in self.model.modules():
            if isinstance(module, torch.nn.Linear):
                torch.nn.init.xavier_uniform_(module.weight)
                if module.bias is not None:
                    torch.nn.init.zeros_(module.bias)
    
    def create_urban_graph(self, region_coords: List[Dict], terrain_data: List[Dict], 
                          existing_zones: List[Dict] = None) -> Data:
        """Create a graph representation of the urban area"""
        
        # Create spatial grid
        grid_points = self._create_spatial_grid(region_coords, grid_size=50)
        
        # Extract features for each grid point
        node_features = []
        for point in grid_points:
            features = self._extract_point_features(point, terrain_data, existing_zones)
            node_features.append(features)
        
        # Create edges based on spatial proximity
        edge_index = self._create_spatial_edges(grid_points, max_distance=100)
        
        # Convert to tensors
        x = torch.tensor(node_features, dtype=torch.float32)
        edge_index = torch.tensor(edge_index, dtype=torch.long).t().contiguous()
        
        # Add positional encoding
        pos = torch.tensor([[p['lat'], p['lng']] for p in grid_points], dtype=torch.float32)
        
        return Data(x=x, edge_index=edge_index, pos=pos)
    
    def _create_spatial_grid(self, region_coords: List[Dict], grid_size: int = 50) -> List[Dict]:
        """Create a regular grid of points within the region"""
        if not region_coords:
            return []
        
        # Get bounding box
        lats = [coord['lat'] for coord in region_coords]
        lngs = [coord['lng'] for coord in region_coords]
        
        min_lat, max_lat = min(lats), max(lats)
        min_lng, max_lng = min(lngs), max(lngs)
        
        # Create region polygon
        region_polygon = Polygon([(coord['lng'], coord['lat']) for coord in region_coords])
        
        # Generate grid points
        grid_points = []
        lat_step = (max_lat - min_lat) / grid_size
        lng_step = (max_lng - min_lng) / grid_size
        
        for i in range(grid_size):
            for j in range(grid_size):
                lat = min_lat + i * lat_step
                lng = min_lng + j * lng_step
                point = Point(lng, lat)
                
                if region_polygon.contains(point):
                    grid_points.append({'lat': lat, 'lng': lng})
        
        return grid_points
    
    def _extract_point_features(self, point: Dict, terrain_data: List[Dict], 
                               existing_zones: List[Dict] = None) -> List[float]:
        """Extract features for a single point"""
        features = []
        
        # Spatial features
        features.extend([point['lat'], point['lng']])
        
        # Terrain features (interpolated from nearest terrain data)
        terrain_features = self._interpolate_terrain_features(point, terrain_data)
        features.extend(terrain_features)
        
        # Existing zone features
        zone_features = self._calculate_zone_proximity(point, existing_zones or [])
        features.extend(zone_features)
        
        # Ensure fixed feature dimension
        while len(features) < 10:
            features.append(0.0)
        
        return features[:10]
    
    def _interpolate_terrain_features(self, point: Dict, terrain_data: List[Dict]) -> List[float]:
        """Interpolate terrain features from nearby data points"""
        if not terrain_data:
            return [0.0, 0.0, 0.0, 0.0]  # elevation, slope, soil_type_encoded, water_presence
        
        # Find nearest terrain data point
        min_distance = float('inf')
        nearest_terrain = terrain_data[0]
        
        for terrain in terrain_data:
            distance = ((point['lat'] - terrain['coordinates']['lat']) ** 2 + 
                       (point['lng'] - terrain['coordinates']['lng']) ** 2) ** 0.5
            if distance < min_distance:
                min_distance = distance
                nearest_terrain = terrain
        
        # Encode soil type
        soil_encoding = {'clay': 0.25, 'sand': 0.5, 'loam': 0.75, 'rocky': 1.0}
        soil_encoded = soil_encoding.get(nearest_terrain.get('soil_type', 'loam'), 0.5)
        
        return [
            nearest_terrain.get('elevation', 0.0) / 100.0,  # Normalize elevation
            nearest_terrain.get('slope', 0.0) / 45.0,       # Normalize slope
            soil_encoded,
            float(nearest_terrain.get('water_presence', False))
        ]
    
    def _calculate_zone_proximity(self, point: Dict, existing_zones: List[Dict]) -> List[float]:
        """Calculate proximity to existing zones"""
        if not existing_zones:
            return [0.0, 0.0, 0.0, 0.0]  # park, garden, forest, wetland proximity
        
        zone_proximities = {'park': 0.0, 'garden': 0.0, 'forest': 0.0, 'wetland': 0.0}
        
        for zone in existing_zones:
            zone_type = zone.get('type', 'park')
            if zone_type in zone_proximities:
                # Calculate distance to zone center
                zone_coords = zone.get('coordinates', [])
                if zone_coords:
                    center_lat = sum(c['lat'] for c in zone_coords) / len(zone_coords)
                    center_lng = sum(c['lng'] for c in zone_coords) / len(zone_coords)
                    
                    distance = ((point['lat'] - center_lat) ** 2 + 
                               (point['lng'] - center_lng) ** 2) ** 0.5
                    
                    # Convert distance to proximity (closer = higher value)
                    proximity = max(0, 1 - distance * 1000)  # Adjust scale as needed
                    zone_proximities[zone_type] = max(zone_proximities[zone_type], proximity)
        
        return list(zone_proximities.values())
    
    def _create_spatial_edges(self, grid_points: List[Dict], max_distance: float = 100) -> List[List[int]]:
        """Create edges between spatially close points"""
        edges = []
        
        for i, point1 in enumerate(grid_points):
            for j, point2 in enumerate(grid_points[i+1:], i+1):
                distance = ((point1['lat'] - point2['lat']) ** 2 + 
                           (point1['lng'] - point2['lng']) ** 2) ** 0.5
                
                # Convert to approximate meters (rough approximation)
                distance_meters = distance * 111000
                
                if distance_meters <= max_distance:
                    edges.append([i, j])
                    edges.append([j, i])  # Undirected graph
        
        return edges
    
    def predict_optimal_zones(self, region_coords: List[Dict], terrain_data: List[Dict],
                             existing_zones: List[Dict] = None, 
                             constraints: Dict = None) -> Dict:
        """Predict optimal green zone placements"""
        
        # Create graph representation
        graph_data = self.create_urban_graph(region_coords, terrain_data, existing_zones)
        
        # Run inference
        self.model.eval()
        with torch.no_grad():
            graph_data = graph_data.to(self.device)
            predictions = self.model(graph_data.x, graph_data.edge_index)
        
        # Process predictions
        zone_probs = F.softmax(predictions['zone_predictions'], dim=1)
        
        # Generate optimal zones based on predictions
        optimal_zones = self._generate_zones_from_predictions(
            graph_data.pos.cpu().numpy(),
            zone_probs.cpu().numpy(),
            constraints or {}
        )
        
        return {
            'optimal_zones': optimal_zones,
            'sustainability_score': float(predictions['sustainability'].cpu().item()),
            'accessibility_score': float(predictions['accessibility'].cpu().item()),
            'connectivity_score': float(predictions['connectivity'].cpu().item()),
            'confidence': 0.85  # Mock confidence score
        }
    
    def _generate_zones_from_predictions(self, positions: np.ndarray, 
                                       zone_probs: np.ndarray, 
                                       constraints: Dict) -> List[Dict]:
        """Generate zone proposals from GNN predictions"""
        zones = []
        zone_types = ['park', 'garden', 'forest', 'wetland']
        
        # Find high-probability regions for each zone type
        for zone_idx, zone_type in enumerate(zone_types):
            # Get points with high probability for this zone type
            high_prob_indices = np.where(zone_probs[:, zone_idx] > 0.7)[0]
            
            if len(high_prob_indices) > 5:  # Minimum points for a zone
                # Cluster nearby points
                clusters = self._cluster_points(positions[high_prob_indices])
                
                for cluster_idx, cluster in enumerate(clusters):
                    if len(cluster) >= 4:  # Minimum points for a polygon
                        zone = {
                            'id': f'gnn-{zone_type}-{cluster_idx}',
                            'name': f'GNN Optimized {zone_type.title()}',
                            'type': zone_type,
                            'coordinates': [
                                {'lat': float(pos[0]), 'lng': float(pos[1])} 
                                for pos in cluster
                            ],
                            'area': self._calculate_polygon_area(cluster),
                            'confidence': float(np.mean(zone_probs[high_prob_indices, zone_idx]))
                        }
                        zones.append(zone)
        
        return zones[:6]  # Limit to 6 zones
    
    def _cluster_points(self, points: np.ndarray, max_distance: float = 0.001) -> List[np.ndarray]:
        """Simple clustering of nearby points"""
        if len(points) == 0:
            return []
        
        clusters = []
        used = set()
        
        for i, point in enumerate(points):
            if i in used:
                continue
            
            cluster = [point]
            used.add(i)
            
            # Find nearby points
            for j, other_point in enumerate(points):
                if j in used:
                    continue
                
                distance = np.linalg.norm(point - other_point)
                if distance <= max_distance:
                    cluster.append(other_point)
                    used.add(j)
            
            if len(cluster) >= 3:
                clusters.append(np.array(cluster))
        
        return clusters
    
    def _calculate_polygon_area(self, points: np.ndarray) -> float:
        """Calculate area of polygon in square meters (approximate)"""
        if len(points) < 3:
            return 0.0
        
        # Simple shoelace formula
        x = points[:, 1]  # longitude
        y = points[:, 0]  # latitude
        
        area = 0.5 * abs(sum(x[i] * y[i+1] - x[i+1] * y[i] for i in range(-1, len(x)-1)))
        
        # Convert to approximate square meters
        return area * 111000 * 111000
    
    def save_model(self, path: str):
        """Save the trained model"""
        torch.save(self.model.state_dict(), path)
    
    def load_model(self, path: str):
        """Load a trained model"""
        self.model.load_state_dict(torch.load(path, map_location=self.device))