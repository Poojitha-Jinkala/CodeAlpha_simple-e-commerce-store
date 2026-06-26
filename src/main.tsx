import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupMockApi } from './mockApi.ts';

// Automatically activate transparent client-side mock backend when deployed to static hosting
// like GitHub Pages, Vercel static sites, Netlify, etc. where no node backend exists.
const isStaticHost = 
  window.location.hostname.includes('github.io') || 
  window.location.hostname.includes('netlify.app') || 
  window.location.hostname.includes('vercel.app') ||
  // Or if it's explicitly deployed anywhere else as a static build
  (!window.location.hostname.includes('localhost') && 
   !window.location.hostname.includes('127.0.0.1') && 
   !window.location.hostname.includes('run.app') && // Google Cloud Run dev/pre previews
   !window.location.hostname.includes('ais-dev') && 
   !window.location.hostname.includes('ais-pre'));

if (isStaticHost) {
  console.log('Static host detected! Activating high-fidelity client-side transparent mock database.');
  setupMockApi();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

