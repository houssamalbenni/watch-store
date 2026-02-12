# Meta Pixel Testing & Debugging Guide

Production-ready testing strategies for Meta Pixel + Conversion API hybrid tracking.

## Quick Start Testing

### 1. Verify Pixel Installation (5 minutes)

**Browser Console:**
```javascript
// Check 1: Pixel script loaded
typeof fbq === 'function'
// Expected: true

// Check 2: Can track event
fbq('track', 'PageView')
// Expected: No console error

// Check 3: LocalStorage dedup cache
JSON.parse(localStorage.getItem('meta_event_PageView'))
// Expected: [{ id: "...", timestamp: ... }]
```

**Network Tab:**
```
1. Open DevTools > Network
2. Filter: "fbevents.js"
3. Should see: Status 200, from graph.facebook.com
4. Trigger event (visit product page)
5. Check for POST to connect.facebook.net
```

### 2. Test Server Connection (2 minutes)

**API Test:**
```bash
# Test endpoint
curl -X POST http://localhost:5000/api/events/track \
  -H "Content-Type: application/json" \
  -d '{
    "eventName": "PageView",
    "eventId": "test-'$(date +%s)'",
    "eventData": { "page": "/test" }
  }'

# Expected response:
# { "success": true, "data": { "events_received": 1 } }
```

**Server Console:**
```
Node.js logs should show:
INFO Event tracked successfully {
  eventId: "...",
  eventName: "PageView",
  success: true
}
```

---

## Meta Events Manager Testing

### Step-by-Step: Verify Events in Meta

1. **Open Events Manager**
   - Go to: https://business.facebook.com/events_manager/
   - Select your Pixel

2. **Test Events Tab (Recommended)**
   - Click: **"Test Events"** button (top right)
   - Verify: Your event code shows
   - Click: **Copy** to clipboard
   - Add to `.env.local`: `VITE_META_TEST_EVENT_CODE=...`
   - Restart dev server: `npm run dev`

3. **Trigger Test Events**
   - **PageView**: Just load the app
   - **ViewContent**: Visit product detail page
   - **AddToCart**: Click "Add to Cart" button
   - **InitiateCheckout**: Go to checkout page
   - **Lead**: Click WhatsApp/inquiry button

4. **Verify in Real-time View**
   - Go back to Events Manager
   - Click: **"Real-time View"** tab
   - Events appear within 30 seconds
   - Click event to see details (product name, price, etc.)

5. **Check Event Data**
   - **PageView**: Should show page parameter
   - **ViewContent**: Should show product ID, name, price
   - **AddToCart**: Should show quantity
   - **Purchase**: Should show order ID, value, currency

---

## Automated Test Suite

### Using JavaScript (Browser Testing)

Create `test-pixel.js` for testing:

