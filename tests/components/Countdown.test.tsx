import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Countdown } from '@/features/auction/Countdown'

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('displays countdown correctly for future date', () => {
    const futureDate = new Date(Date.now() + 90061000) // 1 day, 1 hour, 1 minute, 1 second
    render(<Countdown endTime={futureDate.toISOString()} />)
    
    expect(screen.getByText('Days')).toBeInTheDocument()
    expect(screen.getByText('Hours')).toBeInTheDocument()
    expect(screen.getByText('Min')).toBeInTheDocument()
    expect(screen.getByText('Sec')).toBeInTheDocument()
    // Check that countdown elements exist
    const timeElements = screen.getAllByText('01')
    expect(timeElements.length).toBe(4) // days, hours, minutes, seconds
  })

  it('shows expired state for past date', () => {
    const pastDate = new Date(Date.now() - 1000) // 1 second ago
    render(<Countdown endTime={pastDate.toISOString()} />)
    
    expect(screen.getByText('Expired')).toBeInTheDocument()
  })

  it('updates countdown every second', () => {
    const futureDate = new Date(Date.now() + 5000) // 5 seconds from now
    render(<Countdown endTime={futureDate.toISOString()} />)
    
    expect(screen.getByText('05')).toBeInTheDocument() // initial seconds
    
    act(() => {
      vi.advanceTimersByTime(1000) // advance 1 second
    })
    
    expect(screen.getByText('04')).toBeInTheDocument() // should be 4 seconds now
  })
})