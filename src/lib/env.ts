import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL harus berupa URL Supabase yang valid'),
  VITE_SUPABASE_ANON_KEY: z.string().min(10, 'VITE_SUPABASE_ANON_KEY wajib diisi dengan anon key Supabase'),
});

const getEnv = () => {
  const parseResult = envSchema.safeParse({
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  });

  if (!parseResult.success) {
    const errorString = parseResult.error.errors
      .map(err => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
      
    console.warn(
      `⚠️  [Env Warning]: Environment variables tidak lengkap atau tidak valid:\n${errorString}\n` +
      `Sistem akan berjalan menggunakan fallback demo mode (Local Storage).`
    );

    return {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key-longer-than-ten-characters',
      isDemoMode: true,
    };
  }

  return {
    ...parseResult.data,
    isDemoMode: false,
  };
};

export const env = getEnv();
