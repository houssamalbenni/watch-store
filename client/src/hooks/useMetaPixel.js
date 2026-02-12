/**
 * React Hook for Meta Pixel event tracking
 * Provides declarative event tracking in React components
 * Includes automatic cleanup and error handling
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initializeMetaPixel,
  trackPageView,
  trackViewContent,
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
  trackLead,
  sendServerEvent,
  hasEventBeenTracked,
  cleanupOldEventIds,
  generateEventId,
  META_EVENTS,
} from '../lib/metaPixelEvents';

/**
 * Initialize Meta Pixel on app mount
 * Usage: useInitializeMetaPixel()
 */
export const useInitializeMetaPixel = () => {
  useEffect(() => {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID;

    if (!pixelId) {
      console.warn('VITE_META_PIXEL_ID not configured in environment variables');
      return;
    }

    initializeMetaPixel(pixelId);

    // Cleanup old event IDs periodically
    const cleanupInterval = setInterval(cleanupOldEventIds, 60 * 60 * 1000); // Every hour

    return () => clearInterval(cleanupInterval);
  }, []);
};

/**
 * Automatic PageView tracking on route changes
 * Usage: useTrackPageView()
 */
export const useTrackPageView = () => {
  const location = useLocation();

  useEffect(() => {
    // Small delay to ensure page content is rendered
    const timer = setTimeout(() => {
      const eventId = generateEventId();
      trackPageView(eventId);

      // Also send to server for analytics
      sendServerEvent(META_EVENTS.PAGE_VIEW, { page: location.pathname }, eventId);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);
};

/**
 * Hook for ViewContent event tracking
 * Usage: const trackProduct = useTrackViewContent();
 *        trackProduct(productData);
 */
export const useTrackViewContent = () => {
  return useCallback((product) => {
    if (!product?.id) {
      console.warn('Product data required for ViewContent event');
      return null;
    }

    const eventId = generateEventId();

    // Check for duplicates
    if (hasEventBeenTracked(eventId, META_EVENTS.VIEW_CONTENT)) {
      console.warn('ViewContent event already tracked');
      return null;
    }

    try {
      // Browser tracking
      trackViewContent(product, eventId);

      // Server tracking for backup & analytics
      sendServerEvent(
        META_EVENTS.VIEW_CONTENT,
        {
          product_id: product.id,
          product_name: product.title,
          price: product.price,
          category: product.category,
          timestamp: new Date().toISOString(),
        },
        eventId
      );

      return eventId;
    } catch (error) {
      console.error('Error tracking ViewContent event:', error);
      return null;
    }
  }, []);
};

/**
 * Hook for AddToCart event tracking
 * Usage: const trackCart = useTrackAddToCart();
 *        trackCart(cartItem);
 */
export const useTrackAddToCart = () => {
  return useCallback((item) => {
    if (!item?.id) {
      console.warn('Item data required for AddToCart event');
      return null;
    }

    const eventId = generateEventId();

    // Check for duplicates
    if (hasEventBeenTracked(eventId, META_EVENTS.ADD_TO_CART)) {
      console.warn('AddToCart event already tracked');
      return null;
    }

    try {
      // Browser tracking
      trackAddToCart(item, eventId);

      // Server tracking
      sendServerEvent(
        META_EVENTS.ADD_TO_CART,
        {
          product_id: item.id,
          product_name: item.title,
          price: item.price,
          quantity: item.quantity || 1,
          timestamp: new Date().toISOString(),
        },
        eventId
      );

      return eventId;
    } catch (error) {
      console.error('Error tracking AddToCart event:', error);
      return null;
    }
  }, []);
};

/**
 * Hook for InitiateCheckout event tracking
 * Usage: const trackCheckout = useTrackInitiateCheckout();
 *        trackCheckout(checkoutData);
 */
export const useTrackInitiateCheckout = () => {
  return useCallback((checkoutData) => {
    if (!checkoutData?.items?.length) {
      console.warn('Checkout data with items required for InitiateCheckout event');
      return null;
    }

    const eventId = generateEventId();

    // Check for duplicates
    if (hasEventBeenTracked(eventId, META_EVENTS.INITIATE_CHECKOUT)) {
      console.warn('InitiateCheckout event already tracked');
      return null;
    }

    try {
      // Browser tracking
      trackInitiateCheckout(checkoutData, eventId);

      // Server tracking
      sendServerEvent(
        META_EVENTS.INITIATE_CHECKOUT,
        {
          items: checkoutData.items.map(item => ({
            product_id: item.id,
            product_name: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
          total_value: checkoutData.value,
          currency: checkoutData.currency || 'USD',
          timestamp: new Date().toISOString(),
        },
        eventId
      );

      return eventId;
    } catch (error) {
      console.error('Error tracking InitiateCheckout event:', error);
      return null;
    }
  }, []);
};

/**
 * Hook for Purchase event tracking (conversion)
 * Usage: const trackPurchase = useTrackPurchase();
 *        trackPurchase(purchaseData);
 */
export const useTrackPurchase = () => {
  return useCallback((purchaseData) => {
    if (!purchaseData?.orderId || !purchaseData?.items?.length) {
      console.warn('Order ID and items required for Purchase event');
      return null;
    }

    const eventId = generateEventId();

    // Check for duplicates
    if (hasEventBeenTracked(eventId, META_EVENTS.PURCHASE)) {
      console.warn('Purchase event already tracked');
      return null;
    }

    try {
      // Browser tracking
      trackPurchase(purchaseData, eventId);

      // Server tracking - CRITICAL for conversion attribution
      sendServerEvent(
        META_EVENTS.PURCHASE,
        {
          order_id: purchaseData.orderId,
          items: purchaseData.items.map(item => ({
            product_id: item.id,
            product_name: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
          total_value: purchaseData.value,
          currency: purchaseData.currency || 'USD',
          timestamp: new Date().toISOString(),
        },
        eventId
      );

      console.log(`Purchase event tracked: Order ${purchaseData.orderId}`);
      return eventId;
    } catch (error) {
      console.error('Error tracking Purchase event:', error);
      return null;
    }
  }, []);
};

/**
 * Hook for Lead event tracking (WhatsApp, inquiry, etc.)
 * Usage: const trackLead = useTrackLead();
 *        trackLead({ type: 'whatsapp', phone: '+1234567890' });
 */
export const useTrackLead = () => {
  return useCallback((leadData) => {
    if (!leadData?.type) {
      console.warn('Lead type required for Lead event');
      return null;
    }

    const eventId = generateEventId();

    // Check for duplicates
    if (hasEventBeenTracked(eventId, META_EVENTS.LEAD)) {
      console.warn('Lead event already tracked');
      return null;
    }

    try {
      // Browser tracking
      trackLead(leadData, eventId);

      // Server tracking
      sendServerEvent(
        META_EVENTS.LEAD,
        {
          lead_type: leadData.type,
          timestamp: new Date().toISOString(),
        },
        eventId
      );

      console.log(`Lead event tracked: ${leadData.type}`);
      return eventId;
    } catch (error) {
      console.error('Error tracking Lead event:', error);
      return null;
    }
  }, []);
};

export default {
  useInitializeMetaPixel,
  useTrackPageView,
  useTrackViewContent,
  useTrackAddToCart,
  useTrackInitiateCheckout,
  useTrackPurchase,
  useTrackLead,
};
