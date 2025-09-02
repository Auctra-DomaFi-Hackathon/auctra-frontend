# 🎯 Frontend Integration Instructions for Auctra Domain Auction House

## 📋 Deployed Contract Addresses (Doma Testnet)


// Contract Addresses
const CONTRACTS = {
  DomainNFT: "0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f",
  FeeManager: "0xaCd0B6598768d597Ad6c322f88969E687617Dd28",
  RegistrarBridge: "0x76D2559Dc8C5C092649C2A0dDFb3d6395157CC18",
  EnglishAuction: "0x947e70b9362eeCA8a3994F839Ebcc2C1c7d63C5d",
  DutchAuction: "0x084DA94314FE36Cf957191A78a7d6395dC951686",
  SealedBidAuction: "0x7Cb994c76074064E6003f7DE048c35A285055c5C",
  DomainAuctionHouse: "0x346d94b66072D8b9d678058073A0fe7eF449f03f"
}
```

## 🚀 Quick Setup Guide

### 1. Network Connection
```javascript
// Add Doma Testnet to wallet
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x17C64', // 97476 in hex
    chainName: 'Doma Testnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://rpc-testnet.doma.xyz'],
    blockExplorerUrls: ['https://explorer-testnet.doma.xyz']
  }]
});

// Switch to Doma Testnet
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x17C64' }]
});
```

### 2. Contract Instances Creation
```javascript
import { ethers } from 'ethers';

// ABIs (use the ABIs provided in CLAUDE.md)
const DOMAIN_AUCTION_HOUSE_ABI = [/* DomainAuctionHouse ABI */];
const FEE_MANAGER_ABI = [/* FeeManager ABI */];
const REGISTRAR_BRIDGE_ABI = [/* RegistrarBridge ABI */];
const ENGLISH_AUCTION_ABI = [/* EnglishAuction ABI */];
const DUTCH_AUCTION_ABI = [/* DutchAuction ABI */];
const SEALED_BID_AUCTION_ABI = [/* SealedBidAuction ABI */];

// Create provider and signer
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Create contract instances
const domainAuctionHouse = new ethers.Contract(
  CONTRACTS.DomainAuctionHouse, 
  DOMAIN_AUCTION_HOUSE_ABI, 
  signer
);

const feeManager = new ethers.Contract(
  CONTRACTS.FeeManager, 
  FEE_MANAGER_ABI, 
  provider
);

const englishAuction = new ethers.Contract(
  CONTRACTS.EnglishAuction, 
  ENGLISH_AUCTION_ABI, 
  provider
);

const dutchAuction = new ethers.Contract(
  CONTRACTS.DutchAuction, 
  DUTCH_AUCTION_ABI, 
  provider
);

const sealedBidAuction = new ethers.Contract(
  CONTRACTS.SealedBidAuction, 
  SEALED_BID_AUCTION_ABI, 
  signer
);

const registrarBridge = new ethers.Contract(
  CONTRACTS.RegistrarBridge, 
  REGISTRAR_BRIDGE_ABI, 
  provider
);
```

## 📝 Complete Integration Flow

### Phase 1: Domain Management

#### 1.1 Get User's Existing Domains
**Contract:** `DomainNFT` at `0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f`
```javascript
// Assume user already has DomainNFT instance connected to Doma's system
const domainNFT = new ethers.Contract(CONTRACTS.DomainNFT, DOMAIN_NFT_ABI, provider);

