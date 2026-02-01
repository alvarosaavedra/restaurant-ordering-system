-- Migration 0002: Add deleted_at to orders table
ALTER TABLE `order` ADD COLUMN `deleted_at` integer;