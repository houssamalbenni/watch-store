import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Generate a unique visitor ID (persistent across sessions)
const getVisitorId = () => {
  let visitorId = localStorage.getItem('sa3ati_visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sa3ati_visitor_id', visitorId);
  }
  return visitorId;
};

// Generate a session ID (cleared when browser closes)
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sa3ati_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sa3ati_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Hook to automatically track page views
 * Call this in App.jsx to track all page visits
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const visitorId = getVisitorId();
        const sessionId = getSessionId();
        const page = location.pathname + location.search;
        const referrer = document.referrer || '';

        // Send tracking data to backend
        await axios.post(`${API_URL}/analytics/track`, {
          visitorId,
          sessionId,
          page,
          referrer,
        });

        // Log in development
        if (import.meta.env.DEV) {
          console.log('📊 Page tracked:', page);
        }
      } catch (error) {
        // Silently fail - don't interrupt user experience
        if (import.meta.env.DEV) {
          console.warn('Failed to track page view:', error.message);
        }
      }
    };

    // Track the page view
    trackPageView();
  }, [location.pathname, location.search]);
};

export default usePageTracking;
