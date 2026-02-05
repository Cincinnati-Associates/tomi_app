-- Add timezone column to profiles if not present
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'profiles'
    and column_name = 'timezone'
  ) then
    alter table public.profiles add column timezone varchar(50) default 'UTC';
  end if;
end $$;
