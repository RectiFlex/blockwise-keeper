import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

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
            content: 'You are an expert in property maintenance and warranty analysis. Analyze the data and provide insights about warranty coverage and recommendations. Return your response as a JSON object with two arrays: "coverage" for analysis points and "suggestions" for recommendations.'
          },
          {
            role: 'user',
            content: JSON.stringify(analysisPrompt)
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    let analysis;
    try {
      // Attempt to parse the response content as JSON
      analysis = JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error);
      // Fallback to a structured format if parsing fails
      const content = data.choices[0].message.content;
      analysis = {
        coverage: [content.split('\n\n')[0] || 'Error analyzing warranty coverage'],
        suggestions: [content.split('\n\n')[1] || 'Error generating suggestions']
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