"use client";

/**
 * Poll Creation Form Component
 * 
 * This component provides a form interface for users to create new polls.
 * It manages poll question and options, validates inputs, and submits the data
 * to the server via the createPoll action.
 */

import { useState } from "react";
import { createPoll } from "@/app/lib/actions/poll-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Poll Creation Form Component
 * 
 * Renders a form that allows users to create a new poll with a question and multiple options.
 * Manages form state, validation, and submission to the server.
 * Provides feedback on success or error and redirects to polls page after successful creation.
 * 
 * @returns React component for poll creation form
 */
export default function PollCreateForm() {
  // State for poll options (minimum 2 options required)
  const [options, setOptions] = useState(["", ""]);
  // State for error and success messages
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Updates the value of a specific poll option
   * 
   * @param idx - The index of the option to update
   * @param value - The new value for the option
   */
  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  /**
   * Adds a new empty option to the poll
   */
  const addOption = () => setOptions((opts) => [...opts, ""]);
  
  /**
   * Removes an option from the poll if there are more than the minimum required (2)
   * 
   * @param idx - The index of the option to remove
   */
  const removeOption = (idx: number) => {
    if (options.length > 2) {
      // Maintain at least 2 options at all times
      setOptions((opts) => opts.filter((_, i) => i !== idx));
    }
  };

  return (
    <form
      action={async (formData) => {
        // Reset state before submission
        setError(null);
        setSuccess(false);
        
        // Submit poll data to server action
        const res = await createPoll(formData);
        
        if (res?.error) {
          // Display error message if creation failed
          setError(res.error);
        } else {
          // Show success message and redirect after a short delay
          setSuccess(true);
          setTimeout(() => {
            window.location.href = "/polls";
          }, 1200);
        }
      }}
      className="space-y-6 max-w-md mx-auto"
    >
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input name="question" id="question" required />
      </div>
      <div>
        <Label>Options</Label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              name="options"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
            {options.length > 2 && (
              <Button type="button" variant="destructive" onClick={() => removeOption(idx)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={addOption} variant="secondary">
          Add Option
        </Button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">Poll created! Redirecting...</div>}
      <Button type="submit">Create Poll</Button>
    </form>
  );
}