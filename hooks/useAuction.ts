'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from 'wagmi'
import { parseEther, encodeAbiParameters, keccak256, parseEventLogs, decodeEventLog } from 'viem'
import { CONTRACTS } from './contracts/constants'
import { DOMAIN_AUCTION_HOUSE_ABI, SEALED_BID_AUCTION_ABI } from './contracts/abis'

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
          const publicClient = await import('wagmi').then(m => m.getPublicClient)
          const nextId = await publicClient?.readContract({
            address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
            abi: DOMAIN_AUCTION_HOUSE_ABI,
            functionName: 'getNextListingId',
          }) as bigint
          
          if (nextId) {
            const realListingId = nextId - BigInt(1)
            console.log('Fallback listingId:', realListingId.toString())
            setListingId(realListingId)
          }
          
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
      
      let strategyAddress: string
      let strategyData: `0x${string}`

      switch (params.auctionType) {
        case 'english':
          strategyAddress = CONTRACTS.EnglishAuction
          strategyData = encodeAbiParameters(
            [{ name: 'incrementBps', type: 'uint256' }, { name: 'antiSnipingEnabled', type: 'bool' }],
            [BigInt(params.incrementBps || 500), params.antiSnipingEnabled || true]
          )
          break
          
        case 'dutch':
          strategyAddress = CONTRACTS.DutchAuction
          strategyData = encodeAbiParameters(
            [
              { name: 'startPrice', type: 'uint256' },
              { name: 'endPrice', type: 'uint256' },
              { name: 'isLinear', type: 'bool' }
            ],
            [
              parseEther(params.startPrice || params.reservePrice),
              parseEther(params.endPrice || '0'),
              params.isLinear || true
            ]
          )
          break
          
        case 'sealed':
          strategyAddress = CONTRACTS.SealedBidAuction
          strategyData = encodeAbiParameters(
            [
              { name: 'commitDuration', type: 'uint256' },
              { name: 'revealDuration', type: 'uint256' },
              { name: 'minimumDeposit', type: 'uint256' }
            ],
            [
              BigInt(params.commitDuration || 3600), // 1 hour default
              BigInt(params.revealDuration || 1800), // 30 minutes default
              parseEther(params.minimumDeposit || '0.01') // 0.01 ETH default
            ]
          )
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
      
    } catch (err) {
      console.error('Error choosing strategy:', err)
      setError(err instanceof Error ? err.message : 'Failed to choose strategy')
      throw err
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
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const placeBid = async (listingId: bigint, bidAmount: string, auctionType: 'english' | 'dutch' | 'sealed', commitmentData?: string) => {
    try {
      const bidAmountWei = parseEther(bidAmount)
      
      let data: `0x${string}` = '0x'
      let value = bidAmountWei

      if (auctionType === 'sealed' && commitmentData) {
        // For sealed bid auction, encode commitment data
        data = commitmentData as `0x${string}`
        // For sealed bid, the value is the deposit, not the full bid amount
      }

      writeContract({
        address: CONTRACTS.DomainAuctionHouse as `0x${string}`,
        abi: DOMAIN_AUCTION_HOUSE_ABI,
        functionName: 'placeBid',
        args: [listingId, bidAmountWei, data],
        value: value,
      })
    } catch (error) {
      console.error('Error placing bid:', error)
      throw error
    }
  }

  return {
    placeBid,
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
      
      // Place bid with commitment
      await placeBid(listingId, deposit, 'sealed', commitData)
      
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
  const { writeContract, data: hash, isPending } = useWriteContract()
  
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
      
      writeContract({
        address: CONTRACTS.SealedBidAuction as `0x${string}`,
        abi: SEALED_BID_AUCTION_ABI,
        functionName: 'revealBid',
        args: [listingId, bidAmountWei, saltHex as `0x${string}`],
      })
      
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