-- Initialize the clinical trials database
-- This file runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create any additional setup here if needed
SELECT 'Clinical Trials Database Initialized' as status;