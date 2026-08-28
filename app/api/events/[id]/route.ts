import { getAdminUser } from '@/app/admin-access';
import { updateEventStatus, type EventStatus } from '@/db/attendance';

export const runtime = 'edge';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ message: 'Akses admin diperlukan.' }, { status: 403 });

  const { id } = await context.params;
  const body = (await request.json()) as { status?: EventStatus };
  if (body.status !== 'active' && body.status !== 'closed') {
    return Response.json({ message: 'Status event tidak valid.' }, { status: 400 });
  }

  const updated = await updateEventStatus(id, body.status);
  return updated
    ? Response.json({ message: 'Status event diperbarui.' })
    : Response.json({ message: 'Event tidak ditemukan.' }, { status: 404 });
}
