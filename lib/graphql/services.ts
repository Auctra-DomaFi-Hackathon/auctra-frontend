// services/graphqlService.ts
import { apolloClient } from "./client";
import { MY_DOMAINS_QUERY } from "./queries";
import type { MyDomainsResponse, DomainItem } from "./types";

const DOMA_TESTNET = "eip155:97476" as const;
const toCaip10 = (addr: string) =>
  `${DOMA_TESTNET}:${addr.trim().toLowerCase()}`;

export interface EnhancedDomainItem extends DomainItem {
  tokenAddress?: string;
  tokenId?: string;
  tokenChain?: string; // pakai networkId jika ada
  // royaltyPercent?: number; // matikan dulu—schema tidak expose
}

export const graphqlService = {
  getMyDomains: async (
    walletAddress: string
  ): Promise<EnhancedDomainItem[]> => {
    if (!walletAddress) return [];

    const variables = {
      take: 50,
      ownedBy: [toCaip10(walletAddress)],
      sortOrder: "DESC" as any, // enum SortOrderType
    };

    try {
      const { data } = await apolloClient.query<MyDomainsResponse>({
        query: MY_DOMAINS_QUERY,
        variables,
        fetchPolicy: "no-cache",
      });

      const NETWORK_LABELS: Record<string, string> = {
        "eip155:97476": "Doma Testnet",
      };

      const items = (data?.names?.items ?? []).map((n: any) => {
        const preferred =
          n.tokens?.find((t: any) => t.networkId === DOMA_TESTNET) ||
          n.tokens?.[0];

        const tokenChain =
          (preferred?.networkId && NETWORK_LABELS[preferred.networkId]) ||
          preferred?.networkId || // fallback ke id mentah
          undefined;

        return {
          name: n.name,
          expiresAt: n.expiresAt,
          registrar: n.registrar,
          tokens: n.tokens,
          tokenAddress: preferred?.tokenAddress,
          tokenId: preferred?.tokenId,
          tokenChain, // sekarang terlihat "Doma Testnet"
          // royaltyPercent: undefined // belum tersedia dari schema
        };
      });

      return items;
    } catch (error: any) {
      const net = error?.networkError as any;
      console.error("[GraphQL] message:", error?.message);
      console.error("[GraphQL] graphQLErrors:", error?.graphQLErrors);
      console.error(
        "[GraphQL] networkError:",
        net?.statusCode,
        net?.result || net?.bodyText
      );
      throw new Error(
        `Subgraph request failed (ownedBy=${toCaip10(walletAddress)}). ${
          error?.message ?? ""
        }`.trim()
      );
    }
  },
};
