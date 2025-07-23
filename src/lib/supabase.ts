import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DatabaseUser {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCategory {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  paid_by: string;
  category_id: string;
  split_between: string[];
  created_at: string;
  updated_at: string;
}

export interface DatabasePayment {
  id: string;
  from_user: string;
  to_user: string;
  amount: number;
  date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}