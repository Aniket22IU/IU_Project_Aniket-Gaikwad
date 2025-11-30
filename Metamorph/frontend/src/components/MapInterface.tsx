import { useEffect, useRef, useState } from 'react';
import { Scenario } from '../App';

interface MapInterfaceProps {
  selectedRegion: google.maps.LatLngLiteral[] | null;
  onRegionSelect: (region: google.maps.LatLngLiteral[]) => void;
  activeScenario: Scenario | null;
  hideControls?: boolean;
}

export function MapInterface({ selectedRegion, onRegionSelect, activeScenario, hideControls = false }: MapInterfaceProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const greenZonePolygonsRef = useRef<google.maps.Polygon[]>([]);
  const [drawingPoints, setDrawingPoints] = useState<google.maps.LatLngLiteral[]>([]);
  const tempPolygonRef = useRef<google.maps.Polygon | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchBoxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      const googleMap = new google.maps.Map(mapRef.current, {
        center: { lat: 49.9429, lng: 11.5753 },
        zoom: 13,
        mapTypeId: 'satellite',
        mapTypeControl: true,
        streetViewControl: false,
      });
      setMap(googleMap);
      setIsLoading(false);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      // Wait for it to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && mapRef.current) {
          clearInterval(checkInterval);
          const googleMap = new google.maps.Map(mapRef.current, {
            center: { lat: 49.9429, lng: 11.5753 },
            zoom: 13,
            mapTypeId: 'satellite',
            mapTypeControl: true,
            streetViewControl: false,
          });
          setMap(googleMap);
          setIsLoading(false);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.google || !window.google.maps) {
          setLoadError(true);
          setIsLoading(false);
        }
      }, 10000);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDLnyrliH2xbgqMq4gWJn5sWloDt8WDehU&libraries=drawing`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (mapRef.current && window.google && window.google.maps) {
        try {
          const googleMap = new google.maps.Map(mapRef.current, {
            center: { lat: 49.9429, lng: 11.5753 },
            zoom: 13,
            mapTypeId: 'satellite',
            mapTypeControl: true,
            streetViewControl: false,
          });
          setMap(googleMap);
          setIsLoading(false);
        } catch (error) {
          console.error('Error creating map:', error);
          setLoadError(true);
          setIsLoading(false);
        }
      }
    };

    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      setLoadError(true);
      setIsLoading(false);
    };

    document.head.appendChild(script);
  }, []);

  // Handle region selection polygon
  useEffect(() => {
    if (!map || !selectedRegion) return;

    // Clear existing polygon
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    // Draw new polygon
    const polygon = new google.maps.Polygon({
      paths: selectedRegion,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
    });

    polygon.setMap(map);
    polygonRef.current = polygon;

    // Fit bounds to polygon
    const bounds = new google.maps.LatLngBounds();
    selectedRegion.forEach(point => bounds.extend(point));
    map.fitBounds(bounds);
  }, [map, selectedRegion]);

  // Handle green zone overlays
  useEffect(() => {
    if (!map) return;

    // Clear existing green zone polygons
    greenZonePolygonsRef.current.forEach(polygon => polygon.setMap(null));
    greenZonePolygonsRef.current = [];

    if (!activeScenario) return;

    // Draw green zones
    const colors = {
      park: '#22c55e',
      garden: '#84cc16',
      forest: '#15803d',
      wetland: '#0ea5e9'
    };

    activeScenario.greenZones.forEach(zone => {
      const polygon = new google.maps.Polygon({
        paths: zone.coordinates,
        strokeColor: colors[zone.type],
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: colors[zone.type],
        fillOpacity: 0.35,
      });

      polygon.setMap(map);
      greenZonePolygonsRef.current.push(polygon);

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: 600;">${zone.name}</h3>
            <p style="margin: 0; font-size: 14px; color: #64748b;">Type: ${zone.type}</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748b;">Area: ${(zone.area / 1000).toFixed(1)}k m²</p>
          </div>
        `
      });

      polygon.addListener('click', (e: google.maps.PolyMouseEvent) => {
        infoWindow.setPosition(e.latLng);
        infoWindow.open(map);
      });
    });
  }, [map, activeScenario]);

  // Update temp polygon while drawing
  useEffect(() => {
    if (!map || !isDrawing) return;

    // Clear temp polygon
    if (tempPolygonRef.current) {
      tempPolygonRef.current.setMap(null);
    }

    if (drawingPoints.length < 2) return;

    // Draw temp polygon
    const polygon = new google.maps.Polygon({
      paths: drawingPoints,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
    });

    polygon.setMap(map);
    tempPolygonRef.current = polygon;
  }, [map, isDrawing, drawingPoints]);

  const handleStartDrawing = () => {
    if (!map) return;
    setIsDrawing(true);
    setDrawingPoints([]);

    // Add click listener to map
    const clickListener = google.maps.event.addListener(map, 'click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      
      const newPoint = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      
      setDrawingPoints(prev => [...prev, newPoint]);
    });

    // Store listener to remove later
    (map as any)._drawingClickListener = clickListener;
  };

  const handleFinishDrawing = () => {
    if (!map || drawingPoints.length < 3) return;

    // Remove click listener
    if ((map as any)._drawingClickListener) {
      google.maps.event.removeListener((map as any)._drawingClickListener);
      delete (map as any)._drawingClickListener;
    }

    // Clear temp polygon
    if (tempPolygonRef.current) {
      tempPolygonRef.current.setMap(null);
      tempPolygonRef.current = null;
    }

    onRegionSelect(drawingPoints);
    setIsDrawing(false);
    setDrawingPoints([]);
  };

  const handleCancelDrawing = () => {
    if (!map) return;

    // Remove click listener
    if ((map as any)._drawingClickListener) {
      google.maps.event.removeListener((map as any)._drawingClickListener);
      delete (map as any)._drawingClickListener;
    }

    // Clear temp polygon
    if (tempPolygonRef.current) {
      tempPolygonRef.current.setMap(null);
      tempPolygonRef.current = null;
    }

    setIsDrawing(false);
    setDrawingPoints([]);
  };

  const handleSearch = () => {
    if (!map || !searchQuery.trim()) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(15);
        
        // Add a marker for the searched location
        new google.maps.Marker({
          position: location,
          map: map,
          title: searchQuery
        });
      } else {
        alert('Location not found. Please try a different search term.');
      }
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls Bar */}
      {!isLoading && !loadError && !hideControls && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex gap-4 items-center">
            {/* Select Region Button */}
            <button
              onClick={handleStartDrawing}
              disabled={isDrawing}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-emerald-400 transition-colors text-sm"
            >
              {isDrawing ? 'Drawing...' : 'Select Region'}
            </button>
            
            {/* Search Button */}

            
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <input
                ref={searchBoxRef}
                type="text"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Drawing Status */}
            {isDrawing && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-slate-600">{drawingPoints.length} points</span>
                <button
                  onClick={handleFinishDrawing}
                  disabled={drawingPoints.length < 3}
                  className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 disabled:bg-slate-300"
                >
                  Finish
                </button>
                <button
                  onClick={handleCancelDrawing}
                  className="px-3 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            )}
            
            {selectedRegion && !isDrawing && (
              <span className="text-sm text-emerald-600 font-medium">✓ Region selected</span>
            )}
          </div>
        </div>
      )}
      
      <div className="relative flex-1">
        <div ref={mapRef} className="w-full h-full bg-slate-900" />
      
      {/* Loading Overlay */}
      {isLoading && !loadError && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading Google Maps...</p>
            <p className="text-slate-400 text-sm mt-2">This may take a moment</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-white text-lg mb-2">Failed to Load Google Maps</h3>
            <p className="text-slate-400 text-sm mb-4">
              There was an error loading Google Maps. Please check your API key and ensure it has the following APIs enabled:
            </p>
            <ul className="text-slate-400 text-sm text-left space-y-1 mb-4">
              <li>• Maps JavaScript API</li>
              <li>• Drawing Library</li>
            </ul>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}
      
      {/* Drawing Instructions */}
      {!isLoading && !loadError && isDrawing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 z-10">
          <p className="text-sm text-slate-700 text-center">Click on map to add points</p>
        </div>
      )}

      {/* Legend */}
      {activeScenario && !isLoading && !loadError && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-sm mb-2 text-slate-900">Green Zone Types</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
              <span className="text-sm text-slate-600">Park</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#84cc16' }} />
              <span className="text-sm text-slate-600">Garden</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#15803d' }} />
              <span className="text-sm text-slate-600">Forest</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0ea5e9' }} />
              <span className="text-sm text-slate-600">Wetland</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
