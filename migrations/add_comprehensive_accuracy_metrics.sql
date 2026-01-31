-- Migration: Add comprehensive accuracy metrics columns
-- Date: 2026-01-31
-- Description: Adds industry-standard metrics, statistical significance, and error analysis fields to accuracy_metrics table

-- Add industry-standard metrics
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS mape DECIMAL(5, 2);
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS rmse DECIMAL(10, 4);
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS mae DECIMAL(10, 4);
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS r_squared DECIMAL(5, 4);
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS theils_u DECIMAL(5, 4);
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS smape DECIMAL(5, 2);

-- Add directional accuracy
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS directional_accuracy DECIMAL(5, 2);

-- Add statistical significance
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS ci_95_lower DECIMAL(5, 2);
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS ci_95_upper DECIMAL(5, 2);
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS sample_size INTEGER DEFAULT 0;

-- Add error analysis
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS error_std_dev DECIMAL(10, 4);
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS median_error DECIMAL(10, 4);
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS outlier_count INTEGER DEFAULT 0;

-- Add metadata
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS calculation_method TEXT DEFAULT 'enhanced_v2';
ALTER TABLE accuracy_metrics ADD COLUMN IF NOT EXISTS data_quality_score DECIMAL(5, 2);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_accuracy_metrics_period ON accuracy_metrics(period);
CREATE INDEX IF NOT EXISTS idx_accuracy_metrics_commodity ON accuracy_metrics(commodity_id);
CREATE INDEX IF NOT EXISTS idx_accuracy_metrics_model ON accuracy_metrics(ai_model_id);
CREATE INDEX IF NOT EXISTS idx_accuracy_metrics_quality ON accuracy_metrics(data_quality_score);

-- Add comment
COMMENT ON TABLE accuracy_metrics IS 'Comprehensive accuracy metrics for AI model predictions including MAPE, RMSE, MAE, R², Theil''s U, sMAPE, directional accuracy, confidence intervals, and error analysis';
