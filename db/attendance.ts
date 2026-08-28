import { env } from 'cloudflare:workers';

const DEFAULT_EVENT_ID = 'basic-training-tools-usher-2026';

async function getDatabase() {
  const database = env.DB;
  if (!database) throw new Error('Database absensi belum tersedia.');

  await database.batch([
    database.prepare(
      'CREATE TABLE IF NOT EXISTS events (' +
        'id TEXT PRIMARY KEY NOT NULL, ' +
        'title TEXT NOT NULL, ' +
        'event_date TEXT NOT NULL, ' +
        'start_time TEXT NOT NULL, ' +
        'location TEXT NOT NULL, ' +
        'status TEXT NOT NULL, ' +
        'created_by TEXT NOT NULL, ' +
        'created_at TEXT NOT NULL' +
      ')',
    ),
    database.prepare(
      'CREATE TABLE IF NOT EXISTS attendance (' +
        'id TEXT PRIMARY KEY NOT NULL, ' +
        'full_name TEXT NOT NULL, ' +
        'participant_id TEXT NOT NULL, ' +
        'event_id TEXT, ' +
        'team TEXT NOT NULL DEFAULT \'\', ' +
        'session TEXT NOT NULL DEFAULT \'\', ' +
        'consent INTEGER NOT NULL, ' +
        'check_in_date TEXT NOT NULL, ' +
        'checked_in_at TEXT NOT NULL' +
      ')',
    ),
    database.prepare(
      'CREATE INDEX IF NOT EXISTS events_status_date_idx ON events (status, event_date)',
    ),
  ]);

  const columns = await database
    .prepare('PRAGMA table_info(attendance)')
    .all<{ name: string }>();
  if (!columns.results.some((column) => column.name === 'event_id')) {
    await database.prepare('ALTER TABLE attendance ADD COLUMN event_id TEXT').run();
  }

  await database.batch([
    database.prepare(
      'DROP INDEX IF EXISTS attendance_participant_session_date_unique',
    ),
    database.prepare(
      'CREATE UNIQUE INDEX IF NOT EXISTS attendance_event_nij_unique ' +
        'ON attendance (event_id, participant_id)',
    ),
    database.prepare(
      'CREATE INDEX IF NOT EXISTS attendance_event_id_idx ON attendance (event_id)',
    ),
  ]);

  await database
    .prepare(
      'INSERT OR IGNORE INTO events ' +
        '(id, title, event_date, start_time, location, status, created_by, created_at) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      DEFAULT_EVENT_ID,
      'Basic Training & Tools Usher',
      '2026-08-29',
      '09:00',
      'Training Room',
      'active',
      'system',
      new Date().toISOString(),
    )
    .run();

  return database;
}

export type EventStatus = 'active' | 'closed';

export type EventRecord = {
  id: string;
  title: string;
  eventDate: string;
  startTime: string;
  location: string;
  status: EventStatus;
  attendanceCount: number;
  createdAt?: string;
};

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  start_time: string;
  location: string;
  status: EventStatus;
  attendance_count: number;
  created_at?: string;
};

function toEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    eventDate: row.event_date,
    startTime: row.start_time,
    location: row.location,
    status: row.status,
    attendanceCount: Number(row.attendance_count ?? 0),
    createdAt: row.created_at,
  };
}

export async function listPublicEvents() {
  const database = await getDatabase();
  const result = await database
    .prepare(
      'SELECT e.id, e.title, e.event_date, e.start_time, e.location, e.status, ' +
        'COUNT(a.id) AS attendance_count ' +
        'FROM events e LEFT JOIN attendance a ON a.event_id = e.id ' +
        'WHERE e.status = \'active\' ' +
        'GROUP BY e.id ORDER BY e.event_date ASC, e.start_time ASC',
    )
    .all<EventRow>();
  return result.results.map(toEvent);
}

