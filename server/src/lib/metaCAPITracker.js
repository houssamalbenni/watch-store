/**
 * Meta Conversion API Integration
 * Server-side event tracking for deduplication, backup, and enhanced data
 *
 * Features:
 * - Event deduplication using eventID
 * - Server-side parameter enrichment (user IP, user agent, hashed emails)
 * - Error handling and retry logic
 * - Event queuing for failed sends
 * - Privacy-compliant hashing
 */

import crypto from 'crypto';
import logger from '../config/logger.js';

/**
 * Meta CAPI Event class
 * Encapsulates event data and handles validation
 */
class MetaCAPIEvent {
  constructor(eventName, eventData, eventId, request = null) {
    this.eventName = eventName;
    this.eventData = eventData;
    this.eventId = eventId;
    this.request = request;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Build CAPI event payload
   * Includes normalized parameters and user context enrichment
   */
  buildPayload(accessToken, pixelId) {
    const userData = this.buildUserData(this.request);
    const customData = this.buildCustomData(this.eventData);

    const event = {
      event_name: this.eventName,
      event_id: this.eventId,
      event_time: Math.floor(Date.now() / 1000), // Unix timestamp
      event_source_url: this.request?.headers?.referer || 'backend-api',
      user_data: userData,
      custom_data: customData,
      opt_out: false,
    };

    return {
      data: [event],
      access_token: accessToken,
    };
  }

  /**
   * Build user data object with PII hashing
   * Meta requires hashed values for privacy compliance
   *
   * @param {Object} request - Express request object
   * @returns {Object} - User data with hashed fields
   */
  buildUserData(request) {
    const userData = {};

    // External ID (optional - use user ID from database)
    if (this.eventData.userId) {
      userData.external_id = this.hashValue(this.eventData.userId.toString());
    }

    // Hashed email (SHA-256)
    if (this.eventData.email) {
      userData.em = this.hashValue(this.eventData.email.toLowerCase().trim());
    }

    // Hashed phone (SHA-256, normalized)
    if (this.eventData.phone) {
      const normalized = this.eventData.phone.replace(/\D/g, '');
      userData.ph = this.hashValue(normalized);
    }

    // User agent (optional but recommended)
    if (request?.headers['user-agent']) {
      userData.ua = request.headers['user-agent'];
    }

    // Client IP address
    if (request) {
      userData.client_ip_address =
        request.headers['x-forwarded-for']?.split(',')[0].trim() ||
        request.socket.remoteAddress ||
        '0.0.0.0';
    }

    // Click ID (for Facebook Ads tracking)
    if (this.eventData.fbclid) {
      userData.fbc = `fb.1.${Date.now()}.${this.eventData.fbclid}`;
    }

    // Browser ID (FBP) from Pixel cookie
    if (this.eventData.fbp) {
      userData.fbp = this.eventData.fbp;
    }

    return userData;
  }

  /**
   * Build custom data object
   * Maps product info and purchase data
   *
   * @param {Object} eventData - Event specific data
   * @returns {Object} - Custom data payload
   */
  buildCustomData(eventData) {
    const customData = {};

    // Value and currency (for optimization)
    if (eventData.total_value !== undefined) {
      customData.value = parseFloat(eventData.total_value).toFixed(2);
      customData.currency = eventData.currency || 'USD';
    } else if (eventData.price !== undefined) {
      customData.value = parseFloat(eventData.price).toFixed(2);
      customData.currency = eventData.currency || 'USD';
    }

    // Product details
    if (eventData.product_id) {
      customData.content_ids = [eventData.product_id.toString()];
      customData.content_name = eventData.product_name || 'Product';
      customData.content_type = 'product';
    }

    if (eventData.items?.length) {
      customData.content_ids = eventData.items.map(item => item.product_id.toString());
      customData.num_items = eventData.items.length;
      customData.content_type = 'product_group';
    }

    // Order details
    if (eventData.order_id) {
      customData.order_id = eventData.order_id.toString();
    }

    // Quantity
    if (eventData.quantity) {
      customData.num_items = eventData.quantity;
    }

    return customData;
  }

  /**
   * Hash value with SHA-256 for CAPI compliance
   *
   * @param {string} value - Value to hash
   * @returns {string} - Hashed value (hex)
   */
  hashValue(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
  }
}

/**
 * Meta CAPI Tracker - Main class for event management
 */
export class MetaCAPITracker {
  constructor(accessToken, pixelId) {
    this.accessToken = accessToken;
    this.pixelId = pixelId;
    this.apiVersion = 'v18.0';
    this.endpoint = `https://graph.facebook.com/${this.apiVersion}/${pixelId}/events`;

    // Event queue for failed sends (in-memory, use Redis in production)
    this.eventQueue = [];
    this.maxRetries = 3;
    this.retryDelay = 1000; // ms

    // Deduplication cache (in-memory, use Redis in production)
    this.eventDedup = new Set();
    this.dedupTTL = 24 * 60 * 60 * 1000; // 24 hours

    logger.info('MetaCAPITracker initialized', {
      pixelId,
      endpoint: this.endpoint,
    });
  }

