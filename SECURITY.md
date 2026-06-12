# Security notes

## Supabase keys

- Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used in this app.
- **Never** expose the Supabase service-role key in client code, environment variables prefixed with `NEXT_PUBLIC_`, or git.
- Server code uses the anon key via `createServerSupabaseClient()` in `src/lib/supabase/server.ts`.

## Row-level security (RLS)

RLS is **disabled** on all tables for the local MVP because the app uses the anon key without Supabase Auth.

Implications:

- Anyone with the anon key and project URL can read/write study data if they know table names.
- Local profiles (`gsi_user_id` cookie) separate users in application logic only, not at the database layer.
- Do not treat profile separation as strong security until real authentication and RLS policies are added.

## Admin gate

Set `ADMIN_ACCESS_TOKEN` in Vercel/server env (never `NEXT_PUBLIC_`).

When configured:

- `/import`, `/discover`, `/saved`, and `/admin/*` require the token via `/admin/access`.
- Import/discovery server actions also verify the admin cookie.

When **not** configured, admin routes remain open (development convenience).

## Data integrity

- Test submit uses server-side answer validation and conditional session completion.
- Attempt rows use `unique(session_id, question_id)` and upsert-on-conflict for idempotent submit.
- Excluded questions (`is_active = false`) are omitted from new test selection via RPC and query filters.

## Logging

Structured server logs omit answer text, notes, and tokens. See `src/lib/server/logger.ts`.

## Production checklist

1. Set `ADMIN_ACCESS_TOKEN` in production.
2. Run SQL migrations through `supabase/add-quality-export.sql`.
3. Review Supabase dashboard for exposed tables and consider enabling RLS before public launch with real users.
4. Rotate anon key if it was ever committed or shared.
