import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

type SharedArticle = {
  id: string;
  title: string;
  emoji: string;
  type: 'article' | 'research' | 'guide';
  body: string;
  language: 'es' | 'en';
  read_time_minutes: number | null;
};

function dbClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function htmlEscape(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function sanitizeChildData(text: string, language: 'es' | 'en') {
  const fallback = language === 'es' ? 'tu hijo' : 'your child';
  return text
    .replaceAll('{childName}', fallback)
    .replaceAll('{child_name}', fallback)
    .replaceAll('{{child_name}}', fallback)
    .replaceAll('{childAge}', '')
    .replaceAll('{child_age}', '')
    .replaceAll('{{child_age}}', '')
    .replaceAll('  ', ' ')
    .trim();
}

export default async function SharedArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = dbClient();

  const { data } = await db
    .from('explore_articles')
    .select('id,title,emoji,type,body,language,read_time_minutes')
    .eq('id', id)
    .maybeSingle<SharedArticle>();

  if (!data) notFound();

  const title = sanitizeChildData(data.title, data.language);
  const body = sanitizeChildData(data.body, data.language);

  return (
    <main style={{ minHeight: '100vh', background: '#FFFBF7', color: '#2D2B32', fontFamily: 'Inter, system-ui, sans-serif', padding: '20px 16px 40px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', background: '#fff', border: '1px solid #F0EDE8', borderRadius: 18, padding: 24 }}>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#8A8690', textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {data.emoji} {data.type} · ⏱ {data.read_time_minutes ?? 6} min
        </p>
        <h1 style={{ margin: '10px 0 16px', fontSize: 32, lineHeight: 1.2 }}>{title}</h1>
        <article
          style={{ fontSize: 16, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: htmlEscape(body).replaceAll('\n', '<br/>') }}
        />

        <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid #F0EDE8' }}>
          <p style={{ margin: '0 0 10px', fontWeight: 700 }}>{data.language === 'es' ? '¿Te gustó este artículo?' : 'Liked this article?'}</p>
          <p style={{ margin: '0 0 16px', color: '#6E6B73' }}>
            {data.language === 'es'
              ? 'Descarga Little Wonder para guardar artículos, registrar momentos y recibir recomendaciones personalizadas.'
              : 'Download Little Wonder to save articles, capture moments, and get personalized recommendations.'}
          </p>
          <Link href='https://next-app-sooty-phi.vercel.app' style={{ display: 'inline-block', padding: '10px 14px', borderRadius: 12, background: '#E8A090', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
            {data.language === 'es' ? 'Abrir la app' : 'Open the app'}
          </Link>
        </div>
      </div>
    </main>
  );
}
