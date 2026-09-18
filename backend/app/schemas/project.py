from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    project_type: str # carbon, biodiversity, mixed
    status: Optional[str] = "draft"
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    project_type: Optional[str] = None
    status: Optional[str] = None

class ProjectInDBBase(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class Project(ProjectInDBBase):
    pass
