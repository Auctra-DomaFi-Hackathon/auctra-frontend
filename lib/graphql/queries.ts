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
  query GetActiveListings($limit: Int = 10, $after: String, $before: String) {
    listings(
      limit: $limit
      after: $after
      before: $before
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
  query GetNameFromToken($tokenId: String!) {
    nameStatistics(tokenId: $tokenId) {
      name
    }
  }
`;

export const GET_NAME_EXPIRY_QUERY = gql`
  query GetNameExpiry($name: String!) {
    name(name: $name) {
      expiresAt
      registrar { name }
    }
  }
`;

// New combined query for token name and expiry (ISO DateTime)
export const GET_TOKEN_NAME_AND_EXPIRY = gql`
  query TokenNameAndExpiry($tokenId: String!) {
    nameStatistics(tokenId: $tokenId) { name }
    token(tokenId: $tokenId) { tokenId expiresAt networkId }
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

// RENTAL QUERIES - From RENTAL_QUERY.md
// 1. Active Domain Rentals for /app/rent page  
export const GET_ALL_ACTIVE_RENTAL_LISTINGS_QUERY = gql`
  query GetAllActiveRentalListings($limit: Int = 50) {
    rentalListings(
      limit: $limit
      orderBy: "updatedAt"
      orderDirection: "desc"
    ) {
      totalCount
      items {
        id
        owner
        nft
        tokenId
        pricePerDay
        securityDeposit
        paymentToken
        minDays
        maxDays
        paused
        active
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_LISTING_DETAILS_QUERY = gql`
  query ListingDetails($ids: [String!], $limit: Int = 50) {
    rentalListings(where: { id_in: $ids }, limit: $limit) {
      totalCount
      items {
        id
        owner
        nft
        tokenId
        pricePerDay
        securityDeposit
        paymentToken
        minDays
        maxDays
        paused
        active
        createdAt
        updatedAt
      }
    }
  }
`;

// 2. Domain Rental Listings by Owner for My Listings
export const GET_RENTAL_LISTINGS_BY_OWNER_QUERY = gql`
  query RentalListingsByOwner($owner: String!, $limit: Int = 50) {
    rentalListings(
      where: { owner: $owner, active: true }
      orderBy: "updatedAt"
      orderDirection: "desc"
      limit: $limit
    ) {
      totalCount
      items {
        id
        owner
        nft
        tokenId
        pricePerDay
        securityDeposit
        paymentToken
        active
        paused
        updatedAt
      }
    }
  }
`;

// 3. User Rental History for My Rentals section
export const GET_USER_RENTAL_HISTORY_QUERY = gql`
  query UserRentalHistory($user: String!, $limit: Int = 50) {
    userRentalProfile(id: $user) {
      id
      totalRentals
      totalSpent
      totalDeposits
      activeRentals
      expiredRentals
      createdAt
      updatedAt
    }

    rentalHistorys(
      where: { user: $user }
      orderBy: "timestamp"
      orderDirection: "desc"
      limit: $limit
    ) {
      totalCount
      items {
        id
        listingId
        eventType
        user
        owner
        nft
        tokenId
        timestamp
        data
      }
    }

    depositRecords(
      where: { user: $user }
      orderBy: "lockedAt"
      orderDirection: "desc"
      limit: $limit
    ) {
      totalCount
      items {
        id
        listingId
        amount
        paymentToken
        locked
        claimed
        lockedAt
        claimedAt
        claimedBy
      }
    }
  }
`;
