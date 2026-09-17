CREATE TABLE `instanceSettings` (
	`id` text PRIMARY KEY,
	`displayName` text,
	`logoKey` text,
	`faviconKey` text,
	`supportEmail` text,
	`updatedAt` integer NOT NULL,
	`updatedBy` text,
	CONSTRAINT `fk_instanceSettings_updatedBy_user_id_fk` FOREIGN KEY (`updatedBy`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
