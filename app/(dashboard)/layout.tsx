"use client";

/**
 * Dashboard Layout Component
 * 
 * This component provides the common layout structure for all dashboard pages.
 * It includes navigation, user authentication checks, and a profile dropdown menu.
 * The layout ensures that only authenticated users can access dashboard pages.
 */

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/app/lib/context/auth-context";

/**
 * Dashboard Layout Component
 * 
 * Renders the common layout for all dashboard pages, including navigation header
 * and authentication protection. Redirects unauthenticated users to the login page.
 * 
 * @param children - The child components to render within the dashboard layout
 * @returns React component for the dashboard layout
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  // Access authentication context for user data and auth functions
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  /**
   * Authentication check effect
   * 
   * Redirects to login page if user is not authenticated
   * This protects all dashboard routes from unauthorized access
   */
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  /**
   * Handles user sign out process
   * 
   * Signs out the current user and redirects to login page
   */
  const handleSignOut = async () => {
    await signOut(); // Call auth context signOut function
    router.push("/login"); // Redirect to login page
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p>Loading user session...</p>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  // This prevents flash of dashboard content before redirect
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/polls" className="text-xl font-bold text-slate-800">
            ALX Polly
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/polls" className="text-slate-600 hover:text-slate-900">
              My Polls
            </Link>
            <Link
              href="/create"
              className="text-slate-600 hover:text-slate-900"
            >
              Create Poll
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Button asChild>
              <Link href="/create">Create Poll</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        user?.user_metadata?.avatar_url ||
                        "/placeholder-user.jpg"
                      }
                      alt={user?.email || "User"}
                    />
                    <AvatarFallback>
                      {user?.email ? user.email[0].toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
      <footer className="border-t bg-white py-4">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} ALX Polly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
