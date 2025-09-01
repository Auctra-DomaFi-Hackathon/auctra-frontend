'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Stepper } from './_components/Stepper';
import { StepTokens } from './_components/StepTokens';
import { StepIRMOracle } from './_components/StepIRMOracle';
import { StepRisk } from './_components/StepRisk';
import { ReviewDialog } from './_components/ReviewDialog';
import { LoadingSkeleton } from './_components/LoadingSkeleton';
import { PoolConfigDraft, PoolConfigFinal } from './types';

const STEPS = [
  { label: 'Collateral Domain & Loan Token Selection', description: 'Choose collateral and loan tokens' },
  { label: 'IRM & Oracle', description: 'Select interest rate model and oracle' },
  { label: 'Risk Parameters', description: 'Configure LTV and liquidation threshold' },
];

export default function CreatePoolPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<PoolConfigDraft>({});
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!config.collateral && !!config.loanToken;
      case 1:
        return !!config.irm && !!config.oracle;
      case 2:
        return (
          typeof config.ltv === 'number' &&
          typeof config.lth === 'number' &&
          config.ltv > 0 &&
          config.lth > config.ltv &&
          config.lth <= 98
        );
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (canProceed(currentStep) && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreatePool = () => {
    if (canProceed(2)) {
      setShowReviewDialog(true);
    }
  };

  const handleConfirmPool = () => {
    const final: PoolConfigFinal = {
      collateral: config.collateral!,
      loanToken: config.loanToken!,
      irm: config.irm!,
      oracle: config.oracle!,
      ltv: config.ltv!,
      lth: config.lth!,
      createdAt: new Date().toISOString(),
      poolSlug: `${config.collateral!.ticker.toLowerCase()}-${config.loanToken!.symbol.toLowerCase()}-${config.irm!.id}-${config.oracle!.id}-${config.ltv}-${config.lth}`,
    };

    console.log('Pool Configuration:', final);
    setShowReviewDialog(false);
    
    // Mock toast - you can replace with actual toast implementation
    alert('Pool drafted (mock)');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepTokens
            config={config}
            onChange={(updates) => setConfig({ ...config, ...updates })}
          />
        );
      case 1:
        return (
          <StepIRMOracle
            config={config}
            onChange={(updates) => setConfig({ ...config, ...updates })}
          />
        );
      case 2:
        return (
          <StepRisk
            config={config}
            onChange={(updates) => setConfig({ ...config, ...updates })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Pool with your Premium Domain</h1>
        <p className="text-gray-600">Set up a new lending pool with domain NFT collateral</p>
      </div>

      <Stepper steps={STEPS} currentStep={currentStep} />

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{STEPS[currentStep].label}</CardTitle>
          <p className="text-sm text-gray-600">{STEPS[currentStep].description}</p>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed(currentStep)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCreatePool}
            disabled={!canProceed(currentStep)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create Pool
          </Button>
        )}
      </div>

      <ReviewDialog
        open={showReviewDialog}
        onOpenChange={setShowReviewDialog}
        config={config}
        onConfirm={handleConfirmPool}
      />
    </div>
  );
}