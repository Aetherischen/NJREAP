import { useEffect } from 'react';

const DeferredScripts = () => {
  useEffect(() => {
    // Defer Tawk.to loading until after initial page load
    const loadTawkTo = () => {
      if ((window as any).Tawk_API) return; // Already loaded

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

    // Load Tawk.to after a delay to not block initial render
    const tawkTimeout = setTimeout(loadTawkTo, 2000);

    return () => {
      clearTimeout(tawkTimeout);
    };
  }, []);

  return null;
};

export default DeferredScripts;