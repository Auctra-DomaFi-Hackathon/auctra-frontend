"use client";

import React from "react";
import { WobbleCard } from "@/components/ui/wobble-card";
import dynamic from 'next/dynamic';

const GlobeDemo = dynamic(() => import("../ui/globe-demo").then(m => ({ default: m.GlobeDemo })), {
  ssr: false,
  loading: () => (
    <div className="w-full h-60 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-2">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="text-xs text-gray-400">Loading visualization...</div>
      </div>
    </div>
  )
});

export function Features() {
  return (
    <section className="py-20 bg-backgroundAlt">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-textPrimary mb-4 leading-tight">
            Built for the Future of{" "}
            <span className="text-gradient bg-gradient-to-r from-primary to-primaryDark bg-clip-text text-transparent">
              Domain Trading
            </span>
          </h2>
          <p className="text-xl text-textSecondary max-w-3xl mx-auto leading-relaxed">
            Advanced auction mechanics, oracle-based pricing, and seamless
            Web2-Web3 integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 h-full bg-gradient-to-br from-primary to-primaryDark min-h-[500px] lg:min-h-[300px]"
            className=""
          >
            <div className="max-w-lg">
              <h3 className="text-left text-balance text-base md:text-xl lg:text-3xl font-bold tracking-[-0.015em] text-white">
                Smart Contract Auctions
              </h3>
              <p className="mt-4 text-left text-base/6 text-white/80">
                Dutch and sealed-bid auctions powered by transparent smart
                contracts with anti-sniping protection and oracle-based reserve
                pricing.
              </p>
            </div>
            <div className="absolute -right-4 lg:-right-[20%] -bottom-10 w-80 h-80 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 p-6">
              <div className="text-white/60 text-sm mb-2">Current Price</div>
              <div className="text-white text-3xl font-bold mb-4">$4,200</div>
              <div className="space-y-2">
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Reserve</span>
                  <span>$3,800</span>
                </div>
                <div className="flex justify-between text-white/60 text-sm">
                  <span>Time Left</span>
                  <span>2h 15m</span>
                </div>
              </div>
            </div>
          </WobbleCard>

          <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-gradient-to-br from-success/90 to-success">
            <h3 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-bold tracking-[-0.015em] text-white">
              Doma Oracle Based
            </h3>
            <p className="mt-4 max-w-[26rem] text-left text-base/6 text-white/80">
              Doma Oracle powered domain valuation with 82% confidence scores based on
              traffic, SEO metrics, and market data.
            </p>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <div className="text-white font-bold text-lg">82%</div>
            </div>
          </WobbleCard>

          <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-gradient-to-r from-backgroundLight via-primary/5 to-backgroundLight min-h-[400px] border border-border relative overflow-hidden">
            <div className="max-w-2xl">
              <h3 className="text-left text-balance text-base md:text-xl lg:text-3xl font-bold tracking-[-0.015em] text-textPrimary">
                Seamless Web2 ↔ Web3 Integration
              </h3>
              <p className="mt-4 max-w-[42rem] text-left text-base/6 text-textSecondary">
                Automated domain transfers, NFT tokenization, and compliance
                with traditional registrars. Bridge the gap between traditional
                domain ownership and DeFi.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                  <div className="text-primary font-semibold text-sm">
                    Domain Registry
                  </div>
                  <div className="text-textPrimary font-bold">
                    bluechain.com
                  </div>
                </div>
                <div className="flex items-center px-4">
                  <div className="text-textSecondary">→</div>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <div className="text-primary font-semibold text-sm">
                    NFT Token
                  </div>
                  <div className="text-textPrimary font-bold">#1205</div>
                </div>
                <div className="flex items-center px-4">
                  <div className="text-textSecondary">→</div>
                </div>
                <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
                  <div className="text-success font-semibold text-sm">
                    Auction
                  </div>
                  <div className="text-textPrimary font-bold">Create & Win the auction</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-20 -right-10 w-80 h-80 lg:w-full lg:h-96 pl-[40rem] pb-[30rem]">
              <div
                className="absolute -top-10 right-1/2 translate-x-1/2 w-full h-60 sm:static sm:translate-x-0 sm:right-0 sm:top-0 sm:w-80 sm:h-80 lg:absolute lg:-top-20 lg:-right-10 lg:w-full lg:h-96 lg:pl-[40rem] lg:pb-[30rem] p-0"
              >
                <GlobeDemo />
              </div>
            </div>
          </WobbleCard>
        </div>
      </div>
    </section>
  );
}
