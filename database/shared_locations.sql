-- Create shared_locations table for storing user-shared locations
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS shared_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    message TEXT DEFAULT 'Shared location',
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shared_locations_shared_at ON shared_locations(shared_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_locations_user_email ON shared_locations(user_email);

-- Enable Row Level Security (RLS)
ALTER TABLE shared_locations ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read all shared locations
CREATE POLICY "Allow read access to all users" ON shared_locations
    FOR SELECT USING (true);

-- Policy to allow users to insert their own locations
CREATE POLICY "Allow users to share their own locations" ON shared_locations
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Policy to allow users to delete their own locations
CREATE POLICY "Allow users to delete their own locations" ON shared_locations
    FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, DELETE ON shared_locations TO authenticated;
