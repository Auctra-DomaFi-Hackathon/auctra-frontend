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
