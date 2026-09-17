from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.metric import SiteMetric
from app.models.site import Site
from app.models.project import Project
from app.models.user import User
from app.schemas.metric import SiteMetric as SiteMetricSchema, SiteMetricCreate

router = APIRouter()

@router.get("/project/{project_id}", response_model=List[SiteMetricSchema])
def get_project_metrics(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get all metrics across all sites for a specific project.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Get all site IDs for this project
    site_ids = [site.id for site in project.sites]
    
    if not site_ids:
        return []
        
    metrics = (
        db.query(SiteMetric)
        .filter(SiteMetric.site_id.in_(site_ids))
        .order_by(SiteMetric.recorded_at.asc())
        .all()
    )
    return metrics

@router.post("/", response_model=SiteMetricSchema, status_code=status.HTTP_201_CREATED)
def create_site_metric(
    *,
    db: Session = Depends(deps.get_db),
    metric_in: SiteMetricCreate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Create a new metric entry for a site.
    """
    site = db.query(Site).filter(Site.id == metric_in.site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
        
    project = db.query(Project).filter(Project.id == site.project_id).first()
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    metric = SiteMetric(
        site_id=metric_in.site_id,
        recorded_at=metric_in.recorded_at or datetime.utcnow(),
        carbon_tonnes_co2e=metric_in.carbon_tonnes_co2e,
        biodiversity_score=metric_in.biodiversity_score,
        vegetation_index=metric_in.vegetation_index,
        tree_survival_rate=metric_in.tree_survival_rate,
        notes=metric_in.notes
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric
