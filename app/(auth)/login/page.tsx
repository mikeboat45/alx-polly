'use client';

/**
 * Login Page Component
 * 
 * This component renders the login form and handles user authentication.
 * It uses server actions to validate credentials and establish a user session.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { login } from '@/app/lib/actions/auth-actions';

/**
 * Login Page Component
 * 
 * Renders a form that allows users to authenticate with their email and password.
 * Handles form submission, validation, and authentication via server actions.
 * On successful login, redirects to the polls dashboard.
 * 
 * @returns React component for the login page
 */
export default function LoginPage() {
  // State for error messages and loading status
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handles form submission for user login
   * 
   * This function processes the login form submission, extracts credentials,
   * and attempts to authenticate the user via the login server action.
   * On success, it redirects to the polls page. On failure, it displays an error.
   * 
   * @param event - The form submission event
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); // Show loading state
    setError(null);   // Clear any previous errors

    // Extract form data
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Attempt to login using server action
    const result = await login({ email, password });

    // Handle authentication result
    if (result?.error) {
      // Show error message if login failed
      setError(result.error);
      setLoading(false);
    } else {
      // Redirect to polls page on successful login
      // Full page reload ensures the session is properly established
      window.location.href = '/polls';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login to ALX Polly</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="your@email.com" 
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password"
                type="password" 
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}