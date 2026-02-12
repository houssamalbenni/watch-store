# Meta Pixel + Conversion API Implementation Guide

> Production-ready hybrid tracking for MERN e-commerce stack (Vercel + Render)

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Integration in Components](#integration-in-components)
- [Event Tracking Reference](#event-tracking-reference)
- [Deployment (Vercel + Render)](#deployment-vercel--render)
- [Testing & Debugging](#testing--debugging)
- [Monitoring & Alerts](#monitoring--alerts)
- [Privacy & Compliance](#privacy--compliance)
- [Troubleshooting](#troubleshooting)

---

## Overview

This implementation provides **hybrid browser + server-side event tracking** for Meta Pixel and Conversion API:

| Aspect | Browser Pixel | Server CAPI | Benefit |
|--------|---------------|------------|---------|
| **Installation** | Script tag | API requests | Always tracks |
| **Coverage** | User interactions | Backend events | Catches all events |
| **Deduplication** | ❌ | ✓ eventID | Accurate attribution |
| **Privacy** | 1st party data | Hashed PII | GDPR/CCPA compliant |
| **Ad Targeting** | ✓ | ✓ | Enhanced modeling |
| **Cost** | Free | ~$0.0001/call | Minimal overhead |

### Key Features

✅ **Event Deduplication** - Same event ID prevents double counting  
✅ **Privacy by Design** - SHA-256 hashing of PII  
✅ **Fallback Tracking** - Works even if Pixel blocked by ad blocker  
✅ **Error Resilience** - Event queuing + retry logic  
✅ **Production Ready** - Designed for Vercel + Render deployment  

---

## Architecture

```
┌─────────────────┐
│  User Browser   │
│  (React App)    │
└────────┬────────┘
         │ Event: AddToCart
         ├──> Meta Pixel SDK ──> Facebook.com (immediate)
         │    + localStorage eventID
         │
         └──> fetch /api/events/track
              + eventID, userData, customData
              │
         ┌────▼────────────────┐
         │ Express Backend     │ (Render)
         │ /api/events/track   │
         ├────────────────────┤
         │ • Check dedup cache │
         │ • Hash PII (SHA256) │
         │ • Enrich user data  │
         │ • Build CAPI event  │
         └────┬───────────────┘
              │
              └──> Meta Conversion API
                   (graph.facebook.com)
                   │
                   ✓ Event recorded
                   ✓ Dedup prevents double count
                   ✓ Enhanced with server data
```

---

## Setup Instructions

### Step 1: Get Meta Credentials

**For Meta Pixel ID:**
1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Click **Events Manager** in left sidebar
3. Select or create a Pixel
4. Copy the **Pixel ID** (numeric, e.g., "123456789012345")

**For Conversion API Token:**
1. In Business Suite, go **Settings → Business Settings**
2. Navigate to **Users → System Users** (create one if needed)
3. Edit the system user, scroll to **App Roles**
4. Add an app role with **Analyst** or **Admin** access
5. Go to **System Users** again, click the user, then **Generate Token**
6. Select your app (or create one), choose token duration (~60 days or no expiration)
7. Grant these permissions:
   - ✓ `ads_management`
   - ✓ `business_management`
   - ✓ `offline_access` (keeps token fresh for 60 days)
8. Copy the token (long alphanumeric string, ~200+ chars)

### Step 2: Configure Environment Variables

**Client (Vercel) - `client/.env.example`:**
```bash
# Get from Meta Events Manager > Pixel Settings
VITE_META_PIXEL_ID=123456789012345

# Optional: For testing without affecting production data
VITE_META_TEST_EVENT_CODE=TEST123456
```

**Server (Render) - `server/.env.example`:**
```bash
# Long-lived access token (KEEP SECURE!)
META_ACCESS_TOKEN=your_token_here_200plus_chars

# Same Pixel ID as client
META_PIXEL_ID=123456789012345

# Optional
META_BUSINESS_ACCOUNT_ID=your_account_id
META_API_VERSION=v18.0
META_DEBUG_EVENTS=false
```

### Step 3: Install Client Files

Files already created in your project:

```
client/
  src/
    lib/
      metaPixelEvents.js       # Core event tracking utilities
    hooks/
      useMetaPixel.js          # React hooks for events
    App.jsx                    # Modified to initialize Pixel
```

### Step 4: Install Server Files

Files already created:

```
server/
  src/
    lib/
      metaCAPITracker.js       # CAPI integration class
    controllers/
      eventsController.js      # Route handlers
    routes/
      events.js                # API endpoints
    index.js                   # Modified to include routes
```

### Step 5: Update package.json (if needed)

Most dependencies already installed. If missing:

**Client:** No new dependencies needed (uses built-in Crypto API)

**Server:** Verify these exist in `server/package.json`:
```json
{
  "dependencies": {
    "node-fetch": "^3.0.0"  // For fetch() in Node.js (if not using import)
  }
}
```

If using `import fetch from 'node-fetch'` in the Tracker, ensure it's installed:
```bash
cd server
npm install node-fetch
```

---

## Integration in Components

### 1. Initialize Pixel (Already done in App.jsx)

The `App.jsx` is already updated with:

```jsx
import { useInitializeMetaPixel, useTrackPageView } from './hooks/useMetaPixel';

export const App = () => {
  // Initialize Meta Pixel on app load
  useInitializeMetaPixel();

  // Track page views automatically on route change
  useTrackPageView();

  // ... rest of component
};
```

### 2. Track Product View (in ProductDetail.jsx)

```jsx
import { useTrackViewContent } from '../hooks/useMetaPixel';

export const ProductDetail = () => {
  const trackProduct = useTrackViewContent();

  useEffect(() => {
    // Track when product details load
    if (product) {
      trackProduct({
        id: product._id,
        title: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
      });
    }
  }, [product, trackProduct]);

  return (
    // Product details JSX
  );
};
```

### 3. Track Cart Actions (in Cart.jsx)

```jsx
import { useTrackAddToCart } from '../hooks/useMetaPixel';

export const Cart = () => {
  const trackAddCart = useTrackAddToCart();

  const handleAddToCart = (item) => {
    // Add to Redux cart
    dispatch(addToCart(item));

    // Track event
    trackAddCart({
      id: item._id,
      title: item.name,
      price: item.price,
      quantity: item.quantity,
    });

    // Show toast notification
    toast.success('Added to cart');
  };

  return (
    // Cart JSX
  );
};
```

### 4. Track Checkout Initiation (in Checkout.jsx)

```jsx
import { useTrackInitiateCheckout } from '../hooks/useMetaPixel';

export const Checkout = () => {
  const trackCheckout = useTrackInitiateCheckout();

  useEffect(() => {
    // Track when checkout page loads
    const cartItems = useSelector(state => state.cart.items);
    const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartItems.length > 0) {
      trackCheckout({
        items: cartItems,
        value: totalValue,
        currency: 'USD',
      });
    }
  }, []);

  return (
    // Checkout form JSX
  );
};
```

### 5. Track Purchase (Conversion) - Backend Integration

**Option A: Track on client after order success**

```jsx
import { useTrackPurchase } from '../hooks/useMetaPixel';

export const Checkout = () => {
  const trackPurchase = useTrackPurchase();

  const handleOrderSuccess = (orderData) => {
    // Track purchase event
    trackPurchase({
      orderId: orderData._id,
      items: orderData.items,
      value: orderData.totalPrice,
      currency: 'USD',
    });

    // Redirect to success page
    navigate('/order-success');
  };
};
```

**Option B: Track on server after order creation (more reliable)**

In `server/src/controllers/orderController.js`:

```javascript
import MetaCAPITracker from '../lib/metaCAPITracker.js';

const metaCAPITracker = new MetaCAPITracker(
  process.env.META_ACCESS_TOKEN,
  process.env.META_PIXEL_ID
);

export const createOrder = async (req, res) => {
  try {
    // ... order creation logic

    const newOrder = await Order.create({
      userId: req.user._id,
      items: req.body.items,
      totalPrice: req.body.totalPrice,
      // ... other fields
    });

    // Track purchase via CAPI
    const eventId = `order_${newOrder._id}`;
    await metaCAPITracker.trackEvent(
      'Purchase',
      {
        order_id: newOrder._id.toString(),
        items: newOrder.items,
        total_value: newOrder.totalPrice,
        currency: 'USD',
        userId: req.user._id,
        email: req.user.email,
      },
      eventId,
      req
    );

    res.json({ success: true, orderId: newOrder._id });
  } catch (error) {
    logger.error('Order creation error', { error: error.message });
    res.status(500).json({ error: 'Failed to create order' });
  }
};
```

### 6. Track Lead Events (WhatsApp Click)

```jsx
import { useTrackLead } from '../hooks/useMetaPixel';

export const ProductDetail = () => {
  const trackLead = useTrackLead();

  const handleWhatsAppClick = () => {
    // Track lead before navigating
    trackLead({
      type: 'whatsapp',
      phone: '+1234567890', // Optional
    });

    // Open WhatsApp
    window.open('https://wa.me/1234567890?text=Hi, I\'m interested in this watch');
  };

  const handleInquirySubmit = (formData) => {
    trackLead({
      type: 'inquiry_form',
      email: formData.email,
    });

    // Submit form
  };

  return (
    <div>
      <button onClick={handleWhatsAppClick}>Chat on WhatsApp</button>
      {/* ... */}
    </div>
  );
};
```

---

## Event Tracking Reference

### All Available Events

| Event | Hook | Fires On | Key Data |
|-------|------|----------|----------|
| **PageView** | `useTrackPageView()` | Route change | Page URL |
| **ViewContent** | `useTrackViewContent()` | Product detail load | Product ID, title, price |
| **AddToCart** | `useTrackAddToCart()` | Add to cart click | Product ID, quantity, price |
| **InitiateCheckout** | `useTrackInitiateCheckout()` | Checkout page load | Items, total, currency |
| **Purchase** | `useTrackPurchase()` | Order success | Order ID, items, amount |
| **Lead** | `useTrackLead()` | WhatsApp/inquiry submit | Lead type, contact info |

### Event Data Structure

**ViewContent:**
```javascript
{
  id: "product_123",              // Product ID
  title: "Rolex Submariner",      // Product name
  price: 15000,                   // Price in USD
  category: "diving",             // Category
  image: "https://..."            // Image URL (optional)
}
```

**Purchase (most critical):**
```javascript
{
  orderId: "order_abc123",
  items: [
    { id: "prod_1", title: "Watch 1", price: 5000, quantity: 1 },
    { id: "prod_2", title: "Watch 2", price: 10000, quantity: 1 }
  ],
  value: 15000,
  currency: "USD"
}
```

---

## Deployment (Vercel + Render)

### Vercel Deployment (Client)

#### 1. Setup Environment Variables

Go to **Vercel Dashboard > Project Settings > Environment Variables**

Add:
```
VITE_META_PIXEL_ID = 123456789012345
VITE_META_TEST_EVENT_CODE = TEST123456  (optional)
```

Apply to: **Production, Preview, Development**

#### 2. Deploy

```bash
git add .
git commit -m "Add Meta Pixel integration"
git push
```

Vercel auto-deploys on push. Verify in [Events Manager](https://business.facebook.com/events_manager).

### Render Deployment (Server)

#### 1. Setup Environment Variables

Go to **Render Dashboard > Select Service > Environment**

Add **Secrets** (not in code):
```
META_ACCESS_TOKEN = your_long_lived_token
META_PIXEL_ID = 123456789012345
```

#### 2. Update render.yaml (if using IaC)

```yaml
services:
  - type: web
    name: sa3ati-backend
    env: node
    envVars:
      - key: META_ACCESS_TOKEN
        scope: run
      - key: META_PIXEL_ID
        scope: run
```

#### 3. Deploy

```bash
git push
```

Render auto-deploys on push to the configured branch.

#### 4. Verify

Test the tracking endpoint:
```bash
curl -X POST https://your-render-api.onrender.com/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "PageView",
    "eventId": "test-123",
    "eventData": { "page": "/" }
  }'
```

Should return:
```json
{ "success": true, "data": { "events_received": 1 } }
```

---

## Testing & Debugging

### Testing in Meta Events Manager

1. Go to [Meta Events Manager](https://business.facebook.com/events_manager/)
2. Click your Pixel
3. Go to **Test Events**
4. Copy the **Test Event Code**
5. Add to `.env.local`:
   ```
   VITE_META_TEST_EVENT_CODE=YOUR_CODE
   ```

Events sent with Test Event Code appear in **Test Events** tab (real-time, no data delay).

### Debugging Tools

#### Browser Console (Network Tab)

```javascript
// Check if Pixel initialized
window.fbq
// Returns: function fbq() { ... }

// Check event IDs (deduplication)
localStorage.__getItem('meta_event_Purchase')
// Returns: [{ id: 'event-123', timestamp: ... }]

// Manual event test
fbq('track', 'AddToCart', { value: 100, currency: 'USD' })
```

#### Server Logs (Render)

Enable debug logging:
```bash
# .env
META_DEBUG_EVENTS=true
```

Logs will show:
```
INFO Event tracked successfully {
  eventId: "timestamp-random",
  eventName: "AddToCart",
  userId: "user_123",
  success: true
}
```

#### Check Deduplication

```javascript
// Browser - localStorage events
Object.keys(localStorage).filter(k => k.startsWith('meta_event_'))

// Server - in-memory cache (development only)
// For production, check Redis/Memcached
```

#### Meta Webhook (Optional - Advanced)

[Set up Real-time Updates](https://developers.facebook.com/docs/graph-api/webhooks/getting-started) to receive event confirmations:

```javascript
app.post('/webhook', (req, res) => {
  const { entry } = req.body;
  entry.forEach(item => {
    item.changes.forEach(change => {
      if (change.field === 'events') {
        console.log('Event confirmed:', change.value);
        // Update analytics dashboard, send alerts, etc.
      }
    });
  });
  res.sendStatus(200);
});
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| **Event delivery rate** | Meta Events Manager | < 90% |
| **API errors** | Render logs | Any 5xx |
| **Token expiration** | Render env settings | 30 days before |
| **Dedup hit rate** | Server logs | > 5% duplicates |
| **Event queue size** | /api/events/status | > 100 pending |

### Setup Monitoring

#### Sentry (Error Tracking)

1. Install: `npm install @sentry/node`
2. Initialize in `server/src/index.js`:
   ```javascript
   import * as Sentry from "@sentry/node";
   Sentry.init({ dsn:process.env.SENTRY_DSN });
   ```
3. Add Render webhook to send logs to Sentry

#### Simple Email Alerts (Render + Cron)

Create a cron job that checks token expiration:

```javascript
// server/src/crons/checkMetaToken.js
import cron from 'node-cron';
import nodemailer from 'nodemailer';

cron.schedule('0 9 * * *', async () => {
  const daysLeft = calculateTokenExpiry();
  if (daysLeft <= 30) {
    sendEmailAlert(
      'admin@sa3ati.com',
      `⚠️ Meta Access Token expires in ${daysLeft} days`
    );
  }
});
```

---

## Privacy & Compliance

### GDPR Compliance

✅ **Hashing PII** - Emails, phones hashed with SHA-256  
✅ **Consent Required** - Add consent banner before tracking  
✅ **User Rights** - Implement data deletion on request  
✅ **Data Processing** - Meta's DPA covers GDPR  

**Add Consent Banner:**

```jsx
import { useState, useEffect } from 'react';

export const ConsentBanner = () => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('pixel_consent');
    if (!consent) {
      // Show banner
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('pixel_consent', 'true');
    setAccepted(true);
    // Initialize Pixel
    import('../lib/metaPixelEvents').then(m => m.initializeMetaPixel());
  };

  return !accepted ? (
    <div className="consent-banner">
      <p>We use Meta Pixel to improve your experience</p>
      <button onClick={handleAccept}>Accept</button>
    </div>
  ) : null;
};
```

### CCPA Compliance

✅ **Opt-out Support** - Users can opt out of tracking  
✅ **Data Sale Opt-out** - Honor `user_data.opt_out = true`  
✅ **Transparency** - Privacy policy mentions Meta  

**Add Opt-out:**

```javascript
// Disable tracking
const disableMataTracking = () => {
  localStorage.setItem('pixel_optout', 'true');
  window.fbq('consent', 'revoke');
};

// Check on app load
if (localStorage.getItem('pixel_optout')) {
  window.fbq('consent', 'revoke');
}
```

### Data Security

- **Access Token**: Never expose in frontend (already server-side only ✓)
- **PII Hashing**: SHA-256 hashing of emails/phones (already implemented ✓)
- **HTTPS Only**: Both Vercel and Render use HTTPS ✓
- **Redis/Memcached**: Use for production dedup cache (not in-memory)

---

## Troubleshooting

### Events Not Appearing in Meta Events Manager

**Symptom:** No events showing after 10+ minutes

**Fixes (in order):**
1. ✅ Verify Pixel ID is correct (copy-paste from Meta)
2. ✅ Check Console: `window.fbq` should exist
3. ✅ Check Network tab: fbevents request should return 200
4. ✅ Use Test Event code to isolate from production data
5. ✅ Check server logs: `/api/events/track` being called?

**Most Common:** Pixel ID mismatch between frontend & backend

### Events Show 0 Conversion Value

**Symptom:** Events tracked but marked $0

**Fixes:**
1. ✅ Ensure `value` field is numeric, not string ("100" → 100)
2. ✅ Ensure `currency` is set ("USD", not "usd")
3. ✅ Check event payload: Log `eventData` before sending

**Example Wrong:**
```javascript
{ value: "100", currency: "usd" }  // ❌ String value, lowercase currency
```

**Correct:**
```javascript
{ value: 100, currency: "USD" }    // ✓ Numeric value, uppercase currency
```

### Token Expired / "Invalid Token"

**Symptom:** `{ error: "Invalid OAuth token" }`

**Fixes:**
1. ✅ Go to Business Settings > Users > System Users
2. ✅ Check token expiration date
3. ✅ Generate new token if expired
4. ✅ Update `META_ACCESS_TOKEN` in Render Secrets
5. ✅ Redeploy: `git push` (triggers Render redeploy)

**Prevention:** Set token to 60-day or no expiration, auto-rotate quarterly

### Duplicate Events in Meta

**Symptom:** Same purchase tracked twice

**Fixes:**
1. ✅ Ensure unique `eventId` for each event (using `generateEventId()`)
2. ✅ Check localStorage `meta_event_*` for dedup cache
3. ✅ Verify server dedup not bypassed

**Test:**
```javascript
window.fbq('track', 'Purchase', {
  eventID: 'unique_id_' + Date.now()  // Must be unique!
})
```

### High API Error Rate (>10% failures)

**Symptom:** Server logs showing failed event posts to Meta

**Fixes:**
1. ✅ Check token permissions: `ads_management`, `business_management`
2. ✅ Check API rate limits (Meta: 1000 req/sec per token)
3. ✅ Check Render uptime (occasional cold starts)
4. ✅ Check server logs for details: `META_DEBUG_EVENTS=true`

**Monitor:**
```bash
curl https://your-api.onrender.com/api/events/status
# Shows: queuedEvents count, when retries happen
```

### "Test" Button in Admin Panel to Verify

```jsx
// admin/AdminDashboard.jsx
const handleTestPixel = async () => {
  const testEventId = `test_${Date.now()}`;
  const result = await fetch('/api/events/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName: 'PageView',
      eventId: testEventId,
      eventData: { page: '/admin/dashboard' }
    })
  });
  const data = await result.json();
  console.log('Test event result:', data);
  alert(data.success ? '✓ Pixel working!' : '✗ Check logs');
};

return <button onClick={handleTestPixel}>Test Pixel</button>;
```

---

## Next Steps

1. ✅ Get Meta credentials (Pixel ID + Access Token)
2. ✅ Configure environment variables
3. ✅ Test locally: `npm run dev` (client & server)
4. ✅ Check browser console for Pixel initialization
5. ✅ Trigger test events in development
6. ✅ Deploy to staging (Vercel + Render)
7. ✅ Verify in Meta Events Manager (Test Events tab)
8. ✅ Deploy to production
9. ✅ Monitor via Render logs + Meta dashboard
10. ✅ Setup alerts for token expiration & errors

---

## Support & References

- [Meta Pixel Documentation](https://developers.facebook.com/docs/facebook-pixel)
- [Conversion API Reference](https://developers.facebook.com/docs/marketing-api/conversion-api)
- [Events Manager](https://business.facebook.com/events_manager/)
- [Business Settings](https://business.facebook.com/settings/)

---

**Last Updated:** February 2026  
**Status:** Production-Ready  
**Version:** 1.0
