import React from 'react';
import { createRoot } from 'react-dom/client';
import '../css/style.css';
import './styles.css';

const LEGACY_SCRIPTS = [
  '/js/data/mos.js',
  '/js/data/assignments.js',
  '/js/data/promotions.js',
  '/js/data/schools.js',
  '/js/data/events_core.js',
  '/js/data/events_mos.js',
  '/js/data/events_chance.js',
  '/js/data/events_retirement.js',
  '/js/data/events_eas.js',
  '/js/data/events_data.js',
  '/js/state.js',
  '/js/character.js',
  '/js/finance.js',
  '/js/career.js',
  '/js/pcs.js',
  '/js/events.js',
  '/js/engine.js',
  '/js/ui.js',
  '/js/rifle_qual.js',
  '/js/main.js',
] as const;

function loadLegacyScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

async function bootstrapLegacyGame(): Promise<void> {
  for (const scriptPath of LEGACY_SCRIPTS) {
    await loadLegacyScript(scriptPath);
  }
}

function App() {
  React.useEffect(() => {
    void bootstrapLegacyGame();
  }, []);

  return null;
}

createRoot(document.getElementById('react-bootstrap')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
