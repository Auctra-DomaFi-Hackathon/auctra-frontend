import React, { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { DOMAIN_AUCTION_HOUSE_ABI } from './contracts/abis';

const DOMAIN_AUCTION_HOUSE_ADDRESS = "0xb9a2de3a8c6d72df0bc04fa5ba3a2bbab6de11c9" as const;

interface EndAuctionState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  hash: `0x${string}` | undefined;
}

export function useEndAuction() {
  const [endAuctionStates, setEndAuctionStates] = useState<Record<string, EndAuctionState>>({});
  const [currentListingId, setCurrentListingId] = useState<string | null>(null);

  const { writeContract, data: hash, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const endAuction = async (listingId: bigint | string) => {
    const id = listingId.toString();
    setCurrentListingId(id);
    
    // Set loading state for specific auction
    setEndAuctionStates(prev => ({
      ...prev,
      [id]: {
        isLoading: true,
        isSuccess: false,
        error: null,
        hash: undefined,
      }
    }));

    try {
      writeContract({
        address: DOMAIN_AUCTION_HOUSE_ADDRESS,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'endAuction',
        args: [BigInt(listingId)],
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end auction';
      
      setEndAuctionStates(prev => ({
        ...prev,
        [id]: {
          isLoading: false,
          isSuccess: false,
          error: errorMessage,
          hash: undefined,
        }
      }));
      
      throw error;
    }
  };

  // Update state when transaction hash is available
  React.useEffect(() => {
    if (hash && currentListingId) {
      setEndAuctionStates(prev => ({
        ...prev,
        [currentListingId]: {
          ...prev[currentListingId],
          hash,
          isLoading: isConfirming,
        }
      }));
    }
  }, [hash, currentListingId, isConfirming]);

  // Update states when transaction is confirmed
  React.useEffect(() => {
    if (isConfirmed && hash && currentListingId) {
      setEndAuctionStates(prev => ({
        ...prev,
        [currentListingId]: {
          ...prev[currentListingId],
          isLoading: false,
          isSuccess: true,
          hash,
        }
      }));
    }
  }, [isConfirmed, hash, currentListingId]);

  // Update states when there's an error
  React.useEffect(() => {
    if (writeError && currentListingId) {
      setEndAuctionStates(prev => ({
        ...prev,
        [currentListingId]: {
          ...prev[currentListingId],
          isLoading: false,
          error: writeError.message,
        }
      }));
    }
  }, [writeError, currentListingId]);

  const getAuctionState = (listingId: bigint | string): EndAuctionState => {
    const id = listingId.toString();
    return endAuctionStates[id] || {
      isLoading: false,
      isSuccess: false,
      error: null,
      hash: undefined,
    };
  };

  const resetAuctionState = (listingId: bigint | string) => {
    const id = listingId.toString();
    setEndAuctionStates(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
  };

  return {
    endAuction,
    getAuctionState,
    resetAuctionState,
    isConfirming,
    hash,
  };
}