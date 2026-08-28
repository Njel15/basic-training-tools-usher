import { listPublicAttendance } from '@/db/attendance';

export const runtime = 'edge';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    return Response.json({ attendance: await listPublicAttendance(id) });
  } catch {
    return Response.json({ attendance: [] }, { status: 503 });
  }
}