```javascript
/**
 * Meta Pixel Test Suite
 * Run in browser console to validate tracking
 */

class PixelTester {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  // Test 1: Pixel initialized
  testPixelInit() {
    const test = 'Pixel Initialization';
    try {
      if (typeof fbq === 'function') {
        this.log('✓', test, 'fbq() function exists');
        this.passed++;
      } else {
        this.log('✗', test, 'fbq() not found. Pixel not loaded!');
        this.failed++;
      }
    } catch (e) {
      this.log('✗', test, e.message);
      this.failed++;
    }
  }

  // Test 2: LocalStorage dedup tracking
  testLocalStorageDedup() {
    const test = 'LocalStorage Deduplication';
    try {
      const eventKeys = Object.keys(localStorage).filter(k => k.startsWith('meta_event_'));
      if (eventKeys.length > 0) {
        this.log('✓', test, `${eventKeys.length} event type(s) tracked`);
        this.passed++;
      } else {
        this.log('⚠', test, 'No events in localStorage (first visit?)');
      }
    } catch (e) {
      this.log('✗', test, e.message);
      this.failed++;
    }
  }

  // Test 3: Manual event tracking
  testManualTracking() {
    const test = 'Manual Event Tracking';
    try {
      const eventId = `test_${Date.now()}`;
      fbq('track', 'PageView', { eventID: eventId });
      this.log('✓', test, `Event tracked with ID: ${eventId}`);
      this.passed++;
    } catch (e) {
      this.log('✗', test, e.message);
      this.failed++;
    }
  }

  // Test 4: API connectivity
  async testAPIConnectivity() {
    const test = 'API Connectivity';
    try {
      const response = await fetch('/api/events/status');
      const data = await response.json();
      if (data.success) {
        this.log('✓', test, `API OK. Queued: ${data.tracking.queuedEvents}`);
        this.passed++;
      } else {
        this.log('✗', test, 'API returned error');
        this.failed++;
      }
    } catch (e) {
      this.log('✗', test, `${e.message} (Is backend running?)`);
      this.failed++;
    }
  }

  // Test 5: Server event tracking
  async testServerTracking() {
    const test = 'Server Event Tracking';
    try {
      const response = await fetch('/api/events/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'PageView',
          eventId: `test_${Date.now()}`,
          eventData: { page: '/test' }
        })
      });
      const data = await response.json();
      if (data.success) {
        this.log('✓', test, 'Event sent to server successfully');
        this.passed++;
      } else {
        this.log('✗', test, data.error || 'Unknown error');
        this.failed++;
      }
    } catch (e) {
      this.log('✗', test, e.message);
      this.failed++;
    }
  }

  // Utility: Pretty print results
  log(icon, test, message) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`${icon} [${timestamp}] ${test}: ${message}`);
  }

  // Run all tests
  async runAll() {
    console.clear();
    console.log('%c🔍 Meta Pixel Test Suite', 'font-size: 16px; font-weight: bold; color: #1877F2');
    console.log('================================\n');

    this.testPixelInit();
    this.testLocalStorageDedup();
    this.testManualTracking();
    await this.testAPIConnectivity();
    await this.testServerTracking();

    // Results
    console.log('\n================================');
    console.log(`%c✓ Passed: ${this.passed}  ✗ Failed: ${this.failed}`, 
      `font-weight: bold; color: ${this.failed === 0 ? 'green' : 'red'}`);
    console.log('================================\n');
  }
}

// Run tests
const tester = new PixelTester();
await tester.runAll();
```

**Usage:**
```javascript
// In browser console, paste the test suite
// Then run:
const tester = new PixelTester();
await tester.runAll();

// Output:
// ✓ Pixel Initialization: fbq() function exists
// ✓ LocalStorage Deduplication: 5 event type(s) tracked
// ✓ Manual Event Tracking: Event tracked with ID: test_1708xxx
// ✓ API Connectivity: API OK. Queued: 0
// ✓ Server Event Tracking: Event sent to server successfully
```

---

## Component-Level Testing

### Test ViewContent Event

Add this to `src/pages/ProductDetail.jsx`:

```jsx
// Debug mode for testing
const DEBUG_TRACKING = false;

export const ProductDetail = () => {
  const trackProduct = useTrackViewContent();
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (product && DEBUG_TRACKING) {
      console.log('[TRACKING] ViewContent Event:', {
        productId: product._id,
        productName: product.name,
        price: product.price,
        category: product.category,
      });

      trackProduct({
        id: product._id,
        title: product.name,
        price: product.price,
        category: product.category,
      });
    }
  }, [product, trackProduct]);

  return (
    <div>
      {DEBUG_TRACKING && <div className="test-badge">DEBUG</div>}
      {/* Product content */}
    </div>
  );
};
```

### Test Purchase Event (E2E)

Create `test-purchase.js` script:

```javascript
/**
 * E2E Test: Complete Purchase Flow
 * Run manually or in automated testing (Cypress, Playwright)
 */

async function testPurchaseFlow() {
  console.log('🛒 Starting purchase flow test...');

  // Step 1: Navigate to shop
  window.location.href = '/shop';
  await new Promise(r => setTimeout(r, 2000));

  // Step 2: Add to cart
  const addButton = document.querySelector('[data-test="add-to-cart"]');
  addButton.click();
  console.log('✓ Clicked Add to Cart');
  await new Promise(r => setTimeout(r, 1000));

  // Step 3: Go to checkout
  window.location.href = '/checkout';
  await new Promise(r => setTimeout(r, 2000));

  // Step 4: Fill and submit
  const emailInput = document.querySelector('input[type="email"]');
  emailInput.value = 'test@example.com';
  
  const submitButton = document.querySelector('[data-test="place-order"]');
  submitButton.click();
  console.log('✓ Placed order');

  // Step 5: Verify tracking
  await new Promise(r => setTimeout(r, 2000));
  const dedupEvents = JSON.parse(localStorage.getItem('meta_event_Purchase') || '[]');
  console.log('✓ Dedup cache:', dedupEvents.length, 'events');
  console.log('✓ Test complete - check Meta Events Manager for Purchase event');
}

// Run: testPurchaseFlow()
```

---

