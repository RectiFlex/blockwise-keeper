import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from './cors.ts';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export async function checkRateLimit(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  functionName: string,
  options: RateLimitOptions
) {
  try {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - options.windowMs / 1000;

    // Clean up old entries
    await supabaseClient
      .from('function_rate_limits')
      .delete()
      .lt('timestamp', windowStart);

    // Count recent requests
    const { count } = await supabaseClient
      .from('function_rate_limits')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('function_name', functionName)
      .gte('timestamp', windowStart)
      .single();

    if (count && count >= options.maxRequests) {
      throw new Error('Rate limit exceeded');
    }

    // Log new request
    await supabaseClient
      .from('function_rate_limits')
      .insert({
        user_id: userId,
        function_name: functionName,
        timestamp: now,
      });

    return true;
  } catch (error) {
    console.error('Rate limit error:', error);
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.',
      }),
      { 
        status: 429, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        } 
      }
    );
  }
}