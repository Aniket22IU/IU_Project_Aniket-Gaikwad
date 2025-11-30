import { MapInterface } from '../MapInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { TerrainData } from '../../App';

interface StepSelectAreaProps {
  selectedRegion: google.maps.LatLngLiteral[] | null;
  regionName: string;
  onRegionSelect: (region: google.maps.LatLngLiteral[]) => void;
  onRegionNameChange: (name: string) => void;
  onTerrainDataFetch: (data: TerrainData) => void;
}

export function StepSelectArea({
  selectedRegion,
  regionName,
  onRegionSelect,
  onRegionNameChange,
  onTerrainDataFetch
}: StepSelectAreaProps) {
  const handleRegionSelect = (region: google.maps.LatLngLiteral[]) => {
    onRegionSelect(region);
    
    // Mock terrain data fetch
    const mockTerrainData: TerrainData = {
      elevation: Math.floor(Math.random() * 500),
      slope: Math.floor(Math.random() * 30),
      soilType: ['Clay', 'Sand', 'Loam', 'Silt'][Math.floor(Math.random() * 4)],
      waterPresence: Math.random() > 0.5
    };
    onTerrainDataFetch(mockTerrainData);
  };

  return (
    <div className="h-full flex">
      {/* Map */}
      <div className="flex-1">
        <MapInterface
          selectedRegion={selectedRegion}
          onRegionSelect={handleRegionSelect}
          activeScenario={null}
        />
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-white border-l border-slate-200 p-6 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Select Analysis Region</CardTitle>
            <CardDescription>
              Choose the urban area you want to analyze for green zone optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="region-name">Project Name</Label>
              <Input
                id="region-name"
                placeholder="e.g., Downtown Manhattan Green Zones"
                value={regionName}
                onChange={(e) => onRegionNameChange(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Give your project a descriptive name
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm text-slate-900 mb-3">Instructions</h3>
              <ol className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="text-emerald-600">1.</span>
                  <span>Click "Select Region" on the map</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">2.</span>
                  <span>Click multiple points to draw a polygon around your area</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">3.</span>
                  <span>Click "Finish Drawing" when complete (minimum 3 points)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600">4.</span>
                  <span>Terrain data will be automatically fetched</span>
                </li>
              </ol>
            </div>

            {selectedRegion && (
              <div className="pt-4 border-t border-slate-200">
                <div className="bg-emerald-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                    <span className="text-sm text-emerald-800">Region Selected</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    {selectedRegion.length} boundary points defined
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
