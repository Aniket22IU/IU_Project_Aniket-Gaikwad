import { useState } from 'react';
import { Scenario } from '../App';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ComparisonViewProps {
  scenarios: Scenario[];
}

export function ComparisonView({ scenarios }: ComparisonViewProps) {
  const [scenario1Id, setScenario1Id] = useState(scenarios[0]?.id || '');
  const [scenario2Id, setScenario2Id] = useState(scenarios[1]?.id || '');

  const scenario1 = scenarios.find(s => s.id === scenario1Id);
  const scenario2 = scenarios.find(s => s.id === scenario2Id);

  const getMetricsData = () => {
    if (!scenario1 || !scenario2) return [];
    
    return [
      {
        metric: 'Coverage',
        [scenario1.name]: scenario1.coverage,
        [scenario2.name]: scenario2.coverage,
      },
      {
        metric: 'Sustainability',
        [scenario1.name]: scenario1.sustainabilityScore,
        [scenario2.name]: scenario2.sustainabilityScore,
      },
      {
        metric: 'Accessibility',
        [scenario1.name]: scenario1.accessibilityScore,
        [scenario2.name]: scenario2.accessibilityScore,
      },
      {
        metric: 'Green Zones',
        [scenario1.name]: scenario1.greenZones.length * 10,
        [scenario2.name]: scenario2.greenZones.length * 10,
      }
    ];
  };

  const getRadarData = () => {
    if (!scenario1 || !scenario2) return [];
    
    return [
      {
        metric: 'Coverage',
        [scenario1.name]: scenario1.coverage,
        [scenario2.name]: scenario2.coverage,
      },
      {
        metric: 'Sustainability',
        [scenario1.name]: scenario1.sustainabilityScore,
        [scenario2.name]: scenario2.sustainabilityScore,
      },
      {
        metric: 'Accessibility',
        [scenario1.name]: scenario1.accessibilityScore,
        [scenario2.name]: scenario2.accessibilityScore,
      }
    ];
  };

  const getZoneTypeComparison = () => {
    if (!scenario1 || !scenario2) return [];
    
    const types = ['park', 'garden', 'forest', 'wetland'];
    return types.map(type => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      [scenario1.name]: scenario1.greenZones.filter(z => z.type === type).length,
      [scenario2.name]: scenario2.greenZones.filter(z => z.type === type).length,
    }));
  };

  if (scenarios.length < 2) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600">Generate at least 2 scenarios to compare</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Scenarios to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Scenario 1</label>
                <Select value={scenario1Id} onValueChange={setScenario1Id}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map(s => (
                      <SelectItem key={s.id} value={s.id} disabled={s.id === scenario2Id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Scenario 2</label>
                <Select value={scenario2Id} onValueChange={setScenario2Id}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map(s => (
                      <SelectItem key={s.id} value={s.id} disabled={s.id === scenario1Id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {scenario1 && scenario2 && (
          <>
            {/* Side by Side Overview */}
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{scenario1.name}</CardTitle>
                  <p className="text-sm text-slate-500">{scenario1.timestamp.toLocaleString()}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Coverage</p>
                      <p className="text-slate-900">{scenario1.coverage}%</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Green Zones</p>
                      <p className="text-slate-900">{scenario1.greenZones.length}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Sustainability</span>
                      <Badge>{scenario1.sustainabilityScore}/100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Accessibility</span>
                      <Badge>{scenario1.accessibilityScore}/100</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {scenario1.greenZones.map((zone, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {zone.type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{scenario2.name}</CardTitle>
                  <p className="text-sm text-slate-500">{scenario2.timestamp.toLocaleString()}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Coverage</p>
                      <p className="text-slate-900">{scenario2.coverage}%</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-600 mb-1">Green Zones</p>
                      <p className="text-slate-900">{scenario2.greenZones.length}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Sustainability</span>
                      <Badge>{scenario2.sustainabilityScore}/100</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Accessibility</span>
                      <Badge>{scenario2.accessibilityScore}/100</Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {scenario2.greenZones.map((zone, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {zone.type}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Metrics Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getMetricsData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={scenario1.name} fill="#10b981" />
                      <Bar dataKey={scenario2.name} fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getRadarData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name={scenario1.name} dataKey={scenario1.name} stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                      <Radar name={scenario2.name} dataKey={scenario2.name} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Zone Type Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Green Zone Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getZoneTypeComparison()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey={scenario1.name} fill="#10b981" />
                    <Bar dataKey={scenario2.name} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
