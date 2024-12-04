import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from './cors.ts';

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

const defaultOptions: RateLimitOptions = {
  maxRequests: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
};

export async function rateLimiter(
  req: Request,
  functionName: string,
  options: RateLimitOptions = defaultOptions
): Promise<Response | null> {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Get user ID from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error(`[${functionName}] No authorization header`);
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error(`[${functionName}] Invalid token:`, userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - (options.windowMs / 1000);

    // Clean up old entries
    await supabaseClient
      .from('function_rate_limits')
      .delete()
      .lt('timestamp', windowStart);

    // Count requests in current window
    const { count } = await supabaseClient
      .from('function_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('function_name', functionName)
      .gte('timestamp', windowStart);

    if (count && count >= options.maxRequests) {
      console.error(`[${functionName}] Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: corsHeaders }
      );
    }

    // Log new request
    const { error: insertError } = await supabaseClient
      .from('function_rate_limits')
      .insert({
        user_id: user.id,
        function_name: functionName,
        timestamp: now,
      });

    if (insertError) {
      console.error(`[${functionName}] Error logging rate limit:`, insertError);
      // Don't block the request if logging fails
    }

    return null;
  } catch (error) {
    console.error(`[${functionName}] Rate limiter error:`, error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
}