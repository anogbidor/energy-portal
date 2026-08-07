-- Footer newsletter signup. Only stores the email + when they signed
-- up -- actually sending updates is a separate, not-yet-built feature
-- (needs an email service like Resend), but the collection itself is
-- real and should work now rather than being a fake/decorative form.
create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;

-- No select/read policy for anon/authenticated: subscriber emails are
-- personal data, not public site content -- only service_role (the
-- API route) can read or write this table.
