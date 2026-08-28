import { getAdminUser } from '@/app/admin-access';
import { listAdminEvents } from '@/db/attendance';

export const runtime = 'edge';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ message: 'Akses admin diperlukan.' }, { status: 403 });
  return Response.json({ events: await listAdminEvents() });
}
