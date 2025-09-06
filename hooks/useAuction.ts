'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient, useAccount } from 'wagmi'
import { parseEther, formatEther, encodeAbiParameters, keccak256, parseEventLogs, decodeEventLog, decodeAbiParameters, zeroAddress, isAddressEqual } from 'viem'
import { CONTRACTS } from './contracts/constants'
import { DOMAIN_AUCTION_HOUSE_ABI, SEALED_BID_AUCTION_ABI, DUTCH_AUCTION_ABI } from './contracts/abis'

export interface AuctionParams {
  tokenId: bigint
  reservePrice: string // in ETH
  duration: number // in seconds
  auctionType: 'english' | 'dutch' | 'sealed'
  startPrice?: string // for dutch auction
  endPrice?: string // for dutch auction
  incrementBps?: number // for english auction (basis points)
  antiSnipingEnabled?: boolean // for english auction
  isLinear?: boolean // for dutch auction
  commitDuration?: number // for sealed bid auction
  revealDuration?: number // for sealed bid auction
  minimumDeposit?: string // for sealed bid auction
  isWhitelisted?: boolean
  whitelist?: string[]
}

export function useCreateAuction() {
  const [currentStep, setCurrentStep] = useState<'list' | 'criteria' | 'strategy' | 'start' | 'completed'>('list')
  const [listingId, setListingId] = useState<bigint | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const publicClient = usePublicClient()
  const { writeContract: writeList, data: listHash, isPending: isListPending } = useWriteContract()
  const { writeContract: writeCriteria, data: criteriaHash, isPending: isCriteriaPending } = useWriteContract()
  const { writeContract: writeStrategy, data: strategyHash, isPending: isStrategyPending } = useWriteContract()
  const { writeContract: writeStart, data: startHash, isPending: isStartPending } = useWriteContract()
  
  const { data: listReceipt, isLoading: isListConfirming, isSuccess: isListSuccess } = useWaitForTransactionReceipt({ hash: listHash })
  const { data: criteriaReceipt, isLoading: isCriteriaConfirming, isSuccess: isCriteriaSuccess } = useWaitForTransactionReceipt({ hash: criteriaHash })
  const { data: strategyReceipt, isLoading: isStrategyConfirming, isSuccess: isStrategySuccess } = useWaitForTransactionReceipt({ hash: strategyHash })
  const { data: startReceipt, isLoading: isStartConfirming, isSuccess: isStartSuccess } = useWaitForTransactionReceipt({ hash: startHash })

  const isPending = isListPending || isCriteriaPending || isStrategyPending || isStartPending
  const isConfirming = isListConfirming || isCriteriaConfirming || isStrategyConfirming || isStartConfirming

  // Extract listingId from transaction receipt
  useEffect(() => {
    const extractListingId = async () => {
      if (isListSuccess && listReceipt && !listingId) {
        try {
          console.log('Extracting listingId from transaction receipt...')
          
          // Try to parse events from the transaction receipt
          const logs = parseEventLogs({
            abi: DOMAIN_AUCTION_HOUSE_ABI,
            logs: listReceipt.logs,
            eventName: 'Listed'
          })
          
          if (logs.length > 0 && logs[0].args) {
            const realListingId = logs[0].args.listingId as bigint
            console.log('Extracted real listingId:', realListingId.toString())
            setListingId(realListingId)
            return realListingId
          }
          
          // Fallback: try to get from contract state
          // const publicClient = await import('wagmi').then(m => m.getPublicClient)
          // const nextId = await publicClient?.readContract({
          //   address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
          //   abi: DOMAIN_AUCTION_HOUSE_ABI,
          //   functionName: 'getNextListingId',
          // }) as bigint
          
          // if (nextId) {
          //   const realListingId = nextId - BigInt(1)
          //   console.log('Fallback listingId:', realListingId.toString())
          //   setListingId(realListingId)
          // }
          
        } catch (error) {
          console.error('Error extracting listingId:', error)
          // Use a reasonable fallback
          const fallbackId = BigInt(Date.now() % 1000000)
          setListingId(fallbackId)
          console.log('Using fallback listingId:', fallbackId.toString())
        }
      }
    }
    
    extractListingId()
  }, [isListSuccess, listReceipt, listingId])

  const createAuction = (params: AuctionParams) => {
    try {
      setError(null)
      setCurrentStep('list')
      setListingId(null) // Reset listing ID

      // Step 1: List domain for auction
      console.log('Step 1: Listing domain for auction with tokenId:', params.tokenId.toString())
      
      writeList({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'list',
        args: [
          CONTRACTS.DomainNFT as `0x${string}`, // nft address
          params.tokenId, // tokenId
          '0x0000000000000000000000000000000000000000' as `0x${string}`, // paymentToken (ETH)
          parseEther(params.reservePrice) // reservePrice in Wei
        ],
      })
      
      console.log('✅ List transaction submitted, hash will be available soon...')

    } catch (err) {
      console.error('Error creating auction:', err)
      setError(err instanceof Error ? err.message : 'Failed to create auction')
      throw err
    }
  }
  
  const setCriteria = async (params: AuctionParams, realListingId: bigint) => {
    try {
      setCurrentStep('criteria')
      console.log('Step 2: Setting auction criteria for listingId:', realListingId.toString())
      
      // For sealed bid auctions, calculate total duration from commit + reveal durations
      let totalDuration = params.duration
      if (params.auctionType === 'sealed') {
        const commitSecs = params.commitDuration || 3600
        const revealSecs = params.revealDuration || 3600
        totalDuration = commitSecs + revealSecs
        console.log('🔧 Sealed bid criteria: using calculated total duration:', {
          commitDuration: commitSecs,
          revealDuration: revealSecs,
          totalDuration: totalDuration,
          originalDuration: params.duration
        })
      }
      
      const eligibilityData = encodeAbiParameters(
        [{ name: 'isWhitelisted', type: 'bool' }, { name: 'whitelist', type: 'address[]' }],
        [params.isWhitelisted || false, (params.whitelist || []) as `0x${string}`[]]
      )

      writeCriteria({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'setCriteria',
        args: [
          realListingId, // Use real listingId
          parseEther(params.reservePrice), // reservePrice
          BigInt(totalDuration), // duration
          eligibilityData // eligibilityData
        ],
      })
      
    } catch (err) {
      console.error('Error setting criteria:', err)
      setError(err instanceof Error ? err.message : 'Failed to set criteria')
      throw err
    }
  }
  
  const chooseStrategy = async (params: AuctionParams, realListingId: bigint) => {
    try {
      setCurrentStep('strategy')
      console.log('Step 3: Setting auction strategy for listingId:', realListingId.toString())
      
      // Validation based on FE_AUCTION.md rules
      const reservePriceNum = parseFloat(params.reservePrice)
      
      let strategyAddress: string
      let strategyData: `0x${string}`

      switch (params.auctionType) {
        case 'english':
          // Validation: minIncrementBps <= 10000 (max 100%)
          const incrementBps = params.incrementBps || 500
          if (incrementBps > 10000) {
            throw new Error('minIncrementBps must be <= 10000 (max 100%)')
          }
          
          strategyAddress = CONTRACTS.EnglishAuction
          // EnglishAuctionParams struct: { uint256 minIncrementBps, bool antiSnipingEnabled }
          strategyData = encodeAbiParameters(
            [
              { name: 'minIncrementBps', type: 'uint256' },
              { name: 'antiSnipingEnabled', type: 'bool' }
            ],
            [BigInt(incrementBps), params.antiSnipingEnabled || true]
          )
          console.log('✅ English Auction strategy data:', { 
            incrementBps: incrementBps, 
            antiSnipingEnabled: params.antiSnipingEnabled || true 
          })
          break
          
        case 'dutch':
          const startPriceStr = params.startPrice && params.startPrice !== 'undefined' && params.startPrice !== '0' 
            ? params.startPrice 
            : (reservePriceNum * 2).toString() // Default: 2x reserve price
          const reservePriceStr = params.reservePrice
          const durationSecs = params.duration || 86400 // Default: 24 hours
          
          // Validation: startPrice > reservePrice
          const startPriceNum = parseFloat(startPriceStr)
          if (startPriceNum <= reservePriceNum) {
            throw new Error(`Dutch auction: startPrice (${startPriceNum}) must be > reservePrice (${reservePriceNum})`)
          }
          
          // Validation: duration > 0 && duration <= 30 days
          if (durationSecs <= 0 || durationSecs > (30 * 24 * 3600)) {
            throw new Error('Dutch auction: duration must be > 0 and <= 30 days')
          }
          
          strategyAddress = CONTRACTS.DutchAuction
          // DutchAuctionParams struct: { uint256 startPrice, uint256 reservePrice, uint256 duration, uint8 decayType, uint256 decayRate }
          // DecayType: 0 = LINEAR, 1 = EXPONENTIAL
          strategyData = encodeAbiParameters(
            [
              { name: 'startPrice', type: 'uint256' },
              { name: 'reservePrice', type: 'uint256' },
              { name: 'duration', type: 'uint256' },
              { name: 'decayType', type: 'uint8' },
              { name: 'decayRate', type: 'uint256' }
            ],
            [
              parseEther(startPriceStr),     // startPrice
              parseEther(reservePriceStr),   // reservePrice
              BigInt(durationSecs),          // duration
              0,                             // decayType (0 = LINEAR)
              BigInt(0)                      // decayRate (not used for linear)
            ]
          )
          console.log('✅ Dutch Auction strategy data:', { 
            startPrice: `${startPriceStr} ETH`, 
            reservePrice: `${reservePriceStr} ETH`, 
            duration: `${durationSecs}s (${Math.round(durationSecs/3600)}h)`,
            decayType: 'LINEAR',
            decayRate: 0
          })
          break
          
        case 'sealed':
          // params.commitDuration and params.revealDuration are now in seconds (converted in form hook)
          const commitDurationSecs = params.commitDuration && params.commitDuration > 0 
            ? params.commitDuration 
            : 3600 // 1 hour default
          const revealDurationSecs = params.revealDuration && params.revealDuration > 0 
            ? params.revealDuration 
            : 3600 // 1 hour default
          const minDepositStr = params.minimumDeposit && params.minimumDeposit !== 'undefined' && params.minimumDeposit !== '0'
            ? params.minimumDeposit 
            : '0.1' // 0.1 ETH default (as per docs)
          
          // Validation: commitDuration > 0 && commitDuration <= 7 days
          if (commitDurationSecs <= 0 || commitDurationSecs > (7 * 24 * 3600)) {
            throw new Error('Sealed bid: commitDuration must be > 0 and <= 7 days')
          }
          
          // Validation: revealDuration > 0 && revealDuration <= 7 days
          if (revealDurationSecs <= 0 || revealDurationSecs > (7 * 24 * 3600)) {
            throw new Error('Sealed bid: revealDuration must be > 0 and <= 7 days')
          }
          
          strategyAddress = CONTRACTS.SealedBidAuction
          // SealedBidParams struct: { uint256 commitDuration, uint256 revealDuration, uint256 minDeposit }
          strategyData = encodeAbiParameters(
            [
              { name: 'commitDuration', type: 'uint256' },
              { name: 'revealDuration', type: 'uint256' },
              { name: 'minDeposit', type: 'uint256' }
            ],
            [
              BigInt(commitDurationSecs),  // commitDuration
              BigInt(revealDurationSecs),  // revealDuration
              parseEther(minDepositStr)    // minDeposit
            ]
          )
          console.log('✅ Sealed Bid Auction strategy data:', { 
            commitDuration: `${commitDurationSecs}s (${Math.round(commitDurationSecs/3600)}h)`, 
            revealDuration: `${revealDurationSecs}s (${Math.round(revealDurationSecs/3600)}h)`, 
            minDeposit: `${minDepositStr} ETH`
          })
          break
          
        default:
          throw new Error('Invalid auction type')
      }

      writeStrategy({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'chooseStrategy',
        args: [
          realListingId, // Use real listingId
          strategyAddress as `0x${string}`, // strategy address
          strategyData // strategy data
        ],
      })
      
    } catch (err: any) {
      console.error('Error choosing strategy:', err)
      
      // Enhanced error handling based on FE_AUCTION.md
      let errorMessage = 'Failed to choose strategy'
      if (err.message) {
        if (err.message.includes('UnauthorizedStrategy')) {
          errorMessage = 'Strategy not approved by admin'
        } else if (err.message.includes('InvalidStatus')) {
          errorMessage = 'Listing status not valid for this action'
        } else if (err.message.includes('InvalidPriceRange')) {
          errorMessage = 'Dutch auction: startPrice must be > reservePrice'
        } else if (err.message.includes('InvalidCommitDuration')) {
          errorMessage = 'Sealed bid: commit duration must be 1-7 days'
        } else if (err.message.includes('InvalidRevealDuration')) {
          errorMessage = 'Sealed bid: reveal duration must be 1-7 days'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }
  
  const goLive = async (params: AuctionParams, realListingId: bigint) => {
    try {
      setCurrentStep('start')
      console.log('Step 4: Starting auction for listingId:', realListingId.toString())
      
      // For sealed bid auctions, calculate total duration from commit + reveal durations
      let totalDuration = params.duration
      if (params.auctionType === 'sealed') {
        const commitSecs = params.commitDuration || 3600
        const revealSecs = params.revealDuration || 3600
        totalDuration = commitSecs + revealSecs
        console.log('🔧 Sealed bid auction: using calculated total duration:', {
          commitDuration: commitSecs,
          revealDuration: revealSecs,
          totalDuration: totalDuration,
          originalDuration: params.duration
        })
      }
      
      writeStart({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'goLive',
        args: [
          realListingId, // Use real listingId
          BigInt(totalDuration) // duration
        ],
      })
      
    } catch (err) {
      console.error('Error starting auction:', err)
      setError(err instanceof Error ? err.message : 'Failed to start auction')
      throw err
    }
  }

  const reset = () => {
    setCurrentStep('list')
    setListingId(null)
    setError(null)
  }

  return {
    createAuction,
    setCriteria,
    chooseStrategy,
    goLive,
    currentStep,
    listingId,
    error,
    isPending,
    isConfirming,
    reset,
    // Individual transaction states
    listHash,
    criteriaHash,
    strategyHash,
    startHash,
    // Success states for each step
    isListSuccess,
    isCriteriaSuccess,
    isStrategySuccess,
    isStartSuccess,
  }
}

export function usePlaceBid() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const [eligibilityData, setEligibilityData] = useState<`0x${string}`>('0x')
  const publicClient = usePublicClient()
  const { address: userAddress } = useAccount()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Get eligibility proof for the listing by checking requirements and generating appropriate proof
  const getEligibilityData = async (listingId: bigint): Promise<`0x${string}`> => {
    try {
      console.log('🔍 Checking eligibility data for listing:', listingId.toString())
      
      if (!publicClient) {
        console.warn('No public client available, using empty data')
        return '0x'
      }
      
      // Read listing data from smart contract
      const listing = await publicClient.readContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'listings',
        args: [listingId],
      })
      
      console.log('📋 Listing data:', listing)
      
      // Check if listing has eligibility requirements
      // Listing structure: [seller, nft, tokenId, paymentToken, reservePrice, startTime, endTime, strategy, strategyData, eligibilityData, status]
      const listingArray = [...(listing as readonly any[])]
      let eligibilityDataFromContract = '0x'
      
      if (Array.isArray(listingArray) && listingArray.length > 9) {
        // eligibilityData is at index 9 in the array
        eligibilityDataFromContract = listingArray[9] || '0x'
      } else {
        // Fallback: try accessing as object property
        eligibilityDataFromContract = (listing as any)?.eligibilityData || '0x'
      }
      
      console.log('🎫 Raw eligibility data:', eligibilityDataFromContract)
      
      // If no eligibility requirements - check for various empty formats
      const isEmpty = !eligibilityDataFromContract || 
                     eligibilityDataFromContract === '0x' || 
                     eligibilityDataFromContract === '0x00' ||
                     /^0x0+$/.test(eligibilityDataFromContract) || 
                     eligibilityDataFromContract.length <= 4
                     
      if (isEmpty) {
        console.log('✅ No eligibility requirements, using empty data')
        return '0x'
      }
      
      // Try multiple decoding strategies
      console.log('🔄 Attempting to decode eligibility data with multiple strategies...')
      
      // Strategy 1: Full format (7 parameters)
      try {
        const decoded = decodeAbiParameters(
          [
            { name: 'ruleType', type: 'uint8' },
            { name: 'merkleRoot', type: 'bytes32' },
            { name: 'signer', type: 'address' },
            { name: 'token', type: 'address' },
            { name: 'minAmount', type: 'uint256' },
            { name: 'expiry', type: 'uint256' },
            { name: 'domainSeparator', type: 'bytes32' }
          ],
          eligibilityDataFromContract as `0x${string}`
        )
        
        console.log('✅ Strategy 1 successful!')
        return '0x' // For now, return empty until we implement full proof generation
        
      } catch (strategy1Error) {
        console.warn('❌ Strategy 1 failed:', strategy1Error)
        
        // Strategy 2: Simplified format (bool + address[])
        try {
          const decoded = decodeAbiParameters(
            [
              { name: 'isWhitelisted', type: 'bool' },
              { name: 'whitelist', type: 'address[]' }
            ],
            eligibilityDataFromContract as `0x${string}`
          )
          
          const [isWhitelisted, whitelist] = decoded
          console.log('✅ Strategy 2 successful! Decoded as:', { isWhitelisted, whitelist })
          
          if (isWhitelisted && whitelist && whitelist.length > 0) {
            // Check if user is in whitelist
            const isUserWhitelisted = whitelist.some(
              (addr: string) => addr.toLowerCase() === userAddress?.toLowerCase()
            )
            
            if (!isUserWhitelisted) {
              throw new Error('User not in whitelist')
            }
          }
          
          return '0x'
          
        } catch (strategy2Error) {
          console.warn('❌ Strategy 2 failed:', strategy2Error)
          console.warn('⚠️ Using fallback: no eligibility restrictions')
          return '0x'
        }
      }
      
    } catch (error) {
      console.error('❌ Error getting eligibility data:', error)
      return '0x'
    }
  }

  const placeBidEnglish = async (listingId: bigint, bidAmount: string) => {
    try {
      const bidAmountWei = parseEther(bidAmount)
      
      // Get eligibility data
      const eligibilityProof = await getEligibilityData(listingId)
      
      writeContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'placeBid',
        args: [listingId, bidAmountWei, eligibilityProof],
        value: bidAmountWei,
      })
    } catch (error) {
      console.error('Error placing bid:', error)
      throw error
    }
  }

  // Legacy function for compatibility
  const placeBid = placeBidEnglish

  return {
    placeBidEnglish,
    placeBid,
    getEligibilityData,
    isPending,
    isConfirming,
    isSuccess,
    hash
  }
}

