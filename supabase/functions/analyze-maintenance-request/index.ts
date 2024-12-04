import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Fetch the maintenance request details
    const { data: request, error: requestError } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        properties (*)
      `)
      .eq('id', requestId)
      .single();

    if (requestError) throw requestError;

    // Prepare the prompt for OpenAI
    const prompt = `As an expert in Australian statutory warranty requirements for property maintenance, analyze this maintenance request:

Title: ${request.title}
Description: ${request.description}
Property Type: ${request.properties.address.includes('industrial') ? 'Industrial' : 
                request.properties.address.includes('business') ? 'Commercial' : 'Residential'}
Priority: ${request.priority}

Please analyze if this maintenance request should proceed based on Australian statutory warranty requirements. Consider:
1. If this is a statutory warranty issue
2. The typical warranty period for this type of issue
3. Whether this is an urgent safety concern
4. If this falls under normal wear and tear

Provide a structured response with:
1. Decision (Should Proceed: Yes/No)
2. Justification
3. Relevant warranty period (if applicable)
4. Recommended next steps`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in Australian property maintenance and statutory warranty requirements. Analyze maintenance requests and provide clear, structured advice on whether they should proceed based on statutory warranty requirements.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});