## Cypress Integration Testing

### Setup Cypress

```bash
npm install --save-dev cypress
npx cypress open
```

### Test: ViewContent Event

Create `cypress/e2e/pixel-viewcontent.cy.js`:

```javascript
describe('Meta Pixel - ViewContent Event', () => {
  beforeEach(() => {
    cy.visit('/shop');
  });

  it('should track ViewContent event when viewing product', () => {
    // Navigate to product detail
    cy.get('[data-testid="product-card"]').first().click();

    // Verify ViewContent event
    cy.window().then(win => {
      const events = JSON.parse(win.localStorage.getItem('meta_event_ViewContent') || '[]');
      expect(events.length).to.be.greaterThan(0);
      expect(events[0]).to.have.property('id');
      expect(events[0]).to.have.property('timestamp');
    });

    // Verify API call
    cy.intercept('POST', '/api/events/track', req => {
      expect(req.body.eventName).to.equal('ViewContent');
      expect(req.body.eventId).to.exist;
    }).as('trackEvent');

    cy.wait('@trackEvent');
  });

  it('should send deduped events to server', () => {
    cy.visit('/product/123');

    // API should track with eventID
    cy.intercept('POST', '/api/events/track', req => {
      expect(req.body).to.have.property('eventId');
      req.reply({ success: true });
    }).as('trackEvent');

    cy.wait('@trackEvent').then(interception => {
      expect(interception.response.statusCode).to.equal(200);
      expect(interception.response.body.success).to.be.true;
    });
  });
});
```

### Test: Purchase Event

Create `cypress/e2e/pixel-purchase.cy.js`:

```javascript
describe('Meta Pixel - Purchase Event', () => {
  it('should track Purchase event on successful order', () => {
    cy.login('test@example.com', 'password');
    cy.visit('/shop');

    // Add to cart
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart"]').click();

    // Go to checkout
    cy.visit('/checkout');

    // Fill form & submit (adjust selectors to your app)
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="address"]').type('123 Main St');
    cy.get('[data-testid="place-order"]').click();

    // Verify Purchase event tracked
    cy.window().then(win => {
      const events = JSON.parse(win.localStorage.getItem('meta_event_Purchase') || '[]');
      expect(events.length).to.equal(1);
    });

    // Verify server received Purchase event
    cy.intercept('POST', '/api/events/purchase', req => {
      expect(req.body).to.have.property('orderId');
      expect(req.body).to.have.property('items');
      expect(req.body).to.have.property('value');
      expect(req.body.value).to.be.greaterThan(0);
    }).as('purchaseEvent');

    cy.wait('@purchaseEvent');
  });

  it('should not duplicate Purchase events', () => {
    let callCount = 0;

    cy.intercept('POST', '/api/events/track', req => {
      if (req.body.eventName === 'Purchase') {
        callCount++;
      }
      req.reply({ success: true });
    }).as('trackEvent');

    // Complete purchase
    cy.login();
    cy.visit('/checkout');
    cy.get('[data-testid="place-order"]').click();

    // Wait and check
    cy.wait('@trackEvent');
    cy.then(() => {
      // Should only track Purchase once, not twice (client + server)
      expect(callCount).to.be.lessThanOrEqual(2); // Allow for both, but dedup should prevent
    });
  });
});
```

### Run Cypress Tests

```bash
# Open Cypress UI
npx cypress open

# Run headless
npx cypress run --spec cypress/e2e/pixel-*.cy.js

# With screenshots
npx cypress run --screenshot
```

---

## Performance Testing

### Monitor Event Tracking Impact

```javascript
/**
 * Measure impact of event tracking on page load
 */

// Before tracking events
const beforeTime = performance.now();

// Execute actions that trigger tracking
fbq('track', 'PageView');
fbq('track', 'ViewContent', { value: 100, currency: 'USD' });

// After
const afterTime = performance.now();
console.log(`Event tracking took: ${(afterTime - beforeTime).toFixed(2)}ms`);
// Should be < 5ms for all events

// Check Core Web Vitals not impacted
console.log('Largest Contentful Paint:', performance.getEntriesByName('largest-contentful-paint'));
console.log('First Input Delay:', performance.getEntriesByName('first-input'));
```

### Load Test API Endpoint

```bash
# Using Apache Bench
ab -n 1000 -c 10 -p payload.json -T application/json http://localhost:5000/api/events/track

# Using wrk
wrk -t4 -c100 -d30s --script=post.lua http://localhost:5000/api/events/track
```

---

