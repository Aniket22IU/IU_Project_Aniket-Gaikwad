import { Download, Share2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapInterface } from '../MapInterface';
import { Scenario } from '../../App';
import { toast } from 'sonner@2.0.3';

interface StepViewResultsProps {
  scenario: Scenario;
  onScenarioUpdate: (scenario: Scenario) => void;
}

export function StepViewResults({ scenario }: StepViewResultsProps) {
  const handleDownload = (format: 'json' | 'pdf') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(scenario, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${scenario.name.toLowerCase().replace(/\s/g, '-')}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Scenario downloaded as JSON');
    } else {
      toast.info('PDF export feature coming soon');
    }
  };

  const handleShare = () => {
    const shareData = {
      name: scenario.name,
      coverage: scenario.coverage,
      sustainability: scenario.sustainabilityScore,
      accessibility: scenario.accessibilityScore,
      greenZones: scenario.greenZones.length,
      populationServed: scenario.populationServed
    };
    
    navigator.clipboard.writeText(JSON.stringify(shareData, null, 2));
    toast.success('Scenario data copied to clipboard');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Results Panel */}
      <div className="bg-white p-6 flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-slate-900 text-xl mb-1">{scenario.name}</h2>
              <p className="text-slate-600 text-sm">
                Generated on {scenario.timestamp.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDownload('json')}>
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Green Coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl text-slate-900">{scenario.coverage}</span>
                  <span className="text-slate-600">%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Green Zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl text-slate-900">{scenario.greenZones.length}</span>
                  <span className="text-slate-600">zones</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Sustainability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl text-slate-900">{scenario.sustainabilityScore}</span>
                  <span className="text-slate-600">/100</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Accessibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl text-slate-900">{scenario.accessibilityScore}</span>
                  <span className="text-slate-600">/100</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Population Served</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl text-slate-900">
                    {(scenario.populationServed / 1000).toFixed(0)}
                  </span>
                  <span className="text-slate-600">K</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Zone Breakdown */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Green Zone Breakdown</CardTitle>
              <CardDescription>Distribution by zone type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {scenario.greenZones.map((zone, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          zone.type === 'park'
                            ? '#22c55e'
                            : zone.type === 'garden'
                            ? '#84cc16'
                            : zone.type === 'forest'
                            ? '#15803d'
                            : '#0ea5e9'
                      }}
                    />
                    <span className="text-sm text-slate-700">{zone.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {zone.type}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {(zone.area / 1000).toFixed(1)}k m²
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Map Section at Bottom */}
          <div style={{
            marginTop: '24px',
            height: '400px',
            width: '100%',
            backgroundColor: '#ef4444',
            border: '4px solid #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapInterface
                selectedRegion={scenario.region}
                onRegionSelect={() => {}}
                activeScenario={scenario}
                hideControls={true}
              />
            </div>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Generated Layout Map</CardTitle>
              <CardDescription>Visual representation of the AI-generated green zones</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              
              {/* Map Info Below */}
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-emerald-800">Generated Layout</h4>
                    <p className="text-emerald-600 text-sm">AI-optimized green zone placement</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-800">{scenario.greenZones.length} Zones</div>
                    <div className="text-sm text-emerald-600">{scenario.coverage}% Coverage</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
