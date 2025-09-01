export type Address = `0x${string}`;

export interface Listing {
  nft: Address;
  tokenId: bigint;
  owner: Address;
  paymentToken: Address;
  pricePerDay: bigint;
  securityDeposit: bigint;
  minDays: number;
  maxDays: number;
  paused: boolean;
}

export interface Rental {
  user: Address;
  expires: number; // unix timestamp (seconds)
}

export interface ListingWithMeta {
  id: number;
  domain: string;
  tld: string;
  verified?: boolean;
  expiresAt: number; // domain expiry timestamp
  listing: Listing;
  rental?: Rental | null;
}

export interface DomainRentalVaultAPI {
  // read
  getListing(id: number): Promise<Listing>;
  getRental(id: number): Promise<Rental>;
  getAllListings(): Promise<ListingWithMeta[]>;
  
  // write (mock these; later we swap to real wagmi)
  deposit(nft: Address, tokenId: bigint): Promise<{ listingId: number }>;
  setTerms(
    id: number,
    pricePerDay: bigint,
    securityDeposit: bigint,
    minDays: number,
    maxDays: number,
    paymentToken: Address
  ): Promise<void>;
  unlist(id: number): Promise<void>;
  pause(id: number, value: boolean): Promise<void>;
  rent(id: number, days_: number): Promise<void>;
  extend(id: number, extraDays: number): Promise<void>;
  endRent(id: number): Promise<void>;
  claimDeposit(id: number, to: Address): Promise<void>;
}

export interface ExploreFilters {
  search?: string;
  tld?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price' | 'expiry' | 'domain';
  sortOrder?: 'asc' | 'desc';
}

export interface RentCostBreakdown {
  basePrice: bigint;
  protocolFee: bigint;
  securityDeposit: bigint;
  total: bigint;
  days: number;
}