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

// New queries from CLAUDE.md
// 1. My Auctions for Dashboard
export const GET_LISTINGS_BY_SELLER_QUERY = gql`
  query GetListingsBySeller($seller: String!) {
    listings(
      where: { seller: $seller }
      orderBy: "createdAt"
      orderDirection: "desc"
    ) {
      items {
        id
        seller
        nft
        tokenId
        reservePrice
        status
        createdAt
        winner
        winningBid
        strategy
      }
    }
  }
`;

// 2. My Bids for Dashboard
export const GET_USER_BIDS_QUERY = gql`
  query GetUserBids($userAddress: String!, $limit: Int = 10, $orderBy: String = "timestamp", $orderDirection: String = "desc") {
    bids(
      where: { bidder: $userAddress }
      orderBy: $orderBy
      orderDirection: $orderDirection
      limit: $limit
    ) {
      items {
        id
        listingId
        bidder
        amount
        timestamp
        blockNumber
        transactionHash
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// 3. Auction History for History Page
export const GET_USER_AUCTION_HISTORY_QUERY = gql`
  query GetUserAuctionHistory($userAddress: String!, $limit: Int = 10, $orderBy: String = "createdAt", $orderDirection: String = "desc") {
    listings(
      where: { seller: $userAddress }
      orderBy: $orderBy
      orderDirection: $orderDirection
      limit: $limit
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
        strategyData
        eligibilityData
        status
        winner
        winningBid
        createdAt
        updatedAt
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
