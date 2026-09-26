import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register service worker immediately for offline caching of pandals and map tiles
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[SW] New festival updates available');
  },
  onOfflineReady() {
    console.log('[SW] Hoppers festival companion is 100% offline ready');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

