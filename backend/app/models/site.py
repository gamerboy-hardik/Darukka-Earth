from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from app.db.base_class import Base

class Site(Base):
    __tablename__ = "site"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("project.id"), nullable=False)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    
    # Store geometry as PostGIS Geometry (MultiPolygon/Polygon), SRID 4326 (WGS 84)
    geometry = Column(Geometry('GEOMETRY', srid=4326, spatial_index=True))
    
    area_hectares = Column(Float)
    status = Column(String, index=True, default="active")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="sites")
    metrics = relationship("SiteMetric", back_populates="site", cascade="all, delete-orphan")
