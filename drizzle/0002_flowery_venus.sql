CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(64) NOT NULL,
	`ownerUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `gradedCards` MODIFY COLUMN `status` enum('in_vault','sent_to_partner','slab_ordered') NOT NULL DEFAULT 'in_vault';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','grader') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `gradedCards` ADD `certId` varchar(32);--> statement-breakpoint
ALTER TABLE `gradedCards` ADD `qrCodeUrl` text;--> statement-breakpoint
ALTER TABLE `gradedCards` ADD `graderId` int;--> statement-breakpoint
ALTER TABLE `gradedCards` ADD `adminOverrideScore` decimal(5,2);--> statement-breakpoint
ALTER TABLE `gradedCards` ADD `adminOverrideTier` varchar(32);--> statement-breakpoint
ALTER TABLE `gradedCards` ADD `adminOverrideDiamonds` int;--> statement-breakpoint
ALTER TABLE `gradedCards` ADD `adminOverrideNote` text;--> statement-breakpoint
ALTER TABLE `gradedCards` ADD `adminOverrideBy` varchar(255);--> statement-breakpoint
ALTER TABLE `gradedCards` ADD `adminOverrideAt` timestamp;--> statement-breakpoint
ALTER TABLE `investorLeads` ADD `leadStatus` enum('new','contacted','qualified','closed') DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `investorLeads` ADD `assignedAffiliateId` int;--> statement-breakpoint
ALTER TABLE `investorLeads` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `users` ADD `affiliateId` int;--> statement-breakpoint
ALTER TABLE `gradedCards` ADD CONSTRAINT `gradedCards_certId_unique` UNIQUE(`certId`);--> statement-breakpoint
ALTER TABLE `gradedCards` DROP COLUMN `listedForSale`;