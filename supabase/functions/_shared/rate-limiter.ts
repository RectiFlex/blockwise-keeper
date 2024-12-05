import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const RATE_LIMIT_INTERVAL = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // Maximum requests per interval

export async function checkRateLimit(functionName: string, userId: string): Promise<boolean> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const now = Date.now();
  const windowStart = now - RATE_LIMIT_INTERVAL;

  // Clean up old entries
  await supabase
    .from('function_rate_limits')
    .delete()
    .lt('timestamp', windowStart);

  // Count recent requests
  const { count } = await supabase
    .from('function_rate_limits')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('function_name', functionName)
    .gte('timestamp', windowStart);

  if ((count ?? 0) >= MAX_REQUESTS) {
    return false;
  }

  // Record new request
  await supabase
    .from('function_rate_limits')
    .insert({
      user_id: userId,
      function_name: functionName,
      timestamp: now
    });

  return true;
}