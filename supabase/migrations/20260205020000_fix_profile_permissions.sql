-- Fix table-level permissions for profiles table.
-- Previous GRANT migration may have been skipped or failed
-- because some referenced tables don't exist yet.
-- This migration ONLY grants on the profiles table.

grant usage on schema public to anon;
grant usage on schema public to authenticated;
grant usage on schema public to service_role;

grant select, insert, update on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;
