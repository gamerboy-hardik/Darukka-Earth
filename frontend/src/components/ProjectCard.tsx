import React from 'react';
import { Link } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  description: string;
  project_type: string;
  status: string;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const getBadgeClass = (type: string) => {
    switch(type.toLowerCase()) {
      case 'carbon': return 'badge-carbon';
      case 'biodiversity': return 'badge-biodiversity';
      default: return 'badge-mixed';
    }
  };

  return (
    <div className="card premium-card mb-4 overflow-hidden border-0">
      <div 
        className="card-img-top position-relative" 
        style={{ 
          backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent), url(https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)', 
          height: '120px', 
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="position-absolute" style={{ top: '10px', right: '10px' }}>
          <span className={`badge ${getBadgeClass(project.project_type)} px-2 py-1 shadow-sm`} style={{ borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
            {project.project_type.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="card-body bg-white pb-2">
        <h5 className="font-weight-bold text-dark mb-1" style={{ fontSize: '1.1rem' }}>{project.name}</h5>
        <p className="text-muted small mb-2 font-weight-medium">Status: <span className="text-primary">{project.status.toUpperCase()}</span></p>
        
        <p className="text-secondary small text-truncate mb-0" style={{ lineHeight: '1.5' }}>
          {project.description || 'No description provided.'}
        </p>
      </div>
      
      <div className="card-footer bg-white border-top-0 pt-2 pb-3">
        <Link to={`/projects/${project.id}`} className="btn btn-premium btn-sm w-100" style={{ padding: '8px 0', fontSize: '0.9rem' }}>
          View Details
        </Link>
      </div>
    </div>
  );
}