async function getUserDomains(userAddress) {
  // Get balance of domains owned by user
  const balance = await domainNFT.balanceOf(userAddress);
  console.log(`User owns ${balance} domains`);
  
  const userDomains = [];
  for (let i = 0; i < balance; i++) {
    // Get tokenId by index
    const tokenId = await domainNFT.tokenOfOwnerByIndex(userAddress, i);
    
    // Get domain name
    const domainName = await domainNFT.domainNames(tokenId);
    
    // Get metadata URI
    const tokenURI = await domainNFT.tokenURI(tokenId);
    
    userDomains.push({
      tokenId: tokenId,
      domainName: domainName,
      metadata: tokenURI,
      owner: userAddress
    });
  }
  
  return userDomains;
}
```

### Phase 2: Domain Listing Process

#### 2.1 Approve NFT for Auction House
**Contract:** `DomainNFT` at `0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f`
```javascript
async function approveDomainForAuction(tokenId) {
  const approveTx = await domainNFT.approve(
    CONTRACTS.DomainAuctionHouse, // spender
    tokenId                       // tokenId
  );
  await approveTx.wait();
  console.log(`Domain ${tokenId} approved for auction house`);
  return approveTx.hash;
}
```

#### 2.2 List Domain for Auction
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function listDomainForAuction(tokenId, reservePrice) {
  const listTx = await domainAuctionHouse.list(
    CONTRACTS.DomainNFT,         // nft address
    tokenId,                     // tokenId
    ethers.ZeroAddress,          // paymentToken (0x0 for ETH)
    ethers.parseEther(reservePrice.toString()) // reservePrice in ETH
  );
  
  const receipt = await listTx.wait();
  
  // Get listingId from event logs
  const listEvent = receipt.logs.find(log => {
    try {
      const decoded = domainAuctionHouse.interface.parseLog(log);
      return decoded.name === 'Listed';
    } catch (e) {
      return false;
    }
  });
  
  if (listEvent) {
    const decoded = domainAuctionHouse.interface.parseLog(listEvent);
    const listingId = decoded.args.listingId;
    console.log(`Domain listed with listingId: ${listingId}`);
    return listingId;
  }
  
  throw new Error('Failed to get listing ID from transaction');
}
```

### Phase 3: Auction Configuration

#### 3.1 Set Auction Criteria
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function setAuctionCriteria(listingId, reservePrice, duration, isWhitelisted = false, whitelist = []) {
  // Encode eligibility data
  const eligibilityData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bool", "address[]"],
    [isWhitelisted, whitelist]
  );
  
  const setCriteriaTx = await domainAuctionHouse.setCriteria(
    listingId,                              // listingId
    ethers.parseEther(reservePrice.toString()), // reservePrice
    duration,                               // duration in seconds
    eligibilityData                         // eligibilityData
  );
  
  await setCriteriaTx.wait();
  console.log(`Criteria set for listing ${listingId}`);
  return setCriteriaTx.hash;
}
```

#### 3.2 Choose Auction Strategy

##### A. English Auction Strategy
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function chooseEnglishAuctionStrategy(listingId, incrementBps = 500, antiSnipingEnabled = true) {
  // Encode English auction strategy data
  const strategyData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "bool"],
    [incrementBps, antiSnipingEnabled] // 5% increment, anti-sniping enabled
  );
  
  const chooseStrategyTx = await domainAuctionHouse.chooseStrategy(
    listingId,                    // listingId
    CONTRACTS.EnglishAuction,     // strategy address
    strategyData                  // strategy data
  );
  
  await chooseStrategyTx.wait();
  console.log(`English auction strategy set for listing ${listingId}`);
  return chooseStrategyTx.hash;
}
```

##### B. Dutch Auction Strategy
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function chooseDutchAuctionStrategy(listingId, startPrice, endPrice, isLinear = true) {
  // Encode Dutch auction strategy data
  const strategyData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "uint256", "bool"],
    [
      ethers.parseEther(startPrice.toString()), // startPrice
      ethers.parseEther(endPrice.toString()),   // endPrice
      isLinear                                  // isLinear decline
    ]
  );
  
  const chooseStrategyTx = await domainAuctionHouse.chooseStrategy(
    listingId,                // listingId
    CONTRACTS.DutchAuction,   // strategy address
    strategyData              // strategy data
  );
  
  await chooseStrategyTx.wait();
  console.log(`Dutch auction strategy set for listing ${listingId}`);
  return chooseStrategyTx.hash;
}
```

##### C. Sealed Bid Auction Strategy
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function chooseSealedBidAuctionStrategy(listingId, commitDuration, revealDuration, minimumDeposit) {
  // Encode Sealed Bid auction strategy data
  const strategyData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint256", "uint256", "uint256"],
    [
      commitDuration,                              // commit phase duration
      revealDuration,                              // reveal phase duration
      ethers.parseEther(minimumDeposit.toString()) // minimum deposit
    ]
  );
  
  const chooseStrategyTx = await domainAuctionHouse.chooseStrategy(
    listingId,                      // listingId
    CONTRACTS.SealedBidAuction,     // strategy address
    strategyData                    // strategy data
  );
  
  await chooseStrategyTx.wait();
  console.log(`Sealed bid auction strategy set for listing ${listingId}`);
  return chooseStrategyTx.hash;
}
```

