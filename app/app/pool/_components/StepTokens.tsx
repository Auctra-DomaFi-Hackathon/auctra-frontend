import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Shield, Globe } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PoolConfigDraft, CollateralCollection, Erc20 } from '../types';
import { collateralCollections, erc20Tokens } from '../mock';
import { Field } from './Field';

interface StepTokensProps {
  config: PoolConfigDraft;
  onChange: (updates: Partial<PoolConfigDraft>) => void;
}

export function StepTokens({ config, onChange }: StepTokensProps) {
  const [collateralOpen, setCollateralOpen] = useState(false);
  const [loanTokenOpen, setLoanTokenOpen] = useState(false);

  const handleCollateralSelect = (collection: CollateralCollection) => {
    onChange({ collateral: collection });
    setCollateralOpen(false);
  };

  const handleLoanTokenSelect = (token: Erc20) => {
    onChange({ loanToken: token });
    setLoanTokenOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Field 
            label="Collateral Domain" 
            hint="Domain NFT collection that borrowers will use as collateral"
          />
          
          <Popover open={collateralOpen} onOpenChange={setCollateralOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={collateralOpen}
                className="w-full justify-between h-auto p-3"
              >
                {config.collateral ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{config.collateral.name}</div>
                      <div className="text-sm text-gray-500">{config.collateral.criteria}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Select collateral collection...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="p-2">
                {collateralCollections.map((collection) => (
                  <Button
                    key={collection.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleCollateralSelect(collection)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{collection.name}</div>
                        <div className="text-sm text-gray-500">{collection.criteria}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {collection.ticker}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            ~{collection.sampleCount} domains
                          </span>
                        </div>
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
            label="Loan Token" 
            hint="ERC-20 token that will be lent to borrowers"
          />
          
          <Popover open={loanTokenOpen} onOpenChange={setLoanTokenOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={loanTokenOpen}
                className="w-full justify-between h-auto p-3"
              >
                {config.loanToken ? (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{config.loanToken.name}</div>
                      <div className="text-sm text-gray-500">{config.loanToken.symbol}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500">Select loan token...</span>
                )}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <div className="p-2">
                {erc20Tokens.map((token) => (
                  <Button
                    key={token.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => handleLoanTokenSelect(token)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm text-gray-500">{token.symbol} • {token.decimals} decimals</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {config.collateral && config.loanToken && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-800">Pool Configuration</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-blue-700">
              Borrowers can use <Badge variant="outline" className="mx-1">{config.collateral.ticker}</Badge> 
              domain NFTs as collateral to borrow <Badge variant="outline" className="mx-1">{config.loanToken.symbol}</Badge> tokens.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}