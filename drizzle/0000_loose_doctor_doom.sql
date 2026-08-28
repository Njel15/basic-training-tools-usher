CREATE TABLE `attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`participant_id` text NOT NULL,
	`team` text NOT NULL,
	`session` text NOT NULL,
	`consent` integer NOT NULL,
	`check_in_date` text NOT NULL,
	`checked_in_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attendance_participant_session_date_unique` ON `attendance` (`participant_id`,`session`,`check_in_date`);