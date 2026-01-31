CREATE TABLE `client` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `client_phone_unique` ON `client` (`phone`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_order` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`customer_phone` text,
	`total_amount` real NOT NULL,
	`status` text NOT NULL,
	`employee_id` text NOT NULL,
	`delivery_date_time` integer NOT NULL,
	`address` text,
	`comment` text,
	`deleted_at` integer,
	`discount_amount` real,
	`discount_type` text,
	`discount_value` real,
	`discount_reason` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`employee_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_order`("id", "customer_name", "customer_phone", "total_amount", "status", "employee_id", "delivery_date_time", "address", "comment", "deleted_at", "discount_amount", "discount_type", "discount_value", "discount_reason", "created_at", "updated_at") SELECT "id", "customer_name", "customer_phone", "total_amount", "status", "employee_id", "delivery_date_time", "address", "comment", "deleted_at", "discount_amount", "discount_type", "discount_value", "discount_reason", "created_at", "updated_at" FROM `order`;--> statement-breakpoint
DROP TABLE `order`;--> statement-breakpoint
ALTER TABLE `__new_order` RENAME TO `order`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `order_item` ADD `discount_amount` real;--> statement-breakpoint
ALTER TABLE `order_item` ADD `discount_type` text;--> statement-breakpoint
ALTER TABLE `order_item` ADD `discount_value` real;--> statement-breakpoint
ALTER TABLE `order_item` ADD `discount_reason` text;--> statement-breakpoint
ALTER TABLE `order_item` ADD `final_price` real;