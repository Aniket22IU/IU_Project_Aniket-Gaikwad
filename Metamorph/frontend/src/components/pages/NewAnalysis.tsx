import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { StepSelectArea } from '../steps/StepSelectArea';
import { StepImportData } from '../steps/StepImportData';
import { StepRunAnalysis } from '../steps/StepRunAnalysis';
import { StepViewResults } from '../steps/StepViewResults';
import { StepCollaborate } from '../steps/StepCollaborate';
import { Scenario, TerrainData, Project } from '../../App';

interface NewAnalysisProps {
  onSaveProject: (scenario: Scenario, regionName: string) => void;
  onCancel: () => void;
  selectedProject?: Project | null;
  onProjectUpdate?: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const steps = [
  { id: 1, label: 'Select Area' },
  { id: 2, label: 'Import Data' },
  { id: 3, label: 'Run AI Analysis' },
  { id: 4, label: 'View Results' },
  { id: 5, label: 'Save' },
];

export function NewAnalysis({ onSaveProject, onCancel, selectedProject, onProjectUpdate }: NewAnalysisProps) {
  const [currentStep, setCurrentStep] = useState<Step>(selectedProject ? 5 : 1);
  const [selectedRegion, setSelectedRegion] = useState<google.maps.LatLngLiteral[] | null>(
    selectedProject?.scenario.region || null
  );
  const [regionName, setRegionName] = useState(selectedProject?.region || '');
  const [terrainData, setTerrainData] = useState<TerrainData | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(selectedProject?.scenario || null);

  const canProceed = () => {
    if (currentStep === 1) return selectedRegion !== null && regionName.length > 0;
    if (currentStep === 2) return terrainData !== null;
    if (currentStep === 3) return scenario !== null;
    if (currentStep === 4) return scenario !== null;
    return true;
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSave = () => {
    if (scenario) {
      onSaveProject(scenario, regionName);
      onCancel();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Progress Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-900 text-xl">New Urban Planning Analysis</h2>
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Step Progress */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStep > step.id
                        ? 'bg-emerald-600 text-white'
                        : currentStep === step.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      currentStep >= step.id ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="h-full">
          {currentStep === 1 && (
            <StepSelectArea
              selectedRegion={selectedRegion}
              regionName={regionName}
              onRegionSelect={setSelectedRegion}
              onRegionNameChange={setRegionName}
              onTerrainDataFetch={setTerrainData}
            />
          )}
          
          {currentStep === 2 && (
            <StepImportData
              terrainData={terrainData}
              selectedRegion={selectedRegion}
            />
          )}
          
          {currentStep === 3 && (
            <StepRunAnalysis
              selectedRegion={selectedRegion}
              terrainData={terrainData}
              onScenarioGenerated={setScenario}
            />
          )}
          
          {currentStep === 4 && scenario && (
            <StepViewResults
              scenario={scenario}
              onScenarioUpdate={setScenario}
            />
          )}
          
          {currentStep === 5 && scenario && (
            <StepCollaborate
              scenario={scenario}
              onScenarioUpdate={setScenario}
              projectId={selectedProject?.id}
              onProjectUpdate={onProjectUpdate}
            />
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-slate-200 px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-slate-600">
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < 5 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={!scenario}>
              <Check className="w-4 h-4 mr-2" />
              Save Project
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
