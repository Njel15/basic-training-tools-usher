import { createAttendance } from '@/db/attendance';

export const runtime = 'edge';

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fullName = clean(body.fullName, 100);
    const nij = clean(body.nij, 30);
    const eventId = clean(body.eventId, 80);

    if (fullName.length < 3 || nij.length < 2 || !/^\d+$/.test(nij) || !eventId) {
      return Response.json(
        { message: 'Lengkapi nama dan NIJ dengan benar.' },
        { status: 400 },
      );
    }

    const checkIn = await createAttendance({ fullName, nij, eventId });
    return Response.json({
      message: 'Kehadiran berhasil dicatat.',
      name: fullName,
      ...checkIn,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('UNIQUE constraint failed')) {
      return Response.json(
        { message: 'NIJ ini sudah melakukan check-in untuk event tersebut.' },
        { status: 409 },
      );
    }
    if (message === 'EVENT_CLOSED') {
      return Response.json(
        { message: 'Absensi event ini sudah ditutup oleh admin.' },
        { status: 409 },
      );
    }
    if (message === 'EVENT_NOT_FOUND') {
      return Response.json({ message: 'Event tidak ditemukan.' }, { status: 404 });
    }
    return Response.json(
      { message: 'Absensi belum berhasil disimpan. Silakan coba lagi.' },
      { status: 500 },
    );
  }
}
