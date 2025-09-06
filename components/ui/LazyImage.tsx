"use client"

import { useState, useRef, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'
import { useLazyImage } from '@/hooks/useLazyLoading'

interface LazyImageProps extends Omit<ImageProps, 'src'> {
  src: string
  fallback?: string
  skeleton?: React.ReactNode
  errorComponent?: React.ReactNode
}

export default function LazyImage({ 
  src, 
  alt, 
  fallback = '/images/placeholder.svg',
  skeleton,
  errorComponent,
  className = '',
  ...props 
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)
  const imageState = useLazyImage(isInView ? src : '')
  
  // Intersection observer to detect when image comes into view
  useEffect(() => {
    if (!imgRef.current) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect() // Stop observing once loaded
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before visible
      }
    )
    
    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [])
  
  const defaultSkeleton = (
    <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
  )
  
  const defaultError = (
    <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}>
      <svg 
        className="w-8 h-8 text-gray-400" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
        />
      </svg>
    </div>
  )
  
  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isInView && (skeleton || defaultSkeleton)}
      
      {isInView && imageState === 'loading' && (skeleton || defaultSkeleton)}
      
      {isInView && imageState === 'loaded' && (
        <Image
          src={src}
          alt={alt}
          className={className}
          {...props}
        />
      )}
      
      {isInView && imageState === 'error' && (
        errorComponent || defaultError
      )}
    </div>
  )
}

// Specialized lazy image for avatar/profile pictures
export function LazyAvatar({ 
  src, 
  alt, 
  size = 40,
  className = '',
  ...props 
}: LazyImageProps & { size?: number }) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      skeleton={
        <div 
          className={`rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
          style={{ width: size, height: size }}
        />
      }
      {...props}
    />
  )
}