import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useRef, useEffect } from 'react'
import { 
  componentVisibilityAtom, 
  intersectionAtom,
  progressiveLoadAtom,
  loadMoreAtom,
  resetProgressiveLoadAtom,
  imageLoadingAtom,
  virtualScrollAtom,
  visibleItemsAtom,
  updateVirtualScrollAtom,
  loadedItemsAtom,
  markItemLoadedAtom
} from '@/atoms/lazy'

// Hook for component visibility tracking
export const useComponentVisibility = (componentId: string) => {
  const [isVisible, setIsVisible] = useAtom(componentVisibilityAtom(componentId))
  const setIntersection = useSetAtom(intersectionAtom(componentId))
  
  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIntersection(entry)
        setIsVisible(entry.isIntersecting)
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Load slightly before visible
      }
    )
    
    observer.observe(node)
    return () => observer.disconnect()
  }, [setIntersection, setIsVisible])
  
  return { isVisible, ref }
}

// Hook for infinite scrolling with progressive loading
export const useInfiniteScroll = <T>(key: string, fetchFn: (page: number) => Promise<any>) => {
  const state = useAtomValue(progressiveLoadAtom(key)) as { data: T[], loading: boolean, hasMore: boolean, initialLoad: boolean }
  const loadMore = useSetAtom(loadMoreAtom(key))
  const resetAtom = useSetAtom(resetProgressiveLoadAtom(key))
  
  // Stable reference for key to detect changes
  const prevKeyRef = useRef<string>()
  
  // Reset atom when key changes to ensure fresh state
  useEffect(() => {
    if (prevKeyRef.current && prevKeyRef.current !== key) {
      console.log('🔄 Key changed, resetting atom. Old:', prevKeyRef.current, 'New:', key)
      resetAtom()
    }
    prevKeyRef.current = key
  }, [key, resetAtom])
  
  const loadMoreRef = useCallback((node: HTMLElement | null) => {
    if (!node || state.loading || !state.hasMore) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log('👀 Intersection detected, loading more...', key)
          loadMore(fetchFn)
        }
      },
      { threshold: 0.1 } // Reduced threshold for better triggering
    )
    
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore, fetchFn, state.loading, state.hasMore, key])
  
  // Initial load - trigger immediately on mount if no data
  useEffect(() => {
    if (state.data.length === 0 && !state.loading && state.initialLoad) {
      console.log('🚀 Triggering initial load for key:', key)
      loadMore(fetchFn)
    }
  }, [state.data.length, state.loading, state.initialLoad, loadMore, fetchFn, key])
  
  // Debug logging
  useEffect(() => {
    console.log('📊 Infinite scroll state:', {
      key,
      dataLength: state.data.length,
      loading: state.loading,
      hasMore: state.hasMore,
      initialLoad: state.initialLoad
    })
  }, [key, state.data.length, state.loading, state.hasMore, state.initialLoad])
  
  return { ...state, loadMoreRef }
}

// Hook for lazy image loading
export const useLazyImage = (src: string) => {
  const [imageState, setImageState] = useAtom(imageLoadingAtom(src))
  
  useEffect(() => {
    if (imageState !== 'loading') return
    
    const img = new Image()
    img.onload = () => setImageState('loaded')
    img.onerror = () => setImageState('error')
    img.src = src
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, imageState, setImageState])
  
  return imageState
}

// Hook for virtual scrolling
export const useVirtualScroll = <T>(
  listId: string, 
  items: T[], 
  itemHeight: number = 300
) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [virtualState, updateVirtualState] = useAtom(virtualScrollAtom(listId))
  const updateScroll = useSetAtom(updateVirtualScrollAtom(listId))
  const visibleRange = useAtomValue(visibleItemsAtom(listId))
  const loadedItems = useAtomValue(loadedItemsAtom(listId))
  const markLoaded = useSetAtom(markItemLoadedAtom(listId))
  
  // Update total items when items array changes
  useEffect(() => {
    updateScroll({ 
      totalItems: items.length,
      itemHeight 
    })
  }, [items.length, itemHeight, updateScroll])
  
  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    const containerHeight = e.currentTarget.clientHeight
    
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      items.length - 1,
      startIndex + Math.ceil(containerHeight / itemHeight)
    )
    
    updateScroll({
      scrollTop,
      containerHeight,
      startIndex,
      endIndex
    })
  }, [itemHeight, items.length, updateScroll])
  
  // Get visible items
  const visibleItems = items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  
  // Calculate total height and offset
  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight
  
  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex,
    isLoaded: (index: number) => loadedItems.has(index),
    markAsLoaded: markLoaded
  }
}

// Hook for lazy component loading
export const useLazyComponent = (componentName: string, threshold = 0.1) => {
  const { isVisible, ref } = useComponentVisibility(componentName)
  const [hasLoaded, setHasLoaded] = useAtom(componentVisibilityAtom(`${componentName}-loaded`))
  
  useEffect(() => {
    if (isVisible && !hasLoaded) {
      setHasLoaded(true)
    }
  }, [isVisible, hasLoaded, setHasLoaded])
  
  return {
    isVisible,
    hasLoaded,
    ref,
    shouldRender: hasLoaded || isVisible
  }
}