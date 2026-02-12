/**
 * Meta Pixel Events Configuration & Utilities
 * Hybrid tracking approach: Browser Pixel + Server-side Conversion API
 * Event deduplication using eventIDs to prevent duplicate counting
 */

// Event type constants
export const META_EVENTS = {
  PAGE_VIEW: 'PageView',
  VIEW_CONTENT: 'ViewContent',
  ADD_TO_CART: 'AddToCart',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  PURCHASE: 'Purchase',
  LEAD: 'Lead',
};

/**
 * Generate unique event ID for deduplication
 * Format: timestamp-random (ensures uniqueness across browser & server)
 */
export const generateEventId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
};

/**
 * Track PageView event
 * Browser: Automatic via Pixel (if initialized)
 * Server: Optional manual trigger for SPA navigation tracking
 */
export const trackPageView = (eventId = null) => {
  if (typeof window !== 'undefined' && fbq) {
    const id = eventId || generateEventId();
    fbq('track', META_EVENTS.PAGE_VIEW, { eventID: id });
    return id;
  }
};

/**
 * Track ViewContent event (product detail page view)
 * Sends product data for targeting & optimization
 *
 * @param {Object} product - Product data
 * @param {string} product.id - Product ID
 * @param {string} product.title - Product title
 * @param {number} product.price - Product price
 * @param {string} product.category - Product category
 * @param {string} product.image - Product image URL
 * @param {string} eventId - Optional event ID for deduplication
 */
export const trackViewContent = (product, eventId = null) => {
  if (typeof window === 'undefined' || !fbq) return null;

  const id = eventId || generateEventId();

  const eventData = {
    eventID: id,
    content_name: product.title,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'USD',
    content_category: product.category,
  };

  fbq('track', META_EVENTS.VIEW_CONTENT, eventData);

  // Store event ID for server-side deduplication
  storeEventId(id, META_EVENTS.VIEW_CONTENT);

  return id;
};

/**
 * Track AddToCart event
 * Sends cart item data for retargeting
 *
 * @param {Object} item - Cart item data
 * @param {string} item.id - Product ID
 * @param {string} item.title - Product title
 * @param {number} item.price - Product price
 * @param {number} item.quantity - Quantity added
 * @param {string} eventId - Optional event ID for deduplication
 */
export const trackAddToCart = (item, eventId = null) => {
  if (typeof window === 'undefined' || !fbq) return null;

  const id = eventId || generateEventId();

  const eventData = {
    eventID: id,
    content_name: item.title,
    content_ids: [item.id],
    content_type: 'product',
    value: item.price * (item.quantity || 1),
    currency: 'USD',
    num_items: item.quantity || 1,
  };

  fbq('track', META_EVENTS.ADD_TO_CART, eventData);

  // Store event ID for server-side deduplication
  storeEventId(id, META_EVENTS.ADD_TO_CART);

  return id;
};

/**
 * Track InitiateCheckout event
 * Sent when user proceeds to checkout
 *
 * @param {Object} checkoutData - Checkout information
 * @param {Array} checkoutData.items - Array of items in cart
 * @param {number} checkoutData.value - Total cart value
 * @param {string} checkoutData.currency - Currency code
 * @param {string} eventId - Optional event ID for deduplication
 */
export const trackInitiateCheckout = (checkoutData, eventId = null) => {
  if (typeof window === 'undefined' || !fbq) return null;

  const id = eventId || generateEventId();

  const eventData = {
    eventID: id,
    content_name: 'Checkout',
    content_ids: checkoutData.items.map(item => item.id),
    content_type: 'product_group',
    value: checkoutData.value,
    currency: checkoutData.currency || 'USD',
    num_items: checkoutData.items.length,
  };

  fbq('track', META_EVENTS.INITIATE_CHECKOUT, eventData);

  // Store event ID for server-side deduplication
  storeEventId(id, META_EVENTS.INITIATE_CHECKOUT);

  return id;
};

/**
 * Track Purchase event (conversion)
 * Critical event for measuring ROI
 *
 * @param {Object} purchaseData - Purchase details
 * @param {string} purchaseData.orderId - Order ID
 * @param {Array} purchaseData.items - Array of purchased items
 * @param {number} purchaseData.value - Order total
 * @param {string} purchaseData.currency - Currency code
 * @param {string} eventId - Optional event ID for deduplication
 */
export const trackPurchase = (purchaseData, eventId = null) => {
  if (typeof window === 'undefined' || !fbq) return null;

  const id = eventId || generateEventId();

  const eventData = {
    eventID: id,
    content_name: 'Purchase',
    content_ids: purchaseData.items.map(item => item.id),
    content_type: 'product_group',
    value: purchaseData.value,
    currency: purchaseData.currency || 'USD',
    num_items: purchaseData.items.length,
  };

  fbq('track', META_EVENTS.PURCHASE, eventData);

  // Store event ID for server-side deduplication
  storeEventId(id, META_EVENTS.PURCHASE);

  return id;
};

