import { ArrowRight, TrendingUp, MapPin, Calendar, FolderOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Project } from '../../App';

interface DashboardProps {
  projects: Project[];
  onStartNewProject: () => void;
  onViewProject: (project: Project) => void;
}

export function Dashboard({ projects, onStartNewProject, onViewProject }: DashboardProps) {
  const recentProjects = projects.slice(0, 3);
  const completedCount = projects.filter(p => p.status === 'completed').length;
  const draftCount = projects.filter(p => p.status === 'draft').length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-slate-900 text-3xl mb-2">Welcome to MetroMorph</h1>
        <p className="text-slate-600">
          Analyze urban regions and generate optimal green zone layouts using AI-powered Graph Neural Networks.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-slate-900">{projects.length}</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-slate-900">{completedCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-slate-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl text-slate-900">{draftCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Start New Project */}
      <Card className="mb-8 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-slate-900 text-xl mb-2">Ready to Plan a Greener City?</h2>
              <p className="text-slate-600 mb-4">
                Start a new analysis by selecting a region, importing data, and letting our AI generate optimal green zone layouts.
              </p>
              <Button onClick={onStartNewProject} size="lg" className="gap-2">
                Start New Project
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-emerald-600/10 rounded-full flex items-center justify-center">
                <MapPin className="w-16 h-16 text-emerald-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most recent urban planning analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => onViewProject(project)}
                >
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">{project.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {project.region}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        project.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : project.status === 'shared'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-4">Get started by creating your first urban planning analysis.</p>
            <Button onClick={onStartNewProject} variant="outline">
              Create Your First Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}