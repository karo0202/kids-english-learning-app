# Payment Security Assessment

## 🔒 Current Security Status

### ✅ **What's Secure:**

1. **Authentication Required**
   - All payment endpoints require authentication
   - Users must be logged in to create subscriptions
   - 401 errors for unauthenticated requests

2. **Database Security**
   - Supabase (PostgreSQL) with service role key
   - User data isolated by `user_id`
   - Transaction IDs are cryptographically generated

3. **HTTPS/SSL**
   - Vercel automatically provides HTTPS
   - All API calls are encrypted in transit

4. **Environment Variables**
   - Sensitive keys stored in Vercel (not in code)
   - Service role key never exposed to frontend

5. **Input Validation**
   - Basic validation for required fields
   - Payment method restricted to `fib_manual`

---

## ⚠️ **Security Concerns & Recommendations**

### 🔴 **Critical Issues:**

#### 1. **Weak Authentication Fallback**
**Issue:** `getUserIdFromToken` accepts `userIdFromBody` as a fallback when a token exists.

```typescript
// Current code (VULNERABLE):
if (userIdFromBody && authHeader) return userIdFromBody
```

**Risk:** A user could send someone else's `userId` in the request body and impersonate them.

**Fix:** Remove this fallback or add strict validation:
```typescript
// Only use userIdFromBody if token verification fails AND we can't decode it
// But verify the userId matches the token's user
```

#### 2. **Firebase Token Not Verified**
**Issue:** Firebase tokens are only decoded, not verified.

**Risk:** Expired or invalid tokens might still work.

**Fix:** Use Firebase Admin SDK to verify tokens:
```typescript
import { getAuth } from 'firebase-admin/auth'
const decodedToken = await getAuth().verifyIdToken(token)
```

#### 3. **No Transaction Ownership Verification**
**Issue:** `confirmManualPayment` doesn't verify the transaction belongs to the user.

**Current:** Filters by both `transaction_id` AND `user_id` (this is actually okay, but could be improved)

**Recommendation:** Add explicit check:
```typescript
// Verify transaction exists and belongs to user
const { data: transaction } = await supabase
  .from('payment_transactions')
  .select('user_id')
  .eq('transaction_id', transactionId)
  .single()

if (!transaction || transaction.user_id !== userId) {
  throw new Error('Transaction not found or unauthorized')
}
```

---

### 🟡 **Medium Priority Issues:**

#### 4. **No Rate Limiting**
**Risk:** Users could spam payment creation or confirmation endpoints.

**Recommendation:** Add rate limiting:
```typescript
// Use Vercel Edge Config or Upstash Redis
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
})
```

#### 5. **No Plan Price Validation**
**Issue:** Plan prices come from hardcoded `FALLBACK_PLANS`, not verified against database.

**Risk:** If database prices differ, users might pay wrong amount.

**Fix:** Always fetch plan from database and validate:
```typescript
const { data: plan } = await supabase
  .from('subscription_plans')
  .select('*')
  .eq('plan_id', planId)
  .single()

if (!plan || !plan.is_active) {
  throw new Error('Invalid plan')
}
```

#### 6. **No Duplicate Transaction Prevention**
**Risk:** Same transaction could be processed multiple times.

**Fix:** Add idempotency check:
```typescript
// Check if transaction already exists
const { data: existing } = await supabase
  .from('payment_transactions')
  .select('id')
  .eq('transaction_id', transactionId)
  .single()

if (existing) {
  throw new Error('Transaction already exists')
}
```

#### 7. **No Input Sanitization**
**Issue:** User-provided `reference`, `notes`, `proofUrl` are not sanitized.

**Risk:** XSS or injection attacks if data is displayed.

**Fix:** Sanitize user inputs:
```typescript
import DOMPurify from 'isomorphic-dompurify'

const sanitizedReference = DOMPurify.sanitize(reference || '')
const sanitizedNotes = DOMPurify.sanitize(notes || '')
```

#### 8. **No Transaction Expiration**
**Issue:** Pending transactions never expire.

**Risk:** Old transactions could be confirmed months later.

**Fix:** Add expiration check:
```typescript
// In confirmManualPayment
const { data: transaction } = await supabase
  .from('payment_transactions')
  .select('created_at')
  .eq('transaction_id', transactionId)
  .single()

const createdAt = new Date(transaction.created_at)
const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)

if (hoursSinceCreation > 24) { // 24 hours
  throw new Error('Transaction expired. Please create a new payment.')
}
```

---

### 🟢 **Low Priority / Best Practices:**

#### 9. **Add Request Logging**
Log all payment attempts for audit trail:
```typescript
await supabase.from('payment_logs').insert({
  user_id: userId,
  action: 'create_payment',
  transaction_id: transactionId,
  ip_address: request.headers.get('x-forwarded-for'),
  user_agent: request.headers.get('user-agent'),
  timestamp: new Date().toISOString(),
})
```

#### 10. **Add CSRF Protection**
For state-changing operations, add CSRF tokens.

#### 11. **Add Payment Amount Verification**
When confirming payment, verify the amount matches:
```typescript
const { data: transaction } = await supabase
  .from('payment_transactions')
  .select('amount')
  .eq('transaction_id', transactionId)
  .single()

// Admin should verify the payment amount matches transaction.amount
```

#### 12. **Add Email Notifications**
Send confirmation emails when:
- Payment is created
- Payment proof is submitted
- Payment is verified/approved

---

## 🛡️ **Immediate Action Items**

### Priority 1 (Do Now):
1. ✅ Remove or fix `userIdFromBody` fallback
2. ✅ Verify Firebase tokens properly
3. ✅ Add transaction expiration (24 hours)

### Priority 2 (This Week):
4. ✅ Add rate limiting
5. ✅ Validate plan prices from database
6. ✅ Add duplicate transaction prevention

### Priority 3 (This Month):
7. ✅ Add input sanitization
8. ✅ Add request logging
9. ✅ Add email notifications

---

## 📋 **Security Checklist**

- [ ] Firebase tokens are verified (not just decoded)
- [ ] No userId fallback in authentication
- [ ] Rate limiting on payment endpoints
- [ ] Transaction expiration implemented
- [ ] Plan prices validated from database
- [ ] Duplicate transaction prevention
- [ ] Input sanitization for user data
- [ ] Request logging for audit trail
- [ ] Email notifications for payments
- [ ] CSRF protection (if needed)
- [ ] Payment amount verification in admin panel

---

## 🔐 **For Manual Payment Verification**

Since you're using manual payment confirmation, ensure:

1. **Admin Verification Process:**
   - Admin manually checks bank account for payment
   - Verifies payment amount matches transaction amount
   - Verifies payment reference matches user's submission
   - Only then approves subscription

2. **User Trust:**
   - Display clear payment instructions
   - Show transaction ID prominently
   - Provide support contact for issues
   - Set expectations (e.g., "Payment verification takes 24-48 hours")

3. **Fraud Prevention:**
   - Monitor for suspicious patterns (multiple failed attempts)
   - Require phone number verification
   - Consider requiring ID verification for large amounts

---

## 📞 **Support & Monitoring**

Set up monitoring for:
- Failed payment attempts
- Unusual payment patterns
- Multiple transactions from same user
- Transactions with mismatched amounts

---

**Last Updated:** February 2026
**Next Review:** After implementing Priority 1 fixes
