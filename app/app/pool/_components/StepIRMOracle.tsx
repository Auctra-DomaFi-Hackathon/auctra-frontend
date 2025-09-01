import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Activity, Gauge } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PoolConfigDraft, IRM, Oracle } from '../types';
import { irmModels, oracleProviders } from '../mock';
import { Field } from './Field';

interface StepIRMOracleProps {
  config: PoolConfigDraft;
  onChange: (updates: Partial<PoolConfigDraft>) => void;
}

export function StepIRMOracle({ config, onChange }: StepIRMOracleProps) {
  const [irmOpen, setIrmOpen] = useState(false);
  const [oracleOpen, setOracleOpen] = useState(false);

  const handleIrmSelect = (irm: IRM) => {
    onChange({ irm });
    setIrmOpen(false);
  };

  const handleOracleSelect = (oracle: Oracle) => {
    onChange({ oracle });
    setOracleOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Field 
            label="Interest Rate Model" 
            hint="Defines how interest rates adjust based on pool utilization"
          />
          
          <Popover open={irmOpen} onOpenChange={setIrmOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={irmOpen}
                className="w-full justify-between h-auto p-3"
              >
                {config.irm ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{config.irm.label}</div>
                      <div className="text-sm text-gray-500 font-mono">{config.irm.address}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Select interest rate model...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="p-2">
                {irmModels.map((irm) => (
                  <Button
                    key={irm.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleIrmSelect(irm)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium">{irm.label}</div>
                        <div className="text-sm text-gray-500 font-mono">{irm.address}</div>
                        {irm.note && (
                          <div className="text-xs text-gray-400 mt-1">{irm.note}</div>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Field 
            label="Oracle Provider" 
            hint="Provides domain NFT pricing data for liquidations"
          />
          
          <Popover open={oracleOpen} onOpenChange={setOracleOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={oracleOpen}
                className="w-full justify-between h-auto p-3"
              >
                {config.oracle ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Gauge className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{config.oracle.label}</div>
                      <div className="text-sm text-gray-500 font-mono">{config.oracle.address}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Select oracle provider...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="p-2">
                {oracleProviders.map((oracle) => (
                  <Button
                    key={oracle.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleOracleSelect(oracle)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <Gauge className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-medium">{oracle.label}</div>
                        <div className="text-sm text-gray-500 font-mono">{oracle.address}</div>
                        {oracle.source && (
                          <div className="text-xs text-gray-400 mt-1">{oracle.source}</div>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {config.irm && config.oracle && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-800">Configuration Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-center justify-between">
                <span>Interest Rate Model:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {config.irm.id}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Oracle Provider:</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {config.oracle.id}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}