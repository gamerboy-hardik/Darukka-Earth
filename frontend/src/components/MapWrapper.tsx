import React, { useState, useEffect } from 'react';
import Map, { NavigationControl, Marker, type ViewStateChangeEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MAP_STYLES = [
  { id: 'light-v11', name: 'Light', url: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark-v11', name: 'Dark', url: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'satellite-v9', name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-v9' },
  { id: 'streets-v12', name: 'Streets', url: 'mapbox://styles/mapbox/streets-v12' },
];

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
        
        {projects.map((project, idx) => (
          project.longitude && project.latitude && (
            <Marker 
              key={project.id || idx}
              longitude={project.longitude}
              latitude={project.latitude}
              anchor="center"
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#1CAAD9',
                border: '3px solid #fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {idx + 1}
              </div>
            </Marker>
          )
        ))}
      </Map>
    </div>
  );
}
