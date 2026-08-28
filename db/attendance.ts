import { env } from 'cloudflare:workers';

const createTableSql =
  'CREATE TABLE IF NOT EXISTS attendance (' +
  'id TEXT PRIMARY KEY NOT NULL, ' +
  'full_name TEXT NOT NULL, ' +
  'participant_id TEXT NOT NULL, ' +
  'team TEXT NOT NULL, ' +
  'session TEXT NOT NULL, ' +
  'consent INTEGER NOT NULL, ' +
  'check_in_date TEXT NOT NULL, ' +
  'checked_in_at TEXT NOT NULL' +
  ')';

const createUniqueIndexSql =
  'CREATE UNIQUE INDEX IF NOT EXISTS attendance_participant_session_date_unique ' +
  'ON attendance (participant_id, session, check_in_date)';

async function getDatabase() {
  const database = env.DB;
  if (!database) throw new Error('Database absensi belum tersedia.');

  await database.batch([
    database.prepare(createTableSql),
    database.prepare(createUniqueIndexSql),
  ]);
  return database;
}

export type AttendanceInput = {
  fullName: string;
  participantId: string;
  team: string;
  session: string;
  consent: boolean;
};

export async function createAttendance(input: AttendanceInput) {
  const database = await getDatabase();
  const now = new Date();
  const checkInDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  await database
    .prepare(
      'INSERT INTO attendance ' +
      '(id, full_name, participant_id, team, session, consent, check_in_date, checked_in_at) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      crypto.randomUUID(),
      input.fullName,
      input.participantId,
      input.team,
      input.session,
      input.consent ? 1 : 0,
      checkInDate,
      now.toISOString(),
    )
    .run();

  const time = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);

  return { checkInDate, time };
}

export async function getTodayAttendanceCount() {
  const database = await getDatabase();
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const result = await database
    .prepare('SELECT COUNT(*) AS total FROM attendance WHERE check_in_date = ?')
    .bind(today)
    .first<{ total: number }>();
  return Number(result?.total ?? 0);
}
