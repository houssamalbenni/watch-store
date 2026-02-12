# Meta Pixel Integration - Quick Reference Card

## 🔑 Get Credentials (Once)

```
Pixel ID → Meta Events Manager > Pixel Settings > Copy ID

Access Token → Business Settings > Users > System Users
  • Create user or select existing
  • Generate Token with:
    ✓ ads_management
    ✓ business_management  
    ✓ offline_access
  • Copy token (long alphanumeric string)
```

---

## ⚙️ Configure Environment

**Client (`client/.env.local`):**
```bash
VITE_META_PIXEL_ID=123456789012345
```

**Server (`server/.env`):**
```bash
META_ACCESS_TOKEN=eaab...your_token
META_PIXEL_ID=123456789012345
```

---

## 🏗️ Files Structure

```
✓ client/src/lib/metaPixelEvents.js     # Already created
✓ client/src/hooks/useMetaPixel.js      # Already created
✓ client/src/App.jsx                    # Already updated
✓ server/src/lib/metaCAPITracker.js     # Already created
✓ server/src/controllers/eventsController.js
✓ server/src/routes/events.js
✓ server/src/index.js                   # Already updated
```

---

## 📌 Common Implementation Patterns

### Pattern 1: Track Product View
```jsx
import { useTrackViewContent } from '../hooks/useMetaPixel';

const trackProduct = useTrackViewContent();

// When product loads:
trackProduct({
  id: product._id,
  title: product.name,
  price: product.price,
  category: product.category,
});
```

### Pattern 2: Track Add to Cart
```jsx
import { useTrackAddToCart } from '../hooks/useMetaPixel';

const trackCart = useTrackAddToCart();

// On add button click:
trackCart({
  id: item._id,
  title: item.name,
  price: item.price,
  quantity: 1,
});
```

### Pattern 3: Track Purchase (MOST IMPORTANT)
```jsx
import { useTrackPurchase } from '../hooks/useMetaPixel';

const trackPurchase = useTrackPurchase();

// On order success:
trackPurchase({
  orderId: order._id,
  items: [...cart items],
  value: totalPrice,
  currency: 'USD',
});
```

### Pattern 4: Track Lead (WhatsApp/Form)
```jsx
import { useTrackLead } from '../hooks/useMetaPixel';

const trackLead = useTrackLead();

// On WhatsApp click or form submit:
trackLead({
  type: 'whatsapp'  // or 'inquiry_form', 'email_contact', etc.
});
```

---

## 🧪 Test Locally (Browser Console)

```javascript
// Check 1: Pixel initialized?
typeof fbq === 'function'  // Should be: true

// Check 2: Test event
fbq('track', 'PageView')

// Check 3: Check localStorage dedup
Object.keys(localStorage).filter(k => k.startsWith('meta_event_'))

// Check 4: Test API endpoint
fetch('/api/events/status').then(r => r.json()).then(console.log)
```

---

## 📊 Events Quick Reference

| Event | Hook | Fires On | Key Data |
|-------|------|----------|----------|
| PageView | Auto | Route change | Page URL |
| ViewContent | `useTrackViewContent()` | Product detail | Product ID, price |
| AddToCart | `useTrackAddToCart()` | Add button | Product, qty |
| InitiateCheckout | `useTrackInitiateCheckout()` | Checkout page | Items, total |
| **Purchase** | `useTrackPurchase()` | Order success | **Order ID, amount** |
| Lead | `useTrackLead()` | WhatsApp/form | Lead type |

---

## ✅ Deployment Checklist (Quick)

```
LOCAL TESTING:
☐ typeof fbq === 'function' works
☐ Events in localStorage
☐ Server logs show events
☐ No console errors

VERCEL (CLIENT):
☐ Add VITE_META_PIXEL_ID to Environment Variables
☐ git push (auto-deploys)
☐ Check production URL, browser console

RENDER (SERVER):
☐ Add META_ACCESS_TOKEN & META_PIXEL_ID to Secrets
☐ Click "Redeploy"
☐ Check server logs for "Event tracked" messages

VERIFY:
☐ Meta Events Manager shows TestEvents
☐ All event types appearing
☐ No errors in Render logs
☐ Ready for marketing campaigns!
```

---

## 🐛 Quick Troubleshooting

| Issue | Check | Fix |
|-------|-------|-----|
| Pixel not initialized | `typeof fbq` in console | Verify `VITE_META_PIXEL_ID` set |
| Events not in Meta | Use Test Event code | Copy from Events Manager |
| Token error | Server logs | Regenerate token in Business Settings |
| Duplicate events | Check localStorage dedup | Don't manually set eventID |
| API 500 error | Render logs | Check token permissions |

---

## 🔐 Security Reminders

✅ **DO:**
- Store token in Render Secrets (not .env in code)
- Use dedicated system user (not personal)
- Hash PII before sending (done auto)
- Rotate tokens quarterly
- Monitor token expiration

❌ **DON'T:**
- Commit .env with token to git
- Share token in Slack/email
- Use test accounts for production
- Set debug mode in production
- Send unhashed sensitive data

---

## 📈 Next After Deployment

**Day 1:**
- Monitor Render logs for errors
- Check Meta Events Manager daily

**Week 1:**
- Let events accumulate (need 50+ conversions)
- Build lookalike audiences based on converters
- Setup ad campaigns targeting Purchase events

**Ongoing:**
- Monitor deduplication working (no double counts)
- Check for high error rates
- Review token expiration date (renew 30 days before)

---

## 🔗 Quick Links

| Need | Link |
|------|------|
| Create Pixel | https://business.facebook.com/events_manager/ |
| Get Token | https://business.facebook.com/settings/ |
| Monitor Events | https://business.facebook.com/events_manager/ > Real-time View |
| Full Docs | See META_PIXEL_INTEGRATION.md |
| Examples | See IMPLEMENTATION_EXAMPLES.md |
| Deploy Guide | See DEPLOYMENT_CHECKLIST.md |
| Testing | See TESTING_GUIDE.md |

---

## 📞 API Endpoints (Server)

```bash
# Track single event
POST /api/events/track
Body: { eventName, eventData, eventId }

# Track purchase (special)
POST /api/events/purchase
Body: { orderId, items, value, currency, eventId }

# Batch track
POST /api/events/batch
Body: { events: [...] }

# Check status
GET /api/events/status
Response: { queuedEvents, pixelConfigured, ... }

# Retry failed events (admin)
POST /api/events/retry-queue
```

---

## ⏱️ Time Estimates

| Task | Time |
|------|------|
| Get credentials | 10 min |
| Setup env variables | 5 min |
| Test locally | 10 min |
| Deploy to Vercel | 2 min |
| Deploy to Render | 2 min |
| Verify in Meta | 5 min |
| **Total** | **~35 min** |

---

## 💾 Current Status

✅ Core files already created and integrated:
- metaPixelEvents.js (browser utilities)
- useMetaPixel.js (React hooks)
- metaCAPITracker.js (server handler)
- Event routes & controllers

🚀 Ready to:
1. Set environment variables
2. Test locally
3. Deploy to production
4. Start tracking conversions

---

## 🎯 Success Metrics

Track these after deployment:

```
✓ Events reaching Meta: Check Events Manager > Real-time
✓ Deduplication working: Events in localStorage match Meta count
✓ No errors: Check Render logs for "success: true"
✓ Purchase value: Verify $ amount correct in Meta
✓ Conversion rate: Via Meta Ads Manager dashboard
```

---

**Last Updated:** February 12, 2026  
**Status:** Production-Ready  
**Questions?** See full documentation files
