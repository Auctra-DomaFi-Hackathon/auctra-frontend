"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, TrendingUp, DollarSign } from "lucide-react";
import { Countdown } from "@/features/auction/Countdown";
import { BidDrawer } from "@/features/auction/BidDrawer";
import { auctionsService, domainsService, bidsService } from "@/lib/services";
import {
  formatCurrency,
  getCurrentDutchPrice,
  getAuctionStatus,
} from "@/lib/utils/index";
import type { Auction, Domain, Bid } from "@/types";

export default function AuctionPage() {
  const params = useParams();
  const auctionId = params.id as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuctionData = async () => {
      try {
        setLoading(true);
        const auctionData = await auctionsService.getById(auctionId);
        const domainData = await domainsService.getByName(
          auctionData.domainId.replace("d", "")
        ); // Mock mapping
        const bidsData = await bidsService.getByAuctionId(auctionId);

        setAuction(auctionData);
        setDomain(domainData);
        setBids(bidsData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (auctionId) {
      loadAuctionData();
    }
  }, [auctionId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (error || !auction || !domain) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Auction Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The auction you are looking for does not exist."}
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentPrice =
    auction.type === "dutch" ? getCurrentDutchPrice(auction) : 0;
  const auctionStatus = getAuctionStatus(auction);
  const isDutch = auction.type === "dutch";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Auction Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">{domain.name}</CardTitle>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={
                        auction.status === "active" ? "default" : "secondary"
                      }
                    >
                      {auction.type} auction • {auction.status}
                    </Badge>
                    {domain.dnsVerified && (
                      <Badge variant="outline">Verified</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    Traffic Score
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1 text-success" />
                    <span className="font-semibold text-lg">
                      {domain.trafficScore}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Current Price */}
              <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">
                    {isDutch ? "Current Price" : "Starting Price"}
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {formatCurrency(currentPrice)}
                  </div>
                  {isDutch && auction.parameters.dutch && (
                    <div className="text-sm text-muted-foreground">
                      Floor:{" "}
                      {formatCurrency(auction.parameters.dutch.floorPriceUsd)}
                    </div>
                  )}
                </div>
              </div>

              {/* Countdown */}
              {auctionStatus.isActive && auctionStatus.timeRemaining && (
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-3 p-4 border border-border rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground text-center mb-2">
                        Time Remaining
                      </div>
                      <Countdown endTime={auction.endTime} />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="text-center">
                <BidDrawer
                  auction={auction}
                  domain={domain}
                  trigger={
                    <Button
                      size="lg"
                      className="px-12 focus-ring"
                      disabled={!auctionStatus.isActive}
                    >
                      {isDutch ? "Buy Now" : "Place Bid"}
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">TLD</div>
                        <div className="font-semibold">{domain.tld}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Expires
                        </div>
                        <div className="font-semibold">
                          {new Date(domain.expiresAt ?? 0).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Renewal Cost
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(domain.renewalCostUsd ?? 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Oracle Confidence
                        </div>
                        <div className="font-semibold">
                          {Math.round((domain.oracleConfidence ?? 0) * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <h4 className="font-semibold mb-2">Fair Value Band</h4>
                      <div className="text-sm text-muted-foreground">
                        Oracle estimates this domain&apos;s fair value between{" "}
                        <span className="font-semibold text-foreground">
                          {formatCurrency(domain.fairValueBandUsd?.min ?? 0)}
                        </span>{" "}
                        and{" "}
                        <span className="font-semibold text-foreground">
                          {formatCurrency(domain.fairValueBandUsd?.max ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="p-6">
                  <div className="space-y-4">
                    {auction.activity.length > 0 ? (
                      auction.activity.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{activity.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              by {activity.actor}
                            </span>
                          </div>
                          <div className="text-right">
                            {activity.amountUsd && (
                              <div className="font-semibold">
                                {formatCurrency(activity.amountUsd)}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No activity yet
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="analytics" className="p-6">
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      Analytics coming soon...
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Oracle Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Oracle Pricing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  Reserve Price
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(domain.oracleReserveUsd ?? 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Confidence Level
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(domain.oracleConfidence ?? 0) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold">
                    {Math.round((domain.oracleConfidence ?? 0) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auction Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Auction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge variant="outline">{auction.type}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Protocol Fee
                </span>
                <span className="text-sm">
                  {auction.feesBps.protocol / 100}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Creator Fee
                </span>
                <span className="text-sm">
                  {auction.feesBps.creator / 100}%
                </span>
              </div>
              {auction.antiSnipingExtensionSec > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Anti-snipe Extension
                  </span>
                  <span className="text-sm">
                    {auction.antiSnipingExtensionSec}s
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
