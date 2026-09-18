from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.project import Project
from app.models.site import Site

def test_create_metric_unauthorized(client: TestClient):
    response = client.post("/api/metrics/", json={"site_id": 1, "carbon_tonnes_co2e": 10})
    assert response.status_code == 401

def test_get_metrics_unauthorized(client: TestClient):
    response = client.get("/api/metrics/project/1")
    assert response.status_code == 401
