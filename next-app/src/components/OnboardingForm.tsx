'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabaseClient';
import { theme } from '@/styles/theme';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/ui/FadeIn';
import ProgressDots from '@/components/ui/ProgressDots';

type OnboardingFormProps = {
  userId: string;
};

const parentRoles = ['Mom', 'Dad', 'Caregiver', 'Other'];
const parentGoals = [
  'Understanding my child better',
  'Activity ideas',
  'Confidence in parenting',
  'Tracking development',
  'Being more present',
  'Less screen time',
];
const childInterests = [
  '🎵 Music & sounds',
  '📦 Stacking & building',
  '🌊 Water play',
  '🐛 Animals & bugs',
  '📚 Books',
  '🏃 Movement & climbing',
  '🎨 Drawing & messy play',
  '🔧 How things work',
];

function toggleSelection(values: string[], value: string) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function SelectChip({
  text,
  selected,
  onClick,
}: {
  text: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '9px 16px',
        borderRadius: theme.radius.chip,
        border: `1.5px solid ${selected ? theme.colors.brand : theme.colors.grayBg}`,
        background: selected ? theme.colors.brandLight : theme.colors.white,
        color: selected ? theme.colors.brand : theme.colors.dark,
        fontFamily: theme.fonts.body,
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {selected ? '✓ ' : ''}
      {text}
    </button>
  );
}