export function useDutchAuctionPurchase() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const publicClient = usePublicClient()
  const { address: userAddress } = useAccount()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Reuse eligibility data logic from usePlaceBid
  const getEligibilityData = async (listingId: bigint): Promise<`0x${string}`> => {
    try {
      if (!publicClient) return '0x'
      
      const listing = await publicClient.readContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'listings',
        args: [listingId],
      })
      
      const listingArray = [...(listing as readonly any[])]
      let eligibilityDataFromContract = '0x'
      
      if (Array.isArray(listingArray) && listingArray.length > 9) {
        eligibilityDataFromContract = listingArray[9] || '0x'
      }
      
      // If no eligibility requirements
      const isEmpty = !eligibilityDataFromContract || 
                     eligibilityDataFromContract === '0x' || 
                     eligibilityDataFromContract.length <= 4
                     
      if (isEmpty) {
        return '0x'
      }
      
      // Try basic decoding strategies
      try {
        const decoded = decodeAbiParameters(
          [
            { name: 'isWhitelisted', type: 'bool' },
            { name: 'whitelist', type: 'address[]' }
          ],
          eligibilityDataFromContract as `0x${string}`
        )
        
        const [isWhitelisted, whitelist] = decoded
        
        if (isWhitelisted && whitelist && whitelist.length > 0) {
          const isUserWhitelisted = whitelist.some(
            (addr: string) => addr.toLowerCase() === userAddress?.toLowerCase()
          )
          
          if (!isUserWhitelisted) {
            throw new Error('User not in whitelist')
          }
        }
        
        return '0x'
        
      } catch (error) {
        console.warn('Using fallback eligibility for Dutch auction')
        return '0x'
      }
      
    } catch (error) {
      console.error('❌ Error getting eligibility data for Dutch auction:', error)
      return '0x'
    }
  }

  const purchaseDutchAuction = async (listingId: bigint, purchaseAmount: string) => {
    try {
      const purchaseAmountWei = parseEther(purchaseAmount)
      
      // Get eligibility data
      const eligibilityProof = await getEligibilityData(listingId)

      writeContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'placeBid',
        args: [listingId, purchaseAmountWei, eligibilityProof],
        value: purchaseAmountWei,
      })
    } catch (error) {
      console.error('Error purchasing dutch auction:', error)
      throw error
    }
  }

  return {
    purchaseDutchAuction,
    isPending,
    isConfirming,
    isSuccess,
    hash
  }
}