#### 3.3 Start Auction
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function startAuction(listingId, duration) {
  const goLiveTx = await domainAuctionHouse.goLive(
    listingId,  // listingId
    duration    // duration in seconds
  );
  
  await goLiveTx.wait();
  console.log(`Auction ${listingId} started`);
  return goLiveTx.hash;
}
```

### Phase 4: Bidding Process

#### 4.1 English Auction Bidding
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function placeBidEnglishAuction(listingId, bidAmount) {
  const bidAmountWei = ethers.parseEther(bidAmount.toString());
  
  const bidTx = await domainAuctionHouse.placeBid(
    listingId,           // listingId
    bidAmountWei,        // amount
    "0x",              // data (empty for English auction)
    { value: bidAmountWei } // send ETH with transaction
  );
  
  await bidTx.wait();
  console.log(`Bid placed: ${bidAmount} ETH on listing ${listingId}`);
  return bidTx.hash;
}
```

#### 4.2 Dutch Auction Purchase
**Contract:** `DutchAuction` at `0x084DA94314FE36Cf957191A78a7d6395dC951686`
```javascript
async function purchaseDutchAuction(listingId) {
  // Get current price
  const currentPrice = await dutchAuction.getCurrentPrice(listingId, "0x");
  console.log(`Current Dutch auction price: ${ethers.formatEther(currentPrice)} ETH`);
  
  // Purchase at current price
  const purchaseTx = await domainAuctionHouse.placeBid(
    listingId,             // listingId
    currentPrice,          // amount (current price)
    "0x",                // data
    { value: currentPrice } // send ETH equal to current price
  );
  
  await purchaseTx.wait();
  console.log(`Dutch auction purchase completed for ${ethers.formatEther(currentPrice)} ETH`);
  return purchaseTx.hash;
}
```

#### 4.3 Sealed Bid Auction - Commit Phase
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function commitSealedBid(listingId, bidAmount, deposit) {
  // Generate random salt
  const salt = ethers.randomBytes(32);
  
  // Create commitment hash
  const bidAmountWei = ethers.parseEther(bidAmount.toString());
  const commitment = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "bytes32"],
      [bidAmountWei, salt]
    )
  );
  
  // Store salt locally for reveal phase
  const saltHex = ethers.hexlify(salt);
  localStorage.setItem(`sealedBid_${listingId}_salt`, saltHex);
  localStorage.setItem(`sealedBid_${listingId}_amount`, bidAmount.toString());
  
  // Encode commitment data
  const commitData = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32"],
    [commitment]
  );
  
  const depositWei = ethers.parseEther(deposit.toString());
  
  const commitTx = await domainAuctionHouse.placeBid(
    listingId,           // listingId
    depositWei,          // deposit amount
    commitData,          // commitment data
    { value: depositWei } // send deposit
  );
  
  await commitTx.wait();
  console.log(`Sealed bid committed for listing ${listingId}`);
  return commitTx.hash;
}
```

#### 4.4 Sealed Bid Auction - Reveal Phase
**Contract:** `SealedBidAuction` at `0x7Cb994c76074064E6003f7DE048c35A285055c5C`
```javascript
async function revealSealedBid(listingId) {
  // Retrieve stored data
  const saltHex = localStorage.getItem(`sealedBid_${listingId}_salt`);
  const bidAmount = localStorage.getItem(`sealedBid_${listingId}_amount`);
  
  if (!saltHex || !bidAmount) {
    throw new Error('No sealed bid data found for this listing');
  }
  
  const salt = ethers.getBytes(saltHex);
  const bidAmountWei = ethers.parseEther(bidAmount);
  
  // Reveal bid
  const revealTx = await sealedBidAuction.revealBid(
    listingId,    // listingId
    bidAmountWei, // original bid amount
    salt          // salt used in commitment
  );
  
  await revealTx.wait();
  console.log(`Sealed bid revealed for listing ${listingId}`);
  
  // Clean up local storage
  localStorage.removeItem(`sealedBid_${listingId}_salt`);
  localStorage.removeItem(`sealedBid_${listingId}_amount`);
  
  return revealTx.hash;
}
```

### Phase 5: Query Functions

#### 5.1 Get Listing Information
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function getListingInfo(listingId) {
  const listing = await domainAuctionHouse.listings(listingId);
  
  return {
    seller: listing.seller,
    nft: listing.nft,
    tokenId: listing.tokenId.toString(),
    paymentToken: listing.paymentToken,
    reservePrice: ethers.formatEther(listing.reservePrice),
    startTime: Number(listing.startTime),
    endTime: Number(listing.endTime),
    strategy: listing.strategy,
    strategyData: listing.strategyData,
    eligibilityData: listing.eligibilityData,
    status: listing.status
  };
}
```

