# Fix: Update Plans to IQD in Supabase

The code has been updated to use IQD, but your Supabase database still has USD values. Here's how to fix it:

## Option 1: Update via SQL (Fastest - Recommended)

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor**
3. Copy and paste this SQL:

```sql
-- Update subscription plans to IQD currency
UPDATE subscription_plans
SET price = 13000, currency = 'IQD'
WHERE plan_id = 'monthly';

UPDATE subscription_plans
SET price = 125000, currency = 'IQD'
WHERE plan_id = 'yearly';

UPDATE subscription_plans
SET price = 260000, currency = 'IQD'
WHERE plan_id = 'lifetime';
```

4. Click **Run**
5. Verify: Run this query to check:
```sql
SELECT plan_id, name, price, currency FROM subscription_plans ORDER BY price;
```

You should see:
- monthly: 13000 IQD
- yearly: 125000 IQD
- lifetime: 260000 IQD

## Option 2: Let Code Update Automatically

The code will automatically update plans when someone creates a payment. But you can trigger it manually:

1. Visit your site: `https://kids-english-learning-app-sepia.vercel.app/subscribe`
2. Select a plan
3. Click "Pay by Phone Number"
4. The `seedPlansIfNeeded()` function will run and update the database

**Note:** Option 1 is faster and more reliable!

---

After updating, refresh your subscription page and you should see IQD prices! 🎉
