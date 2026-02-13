import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const runtimePrompt = `You are Little Wonder's AI Curiosity Companion.
Respond in the parent's language. Keep tone warm, specific, non-clinical.
Never diagnose. Never compare to other children.
Return valid JSON with keys: celebration, illumination, reassurance, activity{title,description,quick_version,serve_and_return_tip}, observation_prompt, metadata{schemas_detected,cognitive_stage,psychosocial_task,developmental_domains,sensitive_period_active,interest_phase,executive_functions_engaged,curiosity_state_detected,needs_reassurance,suggest_professional_consult,confidence}.`;

export async function POST(request: Request) {
  try {
    const supabaseAuth = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const childId = body.childId as string;
    const observationText = body.observation as string;

    if (!childId || !observationText?.trim()) {
      return NextResponse.json({ error: 'Missing childId/observation' }, { status: 400 });
    }

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: child } = await db
      .from('children')
      .select('id,name,birthdate,user_id')
      .eq('id', childId)
      .single();

    if (!child || child.user_id !== user.id) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const { data: recentObs } = await db
      .from('observations')
      .select('observation_text, observed_at')
      .eq('child_id', childId)
      .order('observed_at', { ascending: false })
      .limit(5);

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const userPrompt = `Child: ${child.name}\nObservation: ${observationText}\nRecent observations: ${JSON.stringify(
      recentObs ?? []
    )}\nReturn JSON only.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 900,
      system: runtimePrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textPart = message.content.find((c) => c.type === 'text');
    const raw = textPart && 'text' in textPart ? textPart.text : '{}';

    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        celebration: 'Gracias por compartir esta observación.',
        illumination: raw,
        reassurance: null,
        activity: {
          title: 'Actividad simple',
          description: 'Sigue la curiosidad de tu hijo con materiales de casa.',
          quick_version: 'Versión 5 minutos: observa y nombra lo que hace.',
          serve_and_return_tip: 'Observa primero y responde con calma.',
        },
        observation_prompt: '¿Qué se repitió hoy?',
        metadata: { schemas_detected: [], confidence: 0.4 },
      };
    }

    const { data: obsRow, error: obsErr } = await db
      .from('observations')
      .insert({ child_id: childId, observation_text: observationText, created_by: user.id })
      .select('id')
      .single();

    if (obsErr || !obsRow) {
      return NextResponse.json({ error: `Failed to store observation: ${obsErr?.message}` }, { status: 500 });
    }

    const insightText = `${parsed.celebration ?? ''}\n\n${parsed.illumination ?? ''}\n\n${
      parsed.activity?.description ?? ''
    }`;

    const { error: insightErr } = await db.from('insights').insert({
      observation_id: obsRow.id,
      insight_text: insightText,
      json_response: parsed,
    });

    if (insightErr) {
      return NextResponse.json({ error: `Failed to store insight: ${insightErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ insightText, payload: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
