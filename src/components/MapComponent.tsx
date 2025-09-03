import React, { useEffect, useRef } from 'react';

interface MapComponentProps {
  address: string;
  city?: string;
  state?: string;
  zip?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ address, city, state, zip }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  const fullAddress = [address, city, state, zip].filter(Boolean).join(', ');

  useEffect(() => {
    if (!mapContainer.current || !fullAddress) return;

    // Simple embedded map using Google Maps (no API key required for basic embedding)
    const encodedAddress = encodeURIComponent(fullAddress);
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.google.com/maps/embed/v1/place?q=${encodedAddress}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO9kZiQhx7L3BQ`;
    iframe.width = '100%';
    iframe.height = '300';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.loading = 'lazy';

    if (mapContainer.current) {
      mapContainer.current.innerHTML = '';
      mapContainer.current.appendChild(iframe);
    }
  }, [fullAddress]);

  if (!fullAddress) {
    return (
      <div className="w-full h-[300px] bg-muted/20 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Address information not available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={mapContainer} className="w-full h-[300px] rounded-lg overflow-hidden shadow-lg" />
      <p className="text-sm text-muted-foreground mt-2 text-center">{fullAddress}</p>
    </div>
  );
};

export default MapComponent;