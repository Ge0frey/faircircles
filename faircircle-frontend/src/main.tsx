import { Buffer } from 'buffer';

// Polyfill for Buffer - must be before any imports that use it
(window as Window & typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
