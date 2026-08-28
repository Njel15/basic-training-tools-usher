import { integer, sqliteTable, text, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

export const events = sqliteTable(
  'events',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    eventDate: text('event_date').notNull(),
    startTime: text('start_time').notNull(),
    location: text('location').notNull(),
    status: text('status').notNull(),
    createdBy: text('created_by').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('events_status_date_idx').on(table.status, table.eventDate),
  ],
);

export const attendance = sqliteTable(
  'attendance',
  {
    id: text('id').primaryKey(),
    fullName: text('full_name').notNull(),
    nij: text('participant_id').notNull(),
    eventId: text('event_id'),
    consent: integer('consent', { mode: 'boolean' }).notNull(),
    checkInDate: text('check_in_date').notNull(),
    checkedInAt: text('checked_in_at').notNull(),
    legacyTeam: text('team').notNull().default(''),
    legacySession: text('session').notNull().default(''),
  },
  (table) => [
    uniqueIndex('attendance_event_nij_unique').on(table.eventId, table.nij),
    index('attendance_event_id_idx').on(table.eventId),
  ],
);
