// Backend handoff type contract. Regenerate from the real Supabase schema once migrations exist.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; display_name: string | null; created_at: string };
        Insert: { id: string; email: string; display_name?: string | null; created_at?: string };
        Update: { display_name?: string | null };
      };
      trips: {
        Row: { id: string; organiser_id: string; name: string; start_date: string | null; end_date: string | null; status: 'draft'|'active'|'closed'; full_trip_status: 'none'|'pending'|'active'|'refunded'|'expired'; created_at: string };
        Insert: { id?: string; organiser_id: string; name: string; start_date?: string | null; end_date?: string | null; status?: 'draft'|'active'|'closed'; full_trip_status?: 'none'|'pending'|'active'|'refunded'|'expired'; created_at?: string };
        Update: { name?: string; start_date?: string | null; end_date?: string | null; status?: 'draft'|'active'|'closed' };
      };
      trip_members: {
        Row: { id: string; trip_id: string; user_id: string | null; email: string; role: 'organiser'|'member'; attendance_status: 'pending'|'accepted'|'declined'; created_at: string };
        Insert: { id?: string; trip_id: string; user_id?: string | null; email: string; role?: 'organiser'|'member'; attendance_status?: 'pending'|'accepted'|'declined'; created_at?: string };
        Update: { attendance_status?: 'pending'|'accepted'|'declined'; user_id?: string | null };
      };
      full_trip_purchases: {
        Row: { id: string; trip_id: string; organiser_id: string; stripe_session_id: string | null; stripe_payment_intent_id: string | null; status: 'pending'|'active'|'failed'|'refunded'|'expired'; amount_pence: number; currency: string; created_at: string; updated_at: string };
        Insert: { id?: string; trip_id: string; organiser_id: string; stripe_session_id?: string | null; stripe_payment_intent_id?: string | null; status?: 'pending'|'active'|'failed'|'refunded'|'expired'; amount_pence: number; currency?: string; created_at?: string; updated_at?: string };
        Update: { stripe_session_id?: string | null; stripe_payment_intent_id?: string | null; status?: 'pending'|'active'|'failed'|'refunded'|'expired'; updated_at?: string };
      };
      media: {
        Row: { id: string; trip_id: string; uploader_id: string; storage_key: string; mime_type: string; size_bytes: number; created_at: string; expires_at: string | null };
        Insert: { id?: string; trip_id: string; uploader_id: string; storage_key: string; mime_type: string; size_bytes: number; created_at?: string; expires_at?: string | null };
        Update: { expires_at?: string | null };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
