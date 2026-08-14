'use client';

import { useState, useEffect } from 'react';
import { WaterDashboard } from '@/components/water-dashboard';
import { SettingsPanel } from '@/components/settings-panel';
import { useWaterStore } from '@/lib/water-store';

export default function HomePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings } = useWaterStore();

  // Apply dark mode on mount
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return (
    <>
      <WaterDashboard onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
