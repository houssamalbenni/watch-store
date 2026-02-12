# Meta Pixel Deployment Checklist

A step-by-step checklist for deploying Meta Pixel + Conversion API to production.

## Pre-Deployment (Development)

### Step 1: Get Meta Credentials ✓

- [ ] **Pixel ID**: Retrieved from Meta Events Manager
  - Pixel ID: `________________`
  - Location: Meta Business Suite > Events Manager > Pixel Settings

- [ ] **Access Token**: Generated with correct permissions
  - ✓ permissions: `ads_management`, `business_management`, `offline_access`
  - ✓ Type: Long-lived (60+ days)
  - ✓ System User created (not personal account)
  - Token format: ~200+ characters, starts with EAAB...

- [ ] **Business Account ID** (optional)
  - Account ID: `________________`

### Step 2: Test Locally

- [ ] **Start development servers**
  ```bash
  # Terminal 1: Client (Port 5173)
  cd client && npm run dev

  # Terminal 2: Server (Port 5000)
  cd server && npm run dev
  ```

- [ ] **Verify environment files created**
  - [ ] `client/.env.local` with `VITE_META_PIXEL_ID`
  - [ ] `server/.env` with `META_ACCESS_TOKEN` and `META_PIXEL_ID`

- [ ] **Browser Console Tests**
  ```javascript
  // Check Pixel initialized
  typeof fbq === 'function'  // Should return: true

  // Trigger test event
  fbq('track', 'PageView')

  // Check localStorage for event IDs
  Object.keys(localStorage).filter(k => k.startsWith('meta_event_'))
  ```

- [ ] **Network Tab Tests**
  - [ ] `fbevents.js` loaded from Facebook
  - [ ] POST request to `/api/events/track` returns 200
  - [ ] Response: `{ "success": true, ... }`

- [ ] **Server Logs Tests**
  ```
  INFO Event tracked successfully {
    eventId: "...",
    eventName: "PageView",
    userId: "anonymous",
    success: true
  }
  ```

- [ ] **Meta Events Manager - Use Test Event Code**
  - Navigate to **Events Manager > Test Events**
  - Copy Test Event Code
  - Add to `.env.local`: `VITE_META_TEST_EVENT_CODE=...`
  - Reload app and trigger events
  - Should appear in **Real-time View** within 30 seconds

### Step 3: Test All Event Types

- [ ] **PageView** - Automatic on route change
- [ ] **ViewContent** - Visit product detail page
- [ ] **AddToCart** - Click "Add to Cart" button
- [ ] **InitiateCheckout** - Visit checkout page
- [ ] **Lead** - Click WhatsApp button or submit inquiry form
- [ ] **Purchase** - Complete a test order

---

## Staging Deployment (Vercel + Render)

### Step 4: Deploy Client (Vercel)

- [ ] **Commit and push code**
  ```bash
  git add client/src/lib/metaPixelEvents.js
  git add client/src/hooks/useMetaPixel.js
  git add client/src/App.jsx
  git add client/.env.example
  git commit -m "Add Meta Pixel integration"
  git push origin main
  ```

- [ ] **Vercel auto-deploys**
  - Vercel Dashboard shows deployment in progress
  - Wait for "PRODUCTION" badge (green checkmark)
  - Build logs show no errors

- [ ] **Configure Environment Variables in Vercel**
  1. Go to: **Project Settings > Environment Variables**
  2. Add new variable:
     - Key: `VITE_META_PIXEL_ID`
     - Value: Your Pixel ID
     - Environments: **Production**, **Preview**, **Development**
  3. Redeploy from Git (Settings > Redeploy on Push)

- [ ] **Staging URL Test**
  - Open your staging URL in browser
  - Browser console: `typeof fbq === 'function'` → true
  - Open Meta Events Manager > Test Events tab
  - Visit a product page → Event should appear

### Step 5: Deploy Backend (Render)

- [ ] **Commit server code**
  ```bash
  git add server/src/lib/metaCAPITracker.js
  git add server/src/controllers/eventsController.js
  git add server/src/routes/events.js
  git add server/src/index.js
  git add server/.env.example
  git commit -m "Add Meta Conversion API integration"
  git push origin main
  ```

