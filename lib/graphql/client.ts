'use client';

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Doma GraphQL client
const httpLink = createHttpLink({ uri: 'https://api-testnet.doma.xyz/graphql' });

const authLink = setContext((_, { headers }) => {
  const apiKey = process.env.NEXT_PUBLIC_DOMA_API_KEY;
  return {
    headers: {
      ...headers,
      ...(apiKey ? { 'Api-Key': apiKey } : {}), // hanya kirim jika tersedia
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Listings GraphQL client
const listingsHttpLink = createHttpLink({ 
  uri: process.env.NEXT_PUBLIC_LISTINGS_GRAPHQL_ENDPOINT || 'http://localhost:42069/graphql'
});

export const listingsApolloClient = new ApolloClient({
  link: listingsHttpLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          listings: {
            keyArgs: ['where', 'orderBy', 'orderDirection'],
            merge(existing = { items: [], pageInfo: {} }, incoming) {
              return {
                ...incoming,
                items: [...(existing.items || []), ...(incoming.items || [])],
              };
            },
          },
        },
      },
    },
  }),
});
