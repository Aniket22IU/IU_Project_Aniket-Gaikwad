import { useState } from 'react';
import { MessageSquare, Send, CheckCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Scenario, Comment } from '../../App';
import { toast } from 'sonner@2.0.3';

interface StepCollaborateProps {
  scenario: Scenario;
  onScenarioUpdate: (scenario: Scenario) => void;
  projectId?: string;
  onProjectUpdate?: () => void;
}

export function StepCollaborate({ scenario, onScenarioUpdate, projectId, onProjectUpdate }: StepCollaborateProps) {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      author: 'Urban Planner',
      text: newComment,
      timestamp: new Date()
    };

    const updatedScenario = {
      ...scenario,
      comments: [...scenario.comments, comment]
    };

    onScenarioUpdate(updatedScenario);
    setNewComment('');
    toast.success('Comment added');
  };

  const handleApprove = async () => {
    const updatedScenario = {
      ...scenario,
      status: 'completed' as const
    };
    onScenarioUpdate(updatedScenario);
    
    // Update project status in database if projectId exists
    if (projectId && onProjectUpdate) {
      try {
        await fetch(`http://localhost:8000/api/projects/${projectId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'completed',
            scenario: updatedScenario
          })
        });
        onProjectUpdate(); // Refresh projects in parent
        toast.success('Project approved and saved');
      } catch (error) {
        toast.error('Failed to save project status');
      }
    } else {
      toast.success('Scenario approved');
    }
  };

  const handleShare = () => {
    const updatedScenario = {
      ...scenario,
      status: 'shared' as const
    };
    onScenarioUpdate(updatedScenario);
    toast.success('Scenario shared with team');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-slate-900 text-2xl mb-2">Collaborate & Finalize</h2>
        <p className="text-slate-600">
          Review the scenario with your team, add comments, and save your project.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comments Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <CardTitle>Team Discussion</CardTitle>
                </div>
                <Badge variant="secondary">
                  {scenario.comments.length} {scenario.comments.length === 1 ? 'comment' : 'comments'}
                </Badge>
              </div>
              <CardDescription>
                Collaborate with your team on this scenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add Comment */}
              <div className="mb-6">
                <Textarea
                  placeholder="Add a comment or suggestion..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                  rows={3}
                />
                <Button onClick={handleAddComment} size="sm" className="gap-2">
                  <Send className="w-4 h-4" />
                  Add Comment
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {scenario.comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No comments yet. Start the discussion!</p>
                  </div>
                ) : (
                  scenario.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-4 bg-slate-50 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                          {comment.author.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-900">{comment.author}</span>
                          <span className="text-xs text-slate-500">
                            {comment.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Current Status</span>
                <Badge
                  variant={
                    scenario.status === 'completed'
                      ? 'default'
                      : scenario.status === 'shared'
                      ? 'secondary'
                      : 'outline'
                  }
                >
                  {scenario.status}
                </Badge>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <Button
                  onClick={handleApprove}
                  className="w-full gap-2"
                  disabled={scenario.status === 'completed'}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve & Complete
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scenario Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Name</span>
                <span className="text-sm text-slate-900">{scenario.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Green Coverage</span>
                <span className="text-sm text-slate-900">{scenario.coverage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Green Zones</span>
                <span className="text-sm text-slate-900">{scenario.greenZones.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Sustainability</span>
                <span className="text-sm text-slate-900">{scenario.sustainabilityScore}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Accessibility</span>
                <span className="text-sm text-slate-900">{scenario.accessibilityScore}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Population</span>
                <span className="text-sm text-slate-900">
                  {(scenario.populationServed / 1000).toFixed(0)}K
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-900 mb-1">Ready to save?</p>
            <p className="text-xs text-emerald-700">
              Click "Save Project" in the footer to add this scenario to your Past Projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
