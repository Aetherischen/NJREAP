import { useEffect } from 'react';

const DeferredScripts = () => {
  useEffect(() => {
    // Defer Tawk.to loading with performance optimization
    const loadTawkTo = () => {
      if ((window as any).Tawk_API) return; // Already loaded

      // Use requestIdleCallback for better performance
      const initTawk = () => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = "https://embed.tawk.to/65ca4cc88d261e1b5f5f1bf6/1hmf3nrst";
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");
        
        // Initialize Tawk_API
        (window as any).Tawk_API = (window as any).Tawk_API || {};
        (window as any).Tawk_LoadStart = new Date();
        
        document.head.appendChild(script);
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(initTawk, { timeout: 8000 });
      } else {
        setTimeout(initTawk, 4000);
      }
    };

    // Load Tawk.to only after user interaction or significant delay
    let hasInteracted = false;
    const startTawk = () => {
      if (!hasInteracted) {
        hasInteracted = true;
        loadTawkTo();
      }
    };

    // Start on user interaction or after 6 seconds
    ['scroll', 'mousemove', 'click', 'touchstart'].forEach(event => {
      window.addEventListener(event, startTawk, { once: true, passive: true });
    });
    
    const fallbackTimeout = setTimeout(startTawk, 6000);

    return () => {
      clearTimeout(fallbackTimeout);
      ['scroll', 'mousemove', 'click', 'touchstart'].forEach(event => {
        window.removeEventListener(event, startTawk);
      });
    };
  }, []);

  return null;
};

export default DeferredScripts;