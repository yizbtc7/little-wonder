# Little Wonder

Current app implementation lives in `next-app/` (Next.js + Supabase).

## Local run

```bash
cd next-app
npm install
npm run dev
```

## Required env vars (in `next-app/.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

## Supabase notes

- SQL schema files are in `/schema`
- Enable Google provider in Supabase Auth (email/password remains fallback)

## Deploy (Vercel)

- Set **Root Directory** to `next-app`
- Redeploy from latest `main`


<!-- deploy-trigger: 2026-02-12T22:51-05:00 -->