#### 5.2 Get Highest Bid
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function getHighestBid(listingId) {
  const [bidder, amount] = await domainAuctionHouse.getHighestBid(listingId);
  
  return {
    bidder: bidder,
    amount: ethers.formatEther(amount),
    amountWei: amount.toString()
  };
}
```

#### 5.3 Get Current Dutch Auction Price
**Contract:** `DutchAuction` at `0x084DA94314FE36Cf957191A78a7d6395dC951686`
```javascript
async function getCurrentDutchPrice(listingId) {
  try {
    const currentPrice = await dutchAuction.getCurrentPrice(listingId, "0x");
    return {
      price: ethers.formatEther(currentPrice),
      priceWei: currentPrice.toString()
    };
  } catch (error) {
    console.error('Error getting Dutch auction price:', error);
    return null;
  }
}
```

#### 5.4 Get Fee Preview
**Contract:** `FeeManager` at `0xaCd0B6598768d597Ad6c322f88969E687617Dd28`
```javascript
async function previewFees(nftAddress, tokenId, salePrice) {
  const salePriceWei = ethers.parseEther(salePrice.toString());
  
  const [marketplaceFee, protocolFee, royaltyAmount, royaltyRecipient, netAmount] = 
    await feeManager.previewFees(nftAddress, tokenId, salePriceWei);
  
  return {
    marketplaceFee: ethers.formatEther(marketplaceFee),
    protocolFee: ethers.formatEther(protocolFee),
    royaltyAmount: ethers.formatEther(royaltyAmount),
    royaltyRecipient: royaltyRecipient,
    netAmount: ethers.formatEther(netAmount),
    totalFees: ethers.formatEther(marketplaceFee + protocolFee + royaltyAmount)
  };
}
```

### Phase 6: Auction Management

#### 6.1 End Auction
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function endAuction(listingId) {
  const endTx = await domainAuctionHouse.endAuction(listingId);
  await endTx.wait();
  console.log(`Auction ${listingId} ended`);
  return endTx.hash;
}
```

#### 6.2 Settle Auction
**Contract:** `DomainAuctionHouse` at `0x346d94b66072D8b9d678058073A0fe7eF449f03f`
```javascript
async function settleAuction(listingId) {
  const settleTx = await domainAuctionHouse.settle(listingId);
  await settleTx.wait();
  console.log(`Auction ${listingId} settled`);
  return settleTx.hash;
}
```

### Phase 7: Event Listening