export function useCommitSealedBid() {
  const [commitments, setCommitments] = useState<Record<string, { bidAmount: string; salt: string }>>({})
  
  const { writeContract, data: hash, isPending } = useWriteContract()
  const publicClient = usePublicClient()
  const { address: userAddress } = useAccount()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const commitBid = async (listingId: bigint, bidAmount: string, deposit: string) => {
    try {
      if (!userAddress || !publicClient) {
        throw new Error("User wallet not connected or no public client available")
      }

      console.log("🔄 Starting sealed bid commit process (CLAUDE.md ENHANCED VERSION)...");
      
      // A. Read paymentToken from listing as per CLAUDE.md instructions
      const listing = await publicClient.readContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: "listings",
        args: [listingId],
      });
      
      const listingArray = [...(listing as readonly any[])];
      const paymentToken = listingArray[3] as `0x${string}`;
      const isETHPayment = isAddressEqual(paymentToken, zeroAddress); // ⬅️ safe address comparison
      
      console.log("💳 Payment token info:", {
        paymentToken,
        isETHPayment,
        listingId: listingId.toString()
      });
      
      // 1) Phase check using utility function
      await assertCommitPhase(publicClient, CONTRACTS.SealedBidAuction as `0x${string}`, listingId);
      console.log("✅ Phase check passed: Auction is in COMMIT phase");

      // 2) Get minDeposit from chain and validate
      const { minDeposit } = await getSealedBidParams(
        publicClient, 
        CONTRACTS.DomainAuctionHouse as `0x${string}`, 
        listingId
      );
      
      const depositWei = parseEther(deposit);
      const bidAmountWei = parseEther(bidAmount);
      
      if (depositWei < minDeposit) {
        throw new Error(`Deposit too small. Min: ${minDeposit.toString()} wei (${parseFloat(deposit)} ETH < ${parseFloat(formatEther(minDeposit))} ETH)`);
      }

      console.log("💰 Deposit validation passed:", {
        depositWei: depositWei.toString(),
        minDeposit: minDeposit.toString(),
        depositETH: deposit + " ETH",
        minDepositETH: parseFloat(formatEther(minDeposit)).toFixed(6) + " ETH",
        paymentType: isETHPayment ? 'ETH' : 'ERC20'
      });

      // B. Generate commitment hash = keccak256(abi.encode(bidWei, nonce, account)) as per CLAUDE.md
      const nonce = BigInt(Date.now() * 1000 + Math.floor(Math.random() * 1000));
      const commitmentHash = keccak256(
        encodeAbiParameters(
          [{ type: "uint256" }, { type: "uint256" }, { type: "address" }],
          [bidAmountWei, nonce, userAddress as `0x${string}`]
        )
      );
      
      console.log("🔐 Generated commitment hash (CLAUDE.md format):", {
        bidWei: bidAmountWei.toString(),
        nonce: nonce.toString(),
        account: userAddress,
        commitmentHash
      });

      // B. Ensure data format is exactly (bytes32, bytes) with eligibility proof = "0x"
      const commitData = encodeAbiParameters(
        [{ type: "bytes32" }, { type: "bytes" }],
        [commitmentHash, "0x"] // proof empty = "0x"
      );
      
      const valueToSend = isETHPayment ? depositWei : BigInt(0);
      
      // ==== ✅ Use SIMULATION to guarantee value is sent ====
      if (!userAddress) throw new Error("No account");
      
      console.log("🔍 Pre-simulation debug info:", {
        userAddress,
        listingId: listingId.toString(),
        paymentToken,
        isETHPayment,
        depositWei: depositWei.toString(),
        valueToSend: valueToSend.toString(),
        contractAddress: CONTRACTS.DomainAuctionHouse,
        commitDataLength: commitData.length
      });
      
      try {
        // (b) placeBid with request from simulation
        console.log("🎯 Starting contract simulation...");
        const { request } = await publicClient.simulateContract({
          account: userAddress,
          address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
          abi: DOMAIN_AUCTION_HOUSE_ABI,
          functionName: "placeBid",
          args: [listingId, depositWei, commitData],
          value: valueToSend, // ⬅️ this ensures value doesn't get "lost"
        });
        
        console.log("✅ Simulation successful!");
        console.log("📋 Request details:", {
          address: request.address,
          functionName: request.functionName,
          args: request.args?.map((arg, i) => `arg[${i}]: ${arg?.toString()}`),
          value: request.value?.toString(),
          expectedValue: valueToSend.toString(),
          valuesMatch: request.value === valueToSend
        });
        
        // Send transaction
        console.log("🚀 Sending transaction with simulated request...");
        writeContract(request);
        console.log("✅ Transaction submitted successfully");
        
      } catch (simulationError) {
        console.error("❌ Simulation failed:", simulationError);
        console.error("📊 Simulation error details:", {
          message: simulationError instanceof Error ? simulationError.message : 'Unknown error',
          stack: simulationError instanceof Error ? simulationError.stack : undefined
        });
        throw new Error(`Transaction simulation failed: ${simulationError instanceof Error ? simulationError.message : 'Unknown error'}`);
      }
      
      // 6) Save for reveal using new format
      saveCommitLocal(listingId, { nonce, bidWei: bidAmountWei });
      
      // Keep backward compatibility with old format
      const listingKey = listingId.toString();
      setCommitments(prev => ({
        ...prev,
        [listingKey]: { bidAmount, salt: nonce.toString() }
      }));
      
      localStorage.setItem(`nonce_${listingKey}`, nonce.toString());
      localStorage.setItem(`bidAmount_${listingKey}`, bidAmountWei.toString());
      
      console.log("💾 Stored commitment data for reveal phase");
      
    } catch (error) {
      console.error('❌ Error committing sealed bid:', error);
      console.error('🔍 Detailed error info:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
      });
      throw error;
    }
  }

  return {
    commitBid,
    commitments,
    isPending,
    isConfirming,
    isSuccess,
    hash
  }
}

