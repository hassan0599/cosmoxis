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
      profiles: {
        Row: {
          id: string
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      receipts: {
        Row: {
          id: string
          user_id: string
          merchant_name: string | null
          date: string | null
          total_amount: number | null
          currency: string
          category: string | null
          notes: string | null
          image_url: string | null
          raw_extraction_json: Json | null
          confidence_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          merchant_name?: string | null
          date?: string | null
          total_amount?: number | null
          currency?: string
          category?: string | null
          notes?: string | null
          image_url?: string | null
          raw_extraction_json?: Json | null
          confidence_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          merchant_name?: string | null
          date?: string | null
          total_amount?: number | null
          currency?: string
          category?: string | null
          notes?: string | null
          image_url?: string | null
          raw_extraction_json?: Json | null
          confidence_score?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'receipts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Receipt = Database['public']['Tables']['receipts']['Row']
export type ReceiptInsert = Database['public']['Tables']['receipts']['Insert']
export type ReceiptUpdate = Database['public']['Tables']['receipts']['Update']
