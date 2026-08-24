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

export async function DELETE(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const id = new URL(req.url).searchParams.get('id');
  // Ids are uuids. Validating the shape keeps a malformed value from reaching
  // PostgREST as a filter it might interpret more broadly than intended.
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return Response.json({ error: 'Invalid id' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return Response.json({ error: 'Server is not configured for writes' }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.from('terms').delete().eq('id', id).select();

  if (error) {
    console.error('Term delete failed:', error.message);
    return Response.json({ error: 'Delete failed' }, { status: 500 });
  }
  // select() returns the removed rows, so an empty array means nothing matched.
  if (!data?.length) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json({ deleted: data[0].id });
}
