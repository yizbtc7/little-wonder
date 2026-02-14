import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const supabaseAuth = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured.' }, { status: 500 });
    }

    const formData = await request.formData();
    const audio = formData.get('audio');
    const language = (formData.get('language')?.toString() ?? 'es').toLowerCase();

    if (!(audio instanceof File)) {
      return NextResponse.json({ error: 'audio file is required' }, { status: 400 });
    }

    const targetLanguage = language === 'en' ? 'en' : 'es';

    const transcribeWithModel = async (model: 'gpt-4o-mini-transcribe' | 'whisper-1') => {
      const providerForm = new FormData();
      providerForm.append('file', audio);
      providerForm.append('model', model);
      providerForm.append('language', targetLanguage);

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: providerForm,
      });

      const payload = (await response.json()) as { text?: string; error?: { message?: string } };
      return { ok: response.ok, payload };
    };

    const firstAttempt = await transcribeWithModel('gpt-4o-mini-transcribe');
    const finalAttempt = firstAttempt.ok ? firstAttempt : await transcribeWithModel('whisper-1');

    if (!finalAttempt.ok) {
      return NextResponse.json({ error: finalAttempt.payload?.error?.message ?? 'transcription_failed' }, { status: 502 });
    }

    const transcript = finalAttempt.payload.text?.trim() ?? '';
    if (!transcript) {
      return NextResponse.json({ error: 'empty_transcript' }, { status: 422 });
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
