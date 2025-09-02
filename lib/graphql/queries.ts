// queries.ts
import { gql } from '@apollo/client';

export const MY_DOMAINS_QUERY = gql`
  query MyDomains(
    $take: Int!
    $ownedBy: [AddressCAIP10!]!
    $sortOrder: SortOrderType!
  ) {
    names(
      take: $take
      ownedBy: $ownedBy
      sortOrder: $sortOrder
    ) {
      items {
        name
        expiresAt
        registrar { name }    
        tokens {
          tokenId
          tokenAddress
          networkId         
        }
      }
    }
  }
`;

export const GET_ACTIVE_LISTINGS_QUERY = gql`
  query GetActiveListings($limit: Int = 10) {
    listings(
      limit: $limit
      where: { status: "Listed" }
      orderBy: "createdAt"
      orderDirection: "desc"
    ) {
      items {
        id
        seller
        nft
        tokenId
        paymentToken
        reservePrice
        startTime
        endTime
        strategy
        status
        createdAt
        updatedAt
        winner
        winningBid
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_NAME_FROM_TOKEN_QUERY = gql`
  query NameFromToken($tokenId: String!) {
    token(tokenId: $tokenId) {
      tokenId
      tokenAddress
      chain { 
        name 
        networkId 
      }
      expiresAt
    }
    nameStatistics(tokenId: $tokenId) {
      name
    }
  }
`;
