import { Address, Listing, Rental, ListingWithMeta, DomainRentalVaultAPI, RentCostBreakdown } from "./types";

// Mock constants
export const MOCK_ACCOUNTS = {
  owner: "0x00000000000000000000000000000000000A11cE" as Address,
  renter: "0x0000000000000000000000000000000000000B0b" as Address,
  treasury: "0x0000000000000000000000000000000000000FEE" as Address,
  usdc: "0x0000000000000000000000000000000000000USD" as Address,
};

export const PROTOCOL_FEE_BPS = 200; // 2%

// In-memory state
let nextListingId = 4;
let listings: Map<number, ListingWithMeta> = new Map();
let deposits: Map<number, bigint> = new Map();

// Initialize with seed data
const seedData: ListingWithMeta[] = [
  {
    id: 1,
    domain: "alpha.com",
    tld: ".com",
    verified: true,
    expiresAt: 1735689600, // Jan 1, 2025
    listing: {
      nft: "0x1111111111111111111111111111111111111111" as Address,
      tokenId: 1n,
      owner: MOCK_ACCOUNTS.owner,
      paymentToken: MOCK_ACCOUNTS.usdc,
      pricePerDay: 1500000n, // $1.50/day
      securityDeposit: 5000000n, // $5
      minDays: 1,
      maxDays: 14,
      paused: false,
    },
    rental: null,
  },
  {
    id: 2,
    domain: "beta.xyz",
    tld: ".xyz",
    verified: false,
    expiresAt: 1739500000, // Feb 13, 2025
    listing: {
      nft: "0x2222222222222222222222222222222222222222" as Address,
      tokenId: 42n,
      owner: MOCK_ACCOUNTS.owner,
      paymentToken: MOCK_ACCOUNTS.usdc,
      pricePerDay: 800000n, // $0.80/day
      securityDeposit: 3000000n, // $3
      minDays: 3,
      maxDays: 30,
      paused: false,
    },
    rental: {
      user: MOCK_ACCOUNTS.renter,
      expires: 1738368000, // Feb 1, 2025
    },
  },
  {
    id: 3,
    domain: "gamma.io",
    tld: ".io",
    verified: true,
    expiresAt: 1742000000, // Mar 12, 2025
    listing: {
      nft: "0x3333333333333333333333333333333333333333" as Address,
      tokenId: 777n,
      owner: MOCK_ACCOUNTS.owner,
      paymentToken: MOCK_ACCOUNTS.usdc,
      pricePerDay: 2500000n, // $2.50/day
      securityDeposit: 10000000n, // $10
      minDays: 7,
      maxDays: 90,
      paused: true,
    },
    rental: null,
  },
];

// Initialize seed data
seedData.forEach(item => {
  listings.set(item.id, item);
  if (item.rental) {
    deposits.set(item.id, item.listing.securityDeposit);
  }
});

// Helper functions
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function calculateRentCost(pricePerDay: bigint, days: number, securityDeposit: bigint): RentCostBreakdown {
  const basePrice = pricePerDay * BigInt(days);
  const protocolFee = (basePrice * BigInt(PROTOCOL_FEE_BPS)) / 10000n;
  const total = basePrice + protocolFee + securityDeposit;
  
  return {
    basePrice,
    protocolFee,
    securityDeposit,
    total,
    days,
  };
}