export default function OnboardingForm({ userId }: OnboardingFormProps) {
  const [step, setStep] = useState(0);
  const [parentName, setParentName] = useState('');
  const [parentRole, setParentRole] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [childName, setChildName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const submit = async () => {
    setIsSaving(true);
    setStatus('Setting things up...');

    const profileResult = await supabase.from('profiles').upsert({
      user_id: userId,
      parent_name: parentName.trim(),
      parent_role: parentRole,
      parent_priorities: selectedGoals,
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
    <main style={{ minHeight: '100vh', background: theme.colors.white }}>
      {step === 0 ? (
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px 28px',
            textAlign: 'center',
            background: `linear-gradient(180deg, ${theme.colors.cream} 0%, ${theme.colors.white} 100%)`,
          }}
        >
          <FadeIn delay={100}>
            <div style={{ fontSize: 64, marginBottom: 8 }}>✨</div>
          </FadeIn>
          <FadeIn delay={250}>
            <h1 style={{ fontSize: 58, color: theme.colors.dark, marginBottom: 10 }}>Little Wonder</h1>
          </FadeIn>
          <FadeIn delay={400}>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 20, color: theme.colors.gray, lineHeight: 1.5, marginBottom: 32 }}>
              See the extraordinary things your child is already doing.
            </p>
          </FadeIn>
          <FadeIn delay={550}>
            <Button onClick={() => setStep(1)} size="lg" style={{ width: 320 }}>
              Get Started
            </Button>
          </FadeIn>
          <FadeIn delay={700}>
            <p style={{ marginTop: 14, fontSize: 13, color: theme.colors.grayLight }}>Takes less than 2 minutes to set up</p>
          </FadeIn>
        </section>
      ) : null}

      {step === 1 ? (
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 28px', background: theme.colors.white }}>
          <ProgressDots total={3} current={0} />
          <FadeIn delay={100}>
            <h2 style={{ fontSize: 42, color: theme.colors.dark, margin: '32px 0 8px' }}>About you</h2>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 15, color: theme.colors.gray, marginBottom: 26 }}>
              Just the basics so we can personalize your experience.
            </p>
          </FadeIn>

          <FadeIn delay={200}>
            <label style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 700, color: theme.colors.dark, display: 'block', marginBottom: 8 }}>
              Your name
            </label>
            <input
              value={parentName}
              onChange={(event) => setParentName(event.target.value)}
              placeholder="First name"
              style={{
                width: '100%',
                borderRadius: 12,
                border: `1.5px solid ${theme.colors.grayBg}`,
                padding: '14px 16px',
                background: theme.colors.grayBg,
                marginBottom: 20,
                fontFamily: theme.fonts.body,
                fontSize: 16,
              }}
            />
          </FadeIn>

          <FadeIn delay={300}>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 700, color: theme.colors.dark, marginBottom: 8 }}>I am a...</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
              {parentRoles.map((role) => (
                <SelectChip key={role} text={role} selected={parentRole === role} onClick={() => setParentRole(role)} />
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={400}>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 700, color: theme.colors.dark }}>What matters most to you?</p>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.grayLight, marginTop: 4, marginBottom: 8 }}>Pick as many as you like</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {parentGoals.map((goal) => (
                <SelectChip
                  key={goal}
                  text={goal}
                  selected={selectedGoals.includes(goal)}
                  onClick={() => setSelectedGoals((prev) => toggleSelection(prev, goal))}
                />
              ))}
            </div>
          </FadeIn>

          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
            <Button onClick={() => setStep(2)} size="lg" style={{ width: '100%' }} disabled={!parentName.trim() || !parentRole}>
              Continue
            </Button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 28px', background: theme.colors.white }}>
          <ProgressDots total={3} current={1} />
          <FadeIn delay={100}>
            <h2 style={{ fontSize: 40, color: theme.colors.dark, margin: '32px 0 8px' }}>Tell us about your little one</h2>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 15, color: theme.colors.gray, marginBottom: 26, lineHeight: 1.5 }}>
              This helps us show you exactly what&apos;s amazing about what they&apos;re doing right now.
            </p>
          </FadeIn>

          <FadeIn delay={200}>
            <label style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 700, color: theme.colors.dark, display: 'block', marginBottom: 8 }}>
              Child&apos;s name
            </label>
            <input
              value={childName}
              onChange={(event) => setChildName(event.target.value)}
              placeholder="First name or nickname"
              style={{ width: '100%', borderRadius: 12, border: `1.5px solid ${theme.colors.grayBg}`, padding: '14px 16px', background: theme.colors.grayBg, marginBottom: 20, fontFamily: theme.fonts.body, fontSize: 16 }}
            />

            <label style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 700, color: theme.colors.dark, display: 'block', marginBottom: 8 }}>
              Date of birth
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(event) => setBirthdate(event.target.value)}
              style={{ width: '100%', borderRadius: 12, border: `1.5px solid ${theme.colors.grayBg}`, padding: '14px 16px', background: theme.colors.grayBg, marginBottom: 20, fontFamily: theme.fonts.body, fontSize: 16 }}
            />
          </FadeIn>

          <FadeIn delay={300}>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 14, fontWeight: 700, color: theme.colors.dark }}>What are they into right now?</p>
            <p style={{ fontFamily: theme.fonts.body, fontSize: 13, color: theme.colors.grayLight, marginTop: 4, marginBottom: 8 }}>
              Optional — helps us personalize from day one
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {childInterests.map((interest) => (
                <SelectChip
                  key={interest}
                  text={interest}
                  selected={selectedInterests.includes(interest)}
                  onClick={() => setSelectedInterests((prev) => toggleSelection(prev, interest))}
                />
              ))}
            </div>
          </FadeIn>

          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
            <Button onClick={() => setStep(3)} size="lg" style={{ width: '100%' }} disabled={!childName.trim() || !birthdate}>
              Continue
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 28px', background: `linear-gradient(180deg, ${theme.colors.cream} 0%, ${theme.colors.white} 100%)` }}>
          <ProgressDots total={3} current={2} />
          <FadeIn delay={100}>
            <div style={{ textAlign: 'center', margin: '40px 0 28px' }}>
              <span style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>🔭</span>
              <h2 style={{ fontSize: 38, color: theme.colors.dark, lineHeight: 1.25 }}>Here&apos;s how Little Wonder works</h2>
            </div>
          </FadeIn>

          <FadeIn delay={250}>
            <div style={{ display: 'grid', gap: 18, marginBottom: 22 }}>
              {[
                { icon: '👁️', title: 'You notice', desc: `Tell us what ${childName || 'your child'} is doing — even small, everyday moments. A quick sentence is all it takes.` },
                { icon: '💡', title: 'We illuminate', desc: 'We’ll show you the science and wonder behind what you observed. What looks like “just playing” is often extraordinary learning.' },
                { icon: '🌱', title: 'Together, you grow', desc: 'Get personalized ideas to nurture exactly what your child is naturally curious about right now.' },
              ].map((item) => (
                <div key={item.title} style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.colors.brandLight, display: 'grid', placeItems: 'center', fontSize: 22 }}>{item.icon}</div>
                  <div>
                    <p style={{ fontFamily: theme.fonts.body, fontSize: 16, fontWeight: 700, color: theme.colors.dark }}>{item.title}</p>
                    <p style={{ fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.gray, marginTop: 4, lineHeight: 1.45 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={350}>
            <div style={{ background: theme.colors.sageLight, borderRadius: 14, padding: '16px 18px', marginBottom: 24 }}>
              <p style={{ fontFamily: theme.fonts.body, fontSize: 14, color: theme.colors.sage, lineHeight: 1.5, textAlign: 'center' }}>
                But first — we have some wonderful things to show you about what {childName || 'your child'} is likely doing right now.
              </p>
            </div>
          </FadeIn>

          <div style={{ marginTop: 'auto' }}>
            <Button onClick={submit} size="lg" style={{ width: '100%' }} disabled={isSaving}>
              {isSaving ? 'Preparing...' : 'Show me ✨'}
            </Button>
            {status ? <p style={{ marginTop: 12, fontSize: 14, color: theme.colors.gray }}>{status}</p> : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}
