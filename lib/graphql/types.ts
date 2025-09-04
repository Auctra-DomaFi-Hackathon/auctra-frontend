export interface TokenInfo {
  tokenId: string;
  tokenAddress: string;
  networkId: string;
  chain?: {
    name: string;
    networkId: string;
  };
}

export interface DomainItem {
  name: string;
  expiresAt: string;
  royaltyBps?: number;
  royalty?: number;
  registrar?: {
    name: string;
  };
  tokens?: TokenInfo[];
}

export interface MyDomainsResponse {
  names: {
    items: DomainItem[];
  };
}

export type SortOrder = 'ASC' | 'DESC';
export type ClaimStatus = 'ALL' | 'CLAIMED' | 'UNCLAIMED';

export interface MyDomainsVariables {
  take: number;
  ownedBy: string[];
  sortOrder: SortOrder;
  networkIds?: string[];
}

// Listing types
export interface Listing {
  id: string;
  seller: string;
  nft: string;
  tokenId: string;
  paymentToken: string;
  reservePrice: string;
  startTime: string;
  endTime: string;
  strategy: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  winner: string | null;
  winningBid: string | null;
}

export interface ListingPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

export interface GetActiveListingsResponse {
  listings: {
    items: Listing[];
    pageInfo: ListingPageInfo;
  };
}

export interface GetActiveListingsVariables {
  limit?: number;
  after?: string;
  before?: string;
}

// NFT Metadata types
export interface NFTMetadata {
  name: string;
  tld: string;
  image?: string;
  description: string;
  expiresAt?: number | null;        // UNIX seconds
  expirationISO?: string | null;    // "YYYY-MM-DDTHH:mm:ss.sssZ"
  isExpired?: boolean | null;
}

// Doma API types
export interface DomaTokenInfo {
  tokenId: string;
  tokenAddress: string;
  chain: {
    name: string;
    networkId: string;
  };
  expiresAt?: string;
}

export interface DomaNameStatistics {
  name: string;
}

export interface NameFromTokenResponse {
  nameStatistics: { name: string | null } | null;
}

export interface NameFromTokenVariables {
  tokenId: string;
}

export interface NameExpiryResponse {
  name: { 
    expiresAt: string | number | null;
    registrar: { name: string } | null;
  } | null;
}

export interface NameExpiryVariables {
  name: string;
}

// New types for combined token name and expiry query
export interface TokenNameAndExpiryResponse {
  nameStatistics?: { name?: string | null } | null;
  token?: { tokenId: string; expiresAt: string; networkId: string } | null;
}

export interface TokenNameAndExpiryVariables {
  tokenId: string;
}

// RENTAL TYPES - From RENTAL_QUERY.md
export interface RentalListing {
  id: string;
  owner: string;
  nft: string;
  tokenId: string;
  pricePerDay: string;
  securityDeposit: string;
  paymentToken: string;
  minDays: number;
  maxDays: number;
  paused: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RentalListingWithMetadata extends RentalListing {
  metadata?: NFTMetadata;
}

export interface GetAllActiveRentalListingsResponse {
  rentalListings: {
    totalCount: number;
    items: RentalListing[];
  };
}

export interface GetAllActiveRentalListingsVariables {
  limit?: number;
}

export interface GetListingDetailsResponse {
  rentalListings: {
    totalCount: number;
    items: RentalListing[];
  };
}

export interface GetListingDetailsVariables {
  ids: string[];
  limit?: number;
}

export interface GetRentalListingsByOwnerResponse {
  rentalListings: {
    totalCount: number;
    items: RentalListing[];
  };
}

export interface GetRentalListingsByOwnerVariables {
  owner: string;
  limit?: number;
}

export interface UserRentalProfile {
  id: string;
  totalRentals: string;
  totalSpent: string;
  totalDeposits: string;
  activeRentals: string;
  expiredRentals: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalHistory {
  id: string;
  listingId: string;
  eventType: string;
  user: string;
  owner: string;
  nft: string;
  tokenId: string;
  timestamp: string;
  data: any;
}

export interface DepositRecord {
  id: string;
  listingId: string;
  amount: string;
  paymentToken: string;
  locked: boolean;
  claimed: boolean;
  lockedAt: string;
  claimedAt: string | null;
  claimedBy: string | null;
}

export interface GetUserRentalHistoryResponse {
  userRentalProfile: UserRentalProfile | null;
  rentalHistorys: {
    totalCount: number;
    items: RentalHistory[];
  };
  depositRecords: {
    totalCount: number;
    items: DepositRecord[];
  };
}

export interface GetUserRentalHistoryVariables {
  user: string;
  limit?: number;
}