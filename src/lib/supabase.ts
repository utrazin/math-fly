import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
        };
      };
      user_progress: {
        Row: {
          user_id: string;
          max_phase: number;
          total_correct: number;
          total_points: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          max_phase?: number;
          total_correct?: number;
          total_points?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          max_phase?: number;
          total_correct?: number;
          total_points?: number;
          updated_at?: string;
        };
      };
      phase_results: {
        Row: {
          id: string;
          user_id: string;
          phase: number;
          correct_answers: number;
          points_earned: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phase: number;
          correct_answers: number;
          points_earned: number;
          completed_at?: string;
        };
      };
    };
  };
};