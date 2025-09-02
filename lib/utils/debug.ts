// Debug utilities for auction creation
export function logAuctionParams(params: any, step: string) {
  console.group(`🔍 ${step} - Auction Parameters Debug`);
  console.log('Auction Type:', params.auctionType);
  console.log('Token ID:', params.tokenId?.toString());
  console.log('Reserve Price:', params.reservePrice);
  console.log('Duration:', params.duration);
  
  if (params.auctionType === 'english') {
    console.log('English Auction Params:', {
      incrementBps: params.incrementBps,
      antiSnipingEnabled: params.antiSnipingEnabled
    });
  } else if (params.auctionType === 'dutch') {
    console.log('Dutch Auction Params:', {
      startPrice: params.startPrice,
      endPrice: params.endPrice,
      isLinear: params.isLinear
    });
  } else if (params.auctionType === 'sealed') {
    console.log('Sealed Bid Params:', {
      commitDuration: params.commitDuration,
      revealDuration: params.revealDuration,
      minimumDeposit: params.minimumDeposit
    });
  }
  console.groupEnd();
}

export function logContractCall(contractName: string, functionName: string, args: any[]) {
  console.group(`📞 Contract Call - ${contractName}.${functionName}`);
  console.log('Arguments:', args);
  console.groupEnd();
}

export function logTransactionResult(txHash: string | undefined, success: boolean, error?: any) {
  if (success) {
    console.log(`✅ Transaction successful: ${txHash}`);
  } else {
    console.error(`❌ Transaction failed: ${txHash}`, error);
  }
}