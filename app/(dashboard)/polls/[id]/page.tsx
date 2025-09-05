'use client';

/**
 * Poll Detail Page Component
 * 
 * This component displays a single poll with its details and voting interface.
 * It allows users to view poll information, cast votes, and see results after voting.
 * The component also provides options to edit, delete, and share the poll.
 */

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Mock poll data for development and testing
 * In a production environment, this would be fetched from the database
 */
const mockPoll = {
  id: '1',
  title: 'Favorite Programming Language',
  description: 'What programming language do you prefer to use?',
  options: [
    { id: '1', text: 'JavaScript', votes: 15 },
    { id: '2', text: 'Python', votes: 12 },
    { id: '3', text: 'Java', votes: 8 },
    { id: '4', text: 'C#', votes: 5 },
    { id: '5', text: 'Go', votes: 2 },
  ],
  totalVotes: 42,
  createdAt: '2023-10-15',
  createdBy: 'John Doe',
};

/**
 * Poll Detail Page Component
 * 
 * Renders a detailed view of a poll with voting functionality.
 * Users can select an option, submit their vote, and view results.
 * The page also provides navigation, editing, deletion, and sharing options.
 * 
 * @param params - Object containing the poll ID from the URL parameters
 * @returns React component for the poll detail page
 */
export default function PollDetailPage({ params }: { params: { id: string } }) {
  // State for tracking user interaction with the poll
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app, you would fetch the poll data based on the ID
  const poll = mockPoll;
  // Calculate total votes across all options
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  /**
   * Handles the vote submission process
   * 
   * This function is triggered when a user submits their vote.
   * It shows a loading state, simulates an API call to submit the vote,
   * and updates the UI to display results after voting.
   * In a production environment, this would call the actual submitVote API.
   */
  const handleVote = () => {
    if (!selectedOption) return; // Don't proceed if no option is selected
    
    setIsSubmitting(true); // Show loading state
    
    // Simulate API call with a delay
    // In a real app: await submitVote(params.id, selectedOption);
    setTimeout(() => {
      setHasVoted(true);      // Update UI to show results
      setIsSubmitting(false); // Hide loading state
    }, 1000);
  };

  /**
   * Calculates the percentage of votes for a given option
   * 
   * @param votes - Number of votes for the option
   * @returns Percentage of total votes (rounded to nearest integer)
   */
  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0; // Prevent division by zero
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/polls" className="text-blue-600 hover:underline">
          &larr; Back to Polls
        </Link>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/polls/${params.id}/edit`}>Edit Poll</Link>
          </Button>
          <Button variant="outline" className="text-red-500 hover:text-red-700">
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{poll.title}</CardTitle>
          <CardDescription>{poll.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasVoted ? (
            <div className="space-y-3">
              {poll.options.map((option) => (
                <div 
                  key={option.id} 
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${selectedOption === option.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  {option.text}
                </div>
              ))}
              <Button 
                onClick={handleVote} 
                disabled={!selectedOption || isSubmitting} 
                className="mt-4"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">Results:</h3>
              {poll.options.map((option) => (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{option.text}</span>
                    <span>{getPercentage(option.votes)}% ({option.votes} votes)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${getPercentage(option.votes)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              <div className="text-sm text-slate-500 pt-2">
                Total votes: {totalVotes}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-slate-500 flex justify-between">
          <span>Created by {poll.createdBy}</span>
          <span>Created on {new Date(poll.createdAt).toLocaleDateString()}</span>
        </CardFooter>
      </Card>

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-4">Share this poll</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1">
            Copy Link
          </Button>
          <Button variant="outline" className="flex-1">
            Share on Twitter
          </Button>
        </div>
      </div>
    </div>
  );
}