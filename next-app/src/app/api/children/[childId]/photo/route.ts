import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function POST(request: Request, context: { params: Promise<{ childId: string }> }) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId } = await context.params;
  const db = dbClient();

  const { data: child } = await db.from('children').select('id').eq('id', childId).eq('user_id', user.id).maybeSingle();
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const form = await request.formData();
  const file = form.get('photo');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'photo file is required' }, { status: 400 });
  }

  // Safe stub: keep build stable without hard dependency on storage bucket.
  // This path is future-ready for a storage upload implementation.
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const stubPath = `/uploads/children/${childId}/${Date.now()}-${safeFileName}`;

  const { error } = await db.from('children').update({ photo_url: stubPath }).eq('id', childId).eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ photo_url: stubPath, stub: true });
}
