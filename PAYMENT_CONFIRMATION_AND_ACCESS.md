# How Payment Is Confirmed and Users Get Access to All Modules

## Overview

1. **User pays** (e.g. via FIB or crypto) and gets a transaction ID.
2. **User submits proof** (receipt reference and/or transaction screenshot) in the “Already paid?” form.
3. **You (admin) verify** the payment (reference or screenshot).
4. **You activate** the subscription via the admin API or Supabase.
5. **User gets access**: app checks subscription status and unlocks all modules.

---

## Step-by-step

### 1. User submits proof

- On the subscribe page, after choosing a plan and payment method (e.g. FIB), the user sees instructions and the **“Already paid?”** form.
- They fill in:
  - **Receipt reference** (optional for FIB; FIB often has no reference, so they can leave it blank).
  - **Transaction screenshot** (required for FIB if no reference): they can **attach an image** or **paste a link**.
  - Optional: WhatsApp/phone, notes.
- On **Submit Payment Proof**, the app sends this to the server and it is stored in Supabase (`subscriptions.metadata`, `payment_transactions.provider_response`) with status still **pending**.

### 2. Where to see pending payments

- **Supabase Dashboard**  
  - Table: `subscriptions`  
  - Filter: `status = 'pending'` and `payment_method` = `fib_manual` (or your manual method).  
  - Check `metadata->manualConfirmation` for:
    - `reference`
    - `proofUrl` (screenshot link or base64 data URL)
    - `contactPhone`
    - `notes`
- Optionally you can build a small admin UI that lists these rows and shows the screenshot (e.g. open `proofUrl` in a new tab).

### 3. How you confirm and grant access

After you verify the payment (reference or screenshot), activate the subscription in one of these ways.

#### Option A: Admin API (recommended)

Call the admin activate endpoint with the **transaction ID** (same one the user saw on the subscribe page and that is stored in `subscriptions.transaction_id`).

```bash
curl -X POST https://your-app.vercel.app/api/subscription/admin/activate \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: YOUR_SUBSCRIPTION_ADMIN_SECRET" \
  -d '{"transactionId":"pay_1234567890_abc..."}'
```

- Set **SUBSCRIPTION_ADMIN_SECRET** in Vercel (Environment Variables). Use a long random string; this is the only protection for this endpoint.
- Use the **transaction ID** for that specific payment (from Supabase `subscriptions.transaction_id` or from your records).

The API will:

- Set `subscriptions.status` to **active** for that transaction.
- Set `payment_transactions.status` to **completed** for that transaction.
- `expires_at` is already set when the subscription was created, so the user stays active until that date.

#### Option B: Supabase Dashboard

1. Open **Supabase** → your project → **Table Editor**.
2. **subscriptions**: find the row with the correct `transaction_id`, set `status` to **active**.
3. **payment_transactions**: find the row with the same `transaction_id`, set `status` to **completed**.

Same effect as Option A, but manual.

### 4. How the user gets access to all modules

- The app uses **subscription status** to decide if the user has access to premium modules (e.g. Reading, Speaking, Puzzle, Alphabet coloring, Challenges).
- Status is loaded:
  - From **local cache** (if already fetched).
  - From **API**: `GET /api/subscription/status` (which reads from Supabase and returns `hasActiveSubscription` and subscription details).
- When you set the subscription to **active** (via API or Supabase), the next time the app calls `/api/subscription/status` (e.g. on refresh or when entering a locked module), the user will be treated as having an active subscription and **all modules unlock**.

So:

- **No extra step for the user** after you activate.
- They may need to **refresh the page** or **reopen the app** so the app refetches status; then they have access to all modules.

---

## Env vars to set (Vercel)

| Variable                     | Purpose                                      |
|-----------------------------|----------------------------------------------|
| `SUBSCRIPTION_ADMIN_SECRET` | Secret for calling the admin activate API.  |
| Supabase (existing)         | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` for storing and reading subscriptions. |

---

## Summary

| Step | Who        | What happens |
|------|------------|--------------|
| 1    | User       | Pays (e.g. FIB) and gets transaction ID. |
| 2    | User       | Submits proof (reference and/or screenshot) in the form. |
| 3    | System     | Proof is saved in Supabase; subscription stays **pending**. |
| 4    | Admin (you) | Verify payment, then activate via API or Supabase. |
| 5    | System     | Subscription becomes **active**; user gets access on next status check (e.g. after refresh). |
