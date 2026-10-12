import { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Lake } from '../../types/lake';
import type { WithId } from '../../types/common';
import { getPinColor } from '../../utils/reportRecencyColor';

const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;

interface Props {
  center: [number, number]; // [lng, lat]
  zoom?: number;
  lakes?: WithId<Lake>[];
  onLakeClick?: (lake: WithId<Lake>) => void;
}

export function MapView({ center, zoom = 7, lakes = [], onLakeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!TOKEN) return;

    mapboxgl.accessToken = TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Keep the camera on the recommended lakes. Fall back to the user's area when none match.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const fit = () => {
      if (lakes.length === 0) {
        map.flyTo({ center, speed: 1.2 });
        return;
      }
      const bounds = new mapboxgl.LngLatBounds();
      for (const lake of lakes) {
        if (Number.isFinite(lake.lng) && Number.isFinite(lake.lat)) {
          bounds.extend([lake.lng, lake.lat]);
        }
      }
      if (bounds.isEmpty()) {
        map.flyTo({ center, speed: 1.2 });
        return;
      }
      map.fitBounds(bounds, { padding: 56, maxZoom: 8, duration: 800 });
    };

    if (map.loaded()) fit();
    else map.once('load', fit);
  }, [center, lakes]);

  // Render lake markers
  const addMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const lake of lakes) {
      const lastReport = lake.lastReportDate
        ? (lake.lastReportDate as unknown as { toDate?: () => Date }).toDate?.() ?? null
        : null;
      const color = getPinColor(lastReport);

      // Custom pin element
      const el = document.createElement('div');
      el.className = 'lake-pin cursor-pointer transition-transform hover:scale-125';
      el.style.cssText = `
        width: 14px; height: 14px;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.6);
        border-radius: 50%;
        box-shadow: 0 0 6px ${color}80;
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lake.lng, lake.lat])
        .addTo(mapRef.current);

      el.addEventListener('click', () => onLakeClick?.(lake));
      markersRef.current.push(marker);
    }
  }, [lakes, onLakeClick]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapRef.current.loaded()) {
      addMarkers();
    } else {
      mapRef.current.on('load', addMarkers);
      return () => { mapRef.current?.off('load', addMarkers); };
    }
  }, [addMarkers]);

  if (!TOKEN) {
    if (import.meta.env.DEV) {
      console.info('[CastIQ] Map is hidden because VITE_MAPBOX_ACCESS_TOKEN is not set.');
    }
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-castiq-blue gap-3">
        <svg className="h-12 w-12 text-castiq-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <p className="text-sm text-castiq-muted text-center max-w-xs">
          The map is unavailable right now.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
