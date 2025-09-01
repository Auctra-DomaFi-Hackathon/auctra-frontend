"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, ArrowRight, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Domain } from "@/types";

interface StepDomainProps {
  nftAddress: string;
  tokenId: string;
  selectedDomainId?: string;
  domains?: Domain[];
  onNftAddressChange: (value: string) => void;
  onTokenIdChange: (value: string) => void;
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
  onNftAddressChange,
  onTokenIdChange,
  onDomainSelect,
  onNext,
  loading,
  error,
}: StepDomainProps) {
  const isValid = nftAddress && tokenId;

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
            Domain NFT Details
          </CardTitle>
          <p className="text-gray-600">
            Enter your domain NFT contract address and token ID
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Make sure you own this NFT and its approved for transfer. We securely hold it in our rental vault while its being rented.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue={domains.length > 0 ? "select" : "manual"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select" disabled={domains.length === 0}>
                Select Your Domain {domains.length > 0 && `(${domains.length})`}
              </TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="space-y-4">
              {domains.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {domains.map((domain) => (
                    <Card
                      key={domain.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedDomainId === domain.id ? "ring-2 ring-blue-600" : "hover:shadow-md"
                      )}
                      onClick={() => onDomainSelect?.(domain)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{domain.name}</h4>
                            <p className="text-xs text-gray-500 font-mono">
                              {domain.tokenId && `ID: ${formatTokenId(domain.tokenId)}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              Exp: {domain.expiresAt ? new Date(domain.expiresAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <Badge variant="outline" className="gap-1">
                            <BadgeCheck className="w-4 h-4 text-blue-600" />
                            Owned
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No domains found in your wallet.</p>
                  <p className="text-sm">Use the Manual Entry tab to enter NFT details directly.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div>
                <Label htmlFor="nft-address" className="text-sm font-medium text-gray-700">
                  NFT Contract Address *
                </Label>
                <Input
                  id="nft-address"
                  placeholder="0x1234567890abcdef1234567890abcdef12345678"
                  value={nftAddress}
                  onChange={(e) => onNftAddressChange(e.target.value)}
                  className="mt-1 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The smart contract address of your domain NFT
                </p>
              </div>

              <div>
                <Label htmlFor="token-id" className="text-sm font-medium text-gray-700">
                  Token ID *
                </Label>
                <Input
                  id="token-id"
                  type="number"
                  placeholder="123"
                  value={tokenId}
                  onChange={(e) => onTokenIdChange(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The unique identifier of your specific domain NFT
                </p>
              </div>
            </TabsContent>
          </Tabs>

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

      {/* Help Section */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-2">Need Help?</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Find your NFT contract address on your wallet or NFT marketplace</p>
            <p>• Token ID is usually shown in the NFT details or URL</p>
            <p>• Common domain NFT contracts: ENS (.eth), Unstoppable Domains (.crypto, .nft)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}