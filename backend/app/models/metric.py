from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class SiteMetric(Base):
    __tablename__ = "sitemetric"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer, ForeignKey("site.id"), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    carbon_tonnes_co2e = Column(Float)
    biodiversity_score = Column(Float)
    vegetation_index = Column(Float)
    tree_survival_rate = Column(Float)
    notes = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site", back_populates="metrics")
