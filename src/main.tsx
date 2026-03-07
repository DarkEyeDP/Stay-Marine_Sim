import React from 'react';
import { createRoot } from 'react-dom/client';
import { animate } from 'framer-motion';
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

declare global {
  interface Window {
    EndTabAnimator?: {
      switchPanels: (from: HTMLElement | null, to: HTMLElement | null) => Promise<void>;
    };
  }
}

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

function registerEndTabAnimator() {
  window.EndTabAnimator = {
    async switchPanels(from, to) {
      if (!to || from === to) return;

      if (from) {
        await animate(
          from,
          { opacity: [1, 0], x: [0, -14] },
          { duration: 0.16, ease: 'easeOut' },
        ).finished;
      }

      to.classList.add('active');
      to.style.opacity = '0';
      to.style.transform = 'translateX(14px)';

      await animate(
        to,
        { opacity: [0, 1], x: [14, 0] },
        { duration: 0.22, ease: 'easeOut' },
      ).finished;

      to.style.opacity = '';
      to.style.transform = '';
    },
  };
}

function App() {
  React.useEffect(() => {
    registerEndTabAnimator();
    void bootstrapLegacyGame();
  }, []);

  return null;
}

createRoot(document.getElementById('react-bootstrap')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);