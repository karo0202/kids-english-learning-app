-- Update subscription plans to IQD currency
-- Run this in Supabase SQL Editor

-- Update Monthly Plan
UPDATE subscription_plans
SET 
  price = 13000,
  currency = 'IQD'
WHERE plan_id = 'monthly';

-- Update Yearly Plan
UPDATE subscription_plans
SET 
  price = 125000,
  currency = 'IQD'
WHERE plan_id = 'yearly';

-- Update Lifetime Plan
UPDATE subscription_plans
SET 
  price = 260000,
  currency = 'IQD'
WHERE plan_id = 'lifetime';

-- Verify the changes
SELECT plan_id, name, price, currency FROM subscription_plans ORDER BY price;
