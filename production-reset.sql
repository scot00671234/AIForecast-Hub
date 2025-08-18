-- Production Database Reset Script
-- Run this in your production database to clear old predictions and trigger fresh AI generation

-- Clear all existing predictions to force fresh AI prediction generation
DELETE FROM predictions;

-- Optional: Clear accuracy metrics if you want to start fresh
-- DELETE FROM accuracy_metrics;

-- Verify the cleanup
SELECT 
    'predictions' as table_name, 
    COUNT(*) as remaining_records 
FROM predictions
UNION ALL
SELECT 
    'actual_prices' as table_name, 
    COUNT(*) as remaining_records 
FROM actual_prices
UNION ALL
SELECT 
    'commodities' as table_name, 
    COUNT(*) as remaining_records 
FROM commodities;

-- The system will now automatically detect no predictions exist and trigger:
-- 1. Fresh AI prediction generation for all 14 commodities
-- 2. Using all three AI services (OpenAI, Claude, DeepSeek)
-- 3. Automatic scheduling setup for ongoing predictions