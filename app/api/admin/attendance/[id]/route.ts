import { getAdminUser } from '@/app/admin-access';
import { deleteAttendance } from '@/db/attendance';

export const runtime = 'edge';

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ message: 'Akses admin diperlukan.' }, { status: 403 });
  const { id } = await context.params;
  const deleted = await deleteAttendance(id);
  return deleted
    ? Response.json({ message: 'Data absensi dihapus.' })
    : Response.json({ message: 'Data tidak ditemukan.' }, { status: 404 });
}
