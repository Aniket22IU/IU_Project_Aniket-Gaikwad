import { useState } from 'react';
import { TerrainData } from '../App';
import { Loader2 } from 'lucide-react';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ControlPanelProps {
  terrainData: TerrainData | null;
  onGenerateScenario: (params: { greenSpaceTarget: number; priorityType: string }) => void;
  isGenerating: boolean;
  hasRegion: boolean;
}

export function ControlPanel({ terrainData, onGenerateScenario, isGenerating, hasRegion }: ControlPanelProps) {
  const [greenSpaceTarget, setGreenSpaceTarget] = useState(25);
  const [priorityType, setPriorityType] = useState('balanced');

  const handleGenerate = () => {
    onGenerateScenario({
      greenSpaceTarget,
      priorityType
    });
  };

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Terrain Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Terrain Analysis</CardTitle>
            <CardDescription>Region terrain characteristics</CardDescription>
          </CardHeader>
          <CardContent>
            {terrainData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Elevation</span>
                  <span className="text-slate-900">{terrainData.elevation}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Slope</span>
                  <span className="text-slate-900">{terrainData.slope}°</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Soil Type</span>
                  <span className="text-slate-900">{terrainData.soilType}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a region to analyze terrain</p>
            )}
          </CardContent>
        </Card>

        {/* Generation Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Parameters</CardTitle>
            <CardDescription>Configure AI model settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Green Space Target */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Green Space Target</Label>
                <span className="text-sm text-slate-900">{greenSpaceTarget}%</span>
              </div>
              <Slider
                value={[greenSpaceTarget]}
                onValueChange={([value]) => setGreenSpaceTarget(value)}
                min={10}
                max={50}
                step={5}
                disabled={!hasRegion}
              />
              <p className="text-xs text-slate-500">Target percentage of green space coverage</p>
            </div>

            {/* Priority Type */}
            <div className="space-y-3">
              <Label>Optimization Priority</Label>
              <Select value={priorityType} onValueChange={setPriorityType} disabled={!hasRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="accessibility">Accessibility</SelectItem>
                  <SelectItem value="biodiversity">Biodiversity</SelectItem>
                  <SelectItem value="sustainability">Sustainability</SelectItem>
                  <SelectItem value="recreation">Recreation</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">GNN optimization focus area</p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!hasRegion || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Scenario'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* AI Model Info */}
        <Card>
          <CardHeader>
            <CardTitle>AI Model</CardTitle>
            <CardDescription>Graph Neural Network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Model Type</span>
                <span className="text-sm text-slate-900">GNN-Urban</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Status</span>
                <span className="text-sm text-emerald-600">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Version</span>
                <span className="text-sm text-slate-900">v2.1.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
