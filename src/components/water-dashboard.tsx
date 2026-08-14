'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets,
  Minus,
  Settings,
  Moon,
  VolumeX,
  Volume2,
  Clock,
  Bell,
  Target,
  TrendingUp,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WaterGlassSVG } from '@/components/water-glass-svg';
import { useWaterStore } from '@/lib/water-store';
import { useReminderEngine } from '@/hooks/use-reminder-engine';

interface WaterDashboardProps {
  onOpenSettings: () => void;
}

export function WaterDashboard({ onOpenSettings }: WaterDashboardProps) {
  const {
    settings,
    todayLogs,
    addWaterLog,
    removeWaterLog,
    getTodayTotal,
    getTodayGlasses,
    getTodayProgress,
    getLast7Days,
    isSleepTime,
  } = useWaterStore();

  const {
    isReminderRunning,
    timeUntilNextReminder,
    isInSleepWindow,
    triggerReminder,
  } = useReminderEngine();

  const todayTotal = getTodayTotal();
  const todayGlasses = getTodayGlasses();
  const progress = getTodayProgress();
  const goalGlasses = Math.round(settings.dailyGoalMl / settings.glassSizeMl);
  const last7 = getLast7Days();
  const avg7 = Math.round(last7.reduce((s, d) => s + d.totalMl, 0) / 7);

  const handleAddWater = () => {
    addWaterLog(settings.glassSizeMl);
  };

  const handleRemoveLast = () => {
    if (todayLogs.length > 0) {
      removeWaterLog(todayLogs[todayLogs.length - 1].id);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const statusColor = settings.silentMode
    ? 'bg-gray-400'
    : isInSleepWindow
      ? 'bg-purple-500'
      : 'bg-emerald-500';

  const statusText = settings.silentMode
    ? 'Silent Mode'
    : isInSleepWindow
      ? '💤 Sleeping'
      : '✅ Active';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-sky-100 dark:border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/icon-512.png" alt="Water Reminder" className="w-10 h-10 rounded-xl" />
              <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${statusColor} border-2 border-white dark:border-slate-900`} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                Water Reminder
              </h1>
              <p className="text-xs text-muted-foreground">Stay hydrated every day</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick silent toggle */}
            <Button
              variant={settings.silentMode ? 'destructive' : 'ghost'}
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => {
                useWaterStore.getState().updateSettings({ silentMode: !settings.silentMode });
              }}
              aria-label={settings.silentMode ? 'Enable sounds' : 'Mute sounds'}
            >
              {settings.silentMode ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={onOpenSettings}
              aria-label="Open settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-4">
        {/* Status banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={settings.silentMode ? 'silent' : isInSleepWindow ? 'sleep' : 'active'}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full"
          >
            <Card className={`border-0 shadow-sm ${
              settings.silentMode
                ? 'bg-gray-50 dark:bg-gray-900/50'
                : isInSleepWindow
                  ? 'bg-purple-50 dark:bg-purple-950/30'
                  : 'bg-emerald-50 dark:bg-emerald-950/30'
            }`}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`rounded-full text-xs font-semibold ${
                      settings.silentMode
                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        : isInSleepWindow
                          ? 'bg-purple-200 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                          : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {statusText}
                  </Badge>
                  {isReminderRunning && !settings.silentMode && !isInSleepWindow && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Next: {timeUntilNextReminder}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bell className="h-3 w-3" />
                  {settings.intervalMinutes}m interval
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Water Glass */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur">
          <CardContent className="pt-6 pb-4 flex flex-col items-center">
            <WaterGlassSVG
              progress={progress}
              glassCount={todayGlasses}
              goalGlasses={goalGlasses}
            />

            <div className="w-full mt-2 px-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{todayTotal}ml</span>
                <span>Goal: {settings.dailyGoalMl}ml</span>
              </div>
              <Progress value={progress} className="h-2.5" />
            </div>

            {/* Quick Add Buttons */}
            <div className="flex items-center gap-3 mt-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 border-2 border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-800 dark:text-rose-400 dark:hover:bg-rose-950"
                onClick={handleRemoveLast}
                disabled={todayLogs.length === 0}
                aria-label="Remove last glass"
              >
                <Minus className="h-5 w-5" />
              </Button>

              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  size="lg"
                  className="rounded-full h-16 w-16 bg-gradient-to-br from-sky-400 to-cyan-600 hover:from-sky-500 hover:to-cyan-700 text-white shadow-lg shadow-sky-200 dark:shadow-sky-900/50 text-lg font-bold"
                  onClick={handleAddWater}
                  aria-label="Add a glass of water"
                >
                  <Droplets className="h-7 w-7" />
                </Button>
              </motion.div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 border-2 border-sky-200 text-sky-500 hover:bg-sky-50 hover:text-sky-600 dark:border-sky-800 dark:text-sky-400 dark:hover:bg-sky-950"
                onClick={triggerReminder}
                aria-label="Test reminder now"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tap 💧 to log • Tap 🔔 to test
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-800/80">
            <CardContent className="p-3 text-center">
              <Target className="h-4 w-4 text-sky-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-800 dark:text-white">{goalGlasses}</p>
              <p className="text-[10px] text-muted-foreground">Daily Goal</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-800/80">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-800 dark:text-white">{avg7}ml</p>
              <p className="text-[10px] text-muted-foreground">7-Day Avg</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-800/80">
            <CardContent className="p-3 text-center">
              <Moon className="h-4 w-4 text-purple-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-slate-800 dark:text-white">
                {String(settings.sleepStartHour).padStart(2, '0')}
                {String(settings.sleepStartMinute).padStart(2, '0')}
              </p>
              <p className="text-[10px] text-muted-foreground">Sleep Start</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Log */}
        {todayLogs.length > 0 && (
          <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-800/80">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Today&apos;s Log
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {todayLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-sky-50 dark:bg-slate-700/50"
                  >
                    <div className="flex items-center gap-2">
                      <Droplets className="h-3.5 w-3.5 text-sky-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {log.amount}ml
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(log.timestamp)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Install PWA Banner */}
        <InstallPrompt />

        {/* Weekly Chart */}
        <Card className="border-0 shadow-sm bg-white/80 dark:bg-slate-800/80">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-sky-500" />
              Last 7 Days
            </h3>
            <div className="flex items-end gap-1.5 h-24">
              {last7.map((day, i) => {
                const maxMl = settings.dailyGoalMl || 2500;
                const heightPct = Math.min(100, (day.totalMl / maxMl) * 100);
                const dayName = new Date(day.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 2);
                const isToday = i === 6;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative flex justify-center" style={{ height: '80px' }}>
                      <motion.div
                        className={`w-full max-w-[28px] rounded-t-md ${
                          isToday
                            ? 'bg-gradient-to-t from-sky-500 to-cyan-400'
                            : day.totalMl > 0
                              ? 'bg-sky-200 dark:bg-sky-800'
                              : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                        style={{ position: 'absolute', bottom: 0 }}
                      />
                    </div>
                    <span className={`text-[10px] ${isToday ? 'font-bold text-sky-600 dark:text-sky-400' : 'text-muted-foreground'}`}>
                      {dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-3 text-center border-t border-sky-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
        <p className="text-[10px] text-muted-foreground">
          Water Reminder PWA • Install on your phone for best experience
        </p>
      </footer>
    </div>
  );
}

function InstallPrompt() {
  const { installPrompt, setInstallPrompt } = useWaterStore();
  const [dismissed, setDismissed] = useState(false);

  if (!installPrompt || dismissed) return null;

  const handleInstall = async () => {
    const prompt = installPrompt as { prompt: () => Promise<void> };
    await prompt.prompt();
    setInstallPrompt(null);
  };

  return (
    <Card className="border-0 shadow-md bg-gradient-to-r from-sky-500 to-cyan-500 text-white">
      <CardContent className="py-3 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold">Install App</p>
            <p className="text-[10px] opacity-80">Add to home screen for background reminders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full text-xs"
            onClick={() => setDismissed(true)}
          >
            Later
          </Button>
          <Button
            size="sm"
            className="bg-white text-sky-600 hover:bg-white/90 rounded-full text-xs font-semibold"
            onClick={handleInstall}
          >
            Install
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
