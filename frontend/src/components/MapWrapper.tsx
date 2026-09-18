import React, { useState, useEffect } from 'react';
import Map, { NavigationControl, Marker, Popup, Source, Layer, type ViewStateChangeEvent } from 'react-map-gl/mapbox';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'mapbox-gl/dist/mapbox-gl.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip
);

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

const PROJECT_POLYGONS: Record<string, any> = {
  "Sundarbans Mangrove Restoration": {"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {}, "geometry": {"type": "Polygon", "coordinates": [[[89.1333, 21.8997], [89.2333, 21.8997], [89.2333, 21.9997], [89.1333, 21.9997], [89.1333, 21.8997]]]}}]},
  "Western Ghats Reforestation": {"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {}, "geometry": {"type": "Polygon", "coordinates": [[[74.95, 13.45], [75.05, 13.45], [75.05, 13.55], [74.95, 13.55], [74.95, 13.45]]]}}]},
  "Thar Desert Greening": {"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {}, "geometry": {"type": "Polygon", "coordinates": [[[70.8548, 26.8624], [70.95479999999999, 26.8624], [70.95479999999999, 26.962400000000002], [70.8548, 26.962400000000002], [70.8548, 26.8624]]]}}]},
  "Himalayan Pine Protection": {"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {}, "geometry": {"type": "Polygon", "coordinates": [[[78.9693, 30.0168], [79.0693, 30.0168], [79.0693, 30.1168], [78.9693, 30.1168], [78.9693, 30.0168]]]}}]},
  "Cauvery Basin Revitalization": {"type": "FeatureCollection", "features": [{"type": "Feature", "properties": {}, "geometry": {"type": "Polygon", "coordinates": [[[79.7797, 11.883799999999999], [79.8797, 11.883799999999999], [79.8797, 11.9838], [79.7797, 11.9838], [79.7797, 11.883799999999999]]]}}]},
};

interface MapWrapperProps {
  projects?: any[];
  clickedProject?: any;
  setClickedProject?: (p: any) => void;
}

export default function MapWrapper({ projects = [], clickedProject = null, setClickedProject = () => {} }: MapWrapperProps) {
  const mapRef = React.useRef<any>(null);
  const [viewState, setViewState] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 4.5
  });
  
  const [mapStyle, setMapStyle] = useState(MAP_STYLES[3].url); // Streets - matches reference
  const [hoveredProject, setHoveredProject] = useState<any | null>(null);

  useEffect(() => {
    if (clickedProject && mapRef.current) {
      let lat = clickedProject.latitude;
      let lng = clickedProject.longitude;
      if (!lat || !lng) {
        const fallback = PROJECT_COORDINATES[clickedProject.name];
        if (fallback) {
          lat = fallback.lat;
          lng = fallback.lng;
        }
      }
      if (lat && lng) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 8, duration: 1500 });
      }
    }
  }, [clickedProject]);

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
        ref={mapRef}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.2)';
                  setHoveredProject(project);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  setHoveredProject(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setClickedProject(project);
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

        {/* Polygons */}
        {projects.map((project, idx) => {
          let geojson = null;
          if (project.boundary_geojson) {
            try {
              geojson = JSON.parse(project.boundary_geojson);
            } catch (e) {
              geojson = null;
            }
          }
          if (!geojson && PROJECT_POLYGONS[project.name]) {
            geojson = PROJECT_POLYGONS[project.name];
          }

          if (!geojson) return null;

          return (
            <Source key={`source-${project.id || idx}`} id={`source-${project.id || idx}`} type="geojson" data={geojson}>
              <Layer
                id={`layer-${project.id || idx}`}
                type="fill"
                paint={{
                  'fill-color': '#1CAAD9',
                  'fill-opacity': 0.4,
                  'fill-outline-color': '#111827'
                }}
              />
            </Source>
          );
        })}

        {/* Hover Popup */}
        {hoveredProject && (
          <Popup
            longitude={(PROJECT_COORDINATES[hoveredProject.name] && PROJECT_COORDINATES[hoveredProject.name].lng) || hoveredProject.longitude}
            latitude={(PROJECT_COORDINATES[hoveredProject.name] && PROJECT_COORDINATES[hoveredProject.name].lat) || hoveredProject.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={30}
          >
            <div style={{ padding: '8px', maxWidth: '200px' }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700 }}>{hoveredProject.name}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                {hoveredProject.description}
              </p>
            </div>
          </Popup>
        )}
      </Map>

        {/* Click Modal (Deep Details) */}
      <AnimatePresence>
        {clickedProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              right: '24px',
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              zIndex: 20,
              display: 'flex',
              gap: '30px',
              maxHeight: '300px'
            }}
          >
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800 }}>{clickedProject.name}</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', background: '#1CAAD915', color: '#1CAAD9', borderRadius: '20px' }}>
                  {clickedProject.project_type.toUpperCase()}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', background: '#f3f4f6', color: '#374151', borderRadius: '20px' }}>
                  {clickedProject.status.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#4B5563', lineHeight: 1.6 }}>
                {clickedProject.description}
              </p>
            </div>
            
            {/* Chart Area */}
            <div style={{ flex: 1.5, minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Performance Over Time (CO2 Mitigated)</div>
              <div style={{ flex: 1, minHeight: '150px', position: 'relative' }}>
                <Line
                  data={{
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                      {
                        label: 'tCO2e Mitigated',
                        data: [1200, 1900, 2400, 3200, 4100, 5000],
                        borderColor: '#1CAAD9',
                        backgroundColor: '#1CAAD9',
                        borderWidth: 3,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        tension: 0.4
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#374151',
                        bodyColor: '#374151',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                      }
                    },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: '#6B7280', font: { size: 11 } }, border: { display: false } },
                      y: { grid: { display: false }, ticks: { color: '#6B7280', font: { size: 11 } }, border: { display: false } }
                    }
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setClickedProject(null)}
                style={{ padding: '8px 16px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}
              >
                Close
              </button>
              <button 
                onClick={() => window.location.href = '/analytics'}
                style={{ padding: '8px 16px', border: 'none', background: '#111827', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap' }}
              >
                Full Analytics
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
