// src/lib/listings.ts
import { createPublicClient, http, Address } from "viem";
import { DOMAIN_AUCTION_HOUSE_ABI } from "@/hooks/contracts/abis";
import { DOMA_TESTNET } from "@/hooks/contracts/constants";

const client = createPublicClient({
  chain: DOMA_TESTNET,
  transport: http(),
});

export async function readListing(listingId: bigint, house: Address) {
  const l = await client.readContract({
    address: house,
    abi: DOMAIN_AUCTION_HOUSE_ABI,
    functionName: "listings",
    args: [listingId],
  });
  // struktur: [seller, nft, tokenId, paymentToken, reservePrice, startTime, endTime, strategy, strategyData, eligibilityData, status]
  return {
    seller: l[0] as Address,
    eligibilityData: l[9] as `0x${string}`,
    status: Number(l[10]) as number,
  };
}

export function listingNeedsEligibility(eligibilityData: `0x${string}`) {
  // Check for truly empty data
  if (!eligibilityData || eligibilityData === "0x") {
    return false;
  }
  
  // Check for all zeros (common empty pattern)
  const withoutPrefix = eligibilityData.slice(2);
  if (/^0+$/.test(withoutPrefix)) {
    return false;
  }
  
  return eligibilityData.length > 2;
}

export function parseEligibilityData(eligibilityData: `0x${string}`) {
  if (!listingNeedsEligibility(eligibilityData)) {
    return { type: "none", details: null };
  }

  try {
    // Try to decode as whitelist format (bool + address[])
    const { decodeAbiParameters } = require("viem");
    const decoded = decodeAbiParameters(
      [
        { name: "isWhitelisted", type: "bool" },
        { name: "whitelist", type: "address[]" }
      ],
      eligibilityData
    );

    const [isWhitelisted, whitelist] = decoded;
    if (isWhitelisted && Array.isArray(whitelist)) {
      return {
        type: "whitelist",
        details: {
          isWhitelisted,
          addresses: whitelist,
          count: whitelist.length
        }
      };
    }
  } catch (e) {
    // Not a simple whitelist format
  }

  try {
    // Try to decode as merkle format
    const { decodeAbiParameters } = require("viem");
    const decoded = decodeAbiParameters(
      [
        { name: "ruleType", type: "uint8" },
        { name: "merkleRoot", type: "bytes32" },
        { name: "signer", type: "address" },
        { name: "token", type: "address" },
        { name: "minAmount", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "domainSeparator", type: "bytes32" }
      ],
      eligibilityData
    );

    const [ruleType, merkleRoot, signer, token, minAmount, expiry, domainSeparator] = decoded;
    return {
      type: "merkle",
      details: {
        ruleType,
        merkleRoot,
        signer,
        token,
        minAmount,
        expiry,
        domainSeparator
      }
    };
  } catch (e) {
    // Not a standard format
  }

  return {
    type: "unknown",
    details: { raw: eligibilityData }
  };
}