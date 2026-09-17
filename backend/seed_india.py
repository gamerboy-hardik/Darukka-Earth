import os
import sys

# Add backend dir to PYTHONPATH
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.models.metric import SiteMetric

def seed_data():
    db = SessionLocal()
    
    # 1. Ensure admin user exists
    user = db.query(User).filter(User.email == "admin@darukaa.earth").first()
    if not user:
        print("Admin user not found. Please register admin@darukaa.earth first.")
        db.close()
        return

    # 2. Delete existing projects for this user to avoid duplicates
    db.query(Project).filter(Project.owner_id == user.id).delete()
    
    # 3. Create Indian Projects
    indian_projects = [
        Project(
            name="Sundarbans Mangrove Restoration",
            description="Restoring native species in the Ganges delta to protect coastal communities.",
            project_type="biodiversity",
            status="active",
            owner_id=user.id
        ),
        Project(
            name="Western Ghats Reforestation",
            description="Preserving biodiversity hotspots and planting native saplings in Karnataka.",
            project_type="carbon",
            status="active",
            owner_id=user.id
        ),
        Project(
            name="Thar Desert Greening",
            description="Soil carbon sequestration in arid regions of Rajasthan using drought-resistant flora.",
            project_type="mixed",
            status="active",
            owner_id=user.id
        ),
        Project(
            name="Himalayan Pine Protection",
            description="Preventing deforestation and promoting sustainable agroforestry in Uttarakhand.",
            project_type="biodiversity",
            status="active",
            owner_id=user.id
        ),
        Project(
            name="Cauvery Basin Revitalization",
            description="River rejuvenation through large-scale tree planting along the Cauvery basin.",
            project_type="carbon",
            status="draft",
            owner_id=user.id
        )
    ]
    
    db.add_all(indian_projects)
    db.commit()
    print("Successfully seeded Indian projects!")
    
    db.close()

if __name__ == "__main__":
    seed_data()
