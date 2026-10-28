# KrishiConnect AI - Supabase Database Setup

This directory contains the PostgreSQL schema migrations, Row Level Security (RLS) policies, and seed data for KrishiConnect AI.

## Quick Setup via Supabase Dashboard

1. Create a new Supabase project at [database.new](https://database.new).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Run the migrations in order:
   - `migrations/001_initial_schema.sql`: Sets up all tables, foreign keys, and indexes.
   - `migrations/002_rls_policies.sql`: Enables RLS and grants farmer-level isolation.
   - `migrations/003_seed_demo_data.sql`: Populates reference crops and benchmark Mandi data.
4. Copy your **Project URL** and **anon public key** from Project Settings > API.
5. Add them to your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Demo Mode Fallback

If you don't configure Supabase credentials, KrishiConnect AI operates automatically in **Local Demo Mode** using browser IndexedDB and typed in-memory stores. No setup or external connection is required to evaluate the application!