- [ ] **Render auto-deploys**
  - Render Dashboard shows deployment status
  - Wait for "Live" status (green)
  - Deploy logs show no errors

- [ ] **Add Secrets in Render Dashboard**
  1. Select your service
  2. Go to: **Environment**
  3. Add Secrets (NOT regular variables):
     - Key: `META_ACCESS_TOKEN`
     - Value: Your long-lived access token
     - Click "Add Secret"
     - Repeat for: `META_PIXEL_ID`

  ```
  META_ACCESS_TOKEN = eaab...your_long_token
  META_PIXEL_ID = 123456789012345
  ```

- [ ] **Redeploy to apply secrets**
  1. Go to **Deployments**
  2. Find latest deployment
  3. Click **"Redeploy"**
  4. Wait for "Live" status

- [ ] **Test API Endpoint**
  ```bash
  curl -X POST https://your-service.onrender.com/api/events/track \
    -H "Content-Type: application/json" \
    -d '{
      "eventName": "PageView",
      "eventId": "test-'$(date +%s)'",
      "eventData": { "page": "/staging" }
    }'
  ```
  Expected response:
  ```json
  { "success": true, "data": { "events_received": 1 } }
  ```

- [ ] **Check Render Logs**
  1. In Render Dashboard
  2. Select service
  3. Go to **Logs**
  4. Should see: `INFO Event tracked successfully { eventId: ..., success: true }`

### Step 6: Staging Validation

- [ ] **Full user journey test**
  - [ ] Login to staging site
  - [ ] View products (ViewContent events)
  - [ ] Add items to cart (AddToCart events)
  - [ ] Go to checkout (InitiateCheckout)
  - [ ] Complete purchase (Purchase - CRITICAL!)
  - [ ] Contact buttons (Lead events)

- [ ] **Verify in Meta Events Manager**
  1. Go to **Events Manager**
  2. Select your Pixel
  3. Go to **Real-time View**
  4. All events should show within 30-60 seconds
  5. Purchase events should show correct value & currency

- [ ] **Check Deduplication**
  - Trigger same event twice (add same product to cart twice)
  - Only ONE event should reach Meta (not two)
  - Check server logs: `Duplicate event detected`

- [ ] **Check Data on Event**
  - Click an event in Events Manager
  - Verify data shows: product name, price, category, quantity

- [ ] **Performance/Monitoring**
  - [ ] No console errors in browser
  - [ ] API response times < 500ms
  - [ ] Server CPU/Memory usage normal
  - [ ] No 5xx errors in Render logs

---

## Production Deployment

### Step 7: Final Checklist

- [ ] **Token Security Review**
  - [ ] Token NOT in code (only in Render Secrets) ✓
  - [ ] Token has correct permissions (ads_management, business_management)
  - [ ] Token won't expire soon (set to 60+ days)
  - [ ] Created with dedicated system user (not personal)

- [ ] **Environment Variables Review**
  - [ ] `META_ACCESS_TOKEN` in Render Secrets
  - [ ] `META_PIXEL_ID` matches in both client & server
  - [ ] No test event codes in production
  - [ ] Debug logging disabled: `META_DEBUG_EVENTS=false`

- [ ] **Code Review**
  - [ ] All events have unique `eventId` generation ✓
  - [ ] PII hashing implemented (SHA-256) ✓
  - [ ] Error handling in place ✓
  - [ ] No sensitive data in logs ✓

- [ ] **Production Client Deployment**
  1. Add `VITE_META_PIXEL_ID` to Vercel prod env vars
  2. Ensure HTTPS enabled (Vercel default)
  3. Run production build locally: `npm run build`
  4. Verify: `dist/index.html` includes your actual Pixel ID (search for: "123456789012345")
  5. Deploy via git push

- [ ] **Production Server Deployment**
  1. Add secrets to Render prod service
  2. Verify HTTPS enabled (Render default)
  3. Check render.yaml includes env vars
  4. Deploy via git push
  5. Verify deployment status: "Live"