export async function listAdminEvents() {
  const database = await getDatabase();
  const result = await database
    .prepare(
      'SELECT e.id, e.title, e.event_date, e.start_time, e.location, e.status, ' +
        'e.created_at, COUNT(a.id) AS attendance_count ' +
        'FROM events e LEFT JOIN attendance a ON a.event_id = e.id ' +
        'GROUP BY e.id ORDER BY e.event_date DESC, e.start_time DESC',
    )
    .all<EventRow>();
  return result.results.map(toEvent);
}

export async function createEvent(input: {
  title: string;
  eventDate: string;
  startTime: string;
  location: string;
  createdBy: string;
}) {
  const database = await getDatabase();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await database
    .prepare(
      'INSERT INTO events ' +
        '(id, title, event_date, start_time, location, status, created_by, created_at) ' +
        'VALUES (?, ?, ?, ?, ?, \'active\', ?, ?)',
    )
    .bind(
      id,
      input.title,
      input.eventDate,
      input.startTime,
      input.location,
      input.createdBy,
      createdAt,
    )
    .run();
  return { id, createdAt };
}

export async function updateEventStatus(id: string, status: EventStatus) {
  const database = await getDatabase();
  const result = await database
    .prepare('UPDATE events SET status = ? WHERE id = ?')
    .bind(status, id)
    .run();
  return result.meta.changes > 0;
}

export async function createAttendance(input: {
  eventId: string;
  fullName: string;
  nij: string;
}) {
  const database = await getDatabase();
  const event = await database
    .prepare('SELECT id, title, status FROM events WHERE id = ?')
    .bind(input.eventId)
    .first<{ id: string; title: string; status: EventStatus }>();
  if (!event) throw new Error('EVENT_NOT_FOUND');
  if (event.status !== 'active') throw new Error('EVENT_CLOSED');

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
        '(id, full_name, participant_id, event_id, team, session, consent, check_in_date, checked_in_at) ' +
        'VALUES (?, ?, ?, ?, \'\', \'\', 1, ?, ?)',
    )
    .bind(
      crypto.randomUUID(),
      input.fullName,
      input.nij,
      input.eventId,
      checkInDate,
      now.toISOString(),
    )
    .run();

  const time = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);

  return { eventTitle: event.title, time };
}

type AttendanceRow = {
  id: string;
  full_name: string;
  participant_id: string;
  checked_in_at: string;
};

export async function listPublicAttendance(eventId: string) {
  const database = await getDatabase();
  const result = await database
    .prepare(
      'SELECT id, full_name, participant_id, checked_in_at FROM attendance ' +
        'WHERE event_id = ? ORDER BY checked_in_at DESC LIMIT 300',
    )
    .bind(eventId)
    .all<AttendanceRow>();
  return result.results.map((row) => ({
    id: row.id,
    name: maskName(row.full_name),
    nij: maskNij(row.participant_id),
    checkedInAt: row.checked_in_at,
  }));
}

export async function listAdminAttendance(eventId: string) {
  const database = await getDatabase();
  const result = await database
    .prepare(
      'SELECT id, full_name, participant_id, checked_in_at FROM attendance ' +
        'WHERE event_id = ? ORDER BY checked_in_at DESC',
    )
    .bind(eventId)
    .all<AttendanceRow>();
  return result.results.map((row) => ({
    id: row.id,
    name: row.full_name,
    nij: row.participant_id,
    checkedInAt: row.checked_in_at,
  }));
}

export async function deleteAttendance(id: string) {
  const database = await getDatabase();
  const result = await database
    .prepare('DELETE FROM attendance WHERE id = ?')
    .bind(id)
    .run();
  return result.meta.changes > 0;
}

export function maskName(value: string) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words[0] ?? '';
  return words
    .map((word, index) => {
      if (index === 0) return word;
      const visible = word.length <= 3 ? 1 : 3;
      return word.slice(0, visible) + '*'.repeat(Math.max(1, word.length - visible));
    })
    .join(' ');
}

export function maskNij(value: string) {
  const clean = value.trim();
  if (clean.length <= 2) return clean;
  return clean[0] + '*'.repeat(clean.length - 2) + clean[clean.length - 1];
}
