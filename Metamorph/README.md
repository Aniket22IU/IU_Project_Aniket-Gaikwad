# Generative Urban City Planner

A comprehensive urban planning application with AI-powered optimization using Graph Neural Networks (GNN). This project combines a React frontend with a Python FastAPI backend to provide intelligent urban planning solutions.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Python + FastAPI + GNN
- **ML Model**: PyTorch Geometric for Graph Neural Networks
- **Geospatial**: GeoPandas, Shapely, Rasterio
- **Database**: SQLite/PostgreSQL
- **Caching**: Redis (optional)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd "Generative Urban City Planner"
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python run.py
```

Backend will be available at:
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs

### 3. Setup Frontend

```bash
# In project root directory
npm install
npm run dev
```

Frontend will be available at: http://localhost:5173

## 🧠 GNN Model Features

### Core Capabilities
- **Spatial Optimization**: Optimal placement of green zones
- **Multi-objective Analysis**: Sustainability, accessibility, connectivity
- **Real-time Predictions**: Dynamic planning adjustments
- **Environmental Impact**: Air quality, carbon sequestration, biodiversity
- **Social Impact**: Community access, health benefits, equity

### Model Architecture
- **Graph Attention Networks (GAT)**: Spatial relationship modeling
- **Graph Convolutional Networks (GCN)**: Feature propagation
- **Multi-head Attention**: Complex pattern recognition
- **Multiple Output Heads**: Zone classification, scoring, optimization

## 📊 API Endpoints

### Projects
- `GET /api/projects/` - List all projects
- `POST /api/projects/` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Analysis
- `POST /api/analysis/run` - Comprehensive analysis
- `POST /api/analysis/terrain` - Terrain analysis
- `POST /api/analysis/environmental-impact` - Environmental assessment
- `POST /api/analysis/social-impact` - Social impact analysis

### GNN Optimization
- `POST /api/gnn/optimize` - GNN-powered optimization
- `POST /api/gnn/predict-impact` - Environmental predictions
- `POST /api/gnn/scenario-comparison` - Compare scenarios
- `POST /api/gnn/real-time-optimization` - Real-time adjustments

## 🗺️ Geospatial Features

### Supported Operations
- **Coordinate Validation**: WGS84 coordinate system
- **Area Calculations**: Geodesic area computation
- **Terrain Generation**: Elevation, slope, soil type, water presence
- **Coverage Analysis**: Green space coverage percentage
- **Accessibility Scoring**: Distance-based accessibility
- **Interactive Maps**: Folium-based visualization

### Data Formats
- **Input**: GeoJSON, coordinate arrays
- **Processing**: Shapely geometries, GeoPandas DataFrames
- **Output**: GeoJSON, interactive HTML maps

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
DATABASE_URL=sqlite:///./urban_planner.db
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
ALLOWED_ORIGINS=http://localhost:5173
MODEL_PATH=./models/urban_gnn_model.pth
ENABLE_GPU=False
```

**Frontend**:
```env
VITE_API_URL=http://localhost:8000
```

## 🐳 Docker Deployment

### Full Stack with Docker Compose

```bash
cd backend
docker-compose up -d
```

This starts:
- Backend API (port 8000)
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Frontend (port 5173)

### Individual Services

```bash
# Backend only
cd backend
docker build -t urban-planner-backend .
docker run -p 8000:8000 urban-planner-backend

# Frontend only
docker build -t urban-planner-frontend .
docker run -p 5173:5173 urban-planner-frontend
```

## 📈 Performance Features

- **Async Processing**: Concurrent request handling
- **Caching**: Redis-based result caching
- **Batch Operations**: Multiple scenario processing
- **GPU Acceleration**: Optional CUDA support for GNN
- **Real-time Updates**: WebSocket support (planned)

## 🧪 Development

### Running Tests

```bash
# Backend tests
cd backend
pytest tests/

# Frontend tests
npm test
```

### Code Quality

```bash
# Backend
black app/
isort app/
mypy app/

# Frontend
npm run lint
npm run type-check
```

## 📚 Usage Examples

### Basic Project Creation

```typescript
import { apiClient } from './src/utils/api';

const project = {
  name: "Central Park Expansion",
  region: "Downtown",
  scenario: {
    name: "Green Corridor",
    region: [
      { lat: 40.7829, lng: -73.9654 },
      { lat: 40.7849, lng: -73.9654 },
      { lat: 40.7849, lng: -73.9634 },
      { lat: 40.7829, lng: -73.9634 }
    ],
    green_zones: []
  }
};

const response = await apiClient.createProject(project);
```

### GNN Optimization

```typescript
const optimizationRequest = {
  region: coordinates,
  existing_zones: currentZones,
  terrain_data: terrainData,
  optimization_goals: ["sustainability", "accessibility"]
};

const result = await apiClient.optimizeWithGNN(optimizationRequest);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Figma design: [Generative Urban City Planner](https://www.figma.com/design/0nXn6xCr70KYQisV489KHT/Generative-Urban-City-Planner)
- PyTorch Geometric team for GNN framework
- GeoPandas community for geospatial tools
- FastAPI team for the excellent web framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the backend README for detailed API information