export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          wallet_address: string
          network: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_address: string
          network?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_address?: string
          network?: string
          created_at?: string
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          wallet_id: string | null
          asset: string
          action: 'buy' | 'sell' | 'hold'
          amount: number
          price: number
          total_value: number
          ai_reason: string | null
          tx_hash: string | null
          status: 'pending' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_id?: string | null
          asset: string
          action: 'buy' | 'sell' | 'hold'
          amount?: number
          price?: number
          total_value?: number
          ai_reason?: string | null
          tx_hash?: string | null
          status?: 'pending' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_id?: string | null
          asset?: string
          action?: 'buy' | 'sell' | 'hold'
          amount?: number
          price?: number
          total_value?: number
          ai_reason?: string | null
          tx_hash?: string | null
          status?: 'pending' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
        }
      }
      portfolio_snapshots: {
        Row: {
          id: string
          user_id: string
          total_value_usd: number
          holdings: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_value_usd?: number
          holdings?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_value_usd?: number
          holdings?: Json
          created_at?: string
        }
      }
    }
  }
}
