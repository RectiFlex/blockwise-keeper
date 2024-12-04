import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch warranty and maintenance data
    const { data: warranties } = await supabase
      .from('warranties')
      .select('*, properties(*)');

    const { data: maintenanceRequests } = await supabase
      .from('maintenance_requests')
      .select('*, properties(*)');

    // Prepare data for analysis
    const analysisPrompt = {
      warranties,
      maintenanceRequests,
      requestType: 'full-analysis'
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in property maintenance and warranty analysis. Analyze the data and provide insights in JSON format with two arrays: "coverage" for analysis of current coverage and compliance, and "suggestions" for specific recommendations.'
          },
          {
            role: 'user',
            content: JSON.stringify(analysisPrompt)
          }
        ],
      }),
    });

    const data = await response.json();
    let analysis;
    
    try {
      analysis = JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      analysis = {
        coverage: ['Error analyzing warranty coverage'],
        suggestions: ['Error generating suggestions']
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in analyze-warranty-data function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});