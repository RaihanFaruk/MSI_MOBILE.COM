-- Migration: Contact messages table & Review moderation support
-- Date: 2026-09-03

-- 1. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert to contact_messages" ON public.contact_messages;
CREATE POLICY "Allow public insert to contact_messages"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read contact_messages" ON public.contact_messages;
CREATE POLICY "Allow authenticated read contact_messages"
    ON public.contact_messages FOR SELECT
    USING (true);

-- 2. Reviews Table moderation column
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='reviews' AND column_name='is_approved'
    ) THEN 
        ALTER TABLE public.reviews ADD COLUMN is_approved BOOLEAN DEFAULT true;
    END IF;
END $$;
