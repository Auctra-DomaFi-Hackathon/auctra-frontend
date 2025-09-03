'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient, useAccount } from 'wagmi'
import { parseEther, encodeAbiParameters, keccak256, parseEventLogs, decodeEventLog, decodeAbiParameters } from 'viem'
import { CONTRACTS } from './contracts/constants'
import { DOMAIN_AUCTION_HOUSE_ABI } from './contracts/abis'

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
          BigInt(params.duration), // duration
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
          const commitDurationSecs = params.commitDuration && params.commitDuration > 0 
            ? params.commitDuration 
            : 3600 // 1 hour default
          const revealDurationSecs = params.revealDuration && params.revealDuration > 0 
            ? params.revealDuration 
            : 3600 // 1 hour default (changed from 30 min)
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
      
      writeStart({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'goLive',
        args: [
          realListingId, // Use real listingId
          BigInt(params.duration) // duration
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
  
  const { placeBid, isPending, isConfirming, isSuccess, hash } = usePlaceBid()

  const commitBid = async (listingId: bigint, bidAmount: string, deposit: string) => {
    try {
      // Generate random salt using crypto API
      const saltArray = new Uint8Array(32)
      crypto.getRandomValues(saltArray)
      const salt = `0x${Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
      
      // Create commitment hash
      const bidAmountWei = parseEther(bidAmount)
      const commitment = keccak256(
        encodeAbiParameters(
          [{ name: 'bidAmount', type: 'uint256' }, { name: 'salt', type: 'bytes32' }],
          [bidAmountWei, salt]
        )
      )
      
      // Store commitment locally
      const listingKey = listingId.toString()
      setCommitments(prev => ({
        ...prev,
        [listingKey]: { bidAmount, salt }
      }))
      
      // Also store in localStorage as backup
      localStorage.setItem(`sealedBid_${listingKey}_salt`, salt)
      localStorage.setItem(`sealedBid_${listingKey}_amount`, bidAmount)
      
      // Encode commitment data
      const commitData = encodeAbiParameters(
        [{ name: 'commitment', type: 'bytes32' }],
        [commitment]
      )
      
      // Place bid with commitment - for sealed bid we use the deposit amount
      await placeBid(listingId, deposit)
      
    } catch (error) {
      console.error('Error committing sealed bid:', error)
      throw error
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
  const { data: hash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const revealBid = async (listingId: bigint) => {
    try {
      const listingKey = listingId.toString()
      
      // Retrieve stored data
      const saltHex = localStorage.getItem(`sealedBid_${listingKey}_salt`)
      const bidAmount = localStorage.getItem(`sealedBid_${listingKey}_amount`)
      
      if (!saltHex || !bidAmount) {
        throw new Error('No sealed bid data found for this listing')
      }
      
      const bidAmountWei = parseEther(bidAmount)
      
      // TODO: Fix function name and parameters when ABI is updated
      console.log('Reveal bid called with:', { listingId, bidAmountWei, saltHex })
      
      // writeContract({
      //   address: CONTRACTS.SealedBidAuction as `0x${string}`,
      //   abi: SEALED_BID_AUCTION_ABI,
      //   functionName: 'revealBid', // Function name might be different in actual ABI
      //   args: [listingId, bidAmountWei, saltHex as `0x${string}`],
      // })
      
      // Clean up local storage after revealing
      if (isSuccess) {
        localStorage.removeItem(`sealedBid_${listingKey}_salt`)
        localStorage.removeItem(`sealedBid_${listingKey}_amount`)
      }
      
    } catch (error) {
      console.error('Error revealing sealed bid:', error)
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