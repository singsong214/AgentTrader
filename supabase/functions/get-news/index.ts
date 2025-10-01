import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NewsArticle {
  title: string;
  source: string;
  url?: string;
  publishedAt: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const response = await fetch('https://www.coindesk.com/arc/outboundfeeds/rss/');
    
    if (!response.ok) {
      throw new Error(`CoinDesk RSS error: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];
    const articles: NewsArticle[] = [];
    
    for (let i = 0; i < Math.min(items.length, 5); i++) {
      const item = items[i];
      
      const titleMatch = item.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/);
      const linkMatch = item.match(/<link>([^<]+)<\/link>/);
      const pubDateMatch = item.match(/<pubDate>([^<]+)<\/pubDate>/);
      
      if (titleMatch) {
        articles.push({
          title: titleMatch[1],
          source: 'CoinDesk',
          url: linkMatch ? linkMatch[1] : undefined,
          publishedAt: pubDateMatch ? pubDateMatch[1] : new Date().toISOString()
        });
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, data: articles }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
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