-- Verify IQD update worked - Run this in Supabase SQL Editor
-- This will show you what's actually in the database

SELECT 
  plan_id, 
  name, 
  price, 
  currency,
  is_active
FROM subscription_plans 
ORDER BY price;

-- Expected results:
-- monthly | Monthly Plan | 13000 | IQD | true
-- yearly  | Yearly Plan  | 125000 | IQD | true
-- lifetime | Lifetime Plan | 200000 | IQD | true

-- If you see USD or different prices, the UPDATE didn't work.
-- Check if plan_id values match exactly: 'monthly', 'yearly', 'lifetime'
