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
}

// NFT Metadata types
export interface NFTMetadata {
  name: string;
  tld: string;
  image?: string;
  description?: string;
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
  token: DomaTokenInfo;
  nameStatistics: DomaNameStatistics;
}

export interface NameFromTokenVariables {
  tokenId: string;
}