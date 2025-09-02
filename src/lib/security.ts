/**
 * Security utilities for sanitizing content and preventing injection attacks
 */

/**
 * Sanitizes a string to prevent XSS and script injection
 * Removes or escapes dangerous characters commonly used in attacks
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/&/g, '&amp;')
    .trim();
}

/**
 * Enhanced input sanitization for form data
 * Removes dangerous characters and normalizes whitespace
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>"'&]/g, '') // Remove dangerous HTML characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

/**
 * Validates email format with enhanced security checks
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Length check
  if (email.length < 5 || email.length > 254) {
    return false;
  }
  
  // Basic format check
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Additional security checks
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return false;
  }
  
  return true;
}

/**
 * Validates phone number format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
}

/**
 * Sanitizes an object recursively for safe use in JSON-LD structured data
 * Ensures all string values are properly sanitized
 */
export function sanitizeForJsonLd(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForJsonLd);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeForJsonLd(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Creates a safe JSON-LD script content
 * Sanitizes all string values and ensures safe serialization
 */
export function createSafeJsonLd(data: any): string {
  const sanitizedData = sanitizeForJsonLd(data);
  return JSON.stringify(sanitizedData);
}