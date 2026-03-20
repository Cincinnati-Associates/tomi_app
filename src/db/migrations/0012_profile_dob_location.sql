-- Add date_of_birth and location columns to profiles
ALTER TABLE "profiles" ADD COLUMN "date_of_birth" date;
ALTER TABLE "profiles" ADD COLUMN "location" text;
