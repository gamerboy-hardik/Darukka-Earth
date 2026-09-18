import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { fetchWithAuth } from '../lib/api';

export default function Analytics() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        // We assume we want to pull metrics for project id 1 for demonstration.
        // In a real app, this would be dynamic.
        const response = await fetchWithAuth('/api/metrics/project/1');
        const data = await response.json();
        
        // Transform for charting
        const chartData = data.map((d: any) => ({
          name: new Date(d.recorded_at).toLocaleDateString(),
          Carbon: d.carbon_tonnes_co2e,
          Biodiversity: d.biodiversity_score,
          Survival: d.tree_survival_rate
        }));
        setMetrics(chartData);

      } catch (err) {
        // Fallback to mock data if API fails (e.g. DB is offline)
        const mockData = [
          { name: 'Jan', Carbon: 4000, Biodiversity: 2.4, Survival: 80 },
          { name: 'Feb', Carbon: 4500, Biodiversity: 2.7, Survival: 82 },
          { name: 'Mar', Carbon: 4800, Biodiversity: 3.1, Survival: 85 },
          { name: 'Apr', Carbon: 5100, Biodiversity: 3.5, Survival: 86 },
          { name: 'May', Carbon: 5400, Biodiversity: 3.9, Survival: 89 },
          { name: 'Jun', Carbon: 5900, Biodiversity: 4.2, Survival: 90 },
        ];
        setMetrics(mockData);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="ts-page-wrapper ts-has-bokeh-bg" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header id="ts-header" className="navbar-light bg-white border-bottom shadow-sm z-10" style={{ zIndex: 1000 }}>
        <nav id="ts-primary-navigation" className="navbar navbar-expand-md">
          <div className="container-fluid px-4">
            <a className="navbar-brand text-dark" href="/">
              <strong>Darukaa.Earth</strong>
            </a>
            
            <div className="navbar-nav mx-auto">
              <Link to="/dashboard" className="nav-link text-muted mx-2">Map View</Link>
              <Link to="/analytics" className="nav-link text-dark font-weight-bold mx-2" style={{ borderBottom: '2px solid var(--primary)' }}>Analytics</Link>
            </div>

            <div className="ml-auto d-flex align-items-center">
              <span className="text-muted mr-4 d-none d-sm-block">
                <i className="fa fa-user-circle mr-2"></i> {user?.full_name || user?.email}
              </span>
              <button onClick={handleLogout} className="btn btn-outline-secondary btn-sm">
                Logout
              </button>
            </div>
          </div>
        </nav>
      </header>

      <main className="container mt-4 pt-4 position-relative" style={{ zIndex: 10 }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="text-dark font-weight-bold"><i className="fa fa-chart-line mr-2" style={{ color: 'var(--primary)' }}></i> Project Impact Analytics</h2>
          <button onClick={() => alert("PDF report generation coming soon!")} className="btn btn-premium"><i className="fa fa-download mr-2"></i> Export Report</button>
        </div>

        {loading ? (
          <div className="text-center p-5"><i className="fa fa-spinner fa-spin fa-3x" style={{ color: 'var(--primary)' }}></i></div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <div className="card premium-card h-100">
                  <div className="card-body text-center">
                    <h5 className="text-muted mb-2 font-weight-bold">Total Carbon Sequestered</h5>
                    <h2 className="mb-0 text-success">30,100 <small className="text-muted">tCO2e</small></h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card premium-card h-100">
                  <div className="card-body text-center">
                    <h5 className="text-muted mb-2 font-weight-bold">Avg Biodiversity Score</h5>
                    <h2 className="text-info mb-0">3.8 <small className="text-muted">/ 5.0</small></h2>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card premium-card h-100">
                  <div className="card-body text-center">
                    <h5 className="text-muted mb-2 font-weight-bold">Overall Survival Rate</h5>
                    <h2 className="mb-0 text-primary">87%</h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and 3D Model */}
            <div className="row">
              <div className="col-lg-8 mb-4">
                <div className="card premium-card h-100">
                  <div className="card-body">
                    <h5 className="card-title mb-4 font-weight-bold text-dark">Carbon Accumulation Over Time</h5>
                    <div style={{ height: '350px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metrics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                          <XAxis dataKey="name" stroke="var(--text-muted)" />
                          <YAxis stroke="var(--text-muted)" />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-light)', color: 'var(--text-main)', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} />
                          <Legend />
                          <Line type="monotone" dataKey="Carbon" stroke="var(--success)" strokeWidth={3} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mb-4">
                <div className="card premium-card h-100">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title mb-4 font-weight-bold text-dark">Site Environment Preview</h5>
                    <div className="sketchfab-embed-wrapper flex-grow-1" style={{ minHeight: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                      <iframe 
                        title="Stylized Mangrove Greenhouse" 
                        frameBorder="0" 
                        allowFullScreen 
                        allow="autoplay; fullscreen; xr-spatial-tracking" 
                        src="https://sketchfab.com/models/4ad533f838f44fa583683ab7939c6aa1/embed?autostart=1&ui_theme=dark&transparent=1"
                        style={{ width: '100%', height: '100%' }}
                      ></iframe>
                    </div>
                    <p className="text-center text-muted mt-2 small mb-0">
                      Interactive 3D Mangrove Habitat
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
