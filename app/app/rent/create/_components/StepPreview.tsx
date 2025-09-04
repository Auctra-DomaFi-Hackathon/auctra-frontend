"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Check, Shield, Clock, DollarSign, Hash, Loader2, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { formatUSD, shortAddress, parseUSDCInput } from "@/lib/rental/format";
import { useState, useEffect } from "react";
import { apolloClient } from "@/lib/graphql/client";
import { GET_NAME_FROM_TOKEN_QUERY } from "@/lib/graphql/queries";
import type { NameFromTokenResponse, NameFromTokenVariables, NFTMetadata } from "@/lib/graphql/types";

interface StepPreviewProps {
  nftAddress: string;
  tokenId: string;
  pricePerDay: string;
  securityDeposit: string;
  minDays: string;
  maxDays: string;
  onBack: () => void;
  onSubmit: () => void; // Step 1: Approve NFT
  onCreateRental?: () => void; // Step 2: Create Rental
  onSetTerms?: () => void; // Step 3: Set Terms
  loading?: boolean;
  error?: string;
  flowStep?: string;
  flowDescription?: string;
  isPending?: boolean;
  isConfirming?: boolean;
  hash?: string;
  isCompleted?: boolean;
  listingId?: number | null;
  getCurrentStepNumber?: () => number;
  canExecuteStep?: (step: number) => boolean;
}

