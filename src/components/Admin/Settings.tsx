// src/components/Admin/Settings.tsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { Switch } from '@headlessui/react';

interface AppSettings {
  showReferrals: boolean;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({ showReferrals: false });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const settingsRef = doc(db, 'appSettings', 'global');
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as AppSettings);
      } else {
        // Initialize default settings if they don't exist
        await setDoc(settingsRef, { showReferrals: false });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    setUpdating(true);
    try {
      const settingsRef = doc(db, 'appSettings', 'global');
      await setDoc(settingsRef, { ...settings, ...newSettings }, { merge: true });
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Ustawienia</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Program poleceń</h3>
              <p className="text-sm text-gray-500">
                Włącz lub wyłącz widoczność programu poleceń dla użytkowników
              </p>
            </div>
            <Switch
              checked={settings.showReferrals}
              onChange={(checked) => updateSettings({ showReferrals: checked })}
              disabled={updating}
              className={`${
                settings.showReferrals ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  settings.showReferrals ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>

          {updating && (
            <p className="text-sm text-blue-600">
              Aktualizowanie ustawień...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;