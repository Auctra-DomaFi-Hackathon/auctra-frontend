import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

// Component visibility tracking
export const lazyComponentsAtom = atom<Record<string, boolean>>({})

export const componentVisibilityAtom = atomFamily((componentId: string) =>
  atom(
    (get) => get(lazyComponentsAtom)[componentId] ?? false,
    (get, set, visible: boolean) => {
      set(lazyComponentsAtom, prev => ({ ...prev, [componentId]: visible }))
    }
  )
)

// Intersection observer entries
export const intersectionAtom = atomFamily((elementId: string) =>
  atom<IntersectionObserverEntry | null>(null)
)

// Progressive data loading state
export interface ProgressiveLoadState<T> {
  data: T[]
  hasMore: boolean
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  initialLoad: boolean
}

export const progressiveLoadAtom = atomFamily((key: string) =>
  atom<ProgressiveLoadState<any>>({
    data: [],
    hasMore: true,
    loading: false,
    error: null,
    page: 0,
    totalPages: 0,
    initialLoad: true
  })
)

// Load more action atom
export const loadMoreAtom = atomFamily((key: string) =>
  atom(
    null,
    async (get, set, fetchFn: (page: number) => Promise<any>) => {
      const currentState = get(progressiveLoadAtom(key)) as ProgressiveLoadState<any>
      console.log('⚡ loadMoreAtom triggered for key:', key, 'current state:', {
        page: currentState.page,
        dataLength: currentState.data.length,
        loading: currentState.loading,
        hasMore: currentState.hasMore,
        initialLoad: currentState.initialLoad
      })
      
      if (currentState.loading || !currentState.hasMore) {
        console.log('⚡ Skipping load - already loading or no more data:', { loading: currentState.loading, hasMore: currentState.hasMore })
        return
      }

      set(progressiveLoadAtom(key), prev => ({ ...prev, loading: true, error: null }))
      
      try {
        const nextPage = currentState.page + 1
        console.log('⚡ Calling fetchFn with page:', nextPage)
        const newData = await fetchFn(nextPage)
        console.log('⚡ fetchFn returned:', {
          itemsLength: newData.items?.length,
          hasMore: newData.hasMore,
          totalPages: newData.totalPages
        })
        
        const updatedData = currentState.initialLoad ? newData.items : [...currentState.data, ...newData.items]
        
        set(progressiveLoadAtom(key), prev => ({
          ...prev,
          data: updatedData,
          page: nextPage,
          hasMore: newData.hasMore,
          loading: false,
          totalPages: newData.totalPages,
          initialLoad: false
        }))
        
        const finalState = get(progressiveLoadAtom(key))
        console.log('⚡ Updated state after load:', {
          page: finalState.page,
          dataLength: finalState.data.length,
          hasMore: finalState.hasMore,
          loading: finalState.loading
        })
      } catch (error) {
        console.error('⚡ Error in loadMoreAtom:', error)
        set(progressiveLoadAtom(key), prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false
        }))
      }
    }
  )
)

// Reset atom for clearing cache
export const resetProgressiveLoadAtom = atomFamily((key: string) =>
  atom(
    null,
    (get, set) => {
      set(progressiveLoadAtom(key), {
        data: [],
        hasMore: true,
        loading: false,
        error: null,
        page: 0,
        totalPages: 0,
        initialLoad: true
      })
    }
  )
)

// Image loading states
export const imageLoadingAtom = atomFamily((imageUrl: string) =>
  atom<'loading' | 'loaded' | 'error'>('loading')
)

// Virtual scrolling atoms
export interface VirtualScrollState {
  startIndex: number
  endIndex: number
  itemHeight: number
  containerHeight: number
  scrollTop: number
  totalItems: number
}

export const virtualScrollAtom = atomFamily((listId: string) =>
  atom<VirtualScrollState>({
    startIndex: 0,
    endIndex: 20, // Show 20 items initially
    itemHeight: 300, // Approximate card height
    containerHeight: 600,
    scrollTop: 0,
    totalItems: 0
  })
)

// Visible items for virtual scrolling
export const visibleItemsAtom = atomFamily((listId: string) =>
  atom(
    (get) => {
      const virtualState = get(virtualScrollAtom(listId))
      const { startIndex, endIndex } = virtualState
      
      // Add buffer for smoother scrolling
      const buffer = 5
      const actualStart = Math.max(0, startIndex - buffer)
      const actualEnd = Math.min(virtualState.totalItems - 1, endIndex + buffer)
      
      return { startIndex: actualStart, endIndex: actualEnd }
    }
  )
)

// Update virtual scroll position
export const updateVirtualScrollAtom = atomFamily((listId: string) =>
  atom(
    null,
    (get, set, update: Partial<VirtualScrollState>) => {
      set(virtualScrollAtom(listId), prev => ({ ...prev, ...update }))
    }
  )
)

// Lazy loading trigger threshold
export const lazyLoadThresholdAtom = atom(0.1) // Load when 10% visible

// Track which items have been loaded
export const loadedItemsAtom = atomFamily((listId: string) =>
  atom<Set<number>>(new Set<number>())
)

// Mark item as loaded
export const markItemLoadedAtom = atomFamily((listId: string) =>
  atom(
    null,
    (get, set, itemIndex: number) => {
      const current = get(loadedItemsAtom(listId))
      const newSet = new Set(current)
      newSet.add(itemIndex)
      set(loadedItemsAtom(listId), newSet)
    }
  )
)