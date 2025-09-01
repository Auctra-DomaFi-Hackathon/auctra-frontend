import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Globe, Shield, Activity, Gauge } from 'lucide-react';
import { PoolConfigDraft } from '../types';

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: PoolConfigDraft;
  onConfirm: () => void;
}

export function ReviewDialog({ open, onOpenChange, config, onConfirm }: ReviewDialogProps) {
  if (!config.collateral || !config.loanToken || !config.irm || !config.oracle) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Pool Configuration</DialogTitle>
          <DialogDescription>
            Please review your pool settings before creating the lending pool.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Collateral Domain</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Globe className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm">{config.collateral.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {config.collateral.ticker}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Loan Token</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm">{config.loanToken.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {config.loanToken.symbol}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Interest Rate Model</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <Activity className="w-3 h-3 text-purple-600" />
                </div>
                <span className="text-sm font-mono">{config.irm.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Oracle Provider</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <Gauge className="w-3 h-3 text-orange-600" />
                </div>
                <span className="text-sm font-mono">{config.oracle.id}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Loan-to-Value (LTV)</span>
              <Badge variant="outline" className="font-medium">
                {config.ltv}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Liquidation Threshold</span>
              <Badge variant="outline" className="font-medium">
                {config.lth}%
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Liquidation Buffer</span>
              <Badge 
                variant="secondary"
                className={`font-medium ${
                  (config.lth! - config.ltv!) >= 20 ? 'bg-green-100 text-green-800' :
                  (config.lth! - config.ltv!) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}
              >
                {config.lth! - config.ltv!}%
              </Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Back to Edit
          </Button>
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
            Create Pool
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}