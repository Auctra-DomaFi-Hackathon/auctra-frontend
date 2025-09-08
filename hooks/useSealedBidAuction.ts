/**
 * Enhanced Sealed Bid Auction Hooks
 * Based on sealed_bid_auction_fe_integration.md
 */

import { useState } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useAccount,
} from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { CONTRACTS } from './contracts/constants';
import { DOMAIN_AUCTION_HOUSE_ABI, SEALED_BID_AUCTION_ABI } from './contracts/abis';
import {
  generateSecureNonce,
  storeBidData,
  getBidData,
  cleanupBidData,
  hasEligibilityData,
} from '@/lib/utils/sealedBid';

export interface AuctionPhase {
  phase: number;
  phaseDescription: string;
  timeRemaining: number;
  error?: string;
}

export interface AuctionStatus {
  listing: any;
  phase: number;
  timeRemaining: number;
  userCommitment: any;
  hasEligibilityData: boolean;
}

// Hook to get current phase of sealed bid auction
export function useGetCurrentPhase() {
  const publicClient = usePublicClient();

  const getCurrentPhase = async (listingId: bigint): Promise<AuctionPhase> => {
    if (!publicClient) {
      return {
        phase: -1,
        phaseDescription: 'ERROR',
        timeRemaining: 0,
        error: 'No public client available',
      };
    }

    try {
      const phase = await publicClient.readContract({
        address: CONTRACTS.SealedBidAuction as `0x${string}`,
        abi: SEALED_BID_AUCTION_ABI,
        functionName: 'getCurrentPhase',
        args: [listingId],
      }) as number;

      const phaseDescriptions = {
        0: 'NOT_STARTED',
        1: 'COMMIT',
        2: 'REVEAL',
        3: 'ENDED',
      } as const;

      return {
        phase,
        phaseDescription: phaseDescriptions[phase as keyof typeof phaseDescriptions] || 'UNKNOWN',
        timeRemaining: 0, // Contract doesn't provide time remaining directly
      };
    } catch (error) {
      console.error('Error getting current phase:', error);
      return {
        phase: -1,
        phaseDescription: 'ERROR',
        timeRemaining: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  return { getCurrentPhase };
}

// Hook to get comprehensive auction status
export function useGetAuctionStatus() {
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const getAuctionStatus = async (listingId: bigint): Promise<AuctionStatus> => {
    if (!publicClient) {
      throw new Error('No public client available');
    }

    try {
      // Get listing details
      const listing = await publicClient.readContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'listings',
        args: [listingId],
      });

      // Get current phase
      const phase = await publicClient.readContract({
        address: CONTRACTS.SealedBidAuction as `0x${string}`,
        abi: SEALED_BID_AUCTION_ABI,
        functionName: 'getCurrentPhase',
        args: [listingId],
      }) as number;

      // Get time remaining
      const timeRemaining = await publicClient.readContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'timeRemaining',
        args: [listingId],
      }) as bigint;

      // Get user's commitment (if any)
      let userCommitment = null;
      if (address) {
        try {
          userCommitment = await publicClient.readContract({
            address: CONTRACTS.SealedBidAuction as `0x${string}`,
            abi: SEALED_BID_AUCTION_ABI,
            functionName: 'getCommitment',
            args: [listingId, address],
          });
        } catch (error) {
          // No commitment found
        }
      }

      const listingArray = [...(listing as readonly any[])];
      const eligibilityData = listingArray[9] as `0x${string}`;

      return {
        listing,
        phase,
        timeRemaining: Number(timeRemaining),
        userCommitment,
        hasEligibilityData: hasEligibilityData(eligibilityData),
      };
    } catch (error) {
      console.error('Error getting auction status:', error);
      throw error;
    }
  };

  return { getAuctionStatus };
}

