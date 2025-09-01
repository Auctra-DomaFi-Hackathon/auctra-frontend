'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { graphqlService, type EnhancedDomainItem } from './services';

export function useMyDomains(walletAddress?: string) {
  const [domains, setDomains] = useState<EnhancedDomainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // Hindari race-condition ketika walletAddress berubah cepat
  const reqIdRef = useRef(0);

  const load = useCallback(async (addr: string) => {
    const myReq = ++reqIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const items = await graphqlService.getMyDomains(addr);
      // Abaikan respons lama jika sudah ada request baru
      if (myReq !== reqIdRef.current) return;
      setDomains(items ?? []);
    } catch (e: any) {
      if (myReq !== reqIdRef.current) return;
      setDomains([]);
      setError(e?.message ?? 'Failed to fetch domains');
    } finally {
      if (myReq === reqIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Reset ketika tidak ada wallet
    if (!walletAddress) {
      reqIdRef.current++;
      setDomains([]);
      setError(null);
      setLoading(false);
      return;
    }
    load(walletAddress);
  }, [walletAddress, load]);

  // Refetch yang juga mengupdate state (bukan cuma mengembalikan promise)
  const refetch = useCallback(async () => {
    if (!walletAddress) return [];
    await load(walletAddress);
    return domains; // nilai setelah refetch akan tersedia lewat state
  }, [walletAddress, load, domains]);

  return { domains, loading, error, refetch };
}
