const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.detail || 'An error occurred',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Project endpoints
  async getProjects() {
    return this.request('/api/projects/');
  }

  async getProject(id: string) {
    return this.request(`/api/projects/${id}`);
  }

  async createProject(project: any) {
    return this.request('/api/projects/', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: any) {
    return this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Analysis endpoints
  async runAnalysis(analysisData: any) {
    return this.request('/api/analysis/run', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
  }

  async generateTerrain(coordinates: any[]) {
    return this.request('/api/analysis/terrain', {
      method: 'POST',
      body: JSON.stringify({ coordinates }),
    });
  }

  async assessEnvironmentalImpact(data: any) {
    return this.request('/api/analysis/environmental-impact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assessSocialImpact(data: any) {
    return this.request('/api/analysis/social-impact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // GNN endpoints
  async optimizeWithGNN(optimizationData: any) {
    return this.request('/api/gnn/optimize', {
      method: 'POST',
      body: JSON.stringify(optimizationData),
    });
  }

  async predictEnvironmentalImpact(data: any) {
    return this.request('/api/gnn/predict-impact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async compareScenarios(scenarios: any[]) {
    return this.request('/api/gnn/scenario-comparison', {
      method: 'POST',
      body: JSON.stringify({ scenarios }),
    });
  }

  async realTimeOptimization(data: any) {
    return this.request('/api/gnn/real-time-optimization', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGNNStatus() {
    return this.request('/api/gnn/status');
  }

  async trainGNNModel(trainingData: any) {
    return this.request('/api/gnn/train', {
      method: 'POST',
      body: JSON.stringify({ training_data: trainingData }),
    });
  }

  async getTrainingStatus(jobId: string) {
    return this.request(`/api/gnn/training-status/${jobId}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;