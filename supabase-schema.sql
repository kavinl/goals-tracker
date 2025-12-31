-- Goal Tracking Dashboard - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Create the goals table
CREATE TABLE goals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    tracking_type TEXT NOT NULL CHECK (tracking_type IN ('number', 'checkbox')),
    current_value JSONB NOT NULL,
    target_value NUMERIC,
    priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
    status TEXT NOT NULL CHECK (status IN ('Not Started', 'Active', 'Blocked', 'Completed', 'Deprioritized')),
    date_added TIMESTAMP WITH TIME ZONE NOT NULL,
    target_date DATE,
    notes TEXT,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    deprioritized_date TIMESTAMP WITH TIME ZONE,
    deprioritize_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on status for faster queries
CREATE INDEX idx_goals_status ON goals(status);

-- Create an index on last_updated for weekly review queries
CREATE INDEX idx_goals_last_updated ON goals(last_updated);

-- Enable Row Level Security (RLS)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
-- Later you can add authentication and restrict by user_id
CREATE POLICY "Enable all access for all users" ON goals
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
