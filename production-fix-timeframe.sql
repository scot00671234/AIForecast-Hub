-- Production fix for missing timeframe column
-- Run this on your production database

BEGIN;

-- Check if timeframe column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'predictions' AND column_name = 'timeframe'
    ) THEN
        -- Add the timeframe column with default value
        ALTER TABLE predictions 
        ADD COLUMN timeframe text NOT NULL DEFAULT '7d';
        
        RAISE NOTICE 'Added timeframe column to predictions table';
    ELSE
        RAISE NOTICE 'Timeframe column already exists';
    END IF;
END $$;

COMMIT;