## Common Test Scenarios

### Scenario 1: Test Event with Different Currencies

```javascript
fbq('track', 'AddToCart', {
  value: 100,
  currency: 'EUR'  // Different from default USD
});

// Check Meta Events Manager shows "EUR"
```

### Scenario 2: Test Batch Events

```javascript
const events = [
  { eventName: 'PageView', eventId: 'e1', eventData: {} },
  { eventName: 'ViewContent', eventId: 'e2', eventData: { product_id: '123' } },
  { eventName: 'AddToCart', eventId: 'e3', eventData: { value: 50 } }
];

fetch('/api/events/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ events })
})
.then(r => r.json())
.then(data => console.log('Batch result:', data));
```

### Scenario 3: Test Retry Logic

```javascript
// Temporarily disable internet, trigger event
// Check server queue: GET /api/events/status
// Should show queuedEvents > 0

// Re-enable internet
// Server should retry automatically
// Queue should clear within 30 seconds
```

### Scenario 4: Test Token Expiration

```javascript
// In .env temporarily set invalid token
META_ACCESS_TOKEN = invalid_token_12345

// Trigger event
fbq('track', 'PageView');

// Check error in console
// Server logs show: { error: "Invalid OAuth token" }

// Verify event queued: GET /api/events/status
// After fixing token, events should retry
```

---

## Debugging Tools

### 1. Meta Pixel Helper Extension

- Download: [Chrome Web Store](https://chrome.google.com/webstore/detail/meta-pixel-helper/)
- Shows all events being tracked
- Displays pixel ID, conversion IDs
- Real-time event debugger

### 2. Network Monitoring

**Chrome DevTools - Network Tab:**
```
1. Open DevTools (F12)
2. Go to Network tab
3. Filter: "facebook.com" or "graph.facebook"
4. Trigger events
5. See POST requests to Meta APIs
```

**Check Request Headers:**
- `X-Forwarded-For`: Client IP
- `User-Agent`: Browser info
- Request size: Usually 1-3 KB

**Check Response:**
```json
{
  "events_received": 1,
  "pixel_data": {...}
}
```

### 3. Console Commands for Debugging

```javascript
// Log all pixel events
console.log('Tracked events:', window.fbq);

// Get pixel ID
fbq('getPixelID');
// Returns: "123456789012345"

// Check localStorage
Object.keys(localStorage).filter(k => k.includes('meta'))

// Monitor network requests
let eventCount = 0;
const observer = new PerformanceObserver(list => {
  list.getEntries().forEach(entry => {
    if (entry.name.includes('facebook.com')) {
      eventCount++;
      console.log(`[${eventCount}] Event sent:`, entry.name, entry.duration.toFixed(0) + 'ms');
    }
  });
});
observer.observe({ entryTypes: ['resource', 'measure'] });
```

### 4. Server Debug Logging

```bash
# In .env
META_DEBUG_EVENTS=true

# Restart server
npm run dev

# Server logs now show detailed event info:
# DEBUG EventData {
#   eventID: "timestamp-random",
#   content_ids: ["prod_123"],
#   value: "100.00",
#   currency: "USD"
# }
```

---

## Troubleshooting Decision Tree

```
Events not showing?
├─ Pixel ID correct?
│  ├─ No → Fix Pixel ID in env
│  └─ Yes → Continue
├─ fbq() initialized?
│  ├─ typeof fbq === 'function' → Yes → Continue
│  └─ No → Check fbevents.js loaded
├─ Events in localStorage?
│  ├─ Yes → continue
│  └─ No → Check browser console errors
├─ API returning success?
│  ├─ POST /api/events/track → 200? → Yes → Continue
│  └─ No → Check server logs
├─ Events in Meta?
│  ├─ Show in Test Events tab? → Yes → Done! ✓
│  └─ No → Allow 2-3 minutes, refresh
└─ Still not showing?
   └─ Check pixel not blocked by ad blocker
```

---

## Sign-Off & Results

After completing all tests:

- [ ] Pixel initialized successfully ✓
- [ ] Events tracked locally (localStorage) ✓
- [ ] Server receiving events (API 200) ✓
- [ ] Events in Meta Events Manager ✓
- [ ] Deduplication working ✓
- [ ] No console errors ✓
- [ ] No performance impact (< 5ms) ✓
- [ ] All event types tracking ✓
- [ ] Ready for production ✓

**Test Date:** ______________  
**Tester:** ______________  
**Notes:** ______________

---

**Last Updated:** February 2026
