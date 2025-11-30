import { Book, Database, Brain, Map, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

export function HelpDocs() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-slate-900 text-3xl mb-2">Help & Documentation</h1>
        <p className="text-slate-600">
          Learn how to use MetroMorph for AI-powered urban planning.
        </p>
      </div>

      {/* Quick Start Guide */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-emerald-600" />
            <CardTitle>Getting Started</CardTitle>
          </div>
          <CardDescription>Your first steps with MetroMorph</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="pl-4 border-l-2 border-emerald-600">
            <h3 className="text-slate-900 mb-2">1. Select Your Region</h3>
            <p className="text-sm text-slate-600">
              Use the interactive Google Maps interface to search for your city or region. Draw a polygon around the area you want to analyze.
            </p>
          </div>
          <div className="pl-4 border-l-2 border-slate-300">
            <h3 className="text-slate-900 mb-2">2. Import Terrain Data</h3>
            <p className="text-sm text-slate-600">
              Our system automatically fetches terrain data including elevation, slope, and soil type from Google Maps. You can also upload custom green zone data.
            </p>
          </div>
          <div className="pl-4 border-l-2 border-slate-300">
            <h3 className="text-slate-900 mb-2">3. Run AI Analysis</h3>
            <p className="text-sm text-slate-600">
              Configure your green space targets and optimization priorities, then let our Graph Neural Network generate optimal layouts.
            </p>
          </div>
          <div className="pl-4 border-l-2 border-slate-300">
            <h3 className="text-slate-900 mb-2">4. Review & Share</h3>
            <p className="text-sm text-slate-600">
              View AI-generated scenarios, compare metrics, collaborate with your team, and export results in multiple formats.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Accordion */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <CardTitle>Frequently Asked Questions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is a green zone?</AccordionTrigger>
              <AccordionContent>
                A green zone is an urban area designated for vegetation and ecological purposes. This includes parks, gardens, forests, wetlands, and green belts. Green zones provide environmental benefits, improve air quality, support biodiversity, and enhance quality of life for urban residents.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How do I import terrain data?</AccordionTrigger>
              <AccordionContent>
                MetroMorph automatically fetches terrain data from Google Maps when you select a region. This includes elevation maps, slope analysis, and satellite imagery. You can also manually upload additional data in GeoJSON or KML format for more detailed analysis.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>What file formats are supported?</AccordionTrigger>
              <AccordionContent>
                MetroMorph supports the following formats:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>GeoJSON (.geojson) - For geographic data and green zones</li>
                  <li>KML (.kml) - Google Earth format for spatial data</li>
                  <li>JSON (.json) - For project export/import</li>
                  <li>PDF (.pdf) - For report generation</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>How does the AI analysis work?</AccordionTrigger>
              <AccordionContent>
                MetroMorph uses a Graph Neural Network (GNN) trained on urban planning data to analyze terrain characteristics, existing infrastructure, and demographic patterns. The AI considers factors like:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Terrain elevation and slope</li>
                  <li>Existing green spaces and connectivity</li>
                  <li>Population density and accessibility</li>
                  <li>Environmental sustainability metrics</li>
                  <li>Urban development patterns</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Can I share projects with my team?</AccordionTrigger>
              <AccordionContent>
                Yes! You can share projects by exporting them as JSON files or copying the project data to your clipboard. Team members can review scenarios, add comments, and collaborate on optimizing green zone layouts. All projects are saved in your Past Projects section for easy access.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>What optimization priorities are available?</AccordionTrigger>
              <AccordionContent>
                The AI can optimize for different priorities:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Balanced</strong> - Equal weight to all factors</li>
                  <li><strong>Accessibility</strong> - Maximum population access to green zones</li>
                  <li><strong>Biodiversity</strong> - Ecological diversity and habitat preservation</li>
                  <li><strong>Sustainability</strong> - Long-term environmental impact</li>
                  <li><strong>Recreation</strong> - Public use and community spaces</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* AI Model Info */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-600" />
            <CardTitle>AI Model Information</CardTitle>
          </div>
          <CardDescription>About our Graph Neural Network</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-slate-900 mb-2">Model Architecture</h3>
            <p className="text-sm text-slate-600">
              MetroMorph uses a state-of-the-art Graph Neural Network (GNN) architecture specifically designed for spatial urban planning. The model represents urban regions as graphs where nodes are geographic cells and edges represent spatial relationships.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Model Version</p>
              <p className="text-slate-900">GNN-Urban v2.1.0</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Training Data</p>
              <p className="text-slate-900">500+ Cities Worldwide</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Accuracy</p>
              <p className="text-slate-900">94.2% Validation</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Last Updated</p>
              <p className="text-slate-900">November 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <CardTitle>Data Sources</CardTitle>
          </div>
          <CardDescription>Where our data comes from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Map className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <h3 className="text-slate-900 mb-1">Google Maps Platform</h3>
                <p className="text-sm text-slate-600">
                  Satellite imagery, elevation data, terrain analysis, and street maps.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <h3 className="text-slate-900 mb-1">Open Data Sources</h3>
                <p className="text-sm text-slate-600">
                  Municipal green space registries, urban planning datasets, and environmental databases.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <h3 className="text-slate-900 mb-1">AI-Generated Insights</h3>
                <p className="text-sm text-slate-600">
                  Machine learning models trained on historical urban development patterns and best practices.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
