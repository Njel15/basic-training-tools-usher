import { getChatGPTUser, requireChatGPTUser } from './chatgpt-auth';

function adminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminEmail(email: string) {
  return adminEmails().has(email.trim().toLowerCase());
}

export async function getAdminUser() {
  const user = await getChatGPTUser();
  return user && isAdminEmail(user.email) ? user : null;
}

export async function requireAdminPageUser() {
  const user = await requireChatGPTUser('/admin');
  return { user, authorized: isAdminEmail(user.email) };
}
