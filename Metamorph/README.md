# Generative Urban City Planner

A comprehensive urban planning application with AI-powered optimization using Graph Neural Networks (GNN). This project combines a React frontend with a Python FastAPI backend to provide intelligent urban planning solutions.


## Quick Start

### 1. Clone Repository

'''bash
git clone <repository-url>
cd "Generative Urban City Planner"
'''

### 2. Setup Backend

'''bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
python run.py
'''

Backend will be available at:
- API: http://localhost:8000
- Documentation: http://localhost:8000/docs

### 3. Setup Frontend

'''bash
# In project root directory
npm install
npm run dev
'''

Frontend will be available at: http://localhost:5173

##  Configuration

### Environment Variables

**Backend (.env)**:
'''env
DATABASE_URL=sqlite:///./urban_planner.db
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
ALLOWED_ORIGINS=http://localhost:5173
MODEL_PATH=./models/urban_gnn_model.pth
ENABLE_GPU=False
'''

**Frontend**:
'''env
VITE_API_URL=http://localhost:8000
'''

