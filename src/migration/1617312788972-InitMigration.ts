import {MigrationInterface, QueryRunner} from "typeorm";

export class InitMigration1617312788972 implements MigrationInterface {
    name = 'InitMigration1617312788972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `language` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(65) NOT NULL, UNIQUE INDEX `IDX_7df7d1e250ea2a416f078a631f` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `role` (`id` int NOT NULL AUTO_INCREMENT, `description` varchar(65) NOT NULL, `create_time` datetime NOT NULL, `update_time` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_statistic` (`id` int NOT NULL AUTO_INCREMENT, `duration` int NOT NULL, `number_of_rounds` int NOT NULL, `has_left` tinyint NOT NULL, `create_time` datetime NOT NULL, `update_time` datetime NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `User` (`id` int NOT NULL AUTO_INCREMENT, `login_name` varchar(45) NOT NULL, `display_name` varchar(45) NOT NULL, `user_creation` timestamp NOT NULL, `time_played` int NOT NULL, `password_hash` varchar(45) NOT NULL, `profile_picture` varchar(45) NULL, `last_figure` int NOT NULL, `is_connected` tinyint NOT NULL, `is_dev` tinyint NOT NULL, UNIQUE INDEX `IDX_29434256f28e086ecc1b97c151` (`login_name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `board_tile` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(65) NOT NULL, `description` varchar(255) NOT NULL, `path` varchar(255) NOT NULL, `languageId` int NULL, `userId` int NULL, UNIQUE INDEX `IDX_3eb095ed70b89a177a623680de` (`name`), UNIQUE INDEX `IDX_b404aa86580d5ef646fd59c13f` (`description`), UNIQUE INDEX `IDX_9911fc20dcd7ce07b46ec291e2` (`path`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `Games` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(45) NOT NULL, `author` varchar(45) NULL, `skin` varchar(45) NULL, `randomizeTiles` tinyint NOT NULL, `startTime` datetime NOT NULL, `endTime` datetime NOT NULL, `maxPlayers` int NOT NULL, `maxRound` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_roles_role` (`userId` int NOT NULL, `roleId` int NOT NULL, INDEX `IDX_5f9286e6c25594c6b88c108db7` (`userId`), INDEX `IDX_4be2f7adf862634f5f803d246b` (`roleId`), PRIMARY KEY (`userId`, `roleId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_user_statistics_user_statistic` (`userId` int NOT NULL, `userStatisticId` int NOT NULL, INDEX `IDX_9fe2a935a423b20ca351906e7f` (`userId`), INDEX `IDX_6e25bf5bb52dbf957cecb72513` (`userStatisticId`), PRIMARY KEY (`userId`, `userStatisticId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `board_tile` ADD CONSTRAINT `FK_f9e85e818a3e6d12eef1c0b16d6` FOREIGN KEY (`languageId`) REFERENCES `language`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `board_tile` ADD CONSTRAINT `FK_d980dd48fac8f904fe42edc36b6` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_roles_role` ADD CONSTRAINT `FK_5f9286e6c25594c6b88c108db77` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_roles_role` ADD CONSTRAINT `FK_4be2f7adf862634f5f803d246b8` FOREIGN KEY (`roleId`) REFERENCES `role`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_user_statistics_user_statistic` ADD CONSTRAINT `FK_9fe2a935a423b20ca351906e7f1` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_user_statistics_user_statistic` ADD CONSTRAINT `FK_6e25bf5bb52dbf957cecb725138` FOREIGN KEY (`userStatisticId`) REFERENCES `user_statistic`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_user_statistics_user_statistic` DROP FOREIGN KEY `FK_6e25bf5bb52dbf957cecb725138`");
        await queryRunner.query("ALTER TABLE `user_user_statistics_user_statistic` DROP FOREIGN KEY `FK_9fe2a935a423b20ca351906e7f1`");
        await queryRunner.query("ALTER TABLE `user_roles_role` DROP FOREIGN KEY `FK_4be2f7adf862634f5f803d246b8`");
        await queryRunner.query("ALTER TABLE `user_roles_role` DROP FOREIGN KEY `FK_5f9286e6c25594c6b88c108db77`");
        await queryRunner.query("ALTER TABLE `board_tile` DROP FOREIGN KEY `FK_d980dd48fac8f904fe42edc36b6`");
        await queryRunner.query("ALTER TABLE `board_tile` DROP FOREIGN KEY `FK_f9e85e818a3e6d12eef1c0b16d6`");
        await queryRunner.query("DROP INDEX `IDX_6e25bf5bb52dbf957cecb72513` ON `user_user_statistics_user_statistic`");
        await queryRunner.query("DROP INDEX `IDX_9fe2a935a423b20ca351906e7f` ON `user_user_statistics_user_statistic`");
        await queryRunner.query("DROP TABLE `user_user_statistics_user_statistic`");
        await queryRunner.query("DROP INDEX `IDX_4be2f7adf862634f5f803d246b` ON `user_roles_role`");
        await queryRunner.query("DROP INDEX `IDX_5f9286e6c25594c6b88c108db7` ON `user_roles_role`");
        await queryRunner.query("DROP TABLE `user_roles_role`");
        await queryRunner.query("DROP TABLE `Games`");
        await queryRunner.query("DROP INDEX `IDX_9911fc20dcd7ce07b46ec291e2` ON `board_tile`");
        await queryRunner.query("DROP INDEX `IDX_b404aa86580d5ef646fd59c13f` ON `board_tile`");
        await queryRunner.query("DROP INDEX `IDX_3eb095ed70b89a177a623680de` ON `board_tile`");
        await queryRunner.query("DROP TABLE `board_tile`");
        await queryRunner.query("DROP INDEX `IDX_29434256f28e086ecc1b97c151` ON `User`");
        await queryRunner.query("DROP TABLE `User`");
        await queryRunner.query("DROP TABLE `user_statistic`");
        await queryRunner.query("DROP TABLE `role`");
        await queryRunner.query("DROP INDEX `IDX_7df7d1e250ea2a416f078a631f` ON `language`");
        await queryRunner.query("DROP TABLE `language`");
    }

}
