import { useState, useCallback } from 'react';

interface RateLimitState {
  isLimited: boolean;
  remaining: number;
  resetTime: number;
}

interface UseRateLimitOptions {
  maxRequests: number;
  windowMs: number;
  key?: string;
}

/**
 * Client-side rate limiting hook to prevent abuse
 * This is a basic implementation - server-side limits are still required
 */
export function useRateLimit({ maxRequests, windowMs, key = 'default' }: UseRateLimitOptions) {
  const [state, setState] = useState<RateLimitState>(() => {
    const stored = localStorage.getItem(`rateLimit_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      if (now < parsed.resetTime) {
        return parsed;
      }
    }
    return {
      isLimited: false,
      remaining: maxRequests,
      resetTime: Date.now() + windowMs
    };
  });

  const checkLimit = useCallback(() => {
    const now = Date.now();
    
    // Reset if window has passed
    if (now >= state.resetTime) {
      const newState = {
        isLimited: false,
        remaining: maxRequests - 1,
        resetTime: now + windowMs
      };
      setState(newState);
      localStorage.setItem(`rateLimit_${key}`, JSON.stringify(newState));
      return true;
    }
    
    // Check if we have remaining requests
    if (state.remaining > 0) {
      const newState = {
        ...state,
        remaining: state.remaining - 1,
        isLimited: state.remaining - 1 <= 0
      };
      setState(newState);
      localStorage.setItem(`rateLimit_${key}`, JSON.stringify(newState));
      return true;
    }
    
    return false;
  }, [state, maxRequests, windowMs, key]);

  const reset = useCallback(() => {
    const newState = {
      isLimited: false,
      remaining: maxRequests,
      resetTime: Date.now() + windowMs
    };
    setState(newState);
    localStorage.setItem(`rateLimit_${key}`, JSON.stringify(newState));
  }, [maxRequests, windowMs, key]);

  return {
    ...state,
    checkLimit,
    reset,
    timeUntilReset: Math.max(0, state.resetTime - Date.now())
  };
}