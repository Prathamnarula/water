import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'en' | 'hi' | 'both';

export interface WaterLogEntry {
  id: string;
  timestamp: number;
  amount: number; // in ml
}

export interface DaySummary {
  date: string; // YYYY-MM-DD
  totalMl: number;
  glassCount: number;
}

export interface ReminderSettings {
  intervalMinutes: number; // 15-120
  dailyGoalMl: number; // 1000-5000
  glassSizeMl: number; // 100-500
  language: Language;
  sleepStartHour: number; // 0-23
  sleepStartMinute: number; // 0-59
  sleepEndHour: number; // 0-23
  sleepEndMinute: number; // 0-59
  silentMode: boolean;
  ttsEnabled: boolean;
  notificationsEnabled: boolean;
  volume: number; // 0-1
  customMessageEn: string;
  customMessageHi: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  darkMode: boolean;
  weeklyReport: boolean;
  reminderVariation: boolean; // vary messages
}

export const DEFAULT_SETTINGS: ReminderSettings = {
  intervalMinutes: 30,
  dailyGoalMl: 2500,
  glassSizeMl: 250,
  language: 'both',
  sleepStartHour: 0,
  sleepStartMinute: 0,
  sleepEndHour: 8,
  sleepEndMinute: 0,
  silentMode: false,
  ttsEnabled: true,
  notificationsEnabled: true,
  volume: 0.8,
  customMessageEn: '',
  customMessageHi: '',
  soundEnabled: true,
  vibrationEnabled: true,
  darkMode: false,
  weeklyReport: true,
  reminderVariation: true,
};

export const REMINDER_MESSAGES_EN = [
  'Drink water now!',
  'Time to hydrate!',
  'Have a glass of water!',
  'Stay hydrated, drink water!',
  'Water break time!',
  'Your body needs water!',
  'Don\'t forget to drink water!',
  'Grab a glass of water!',
  'Hydration check - drink up!',
  'Water is life, drink some!',
];

export const REMINDER_MESSAGES_HI = [
  'पानी पी लो!',
  'पानी पियो, सेहत बनाओ!',
  'अभी पानी पी जाओ!',
  'जल्दी पानी पी लो!',
  'एक गिलास पानी पी लो!',
  'शरीर को पानी चाहिए!',
  'पानी भूल मत जाओ!',
  'गिलास भर के पानी पी लो!',
  'हाइड्रेट रहो, पानी पी लो!',
  'पानी ही जीवन है, पी लो!',
];

interface WaterStore {
  // Settings
  settings: ReminderSettings;
  updateSettings: (partial: Partial<ReminderSettings>) => void;
  resetSettings: () => void;

  // Water tracking
  todayLogs: WaterLogEntry[];
  addWaterLog: (amount: number) => void;
  removeWaterLog: (id: string) => void;
  clearTodayLogs: () => void;

  // History
  history: Record<string, DaySummary>;
  getTodayTotal: () => number;
  getTodayGlasses: () => number;
  getTodayProgress: () => number; // 0-100
  getLast7Days: () => DaySummary[];

  // Reminder state
  reminderActive: boolean;
  setReminderActive: (active: boolean) => void;
  lastReminderTime: number;
  setLastReminderTime: (time: number) => void;
  nextReminderTime: number;
  setNextReminderTime: (time: number) => void;

  // App state
  isSleepTime: boolean;
  setIsSleepTime: (sleep: boolean) => void;
  installPrompt: unknown;
  setInstallPrompt: (prompt: unknown) => void;
}

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const useWaterStore = create<WaterStore>()(
  persist(
    (set, get) => ({
      // Settings
      settings: DEFAULT_SETTINGS,
      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),
      resetSettings: () =>
        set({ settings: DEFAULT_SETTINGS }),

      // Water tracking
      todayLogs: [],
      addWaterLog: (amount) => {
        const entry: WaterLogEntry = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
          timestamp: Date.now(),
          amount,
        };
        set((state) => {
          const newLogs = [...state.todayLogs, entry];
          const todayKey = getTodayKey();
          const totalMl = newLogs.reduce((sum, log) => sum + log.amount, 0);
          const newHistory = {
            ...state.history,
            [todayKey]: {
              date: todayKey,
              totalMl,
              glassCount: newLogs.length,
            },
          };
          return { todayLogs: newLogs, history: newHistory };
        });
      },
      removeWaterLog: (id) =>
        set((state) => {
          const newLogs = state.todayLogs.filter((log) => log.id !== id);
          const todayKey = getTodayKey();
          const totalMl = newLogs.reduce((sum, log) => sum + log.amount, 0);
          const newHistory = {
            ...state.history,
            [todayKey]: {
              date: todayKey,
              totalMl,
              glassCount: newLogs.length,
            },
          };
          return { todayLogs: newLogs, history: newHistory };
        }),
      clearTodayLogs: () => {
        const todayKey = getTodayKey();
        set((state) => ({
          todayLogs: [],
          history: { ...state.history, [todayKey]: { date: todayKey, totalMl: 0, glassCount: 0 } },
        }));
      },

      // History
      history: {},
      getTodayTotal: () => get().todayLogs.reduce((sum, log) => sum + log.amount, 0),
      getTodayGlasses: () => get().todayLogs.length,
      getTodayProgress: () => {
        const total = get().getTodayTotal();
        const goal = get().settings.dailyGoalMl;
        return Math.min(100, Math.round((total / goal) * 100));
      },
      getLast7Days: () => {
        const history = get().history;
        const days: DaySummary[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          days.push(history[key] || { date: key, totalMl: 0, glassCount: 0 });
        }
        return days;
      },

      // Reminder state
      reminderActive: false,
      setReminderActive: (active) => set({ reminderActive: active }),
      lastReminderTime: 0,
      setLastReminderTime: (time) => set({ lastReminderTime: time }),
      nextReminderTime: 0,
      setNextReminderTime: (time) => set({ nextReminderTime: time }),

      // App state
      isSleepTime: false,
      setIsSleepTime: (sleep) => set({ isSleepTime: sleep }),
      installPrompt: null,
      setInstallPrompt: (prompt) => set({ installPrompt: prompt }),
    }),
    {
      name: 'water-reminder-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        settings: state.settings,
        todayLogs: state.todayLogs,
        history: state.history,
        lastReminderTime: state.lastReminderTime,
      }),
    }
  )
);