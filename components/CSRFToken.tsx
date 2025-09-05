/**
 * CSRF Token Component
 * 
 * This component adds a hidden CSRF token field to forms to protect against
 * Cross-Site Request Forgery attacks.
 */

'use client';

import { useEffect, useState } from 'react';
import { CSRF } from '@/lib/csrf-protection';

interface CSRFTokenProps {
  // Optional className for styling
  className?: string;
}

/**
 * CSRFToken component that adds a hidden input field with a CSRF token
 * to be included in form submissions
 */
export default function CSRFToken({ className = '' }: CSRFTokenProps) {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Fetch a new CSRF token when the component mounts
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/csrf');
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        }
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };

    fetchToken();
  }, []);

  return (
    <input
      type="hidden"
      name={CSRF.FIELD_NAME}
      value={csrfToken}
      className={className}
    />
  );
}