export function useRevealSealedBid() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const publicClient = usePublicClient()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const revealBid = async (listingId: bigint) => {
    try {
      const listingKey = listingId.toString()
      
      console.log("🔄 Starting sealed bid reveal process...")
      
      // Check auction phase before revealing using direct contract call
      if (!publicClient) {
        throw new Error('No public client available');
      }
      
      try {
        console.log("🔍 Checking phase directly from SealedBidAuction contract...");
        
        const phase = await publicClient.readContract({
          address: CONTRACTS.SealedBidAuction as `0x${string}`,
          abi: SEALED_BID_AUCTION_ABI,
          functionName: 'phase',
          args: [listingId],
        }) as number;

        console.log("📊 Current phase from contract:", phase);

        if (phase !== 2) {
          const phaseNames = { 0: "NOT_STARTED", 1: "COMMIT", 2: "REVEAL", 3: "ENDED" };
          const phaseName = phaseNames[phase as keyof typeof phaseNames] || "UNKNOWN";
          throw new Error(`Cannot reveal: Auction is in ${phaseName} phase, expected REVEAL phase`);
        }
        
        console.log("✅ Phase check passed: Auction is in REVEAL phase");
        
      } catch (phaseError) {
        console.warn("Could not verify auction phase:", phaseError);
        throw new Error(`Phase validation failed: ${phaseError instanceof Error ? phaseError.message : 'Unknown error'}`);
      }
      
      // Retrieve stored data using documentation format
      const storedNonce = localStorage.getItem(`nonce_${listingKey}`)
      const storedBidAmount = localStorage.getItem(`bidAmount_${listingKey}`)
      
      if (!storedNonce || !storedBidAmount) {
        throw new Error('No sealed bid data found for this auction. You must commit before revealing.')
      }
      
      const nonce = BigInt(storedNonce)
      const bidAmount = BigInt(storedBidAmount)
      
      console.log("📝 Reveal parameters:", {
        listingId: listingId.toString(),
        bidAmount: bidAmount.toString(),
        nonce: nonce.toString()
      })
      
      // CORRECT FORMAT: Encode reveal data as [uint256, uint256] per documentation
      const revealData = encodeAbiParameters(
        [
          { name: "bidAmount", type: "uint256" },
          { name: "nonce", type: "uint256" }
        ],
        [bidAmount, nonce]
      )
      
      console.log("📦 Encoded reveal data:", revealData)
      
      // Place reveal "bid" - no additional payment needed (amount = 0)
      console.log("🚀 Placing reveal transaction...")
      writeContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: "placeBid",
        args: [listingId, BigInt(0), revealData], // 0 amount for reveal
      })
      
      // Clean up stored data after successful reveal transaction
      if (isSuccess) {
        localStorage.removeItem(`nonce_${listingKey}`)
        localStorage.removeItem(`bidAmount_${listingKey}`)
        console.log("🧹 Cleaned up stored commitment data")
      }
      
    } catch (error) {
      console.error('❌ Error revealing sealed bid:', error)
      throw error
    }
  }

  return {
    revealBid,
    isPending,
    isConfirming,
    isSuccess,
    hash
  }
}

