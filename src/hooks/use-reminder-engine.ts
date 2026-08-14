'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  useWaterStore,
  REMINDER_MESSAGES_EN,
  REMINDER_MESSAGES_HI,
} from '@/lib/water-store';

function isInSleepWindow(
  sleepStartH: number,
  sleepStartM: number,
  sleepEndH: number,
  sleepEndM: number
): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = sleepStartH * 60 + sleepStartM;
  const endMinutes = sleepEndH * 60 + sleepEndM;

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight case (e.g., 23:00 to 07:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

function getRandomMessage(
  messages: string[],
  useVariation: boolean
): string {
  if (!useVariation) return messages[0];
  return messages[Math.floor(Math.random() * messages.length)];
}

function formatTimeUntil(ms: number): string {
  if (ms <= 0) return 'Now';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainMin = minutes % 60;
  return `${hours}h ${remainMin}m`;
}

let lastTTSTime = 0;
const TTS_COOLDOWN = 5000;

export function useReminderEngine() {
  const {
    settings,
    lastReminderTime,
    setLastReminderTime,
    nextReminderTime,
    setNextReminderTime,
    setReminderActive,
    addWaterLog,
    updateSettings,
    setInstallPrompt,
  } = useWaterStore();

  const [isReminderRunning, setIsReminderRunning] = useState(false);
  const [timeUntilNextReminder, setTimeUntilNextReminder] = useState('');
  const [nextReminderDate, setNextReminderDate] = useState<Date | null>(null);
  const [sleepWindow, setSleepWindow] = useState(false);
  const nextTimeRef = useRef(nextReminderTime || Date.now() + settings.intervalMinutes * 60 * 1000);
  const counterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerReminder = useCallback(() => {
    if (settings.silentMode || sleepWindow) return;

    const now = Date.now();
    if (now - lastTTSTime < TTS_COOLDOWN) return;

    let message = '';
    let secondaryMessage = '';

    if (settings.customMessageEn || settings.customMessageHi) {
      message = settings.customMessageEn || 'Drink water!';
      secondaryMessage = settings.customMessageHi || 'पानी पी लो!';
    } else {
      message = getRandomMessage(REMINDER_MESSAGES_EN, settings.reminderVariation);
      secondaryMessage = getRandomMessage(REMINDER_MESSAGES_HI, settings.reminderVariation);
    }

    // TTS
    if (settings.ttsEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();

      const messagesToSpeak =
        settings.language === 'en'
          ? [message]
          : settings.language === 'hi'
            ? [secondaryMessage]
            : [message, secondaryMessage];

      messagesToSpeak.forEach((text, idx) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = settings.volume;
        utterance.rate = 0.9;
        utterance.pitch = 1.1;

        // Try to find Hindi voice for Hindi text
        const voices = window.speechSynthesis.getVoices();
        if (idx === 1 || settings.language === 'hi') {
          const hindiVoice = voices.find(
            (v) => v.lang.startsWith('hi') || v.lang.includes('Hindi')
          );
          if (hindiVoice) utterance.voice = hindiVoice;
        }

        utterance.onstart = () => { lastTTSTime = Date.now(); };
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, idx * 2500);
      });
    }

    // Notification
    if (settings.notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const displayMsg = settings.language === 'hi'
          ? secondaryMessage
          : settings.language === 'en'
            ? message
            : `${message} / ${secondaryMessage}`;

        const notification = new Notification('💧 Water Reminder', {
          body: displayMsg,
          icon: '/icon-512.png',
          badge: '/icon-512.png',
          vibrate: settings.vibrationEnabled ? [200, 100, 200] : undefined,
          requireInteraction: true,
          tag: 'water-reminder',
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
          addWaterLog(settings.glassSizeMl);
        };
      }
    }

    // Vibration
    if (settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    setLastReminderTime(now);
  }, [settings, sleepWindow, lastReminderTime, addWaterLog, setLastReminderTime]);

  useEffect(() => {
    // Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // SW registration failed silently
      });
    }

    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Handle URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'log-water') {
      addWaterLog(settings.glassSizeMl);
      window.history.replaceState({}, '', '/');
    }
    if (params.get('action') === 'toggle-silent') {
      updateSettings({ silentMode: !settings.silentMode });
      window.history.replaceState({}, '', '/');
    }

    // PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  useEffect(() => {
    const check = () => {
      const inSleep = isInSleepWindow(
        settings.sleepStartHour,
        settings.sleepStartMinute,
        settings.sleepEndHour,
        settings.sleepEndMinute
      );
      setSleepWindow(inSleep);
      useWaterStore.getState().setIsSleepTime(inSleep);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [
    settings.sleepStartHour,
    settings.sleepStartMinute,
    settings.sleepEndHour,
    settings.sleepEndMinute,
  ]);

  // Main reminder loop
  useEffect(() => {
    if (!nextTimeRef.current || nextTimeRef.current <= Date.now()) {
      nextTimeRef.current = Date.now() + settings.intervalMinutes * 60 * 1000;
    }

    setIsReminderRunning(true);
    setReminderActive(true);

    counterRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = nextTimeRef.current - now;

      setTimeUntilNextReminder(formatTimeUntil(remaining));
      setNextReminderDate(new Date(nextTimeRef.current));
      setNextReminderTime(nextTimeRef.current);

      if (remaining <= 0) {
        triggerReminder();
        nextTimeRef.current = now + settings.intervalMinutes * 60 * 1000;
      }
    }, 1000);

    return () => {
      if (counterRef.current) clearInterval(counterRef.current);
      setReminderActive(false);
    };
  }, [settings.intervalMinutes, triggerReminder, setReminderActive, setNextReminderTime]);

  return {
    isReminderRunning,
    timeUntilNextReminder,
    nextReminderDate,
    triggerReminder,
    isInSleepWindow: sleepWindow,
  };
}
