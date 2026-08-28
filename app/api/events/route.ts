import { createEvent, listPublicEvents } from '@/db/attendance';
import { getAdminUser } from '@/app/admin-access';

export const runtime = 'edge';

export async function GET() {
  try {
    return Response.json({ events: await listPublicEvents() });
  } catch {
    return Response.json({ events: [] }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ message: 'Akses admin diperlukan.' }, { status: 403 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
    const eventDate = typeof body.eventDate === 'string' ? body.eventDate : '';
    const startTime = typeof body.startTime === 'string' ? body.startTime : '';
    const location = typeof body.location === 'string'
      ? body.location.trim().slice(0, 100)
      : '';

    if (title.length < 3 || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || !/^\d{2}:\d{2}$/.test(startTime)) {
      return Response.json({ message: 'Judul, tanggal, dan jam event wajib diisi.' }, { status: 400 });
    }

    const event = await createEvent({
      title,
      eventDate,
      startTime,
      location: location || 'Lokasi menyusul',
      createdBy: admin.email,
    });
    return Response.json({ message: 'Event berhasil dibuat.', event });
  } catch {
    return Response.json({ message: 'Event belum berhasil dibuat.' }, { status: 500 });
  }
}
