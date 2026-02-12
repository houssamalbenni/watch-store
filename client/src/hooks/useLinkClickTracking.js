import axios from 'axios';
import { useSelector } from 'react-redux';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Hook for tracking user link clicks for lead generation
 * Logs clicks to WhatsApp, Email, Phone, Inquiry Forms, and Other external links
 *
 * @example
 * const { trackLinkClick } = useLinkClickTracking();
 *
 * // Track WhatsApp click
 * <button onClick={() => trackLinkClick('whatsapp', productId, 'https://wa.me/...')}>
 *   Contact via WhatsApp
 * </button>
 *
 * // Track Email click
 * <a onClick={() => trackLinkClick('email', null, 'mailto:...')}>
 *   Email Us
 * </a>
 */
export const useLinkClickTracking = () => {
  const { user } = useSelector((state) => state.auth);

  /**
   * Track a link click event
   *
   * @param {string} linkType - Type of link: 'whatsapp', 'email', 'phone', 'inquiry_form', 'other'
   * @param {string} productId - Product ID if click is from product page (optional)
   * @param {string} destination - Target URL or contact info
   * @param {string} source - Source page name (optional, detected from window.location if not provided)
   * @returns {Promise<void>}
   */
  const trackLinkClick = async (linkType, productId, destination, source = null) => {
    try {
      // Detect source page if not provided
      const sourcePage = source || window.location.pathname;

      const payload = {
        linkType,
        destination,
        source: {
          page: sourcePage,
          referrer: document.referrer || 'direct',
        },
      };

      // Add optional fields
      if (productId) {
        payload.productId = productId;
      }

      // Send tracking request to backend
      const response = await axios.post(`${API_URL}/link-clicks/track`, payload);

      // Silently log success in development
      if (import.meta.env.DEV) {
        console.log(`✓ Link click tracked: ${linkType}`, {
          trackingId: response.data.trackingId,
          timestamp: response.data.timestamp,
        });
      }

      return response.data;
    } catch (error) {
      // Silently fail - don't interrupt user experience
      if (import.meta.env.DEV) {
        console.warn('Failed to track link click:', error.message);
      }
      // Don't throw - let the link/action proceed regardless
    }
  };

  /**
   * Track and navigate to external link
   *
   * @param {string} url - External URL to navigate to
   * @param {string} linkType - Type of link
   * @param {string} productId - Product ID (optional)
   * @param {boolean} openNewTab - Open in new tab (default: true)
   */
  const trackAndNavigate = async (url, linkType, productId = null, openNewTab = true) => {
    // Track the click
    await trackLinkClick(linkType, productId, url);

    // Navigate
    if (openNewTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  };

  /**
   * Track and submit form
   *
   * @param {HTMLFormElement} form - Form element to submit
   * @param {string} formType - Type of form (e.g., 'inquiry_form', 'newsletter')
   * @param {string} productId - Product ID (optional)
   */
  const trackAndSubmitForm = async (form, formType = 'inquiry_form', productId = null) => {
    // Track before submission
    await trackLinkClick(formType, productId, form.action || window.location.href);

    // Submit form
    form.submit();
  };

  return {
    trackLinkClick,
    trackAndNavigate,
    trackAndSubmitForm,
  };
};

/**
 * Standalone tracking function (doesn't require hook)
 * Use this for tracking outside of React components
 *
 * @example
 * trackLinkClickStandalone('whatsapp', productId, 'https://wa.me/...')
 */
export const trackLinkClickStandalone = async (linkType, productId, destination, source = null) => {
  try {
    const sourcePage = source || window.location.pathname;

    const payload = {
      linkType,
      destination,
      source: {
        page: sourcePage,
        referrer: document.referrer || 'direct',
      },
    };

    if (productId) {
      payload.productId = productId;
    }

    const response = await axios.post(`${API_URL}/link-clicks/track`, payload);

    if (import.meta.env.DEV) {
      console.log(`✓ Link click tracked: ${linkType}`, response.data);
    }

    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to track link click:', error.message);
    }
  }
};

export default useLinkClickTracking;
