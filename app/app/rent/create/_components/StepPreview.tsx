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
  onSubmit: () => void;
  loading?: boolean;
  error?: string;
  flowStep?: string;
  flowDescription?: string;
  isPending?: boolean;
  isConfirming?: boolean;
  hash?: string;
  isCompleted?: boolean;
  listingId?: number | null;
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
  loading,
  error,
  flowStep,
  flowDescription,
  isPending,
  isConfirming,
  hash,
  isCompleted,
  listingId,
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
      <Card className="bg-white rounded-2xl shadow-sm border border-blue-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">3</span>
            </div>
            Review & Create
          </CardTitle>
          <p className="text-gray-600">
            Review your listing details before going live
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* NFT Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Hash className="w-5 h-5 text-purple-600" />
              NFT Details
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Contract Address:</span>
                <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                  {shortAddress(nftAddress as any)}
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Token ID:</span>
                <span className="text-sm font-medium font-mono">{formatTokenId(tokenId)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Domain:</span>
                {metadataLoading ? (
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
                ) : domainMetadata ? (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {domainMetadata.name}{domainMetadata.tld}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    domain{tokenId.slice(-8)}.eth
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Pricing & Terms
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatUSD(priceUSDC)}
                  </div>
                  <div className="text-sm text-gray-600">per day</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {formatUSD(depositUSDC)}
                  </div>
                  <div className="text-sm text-gray-600">security deposit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Duration & Earnings */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Rental Duration & Earnings
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {minDaysNum} - {maxDaysNum} days
                  </div>
                  <div className="text-sm text-gray-600">rental period</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatUSD(minEarning)}
                  </div>
                  <div className="text-sm text-gray-600">minimum earning</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatUSD(maxEarning)}
                  </div>
                  <div className="text-sm text-gray-600">maximum earning</div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Status */}
          {flowStep && flowStep !== 'idle' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : loading ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                )}
                Transaction Status
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Step:</span>
                  <Badge variant={isCompleted ? "default" : "secondary"} className={
                    isCompleted ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }>
                    {flowStep}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {flowDescription}
                    </div>
                    {(isPending || isConfirming) && (
                      <div className="text-xs text-blue-600 mt-1">
                        {isPending ? "Waiting for confirmation..." : "Confirming transaction..."}
                      </div>
                    )}
                  </div>
                </div>

                {hash && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Transaction:</span>
                    <a 
                      href={`https://explorer-testnet.doma.xyz/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      View on Explorer <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {isCompleted && listingId !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Listing ID:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      #{listingId}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Notice */}
          {!loading && !isCompleted && (
            <Alert className="bg-blue-50 border-blue-200">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
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
                View Listing
              </Button>
            ) : (
              <Button
                onClick={onSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 min-w-32"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {flowDescription || "Creating..."}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Create Listing
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Notice */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-green-800 mb-2">🎉 Ready to Go Live!</h3>
          <p className="text-sm text-green-700">
            Once created, your listing will be immediately available for renters to discover and rent. 
            You can manage, pause, or modify terms anytime from your dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}