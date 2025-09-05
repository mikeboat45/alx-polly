'use client';

/**
 * Create Poll Page Component
 * 
 * This page serves as the container for the poll creation interface.
 * It provides a simple layout with a title and embeds the PollCreateForm component
 * which handles the actual poll creation functionality.
 */

import PollCreateForm from "./PollCreateForm";

/**
 * Create Poll Page Component
 * 
 * Renders the page layout for creating a new poll, including the page title
 * and the poll creation form component.
 * 
 * @returns React component for the poll creation page
 */
export default function CreatePollPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create a New Poll</h1>
      <PollCreateForm />
    </main>
  );
}