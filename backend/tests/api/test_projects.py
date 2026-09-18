import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_read_projects_unauthorized():
    response = client.get("/api/projects")
    assert response.status_code == 401

def test_create_project_unauthorized():
    response = client.post("/api/projects", json={"name": "Test", "project_type": "carbon"})
    assert response.status_code == 401
