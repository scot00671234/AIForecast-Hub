-- Production migration to add missing timeframe column
-- Run this script in your production database to fix the missing column

DO $$ 
BEGIN 
  -- Check if timeframe column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'predictions' AND column_name = 'timeframe'
  ) THEN
    -- Add the missing timeframe column
    ALTER TABLE "predictions" ADD COLUMN "timeframe" text NOT NULL DEFAULT '3mo';
    
    -- Add check constraint for valid timeframes
    ALTER TABLE "predictions" ADD CONSTRAINT "predictions_timeframe_check" 
    CHECK ("timeframe" IN ('3mo', '6mo', '9mo', '12mo'));
    
    RAISE NOTICE 'Timeframe column added successfully';
  ELSE
    RAISE NOTICE 'Timeframe column already exists';
  END IF;
END $$;