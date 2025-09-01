"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, DollarSign, Calendar, Shield } from "lucide-react";
import { formatUSD } from "@/lib/rental/format";
import { parseUSDCInput } from "@/lib/rental/format";

interface StepTermsProps {
  pricePerDay: string;
  securityDeposit: string;
  minDays: string;
  maxDays: string;
  onPricePerDayChange: (value: string) => void;
  onSecurityDepositChange: (value: string) => void;
  onMinDaysChange: (value: string) => void;
  onMaxDaysChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  loading?: boolean;
  error?: string;
}

export default function StepTerms({
  pricePerDay,
  securityDeposit,
  minDays,
  maxDays,
  onPricePerDayChange,
  onSecurityDepositChange,
  onMinDaysChange,
  onMaxDaysChange,
  onBack,
  onNext,
  loading,
  error,
}: StepTermsProps) {
  const isValid = pricePerDay && securityDeposit && minDays && maxDays && 
    parseInt(minDays) > 0 && parseInt(maxDays) >= parseInt(minDays);

  // Preview calculations
  const priceUSDC = parseUSDCInput(pricePerDay);
  const depositUSDC = parseUSDCInput(securityDeposit);
  const minDaysNum = parseInt(minDays) || 0;
  const maxDaysNum = parseInt(maxDays) || 0;

  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-2xl shadow-sm border border-blue-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">2</span>
            </div>
            Rental Terms
          </CardTitle>
          <p className="text-gray-600">
            Set your pricing and rental duration limits
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Pricing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Pricing</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price-per-day" className="text-sm font-medium text-gray-700">
                  Daily Rate (USD) *
                </Label>
                <Input
                  id="price-per-day"
                  type="number"
                  step="0.01"
                  placeholder="1.50"
                  value={pricePerDay}
                  onChange={(e) => onPricePerDayChange(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How much you charge per day
                </p>
              </div>

              <div>
                <Label htmlFor="security-deposit" className="text-sm font-medium text-gray-700">
                  Security Deposit (USD) *
                </Label>
                <Input
                  id="security-deposit"
                  type="number"
                  step="0.01"
                  placeholder="5.00"
                  value={securityDeposit}
                  onChange={(e) => onSecurityDepositChange(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Refundable deposit for security
                </p>
              </div>
            </div>
          </div>

          {/* Duration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Rental Duration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-days" className="text-sm font-medium text-gray-700">
                  Minimum Days *
                </Label>
                <Input
                  id="min-days"
                  type="number"
                  min="1"
                  value={minDays}
                  onChange={(e) => onMinDaysChange(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Shortest rental period allowed
                </p>
              </div>

              <div>
                <Label htmlFor="max-days" className="text-sm font-medium text-gray-700">
                  Maximum Days *
                </Label>
                <Input
                  id="max-days"
                  type="number"
                  min="1"
                  value={maxDays}
                  onChange={(e) => onMaxDaysChange(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Longest rental period allowed
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {isValid && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Rental Preview</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Daily Rate:</span>
                  <p className="font-medium text-blue-900">{formatUSD(priceUSDC)}</p>
                </div>
                <div>
                  <span className="text-blue-600">Security Deposit:</span>
                  <p className="font-medium text-blue-900">{formatUSD(depositUSDC)}</p>
                </div>
                <div>
                  <span className="text-blue-600">Min Rental:</span>
                  <p className="font-medium text-blue-900">{minDaysNum} day{minDaysNum !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <span className="text-blue-600">Max Rental:</span>
                  <p className="font-medium text-blue-900">{maxDaysNum} day{maxDaysNum !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={onNext}
              disabled={!isValid || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Next Step"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-yellow-800 mb-2">💡 Pricing Tips</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• Research similar domains to price competitively</p>
            <p>• Higher deposits discourage misuse but may reduce interest</p>
            <p>• Flexible duration ranges attract more renters</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}