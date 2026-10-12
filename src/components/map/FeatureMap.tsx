import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;

export interface MapPoint {
  id: string;
  lng: number;
  lat: number;
  color: string;
  label: string;
}

interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface Props {
  center: [number, number];
  zoom?: number;
  points?: MapPoint[];
  selectedId?: string | null;
  tileUrl?: string | null;
  bounds?: Bounds | null;
  onPointClick?: (id: string) => void;
}

function boundsAreValid(bounds: Bounds | null | undefined): bounds is Bounds {
  if (!bounds) return false;
  return [bounds.north, bounds.south, bounds.east, bounds.west].every((value) => Number.isFinite(value))
    && bounds.north > bounds.south
    && bounds.east > bounds.west;
}

export function FeatureMap({
  center,
  zoom = 12,
  points = [],
  selectedId,
  tileUrl,
  bounds,
  onPointClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const clickRef = useRef(onPointClick);
  clickRef.current = onPointClick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (boundsAreValid(bounds)) {
        map.fitBounds(
          [[bounds.west, bounds.south], [bounds.east, bounds.north]],
          { padding: 28, maxZoom: 14, duration: 0 },
        );
      } else {
        map.jumpTo({ center, zoom });
      }
    };
    if (map.loaded()) apply();
    else map.once('load', apply);
  }, [bounds, center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const applyTiles = () => {
      if (map.getLayer('contour-tiles')) map.removeLayer('contour-tiles');
      if (map.getSource('contours')) map.removeSource('contours');
      if (!tileUrl) return;
      map.addSource('contours', {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
      });
      map.addLayer({
        id: 'contour-tiles',
        type: 'raster',
        source: 'contours',
        paint: { 'raster-opacity': 0.82 },
      });
    };

    if (map.loaded()) applyTiles();
    else map.once('load', applyTiles);
  }, [tileUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const draw = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      for (const point of points) {
        if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) continue;
        const selected = point.id === selectedId;
        const el = document.createElement('button');
        el.type = 'button';
        el.title = point.label;
        el.setAttribute('aria-label', point.label);
        el.style.cssText = `
          width: ${selected ? 18 : 14}px;
          height: ${selected ? 18 : 14}px;
          background: ${point.color};
          border: 2px solid ${selected ? '#f8fafc' : 'rgba(255,255,255,0.7)'};
          border-radius: 999px;
          box-shadow: 0 0 0 4px ${selected ? 'rgba(6,182,212,0.35)' : 'transparent'};
        `;
        el.addEventListener('click', () => clickRef.current?.(point.id));
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([point.lng, point.lat])
          .addTo(map);
        markersRef.current.push(marker);
      }
    };

    if (map.loaded()) draw();
    else map.once('load', draw);
  }, [points, selectedId]);

  if (!TOKEN) {
    if (import.meta.env.DEV) {
      console.info('[CastIQ] Map is hidden because VITE_MAPBOX_ACCESS_TOKEN is not set.');
    }
    return (
      <div className="flex h-full min-h-64 items-center justify-center bg-castiq-blue-dark px-6 text-center">
        <p className="max-w-sm text-sm text-castiq-muted">
          The map is unavailable right now. Structure and report details below are still usable.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full min-h-64 w-full" />;
}
