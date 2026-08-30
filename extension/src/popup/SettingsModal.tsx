import React, { useState } from "react";
import { ExtensionSettings } from "../types";
import { saveSettings } from "../services/api";

interface SettingsModalProps {
  settings: ExtensionSettings;
  onClose: () => void;
  onSaved: (newSettings: ExtensionSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose, onSaved }) => {
  const [backendUrl, setBackendUrl] = useState(settings.backendUrl);
  const [webAppUrl, setWebAppUrl] = useState(settings.webAppUrl);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [demoMode, setDemoMode] = useState(settings.demoMode);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newSet: ExtensionSettings = {
      backendUrl,
      webAppUrl,
      notificationsEnabled,
      demoMode,
    };
    await saveSettings(newSet);
    onSaved(newSet);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-xs p-4 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Extension Settings</h3>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Backend API URL</label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-[11px] text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Web App Dashboard URL</label>
            <input
              type="text"
              value={webAppUrl}
              onChange={(e) => setWebAppUrl(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-[11px] text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-700 font-semibold">Enable Notifications</span>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="accent-blue-600"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-700 font-semibold">Simulation Mode</span>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="accent-blue-600"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
