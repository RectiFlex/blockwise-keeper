// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://airhcklzafroemmmqdyc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpcmhja2x6YWZyb2VtbW1xZHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzMDQ3ODAsImV4cCI6MjA0ODg4MDc4MH0.qAkuW-3QaOLvsGSvR1OT9PKlHwNTOua7QcLc1CXNKcE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);