import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase, checkIsSupabaseConfigured } from '../lib/supabase/client';

describe('Authentication & Database Persistence Guardrails', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('accurately identifies when live Supabase credentials are absent', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Must return false so app activates local offline demo mode rather than pretending to be cloud synced
    expect(checkIsSupabaseConfigured()).toBe(false);
  });

  it('never exposes SUPABASE_SERVICE_ROLE_KEY to the public frontend bundle', () => {
    // Check that service role key is strictly absent from NEXT_PUBLIC_* variables
    const publicEnvKeys = Object.keys(process.env).filter((k) => k.startsWith('NEXT_PUBLIC_'));
    expect(publicEnvKeys).not.toContain('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
    expect(publicEnvKeys).not.toContain('NEXT_PUBLIC_DATA_GOV_API_KEY');
    expect(publicEnvKeys).not.toContain('NEXT_PUBLIC_GEMINI_API_KEY');
  });

  it('supabase client object is defined and safe to initialize even without live project keys', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });
});
