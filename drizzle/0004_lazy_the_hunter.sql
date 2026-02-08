CREATE TABLE `menu_item_modifier_group` (
	`id` text PRIMARY KEY NOT NULL,
	`menu_item_id` text NOT NULL,
	`modifier_group_id` text NOT NULL,
	`is_required` integer NOT NULL,
	`min_selections` integer NOT NULL,
	`max_selections` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_item`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`modifier_group_id`) REFERENCES `modifier_group`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `modifier` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`is_available` integer NOT NULL,
	`display_order` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `modifier_group`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `modifier_group` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`display_order` integer NOT NULL,
	`min_selections` integer NOT NULL,
	`max_selections` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_item_modifier` (
	`id` text PRIMARY KEY NOT NULL,
	`order_item_id` text NOT NULL,
	`modifier_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_at_order` real NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_item`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`modifier_id`) REFERENCES `modifier`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_item_variation` (
	`id` text PRIMARY KEY NOT NULL,
	`order_item_id` text NOT NULL,
	`variation_group_id` text NOT NULL,
	`variation_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_item`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variation_group_id`) REFERENCES `variation_group`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variation_id`) REFERENCES `variation`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `variation` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`name` text NOT NULL,
	`price_adjustment` real NOT NULL,
	`is_default` integer NOT NULL,
	`display_order` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `variation_group`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `variation_group` (
	`id` text PRIMARY KEY NOT NULL,
	`menu_item_id` text NOT NULL,
	`name` text NOT NULL,
	`display_order` integer NOT NULL,
	`is_required` integer NOT NULL,
	`min_selections` integer NOT NULL,
	`max_selections` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`menu_item_id`) REFERENCES `menu_item`(`id`) ON UPDATE no action ON DELETE cascade
);
