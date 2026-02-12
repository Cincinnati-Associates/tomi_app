-- Migration: Add 'admin.member_added' to auth_event_type enum
ALTER TYPE auth_event_type ADD VALUE IF NOT EXISTS 'admin.member_added' BEFORE 'admin.member_removed';
