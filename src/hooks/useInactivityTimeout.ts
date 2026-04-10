import { useEffect, useRef, useCallback, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const INACTIVITY_TIMEOUT = 60 * 1000;
const WARNING_BEFORE_LOGOUT = 10 * 1000;

interface UseInactivityTimeoutReturn {
  remainingTime: number;
  isWarning: boolean;
  resetTimer: () => void;
  logout: () => void;
}

export function useInactivityTimeout(enabled: boolean = true): UseInactivityTimeoutReturn {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [remainingTime, setRemainingTime] = useState(INACTIVITY_TIMEOUT);
  const [isWarning, setIsWarning] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  const logout = useCallback(async () => {
    clearAllTimers();
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Auto-logout error:', error);
    }
  }, [clearAllTimers]);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setRemainingTime(INACTIVITY_TIMEOUT);
    setIsWarning(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      clearAllTimers();
      setRemainingTime(INACTIVITY_TIMEOUT);
      setIsWarning(false);
      return;
    }

    const updateRemainingTime = () => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, INACTIVITY_TIMEOUT - elapsed);
      setRemainingTime(remaining);
      
      if (remaining <= WARNING_BEFORE_LOGOUT && remaining > 0) {
        setIsWarning(true);
      } else {
        setIsWarning(false);
      }
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (!isWarning) {
        resetTimer();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    const timerInterval = setInterval(updateRemainingTime, 1000);

    warningTimeoutRef.current = setTimeout(() => {
      setIsWarning(true);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

    timeoutRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
      clearInterval(timerInterval);
    };
  }, [enabled, isWarning, resetTimer, logout, clearAllTimers]);

  return {
    remainingTime,
    isWarning,
    resetTimer,
    logout,
  };
}

export function formatTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
