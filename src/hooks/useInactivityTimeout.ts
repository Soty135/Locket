import { useEffect, useRef, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const INACTIVITY_TIMEOUT = 60 * 1000;

export function useInactivityTimeout(enabled: boolean = true) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const logout = useCallback(async () => {
    clearTimeout();
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Auto-logout error:', error);
    }
  }, [clearTimeout]);

  const resetTimer = useCallback(() => {
    lastActiveRef.current = Date.now();
    clearTimeout();

    if (enabled) {
      timeoutRef.current = window.setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [enabled, logout, clearTimeout]);

  useEffect(() => {
    if (!enabled) {
      clearTimeout();
      return;
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click', 'wheel'];
    
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActiveRef.current > 100) {
        resetTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const elapsed = Date.now() - lastActiveRef.current;
        const remaining = INACTIVITY_TIMEOUT - elapsed;
        
        clearTimeout();
        
        if (remaining <= 0) {
          logout();
        } else {
          timeoutRef.current = window.setTimeout(() => {
            logout();
          }, remaining);
        }
      } else {
        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed >= INACTIVITY_TIMEOUT) {
          logout();
        } else {
          resetTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout();
    };
  }, [enabled, resetTimer, logout, clearTimeout]);

  return { resetTimer, logout };
}
