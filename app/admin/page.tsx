import { chatGPTSignOutPath } from '@/app/chatgpt-auth';
import { requireAdminPageUser } from '@/app/admin-access';
import AdminDashboard from './admin-dashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { user, authorized } = await requireAdminPageUser();

  if (!authorized) {
    return (
      <main className="access-page">
        <div className="access-card">
          <p className="access-brand">Usher Development</p>
          <p className="eyebrow">AKSES DITOLAK</p>
          <h1>Akun ini bukan admin.</h1>
          <p>
            Anda sudah masuk sebagai {user.email}, tetapi akun tersebut tidak
            terdaftar sebagai pengelola Usher Development.
          </p>
          <a href={chatGPTSignOutPath('/admin')}>Keluar dan ganti akun</a>
        </div>
      </main>
    );
  }

  return (
    <AdminDashboard
      adminName={user.fullName ?? user.email}
      signOutPath={chatGPTSignOutPath('/')}
    />
  );
}
