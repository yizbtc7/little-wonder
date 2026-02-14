import { createClient } from '@supabase/supabase-js';
import type { Language } from '@/lib/translations';

export function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function getUserLanguage(userId: string, fallback: Language = 'es'): Promise<Language> {
  const db = dbClient();
  const { data } = await db.from('users').select('language').eq('id', userId).maybeSingle<{ language?: string | null }>();
  return data?.language === 'en' ? 'en' : fallback;
}

export function languagePriority(language: Language): Language[] {
  return language === 'es' ? ['es', 'en'] : ['en', 'es'];
}
