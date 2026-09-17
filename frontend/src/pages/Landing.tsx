import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      
      {/* 3D Background iframe */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.8, pointerEvents: 'none' }}>
        <iframe 
          title="WORLD MAP EARTH 3D HEIGHT" 
          frameBorder="0" 
          allowFullScreen 
          allow="autoplay; fullscreen; xr-spatial-tracking" 
          src="https://sketchfab.com/models/f996c2489cfc435eb79399ad1890f8e0/embed?autostart=1&transparent=1&ui_infos=0&ui_stop=0&ui_watermark=0&ui_theme=dark"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        ></iframe>
      </div>

      {/* Navbar overlay */}
      <nav className="navbar navbar-expand-lg px-4 py-3" style={{ zIndex: 10, background: 'transparent !important', borderBottom: 'none' }}>
        <a className="navbar-brand" href="/" style={{ fontSize: '1.5rem' }}>
          <i className="fa fa-leaf mr-2" style={{ color: 'var(--primary)' }}></i>
          Darukaa.Earth
        </a>
        <div className="ml-auto d-flex">
          <Link to="/login" className="btn text-white mr-3 font-weight-bold" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '8px' }}>Login</Link>
          <Link to="/register" className="btn btn-glow">Get Started</Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center p-4" style={{ zIndex: 10 }}>
        <div className="glass-panel p-5" style={{ maxWidth: '800px', background: 'rgba(11, 15, 25, 0.65)' }}>
          <h1 className="display-4 font-weight-bold mb-4" style={{ background: 'linear-gradient(to right, #fff, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Empowering Environmental Action
          </h1>
          <p className="lead text-light mb-5" style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
            A premium geospatial platform for tracking ecological projects, monitoring environmental metrics, and fostering global sustainability through advanced data visualization.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register" className="btn btn-glow btn-lg mr-3 px-5 py-3" style={{ fontSize: '1.1rem' }}>
              Join the Movement <i className="fa fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer attribution */}
      <div style={{ position: 'absolute', bottom: 10, left: 0, width: '100%', textAlign: 'center', zIndex: 10 }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          3D Earth Model by <a href="https://sketchfab.com/haykel1993" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>haykel-shaba</a> on Sketchfab
        </p>
      </div>

    </div>
  );
}
