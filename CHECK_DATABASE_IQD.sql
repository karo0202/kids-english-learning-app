-- Check what's actually in your database
-- Run this in Supabase SQL Editor to verify the UPDATE worked

SELECT 
  plan_id, 
  name, 
  price, 
  currency,
  is_active
FROM subscription_plans 
ORDER BY price;

-- Expected output after UPDATE:
-- plan_id  | name           | price  | currency | is_active
-- monthly  | Monthly Plan   | 13000  | IQD      | true
-- yearly   | Yearly Plan   | 125000 | IQD      | true
-- lifetime | Lifetime Plan | 200000 | IQD      | true

-- If you see USD or different prices, run the UPDATE again:

UPDATE subscription_plans SET price = 13000, currency = 'IQD' WHERE plan_id = 'monthly';
UPDATE subscription_plans SET price = 125000, currency = 'IQD' WHERE plan_id = 'yearly';
UPDATE subscription_plans SET price = 200000, currency = 'IQD' WHERE plan_id = 'lifetime';

-- Then run the SELECT again to verify
