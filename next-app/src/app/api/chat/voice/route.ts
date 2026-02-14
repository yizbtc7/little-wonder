import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type OpenAITranscriptionPayload = {
  text?: string;
  error?: { message?: string };
};

async function parseProviderPayload(response: Response): Promise<OpenAITranscriptionPayload> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return (await response.json()) as OpenAITranscriptionPayload;
    } catch {
      return { error: { message: 'Invalid JSON payload from transcription provider.' } };
    }
  }

  try {
    const text = await response.text();
    return { error: { message: text.slice(0, 240) || 'Non-JSON payload from transcription provider.' } };
  } catch {
    return { error: { message: 'Unreadable payload from transcription provider.' } };
  }
}

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

    if (audio.size === 0) {
      return NextResponse.json({ error: 'Audio file is empty. Please record again.' }, { status: 400 });
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

      const payload = await parseProviderPayload(response);

      return {
        ok: response.ok,
        status: response.status,
        payload,
      };
    };

    const firstAttempt = await transcribeWithModel('gpt-4o-mini-transcribe');
    const secondAttempt = firstAttempt.ok ? null : await transcribeWithModel('whisper-1');
    const finalAttempt = secondAttempt ?? firstAttempt;

    if (!finalAttempt.ok) {
      const providerMessage = finalAttempt.payload?.error?.message ?? 'transcription_failed';
      const debugContext = `model=${secondAttempt ? 'whisper-1' : 'gpt-4o-mini-transcribe'} status=${finalAttempt.status} mime=${audio.type || 'unknown'} size=${audio.size}`;
      return NextResponse.json({ error: `${providerMessage} (${debugContext})` }, { status: 502 });
    }

    const transcript = finalAttempt.payload.text?.trim() ?? '';
    if (!transcript) {
      return NextResponse.json({ error: `empty_transcript (mime=${audio.type || 'unknown'} size=${audio.size})` }, { status: 422 });
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
