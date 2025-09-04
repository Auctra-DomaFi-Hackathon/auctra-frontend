import { useState, useEffect } from 'react';

const GRAPHQL_ENDPOINT = "http://localhost:42069";

interface LiquidityProvider {
  id: string;
  lpAddress: string;
  poolAddress: string;
  totalDeposited: string;
  totalWithdrawn: string;
  currentShares: string;
  currentAssetValue: string;
  firstDepositAt: string;
  lastActionAt: string;
}

interface SupplyTransaction {
  id: string;
  lpAddress: string;
  poolAddress: string;
  type: "deposit" | "withdraw";
  amount: string;
  shares: string;
  exchangeRate: string;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

interface Borrower {
  id: string;
  borrowerAddress: string;
  poolAddress: string;
  totalBorrowed: string;
  totalRepaid: string;
  currentDebt: string;
  currentHealthFactor: string;
  hasActiveCollateral: boolean;
  collateralNft: string | null;
  collateralTokenId: string | null;
  collateralValue: string | null;
  firstBorrowAt: string | null;
  lastActionAt: string;
  liquidationCount: number;
}

interface BorrowTransaction {
  id: string;
  borrowerAddress: string;
  poolAddress: string;
  type: string;
  amount: string;
  newTotalDebt: string;
  healthFactor: string;
  apr: string;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

interface CollateralTransaction {
  id: string;
  borrowerAddress: string;
  poolAddress: string;
  type: string;
  nft: string;
  tokenId: string;
  valueUsd6: string;
  timestamp: string;
  blockNumber: string;
  transactionHash: string;
}

const useUserLendingHistory = (userAddress: string, poolAddress: string) => {
  const [supplyHistory, setSupplyHistory] = useState<{
    profile: LiquidityProvider | null;
    transactions: SupplyTransaction[];
  }>({ profile: null, transactions: [] });

  const [borrowHistory, setBorrowHistory] = useState<{
    profile: Borrower | null;
    transactions: BorrowTransaction[];
    collateralHistory: CollateralTransaction[];
  }>({ profile: null, transactions: [], collateralHistory: [] });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplyHistory = async () => {
    const query = `
      query GetUserSupplyHistory($userAddress: String!, $poolAddress: String!) {
        liquidityProviders(where: { lpAddress: $userAddress, poolAddress: $poolAddress }) {
          items {
            id lpAddress poolAddress totalDeposited totalWithdrawn
            currentShares currentAssetValue firstDepositAt lastActionAt
          }
        }
        supplyTransactions(where: { lpAddress: $userAddress, poolAddress: $poolAddress } orderBy: "timestamp" orderDirection: "desc" limit: 50) {
          items {
            id lpAddress poolAddress type amount shares exchangeRate
            timestamp blockNumber transactionHash
          }
        }
      }
    `;

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          variables: { userAddress, poolAddress }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch supply history');
      }

      const data = await response.json();
      setSupplyHistory({
        profile: data.data.liquidityProviders.items[0] || null,
        transactions: data.data.supplyTransactions.items || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supply history');
      throw err;
    }
  };

  const fetchBorrowHistory = async () => {
    const query = `
      query GetUserBorrowHistory($userAddress: String!, $poolAddress: String!) {
        borrowers(where: { borrowerAddress: $userAddress, poolAddress: $poolAddress }) {
          items {
            id borrowerAddress poolAddress totalBorrowed totalRepaid currentDebt
            currentHealthFactor hasActiveCollateral collateralNft collateralTokenId
            collateralValue firstBorrowAt lastActionAt liquidationCount
          }
        }
        borrowTransactions(where: { borrowerAddress: $userAddress, poolAddress: $poolAddress } orderBy: "timestamp" orderDirection: "desc" limit: 50) {
          items {
            id borrowerAddress poolAddress type amount newTotalDebt healthFactor
            apr timestamp blockNumber transactionHash
          }
        }
        collateralTransactions(where: { borrowerAddress: $userAddress, poolAddress: $poolAddress } orderBy: "timestamp" orderDirection: "desc" limit: 20) {
          items {
            id borrowerAddress poolAddress type nft tokenId valueUsd6
            timestamp blockNumber transactionHash
          }
        }
      }
    `;

    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          variables: { userAddress, poolAddress }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch borrow history');
      }

      const data = await response.json();
      setBorrowHistory({
        profile: data.data.borrowers.items[0] || null,
        transactions: data.data.borrowTransactions.items || [],
        collateralHistory: data.data.collateralTransactions.items || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch borrow history');
      throw err;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (userAddress && poolAddress) {
        setLoading(true);
        setError(null);
        try {
          await Promise.all([fetchSupplyHistory(), fetchBorrowHistory()]);
        } catch (err) {
          console.error('Error fetching lending history:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [userAddress, poolAddress]);

  const refetch = () => {
    if (userAddress && poolAddress) {
      setLoading(true);
      setError(null);
      Promise.all([fetchSupplyHistory(), fetchBorrowHistory()])
        .finally(() => setLoading(false));
    }
  };

  return { 
    supplyHistory, 
    borrowHistory, 
    loading,
    error,
    refetch
  };
};

export default useUserLendingHistory;