"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { validateCSRFToken, CSRF } from '@/lib/csrf-protection';

// CREATE POLL
export async function createPoll(formData: FormData) {
  // Validate CSRF token
  const csrfToken = formData.get(CSRF.FIELD_NAME) as string;
  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    return { error: 'Invalid security token. Please refresh the page and try again.' };
  }
  
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // Input validation
  if (!question || question.trim() === '') {
    return { error: "Please provide a valid question." };
  }
  
  if (question.length > 500) {
    return { error: "Question is too long. Maximum 500 characters allowed." };
  }
  
  if (options.length < 2) {
    return { error: "Please provide at least two options." };
  }
  
  if (options.length > 10) {
    return { error: "Maximum 10 options allowed." };
  }
  
  // Validate each option
  for (const option of options) {
    if (option.trim() === '') {
      return { error: "Empty options are not allowed." };
    }
    
    if (option.length > 200) {
      return { error: "Option text is too long. Maximum 200 characters allowed." };
    }
  }
  
  // Check for duplicate options
  const uniqueOptions = new Set(options.map(opt => opt.trim()));
  if (uniqueOptions.size !== options.length) {
    return { error: "Duplicate options are not allowed." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }
  
  // Sanitize inputs before storing
  const sanitizedQuestion = question.trim();
  const sanitizedOptions = options.map(opt => opt.trim());

  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question: sanitizedQuestion,
      options: sanitizedOptions,
    },
  ]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/polls");
  return { error: null };
}

// GET USER POLLS
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { polls: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

// GET POLL BY ID
export async function getPollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

// SUBMIT VOTE
export async function submitVote(pollId: string, optionIndex: number, csrfToken?: string) {
  // Validate CSRF token if provided
  if (csrfToken && !validateCSRFToken(csrfToken)) {
    return { error: 'Invalid security token. Please refresh the page and try again.' };
  }
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Require login to vote to prevent vote manipulation
  if (!user) return { error: 'You must be logged in to vote.' };

  // Check if user has already voted on this poll
  const { data: existingVote, error: checkError } = await supabase
    .from("votes")
    .select("*")
    .eq("poll_id", pollId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (checkError) return { error: checkError.message };
  if (existingVote) return { error: 'You have already voted on this poll.' };

  // Validate that the poll exists and the option index is valid
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("options")
    .eq("id", pollId)
    .single();

  if (pollError) return { error: pollError.message };
  if (!poll) return { error: 'Poll not found.' };
  
  // Check if option index is valid
  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return { error: 'Invalid option selected.' };
  }

  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user.id, // No longer allowing null user_id
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

// DELETE POLL
export async function deletePoll(id: string) {
  const supabase = await createClient();
  
  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (userError) return { error: userError.message };
  if (!user) return { error: "You must be logged in to delete a poll." };
  
  // Check if user is admin
  const isAdmin = (user.app_metadata as any)?.role === 'admin';
  
  // If not admin, verify ownership
  if (!isAdmin) {
    // Check if the poll belongs to the user
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("user_id")
      .eq("id", id)
      .single();
      
    if (pollError) return { error: pollError.message };
    if (!poll) return { error: "Poll not found." };
    
    // If user is not the owner, deny access
    if (poll.user_id !== user.id) {
      return { error: "You don't have permission to delete this poll." };
    }
  }
  
  // Delete poll votes first to maintain referential integrity
  const { error: votesError } = await supabase
    .from("votes")
    .delete()
    .eq("poll_id", id);
    
  if (votesError) return { error: votesError.message };
  
  // Delete the poll
  const { error } = await supabase.from("polls").delete().eq("id", id);
  if (error) return { error: error.message };
  
  revalidatePath("/polls");
  return { error: null };
}

// UPDATE POLL
export async function updatePoll(pollId: string, formData: FormData) {
  // Validate CSRF token
  const csrfToken = formData.get(CSRF.FIELD_NAME) as string;
  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    return { error: 'Invalid security token. Please refresh the page and try again.' };
  }
  
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  // Input validation
  if (!question || question.trim() === '') {
    return { error: "Please provide a valid question." };
  }
  
  if (question.length > 500) {
    return { error: "Question is too long. Maximum 500 characters allowed." };
  }
  
  if (options.length < 2) {
    return { error: "Please provide at least two options." };
  }
  
  if (options.length > 10) {
    return { error: "Maximum 10 options allowed." };
  }
  
  // Validate each option
  for (const option of options) {
    if (option.trim() === '') {
      return { error: "Empty options are not allowed." };
    }
    
    if (option.length > 200) {
      return { error: "Option text is too long. Maximum 200 characters allowed." };
    }
  }
  
  // Check for duplicate options
  const uniqueOptions = new Set(options.map(opt => opt.trim()));
  if (uniqueOptions.size !== options.length) {
    return { error: "Duplicate options are not allowed." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }
  
  // Check if user is admin
  const isAdmin = (user.app_metadata as any)?.role === 'admin';
  
  // First check if poll exists
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("user_id")
    .eq("id", pollId)
    .single();
    
  if (pollError) return { error: pollError.message };
  if (!poll) return { error: "Poll not found." };
  
  // If not admin and not the owner, deny access
  if (!isAdmin && poll.user_id !== user.id) {
    return { error: "You don't have permission to update this poll." };
  }
  
  // Sanitize inputs before storing
  const sanitizedQuestion = question.trim();
  const sanitizedOptions = options.map(opt => opt.trim());

  // Update the poll
  const { error } = await supabase
    .from("polls")
    .update({ 
      question: sanitizedQuestion, 
      options: sanitizedOptions 
    })
    .eq("id", pollId);

  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/polls");
  return { error: null };
}
