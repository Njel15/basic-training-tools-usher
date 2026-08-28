import { getAdminUser } from '@/app/admin-access';
import { listAdminAttendance } from '@/db/attendance';

export const runtime = 'edge';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ message: 'Akses admin diperlukan.' }, { status: 403 });
  const { id } = await context.params;
  return Response.json({ attendance: await listAdminAttendance(id) });
}
