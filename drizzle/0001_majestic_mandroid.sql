CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`event_date` text NOT NULL,
	`start_time` text NOT NULL,
	`location` text NOT NULL,
	`status` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_status_date_idx` ON `events` (`status`,`event_date`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`participant_id` text NOT NULL,
	`event_id` text,
	`consent` integer NOT NULL,
	`check_in_date` text NOT NULL,
	`checked_in_at` text NOT NULL,
	`team` text DEFAULT '' NOT NULL,
	`session` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_attendance`("id", "full_name", "participant_id", "event_id", "consent", "check_in_date", "checked_in_at", "team", "session") SELECT "id", "full_name", "participant_id", NULL, "consent", "check_in_date", "checked_in_at", "team", "session" FROM `attendance`;--> statement-breakpoint
DROP TABLE `attendance`;--> statement-breakpoint
ALTER TABLE `__new_attendance` RENAME TO `attendance`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_event_nij_unique` ON `attendance` (`event_id`,`participant_id`);--> statement-breakpoint
CREATE INDEX `attendance_event_id_idx` ON `attendance` (`event_id`);
