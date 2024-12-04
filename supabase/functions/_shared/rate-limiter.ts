import { createClient } from '@supabase/supabase-js';

const RATE_LIMIT_WINDOW = 60; // 1 minute window
const MAX_REQUESTS = 60; // 60 requests per minute

export async function checkRateLimit(userId: string, functionName: string) {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Clean up old records and get request count
  const { count } = await supabaseAdmin
    .from('function_rate_limits')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('function_name', functionName)
    .gte('timestamp', windowStart);

  if (count && count >= MAX_REQUESTS) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Log new request
  await supabaseAdmin
    .from('function_rate_limits')
    .insert({
      user_id: userId,
      function_name: functionName,
      timestamp: now,
    });

  // Clean up old records
  await supabaseAdmin
    .from('function_rate_limits')
    .delete()
    .lt('timestamp', windowStart);
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};