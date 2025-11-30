import { Eye, Download, Trash2, Share2, Calendar, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Project } from '../../App';
import { toast } from 'sonner@2.0.3';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface ProjectArchiveProps {
  projects: Project[];
  onDeleteProject: (id: string) => void;
  onViewProject: (project: Project) => void;
}

export function ProjectArchive({ projects, onDeleteProject, onViewProject }: ProjectArchiveProps) {
  const handleDownload = (project: Project) => {
    const dataStr = JSON.stringify(project.scenario, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.toLowerCase().replace(/\s/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Project downloaded successfully');
  };

  const handleShare = (project: Project) => {
    const shareData = {
      name: project.name,
      region: project.region,
      coverage: project.scenario.coverage,
      sustainability: project.scenario.sustainabilityScore,
      greenZones: project.scenario.greenZones.length
    };
    
    navigator.clipboard.writeText(JSON.stringify(shareData, null, 2));
    toast.success('Project data copied to clipboard');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      onDeleteProject(id);
      toast.success('Project deleted');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-slate-900 text-3xl mb-2">Past Projects</h1>
        <p className="text-slate-600">
          View, download, and manage your urban planning analyses.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600">Your completed analyses will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Projects ({projects.length})</CardTitle>
            <CardDescription>Manage your urban planning analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Green Zones</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900">{project.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{project.region}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          project.status === 'completed'
                            ? 'default'
                            : project.status === 'shared'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {project.date.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {project.scenario.greenZones.length} zones
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {project.scenario.coverage}%
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewProject(project)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(project)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(project)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
