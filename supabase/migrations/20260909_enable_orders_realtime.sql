-- Enable Supabase Realtime for public.orders table
-- This allows Postgres changes (INSERT/UPDATE) to be broadcast over WebSockets to the admin panel.

DO $$
BEGIN
  -- Add table to supabase_realtime publication if not already present
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;

-- Set replica identity to full so update/insert payloads contain all fields
ALTER TABLE public.orders REPLICA IDENTITY FULL;
