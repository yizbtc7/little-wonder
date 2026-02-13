'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';

type OnboardingFormProps = {
  userId: string;
  userEmail: string;
};

const parentRoles = ['Mom', 'Dad', 'Caregiver', 'Other'];
const priorities = [
  'Understanding my child better',
  'Activity ideas',
  'Confidence in parenting',
  'Tracking development',
  'Being more present',
  'Less screen time',
];
const childInterests = [
  'Music & sounds',
  'Stacking & building',
  'Water play',
  'Animals & bugs',
  'Books',
  'Movement & climbing',
  'Drawing & messy play',
  'How things work',
];

function toggleSelection(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function StepDots({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          style={{
            width: step === current ? 30 : 10,
            height: 10,
            borderRadius: 999,
            background: step === current ? '#6C56F9' : '#E6E3F7',
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
}

export default function OnboardingForm({ userId }: OnboardingFormProps) {
  const [step, setStep] = useState(0);
  const [parentName, setParentName] = useState('');
  const [parentRole, setParentRole] = useState<string>('');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [childName, setChildName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const canContinue = useMemo(() => {
    if (step === 1) {
      return parentName.trim().length > 0 && parentRole.length > 0;
    }

    if (step === 2) {
      return childName.trim().length > 0 && birthdate.length > 0;
    }

    return true;
  }, [birthdate, childName, parentName, parentRole, step]);

  const submit = async () => {
    setIsSaving(true);
    setStatus('Setting things up...');

    const profileResult = await supabase.from('profiles').upsert({
      user_id: userId,
      parent_name: parentName.trim(),
      parent_role: parentRole,
      parent_priorities: selectedPriorities,
    });

    if (profileResult.error) {
      setStatus(`Could not save your profile: ${profileResult.error.message}`);
      setIsSaving(false);
      return;
    }

    const childResult = await supabase.from('children').insert({
      user_id: userId,
      name: childName.trim(),
      birthdate,
      interests: selectedInterests,
    });

    if (childResult.error) {
      setStatus(`Could not save your child profile: ${childResult.error.message}`);
      setIsSaving(false);
      return;
    }

    router.push('/home');
    router.refresh();
  };

  return (
    <main style={{ background: '#FCFCFF', minHeight: '100vh', color: '#242235', padding: '24px 20px' }}>
      {step === 0 ? (
        <section style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 56, marginBottom: 22 }}>✨</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 64, lineHeight: 1.05, marginBottom: 12 }}>Little Wonder</h1>
          <p style={{ fontSize: 30, color: '#68657A', lineHeight: 1.3, marginBottom: 36 }}>
            See the extraordinary things your child is already doing.
          </p>
          <button
            onClick={() => setStep(1)}
            style={{
              width: '100%',
              maxWidth: 360,
              border: 'none',
              borderRadius: 22,
              padding: '18px 20px',
              background: '#5F4AE6',
              color: '#fff',
              fontSize: 34,
              fontWeight: 700,
              boxShadow: '0 8px 22px rgba(95,74,230,0.24)',
              cursor: 'pointer',
            }}
          >
            Get Started
          </button>
          <p style={{ marginTop: 22, color: '#9C9AAD', fontSize: 18 }}>Takes less than 2 minutes to set up</p>
        </section>
      ) : null}

      {step === 1 ? (
        <section style={{ maxWidth: 560, margin: '0 auto', paddingTop: 18 }}>
          <StepDots current={1} />
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 56, marginBottom: 14 }}>About you</h2>
          <p style={{ color: '#68657A', fontSize: 20, lineHeight: 1.4, marginBottom: 26 }}>
            Just the basics so we can personalize your experience.
          </p>

          <label style={{ fontWeight: 700, fontSize: 30 }}>Your name</label>
          <input
            value={parentName}
            onChange={(event) => setParentName(event.target.value)}
            placeholder="First name"
            style={{
              width: '100%',
              marginTop: 10,
              marginBottom: 20,
              borderRadius: 18,
              border: '1px solid #E8E8F2',
              padding: '18px 16px',
              fontSize: 28,
              background: '#F5F4FA',
            }}
          />

          <p style={{ fontWeight: 700, fontSize: 30, marginBottom: 12 }}>I am a...</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {parentRoles.map((role) => {
              const selected = parentRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setParentRole(role)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 999,
                    border: selected ? '2px solid #6C56F9' : '1px solid #E1DFEC',
                    background: selected ? '#EEEAFE' : '#FFF',
                    color: '#262436',
                    fontSize: 28,
                    cursor: 'pointer',
                  }}
                >
                  {role}
                </button>
              );
            })}
          </div>

          <p style={{ fontWeight: 700, fontSize: 30 }}>What matters most to you?</p>
          <p style={{ color: '#8F8CA0', fontSize: 22, marginTop: 6, marginBottom: 10 }}>Pick as many as you like</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
            {priorities.map((item) => {
              const selected = selectedPriorities.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedPriorities((prev) => toggleSelection(prev, item))}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 999,
                    border: selected ? '2px solid #6C56F9' : '1px solid #E1DFEC',
                    background: selected ? '#EEEAFE' : '#FFF',
                    fontSize: 26,
                    color: '#2B293A',
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <button
            disabled={!canContinue}
            onClick={() => setStep(2)}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: 18,
              padding: '18px 20px',
              background: canContinue ? '#AFA2F9' : '#D8D3F6',
              color: '#fff',
              fontSize: 34,
              fontWeight: 700,
              cursor: canContinue ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section style={{ maxWidth: 560, margin: '0 auto', paddingTop: 18 }}>
          <StepDots current={2} />
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 54, lineHeight: 1.08, marginBottom: 14 }}>
            Tell us about your little one
          </h2>
          <p style={{ color: '#68657A', fontSize: 20, lineHeight: 1.35, marginBottom: 24 }}>
            This helps us show you exactly what&apos;s amazing about what they&apos;re doing right now.
          </p>

          <label style={{ fontWeight: 700, fontSize: 30 }}>Child&apos;s name</label>
          <input
            value={childName}
            onChange={(event) => setChildName(event.target.value)}
            placeholder="First name or nickname"
            style={{
              width: '100%',
              marginTop: 10,
              marginBottom: 20,
              borderRadius: 18,
              border: '1px solid #E8E8F2',
              padding: '18px 16px',
              fontSize: 28,
              background: '#F5F4FA',
            }}
          />

          <label style={{ fontWeight: 700, fontSize: 30 }}>Date of birth</label>
          <input
            type="date"
            value={birthdate}
            onChange={(event) => setBirthdate(event.target.value)}
            style={{
              width: '100%',
              marginTop: 10,
              marginBottom: 20,
              borderRadius: 18,
              border: '1px solid #E8E8F2',
              padding: '18px 16px',
              fontSize: 28,
              background: '#F5F4FA',
            }}
          />

          <p style={{ fontWeight: 700, fontSize: 30 }}>What are they into right now?</p>
          <p style={{ color: '#8F8CA0', fontSize: 22, marginTop: 6, marginBottom: 10 }}>
            Optional — helps us personalize from day one
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
            {childInterests.map((item) => {
              const selected = selectedInterests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedInterests((prev) => toggleSelection(prev, item))}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 999,
                    border: selected ? '2px solid #6C56F9' : '1px solid #E1DFEC',
                    background: selected ? '#EEEAFE' : '#FFF',
                    fontSize: 26,
                    color: '#2B293A',
                    cursor: 'pointer',
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <button
            disabled={!canContinue}
            onClick={() => setStep(3)}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: 18,
              padding: '18px 20px',
              background: canContinue ? '#AFA2F9' : '#D8D3F6',
              color: '#fff',
              fontSize: 34,
              fontWeight: 700,
              cursor: canContinue ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section style={{ maxWidth: 560, margin: '0 auto', paddingTop: 18 }}>
          <StepDots current={3} />
          <div style={{ textAlign: 'center', fontSize: 52, marginBottom: 8 }}>🔭</div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 54, lineHeight: 1.06, textAlign: 'center', marginBottom: 24 }}>
            Here&apos;s how
            <br />
            Little Wonder works
          </h2>

          <div style={{ display: 'grid', gap: 16, marginBottom: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12 }}>
              <div style={{ background: '#F0ECFF', borderRadius: 14, display: 'grid', placeItems: 'center', fontSize: 24 }}>👁️</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 30 }}>You notice</p>
                <p style={{ color: '#5E5C70', fontSize: 24, lineHeight: 1.35 }}>
                  Tell us what your child is doing — even small, everyday moments.
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12 }}>
              <div style={{ background: '#F0ECFF', borderRadius: 14, display: 'grid', placeItems: 'center', fontSize: 24 }}>💡</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 30 }}>We illuminate</p>
                <p style={{ color: '#5E5C70', fontSize: 24, lineHeight: 1.35 }}>
                  We show you the science and wonder behind what you observed.
                </p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12 }}>
              <div style={{ background: '#F0ECFF', borderRadius: 14, display: 'grid', placeItems: 'center', fontSize: 24 }}>🌱</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 30 }}>Together, you grow</p>
                <p style={{ color: '#5E5C70', fontSize: 24, lineHeight: 1.35 }}>
                  Get personalized ideas to nurture what your child is naturally curious about right now.
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#E9F6EE',
              color: '#3C7A5D',
              borderRadius: 18,
              padding: '14px 16px',
              textAlign: 'center',
              fontSize: 24,
              lineHeight: 1.4,
              marginBottom: 18,
            }}
          >
            But first — we have some wonderful things to show you about what your little one is likely doing right now.
          </div>

          <button
            disabled={isSaving}
            onClick={submit}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: 18,
              padding: '18px 20px',
              background: '#5F4AE6',
              color: '#fff',
              fontSize: 34,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isSaving ? 'Preparing...' : 'Show me ✨'}
          </button>
          {status ? <p style={{ marginTop: 14, color: '#5E5C70', fontSize: 20 }}>{status}</p> : null}
        </section>
      ) : null}
    </main>
  );
}
