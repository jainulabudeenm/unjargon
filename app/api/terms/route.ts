import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin-auth';

const TermInput = z.object({
  name: z.string().trim().min(1).max(80),
  analogy: z.string().trim().min(1).max(400),
  description: z.string().trim().min(1).max(2000),
  category_id: z.string().trim().max(60).regex(/^[a-z0-9-]+$/),
});

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = TermInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return Response.json({ error: 'Server is not configured for writes' }, { status: 500 });
  }

  // The service role bypasses RLS, which is what lets the terms table deny anon
  // writes outright while the public read path keeps using the anon key.
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.from('terms').insert([parsed.data]).select();

  if (error) {
    console.error('Term insert failed:', error.message);
    return Response.json({ error: 'Insert failed' }, { status: 500 });
  }

  return Response.json({ term: data?.[0] ?? null }, { status: 201 });
}