- [ ] **Smoke Tests**
  - [ ] Visit production site
  - [ ] Open Network tab > Filter: "graph.facebook.com"
  - [ ] Perform action (view product, add to cart)
  - [ ] Should see POST request to Meta API
  - [ ] Check Meta Events Manager for events within 60 seconds

- [ ] **Monitoring & Alerts Setup**
  - [ ] Sentry error tracking configured
  - [ ] Alerts for API errors (>10% failure rate)
  - [ ] Alerts for token expiration (30 days)
  - [ ] Daily dashboard check scheduled

### Step 8: Post-Deployment

- [ ] **Verify Production Events**
  - Go to Meta Events Manager
  - Select your Pixel
  - View last 50 events - all should be real user actions
  - Check Purchase events show correct order data

- [ ] **Verify No Data Issues**
  - [ ] PageView events have page paths
  - [ ] ViewContent events have product data
  - [ ] AddToCart events have product info + quantity
  - [ ] Purchase events have order ID + value + currency
  - [ ] Lead events have lead type

- [ ] **Monitor for 24 Hours**
  - [ ] Check logs every 2-3 hours
  - [ ] Monitor conversion rate in Meta Ads Manager
  - [ ] Check for unusual error patterns
  - [ ] Verify event count matches user activity

- [ ] **Team Communication**
  - [ ] Notify marketing team: Pixel is now tracking
  - [ ] Pixel data available for audience building
  - [ ] Ads campaigns can now optimize on Purchase events
  - [ ] Expect 24-48 hours before audiences fully populate

- [ ] **Documentation**
  - [ ] Commit all integration code
  - [ ] Update README.md with Pixel integration info
  - [ ] Setup wiki/docs with troubleshooting guide
  - [ ] Share access token rotation schedule

---

## Troubleshooting During Deployment

### Issue: Events Not Showing in Meta

**During Staging:**
- [ ] Check Pixel ID matches exactly (copy-paste, not retyped)
- [ ] Check fbq() initialized: `typeof fbq === 'function'` in console
- [ ] Check Test Event code configured (if using)
- [ ] Wait 2-3 minutes (Meta has delay)
- [ ] Try different browser (clear cache)

**During Production:**
- [ ] Check events showing in staging first
- [ ] Verify correct Pixel ID deployed to prod env
- [ ] Check server logs show events reaching /api/events/track
- [ ] Check Meta Events Manager dashboard (not just Test Events)
- [ ] Check for ad blocker blocking fbevents.js (test in incognito)

### Issue: "Invalid token" Error in Logs

- [ ] Verify token in Render Secrets (not .env file)
- [ ] Copy-paste token again (no spaces before/after)
- [ ] Check permissions: ads_management + business_management
- [ ] Generate new token if uncertain
- [ ] Render requires redeploy after Secrets change (click Redeploy)

### Issue: High Event Loss / Failures

- [ ] Check Render CPU/memory (might be rate limited)
- [ ] Check Meta API rate limits (1000 req/sec per token)
- [ ] Check queued events: `GET /api/events/status`
- [ ] Monitor retry backoff in logs
- [ ] Consider using Redis for production queue

### Issue: Duplicate Events

- [ ] Verify `generateEventId()` creates unique IDs
- [ ] Check localStorage dedup cache exists
- [ ] Don't manually set eventID without generator
- [ ] Check event not triggered from both client & server

---

## Rollback Plan

If production deployment fails:

1. **Immediate**: Disable event tracking
   ```bash
   # Update Render secrets
   META_ACCESS_TOKEN = ""  # OR leave unset
   # Redeploy
   ```

2. **Alternative**: Revert to previous deployment
   ```bash
   git checkout HEAD~1  # Previous commit
   git push --force-with-lease
   ```

3. **Timeline**: Should take < 5 minutes to disable

4. **RCA**: Check logs in Render > Deployments > Failed logs

---

## Sign-Off

- [ ] Product Manager: Feature approved ___________
- [ ] QA: All tests passed ___________
- [ ] DevOps: Deployment verified ___________
- [ ] Marketing: Ready to build audiences ___________
- [ ] Date: __________________

---

**Last Updated:** February 2026