  /**
   * Track event with full deduplication and retry logic
   *
   * @param {string} eventName - Event name (e.g., 'Purchase', 'AddToCart')
   * @param {Object} eventData - Event data payload
   * @param {string} eventId - Unique event ID
   * @param {Object} request - Express request object (optional)
   * @returns {Promise<Object>} - Response from Meta CAPI
   */
  async trackEvent(eventName, eventData, eventId, request = null) {
    try {
      // Validate inputs
      if (!eventName || !eventId) {
        throw new Error('Event name and event ID are required');
      }

      // Check deduplication
      if (this.isDuplicate(eventId)) {
        logger.warn('Duplicate event detected', { eventId, eventName });
        return { success: false, error: 'Duplicate event' };
      }

      // Create CAPI event
      const capiEvent = new MetaCAPIEvent(eventName, eventData, eventId, request);

      // Build payload
      const payload = capiEvent.buildPayload(this.accessToken, this.pixelId);

      // Send with retry
      const response = await this.sendWithRetry(payload, 0);

      // Mark event as tracked
      this.addToDedup(eventId);

      logger.info('Event tracked successfully', {
        eventId,
        eventName,
        response: response?.data,
      });

      return { success: true, data: response?.data };
    } catch (error) {
      logger.error('Error tracking event', {
        eventId,
        eventName,
        error: error.message,
      });

      // Queue event for retry (implement with Redis/Bull in production)
      this.eventQueue.push({ eventName, eventData, eventId, request });

      return { success: false, error: error.message };
    }
  }

  /**
   * Send event with retry logic
   *
   * @param {Object} payload - Event payload
   * @param {number} retryCount - Current retry count
   * @returns {Promise<Object>} - Response from Meta API
   */
  async sendWithRetry(payload, retryCount = 0) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: 10000,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        logger.warn(`Retry attempt ${retryCount + 1}/${this.maxRetries}`, {
          error: error.message,
        });

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.sendWithRetry(payload, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Check if event ID was already processed
   * Prevents duplicate sends to Meta
   *
   * @param {string} eventId - Event ID to check
   * @returns {boolean} - True if duplicate
   */
  isDuplicate(eventId) {
    return this.eventDedup.has(eventId);
  }

  /**
   * Add event ID to deduplication cache
   *
   * @param {string} eventId - Event ID to add
   */
  addToDedup(eventId) {
    this.eventDedup.add(eventId);

    // Set TTL cleanup (in production, use Redis with EXPIRE)
    setTimeout(() => {
      this.eventDedup.delete(eventId);
    }, this.dedupTTL);
  }

  /**
   * Get queued events waiting for retry
   *
   * @returns {Array} - Queued events
   */
  getQueuedEvents() {
    return this.eventQueue;
  }

  /**
   * Clear event queue (after successful batch processing)
   */
  clearQueue() {
    this.eventQueue = [];
  }

  /**
   * Retry queued events (call periodically)
   * In production, use a job queue like Bull/BullMQ
   */
  async retryQueuedEvents() {
    if (this.eventQueue.length === 0) return;

    logger.info(`Processing ${this.eventQueue.length} queued events`);

    const failedEvents = [];

    for (const event of this.eventQueue) {
      try {
        const result = await this.trackEvent(
          event.eventName,
          event.eventData,
          event.eventId,
          event.request
        );

        if (!result.success) {
          failedEvents.push(event);
        }
      } catch (error) {
        logger.error('Error processing queued event', { error: error.message });
        failedEvents.push(event);
      }
    }

    // Update queue with failed events
    this.eventQueue = failedEvents;

    logger.info(`Queue processing complete. ${failedEvents.length} events still pending.`);
  }
}

export default MetaCAPITracker;
