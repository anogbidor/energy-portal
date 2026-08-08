-- Real backend for the "Reklam Ver" (advertise with us) contact form --
-- stores the inquiry so it can actually be followed up on, not a
-- decorative form that goes nowhere.
create table if not exists advertising_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table advertising_inquiries enable row level security;

-- No select/read policy for anon/authenticated: these are private
-- business inquiries, not public site content -- only service_role
-- (the API route) can read or write this table.
