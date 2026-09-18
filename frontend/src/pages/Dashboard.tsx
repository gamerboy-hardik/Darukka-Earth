import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import MapWrapper from '../components/MapWrapper';
import { fetchWithAuth } from '../lib/api';

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

  // Add Project Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    project_type: 'carbon',
    latitude: '',
    longitude: ''
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: newProject.name,
        description: newProject.description,
        project_type: newProject.project_type,
        status: "active",
        latitude: newProject.latitude ? parseFloat(newProject.latitude) : null,
        longitude: newProject.longitude ? parseFloat(newProject.longitude) : null,
      };
      
      const res = await fetchWithAuth('/api/projects/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      setProjects([data, ...projects]);
      setIsModalOpen(false);
      setNewProject({ name: '', description: '', project_type: 'carbon', latitude: '', longitude: '' });
    } catch (error) {
      alert("Failed to add project. Please try again.");
    } finally {
      setIsSubmitting(false);
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
              onClick={() => setIsModalOpen(true)}
              style={{ padding: '7px 16px', border: 'none', borderRadius: '8px', background: '#111827', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
            >
              <i className="fa fa-plus" style={{ marginRight: '6px', fontSize: '11px' }}></i>
              Add Project
            </button>
          </div>
        </nav>
      </header>

      {/* ── MAIN SPLIT LAYOUT ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── LEFT: FULL MAP ── */}
        <div style={{ flex: '1 1 50%', position: 'relative', minWidth: 0 }}>
          <MapWrapper projects={projects} />
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
                  <ProjectGridCard key={project.id} project={project} idx={idx} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.map((project, idx) => (
                  <ProjectListCard key={project.id} project={project} idx={idx} />
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
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#111827', fontWeight: 700 }}>Add New Project</h3>
            <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Project Name</label>
                <input required type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} placeholder="e.g. Sundarbans Restoration" />
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
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Latitude</label>
                  <input type="number" step="any" value={newProject.latitude} onChange={e => setNewProject({...newProject, latitude: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} placeholder="e.g. 21.9497" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Longitude</label>
                  <input type="number" step="any" value={newProject.longitude} onChange={e => setNewProject({...newProject, longitude: e.target.value})} style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} placeholder="e.g. 89.1833" />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '9px 18px', background: '#f3f4f6', border: 'none', borderRadius: '8px', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '9px 24px', background: '#1CAAD9', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Saving...' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── GRID CARD ── */
function ProjectGridCard({ project, idx }: { project: any; idx: number }) {
  const [hovered, setHovered] = useState(false);
  const img = PROJECT_IMAGES[idx % PROJECT_IMAGES.length];
  const typeColor = TYPE_COLORS[project.project_type] || '#6B7280';
  const statusColor = STATUS_COLORS[project.status] || '#6B7280';

  return (
    <div
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
      <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
        <img
          src={img}
          alt={project.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        {/* Like badge */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', background: typeColor, borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>
          {project.project_type.toUpperCase()}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
        <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{project.name}</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
          <i className="fa fa-map-marker-alt" style={{ fontSize: '11px', color: '#9CA3AF' }}></i>
          <span style={{ fontSize: '12px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {INDIA_REGIONS[project.id] || 'India'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>
              <span style={{ fontWeight: 700, color: '#111827', display: 'block' }}>5,000+</span>
              tCO2e
            </span>
            <span style={{ fontSize: '11px', color: '#6B7280' }}>
              <span style={{ fontWeight: 700, color: '#111827', display: 'block' }}>4.2</span>
              Bio Score
            </span>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: statusColor, background: statusColor + '18', padding: '3px 8px', borderRadius: '20px' }}>
            {project.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── LIST CARD ── */
function ProjectListCard({ project, idx }: { project: any; idx: number }) {
  const img = PROJECT_IMAGES[idx % PROJECT_IMAGES.length];
  const typeColor = TYPE_COLORS[project.project_type] || '#6B7280';
  const statusColor = STATUS_COLORS[project.status] || '#6B7280';

  return (
    <div style={{ display: 'flex', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer' }}>
      <img src={img} alt={project.name} style={{ width: '130px', objectFit: 'cover', flexShrink: 0 }} />
      <div style={{ padding: '14px 16px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
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