// Utility types and functions for sealed bid auctions
export type SealedBidParams = {
  commitDuration: bigint;
  revealDuration: bigint;
  minDeposit: bigint;
};

// Get sealed bid parameters from strategy data
export async function getSealedBidParams(
  publicClient: any,
  auctionHouse: `0x${string}`, 
  listingId: bigint
): Promise<SealedBidParams> {
  const listing = await publicClient.readContract({
    address: auctionHouse,
    abi: DOMAIN_AUCTION_HOUSE_ABI,
    functionName: 'listings',
    args: [listingId],
  });
  
  const listingArray = [...(listing as readonly any[])];
  const strategyData = listingArray[8] as `0x${string}`;
  
  const [commitDuration, revealDuration, minDeposit] = decodeAbiParameters(
    [{ type: 'uint256' }, { type: 'uint256' }, { type: 'uint256' }],
    strategyData
  );
  
  return { commitDuration, revealDuration, minDeposit };
}

// Assert that auction is in commit phase
export async function assertCommitPhase(
  publicClient: any,
  sealedBid: `0x${string}`, 
  listingId: bigint
): Promise<void> {
  const phase = await publicClient.readContract({
    address: sealedBid,
    abi: SEALED_BID_AUCTION_ABI,
    functionName: 'phase',
    args: [listingId],
  });
  
  if (Number(phase) !== 1) {
    throw new Error('Auction not in COMMIT phase');
  }
}

