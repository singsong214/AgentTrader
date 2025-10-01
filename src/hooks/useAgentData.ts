import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MarketData {
  [key: string]: {
    price: number;
    change24h: number;
    symbol: string;
  };
}

interface NewsArticle {
  title: string;
  source: string;
  url?: string;
  publishedAt: string;
}

interface Trade {
  id: string;
  asset: string;
  action: 'buy' | 'sell' | 'hold';
  amount: number;
  price: number;
  total_value: number;
  ai_reason: string | null;
  tx_hash: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

interface Wallet {
  id: string;
  wallet_address: string;
  network: string;
}

export function useAgentData() {
  const { user } = useAuth();
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [lastTrade, setLastTrade] = useState<Trade | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const fetchMarketData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-market-data`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setMarketData(result.data);
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-news`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setNews(result.data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  }, []);

  const fetchWallet = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  }, [user]);

  const fetchLastTrade = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setLastTrade(data);
    } catch (error) {
      console.error('Error fetching last trade:', error);
    }
  }, [user]);

  const runAgent = useCallback(async () => {
    setIsRunning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-agent-decision`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        await fetchLastTrade();
        await fetchWallet();
        await fetchMarketData();
      } else {
        console.error('Agent run failed:', result.error);
      }
    } catch (error) {
      console.error('Error running agent:', error);
    } finally {
      setIsRunning(false);
    }
  }, [fetchLastTrade, fetchWallet, fetchMarketData]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchMarketData(),
      fetchNews(),
      fetchWallet(),
      fetchLastTrade(),
    ]);
    setLoading(false);
  }, [fetchMarketData, fetchNews, fetchWallet, fetchLastTrade]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  return {
    marketData,
    news,
    lastTrade,
    wallet,
    loading,
    isRunning,
    runAgent,
    refreshData,
  };
}
