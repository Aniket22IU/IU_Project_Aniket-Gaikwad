import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/pages/Dashboard';
import { NewAnalysis } from './components/pages/NewAnalysis';
import { ProjectArchive } from './components/pages/ProjectArchive';
import { HelpDocs } from './components/pages/HelpDocs';
import { Toaster } from './components/ui/sonner';
import { apiClient } from './utils/api';

export interface TerrainData {
  elevation: number;
  slope: number;
  soilType: string;
  waterPresence: boolean;
}

export interface GreenZone {
  id: string;
  name: string;
  area: number;
  type: 'park' | 'garden' | 'forest' | 'wetland';
  coordinates: google.maps.LatLngLiteral[];
}

export interface Scenario {
  id: string;
  name: string;
  timestamp: Date;
  region: google.maps.LatLngLiteral[];
  greenZones: GreenZone[];
  coverage: number;
  sustainabilityScore: number;
  accessibilityScore: number;
  populationServed: number;
  status: 'draft' | 'completed' | 'shared';
  comments: Comment[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

export interface Project {
  id: string;
  name: string;
  region: string;
  status: 'draft' | 'completed' | 'shared';
  date: Date;
  scenario: Scenario;
}

type Page = 'dashboard' | 'new-analysis' | 'projects' | 'help';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [user] = useState({ name: 'Urban Planner', avatar: 'UP' });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Load projects from database on startup
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await apiClient.getProjects();
      if (response.data) {
        const projects = response.data.map((project: any) => ({
          ...project,
          date: new Date(project.date),
          scenario: {
            ...project.scenario,
            timestamp: new Date(project.scenario.timestamp)
          }
        }));
        setProjects(projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async (scenario: Scenario, regionName: string) => {
    const projectData = {
      name: scenario.name,
      region: regionName,
      status: scenario.status,
      scenario: {
        ...scenario,
        timestamp: scenario.timestamp.toISOString()
      }
    };
    
    try {
      const response = await apiClient.createProject(projectData);
      if (response.data) {
        await loadProjects(); // Reload from database
      }
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await apiClient.deleteProject(id);
      await loadProjects(); // Reload from database
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentPage('new-analysis');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header user={user} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        
        <main className="flex-1 overflow-auto">
          {currentPage === 'dashboard' && (
            <Dashboard 
              projects={projects}
              onStartNewProject={() => {
                setSelectedProject(null);
                setCurrentPage('new-analysis');
              }}
              onViewProject={handleViewProject}
            />
          )}
          
          {currentPage === 'new-analysis' && (
            <NewAnalysis 
              onSaveProject={handleSaveProject}
              onCancel={() => {
                setSelectedProject(null);
                setCurrentPage('dashboard');
              }}
              selectedProject={selectedProject}
              onProjectUpdate={loadProjects}
            />
          )}
          
          {currentPage === 'projects' && (
            <ProjectArchive 
              projects={projects}
              onDeleteProject={handleDeleteProject}
              onViewProject={() => setCurrentPage('new-analysis')}
            />
          )}
          
          {currentPage === 'help' && <HelpDocs />}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
