-- Enable pg_net extension to provide net.http_post used by triggers
-- Safe to run multiple times
create extension if not exists pg_net with schema extensions;

-- Optional sanity check: ensure the schema exists (no-op if already present)
create schema if not exists net;

-- Grant usage to public so functions invoked by triggers can access it
grant usage on schema net to public;
