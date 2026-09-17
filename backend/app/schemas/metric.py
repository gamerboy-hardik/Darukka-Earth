from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class SiteMetricBase(BaseModel):
    carbon_tonnes_co2e: Optional[float] = 0.0
    biodiversity_score: Optional[float] = 0.0
    vegetation_index: Optional[float] = 0.0
    tree_survival_rate: Optional[float] = 0.0
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None

class SiteMetricCreate(SiteMetricBase):
    site_id: int

class SiteMetricUpdate(SiteMetricBase):
    pass

class SiteMetricInDBBase(SiteMetricBase):
    id: int
    site_id: int
    created_at: datetime
    
    # recorded_at is optional on input, but usually set in DB
    recorded_at: datetime

    model_config = {"from_attributes": True}

class SiteMetric(SiteMetricInDBBase):
    pass
