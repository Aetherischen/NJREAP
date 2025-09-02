
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Defer Microsoft Clarity to avoid blocking main thread
const initClarity = () => {
  if (!window.location.pathname.startsWith('/admin')) {
    import('@microsoft/clarity').then(({ default: Clarity }) => {
      Clarity.init('s1m5bbn9dt');
    });
  }
};

// Initialize Clarity after page is interactive
if (document.readyState === 'complete') {
  setTimeout(initClarity, 500);
} else {
  window.addEventListener('load', () => setTimeout(initClarity, 500));
}

createRoot(document.getElementById("root")!).render(<App />);
