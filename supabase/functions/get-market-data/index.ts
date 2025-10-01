import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CoinGeckoPrice {
  usd: number;
  usd_24h_change: number;
}

interface MarketDataResponse {
  [key: string]: {
    price: number;
    change24h: number;
    symbol: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const coins = ['bitcoin', 'ethereum', 'usd-coin'];
    const symbols: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'usd-coin': 'USDC'
    };
    
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data: { [key: string]: CoinGeckoPrice } = await response.json();
    
    const marketData: MarketDataResponse = {};
    
    for (const coin of coins) {
      if (data[coin]) {
        marketData[symbols[coin]] = {
          price: data[coin].usd,
          change24h: data[coin].usd_24h_change || 0,
          symbol: symbols[coin]
        };
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, data: marketData }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching market data:', error);
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