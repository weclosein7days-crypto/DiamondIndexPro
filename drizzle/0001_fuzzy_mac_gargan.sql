CREATE TABLE `gradedCards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cardName` varchar(255),
	`cardSet` varchar(255),
	`cardYear` varchar(16),
	`cardNumber` varchar(64),
	`manufacturer` varchar(128),
	`frontImageKey` text,
	`backImageKey` text,
	`overallScore` decimal(5,2),
	`diamondRating` int,
	`gradeTier` varchar(32),
	`centeringScore` decimal(5,2),
	`edgesScore` decimal(5,2),
	`cornersScore` decimal(5,2),
	`surfaceScore` decimal(5,2),
	`eyeAppealScore` decimal(5,2),
	`status` enum('pending','graded','listed','sold') NOT NULL DEFAULT 'graded',
	`listedForSale` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gradedCards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investorLeads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`company` varchar(255),
	`phone` varchar(64),
	`interest` enum('full_deck','schedule_call','general') NOT NULL DEFAULT 'general',
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `investorLeads_id` PRIMARY KEY(`id`)
);
