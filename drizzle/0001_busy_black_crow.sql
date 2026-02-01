-- Migration 0001: Add client table
CREATE TABLE `client` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

CREATE UNIQUE INDEX `client_phone_unique` ON `client` (`phone`);