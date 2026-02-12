# Link Click Tracking Integration Guide

This guide explains how to integrate link click tracking into your components to monitor user engagement and lead generation.

## Overview

The link click tracking system consists of:
- **Backend API**: `/api/link-clicks` endpoints for tracking and analytics
- **React Hook**: `useLinkClickTracking` for easy integration
- **Admin Dashboard**: `/control-panel/link-clicks` for viewing statistics
- **Database**: MongoDB `LinkClick` collection storing all tracked events

## Setup

The tracking system is already integrated and ready to use. No additional configuration needed.

## Usage Examples

### 1. Track WhatsApp Link Click (ProductDetail page)

```jsx
import { useLinkClickTracking } from '../hooks/useLinkClickTracking';

const ProductDetail = () => {
  const { trackLinkClick } = useLinkClickTracking();
  const product = useSelector(state => state.products.currentProduct);

  const handleWhatsAppClick = async () => {
    // Track the click
    await trackLinkClick('whatsapp', product._id, `https://wa.me/971XXXXXXX`);
    
    // Open WhatsApp
    window.open(`https://wa.me/971XXXXXXX?text=I'm interested in ${product.name}`, '_blank');
  };

  return (
    <button 
      onClick={handleWhatsAppClick}
      className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
    >
      💬 Chat on WhatsApp
    </button>
  );
};
```

### 2. Track Email Link Click

```jsx
import { useLinkClickTracking } from '../hooks/useLinkClickTracking';

const ContactSection = ({ productId }) => {
  const { trackLinkClick } = useLinkClickTracking();

  const handleEmailClick = async () => {
    await trackLinkClick('email', productId, 'mailto:sales@sa3ati.com');
    window.location.href = 'mailto:sales@sa3ati.com';
  };

  return (
    <a 
      onClick={handleEmailClick}
      href="mailto:sales@sa3ati.com"
      className="text-blue-500 hover:underline"
    >
      📧 Email Us
    </a>
  );
};
```

### 3. Track Phone Call Click

```jsx
import { useLinkClickTracking } from '../hooks/useLinkClickTracking';

const CallButton = ({ productId, phoneNumber }) => {
  const { trackAndNavigate } = useLinkClickTracking();

  return (
    <button
      onClick={() => trackAndNavigate(`tel:${phoneNumber}`, 'phone', productId, false)}
      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
    >
      📞 Call Now
    </button>
  );
};
```

### 4. Track Inquiry Form Submission

```jsx
import { useRef } from 'react';
import { useLinkClickTracking } from '../hooks/useLinkClickTracking';

const InquiryForm = ({ productId }) => {
  const { trackAndSubmitForm } = useLinkClickTracking();
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Track before submitting
    await trackAndSubmitForm(formRef.current, 'inquiry_form', productId);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} action="/api/inquiries">
      <input type="email" placeholder="Your email" required />
      <textarea placeholder="Your message" required></textarea>
      <button type="submit" className="bg-luxury-gold text-white px-6 py-2 rounded">
        Send Inquiry
      </button>
    </form>
  );
};
```

### 5. Track External Link Click

```jsx
import { useLinkClickTracking } from '../hooks/useLinkClickTracking';

const ExternalLinkButton = ({ productId, url, label }) => {
  const { trackAndNavigate } = useLinkClickTracking();

  return (
    <button
      onClick={() => trackAndNavigate(url, 'other', productId)}
      className="text-blue-500 hover:underline"
    >
      {label} →
    </button>
  );
};
```

## Link Types

The system supports tracking these link types:

| Type | Use Case | Example |
|------|----------|---------|
| `'whatsapp'` | WhatsApp Business messaging | Product inquiries, support |
| `'email'` | Email contact | Customer support, sales inquiries |
| `'phone'` | Phone calls | Direct calls from mobile or desktop |
| `'inquiry_form'` | Form submissions | Contact forms, feedback forms |
| `'other'` | Any other external link | Downloads, external resources |

## Advanced: Without Hook

For contexts where you can't use the hook (e.g., event listeners, third-party integrations):

```jsx
import { trackLinkClickStandalone } from '../hooks/useLinkClickTracking';

