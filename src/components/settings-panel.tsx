'use client';

import { useState } from 'react';
import {
  Clock,
  Volume2,
  Bell,
  Moon,
  Languages,
  Target,
  GlassWater,
  RotateCcw,
  MessageSquare,
  Vibrate,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Trash2,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { useWaterStore, DEFAULT_SETTINGS, type Language } from '@/lib/water-store';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings, clearTodayLogs, todayLogs } = useWaterStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleResetSettings = () => {
    resetSettings();
    onClose();
  };

  const handleClearToday = () => {
    clearTodayLogs();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Settings Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={onClose}
              aria-label="Close settings"
            >
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">Settings</h1>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-destructive" aria-label="Reset all settings">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset All Settings?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all your settings to default values. Your water log history will be kept.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetSettings} className="bg-destructive text-white hover:bg-destructive/90">
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Scrollable Settings Content */}
      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 py-4 space-y-4 pb-24">

        {/* === REMINDER SECTION === */}
        <SettingsSection
          sectionId="reminder"
          title="Reminder"
          icon={<Clock className="h-4 w-4 text-sky-500" />}
          activeSection={activeSection}
          onToggle={() => setActiveSection(activeSection === 'reminder' ? null : 'reminder')}
        >
          {/* Interval Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Reminder Interval</Label>
              <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                {settings.intervalMinutes} min
              </span>
            </div>
            <Slider
              value={[settings.intervalMinutes]}
              onValueChange={([v]) => updateSettings({ intervalMinutes: v })}
              min={5}
              max={120}
              step={5}
              className="[&_[role=slider]]:bg-sky-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>5 min</span>
              <span>1 hour</span>
              <span>2 hours</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Message Variation */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Vary Messages
              </Label>
              <p className="text-[10px] text-muted-foreground">Use different reminder phrases</p>
            </div>
            <Switch
              checked={settings.reminderVariation}
              onCheckedChange={(v) => updateSettings({ reminderVariation: v })}
            />
          </div>

          <Separator className="my-3" />

          {/* Custom Messages */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-violet-500" />
              Custom Reminder Message
            </Label>
            <p className="text-[10px] text-muted-foreground">Leave empty to use default messages</p>
            <Input
              placeholder="Drink water now!"
              value={settings.customMessageEn}
              onChange={(e) => updateSettings({ customMessageEn: e.target.value })}
              className="h-9"
            />
            <Input
              placeholder="पानी पी लो!"
              value={settings.customMessageHi}
              onChange={(e) => updateSettings({ customMessageHi: e.target.value })}
              className="h-9"
            />
          </div>
        </SettingsSection>

        {/* === LANGUAGE SECTION === */}
        <SettingsSection
          sectionId="language"
          title="Language"
          icon={<Languages className="h-4 w-4 text-emerald-500" />}
          activeSection={activeSection}
          onToggle={() => setActiveSection(activeSection === 'language' ? null : 'language')}
        >
          <div className="space-y-3">
            <Label className="text-sm font-medium">Reminder Language</Label>
            <Select
              value={settings.language}
              onValueChange={(v) => updateSettings({ language: v as Language })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <span className="flex items-center gap-2">
                    🇬🇧 English only
                  </span>
                </SelectItem>
                <SelectItem value="hi">
                  <span className="flex items-center gap-2">
                    🇮🇳 Hindi only
                  </span>
                </SelectItem>
                <SelectItem value="both">
                  <span className="flex items-center gap-2">
                    🇮🇳🇬🇧 Both (English + Hindi)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              {settings.language === 'en' && 'Will speak: "Drink water now!"'}
              {settings.language === 'hi' && 'Will speak: "पानी पी लो!"'}
              {settings.language === 'both' && 'Will speak both English and Hindi alternately'}
            </p>
          </div>
        </SettingsSection>

        {/* === VOICE & SOUND SECTION === */}
        <SettingsSection
          sectionId="sound"
          title="Voice & Sound"
          icon={<Volume2 className="h-4 w-4 text-orange-500" />}
          activeSection={activeSection}
          onToggle={() => setActiveSection(activeSection === 'sound' ? null : 'sound')}
        >
          {/* TTS Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Voice Reminder (TTS)</Label>
              <p className="text-[10px] text-muted-foreground">Speaks the reminder aloud</p>
            </div>
            <Switch
              checked={settings.ttsEnabled}
              onCheckedChange={(v) => updateSettings({ ttsEnabled: v })}
            />
          </div>

          <Separator className="my-3" />

          {/* Volume Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Volume</Label>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {Math.round(settings.volume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.volume * 100]}
              onValueChange={([v]) => updateSettings({ volume: v / 100 })}
              min={0}
              max={100}
              step={5}
              className="[&_[role=slider]]:bg-orange-500"
            />
          </div>

          <Separator className="my-3" />

          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                Sound Effect
              </Label>
              <p className="text-[10px] text-muted-foreground">Play a water drop sound</p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(v) => updateSettings({ soundEnabled: v })}
            />
          </div>

          <Separator className="my-3" />

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Vibrate className="h-3.5 w-3.5" />
                Vibration
              </Label>
              <p className="text-[10px] text-muted-foreground">Vibrate on reminder</p>
            </div>
            <Switch
              checked={settings.vibrationEnabled}
              onCheckedChange={(v) => updateSettings({ vibrationEnabled: v })}
            />
          </div>
        </SettingsSection>

        {/* === NOTIFICATIONS SECTION === */}
        <SettingsSection
          sectionId="notifications"
          title="Notifications"
          icon={<Bell className="h-4 w-4 text-rose-500" />}
          activeSection={activeSection}
          onToggle={() => setActiveSection(activeSection === 'notifications' ? null : 'notifications')}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-[10px] text-muted-foreground">
                Show notification banner
              </p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(v) => updateSettings({ notificationsEnabled: v })}
            />
          </div>

          <Separator className="my-3" />

          {/* Silent Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                Silent Mode
              </Label>
              <p className="text-[10px] text-destructive/70">Stop ALL reminders completely</p>
            </div>
            <Switch
              checked={settings.silentMode}
              onCheckedChange={(v) => updateSettings({ silentMode: v })}
              className="data-[state=checked]:bg-destructive"
            />
          </div>

          {settings.silentMode && (
            <div className="mt-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-xs text-destructive font-medium">
                ⚠️ Silent mode is ON. No reminders will be sent until you turn it off.
              </p>
            </div>
          )}
        </SettingsSection>

        {/* === SLEEP SCHEDULE === */}
        <SettingsSection
          sectionId="sleep"
          title="Sleep Schedule"
          icon={<Moon className="h-4 w-4 text-purple-500" />}
          activeSection={activeSection}
          onToggle={() => setActiveSection(activeSection === 'sleep' ? null : 'sleep')}
        >
          <p className="text-[10px] text-muted-foreground mb-3">
            No reminders will be sent during sleep hours. Set to same time to disable.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Moon className="h-3.5 w-3.5" />
                Sleep Start (Bedtime)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <TimeSelect
                  label="Hour"
                  value={settings.sleepStartHour}
                  onChange={(v) => updateSettings({ sleepStartHour: v })}
                  max={23}
                />
                <TimeSelect
                  label="Min"
                  value={settings.sleepStartMinute}
                  onChange={(v) => updateSettings({ sleepStartMinute: v })}
                  max={59}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Sun className="h-3.5 w-3.5" />
                Sleep End (Wake Up)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <TimeSelect
                  label="Hour"
                  value={settings.sleepEndHour}
                  onChange={(v) => updateSettings({ sleepEndHour: v })}
                  max={23}
                />
                <TimeSelect
                  label="Min"
                  value={settings.sleepEndMinute}
                  onChange={(v) => updateSettings({ sleepEndMinute: v })}
                  max={59}
                />
              </div>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <p className="text-xs text-purple-700 dark:text-purple-300">
                💤 No reminders from{' '}
                <strong>
                  {String(settings.sleepStartHour).padStart(2, '0')}:
                  {String(settings.sleepStartMinute).padStart(2, '0')}
                </strong>{' '}
                to{' '}
                <strong>
                  {String(settings.sleepEndHour).padStart(2, '0')}:
                  {String(settings.sleepEndMinute).padStart(2, '0')}
                </strong>
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* === DAILY GOAL === */}
        <SettingsSection
          sectionId="goal"
          title="Daily Goal"
          icon={<Target className="h-4 w-4 text-cyan-500" />}
          activeSection={activeSection}
          onToggle={() => setActiveSection(activeSection === 'goal' ? null : 'goal')}
        >
          {/* Daily Goal in ml */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Daily Water Goal</Label>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                {settings.dailyGoalMl}ml
              </span>
            </div>
            <Slider
              value={[settings.dailyGoalMl]}
              onValueChange={([v]) => updateSettings({ dailyGoalMl: v })}
              min={500}
              max={6000}
              step={100}
              className="[&_[role=slider]]:bg-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>500ml</span>
              <span>3L</span>
              <span>6L</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Glass Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <GlassWater className="h-3.5 w-3.5" />
                Glass Size
              </Label>
              <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                {settings.glassSizeMl}ml
              </span>
            </div>
            <Slider
              value={[settings.glassSizeMl]}
              onValueChange={([v]) => updateSettings({ glassSizeMl: v })}
              min={50}
              max={500}
              step={25}
              className="[&_[role=slider]]:bg-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>50ml</span>
              <span>250ml</span>
              <span>500ml</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              = {Math.round(settings.dailyGoalMl / settings.glassSizeMl)} glasses per day to reach your goal
            </p>
          </div>
        </SettingsSection>

        {/* === APPEARANCE === */}
        <SettingsSection
          sectionId="appearance"
          title="Appearance"
          icon={<Sun className="h-4 w-4 text-yellow-500" />}
          activeSection={activeSection}
          onToggle={() => setActiveSection(activeSection === 'appearance' ? null : 'appearance')}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Dark Mode</Label>
              <p className="text-[10px] text-muted-foreground">Switch to dark theme</p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(v) => {
                updateSettings({ darkMode: v });
                if (v) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              }}
            />
          </div>
        </SettingsSection>

        {/* === DATA MANAGEMENT === */}
        <SettingsSection
          sectionId="data"
          title="Data"
          icon={<Trash2 className="h-4 w-4 text-muted-foreground" />}
          activeSection={activeSection}
          onToggle={() => setActiveSection(activeSection === 'data' ? null : 'data')}
        >
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Today&apos;s Water Log
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Today&apos;s Log?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {todayLogs.length} water entries logged today. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearToday} className="bg-destructive text-white hover:bg-destructive/90">
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              📊 Today: {todayLogs.length} glasses logged
            </p>
          </div>
        </SettingsSection>

        {/* About */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <img src="/icon-512.png" alt="App Icon" className="w-12 h-12 rounded-xl mx-auto mb-2" />
            <h3 className="text-sm font-bold">Water Reminder</h3>
            <p className="text-[10px] text-muted-foreground">पानी पी लो - Stay Hydrated</p>
            <p className="text-[10px] text-muted-foreground mt-1">Version 1.0.0 • PWA for Android 10+</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Collapsible settings section
function SettingsSection({
  title,
  sectionId,
  icon,
  children,
  activeSection,
  onToggle,
}: {
  title: string;
  sectionId: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  activeSection: string | null;
  onToggle: () => void;
}) {
  const isOpen = activeSection === sectionId;

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <button
        className="w-full text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            </div>
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                isOpen ? 'rotate-90' : ''
              }`}
            />
          </div>
        </CardHeader>
      </button>
      {isOpen && (
        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

// Time select component
function TimeSelect({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  const options = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={String(opt)}>
              {String(opt).padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