export const mockRentalService: DomainRentalVaultAPI = {
  async getListing(id: number): Promise<Listing> {
    await delay(300);
    const item = listings.get(id);
    if (!item) {
      throw new Error(`Listing ${id} not found`);
    }
    return item.listing;
  },

  async getRental(id: number): Promise<Rental> {
    await delay(300);
    const item = listings.get(id);
    if (!item || !item.rental) {
      throw new Error(`Rental ${id} not found`);
    }
    return item.rental;
  },

  async getAllListings(): Promise<ListingWithMeta[]> {
    await delay(500);
    return Array.from(listings.values());
  },

  async deposit(nft: Address, tokenId: bigint): Promise<{ listingId: number }> {
    await delay(1000);
    
    // Mock validation: check if NFT is already deposited
    const existing = Array.from(listings.values()).find(
      item => item.listing.nft === nft && item.listing.tokenId === tokenId
    );
    
    if (existing) {
      throw new Error("NFT already deposited");
    }
    
    // Create new listing entry (without terms set)
    const listingId = nextListingId++;
    const newListing: ListingWithMeta = {
      id: listingId,
      domain: `domain${listingId}.com`, // Mock domain name
      tld: ".com",
      verified: false,
      expiresAt: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year from now
      listing: {
        nft,
        tokenId,
        owner: MOCK_ACCOUNTS.owner,
        paymentToken: MOCK_ACCOUNTS.usdc,
        pricePerDay: 0n, // Not set yet
        securityDeposit: 0n, // Not set yet
        minDays: 1,
        maxDays: 30,
        paused: true, // Paused until terms are set
      },
      rental: null,
    };
    
    listings.set(listingId, newListing);
    
    return { listingId };
  },

  async setTerms(
    id: number,
    pricePerDay: bigint,
    securityDeposit: bigint,
    minDays: number,
    maxDays: number,
    paymentToken: Address
  ): Promise<void> {
    await delay(800);
    
    const item = listings.get(id);
    if (!item) {
      throw new Error(`Listing ${id} not found`);
    }
    
    // Validation
    if (pricePerDay <= 0n) throw new Error("Price per day must be greater than 0");
    if (securityDeposit < 0n) throw new Error("Security deposit cannot be negative");
    if (minDays < 1) throw new Error("Minimum days must be at least 1");
    if (maxDays < minDays) throw new Error("Maximum days must be >= minimum days");
    
    // Update listing
    item.listing.pricePerDay = pricePerDay;
    item.listing.securityDeposit = securityDeposit;
    item.listing.minDays = minDays;
    item.listing.maxDays = maxDays;
    item.listing.paymentToken = paymentToken;
    item.listing.paused = false; // Unpause when terms are set
    
    listings.set(id, item);
  },

  async unlist(id: number): Promise<void> {
    await delay(800);
    
    const item = listings.get(id);
    if (!item) {
      throw new Error(`Listing ${id} not found`);
    }
    
    if (item.rental) {
      throw new Error("Cannot unlist while rented");
    }
    
    listings.delete(id);
    deposits.delete(id);
  },

  async pause(id: number, value: boolean): Promise<void> {
    await delay(500);
    
    const item = listings.get(id);
    if (!item) {
      throw new Error(`Listing ${id} not found`);
    }
    
    item.listing.paused = value;
    listings.set(id, item);
  },

  async rent(id: number, days_: number): Promise<void> {
    await delay(1200);
    
    const item = listings.get(id);
    if (!item) {
      throw new Error(`Listing ${id} not found`);
    }
    
    // Validation
    if (item.listing.paused) {
      throw new Error("Listing is paused");
    }
    
    if (item.rental) {
      throw new Error("Already rented");
    }
    
    if (days_ < item.listing.minDays || days_ > item.listing.maxDays) {
      throw new Error(`Days must be between ${item.listing.minDays} and ${item.listing.maxDays}`);
    }
    
    // Create rental
    const now = Math.floor(Date.now() / 1000);
    const expires = now + (days_ * 24 * 60 * 60);
    
    item.rental = {
      user: MOCK_ACCOUNTS.renter,
      expires,
    };
    
    // Lock deposit
    deposits.set(id, item.listing.securityDeposit);
    
    listings.set(id, item);
  },

  async extend(id: number, extraDays: number): Promise<void> {
    await delay(1000);
    
    const item = listings.get(id);
    if (!item || !item.rental) {
      throw new Error("Rental not found");
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (now >= item.rental.expires) {
      throw new Error("Rental has expired");
    }
    
    if (extraDays < 1) {
      throw new Error("Extra days must be at least 1");
    }
    
    // Extend expiry
    item.rental.expires += extraDays * 24 * 60 * 60;
    listings.set(id, item);
  },

  async endRent(id: number): Promise<void> {
    await delay(800);
    
    const item = listings.get(id);
    if (!item || !item.rental) {
      throw new Error("Rental not found");
    }
    
    const now = Math.floor(Date.now() / 1000);
    if (now < item.rental.expires) {
      throw new Error("Rental has not expired yet");
    }
    
    // Clear rental
    item.rental = null;
    listings.set(id, item);
  },

  async claimDeposit(id: number, to: Address): Promise<void> {
    await delay(800);
    
    const item = listings.get(id);
    if (!item) {
      throw new Error(`Listing ${id} not found`);
    }
    
    if (item.rental) {
      throw new Error("Cannot claim deposit while rented");
    }
    
    const depositAmount = deposits.get(id);
    if (!depositAmount || depositAmount <= 0n) {
      throw new Error("No deposit to claim");
    }
    
    // Clear deposit
    deposits.delete(id);
  },
};

export default mockRentalService;