// Event listener example
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('tracked-link')) {
    const linkType = e.target.dataset.linkType;
    const productId = e.target.dataset.productId;
    const destination = e.target.href;
    
    await trackLinkClickStandalone(linkType, productId, destination);
  }
});
```

## Admin Dashboard

View all tracked link clicks at `/control-panel/link-clicks`:

- **Statistics**: View total clicks, breakdown by link type, top products, today's activity
- **Filters**: Filter by link type (WhatsApp, Email, Phone, etc.)
- **Pagination**: Browse through records efficiently (50 per page)
- **Details**: See full tracking info including user, date, source page, destination
- **Management**: 
  - Delete individual records
  - Reset all data with confirmation dialog
  - Timestamps for audit trail

## Data Tracked

Each link click records:
- `linkType` - Type of link (whatsapp, email, phone, inquiry_form, other)
- `productId` - Associated product ID (if applicable)
- `productName` - Associated product name (if applicable)
- `destination` - Target URL, phone number, or email
- `source` - Current page URL and referrer
- `userAgent` - Browser/device information
- `ipAddress` - User's IP address (for analytics)
- `userId` - Logged-in user ID (if authenticated)
- `timestamp` - Exact time of click with timezone

## Best Practices

1. **Always use await**: Even though tracking is fire-and-forget, await the promise for consistency
   ```jsx
   await trackLinkClick('whatsapp', productId, url);
   ```

2. **Include product context**: Pass `productId` when tracking from product pages for better analytics
   ```jsx
   trackLinkClick('email', product._id, 'mailto:...');
   ```

3. **Use appropriate link types**: Choose the right type for accurate categorization
   ```jsx
   // ✅ Good
   trackLinkClick('whatsapp', productId, url);
   
   // ❌ Avoid generic 'other' when specific types available
   trackLinkClick('other', productId, url);
   ```

4. **Handle errors gracefully**: The system fails silently, but you might want logging in dev mode
   ```jsx
   const { trackLinkClick } = useLinkClickTracking();
   // System already logs to console in development mode
   ```

## Integration Checklist

Ready to integrate? Check off as you go:

- [ ] `useLinkClickTracking` hook is available in `hooks/`
- [ ] Admin dashboard is accessible at `/control-panel/link-clicks`
- [ ] Backend API is running with link-clicks routes mounted
- [ ] MongoDB LinkClick collection is created (auto-created on first track)
- [ ] Integrate tracking in **ProductDetail.jsx** for WhatsApp/Email clicks
- [ ] Integrate tracking in **Cart.jsx** for inquiry clicks
- [ ] Integrate tracking in **Shop.jsx** for product card CTAs
- [ ] Test tracking end-to-end:
  1. Click a tracked element
  2. Check browser network tab for POST to `/api/link-clicks/track`
  3. Verify record appears in admin dashboard
  4. Confirm statistics update correctly

## Troubleshooting

### Records not appearing in dashboard?

1. Make sure backend is running
2. Check browser console for errors (should be silent)
3. Verify API endpoint is responding: `GET /api/link-clicks`
4. Check database connection with `mongosh`

### Statistics not updating?

1. Wait a few seconds for server to process
2. Try refreshing the admin page with `F5`
3. Check server logs for aggregation errors

### Tracking not firing?

1. Verify hook is imported: `import { useLinkClickTracking } from '../hooks/useLinkClickTracking'`
2. Ensure component is inside Redux provider (for user context)
3. Check network tab in DevTools (POST request should be sent)
4. Verify `VITE_API_URL` environment variable is set correctly

## API Reference

### POST /api/link-clicks/track

Track a single link click.

```javascript
POST /api/link-clicks/track

Body:
{
  "linkType": "whatsapp",
  "productId": "667a1b2c3d4e5f6g7h8i9j0k",
  "destination": "https://wa.me/971XXXXXXX",
  "source": {
    "page": "/product/667a1b2c3d4e5f6g7h8i9j0k",
    "referrer": "https://google.com/search?q=luxury+watches"
  }
}

Response:
{
  "success": true,
  "trackingId": "667a1b2c3d4e5f6g7h8i9j0k",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### GET /api/link-clicks

Get tracked link clicks with optional filters.

```javascript
GET /api/link-clicks?linkType=whatsapp&productId=667a1b2c3d4e5f6g7h8i9j0k&page=1&limit=50

Response:
{
  "data": [
    {
      "_id": "667a1b2c3d4e5f6g7h8i9j0k",
      "linkType": "whatsapp",
      "productId": "667a1b2c3d4e5f6g7h8i9j0k",
      "productName": "Rolex Submariner",
      "destination": "https://wa.me/971XXXXXXX",
      "source": { "page": "/product/xyz", "referrer": "google.com" },
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-01-15T10:30:45.123Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 3
}
```

### GET /api/link-clicks/stats

Get analytics and statistics.

```javascript
GET /api/link-clicks/stats

Response:
{
  "byType": {
    "whatsapp": 245,
    "email": 89,
    "phone": 56,
    "inquiry_form": 120,
    "other": 34
  },
  "byDate": [
    { "date": "2024-01-15", "count": 123 },
    { "date": "2024-01-14", "count": 98 },
    ...
  ],
  "topProducts": [
    { "productId": "xyz", "productName": "Rolex Submariner", "clicks": 45 },
    { "productId": "abc", "productName": "Omega Speedmaster", "clicks": 38 },
    ...
  ]
}
```

### DELETE /api/link-clicks

Reset all tracking data (admin only).

```javascript
DELETE /api/link-clicks

Response:
{
  "success": true,
  "deletedCount": 544
}
```

### DELETE /api/link-clicks/:id

Delete a single tracking record (admin only).

```javascript
DELETE /api/link-clicks/667a1b2c3d4e5f6g7h8i9j0k

Response:
{
  "success": true,
  "message": "Link click deleted"
}
```

## Performance Considerations

- Tracking is **non-blocking** - doesn't slow down user experience
- Stats aggregation uses MongoDB pipelines for efficiency
- Indexes are automatically created on key fields:
  - `linkType` + `createdAt` (commonly filtered)
  - `productId` (product-specific analytics)
  - `createdAt` (time-range queries)
- Pagination handles large datasets gracefully (50-200 records per page)

## Privacy & Compliance

- IP addresses are recorded but can be anonymized by administrators
- User identifiers are linked to existing auth system
- Timestamp tracking enables audit trails
- No PII beyond what's in the user's account
- All data is stored securely in MongoDB with indexes
