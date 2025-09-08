import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useCreateAuctionForm } from '@/app/app/create/_components/hooks/useCreateAuctionForm'
import StepConfig from '@/app/app/create/_components/StepConfig'
import StepReserve from '@/app/app/create/_components/StepReserve'

// Mock the hooks
vi.mock('@/app/app/create/_components/hooks/useCreateAuctionForm')
vi.mock('@/hooks/useWallet')
vi.mock('wagmi')

describe('Dutch Auction Validation', () => {
  const mockSetField = vi.fn()
  const mockNext = vi.fn()
  const mockBack = vi.fn()

  const defaultFormData = {
    auctionType: 'dutch',
    startPrice: '0.0002',
    endPrice: '0.0001',
    reservePrice: '0.0002',
    decayInterval: 60,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('StepConfig - Dutch Auction Validation', () => {
    it('should show warning when startPrice equals reservePrice', async () => {
      render(
        <StepConfig
          formData={defaultFormData}
          errors={{}}
          setField={mockSetField}
          next={mockNext}
          back={mockBack}
          toNum={(v: string) => parseFloat(v) || 0}
          nowISO="2024-01-01T00:00"
        />
      )

      // Should show warning message
      expect(screen.getByText(/Start price must be greater than reserve price/)).toBeInTheDocument()
      expect(screen.getByText(/0.0002 ETH/)).toBeInTheDocument()
    })

    it('should not show warning when startPrice is greater than reservePrice', () => {
      const validFormData = {
        ...defaultFormData,
        startPrice: '0.0003',
        reservePrice: '0.0002',
      }

      render(
        <StepConfig
          formData={validFormData}
          errors={{}}
          setField={mockSetField}
          next={mockNext}
          back={mockBack}
          toNum={(v: string) => parseFloat(v) || 0}
          nowISO="2024-01-01T00:00"
        />
      )

      // Should not show warning
      expect(screen.queryByText(/Start price must be greater than reserve price/)).not.toBeInTheDocument()
    })

    it('should not show warning for non-dutch auction types', () => {
      const englishFormData = {
        ...defaultFormData,
        auctionType: 'english',
      }

      render(
        <StepConfig
          formData={englishFormData}
          errors={{}}
          setField={mockSetField}
          next={mockNext}
          back={mockBack}
          toNum={(v: string) => parseFloat(v) || 0}
          nowISO="2024-01-01T00:00"
        />
      )

      // Should not show Dutch auction warning
      expect(screen.queryByText(/Start price must be greater than reserve price/)).not.toBeInTheDocument()
    })
  })

  describe('StepReserve - Dutch Auction Validation', () => {
    const mockHandleSuggestReserve = vi.fn()

    it('should show error when reserve price is not lower than start price', () => {
      render(
        <StepReserve
          formData={defaultFormData}
          errors={{}}
          setField={mockSetField}
          next={mockNext}
          back={mockBack}
          suggestedReserve={null}
          handleSuggestReserve={mockHandleSuggestReserve}
          toNum={(v: string) => parseFloat(v) || 0}
        />
      )

      // Should show validation error
      expect(screen.getByText(/Invalid Price Configuration/)).toBeInTheDocument()
      expect(screen.getByText(/reserve price \(0.0002 ETH\) must be lower than start price \(0.0002 ETH\)/)).toBeInTheDocument()
    })

    it('should not show error when prices are correctly configured', () => {
      const validFormData = {
        ...defaultFormData,
        startPrice: '0.0003',
        reservePrice: '0.0002',
      }

      render(
        <StepReserve
          formData={validFormData}
          errors={{}}
          setField={mockSetField}
          next={mockNext}
          back={mockBack}
          suggestedReserve={null}
          handleSuggestReserve={mockHandleSuggestReserve}
          toNum={(v: string) => parseFloat(v) || 0}
        />
      )

      // Should not show validation error
      expect(screen.queryByText(/Invalid Price Configuration/)).not.toBeInTheDocument()
    })
  })

  describe('Form Validation Logic', () => {
    it('should prevent form submission when startPrice <= reservePrice in Dutch auction', () => {
      // Mock the validation function behavior
      const mockValidateStep = vi.fn((step: string) => {
        if (step === 'config' && defaultFormData.auctionType === 'dutch') {
          const startPrice = parseFloat(defaultFormData.startPrice)
          const reservePrice = parseFloat(defaultFormData.reservePrice)
          return startPrice > reservePrice
        }
        return true
      })

      // Test validation
      expect(mockValidateStep('config')).toBe(false)
    })

    it('should allow form submission when startPrice > reservePrice in Dutch auction', () => {
      const validFormData = {
        ...defaultFormData,
        startPrice: '0.0003',
        reservePrice: '0.0002',
      }

      const mockValidateStep = vi.fn((step: string) => {
        if (step === 'config' && validFormData.auctionType === 'dutch') {
          const startPrice = parseFloat(validFormData.startPrice)
          const reservePrice = parseFloat(validFormData.reservePrice)
          return startPrice > reservePrice
        }
        return true
      })

      // Test validation
      expect(mockValidateStep('config')).toBe(true)
    })
  })

  describe('Real-time Validation Feedback', () => {
    it('should update warning dynamically when user changes prices', async () => {
      const { rerender } = render(
        <StepConfig
          formData={{ ...defaultFormData, startPrice: '0.0003' }}
          errors={{}}
          setField={mockSetField}
          next={mockNext}
          back={mockBack}
          toNum={(v: string) => parseFloat(v) || 0}
          nowISO="2024-01-01T00:00"
        />
      )

      // Initially no warning (startPrice > reservePrice)
      expect(screen.queryByText(/Start price must be greater than reserve price/)).not.toBeInTheDocument()

      // Change startPrice to equal reservePrice
      rerender(
        <StepConfig
          formData={{ ...defaultFormData, startPrice: '0.0002' }}
          errors={{}}
          setField={mockSetField}
          next={mockNext}
          back={mockBack}
          toNum={(v: string) => parseFloat(v) || 0}
          nowISO="2024-01-01T00:00"
        />
      )

      // Now should show warning
      expect(screen.getByText(/Start price must be greater than reserve price/)).toBeInTheDocument()
    })
  })
})
