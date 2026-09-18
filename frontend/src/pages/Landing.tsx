import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const STATS = [
  { value: '2.4M+', label: 'Hectares Monitored', icon: '🌿' },
  { value: '180K', label: 'tCO₂ Offset', icon: '💨' },
  { value: '340+', label: 'Active Projects', icon: '📍' },
  { value: '98.2%', label: 'Avg Tree Survival', icon: '🌱' },
];

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Geospatial Intelligence',
    desc: 'Interactive maps with real-time project polygons, satellite layers, and ecosystem boundary tracking.',
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    desc: 'Carbon sequestration trajectories, biodiversity scores, and multi-project comparison dashboards.',
  },
  {
    icon: '🤝',
    title: 'Verified Impact',
    desc: 'Every metric is traceable, exportable as PDF reports, and aligned with REDD+ & VCS standards.',
  },
];

export default function Landing() {
  const [loaded, setLoaded] = useState(false);
  const [screenDone, setScreenDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 600);
    const t2 = setTimeout(() => setScreenDone(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <>
      {/* Loading Screen */}
      {!screenDone && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#030B14',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
          opacity: loaded ? 0 : 1,
          transform: loaded ? 'scale(1.04)' : 'scale(1)',
          pointerEvents: loaded ? 'none' : 'all',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '24px',
              background: 'linear-gradient(135deg, #1CAAD9, #10B981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38,
              boxShadow: '0 0 60px rgba(28,170,217,0.5)',
              animation: 'lPulse 1.2s ease-in-out infinite',
            }}>🌿</div>
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 28, color: '#fff', letterSpacing: '-0.5px' }}>
              Darukaa<span style={{ color: '#1CAAD9' }}>.Earth</span>
            </span>
            <div style={{ width: 200, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: 'linear-gradient(to right,#1CAAD9,#10B981)',
                animation: 'lBar 1.1s ease-out forwards',
              }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Initializing geospatial engine…</span>
          </div>
          <style>{`
            @keyframes lPulse { 0%,100%{transform:scale(1);box-shadow:0 0 40px rgba(28,170,217,0.4);}50%{transform:scale(1.07);box-shadow:0 0 80px rgba(28,170,217,0.7);} }
            @keyframes lBar { from{width:0}to{width:100%} }
          `}</style>
        </div>
      )}

      {/* Main Page */}
      <div style={{ background: '#030B14', color: '#fff', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
          .lnb { padding:10px 22px;border-radius:10px;font-weight:600;font-family:'Outfit',sans-serif;font-size:15px;transition:all .2s;text-decoration:none;display:inline-block; }
          .lnb:hover{transform:translateY(-1px);text-decoration:none;}
          .lnb-g{color:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);}
          .lnb-g:hover{color:#fff;border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.12);}
          .lnb-s{background:linear-gradient(135deg,#1CAAD9,#10B981);color:#fff;border:none;box-shadow:0 4px 20px rgba(28,170,217,.35);}
          .lnb-s:hover{box-shadow:0 6px 30px rgba(28,170,217,.55);color:#fff;}
          .sc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:24px 20px;text-align:center;transition:all .3s;}
          .sc:hover{background:rgba(28,170,217,.1);border-color:rgba(28,170,217,.3);transform:translateY(-4px);}
          .fc{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:32px 28px;transition:all .3s;}
          .fc:hover{background:rgba(255,255,255,.07);border-color:rgba(28,170,217,.25);transform:translateY(-6px);}
          .hg{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;animation:fg 8s ease-in-out infinite;}
          @keyframes fg{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-30px) scale(1.06);}}
          @keyframes fup{from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);}}
          .fu{animation:fup .8s ease both;}
          .d1{animation-delay:.15s;} .d2{animation-delay:.3s;} .d3{animation-delay:.45s;} .d4{animation-delay:.6s;}
          .grid-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden;opacity:.065;background-image:linear-gradient(rgba(28,170,217,.7)1px,transparent 1px),linear-gradient(90deg,rgba(28,170,217,.7)1px,transparent 1px);background-size:60px 60px;}
          .bc{display:inline-flex;align-items:center;gap:6px;background:rgba(28,170,217,.12);border:1px solid rgba(28,170,217,.3);color:#1CAAD9;border-radius:99px;padding:6px 14px;font-size:13px;font-weight:600;}
          .pv{display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.25);color:#10B981;border-radius:99px;padding:6px 14px;font-size:13px;font-weight:600;}
          @keyframes shimmer{0%{background-position:0% center}100%{background-position:200% center}}
        `}</style>

        {/* NAVBAR */}
        <nav style={{
          position:'fixed',top:0,left:0,right:0,zIndex:100,
          display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'14px 40px',
          background:'rgba(3,11,20,.7)',backdropFilter:'blur(20px)',
          borderBottom:'1px solid rgba(255,255,255,.06)',
        }}>
          <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:22,color:'#fff'}}>
            🌿 Darukaa<span style={{color:'#1CAAD9'}}>.Earth</span>
          </span>
          <div style={{display:'flex',gap:12}}>
            <Link to="/login" className="lnb lnb-g">Login</Link>
            <Link to="/register" className="lnb lnb-s">Get Started →</Link>
          </div>
        </nav>

        {/* HERO */}
        <section style={{position:'relative',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'120px 24px 80px',overflow:'hidden',textAlign:'center'}}>
          <div className="grid-bg" />
          <div className="hg" style={{width:600,height:600,background:'rgba(28,170,217,.18)',top:'-100px',left:'-100px',animationDelay:'0s'}}/>
          <div className="hg" style={{width:500,height:500,background:'rgba(16,185,129,.15)',bottom:'-50px',right:'-80px',animationDelay:'4s'}}/>
          
          <div style={{position:'relative',zIndex:2,maxWidth:820}}>
            <div className="fu" style={{marginBottom:20}}>
              <span className="bc">🌍 Real-time Geospatial Intelligence</span>
            </div>
            <h1 className="fu d1" style={{fontFamily:"'Outfit',sans-serif",fontWeight:900,fontSize:'clamp(42px,7vw,80px)',lineHeight:1.05,letterSpacing:'-2px',marginBottom:28}}>
              <span style={{color:'#fff'}}>Empowering</span><br/>
              <span style={{background:'linear-gradient(90deg,#1CAAD9,#10B981,#1CAAD9)',backgroundSize:'200%',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 4s linear infinite'}}>
                Environmental Action
              </span>
            </h1>
            <p className="fu d2" style={{fontSize:19,color:'rgba(255,255,255,.6)',lineHeight:1.7,marginBottom:44,maxWidth:640,marginLeft:'auto',marginRight:'auto'}}>
              A premium geospatial platform for tracking ecological projects, monitoring environmental metrics, and fostering global sustainability through advanced data visualization.
            </p>
            <div className="fu d3" style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
              <Link to="/register" className="lnb lnb-s" style={{fontSize:17,padding:'14px 34px'}}>Join the Movement →</Link>
              <Link to="/login" className="lnb lnb-g" style={{fontSize:17,padding:'14px 34px'}}>View Dashboard</Link>
            </div>
            <div className="fu d4" style={{marginTop:36,display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
              <span className="pv">✓ REDD+ Compliant</span>
              <span className="pv">✓ VCS Standards</span>
              <span className="pv">✓ ISO 14064</span>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section style={{padding:'60px 40px 80px',background:'rgba(255,255,255,.02)',borderTop:'1px solid rgba(255,255,255,.06)',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          <div style={{maxWidth:1100,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:20}}>
            {STATS.map(s => (
              <div key={s.label} className="sc">
                <div style={{fontSize:30,marginBottom:10}}>{s.icon}</div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:36,color:'#1CAAD9',letterSpacing:'-1px',lineHeight:1}}>{s.value}</div>
                <div style={{marginTop:8,color:'rgba(255,255,255,.5)',fontSize:13,fontWeight:500}}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section style={{padding:'100px 40px',maxWidth:1100,margin:'0 auto',textAlign:'center'}}>
          <span className="bc" style={{marginBottom:20,display:'inline-flex'}}>⚡ Core Platform Features</span>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:900,fontSize:'clamp(32px,5vw,54px)',marginBottom:16,marginTop:16,color:'#fff'}}>Built for Impact at Scale</h2>
          <p style={{color:'rgba(255,255,255,.45)',fontSize:17,marginBottom:64,maxWidth:560,marginLeft:'auto',marginRight:'auto'}}>
            Everything you need to manage, verify, and report on conservation projects in one place.
          </p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24,textAlign:'left'}}>
            {FEATURES.map(f => (
              <div key={f.title} className="fc">
                <div style={{fontSize:40,marginBottom:18}}>{f.icon}</div>
                <h3 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:20,color:'#fff',marginBottom:10}}>{f.title}</h3>
                <p style={{color:'rgba(255,255,255,.5)',fontSize:15,lineHeight:1.65,margin:0}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section style={{
          margin:'0 40px 100px',borderRadius:28,
          background:'linear-gradient(135deg,rgba(28,170,217,.15) 0%,rgba(16,185,129,.12) 100%)',
          border:'1px solid rgba(28,170,217,.2)',
          padding:'72px 40px',textAlign:'center',position:'relative',overflow:'hidden',
        }}>
          <div style={{position:'absolute',width:300,height:300,borderRadius:'50%',background:'rgba(28,170,217,.12)',filter:'blur(80px)',top:-60,right:80,pointerEvents:'none'}}/>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:900,fontSize:'clamp(28px,4vw,48px)',color:'#fff',marginBottom:16}}>Start Measuring Your Impact</h2>
          <p style={{color:'rgba(255,255,255,.55)',fontSize:17,marginBottom:36,maxWidth:520,marginLeft:'auto',marginRight:'auto'}}>
            Join hundreds of conservation teams already using Darukaa.Earth to scale their environmental impact.
          </p>
          <Link to="/register" className="lnb lnb-s" style={{fontSize:18,padding:'16px 44px'}}>Create Free Account →</Link>
        </section>

        {/* FOOTER */}
        <footer style={{borderTop:'1px solid rgba(255,255,255,.06)',padding:'32px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:18,color:'#fff'}}>🌿 Darukaa<span style={{color:'#1CAAD9'}}>.Earth</span></span>
          <span style={{color:'rgba(255,255,255,.3)',fontSize:13}}>© {new Date().getFullYear()} Darukaa Earth. All rights reserved.</span>
          <div style={{display:'flex',gap:24}}>
            <Link to="/login" style={{color:'rgba(255,255,255,.4)',fontSize:13,textDecoration:'none'}}>Login</Link>
            <Link to="/register" style={{color:'rgba(255,255,255,.4)',fontSize:13,textDecoration:'none'}}>Register</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
