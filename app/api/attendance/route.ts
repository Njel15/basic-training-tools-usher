import { createAttendance, getTodayAttendanceCount } from '@/db/attendance';

export const runtime = 'edge';

const teams = new Set([
  'Lobby & Welcome',
  'Auditorium',
  'Information Desk',
  'Safety & Support',
]);
const sessions = new Set(['Basic Training', 'Tools Usher']);

function clean(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function GET() {
  try {
    const total = await getTodayAttendanceCount();
    return Response.json({ total });
  } catch {
    return Response.json({ total: 0 }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fullName = clean(body.fullName, 100);
    const participantId = clean(body.participantId, 40).toUpperCase();
    const team = clean(body.team, 60);
    const session = clean(body.session, 40);
    const consent = body.consent === true;

    if (
      fullName.length < 3 ||
      participantId.length < 2 ||
      !teams.has(team) ||
      !sessions.has(session) ||
      !consent
    ) {
      return Response.json(
        { message: 'Lengkapi semua data dan pastikan isinya sudah benar.' },
        { status: 400 },
      );
    }

    const checkIn = await createAttendance({
      fullName,
      participantId,
      team,
      session,
      consent,
    });
    return Response.json({
      message: 'Kehadiran berhasil dicatat.',
      name: fullName,
      session,
      ...checkIn,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('UNIQUE constraint failed')) {
      return Response.json(
        { message: 'ID ini sudah melakukan check-in untuk sesi yang sama hari ini.' },
        { status: 409 },
      );
    }
    return Response.json(
      { message: 'Absensi belum berhasil disimpan. Silakan coba lagi.' },
      { status: 500 },
    );
  }
}
