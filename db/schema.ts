import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const attendance = sqliteTable(
  'attendance',
  {
    id: text('id').primaryKey(),
    fullName: text('full_name').notNull(),
    participantId: text('participant_id').notNull(),
    team: text('team').notNull(),
    session: text('session').notNull(),
    consent: integer('consent', { mode: 'boolean' }).notNull(),
    checkInDate: text('check_in_date').notNull(),
    checkedInAt: text('checked_in_at').notNull(),
  },
  (table) => [
    uniqueIndex('attendance_participant_session_date_unique').on(
      table.participantId,
      table.session,
      table.checkInDate,
    ),
  ],
);