/**
 * Track Lead event (WhatsApp click, inquiry form, etc.)
 * Used for lead generation campaigns
 *
 * @param {Object} leadData - Lead information
 * @param {string} leadData.type - Lead type (e.g., 'whatsapp', 'inquiry')
 * @param {string} leadData.phone - Phone number (optional, hashed by Pixel)
 * @param {string} eventId - Optional event ID for deduplication
 */
export const trackLead = (leadData, eventId = null) => {
  if (typeof window === 'undefined' || !fbq) return null;

  const id = eventId || generateEventId();

  const eventData = {
    eventID: id,
    content_name: `Lead - ${leadData.type}`,
    content_type: 'lead',
  };

  // Include optional hashed contact data if provided
  if (leadData.phone) {
    eventData.phone = hashPhoneForMeta(leadData.phone);
  }
  if (leadData.email) {
    eventData.em = hashEmailForMeta(leadData.email);
  }

  fbq('track', META_EVENTS.LEAD, eventData);

  // Store event ID for server-side deduplication
  storeEventId(id, META_EVENTS.LEAD);

  return id;
};

/**
 * Hash phone number with SHA-256 for Meta CAPI compliance
 * Normalizes phone: removes non-numeric, country code
 *
 * @param {string} phone - Raw phone number
 * @returns {string} - SHA-256 hashed phone
 */
const hashPhoneForMeta = async (phone) => {
  const normalized = phone.replace(/\D/g, '');
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash email with SHA-256 for Meta CAPI compliance
 * Normalizes email: lowercase, trim whitespace
 *
 * @param {string} email - Raw email address
 * @returns {string} - SHA-256 hashed email
 */
const hashEmailForMeta = async (email) => {
  const normalized = email.toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Send server-side Conversion API event (for deduplication & backup)
 * This ensures events are recorded even if Pixel is blocked
 *
 * @param {string} eventName - Event name (from META_EVENTS)
 * @param {Object} eventData - Event data payload
 * @param {string} eventId - Unique event ID for deduplication
 */
export const sendServerEvent = async (eventName, eventData, eventId) => {
  try {
    const response = await fetch('/api/events/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventData,
        eventId,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.warn(`Server event tracking failed: ${response.status}`);
    }

    return response.ok;
  } catch (error) {
    console.error('Error sending server event:', error);
    return false;
  }
};

/**
 * Store event ID in localStorage for deduplication
 * Prevents duplicate events from being sent within 24 hours
 *
 * @param {string} eventId - Event ID to store
 * @param {string} eventType - Type of event
 */
const storeEventId = (eventId, eventType) => {
  if (typeof window === 'undefined') return;

  const key = `meta_event_${eventType}`;
  const events = JSON.parse(localStorage.getItem(key) || '[]');

  // Keep only events from last 24 hours
  const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
  const recentEvents = events.filter(e => e.timestamp > cutoffTime);

  recentEvents.push({
    id: eventId,
    timestamp: Date.now(),
  });

  localStorage.setItem(key, JSON.stringify(recentEvents));
};

/**
 * Check if event ID was already tracked (deduplication)
 *
 * @param {string} eventId - Event ID to check
 * @param {string} eventType - Type of event
 * @returns {boolean} - True if event was already tracked
 */
export const hasEventBeenTracked = (eventId, eventType) => {
  if (typeof window === 'undefined') return false;

  const key = `meta_event_${eventType}`;
  const events = JSON.parse(localStorage.getItem(key) || '[]');

  return events.some(e => e.id === eventId);
};

/**
 * Clear old event IDs from localStorage (cleanup)
 * Call periodically to prevent localStorage bloat
 */
export const cleanupOldEventIds = () => {
  if (typeof window === 'undefined') return;

  const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('meta_event_')) {
      const events = JSON.parse(localStorage.getItem(key) || '[]');
      const recentEvents = events.filter(e => e.timestamp > cutoffTime);
      localStorage.setItem(key, JSON.stringify(recentEvents));
    }
  });
};

/**
 * Initialize Meta Pixel (must be called before any events)
 * This should be called in main.jsx or App.jsx
 *
 * @param {string} pixelId - Your Meta Pixel ID
 */
export const initializeMetaPixel = (pixelId) => {
  if (typeof window === 'undefined') return;

  // Prevent double initialization
  if (window.fbq) return;

  // Meta Pixel initialization code
  (function () {
    window.fbq = function () {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, arguments)
        : window.fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = [];
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  })();

  // Initialize pixel with ID
  fbq('init', pixelId);

  // Track initial page view
  fbq('track', 'PageView');

  console.log(`Meta Pixel initialized with ID: ${pixelId}`);
};

export default {
  META_EVENTS,
  generateEventId,
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  trackLead,
  sendServerEvent,
  hasEventBeenTracked,
  cleanupOldEventIds,
  initializeMetaPixel,
};
