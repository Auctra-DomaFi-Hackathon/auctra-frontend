"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, ArrowRight, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Domain } from "@/types";

interface StepDomainProps {
  nftAddress: string;
  tokenId: string;
  selectedDomainId?: string;
  domains?: Domain[];
  onDomainSelect?: (domain: Domain) => void;
  onNext: () => void;
  loading?: boolean;
  error?: string;
}

export default function StepDomain({
  nftAddress,
  tokenId,
  selectedDomainId,
  domains = [],
  onDomainSelect,
  onNext,
  loading,
  error,
}: StepDomainProps) {
  const isValid = selectedDomainId && nftAddress && tokenId;

  const formatTokenId = (tokenId: string) => {
    if (!tokenId || tokenId.length <= 12) return tokenId;
    return `${tokenId.slice(0, 6)}...${tokenId.slice(-6)}`;
  };


  return (
    <div className="space-y-6">
      <Card className="bg-white rounded-2xl shadow-sm border border-blue-100">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">1</span>
            </div>
            Select Your Domain
          </CardTitle>
          <p className="text-gray-600">
            Choose a domain NFT from your wallet to list for rental
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Your NFT will be securely held in our rental vault while listed. You maintain ownership and can unlist anytime when not actively rented.
            </AlertDescription>
          </Alert>

          {domains.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                Your Domains ({domains.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domains.map((domain) => (
                  <Card
                    key={domain.id}
                    className={cn(
                      "cursor-pointer transition-all border-2",
                      selectedDomainId === domain.id 
                        ? "ring-2 ring-blue-600 border-blue-600 bg-blue-50" 
                        : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                    )}
                    onClick={() => onDomainSelect?.(domain)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{domain.name}</h4>
                          <p className="text-xs text-gray-500 font-mono mt-1">
                            {domain.tokenId && `Token ID: ${formatTokenId(domain.tokenId)}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Expires: {domain.expiresAt ? new Date(domain.expiresAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant="outline" className="gap-1">
                            <BadgeCheck className="w-4 h-4 text-blue-600" />
                            Owned
                          </Badge>
                          {selectedDomainId === domain.id && (
                            <Badge className="bg-blue-600 text-white">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-400 mb-4">
                <BadgeCheck className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Domains Found</h3>
              <p className="text-gray-500 mb-4">
                We couldn&apos;t find any domain NFTs in your connected wallet.
              </p>
              <p className="text-sm text-gray-400">
                Make sure your wallet is connected and contains domain NFTs.
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between pt-4">
            <div></div>
            <Button
              onClick={onNext}
              disabled={!isValid || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Validating..." : "Next Step"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            How It Works
          </h3>
          <div className="text-sm text-green-700 space-y-1">
            <p>• Select a domain from your wallet that you want to rent out</p>
            <p>• Set your rental terms (price, duration, security deposit)</p>
            <p>• Your domain will be safely stored in our smart contract vault</p>
            <p>• Earn passive income when renters use your domain</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}