// Enhanced Place Bid Hook with eligibility support
export function useEnhancedPlaceBid() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const { address: userAddress } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const placeBid = async (
    listingId: bigint,
    bidAmount: string,
    depositAmount: string,
    eligibilityProof: `0x${string}` = '0x'
  ) => {
    if (!userAddress || !publicClient) {
      throw new Error('Wallet not connected or no public client available');
    }

    setIsProcessing(true);

    try {
      // Check if we're in commit phase
      const phase = await publicClient.readContract({
        address: CONTRACTS.SealedBidAuction as `0x${string}`,
        abi: SEALED_BID_AUCTION_ABI,
        functionName: 'getCurrentPhase',
        args: [listingId],
      }) as number;

      if (phase !== 1) {
        throw new Error('Auction is not in commit phase');
      }

      // Generate secure nonce
      const nonce = generateSecureNonce();

      // Store the nonce securely for reveal phase
      await storeBidData(listingId, {
        nonce: nonce.toString(),
        bidAmount: bidAmount.toString(),
        timestamp: Date.now(),
      }, userAddress);

      // Check listing's eligibilityData to determine which version to use
      const listing = await publicClient.readContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'listings',
        args: [listingId],
      });

      const listingArray = [...(listing as readonly any[])];
      const eligibilityData = listingArray[9] as `0x${string}`;
      const hasEligibilityRequirements = eligibilityData !== "0x" && eligibilityData.length > 2;

      const bidAmountWei = parseEther(bidAmount);
      const depositAmountWei = parseEther(depositAmount);

      console.log('🔍 Listing eligibility info:', {
        listingId: listingId.toString(),
        eligibilityData,
        hasEligibilityRequirements,
        usingEligibilityProof: eligibilityProof !== '0x',
      });

      if (hasEligibilityRequirements) {
        // Use eligibility-aware version with empty proof for sealed bid auctions
        console.log('🔧 Using eligibility-aware version with empty proof...');
        writeContract({
          address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
          abi: DOMAIN_AUCTION_HOUSE_ABI,
          functionName: 'placeBidSealedAuction',
          args: [listingId, bidAmountWei, nonce, depositAmountWei, '0x'],
          value: depositAmountWei,
        });
      } else {
        // Use deprecated version for listings without eligibility requirements
        console.log('🔄 Using deprecated version (auto-nonce)...');
        writeContract({
          address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
          abi: DOMAIN_AUCTION_HOUSE_ABI,
          functionName: 'placeBidSealedAuction',
          args: [listingId, bidAmountWei, depositAmountWei],
          value: depositAmountWei,
        });
      }

      console.log('Bid placed successfully');
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    placeBid,
    isPending: isPending || isProcessing,
    isConfirming,
    isSuccess,
    hash,
  };
}

// Enhanced Reveal Bid Hook
export function useEnhancedRevealBid() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const { address: userAddress } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const revealBid = async (listingId: bigint) => {
    if (!userAddress || !publicClient) {
      throw new Error('Wallet not connected or no public client available');
    }

    setIsProcessing(true);

    try {
      // Check if we're in reveal phase
      const phase = await publicClient.readContract({
        address: CONTRACTS.SealedBidAuction as `0x${string}`,
        abi: SEALED_BID_AUCTION_ABI,
        functionName: 'getCurrentPhase',
        args: [listingId],
      }) as number;

      if (phase !== 2) {
        throw new Error('Auction is not in reveal phase');
      }

      // Retrieve stored bid data
      const bidData = await getBidData(listingId, userAddress);
      if (!bidData) {
        throw new Error('No commitment found for this listing');
      }

      const { nonce, bidAmount } = bidData;

      // Reveal the bid
      writeContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'revealBidSealedAuction',
        args: [listingId, parseEther(bidAmount)],
      });

      console.log('Bid revealed successfully');
    } catch (error) {
      console.error('Error revealing bid:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const cleanupStoredData = (listingId: bigint) => {
    if (userAddress) {
      cleanupBidData(listingId, userAddress);
    }
  };

  return {
    revealBid,
    cleanupStoredData,
    isPending: isPending || isProcessing,
    isConfirming,
    isSuccess,
    hash,
  };
}