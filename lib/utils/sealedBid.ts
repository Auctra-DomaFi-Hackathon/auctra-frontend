/**
 * Sealed Bid Auction Utilities
 * Based on sealed_bid_auction_fe_integration.md
 */

import { ethers } from 'ethers';
import { parseEther, formatEther, keccak256, encodeAbiParameters } from 'viem';

// Generate a cryptographically secure nonce
export function generateSecureNonce(): bigint {
  // Use crypto.getRandomValues for secure randomness
  const array = new Uint32Array(8); // 256 bits of randomness
  crypto.getRandomValues(array);
  
  // Convert to a single large number as hex string
  let nonce = '0x';
  for (let i = 0; i < array.length; i++) {
    nonce += array[i].toString(16).padStart(8, '0');
  }
  
  return BigInt(nonce);
}

// Create commitment hash for the bid
export function createCommitmentHash(
  bidAmount: bigint, 
  nonce: bigint, 
  bidderAddress: `0x${string}`
): `0x${string}` {
  // Important: Use the same encoding as the smart contract
  // keccak256(abi.encodePacked(bidAmount, nonce, bidder))
  const encoded = encodeAbiParameters(
    ['uint256', 'uint256', 'address'],
    [bidAmount, nonce, bidderAddress]
  );
  
  return keccak256(encoded);
}

// Simple encryption/decryption (use more secure methods in production)
export function encrypt(text: string): string {
  // This is a basic example - use proper encryption in production
  return btoa(text);
}

export function decrypt(encryptedText: string): string {
  // This is a basic example - use proper decryption in production
  return atob(encryptedText);
}

// Store bid data securely in localStorage
export async function storeBidData(
  listingId: bigint, 
  bidData: {
    nonce: string;
    bidAmount: string;
    timestamp: number;
  },
  userAddress: `0x${string}`
): Promise<void> {
  const key = `sealed_bid_${listingId}_${userAddress}`;
  const encryptedData = encrypt(JSON.stringify(bidData));
  localStorage.setItem(key, encryptedData);
}

// Retrieve bid data from localStorage
export async function getBidData(
  listingId: bigint,
  userAddress: `0x${string}`
): Promise<{
  nonce: string;
  bidAmount: string;
  timestamp: number;
} | null> {
  const key = `sealed_bid_${listingId}_${userAddress}`;
  const encryptedData = localStorage.getItem(key);
  
  if (!encryptedData) return null;
  
  try {
    const decryptedData = decrypt(encryptedData);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Error decrypting bid data:', error);
    return null;
  }
}

// Clean up stored bid data
export function cleanupBidData(listingId: bigint, userAddress: `0x${string}`): void {
  const key = `sealed_bid_${listingId}_${userAddress}`;
  localStorage.removeItem(key);
}

// Check if listing has eligibility requirements
export function hasEligibilityData(eligibilityData: `0x${string}`): boolean {
  return eligibilityData !== "0x" && eligibilityData.length > 2;
}