```javascript
// Listen to auction events
domainAuctionHouse.on("Listed", (listingId, seller, nft, tokenId, paymentToken, reservePrice) => {
  console.log(`New listing created: ${listingId}`);
  // Update UI with new listing
});

domainAuctionHouse.on("BidPlaced", (listingId, bidder, amount) => {
  console.log(`New bid: ${ethers.formatEther(amount)} ETH on listing ${listingId}`);
  // Update UI with new bid
});

domainAuctionHouse.on("AuctionEnded", (listingId, winner, winningBid) => {
  console.log(`Auction ${listingId} ended. Winner: ${winner}, Amount: ${ethers.formatEther(winningBid)} ETH`);
  // Update UI to show auction ended
});

domainAuctionHouse.on("Settled", (listingId, winner, finalPrice) => {
  console.log(`Auction ${listingId} settled. Winner: ${winner}, Final price: ${ethers.formatEther(finalPrice)} ETH`);
  // Update UI to show completed transaction
});

// Listen to strategy-specific events
englishAuction.on("BidPlaced", (listingId, bidder, amount) => {
  console.log(`English auction bid: ${ethers.formatEther(amount)} ETH`);
});

dutchAuction.on("AuctionSold", (listingId, winner, price) => {
  console.log(`Dutch auction sold: ${ethers.formatEther(price)} ETH`);
});

sealedBidAuction.on("CommitmentMade", (listingId, bidder, commitment) => {
  console.log(`Sealed bid commitment made for listing ${listingId}`);
});

sealedBidAuction.on("BidRevealed", (listingId, bidder, bidAmount) => {
  console.log(`Sealed bid revealed: ${ethers.formatEther(bidAmount)} ETH`);
});
```

## 🛠️ Error Handling

```javascript
// Common error handling patterns
async function handleTransactionErrors(txPromise, operation) {
  try {
    const tx = await txPromise;
    const receipt = await tx.wait();
    console.log(`${operation} successful:`, receipt.hash);
    return receipt;
  } catch (error) {
    console.error(`${operation} failed:`, error);
    
    if (error.message.includes("InvalidBid")) {
      throw new Error("Your bid is invalid. Please check the minimum bid amount.");
    } else if (error.message.includes("AuctionNotActive")) {
      throw new Error("This auction is not currently active.");
    } else if (error.message.includes("insufficient funds")) {
      throw new Error("Insufficient ETH balance for this transaction.");
    } else if (error.message.includes("User denied")) {
      throw new Error("Transaction was cancelled by user.");
    } else {
      throw new Error(`${operation} failed: ${error.message}`);
    }
  }
}

// Usage example
try {
  await handleTransactionErrors(
    domainAuctionHouse.placeBid(listingId, bidAmount, "0x", { value: bidAmount }),
    "Place Bid"
  );
} catch (error) {
  // Show user-friendly error message
  alert(error.message);
}
```

## 📋 Integration Checklist

### ✅ Setup Phase
- [ ] Add Doma Testnet to wallet configuration
- [ ] Connect to deployed contract addresses
- [ ] Create contract instances with provided ABIs
- [ ] Test network connection and contract accessibility

### ✅ Core Features
- [ ] Implement domain fetching from user's wallet
- [ ] Build domain approval flow
- [ ] Create listing functionality
- [ ] Implement auction criteria setting
- [ ] Add all three auction strategy options
- [ ] Build bidding interfaces for each strategy type
- [ ] Add auction management (start/end/settle)

### ✅ Advanced Features
- [ ] Real-time event listeners for auction updates
- [ ] Fee preview functionality
- [ ] Current price tracking for Dutch auctions
- [ ] Sealed bid commitment/reveal flow
- [ ] Comprehensive error handling
- [ ] Transaction status tracking

### ✅ Testing
- [ ] Test complete auction flow on Doma Testnet
- [ ] Verify all auction strategies work correctly
- [ ] Test error scenarios and edge cases
- [ ] Validate event listening and UI updates
- [ ] Performance testing with multiple concurrent auctions

## 🎯 Key Success Metrics

- **Transaction Success Rate**: > 95%
- **Average Response Time**: < 3 seconds
- **Event Update Latency**: < 5 seconds
- **Error Recovery**: Graceful error handling with user-friendly messages

---

This comprehensive integration guide provides everything needed to integrate the Auctra Domain Auction House smart contracts with your frontend application on Doma Testnet.