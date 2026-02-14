import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const PHOTO_BUCKET = process.env.SUPABASE_CHILD_PHOTOS_BUCKET ?? 'child-photos';

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function resolveExtension(file: File): string {
  const mimeExtensionMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  const mimeExtension = mimeExtensionMap[file.type];
  if (mimeExtension) return mimeExtension;

  const nameExtension = file.name.split('.').pop()?.toLowerCase();
  if (nameExtension && /^[a-z0-9]+$/i.test(nameExtension)) return nameExtension;

  return 'jpg';
}

function tryExtractBucketPath(photoUrl: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = photoUrl.indexOf(marker);
  if (index === -1) return null;
  return photoUrl.slice(index + marker.length);
}

export async function POST(request: Request, context: { params: Promise<{ childId: string }> }) {
  const supabaseAuth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId } = await context.params;
  const db = dbClient();

  const { data: child } = await db.from('children').select('id,photo_url').eq('id', childId).eq('user_id', user.id).maybeSingle();
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const form = await request.formData();
  const file = form.get('photo');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'photo file is required' }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Please upload a JPG, PNG, WEBP, or GIF image.' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image is too large. Maximum size is 5MB.' }, { status: 400 });
  }

  const extension = resolveExtension(file);
  const objectPath = `${user.id}/${childId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const uploadResult = await db.storage.from(PHOTO_BUCKET).upload(objectPath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });

  if (uploadResult.error) {
    return NextResponse.json({ error: 'Could not upload photo right now. Please try again.' }, { status: 500 });
  }

  const { data: publicUrlData } = db.storage.from(PHOTO_BUCKET).getPublicUrl(objectPath);
  const photoUrl = publicUrlData.publicUrl;

  const { error: updateError } = await db.from('children').update({ photo_url: photoUrl }).eq('id', childId).eq('user_id', user.id);

  if (updateError) {
    await db.storage.from(PHOTO_BUCKET).remove([objectPath]);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (child.photo_url) {
    const previousPath = tryExtractBucketPath(child.photo_url, PHOTO_BUCKET);
    if (previousPath) {
      await db.storage.from(PHOTO_BUCKET).remove([previousPath]);
    }
  }

  return NextResponse.json({ photo_url: photoUrl });
}