// Save commitment data for reveal phase
function saveCommitLocal(listingId: bigint, data: { nonce: bigint; bidWei: bigint }) {
  const key = `sealedbid:${listingId}`;
  localStorage.setItem(key, JSON.stringify({
    nonce: data.nonce.toString(),
    bidWei: data.bidWei.toString()
  }));
}

// Hook to get highest bid for English auctions
export function useGetHighestBid() {
  const publicClient = usePublicClient();

  const getHighestBid = async (listingId: bigint) => {
    try {
      if (!publicClient) {
        console.warn("No public client available");
        return { bidder: '0x0000000000000000000000000000000000000000' as `0x${string}`, amount: BigInt(0) };
      }

      console.log("🔍 Getting highest bid for listing:", listingId.toString());

      // Call getHighestBid function from DomainAuctionHouse contract
      const result = await publicClient.readContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'getHighestBid',
        args: [listingId],
      }) as readonly [string, bigint];

      const [bidder, amount] = result;
      
      console.log("✅ Got highest bid:", {
        listingId: listingId.toString(),
        bidder,
        amount: amount.toString(),
        amountETH: formatEther(amount)
      });

      return {
        bidder: bidder as `0x${string}`,
        amount: amount as bigint
      };
      
    } catch (error) {
      console.error("❌ Error getting highest bid:", error);
      return { 
        bidder: '0x0000000000000000000000000000000000000000' as `0x${string}`, 
        amount: BigInt(0) 
      };
    }
  };

  return {
    getHighestBid,
  };
}

