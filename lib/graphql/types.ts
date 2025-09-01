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