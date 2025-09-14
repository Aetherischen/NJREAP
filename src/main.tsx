import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'

console.log('=== MAIN.TSX LOADING ===');
;(window as any).__moduleLoaded = true;

const root = document.getElementById("root");
console.log('Root element found:', root);

if (root) {
  console.log('Creating React root...');
  // Clear the initial placeholder content to avoid lingering "Loading..."
  root.innerHTML = '';
  const reactRoot = createRoot(root);
  reactRoot.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log('React render completed');
} else {
  console.error('Root element not found!');
}
