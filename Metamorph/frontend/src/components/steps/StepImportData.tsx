import { Upload, MapIcon, Database, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TerrainData } from '../../App';
import { toast } from 'sonner@2.0.3';

interface StepImportDataProps {
  terrainData: TerrainData | null;
  selectedRegion: google.maps.LatLngLiteral[] | null;
}

export function StepImportData({ terrainData, selectedRegion }: StepImportDataProps) {
  const handleFileUpload = () => {
    toast.info('File upload feature coming soon');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-slate-900 text-2xl mb-2">Import & Preview Data</h2>
        <p className="text-slate-600">
          Review automatically fetched terrain data and optionally upload additional green zone information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Terrain Data */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-emerald-600" />
                <CardTitle>Terrain Data</CardTitle>
              </div>
              <Badge variant="secondary">
                <CheckCircle className="w-3 h-3 mr-1" />
                Auto-fetched
              </Badge>
            </div>
            <CardDescription>
              Automatically extracted from Google Maps satellite data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {terrainData ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Elevation</span>
                  <span className="text-slate-900">{terrainData.elevation}m</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Average Slope</span>
                  <span className="text-slate-900">{terrainData.slope}°</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Soil Type</span>
                  <span className="text-slate-900">{terrainData.soilType}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Water Presence</span>
                  <span className="text-slate-900">
                    {terrainData.waterPresence ? 'Detected' : 'None'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No terrain data available</p>
            )}
          </CardContent>
        </Card>

        {/* Upload Green Zones */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              <CardTitle>Green Zone Data (Optional)</CardTitle>
            </div>
            <CardDescription>
              Upload existing green zone maps in GeoJSON or KML format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
              <Database className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm text-slate-600 mb-4">
                Drag and drop files here, or click to browse
              </p>
              <Button variant="outline" onClick={handleFileUpload}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
              <p className="text-xs text-slate-500 mt-3">
                Supported formats: .geojson, .kml (Max 10MB)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>



      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 mb-1">
              Data automatically fetched from Google Maps
            </p>
            <p className="text-xs text-blue-700">
              Our system has extracted terrain elevation, slope analysis, and soil type data for your selected region. You can proceed to AI analysis or upload additional green zone data if available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
