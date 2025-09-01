import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield } from 'lucide-react';
import { PoolConfigDraft, RiskPresetKey } from '../types';
import { riskPresets } from '../mock';
import { Field } from './Field';

interface StepRiskProps {
  config: PoolConfigDraft;
  onChange: (updates: Partial<PoolConfigDraft>) => void;
}

export function StepRisk({ config, onChange }: StepRiskProps) {
  const ltv = config.ltv || 50;
  const lth = config.lth || 70;

  const handlePresetSelect = (presetKey: RiskPresetKey) => {
    const preset = riskPresets[presetKey];
    onChange({ ltv: preset.ltv, lth: preset.lth });
  };

  const handleLtvChange = (value: number[]) => {
    onChange({ ltv: value[0] });
  };

  const handleLthChange = (value: number[]) => {
    onChange({ lth: value[0] });
  };

  const getCapitalEfficiency = (ltv: number): string => {
    if (ltv < 55) return 'Low';
    if (ltv < 70) return 'Medium';
    return 'High';
  };

  const isValidRisk = lth > ltv;

  return (
    <div className="space-y-6">
      <div>
        <Field 
          label="Risk Presets" 
          hint="Quick configuration templates for common risk profiles"
        />
        
        <div className="flex flex-wrap gap-2">
          {(Object.keys(riskPresets) as RiskPresetKey[]).map((key) => {
            const preset = riskPresets[key];
            const isSelected = ltv === preset.ltv && lth === preset.lth;
            
            return (
              <Button
                key={key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetSelect(key)}
                className={isSelected ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {preset.label}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {preset.ltv}%/{preset.lth}%
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Field 
            label={`Loan-to-Value (LTV): ${ltv}%`}
            hint="Maximum % of collateral value that can be borrowed"
          />
          
          <div className="px-3">
            <Slider
              value={[ltv]}
              onValueChange={handleLtvChange}
              max={95}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>95%</span>
            </div>
          </div>
        </div>

        <div>
          <Field 
            label={`Liquidation Threshold (LTH): ${lth}%`}
            hint="Collateral value % below which liquidation occurs"
          />
          
          <div className="px-3">
            <Slider
              value={[lth]}
              onValueChange={handleLthChange}
              max={98}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1%</span>
              <span>98%</span>
            </div>
          </div>
        </div>
      </div>

      {!isValidRisk && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Liquidation threshold must be higher than LTV ratio.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-800 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Impact & Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700 mb-1">Borrowing Capacity</div>
              <div className="text-gray-600">{ltv}% of collateral value</div>
            </div>
            
            <div>
              <div className="font-medium text-gray-700 mb-1">Capital Efficiency</div>
              <Badge 
                variant={getCapitalEfficiency(ltv) === 'High' ? 'default' : 'secondary'}
                className={getCapitalEfficiency(ltv) === 'High' ? 'bg-green-600' : ''}
              >
                {getCapitalEfficiency(ltv)}
              </Badge>
            </div>
            
            <div>
              <div className="font-medium text-gray-700 mb-1">Liquidation Buffer</div>
              <div className="text-gray-600">{Math.max(0, lth - ltv)}% safety margin</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="font-medium text-gray-700 mb-2">Protocol Safety</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  lth - ltv >= 20 ? 'bg-green-500' : 
                  lth - ltv >= 10 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, (lth - ltv) * 3))}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {lth - ltv >= 20 ? 'Conservative' : 
               lth - ltv >= 10 ? 'Moderate' : 'Aggressive'} risk level
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}