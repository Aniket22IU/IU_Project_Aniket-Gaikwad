# Urban Planning Backend with GNN

A comprehensive Python backend for the Generative Urban City Planner using FastAPI, GeoPandas, and Graph Neural Networks.

## Features

- **FastAPI Backend**: High-performance async API with automatic documentation
- **Graph Neural Network**: Advanced ML model for urban planning optimization
- **Geospatial Processing**: GeoPandas, Shapely, and Rasterio for map operations
- **Comprehensive Analysis**: Environmental, social, and sustainability assessments
- **Real-time Optimization**: Dynamic planning adjustments based on constraints

## Installation

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running the Backend

1. **Start the FastAPI server:**
```bash
python main.py
```

2. **Access the API:**
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Projects
- `GET /api/projects/` - Get all projects
- `POST /api/projects/` - Create new project
- `GET /api/projects/{id}` - Get specific project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Analysis
- `POST /api/analysis/run` - Run comprehensive analysis
- `POST /api/analysis/terrain` - Generate terrain analysis
- `POST /api/analysis/environmental-impact` - Environmental assessment
- `POST /api/analysis/social-impact` - Social impact analysis

### GNN Optimization
- `POST /api/gnn/optimize` - GNN-based optimization
- `POST /api/gnn/predict-impact` - Predict environmental impact
- `POST /api/gnn/scenario-comparison` - Compare multiple scenarios
- `POST /api/gnn/real-time-optimization` - Real-time optimization
- `GET /api/gnn/status` - GNN model status

## GNN Model Architecture

The Graph Neural Network uses:
- **Graph Attention Networks (GAT)** for spatial relationships
- **Graph Convolutional Networks (GCN)** for feature propagation
- **Multi-head attention** for complex spatial patterns
- **Multiple output heads** for different predictions:
  - Zone type classification
  - Sustainability scoring
  - Accessibility analysis
  - Connectivity optimization

## Geospatial Capabilities

- **Coordinate validation** and transformation
- **Polygon area calculations** using geodesic methods
- **Terrain data generation** with realistic parameters
- **Coverage percentage** calculations
- **Accessibility scoring** based on distance analysis
- **Interactive map generation** with Folium

## Data Models

### Project Structure
```python
{
  "id": "string",
  "name": "string",
  "region": "string",
  "scenario": {
    "green_zones": [...],
    "region": [...],
    "gnn_predictions": {...}
  }
}
```

### GNN Optimization Request
```python
{
  "region": [{"lat": float, "lng": float}],
  "existing_zones": [...],
  "terrain_data": [...],
  "constraints": {...},
  "optimization_goals": ["sustainability", "accessibility"]
}
```

## Environment Variables

- `DATABASE_URL`: Database connection string
- `API_HOST`: API host (default: 0.0.0.0)
- `API_PORT`: API port (default: 8000)
- `MODEL_PATH`: Path to GNN model file
- `ENABLE_GPU`: Enable GPU acceleration for GNN
- `ALLOWED_ORIGINS`: CORS allowed origins

## Development

### Running Tests
```bash
pytest tests/
```

### Code Formatting
```bash
black app/
isort app/
```

### Type Checking
```bash
mypy app/
```

## Model Training

The GNN model can be retrained with new data:

```python
POST /api/gnn/train
{
  "training_data": {
    "projects": [...],
    "outcomes": [...],
    "feedback": [...]
  }
}
```

## Performance Optimization

- **Async processing** for concurrent requests
- **Caching** with Redis for frequent calculations
- **Batch processing** for multiple optimizations
- **GPU acceleration** for GNN inference (optional)

## Monitoring and Logging

- **Health checks** at `/health`
- **Structured logging** with configurable levels
- **Performance metrics** tracking
- **Error handling** with detailed messages

## Integration with Frontend

The backend provides CORS-enabled APIs that integrate seamlessly with the React frontend:

1. **Project Management**: Full CRUD operations
2. **Real-time Analysis**: Live updates during planning
3. **GNN Optimization**: Advanced ML-powered suggestions
4. **Export Capabilities**: GeoJSON and other formats

## Deployment

### Docker Deployment
```bash
docker build -t urban-planner-backend .
docker run -p 8000:8000 urban-planner-backend
```

### Production Considerations
- Use PostgreSQL for production database
- Configure Redis for caching
- Set up proper logging and monitoring
- Use HTTPS in production
- Configure rate limiting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.