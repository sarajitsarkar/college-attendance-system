-- ============================================================
-- Migration: adds password-reset support to the users table
-- Run this once against your existing database:
--   mysql -u root -p college_attendance_db < database/migration_forgot_password.sql
-- ============================================================
USE college_attendance_db;

ALTER TABLE users
  ADD COLUMN reset_token_hash VARCHAR(255) NULL,
  ADD COLUMN reset_token_expires DATETIME NULL;
