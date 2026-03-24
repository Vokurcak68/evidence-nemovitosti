-- Add file_size column to attachments
alter table public.en_project_attachments add column if not exists file_size bigint;
