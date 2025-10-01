import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    const marketDataUrl = `${supabaseUrl}/functions/v1/get-market-data`;
    const newsUrl = `${supabaseUrl}/functions/v1/get-news`;

    const headers = {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    };

    const [marketResponse, newsResponse] = await Promise.all([
      fetch(marketDataUrl, { headers }),
      fetch(newsUrl, { headers })
    ]);

    const marketData = await marketResponse.json();
    const newsData = await newsResponse.json();

    if (!marketData.success || !newsData.success) {
      throw new Error('Failed to fetch market data or news');
    }

    const { data: wallet } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const portfolioContext = wallet 
      ? `Current wallet: ${wallet.wallet_address}` 
      : 'No wallet configured yet';

    const prompt = `You are an AI crypto trading agent. Analyze the following market data and news, then decide whether to buy, sell, or hold.

Market Data:
${JSON.stringify(marketData.data, null, 2)}

Recent News:
${newsData.data.map((article: any, i: number) => `${i + 1}. ${article.title} (${article.source})`).join('\n')}

${portfolioContext}

Instructions:
- Respond ONLY in this exact format:
Action: [Buy/Sell/Hold]
Asset: [BTC/ETH/USDC or N/A if Hold]
Amount: [numeric amount or 0 if Hold]
Reason: [your reasoning in one sentence]

- For Buy actions, suggest buying with USDC
- For Sell actions, suggest selling to USDC
- Be conservative and prioritize capital preservation
- Consider the 24h price changes and news sentiment
- If uncertain or news is negative, choose Hold

Provide your decision:`;

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      const mockDecision = {
        action: 'hold',
        asset: 'N/A',
        amount: 0,
        reason: 'OpenAI API key not configured. Running in demo mode with mock decision.'
      };

      await supabaseClient.from('trades').insert({
        user_id: user.id,
        wallet_id: wallet?.id || null,
        asset: mockDecision.asset,
        action: mockDecision.action,
        amount: mockDecision.amount,
        price: 0,
        total_value: 0,
        ai_reason: mockDecision.reason,
        status: 'completed'
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          decision: mockDecision,
          message: 'Demo mode: OpenAI API key not configured'
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a conservative crypto trading AI agent.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const aiResponse = openaiData.choices[0].message.content;

    const actionMatch = aiResponse.match(/Action:\s*([^\n]+)/i);
    const assetMatch = aiResponse.match(/Asset:\s*([^\n]+)/i);
    const amountMatch = aiResponse.match(/Amount:\s*([\d.]+)/i);
    const reasonMatch = aiResponse.match(/Reason:\s*([^\n]+)/i);

    const decision = {
      action: (actionMatch?.[1]?.trim().toLowerCase() || 'hold'),
      asset: (assetMatch?.[1]?.trim() || 'N/A'),
      amount: parseFloat(amountMatch?.[1] || '0'),
      reason: (reasonMatch?.[1]?.trim() || 'No reason provided')
    };

    const price = decision.asset !== 'N/A' && marketData.data[decision.asset] 
      ? marketData.data[decision.asset].price 
      : 0;

    const totalValue = decision.amount * price;

    await supabaseClient.from('trades').insert({
      user_id: user.id,
      wallet_id: wallet?.id || null,
      asset: decision.asset,
      action: decision.action,
      amount: decision.amount,
      price: price,
      total_value: totalValue,
      ai_reason: decision.reason,
      status: 'completed'
    });

    return new Response(
      JSON.stringify({ success: true, decision }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in agent decision:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});