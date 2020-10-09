-- MySQL Script generated by MySQL Workbench
-- Sat Apr 11 20:13:39 2020
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema BrettSpiel
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema BrettSpiel
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `BrettSpiel` DEFAULT CHARACTER SET utf16 ;
USE `BrettSpiel` ;

-- -----------------------------------------------------
-- Table `BrettSpiel`.`User`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `BrettSpiel`.`User` (
  `user_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `login_name` VARCHAR(45) NOT NULL,
  `display_name` VARCHAR(45) NOT NULL,
  `password_hash` VARCHAR(45) NOT NULL,
  `user_creation` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `time_played` INT(10) UNSIGNED NOT NULL DEFAULT 0,
  `profile_picture` VARCHAR(45) NULL DEFAULT NULL,
  `last_figure` INT(10) UNSIGNED NOT NULL DEFAULT 1,
  `is_connected` TINYINT(1) NOT NULL DEFAULT 0,
  `is_dev` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY (`user_id`),
  UNIQUE KEY (`login_name`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf16;

CREATE TABLE IF NOT EXISTS `BrettSpiel`.`Games` (
 `game_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
 `game_name` VARCHAR(45),
 `author` VARCHAR(45),
 `skin` VARCHAR(45),
 `randomizeTiles` TINYINT(1),
 `startTime` DATETIME,
 `endTime` DATETIME,
 `maxPlayers` INT(10),
 `maxRound` INT(10),
 PRIMARY KEY (`game_id`),
 UNIQUE KEY (`game_id`))
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf16;
-- SET SQL_MODE=@OLD_SQL_MODE;
-- SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
-- SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
