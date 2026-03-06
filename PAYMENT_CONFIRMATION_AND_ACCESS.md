# How Payment Is Confirmed and Users Get Access to All Modules

## Overview

1. **User pays** (e.g. via FIB or crypto) and gets a transaction ID.
2. **User submits proof** (receipt reference and/or transaction screenshot) in the “Already paid?” form.
3. **You (admin) verify** the payment (reference or screenshot).
4. **You activate** the subscription via the admin API or Supabase.
5. **User gets access**: app checks subscription status and unlocks all modules.

---

## Detailed step-by-step guide

### Part 1: User submits proof (what the customer does)

- On the subscribe page, after choosing a plan and payment method (e.g. FIB), the user sees instructions and the **“Already paid?”** form.
- They fill in:
  - **Receipt reference** (optional for FIB; FIB often has no reference, so they can leave it blank).
  - **Transaction screenshot** (required for FIB if no reference): they can **attach an image** or **paste a link**.
  - Optional: WhatsApp/phone, notes.
- When they click **Submit Payment Proof**, the app saves this in Supabase. The subscription stays **pending** until you activate it.

### Part 2: Where you see pending payments (Supabase — click by click)

1. **Open Supabase**  
   Go to [supabase.com](https://supabase.com) → sign in → select your **project**.

2. **Open the subscriptions table**  
   Left sidebar → **Table Editor** → click the **subscriptions** table.

3. **Filter to pending payments**  
   Use the table filters so you only see pending manual payments:
   - **status** → equals → `pending`
   - **payment_method** → equals → `fib_manual` (or your manual method name).

4. **Find the proof and the transaction ID**  
   Each row has:
   - **transaction_id** — use this later to activate (e.g. `pay_1738xxxxx_abc...`). This column already exists; do not add a new one.
   - **metadata** — expand or click it. Look for `manualConfirmation` with:
     - `reference` — receipt reference if the user entered one
     - `proofUrl` — screenshot: either a link or a long string starting with `data:image/...`. Copy `proofUrl`, paste in a new browser tab, and open the image to verify the payment
     - `contactPhone`, `notes` — optional

5. **Verify the payment**  
   Open the screenshot (from `proofUrl`) or check the reference against your bank/crypto records. When satisfied, copy the **transaction_id** for that row — you need it for Part 4.

**Or use the admin payments page (no Supabase needed):**  
Open **Pending payments** in your app: `https://your-app.vercel.app/admin/payments`. Enter your admin secret (same as in Vercel), click **Load pending**, then verify each row and click **Activate**. You don’t need to open Supabase for this.

### Part 3: One-time setup — Admin secret in Vercel

Do this once so you can call the admin activate API securely.

1. **Open Vercel**  
   Go to [vercel.com](https://vercel.com) → sign in → open your **project** (e.g. kids-english-learning-app).

2. **Open environment variables**  
   At the top of the project: **Settings** → left sidebar → **Environment Variables**.

3. **Add the secret**
   - Click **Add New** (or **Add**).
   - **Key:** type exactly: `SUBSCRIPTION_ADMIN_SECRET`
   - **Value:** long random string. Either run `openssl rand -hex 32` in a terminal and paste the output, or use a password generator (32+ characters).
   - **Environments:** tick **Production** (and **Preview** if you use it). Click **Save**.

4. **Redeploy**  
   **Deployments** tab → **...** on latest deployment → **Redeploy**. The new variable is only available after redeploy.

5. **Keep the secret safe**  
   Store the value in a password manager or similar. You will paste it into the `curl` command in Part 4.

---

### Part 4: Activate a subscription (after you verified the payment)

You need the **transaction_id** from the `subscriptions` row you verified in Part 2. Then use Option A (API) or Option B (Supabase only).

#### Option A: Admin API (recommended)

**What you need:**

- **App URL** — e.g. `https://kids-english-learning-app.vercel.app` (no trailing slash).
- **Admin secret** — the value of `SUBSCRIPTION_ADMIN_SECRET` from Vercel (Part 3).
- **Transaction ID** — from the **transaction_id** column of that row in Supabase (e.g. `pay_1738123456_abcxyz`).

**Run in a terminal** (PowerShell, CMD, or Git Bash on Windows; Terminal on Mac). Replace `YOUR_APP_URL`, `YOUR_ADMIN_SECRET`, and `THE_TRANSACTION_ID`.

**Windows (CMD) — one line:**

```cmd
curl -X POST YOUR_APP_URL/api/subscription/admin/activate -H "Content-Type: application/json" -H "X-Admin-Secret: YOUR_ADMIN_SECRET" -d "{\"transactionId\":\"THE_TRANSACTION_ID\"}"
```

**Example (use your own URL, secret, and transaction ID):**

```cmd
curl -X POST https://kids-english-learning-app.vercel.app/api/subscription/admin/activate -H "Content-Type: application/json" -H "X-Admin-Secret: 9f3c7a4e2b8d1f6a5c0e9b7d3a1f4c8e" -d "{\"transactionId\":\"pay_1738123456_abcxyz\"}"
```

**Windows (PowerShell)** — avoids quote escaping; replace the three placeholders:

```powershell
Invoke-RestMethod -Uri "YOUR_APP_URL/api/subscription/admin/activate" -Method Post -Headers @{"Content-Type"="application/json"; "X-Admin-Secret"="YOUR_ADMIN_SECRET"} -Body '{"transactionId":"THE_TRANSACTION_ID"}'
```

**Mac / Linux / Git Bash:**

```bash
curl -X POST YOUR_APP_URL/api/subscription/admin/activate \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET" \
  -d '{"transactionId":"THE_TRANSACTION_ID"}'
```

**Or use the script (Option A in one command):**

From the `app` folder, set your app URL and admin secret once, then run with the transaction ID from Supabase:

**PowerShell (Windows):**

```powershell
cd "c:\path\to\kids_english_app\app"
$env:ACTIVATE_APP_URL = "https://your-app.vercel.app"
$env:SUBSCRIPTION_ADMIN_SECRET = "paste_your_secret_here"
node scripts/activate-subscription.js "PASTE_TRANSACTION_ID_FROM_SUPABASE"
```

**CMD (Windows):**

```cmd
cd c:\path\to\kids_english_app\app
set ACTIVATE_APP_URL=https://your-app.vercel.app
set SUBSCRIPTION_ADMIN_SECRET=paste_your_secret_here
node scripts/activate-subscription.js PASTE_TRANSACTION_ID_FROM_SUPABASE
```

Replace `your-app.vercel.app` with your real Vercel URL, `paste_your_secret_here` with the value of `SUBSCRIPTION_ADMIN_SECRET` from Vercel, and `PASTE_TRANSACTION_ID_FROM_SUPABASE` with the **transaction_id** from the pending row in the `subscriptions` table. The script will call the API and print success or error.

**Result:**

- **Success:** JSON like `{"ok":true}`. In Supabase, that subscription is **active** and the matching **payment_transactions** row is **completed**.
- **401:** Wrong or missing `X-Admin-Secret` — check Vercel and redeploy.
- **404:** Wrong URL or path.
- **Other:** Ensure `transactionId` matches **transaction_id** in Supabase exactly (no extra spaces).

**Then:** Ask the user to **refresh the page** or **reopen the app** so the app refetches status and unlocks all modules.

The API sets `subscriptions.status` to **active** and `payment_transactions.status` to **completed** for that transaction; `expires_at` is already set when the subscription was created.

**If a user still can't access after activation:** Sometimes the subscription was created with a different or wrong `user_id`, so the app (which sends the user's current Firebase UID) doesn't find it. Use the **Link user** API to fix it:

1. Get the **transaction_id** of that user's payment (from admin payments page or Supabase `subscriptions` table).
2. Get the user's **Firebase UID** (e.g. from Supabase or from the user — they can find it in account/settings in some apps, or you can use the UID you see in your auth logs; e.g. `V8iXAGR7gXXSK0bkiiqAZJwN0zq2`).
3. Call the link-user API (same auth as activate — `X-Admin-Secret` or `Authorization: Bearer YOUR_ADMIN_SECRET`):

```bash
curl -X POST YOUR_APP_URL/api/subscription/admin/link-user \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: YOUR_ADMIN_SECRET" \
  -d '{"transactionId":"THE_TRANSACTION_ID","userId":"THE_FIREBASE_UID"}'
```

Example for one user:

```bash
curl -X POST https://your-app.vercel.app/api/subscription/admin/link-user \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: YOUR_SECRET" \
  -d '{"transactionId":"pay_1738xxxxx_abc","userId":"V8iXAGR7gXXSK0bkiiqAZJwN0zq2"}'
```

Then ask the user to refresh the app; they should get access. Optional: in Supabase, run `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS user_email TEXT;` so future subscriptions store email and the app can also match by email if needed.

#### Option B: Supabase Dashboard (manual)

1. **Supabase** → **Table Editor** → **subscriptions**. Find the row with the **transaction_id** you verified. Change **status** from `pending` to **active**. Save.
2. Open **payment_transactions**. Find the row with the same **transaction_id**. Set **status** to **completed**. Save.

Same result as Option A; good for one-off activations.

**Admin payments page (easiest — no Supabase, no script):**  
Go to **https://your-app.vercel.app/admin/payments**. Enter your **SUBSCRIPTION_ADMIN_SECRET**, click **Load pending**. You’ll see a table of pending manual payments with reference, proof link (screenshot), and contact. Verify each, then click **Activate** for that row. No need to open Supabase or run the script.

---

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
