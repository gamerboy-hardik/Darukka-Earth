import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import MapWrapper from '../components/MapWrapper';
import { fetchWithAuth } from '../lib/api';
import Map from 'react-map-gl/mapbox';
import DrawControl from '../components/DrawControl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const PROJECT_IMAGES = [
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
];

const TYPE_COLORS: Record<string, string> = {
  carbon: '#1CAAD9',
  biodiversity: '#10B981',
  mixed: '#8B5CF6',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#10B981',
  draft: '#F59E0B',
  completed: '#3B82F6',
  paused: '#6B7280',
};

const INDIA_REGIONS: Record<string, string> = {
  1: 'West Bengal, India',
  2: 'Karnataka, India',
  3: 'Rajasthan, India',
  4: 'Uttarakhand, India',
  5: 'Tamil Nadu, India',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMore, setShowMore] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    project_type: 'carbon',
    latitude: '',
    longitude: '',
    boundary_geojson: ''
  });

  const [modalViewState, setModalViewState] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 3
  });
  const [searchLocation, setSearchLocation] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [recommendedLocation, setRecommendedLocation] = useState<{name: string, lng: number, lat: number} | null>(null);
  const [clickedProject, setClickedProject] = useState<any | null>(null);

  // Debounced effect to fetch recommended location based on Project Name
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (newProject.name.length > 3) {
        try {
          const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(newProject.name)}.json?access_token=${MAPBOX_TOKEN}&types=place,region,country,poi`);
          const data = await res.json();
          if (data.features && data.features.length > 0) {
            const bestMatch = data.features[0];
            setRecommendedLocation({
              name: bestMatch.place_name,
              lng: bestMatch.center[0],
              lat: bestMatch.center[1]
            });
          } else {
            setRecommendedLocation(null);
          }
        } catch (e) {
          setRecommendedLocation(null);
        }
      } else {
        setRecommendedLocation(null);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [newProject.name]);

  const onDrawUpdate = React.useCallback((e: { features: any[] }) => {
    if (e.features && e.features.length > 0) {
      const firstCoord = e.features[0].geometry?.coordinates?.[0]?.[0];
      setNewProject(prev => ({
        ...prev,
        boundary_geojson: JSON.stringify({
          type: "FeatureCollection",
          features: e.features
        }),
        ...(firstCoord && !prev.latitude && !prev.longitude ? {
           longitude: firstCoord[0].toString(),
           latitude: firstCoord[1].toString()
        } : {})
      }));
    } else {
      setNewProject(prev => ({ ...prev, boundary_geojson: '' }));
    }
  }, []);

  const handleLocationSearch = async () => {
    if (!searchLocation.trim()) return;
    setIsSearchingLocation(true);
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchLocation)}.json?access_token=${MAPBOX_TOKEN}`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setModalViewState({
          longitude: lng,
          latitude: lat,
          zoom: 12
        });
      } else {
        alert("Location not found. Please try again.");
      }
    } catch (error) {
      alert("Error searching location.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openEditModal = (project: any) => {
    setEditingProjectId(project.id);
    setNewProject({
      name: project.name,
      description: project.description || '',
      project_type: project.project_type || 'carbon',
      latitude: project.latitude?.toString() || '',
      longitude: project.longitude?.toString() || '',
      boundary_geojson: project.boundary_geojson || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: newProject.name,
        description: newProject.description,
        project_type: newProject.project_type,
        ...(editingProjectId ? {} : { status: "active" }),
        latitude: newProject.latitude ? parseFloat(newProject.latitude) : null,
        longitude: newProject.longitude ? parseFloat(newProject.longitude) : null,
        boundary_geojson: newProject.boundary_geojson || null,
      };
      
      const url = editingProjectId ? `/api/projects/${editingProjectId}` : '/api/projects/';
      const method = editingProjectId ? 'PATCH' : 'POST';
      
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (editingProjectId) {
         setProjects(projects.map(p => p.id === editingProjectId ? data : p));
         if (clickedProject?.id === editingProjectId) setClickedProject(data);
      } else {
         setProjects([data, ...projects]);
      }
      
      setIsModalOpen(false);
      setEditingProjectId(null);
      setNewProject({ name: '', description: '', project_type: 'carbon', latitude: '', longitude: '', boundary_geojson: '' });
    } catch (error) {
      alert("Failed to save project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetchWithAuth(`/api/projects/${id}`, { method: 'DELETE' });
      setProjects(projects.filter(p => p.id !== id));
      if (clickedProject?.id === id) setClickedProject(null);
    } catch (error) {
      alert("Failed to delete project. Please try again.");
    }
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetchWithAuth('/api/projects/');
        const data = await response.json();
        if (Array.isArray(data)) setProjects(data);
        else throw new Error('bad data');
      } catch (err) {
        setProjects([
          { id: 1, name: "Sundarbans Mangrove Restoration", description: "Restoring native species in the Ganges delta to protect coastal communities and increase biodiversity.", project_type: "biodiversity", status: "active", latitude: 21.9497, longitude: 89.1833 },
          { id: 2, name: "Western Ghats Reforestation", description: "Preserving biodiversity hotspots and planting native saplings in Karnataka.", project_type: "carbon", status: "active", latitude: 12.9716, longitude: 77.5946 },
          { id: 3, name: "Thar Desert Greening", description: "Soil carbon sequestration in arid regions of Rajasthan using drought-resistant flora.", project_type: "mixed", status: "active", latitude: 26.9124, longitude: 70.9042 },
          { id: 4, name: "Himalayan Pine Protection", description: "Preventing deforestation and promoting sustainable agroforestry in Uttarakhand.", project_type: "biodiversity", status: "active", latitude: 30.3165, longitude: 78.0322 },
          { id: 5, name: "Cauvery Basin Revitalization", description: "River rejuvenation through large-scale tree planting along the Cauvery basin in Tamil Nadu.", project_type: "carbon", status: "draft", latitude: 11.1271, longitude: 78.6569 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || p.project_type === typeFilter;
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <>
      <div id="page-top" style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif", background: '#fff' }}>

      {/* ── NAVBAR ── */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', zIndex: 1000, flexShrink: 0 }}>
        <nav style={{ display: 'flex', alignItems: 'center', padding: '0 24px', height: '60px', gap: '24px' }}>

          {/* Brand */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #1CAAD9, #0D8FBF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa fa-leaf" style={{ color: '#fff', fontSize: '14px' }}></i>
            </div>
            <span style={{ fontWeight: 800, fontSize: '16px', color: '#111827', fontFamily: "'Outfit', sans-serif" }}>Darukaa.Earth</span>
          </a>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
            <a href="/dashboard" style={{ padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, color: '#1CAAD9', background: '#EFF9FD' }}>Map View</a>
            <a href="/analytics" style={{ padding: '6px 14px', borderRadius: '6px', textDecoration: 'none', fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>Analytics</a>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <span 
              onClick={handleLogout}
              style={{ fontSize: '14px', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Click to logout"
            >
              <i className="fa fa-sign-out-alt" style={{ marginRight: '6px' }}></i>
              Logout
            </span>
            <button onClick={() => navigate('/analytics')} style={{ padding: '7px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
              <i className="fa fa-chart-bar" style={{ marginRight: '6px', color: '#1CAAD9' }}></i>Reports
            </button>
            <button 
              onClick={() => {
                setEditingProjectId(null);
                setNewProject({ name: '', description: '', project_type: 'carbon', latitude: '', longitude: '', boundary_geojson: '' });
                setIsModalOpen(true);
              }}
              style={{ padding: '8px 16px', background: '#111827', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa fa-plus" style={{ marginRight: '6px', fontSize: '11px' }}></i>
              Add Project
            </button>
          </div>
        </nav>
      </header>

      {/* ── MAIN SPLIT LAYOUT ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Map Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapWrapper 
            projects={projects} 
            clickedProject={clickedProject}
            setClickedProject={setClickedProject}
          />
        </div>

        {/* ── RIGHT: FILTER + RESULTS ── */}
        <div style={{ flex: '0 0 520px', width: '520px', display: 'flex', flexDirection: 'column', background: '#f9fafb', borderLeft: '1px solid #e5e7eb', overflowY: 'auto' }}>

          {/* Search Filter Panel */}
          <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px 20px 0 20px' }}>
            <h6 style={{ fontWeight: 700, fontSize: '15px', color: '#111827', marginBottom: '14px', fontFamily: "'Outfit', sans-serif" }}>
              Search Filter
            </h6>

            {/* Row 1 */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ flex: 2 }}>
                <input
                  type="text"
                  placeholder="Region, State or Project Name"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', color: '#374151', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="">Type</option>
                  <option value="carbon">Carbon</option>
                  <option value="biodiversity">Biodiversity</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', color: '#374151', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="">Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Row 2 - More Options */}
            {showMore && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="text" placeholder="Min Area (ha)" style={{ flex: 1, padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                <input type="text" placeholder="Max Area (ha)" style={{ flex: 1, padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                <input type="text" placeholder="Min tCO2e" style={{ flex: 1, padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                <input type="text" placeholder="Max tCO2e" style={{ flex: 1, padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}

            {/* Row 3 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px' }}>
              <button
                onClick={() => setShowMore(!showMore)}
                style={{ background: 'none', border: 'none', fontSize: '13px', color: '#1CAAD9', fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                <i className="fa fa-plus-circle" style={{ marginRight: '6px' }}></i>
                {showMore ? 'Less Options' : 'More Options'}
              </button>
              <button
                onClick={() => alert("Search and filtering functionality coming soon!")}
                style={{ padding: '9px 28px', background: '#1CAAD9', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Results Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#fff', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              {loading ? 'Loading...' : `${filtered.length} Projects Found`}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{ padding: '6px 10px', border: '1px solid ' + (viewMode === 'grid' ? '#1CAAD9' : '#d1d5db'), borderRadius: '6px', background: viewMode === 'grid' ? '#EFF9FD' : '#fff', color: viewMode === 'grid' ? '#1CAAD9' : '#6B7280', cursor: 'pointer', fontSize: '13px' }}
              >
                <i className="fa fa-th"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{ padding: '6px 10px', border: '1px solid ' + (viewMode === 'list' ? '#1CAAD9' : '#d1d5db'), borderRadius: '6px', background: viewMode === 'list' ? '#EFF9FD' : '#fff', color: viewMode === 'list' ? '#1CAAD9' : '#6B7280', cursor: 'pointer', fontSize: '13px' }}
              >
                <i className="fa fa-list"></i>
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <i className="fa fa-spinner fa-spin fa-2x" style={{ color: '#1CAAD9' }}></i>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280', fontSize: '14px' }}>
                <i className="fa fa-search fa-2x" style={{ marginBottom: '10px', display: 'block', color: '#d1d5db' }}></i>
                No projects match your filters.
              </div>
            ) : viewMode === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {filtered.map((project, idx) => (
                  <ProjectGridCard key={project.id} project={project} idx={idx} setClickedProject={setClickedProject} onEdit={() => openEditModal(project)} onDelete={() => handleDeleteProject(project.id)} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.map((project, idx) => (
                  <ProjectListCard key={project.id} project={project} idx={idx} setClickedProject={setClickedProject} onEdit={() => openEditModal(project)} onDelete={() => handleDeleteProject(project.id)} />
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* ── ADD PROJECT MODAL ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(17, 24, 39, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#111827', fontWeight: 700 }}>{editingProjectId ? 'Edit Project' : 'Add New Project'}</h3>
            <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Project Name</label>
                <input required type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} placeholder="e.g. Sundarbans Restoration" />
                {recommendedLocation && (
                  <div style={{ marginTop: '6px' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        setModalViewState({
                          longitude: recommendedLocation.lng,
                          latitude: recommendedLocation.lat,
                          zoom: 12
                        });
                      }}
                      style={{ background: '#EFF9FD', border: '1px solid #1CAAD9', color: '#1CAAD9', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <i className="fa fa-map-marker" /> Auto-detect: {recommendedLocation.name} (Click to zoom)
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Description</label>
                <textarea required rows={3} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }} placeholder="Brief overview of the project..." />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Project Type</label>
                  <select value={newProject.project_type} onChange={e => setNewProject({...newProject, project_type: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: '#fff' }}>
                    <option value="carbon">Carbon</option>
                    <option value="biodiversity">Biodiversity</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Project Area (Optional: Draw on map or enter coordinates)
                </label>
                
                {/* Location Search */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                  <input 
                    type="text" 
                    value={searchLocation} 
                    onChange={e => setSearchLocation(e.target.value)} 
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLocationSearch();
                      }
                    }}
                    style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px' }} 
                    placeholder="Search State or City to auto-zoom..." 
                  />
                  <button 
                    type="button" 
                    onClick={handleLocationSearch} 
                    disabled={isSearchingLocation}
                    style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#374151' }}
                  >
                    {isSearchingLocation ? '...' : 'Search'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <input type="number" step="any" value={newProject.latitude} onChange={e => setNewProject({...newProject, latitude: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px' }} placeholder="Latitude (e.g. 21.9497)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="number" step="any" value={newProject.longitude} onChange={e => setNewProject({...newProject, longitude: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px' }} placeholder="Longitude (e.g. 89.1833)" />
                  </div>
                </div>
                <div style={{ height: '220px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #d1d5db', position: 'relative' }}>
                  {MAPBOX_TOKEN ? (
                    <Map
                      {...modalViewState}
                      onMove={evt => setModalViewState(evt.viewState)}
                      mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                      mapboxAccessToken={MAPBOX_TOKEN}
                      style={{ cursor: 'crosshair' }}
                    >
                      <DrawControl
                        position="top-left"
                        displayControlsDefault={false}
                        controls={{ polygon: true, trash: true }}
                        defaultMode="draw_polygon"
                        onCreate={onDrawUpdate}
                        onUpdate={onDrawUpdate}
                        onDelete={onDrawUpdate}
                      />
                    </Map>
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', background: '#f3f4f6', height: '100%' }}>Mapbox token required</div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '9px 18px', background: '#f3f4f6', border: 'none', borderRadius: '8px', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '9px 24px', background: '#1CAAD9', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Saving...' : (editingProjectId ? 'Save Changes' : 'Publish Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/* ── GRID CARD ── */
function ProjectGridCard({ project, idx, setClickedProject, onEdit, onDelete }: { project: any; idx: number; setClickedProject: any, onEdit: () => void, onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);
  const img = PROJECT_IMAGES[idx % PROJECT_IMAGES.length];
  const typeColor = TYPE_COLORS[project.project_type] || '#6B7280';
  const statusColor = STATUS_COLORS[project.status] || '#6B7280';

  return (
    <div
      onClick={() => setClickedProject(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 8px 25px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
        cursor: 'pointer',
      }}
    >
      {/* Image */}
      <div style={{ height: '140px', background: `url(${img}) center/cover`, position: 'relative' }}>
        <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              style={{ width: '28px', height: '28px', background: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#3B82F6' }}
              title="Edit Project Details"
            >
              <i className="fa fa-pencil" style={{ fontSize: '12px' }}></i>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{ width: '28px', height: '28px', background: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#EF4444' }}
              title="Delete Project"
            >
              <i className="fa fa-trash" style={{ fontSize: '12px' }}></i>
            </button>
          </div>
          <span style={{ background: '#111827', color: typeColor, fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {project.project_type}
          </span>
        </div>
      </div>
      
      <div style={{ padding: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 700, color: '#111827', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
          {project.name}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280', fontSize: '12px', marginBottom: '16px' }}>
          <i className="fa fa-map-marker" style={{ color: '#9CA3AF' }} />
          <span>{['Sundarbans', 'Cauvery', 'Maharashtra', 'Thar', 'Western Ghats', 'Himalayan'].find(l => project.name.includes(l))} India</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>5,000+</div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>tCO2e</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>4.2</div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>Bio Score</div>
          </div>
          <div style={{ color: statusColor, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>
            {project.status}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── LIST CARD ── */
function ProjectListCard({ project, idx, setClickedProject, onEdit, onDelete }: { project: any; idx: number; setClickedProject: any, onEdit: () => void, onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);
  const img = PROJECT_IMAGES[idx % PROJECT_IMAGES.length];
  const typeColor = TYPE_COLORS[project.project_type] || '#6B7280';
  const statusColor = STATUS_COLORS[project.status] || '#6B7280';

  return (
    <div
      onClick={() => setClickedProject(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.06)'
      }}
    >
      <img src={img} alt={project.name} style={{ width: '130px', objectFit: 'cover', flexShrink: 0 }} />
      <div style={{ padding: '14px 16px', flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', right: '16px', bottom: '16px', display: 'flex', gap: '8px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            style={{ width: '32px', height: '32px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3B82F6', transition: 'all 0.2s' }}
            title="Edit Project"
          >
            <i className="fa fa-pencil" style={{ fontSize: '13px' }}></i>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ width: '32px', height: '32px', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444', transition: 'all 0.2s' }}
            title="Delete Project"
          >
            <i className="fa fa-trash" style={{ fontSize: '13px' }}></i>
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', paddingRight: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: typeColor, background: typeColor + '18', padding: '2px 8px', borderRadius: '20px' }}>
            {project.project_type.toUpperCase()}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: statusColor }}>{project.status.toUpperCase()}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827', marginBottom: '4px' }}>{project.name}</div>
        <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
          <i className="fa fa-map-marker-alt" style={{ marginRight: '4px' }}></i>
          {INDIA_REGIONS[project.id] || 'India'}
        </div>
        <div style={{ fontSize: '12px', color: '#9CA3AF', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
          {project.description}
        </div>
      </div>
    </div>
  );
}
