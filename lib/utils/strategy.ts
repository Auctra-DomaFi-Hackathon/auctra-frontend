// Strategy address mappings - matches CONTRACTS from constants.ts
export const STRATEGY_ADDRESSES = {
  ENGLISH_AUCTION: '0x4B4E01051ea200689a8562c182C66FDc6343c501',
  DUTCH_AUCTION: '0x14b9C2670A9D4279f5776c3E60b29044696F61f9',
  SEALED_BID_AUCTION: '0x71C4b800757A9C8aa6eDCBCB95ad5f96A1381b64',
} as const;

export const STRATEGY_NAMES = {
  [STRATEGY_ADDRESSES.ENGLISH_AUCTION]: 'English Auction',
  [STRATEGY_ADDRESSES.DUTCH_AUCTION]: 'Dutch Auction',
  [STRATEGY_ADDRESSES.SEALED_BID_AUCTION]: 'Sealed Bid Auction',
} as const;

/**
 * Get strategy name from strategy address
 * @param strategyAddress - The strategy contract address
 * @returns The human-readable strategy name or fallback message
 */
export function getStrategyName(strategyAddress: string | null): string {
  if (!strategyAddress) {
    return 'Strategy not set yet';
  }
  
  const normalizedAddress = strategyAddress.toLowerCase();
  const matchingStrategy = Object.entries(STRATEGY_NAMES).find(
    ([address]) => address.toLowerCase() === normalizedAddress
  );
  
  return matchingStrategy ? matchingStrategy[1] : 'Unknown Strategy';
}

/**
 * Get strategy address from strategy name
 * @param strategyName - The human-readable strategy name
 * @returns The strategy contract address or null if not found
 */
export function getStrategyAddress(strategyName: string): string | null {
  const entry = Object.entries(STRATEGY_NAMES).find(
    ([, name]) => name === strategyName
  );
  return entry ? entry[0] : null;
}

/**
 * Get all available strategy options for forms/dropdowns
 */
export function getStrategyOptions() {
  return Object.values(STRATEGY_NAMES).map(name => ({
    label: name,
    value: getStrategyAddress(name)!,
  }));
}