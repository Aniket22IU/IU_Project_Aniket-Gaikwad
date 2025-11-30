import { Scenario } from '../App';
import { Share2, Trash2, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface ScenarioPanelProps {
  scenarios: Scenario[];
  activeScenario: Scenario | null;
  onSelectScenario: (scenario: Scenario) => void;
  onDeleteScenario: (id: string) => void;
}

export function ScenarioPanel({ scenarios, activeScenario, onSelectScenario, onDeleteScenario }: ScenarioPanelProps) {
  const handleShare = (scenario: Scenario) => {
    const shareData = {
      name: scenario.name,
      coverage: scenario.coverage,
      sustainability: scenario.sustainabilityScore,
      accessibility: scenario.accessibilityScore,
      zones: scenario.greenZones.length
    };
    
    navigator.clipboard.writeText(JSON.stringify(shareData, null, 2));
    toast.success('Scenario data copied to clipboard');
  };

  const handleExport = (scenario: Scenario) => {
    const dataStr = JSON.stringify(scenario, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scenario.name.toLowerCase().replace(/\s/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Scenario exported successfully');
  };

  return (
    <div className="w-96 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-slate-900">Generated Scenarios</h2>
        <p className="text-sm text-slate-500 mt-1">{scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''} generated</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {scenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className={`cursor-pointer transition-all ${
              activeScenario?.id === scenario.id
                ? 'ring-2 ring-emerald-600 bg-emerald-50'
                : 'hover:border-emerald-300'
            }`}
            onClick={() => onSelectScenario(scenario)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{scenario.name}</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    {scenario.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(scenario);
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(scenario);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteScenario(scenario.id);
                      toast.success('Scenario deleted');
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Coverage</p>
                  <p className="text-slate-900">{scenario.coverage}%</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Green Zones</p>
                  <p className="text-slate-900">{scenario.greenZones.length}</p>
                </div>
              </div>

              {/* Scores */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Sustainability</span>
                  <Badge variant="secondary">{scenario.sustainabilityScore}/100</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Accessibility</span>
                  <Badge variant="secondary">{scenario.accessibilityScore}/100</Badge>
                </div>
              </div>

              {/* Zone Types */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex flex-wrap gap-1">
                  {scenario.greenZones.map((zone, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {zone.type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
