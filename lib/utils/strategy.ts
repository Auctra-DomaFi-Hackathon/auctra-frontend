// Strategy address mappings - matches CONTRACTS from constants.ts
export const STRATEGY_ADDRESSES = {
  ENGLISH_AUCTION: '0x947e70b9362eeCA8a3994F839Ebcc2C1c7d63C5d',
  DUTCH_AUCTION: '0x084DA94314FE36Cf957191A78a7d6395dC951686',
  SEALED_BID_AUCTION: '0x7Cb994c76074064E6003f7DE048c35A285055c5C',
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