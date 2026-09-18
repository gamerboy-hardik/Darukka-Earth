import React, { useState } from 'react';
import Map, { NavigationControl, Marker, type ViewStateChangeEvent } from 'react-map-gl/mapbox';
import { motion } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MAP_STYLES = [
  { id: 'light-v11', name: 'Light', url: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark-v11', name: 'Dark', url: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'satellite-v9', name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-v9' },
  { id: 'streets-v12', name: 'Streets', url: 'mapbox://styles/mapbox/streets-v12' },
];

// Fallback coordinates for seeded projects since they don't have lat/lng in DB
const PROJECT_COORDINATES: Record<string, { lat: number, lng: number }> = {
  "Sundarbans Mangrove Restoration": { lat: 21.9497, lng: 89.1833 },
  "Western Ghats Reforestation": { lat: 13.5, lng: 75.0 },
  "Thar Desert Greening": { lat: 26.9124, lng: 70.9048 },
  "Himalayan Pine Protection": { lat: 30.0668, lng: 79.0193 },
  "Cauvery Basin Revitalization": { lat: 11.9338, lng: 79.8297 }
};

interface MapWrapperProps {
  projects?: any[];
}

export default function MapWrapper({ projects = [] }: MapWrapperProps) {
  const [viewState, setViewState] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 4.5
  });
  
  const [mapStyle, setMapStyle] = useState(MAP_STYLES[3].url); // Streets - matches reference

  if (!MAPBOX_TOKEN) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 bg-light text-muted p-4 text-center">
        <div>
          <i className="fa fa-map mb-3" style={{ fontSize: '3rem' }}></i>
          <h5>Mapbox Token Required</h5>
          <p>Please add <code>VITE_MAPBOX_TOKEN</code> to your <code>.env</code> file to render the map.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Map Style Switcher */}
      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', gap: '4px' }}>
        {MAP_STYLES.map(style => (
          <button
            key={style.id}
            onClick={() => setMapStyle(style.url)}
            style={{
              padding: '6px 12px',
              border: mapStyle === style.url ? '1.5px solid #1CAAD9' : '1px solid #d1d5db',
              borderRadius: '6px',
              background: mapStyle === style.url ? '#EFF9FD' : '#fff',
              color: mapStyle === style.url ? '#1CAAD9' : '#374151',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              transition: 'all 0.15s',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {style.name}
          </button>
        ))}
      </div>

      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        
        {projects.map((project, idx) => {
          const coords = PROJECT_COORDINATES[project.name] || { lat: project.latitude, lng: project.longitude };
          if (!coords.lat || !coords.lng) return null;
          
          return (
            <Marker 
              key={project.id || idx}
              longitude={coords.lng}
              latitude={coords.lat}
              anchor="bottom"
            >
              <motion.div 
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: idx * 0.1 
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  // Pan to marker on click
                  setViewState({
                    ...viewState,
                    longitude: coords.lng,
                    latitude: coords.lat,
                    zoom: 6
                  });
                }}
                style={{
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {/* Custom Map Pin Icon */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #1CAAD9 0%, #0d8eb8 100%)',
                  borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  boxShadow: '0 4px 12px rgba(28, 170, 217, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff'
                }}>
                  <div style={{
                    transform: 'rotate(45deg)',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginTop: '-2px'
                  }}>
                    {idx + 1}
                  </div>
                </div>
              </motion.div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
