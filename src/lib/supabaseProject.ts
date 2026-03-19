// Single source of truth for the active Supabase project used by this frontend.
// Points to Lovable Cloud project.

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://fvkpommmtuxlhseciaml.supabase.co";
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2a3BvbW1tdHV4bGhzZWNpYW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MjAzOTYsImV4cCI6MjA4ODI5NjM5Nn0.DWph9ijyCMhyBSg4oXcY1te3NQfkJDqQYcLqqwqj5as";
