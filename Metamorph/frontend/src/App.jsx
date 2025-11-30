import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/pages/Dashboard';
import { NewAnalysis } from './components/pages/NewAnalysis';
import { ProjectArchive } from './components/pages/ProjectArchive';
import { HelpDocs } from './components/pages/HelpDocs';
import { Toaster } from './components/ui/sonner';
import { apiClient } from './utils/api';

// Type definitions removed for JSX compatibility

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [user] = useState({ name: 'Urban Planner', avatar: 'UP' });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  // Load projects from database on startup
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await apiClient.getProjects();
      if (response.data) {
        const projects = response.data.map((project) => ({
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

  const handleSaveProject = async (scenario, regionName) => {
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

  const handleDeleteProject = async (id) => {
    try {
      await apiClient.deleteProject(id);
      await loadProjects(); // Reload from database
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleViewProject = (project) => {
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
