import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { CONTRACTS } from './contracts/constants';
import { DOMAIN_RENTAL_VAULT_ABI } from './contracts/abis';

export interface RentalStatus {
  status: 'AVAILABLE' | 'RENTED' | 'EXPIRED' | 'ERROR';
  renter: string | null;
  expiresAt: Date | null;
  timeLeft: number | null; // seconds
  isLoading: boolean;
}

export function useRentalStatus(listingId: number | null) {
  const [rentalStatus, setRentalStatus] = useState<RentalStatus>({
    status: 'AVAILABLE',
    renter: null,
    expiresAt: null,
    timeLeft: null,
    isLoading: true
  });

  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient || !listingId) {
      setRentalStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const checkRentalStatus = async () => {
      try {
        setRentalStatus(prev => ({ ...prev, isLoading: true }));

        const rental = await publicClient.readContract({
          address: CONTRACTS.DomainRentalVault as `0x${string}`,
          abi: DOMAIN_RENTAL_VAULT_ABI,
          functionName: 'getRental',
          args: [BigInt(listingId)]
        });

        const currentTime = Math.floor(Date.now() / 1000);
        const isZeroAddress = rental.user === '0x0000000000000000000000000000000000000000';

        if (isZeroAddress) {
          setRentalStatus({
            status: 'AVAILABLE',
            renter: null,
            expiresAt: null,
            timeLeft: null,
            isLoading: false
          });
          return;
        }

        const expiresAt = new Date(Number(rental.expires) * 1000);
        const timeLeft = Number(rental.expires) - currentTime;

        if (timeLeft <= 0) {
          setRentalStatus({
            status: 'EXPIRED',
            renter: rental.user,
            expiresAt,
            timeLeft: 0,
            isLoading: false
          });
        } else {
          setRentalStatus({
            status: 'RENTED',
            renter: rental.user,
            expiresAt,
            timeLeft,
            isLoading: false
          });
        }

      } catch (error) {
        console.error('Failed to check rental status:', error);
        setRentalStatus({
          status: 'ERROR',
          renter: null,
          expiresAt: null,
          timeLeft: null,
          isLoading: false
        });
      }
    };

    checkRentalStatus();
  }, [publicClient, listingId]);

  return rentalStatus;
}

// Helper function to format address
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper function to format time left
export function formatTimeLeft(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}