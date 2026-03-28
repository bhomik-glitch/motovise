# Server Fix Instructions

## Critical Issues Fixed

### ✅ 1. RolesGuard Fixed
**File**: `src/auth/guards/roles.guard.ts`
**Change**: Now uses `user.sub` instead of `user.id` to match JWT strategy payload

### ✅ 2. Debug Logging Added
**File**: `src/payments/payments.service.ts`
**Changes**:
- Added order state logging before lock acquisition
- Added lock count logging
- Added signature verification logging

## Required Actions

### STEP 1: Stop All Running Servers

**Kill all Node processes on port 4000**:
```powershell
# Find process using port 4000
netstat -ano | findstr :4000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

Or simply close all terminal windows running `npm run start:dev`.

### STEP 2: Regenerate Prisma Client

```bash
npx prisma generate
```

**Expected output**: "Generated Prisma Client"

### STEP 3: Start Server (Single Instance Only)

```bash
npm run start:dev
```

**Wait for**: "Nest application successfully started"

**Verify**: No "EADDRINUSE" errors

### STEP 4: Test Product Update Endpoint

**Login as admin and test**:
```javascript
// Use this test script
node test-product-update.js
```

**Expected**: Product stock updates successfully, no 500 errors

### STEP 5: Run Simple Concurrency Test

```bash
node simple-concurrency-test.js
```

**Watch for debug logs**:
- `[DEBUG] Order state before lock:`
- `[DEBUG] Signature verification:`
- `[DEBUG] Lock acquisition result:`

**Expected**: At least some successful confirmations

### STEP 6: Analyze Debug Output

Check console for:
1. **Signature validation**: Should be `true`
2. **Lock count**: Should be `1` for first request, `0` for subsequent
3. **Order state**: Should show correct status values

### STEP 7: Run Full Test Suite

Once simple test passes:
```bash
node stress-test-concurrency.js
node edge-case-tests.js
```

### STEP 8: Validate Invariants

Run SQL queries in `validate-invariants.sql`

## Troubleshooting

### If Prisma Generate Still Fails
- Ensure ALL Node processes are stopped
- Delete `node_modules/.prisma` folder
- Run `npx prisma generate` again

### If Signature Verification Fails
- Check `RAZORPAY_KEY_SECRET` in `.env`
- Verify signature generation in test matches server

### If Lock Count is Always 0
- Check order `orderStatus` (must be PENDING)
- Check order `paymentStatus` (must be PENDING or FAILED)
- Check `stockDeducted` field exists in database

## Next Steps After Fixes

1. ✅ Server starts cleanly
2. ✅ Product update works
3. ✅ Payment verification succeeds
4. ✅ Lock mechanism works
5. → Run full test suite
6. → Validate invariants
7. → Lock Phase 5
