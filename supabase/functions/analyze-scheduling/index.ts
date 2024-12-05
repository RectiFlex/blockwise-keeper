import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestId } = await req.json();
    console.log(`Analyzing scheduling for request ID: ${requestId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch maintenance request details
    const { data: request, error: requestError } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        properties (*)
      `)
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;

    // Fetch existing work orders to analyze patterns
    const { data: workOrders, error: workOrdersError } = await supabase
      .from('work_orders')
      .select('*')
      .order('scheduled_date', { ascending: false })
      .limit(10);

    if (workOrdersError) throw workOrdersError;

    // Use OpenAI to analyze and suggest scheduling
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant specializing in maintenance scheduling optimization. 
            Analyze maintenance requests and suggest optimal scheduling windows based on priority, 
            type of maintenance, and historical patterns.`
          },
          {
            role: 'user',
            content: `Analyze this maintenance request and suggest scheduling options:
            Request: ${JSON.stringify(request)}
            Recent work orders: ${JSON.stringify(workOrders)}
            
            Provide scheduling suggestions in this format:
            1. Suggested time windows
            2. Priority level justification
            3. Scheduling considerations
            4. Resource optimization tips`
          }
        ],
      }),
    });

    const aiData = await openAIResponse.json();
    console.log('AI analysis completed successfully');

    return new Response(
      JSON.stringify({
        analysis: aiData.choices[0].message.content,
        request: request,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-scheduling function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});