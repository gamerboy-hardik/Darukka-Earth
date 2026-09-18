import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  Chart as ChartJS, 
  registerables 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { fetchWithAuth } from '../lib/api';

ChartJS.register(...registerables);

export default function Analytics() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [project, setProject] = useState<any>(null);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ref for custom gradients
  const chartRef = useRef<any>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const allRes = await fetchWithAuth('/api/projects/');
        const allData = await allRes.json();
        setAllProjects(allData);
      } catch (e) {
        console.error("Failed to fetch all projects", e);
      }

      let pData = { id: 0, name: 'Global Ecosystem', project_type: 'mixed', latitude: 0, longitude: 0, description: '' };
      if (projectId) {
        try {
          const res = await fetchWithAuth(`/api/projects/${projectId}`);
          pData = await res.json();
        } catch (e) {
          console.error("Failed to fetch project", e);
        }
      }
      setProject(pData);

      // Generate realistic 24-month dataset deterministically based on project type
      const isCarbon = pData.project_type === 'carbon';
      const isBio = pData.project_type === 'biodiversity';
      
      const data = [];
      let currentCarbon = isCarbon ? 5000 : 2000;
      let currentBio = isBio ? 4.2 : 3.1;
      let currentSurvival = 85;
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Deterministic pseudo-random seed based on project ID or name length
      const seed = pData.id || pData.name.length;
      const pseudoRandom = (i: number) => Math.abs(Math.sin(seed * i)) * 100;
      
      for (let year = 2024; year <= 2025; year++) {
        for (let m = 0; m < 12; m++) {
          const step = (year - 2024) * 12 + m;
          currentCarbon += Math.floor(pseudoRandom(step) * 5) + (m * 50);
          
          currentBio += (pseudoRandom(step) * 0.002);
          if (currentBio > 4.9) currentBio = 4.9;
          
          const seasonMod = (m > 3 && m < 7) ? -2 : 1;
          currentSurvival += seasonMod + (pseudoRandom(step) * 0.04 - 2);
          if (currentSurvival > 98) currentSurvival = 98;
          if (currentSurvival < 75) currentSurvival = 75;

          data.push({
            name: `${months[m]} '${year.toString().slice(2)}`,
            Carbon: currentCarbon,
            Biodiversity: parseFloat(currentBio.toFixed(2)),
            Survival: parseFloat(currentSurvival.toFixed(1))
          });
        }
      }
      
      setMetrics(data);
      setLoading(false);
    };

    loadData();
  }, [projectId]);

  const getGradient = (ctx: CanvasRenderingContext2D, chartArea: any) => {
    if (!chartArea) return 'transparent';
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, 'rgba(40, 167, 69, 0.05)');
    gradient.addColorStop(1, 'rgba(40, 167, 69, 0.4)');
    return gradient;
  };

  return (
    <div className="ts-page-wrapper ts-has-bokeh-bg" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header id="ts-header" className="navbar-light bg-white border-bottom shadow-sm z-10 d-print-none" style={{ zIndex: 1000 }}>
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

      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 15mm; }
            body { background-color: #fff !important; -webkit-print-color-adjust: exact; }
            .ts-page-wrapper { background: #fff !important; }
            .premium-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; break-inside: avoid; }
            .container-fluid { max-width: 100% !important; padding: 0 !important; width: 100% !important; }
            .row { margin: 0 !important; }
            .print-full-width { flex: 0 0 100% !important; max-width: 100% !important; padding: 0 !important; }
            .d-print-none { display: none !important; }
            .d-print-block { display: block !important; }
            canvas { max-height: 250px !important; width: 100% !important; }
            .sketchfab-embed-wrapper { display: none !important; } /* 3D models don't print well */
          }
        `}
      </style>
      <main className="container-fluid mt-4 pt-4 position-relative" style={{ zIndex: 10, maxWidth: '1400px' }}>
        <div className="row">
          <div className="col-md-3 d-print-none mb-4">
            <h5 className="font-weight-bold text-dark mb-3">All Projects</h5>
            <div className="list-group shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <button 
                onClick={() => window.location.href = '/analytics'}
                className={`list-group-item list-group-item-action ${!projectId ? 'active' : ''}`}
                style={!projectId ? { background: '#111827', borderColor: '#111827', color: '#fff' } : {}}
              >
                <strong>Global Ecosystem</strong>
              </button>
              {allProjects.map(p => (
                <button 
                  key={p.id}
                  onClick={() => window.location.href = `/analytics?projectId=${p.id}`}
                  className={`list-group-item list-group-item-action ${projectId === String(p.id) ? 'active' : ''}`}
                  style={projectId === String(p.id) ? { background: '#111827', borderColor: '#111827', color: '#fff' } : {}}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>{p.name}</strong>
                    <span className="badge" style={{ background: projectId === String(p.id) ? '#374151' : '#e5e7eb', color: projectId === String(p.id) ? '#fff' : '#6B7280', fontSize: '10px' }}>
                      {p.project_type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="col-md-9 print-full-width">
            {/* Custom Print Header (Only visible in PDF) */}
            <div className="d-none d-print-block mb-4 border-bottom pb-3">
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="font-weight-bold m-0" style={{ color: '#1CAAD9' }}>Darukaa.Earth</h2>
                <div className="text-right">
                  <h4 className="font-weight-bold m-0 text-dark">{project?.name || 'Ecosystem'}</h4>
                  <p className="text-muted m-0">Generated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 d-print-none">
              <div>
                <h2 className="text-dark font-weight-bold mb-1"><i className="fa fa-chart-line mr-2" style={{ color: 'var(--primary)' }}></i> {project?.name || 'Ecosystem'} Analytics</h2>
                {project?.project_type && (
                  <span className="badge badge-primary px-3 py-2 text-uppercase" style={{ fontSize: '12px', background: 'var(--primary)' }}>
                    {project.project_type} Project
                  </span>
                )}
              </div>
              <button onClick={() => window.print()} className="btn btn-premium"><i className="fa fa-download mr-2"></i> Export PDF Report</button>
            </div>

        {loading ? (
          <div className="text-center p-5"><i className="fa fa-spinner fa-spin fa-3x" style={{ color: 'var(--primary)' }}></i></div>
        ) : (
          <>
            {/* 4 KPI Cards */}
            <div className="row mb-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card premium-card h-100 border-0" style={{ boxShadow: '0 4px 20px rgba(40,167,69,0.1)' }}>
                  <div className="card-body text-center">
                    <h6 className="text-muted mb-2 font-weight-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Total Carbon (tCO2e)</h6>
                    <h2 className="mb-0 text-success font-weight-bold">{metrics[metrics.length-1]?.Carbon.toLocaleString()}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card premium-card h-100 border-0" style={{ boxShadow: '0 4px 20px rgba(23,162,184,0.1)' }}>
                  <div className="card-body text-center">
                    <h6 className="text-muted mb-2 font-weight-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Avg Bio Score</h6>
                    <h2 className="text-info mb-0 font-weight-bold">{metrics[metrics.length-1]?.Biodiversity} <small className="text-muted" style={{fontSize: '14px'}}>/ 5.0</small></h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card premium-card h-100 border-0" style={{ boxShadow: '0 4px 20px rgba(0,123,255,0.1)' }}>
                  <div className="card-body text-center">
                    <h6 className="text-muted mb-2 font-weight-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Tree Survival</h6>
                    <h2 className="mb-0 text-primary font-weight-bold">{metrics[metrics.length-1]?.Survival}%</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card premium-card h-100 border-0" style={{ boxShadow: '0 4px 20px rgba(253,126,20,0.1)' }}>
                  <div className="card-body text-center">
                    <h6 className="text-muted mb-2 font-weight-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '1px' }}>Area Restored</h6>
                    <h2 className="mb-0 font-weight-bold" style={{ color: '#fd7e14' }}>{project ? Math.floor(Math.abs(Math.sin((project.id || project.name.length) * 5)) * 15000 + 1000).toLocaleString() : '12,450'} <small className="text-muted" style={{fontSize: '14px'}}>Ha</small></h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Large Area Chart & Doughnut */}
            <div className="row mb-4">
              <div className="col-lg-8 mb-4 mb-lg-0">
                <div className="card premium-card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-4 font-weight-bold text-dark">Carbon Sequestration Trajectory</h5>
                    <div style={{ height: '350px', position: 'relative' }}>
                      <Line
                        ref={chartRef}
                        data={{
                          labels: metrics.map((d: any) => d.name),
                          datasets: [
                            {
                              label: 'Carbon Sequestered (tCO2e)',
                              data: metrics.map((d: any) => d.Carbon),
                              borderColor: '#28a745',
                              backgroundColor: function(context: any) {
                                const chart = context.chart;
                                const {ctx, chartArea} = chart;
                                if (!chartArea) return 'transparent';
                                return getGradient(ctx, chartArea);
                              },
                              borderWidth: 3,
                              pointRadius: 0, // hide points for cleaner look
                              pointHoverRadius: 6,
                              tension: 0.4,
                              fill: true
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          interaction: {
                            mode: 'index',
                            intersect: false,
                          },
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              titleColor: '#374151',
                              bodyColor: '#374151',
                              borderColor: '#e5e7eb',
                              borderWidth: 1,
                              padding: 12,
                              titleFont: { size: 14, weight: 'bold' },
                              bodyFont: { size: 13, weight: 'bold' }
                            }
                          },
                          scales: {
                            x: { 
                              grid: { display: false }, 
                              ticks: { color: '#9ca3af', maxTicksLimit: 12 } 
                            },
                            y: { 
                              grid: { color: '#f3f4f6', drawBorder: false }, 
                              ticks: { color: '#9ca3af' },
                              beginAtZero: true
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card premium-card h-100 border-0 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title mb-4 font-weight-bold text-dark">Ecosystem Composition</h5>
                    <div style={{ height: '350px', position: 'relative' }}>
                      <Doughnut
                        data={{
                          labels: ['Mangroves', 'Tropical Shrubs', 'Native Grasses', 'Canopy Trees'],
                          datasets: [{
                            data: project?.project_type === 'biodiversity' ? [25, 40, 25, 10] : [55, 15, 10, 20],
                            backgroundColor: [
                              '#28a745', // green
                              '#1CAAD9', // blue
                              '#ffc107', // yellow
                              '#e83e8c'  // pink
                            ],
                            borderWidth: 0,
                            hoverOffset: 4
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          cutout: '75%',
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: { padding: 20, font: { size: 12, family: "'Inter', sans-serif" } }
                            }
                          }
                        }}
                      />
                      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Dominant</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#374151' }}>
                          {project?.project_type === 'biodiversity' ? 'Tropical Shrubs' : 'Mangroves'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Bar Chart & 3D Model */}
            <div className="row">
              <div className="col-lg-6 mb-4">
                <div className="card premium-card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title mb-4 font-weight-bold text-dark">Biodiversity Score by Zone</h5>
                    <div style={{ height: '300px' }}>
                      <Bar
                        data={{
                          labels: ['Zone A (Coastal)', 'Zone B (Wetlands)', 'Zone C (Forest)', 'Zone D (Buffer)', 'Zone E (Nursery)'],
                          datasets: [{
                            label: 'Bio Score',
                            data: project?.project_type === 'carbon' ? [4.2, 3.8, 3.5, 2.9, 2.2] : [4.9, 4.5, 4.1, 3.8, 3.6],
                            backgroundColor: 'rgba(28, 170, 217, 0.85)',
                            borderRadius: 6,
                            barThickness: 24,
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false }
                          },
                          scales: {
                            x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
                            y: { grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af' }, max: 5 }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6 mb-4">
                <div className="card premium-card h-100 border-0 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title mb-4 font-weight-bold text-dark">Site Environment Preview</h5>
                    <div className="sketchfab-embed-wrapper" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
                      <iframe 
                        title="Stylized Mangrove Greenhouse" 
                        frameBorder="0" 
                        allowFullScreen 
                        allow="autoplay; fullscreen; xr-spatial-tracking" 
                        src="https://sketchfab.com/models/4ad533f838f44fa583683ab7939c6aa1/embed?autostart=1&ui_theme=dark&transparent=1"
                        style={{ width: '100%', height: '100%' }}
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        </div>
        </div>
      </main>
    </div>
  );
}
