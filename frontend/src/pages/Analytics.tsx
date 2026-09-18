import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Ref for custom gradients
  const chartRef = useRef<any>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    // Generate realistic 24-month dataset
    const generateMockData = () => {
      const data = [];
      let currentCarbon = 2000;
      let currentBio = 2.1;
      let currentSurvival = 85;
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let year = 2024; year <= 2025; year++) {
        for (let m = 0; m < 12; m++) {
          // Carbon grows exponentially
          currentCarbon += Math.floor(Math.random() * 500) + (m * 50);
          
          // Bio grows slowly and plateaus
          currentBio += (Math.random() * 0.1);
          if (currentBio > 4.8) currentBio = 4.8;
          
          // Survival fluctuates based on season (summer/monsoon)
          const seasonMod = (m > 3 && m < 7) ? -2 : 1;
          currentSurvival += seasonMod + (Math.random() * 2 - 1);
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
      return data;
    };

    setTimeout(() => {
      setMetrics(generateMockData());
      setLoading(false);
    }, 600); // Simulate network latency
  }, []);

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
          <h2 className="text-dark font-weight-bold"><i className="fa fa-chart-line mr-2" style={{ color: 'var(--primary)' }}></i> Ecosystem Analytics</h2>
          <button onClick={() => alert("PDF report generation coming soon!")} className="btn btn-premium"><i className="fa fa-download mr-2"></i> Export Report</button>
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
                    <h2 className="mb-0 font-weight-bold" style={{ color: '#fd7e14' }}>12,450 <small className="text-muted" style={{fontSize: '14px'}}>Ha</small></h2>
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
                    <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
                      <Doughnut
                        data={{
                          labels: ['Mangroves', 'Tropical Shrubs', 'Native Grasses', 'Canopy Trees'],
                          datasets: [{
                            data: [45, 25, 20, 10],
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
                      {/* Center Text overlay for Doughnut */}
                      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Dominant</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#374151' }}>Mangroves</div>
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
                            data: [4.8, 4.2, 3.9, 3.1, 2.5],
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
                    <div className="sketchfab-embed-wrapper flex-grow-1" style={{ minHeight: '300px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#e5e7eb' }}>
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
      </main>
    </div>
  );
}