export default function StepPreview({
  nftAddress,
  tokenId,
  pricePerDay,
  securityDeposit,
  minDays,
  maxDays,
  onBack,
  onSubmit,
  onCreateRental,
  onSetTerms,
  loading,
  error,
  flowStep,
  flowDescription,
  isPending,
  isConfirming,
  hash,
  isCompleted,
  listingId,
  getCurrentStepNumber,
  canExecuteStep,
}: StepPreviewProps) {
  const [domainMetadata, setDomainMetadata] = useState<NFTMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const priceUSDC = parseUSDCInput(pricePerDay);
  const depositUSDC = parseUSDCInput(securityDeposit);
  const minDaysNum = parseInt(minDays);
  const maxDaysNum = parseInt(maxDays);

  // Calculate potential earnings
  const minEarning = priceUSDC * BigInt(minDaysNum);
  const maxEarning = priceUSDC * BigInt(maxDaysNum);

  // Get current step info
  const currentStepNumber = getCurrentStepNumber ? getCurrentStepNumber() : 0;
  
  // Transaction step data
  const steps = [
    {
      number: 1,
      title: "Approve NFT",
      description: "Allow the rental vault to manage your NFT",
      action: onSubmit,
      icon: Shield,
    },
    {
      number: 2, 
      title: "Create Rental",
      description: "Deposit your NFT to create the listing",
      action: onCreateRental,
      icon: Hash,
    },
    {
      number: 3,
      title: "Set Terms",
      description: "Configure pricing and rental conditions",
      action: onSetTerms,
      icon: DollarSign,
    },
  ];

  // Function to fetch NFT metadata from tokenId using Doma API
  const fetchNFTMetadata = async (tokenId: string): Promise<NFTMetadata> => {
    try {
      const { data } = await apolloClient.query<NameFromTokenResponse, NameFromTokenVariables>({
        query: GET_NAME_FROM_TOKEN_QUERY,
        variables: { tokenId },
        errorPolicy: 'all'
      });

      const name = data?.nameStatistics?.name;
      if (name) {
        // Split domain name to get SLD and TLD
        const [sld, tld] = name.split('.');
        return {
          name: sld || name,
          tld: tld ? `.${tld}` : '.eth',
          description: `Domain: ${name}`
        };
      } else {
        // Fallback if name not found
        return {
          name: `Domain-${tokenId.slice(-8)}`,
          tld: '.eth',
          description: `NFT Domain with token ID: ${tokenId}`
        };
      }
    } catch (error) {
      console.error('Failed to fetch NFT metadata from Doma API:', error);
      return {
        name: `Unknown-${tokenId.slice(-8)}`,
        tld: '.eth',
        description: `Failed to fetch domain info`
      };
    }
  };

  // Fetch metadata when tokenId changes
  useEffect(() => {
    if (tokenId) {
      setMetadataLoading(true);
      fetchNFTMetadata(tokenId).then((metadata) => {
        setDomainMetadata(metadata);
        setMetadataLoading(false);
      });
    }
  }, [tokenId]);

  // Format token ID for display
  const formatTokenId = (tokenId: string) => {
    if (!tokenId || tokenId.length <= 20) return tokenId;
    return `${tokenId.slice(0, 10)}...${tokenId.slice(-10)}`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-blue-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">3</span>
            </div>
            Review & Create
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Review your listing details before going live
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* NFT Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              NFT Details
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Contract Address:</span>
                <code className="text-sm font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded border dark:border-gray-600 dark:text-gray-300">
                  {shortAddress(nftAddress as any)}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Token ID:</span>
                <span className="text-sm font-medium font-mono dark:text-gray-300">{formatTokenId(tokenId)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Domain:</span>
                {metadataLoading ? (
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded animate-pulse w-32"></div>
                ) : domainMetadata ? (
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    {domainMetadata.name}{domainMetadata.tld}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600">
                    domain{tokenId.slice(-8)}.eth
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              Pricing & Terms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {formatUSD(priceUSDC)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">per day</div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {formatUSD(depositUSDC)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">security deposit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Duration & Earnings */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Rental Duration & Earnings
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-4 border dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {minDaysNum} - {maxDaysNum} days
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">rental period</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatUSD(minEarning)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">minimum earning</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatUSD(maxEarning)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">maximum earning</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Steps */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Create Listing Steps
            </h3>
            
            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCurrentStep = currentStepNumber === step.number;
                const isCompleted = currentStepNumber > step.number;
                const canExecute = canExecuteStep ? canExecuteStep(step.number) : false;
                const isExecuting = isCurrentStep && (isPending || isConfirming);
                
                return (
                  <div key={step.number} className={`border rounded-lg p-4 transition-all ${
                    isCurrentStep 
                      ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                      : isCompleted
                      ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-100 dark:bg-green-900/40' 
                            : isCurrentStep 
                            ? 'bg-blue-100 dark:bg-blue-900/40' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {isCompleted ? (
                            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : isExecuting ? (
                            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                          ) : (
                            <Icon className={`w-5 h-5 ${
                              isCurrentStep 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`} />
                          )}
                        </div>
                        <div>
                          <div className={`font-medium ${
                            isCompleted 
                              ? 'text-green-700 dark:text-green-400' 
                              : isCurrentStep 
                              ? 'text-blue-700 dark:text-blue-400' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            Step {step.number}: {step.title}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {step.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isCompleted && (
                          <Badge variant="outline" className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                            Completed
                          </Badge>
                        )}
                        
                        {canExecute && step.action && (
                          <Button
                            onClick={step.action}
                            disabled={isExecuting}
                            size="sm"
                            className={`min-w-24 ${
                              step.number === 1 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : step.number === 2 
                                ? 'bg-purple-600 hover:bg-purple-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {isExecuting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              step.title
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Transaction details for current executing step */}
                    {isCurrentStep && hash && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Transaction:</span>
                          <a 
                            href={`https://explorer-testnet.doma.xyz/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                          >
                            View on Explorer <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Success message */}
            {isCompleted && listingId !== null && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-400">Listing Created Successfully!</span>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Your rental listing #{listingId} is now live and available for rent.
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          {!loading && !isCompleted && (
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                <strong>Your NFT will be securely held</strong> in our smart contract vault during rentals. 
                You maintain ownership and can unlist anytime when not actively rented.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} disabled={loading || isCompleted}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {isCompleted ? (
              <Button 
                onClick={() => window.location.href = "/app/rent/manage"}
                className="bg-blue-600 hover:bg-blue-700 min-w-32"
              >
                <Check className="w-4 h-4 mr-2" />
                View My Listings
              </Button>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Use the step buttons above to create your listing
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Process Notice */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">📋 How It Works</h3>
          <div className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">1.</span>
              <span><strong>Approve NFT:</strong> Give permission to the rental vault contract</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-600 dark:text-purple-400 font-semibold">2.</span>
              <span><strong>Create Rental:</strong> Deposit your NFT to create the listing</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 dark:text-green-400 font-semibold">3.</span>
              <span><strong>Set Terms:</strong> Configure pricing and make your listing live</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}