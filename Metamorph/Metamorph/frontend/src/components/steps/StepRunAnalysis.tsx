import { useState } from 'react';
import { Play, Loader2, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Scenario, TerrainData, GreenZone } from '../../App';

interface StepRunAnalysisProps {
  selectedRegion: google.maps.LatLngLiteral[] | null;
  terrainData: TerrainData | null;
  onScenarioGenerated: (scenario: Scenario) => void;
}

export function StepRunAnalysis({
  selectedRegion,
  terrainData,
  onScenarioGenerated
}: StepRunAnalysisProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [greenSpaceTarget, setGreenSpaceTarget] = useState(25);
  const [priorityType, setPriorityType] = useState('balanced');
  const [progress, setProgress] = useState(0);

  const runAnalysis = async () => {
    if (!selectedRegion) return;

    setIsRunning(true);
    setProgress(0);

    // Simulate AI processing with progress
    const steps = [
      { progress: 20, message: 'Analyzing terrain data...' },
      { progress: 40, message: 'Building graph network...' },
      { progress: 60, message: 'Running GNN optimization...' },
      { progress: 80, message: 'Generating green zone layouts...' },
      { progress: 100, message: 'Finalizing scenario...' }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(step.progress);
    }

    // Generate mock scenario
    const greenZones = generateMockGreenZones(selectedRegion, greenSpaceTarget);
    
    const scenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: `AI Generated Scenario ${new Date().toLocaleDateString()}`,
      timestamp: new Date(),
      region: selectedRegion,
      greenZones,
      coverage: greenSpaceTarget,
      sustainabilityScore: Math.floor(Math.random() * 30) + 70,
      accessibilityScore: Math.floor(Math.random() * 25) + 75,
      populationServed: Math.floor(Math.random() * 50000) + 100000,
      status: 'draft',
      comments: []
    };

    onScenarioGenerated(scenario);
    setIsRunning(false);
  };

  const generateMockGreenZones = (
    region: google.maps.LatLngLiteral[],
    targetCoverage: number
  ): GreenZone[] => {
    const zones: GreenZone[] = [];
    const zoneTypes: GreenZone['type'][] = ['park', 'garden', 'forest', 'wetland'];
    const zoneNames = {
      park: ['Central Park', 'Community Park', 'Riverside Park', 'Heritage Park'],
      garden: ['Botanical Garden', 'Rose Garden', 'Herb Garden', 'Sculpture Garden'],
      forest: ['Urban Forest', 'Nature Reserve', 'Wildlife Corridor', 'Green Belt'],
      wetland: ['Wetland Preserve', 'Marsh Area', 'Pond Ecosystem', 'Water Garden']
    };
    const numZones = Math.max(3, Math.floor((targetCoverage / 8) + 1));
    
    // Calculate region bounds
    const minLat = Math.min(...region.map(p => p.lat));
    const maxLat = Math.max(...region.map(p => p.lat));
    const minLng = Math.min(...region.map(p => p.lng));
    const maxLng = Math.max(...region.map(p => p.lng));
    
    for (let i = 0; i < numZones; i++) {
      const zoneType = zoneTypes[i % zoneTypes.length];
      const zoneName = zoneNames[zoneType][Math.floor(Math.random() * zoneNames[zoneType].length)];
      
      // Distribute zones across the region
      const latRange = maxLat - minLat;
      const lngRange = maxLng - minLng;
      const centerLat = minLat + (latRange * (0.2 + (i * 0.6) / numZones));
      const centerLng = minLng + (lngRange * (0.2 + ((i * 0.7) % 1)));
      
      // Create zone size based on type
      const sizeMultiplier = {
        park: 0.003,
        garden: 0.002,
        forest: 0.004,
        wetland: 0.0025
      };
      const size = sizeMultiplier[zoneType];
      
      zones.push({
        id: `zone-${i}`,
        name: zoneName,
        area: Math.floor(Math.random() * 30000) + 15000,
        type: zoneType,
        coordinates: [
          { lat: centerLat - size, lng: centerLng - size },
          { lat: centerLat + size, lng: centerLng - size },
          { lat: centerLat + size, lng: centerLng + size },
          { lat: centerLat - size, lng: centerLng + size }
        ]
      });
    }
    
    return zones;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-slate-900 text-2xl mb-2">Run AI Analysis</h2>
        <p className="text-slate-600">
          Let our Graph Neural Network generate optimal green zone layouts.
        </p>
      </div>

      {!isRunning ? (
        <>


          {/* Terrain Summary */}
          {terrainData && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Input Data Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Elevation</p>
                    <p className="text-slate-900">{terrainData.elevation}m</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Slope</p>
                    <p className="text-slate-900">{terrainData.slope}°</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Soil Type</p>
                    <p className="text-slate-900">{terrainData.soilType}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Water</p>
                    <p className="text-slate-900">{terrainData.waterPresence ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={runAnalysis} size="lg" className="w-full gap-2">
            <Play className="w-5 h-5" />
            Run AI Layout Generation
          </Button>
        </>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-6" />
              <h3 className="text-slate-900 text-xl mb-2">Generating Optimal Layout...</h3>
              <p className="text-slate-600 mb-6">
                Our Graph Neural Network is analyzing your region
              </p>
              
              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600">{progress}% Complete</p>
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-slate-600">
                  The AI is considering terrain characteristics, population density, existing infrastructure, and your optimization priorities...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
