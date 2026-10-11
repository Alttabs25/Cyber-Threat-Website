import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";

export const isSupabaseConfigured =
  /^https:\/\/.+\.supabase\.co$/.test(supabaseUrl) &&
  !supabaseUrl.includes("your-project-id") &&
  supabaseKey.length > 20 &&
  !supabaseKey.includes("your-anon-key");

// createClient requires non-empty values. The placeholders keep the UI renderable
// while configuration errors are surfaced before any request is attempted.
export const supabase = createClient(
  supabaseUrl || "https://your-project-id.supabase.co",
  supabaseKey || "your-anon-key-here",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const assertSupabaseConfigured = () => {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env."
    );
  }
};
