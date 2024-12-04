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
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Fetch warranty and maintenance data
    const { data: warranties } = await supabase
      .from('warranties')
      .select('*, properties(*)');

    const { data: maintenanceRequests } = await supabase
      .from('maintenance_requests')
      .select('*, properties(*)');

    // Prepare data for analysis
    const analysisPrompt = `As an expert in Australian property maintenance and statutory warranty requirements, analyze this data:

Warranties: ${JSON.stringify(warranties)}
Maintenance Requests: ${JSON.stringify(maintenanceRequests)}

Provide a structured analysis with:
1. Current warranty coverage status and potential gaps
2. Compliance with Australian statutory requirements
3. Recommendations for improvement
4. Risk areas that need attention

Format the response as a JSON object with two arrays:
1. 'coverage' - Analysis of current coverage and compliance
2. 'suggestions' - Specific recommendations for improvement`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert in Australian property maintenance and warranty requirements.' },
          { role: 'user', content: analysisPrompt }
        ],
      }),
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-warranty-data function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});