/**
 * Additional security utility functions for common patterns
 */

/**
 * Sanitizes URLs to prevent XSS and ensure they're safe
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  // Remove dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
  const lowerUrl = url.toLowerCase().trim();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      console.warn('Blocked dangerous URL protocol:', protocol);
      return '';
    }
  }
  
  // Only allow http, https, mailto, and tel
  if (!lowerUrl.match(/^(https?:\/\/|mailto:|tel:|\/)/)) {
    console.warn('Blocked non-standard URL:', url);
    return '';
  }
  
  return url;
}

/**
 * Creates a Content Security Policy header value
 */
export function createCSP(): string {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://analytics.google.com",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ];
  
  return policies.join('; ');
}

/**
 * Validates and sanitizes file uploads
 */
export function validateFileUpload(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}): { isValid: boolean; error?: string } {
  const { 
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  } = options;
  
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
    };
  }
  
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`
    };
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ${extension} is not allowed`
    };
  }
  
  // Check for suspicious file names
  if (file.name.includes('../') || file.name.includes('..\\')) {
    return {
      isValid: false,
      error: 'Invalid file name'
    };
  }
  
  return { isValid: true };
}

/**
 * Rate limiting storage for client-side
 */
class ClientRateLimit {
  private static instance: ClientRateLimit;
  private storage: Map<string, { count: number; resetTime: number }> = new Map();
  
  static getInstance(): ClientRateLimit {
    if (!ClientRateLimit.instance) {
      ClientRateLimit.instance = new ClientRateLimit();
    }
    return ClientRateLimit.instance;
  }
  
  checkLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.storage.get(key);
    
    if (!record || now > record.resetTime) {
      this.storage.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  getRemainingRequests(key: string, maxRequests: number, windowMs: number): number {
    const now = Date.now();
    const record = this.storage.get(key);
    
    if (!record || now > record.resetTime) {
      return maxRequests - 1;
    }
    
    return Math.max(0, maxRequests - record.count);
  }
  
  getResetTime(key: string): number {
    const record = this.storage.get(key);
    return record ? Math.max(0, record.resetTime - Date.now()) : 0;
  }
}

export const clientRateLimit = ClientRateLimit.getInstance();

/**
 * Debounce function to prevent rapid API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function to limit API call frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}