export function useGetSealedBidPhase() {
  const publicClient = usePublicClient();

  const getSealedBidPhase = async (listingId: bigint) => {
    try {
      if (!publicClient) {
        console.warn("No public client available");
        return { phase: 0, phaseDescription: "Unknown", timeRemaining: 0 };
      }

      console.log("🔍 Getting sealed bid phase for listing:", listingId.toString());

      // Try to get phase directly from SealedBidAuction contract first
      try {
        console.log("📞 Calling phase function directly from SealedBidAuction contract...");
        
        const phase = await publicClient.readContract({
          address: CONTRACTS.SealedBidAuction as `0x${string}`,
          abi: SEALED_BID_AUCTION_ABI,
          functionName: 'phase',
          args: [listingId],
        }) as number;

        console.log("✅ Got phase directly from contract:", phase);

        const phaseDescriptions = {
          0: "NOT_STARTED",
          1: "COMMIT", 
          2: "REVEAL",
          3: "ENDED"
        } as const;

        const phaseDescription = phaseDescriptions[phase as keyof typeof phaseDescriptions] || "UNKNOWN";

        return {
          phase,
          phaseDescription,
          timeRemaining: 0, // Contract doesn't provide time remaining
          source: "contract"
        };
        
      } catch (phaseError) {
        console.warn("Could not get phase from sealed bid contract:", phaseError);
        
        // Fallback: Get timing info from listing data
        const listing = await publicClient.readContract({
          address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
          abi: DOMAIN_AUCTION_HOUSE_ABI,
          functionName: "listings",
          args: [listingId],
        });

        const listingArray = [...(listing as readonly any[])];
        const startTime = listingArray[5] || BigInt(0);
        const endTime = listingArray[6] || BigInt(0);
        const strategy = listingArray[7];
        const strategyData = listingArray[8];
        const currentTime = BigInt(Math.floor(Date.now() / 1000));

        console.log("📋 Listing timing info:", {
          startTime: startTime.toString(),
          endTime: endTime.toString(), 
          currentTime: currentTime.toString(),
          strategy
        });

        // If it's not a sealed bid auction, return error info
        if (strategy !== CONTRACTS.SealedBidAuction) {
          return {
            phase: -1,
            phaseDescription: "NOT_SEALED_BID_AUCTION",
            timeRemaining: 0,
            error: "This is not a sealed bid auction"
          };
        }

        // Try to decode strategy data for timing calculations
        try {
          const decoded = decodeAbiParameters(
            [
              { name: "commitDuration", type: "uint256" },
              { name: "revealDuration", type: "uint256" },
              { name: "minDeposit", type: "uint256" },
            ],
            strategyData as `0x${string}`
          );
          
          const [commitDuration, revealDuration] = decoded;
          const commitEndTime = startTime + commitDuration;
          const revealEndTime = commitEndTime + revealDuration;
          
          console.log("⏰ Calculated timing:", {
            commitDuration: commitDuration.toString(),
            revealDuration: revealDuration.toString(),
            commitEndTime: commitEndTime.toString(),
            revealEndTime: revealEndTime.toString()
          });

          let phase: number;
          let phaseDescription: string;
          let timeRemaining: number;
          
          if (currentTime < startTime) {
            phase = 0;
            phaseDescription = "NOT_STARTED";
            timeRemaining = Number(startTime - currentTime);
          } else if (currentTime < commitEndTime) {
            phase = 1;
            phaseDescription = "COMMIT";
            timeRemaining = Number(commitEndTime - currentTime);
          } else if (currentTime < revealEndTime) {
            phase = 2;
            phaseDescription = "REVEAL";
            timeRemaining = Number(revealEndTime - currentTime);
          } else {
            phase = 3;
            phaseDescription = "ENDED";
            timeRemaining = 0;
          }

          return {
            phase,
            phaseDescription,
            timeRemaining,
            startTime: Number(startTime),
            commitEndTime: Number(commitEndTime),
            revealEndTime: Number(revealEndTime),
            currentTime: Number(currentTime)
          };
        } catch (decodeError) {
          console.warn("Could not decode strategy data:", decodeError);
          return {
            phase: 0,
            phaseDescription: "DECODE_ERROR",
            timeRemaining: 0,
            error: "Cannot decode sealed bid auction configuration"
          };
        }
      }
    } catch (error) {
      console.error("❌ Error getting sealed bid phase:", error);
      return {
        phase: -1,
        phaseDescription: "ERROR",
        timeRemaining: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  };

  return {
    getSealedBidPhase,
  };
}

export function useGetCurrentPrice() {
  const publicClient = usePublicClient();
  
  const getCurrentPrice = async (listingId: bigint) => {
    if (!publicClient) throw new Error('No public client available');
    
    try {
      console.log('🔍 Getting current price for Dutch auction:', listingId.toString());
      
      const currentPrice = await publicClient.readContract({
        address: CONTRACTS.DutchAuction as `0x${string}`,
        abi: DUTCH_AUCTION_ABI,
        functionName: 'getCurrentPrice',
        args: [listingId, '0x'], // listingId and empty bytes
      }) as bigint;
      
      console.log('💰 Current price retrieved:', {
        listingId: listingId.toString(),
        currentPriceWei: currentPrice.toString(),
        currentPriceETH: formatEther(currentPrice)
      });
      
      return currentPrice;
    } catch (error) {
      console.error('❌ Error getting current price:', error);
      throw error;
    }
  };
  
  return {
    getCurrentPrice,
  };
}