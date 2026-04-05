-- Migration: expand pages table with full settings support
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS meta_keywords       text CHECK (char_length(meta_keywords) <= 500),
  ADD COLUMN IF NOT EXISTS indexable           boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS og_title            text CHECK (char_length(og_title) <= 200),
  ADD COLUMN IF NOT EXISTS og_description      text CHECK (char_length(og_description) <= 500),
  ADD COLUMN IF NOT EXISTS head_code           text CHECK (char_length(head_code) <= 50000),
  ADD COLUMN IF NOT EXISTS body_code           text CHECK (char_length(body_code) <= 50000),
  ADD COLUMN IF NOT EXISTS lgpd_enabled        boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lgpd_message        text CHECK (char_length(lgpd_message) <= 1000),
  ADD COLUMN IF NOT EXISTS notification_emails text CHECK (char_length(notification_emails) <= 2000);

-- Note: favicon_url, og_image_url, fb_pixel_id, fb_api_token, ga_id, gtm_id
-- already exist in the original schema.
