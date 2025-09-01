class ApiClient {
  private baseUrl: string
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheDuration = 60000 // 1 minute - increased cache time

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheDuration
  }

  async get<T>(endpoint: string, useCache = true): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const cacheKey = url
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!
      if (this.isCacheValid(cached.timestamp)) {
        return cached.data
      }
    }

    try {
      const response = await fetch(url, {
        // Add performance optimizations
        cache: 'force-cache',
        next: { revalidate: 60 } // Next.js cache for 1 minute
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (useCache) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
      }
      
      return data
    } catch (error) {
      console.error(`API Error on ${url}:`, error)
      // Return cached data as fallback if available
      if (this.cache.has(cacheKey)) {
        console.warn(`Returning stale cache for ${url}`)
        return this.cache.get(cacheKey)!.data
      }
      throw error
    }
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const apiClient = new ApiClient()