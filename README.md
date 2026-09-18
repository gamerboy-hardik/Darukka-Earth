# Darukaa.Earth

**Darukaa.Earth** is a full-stack geospatial data analytics platform for managing carbon and biodiversity projects. This MVP enables authenticated administrators to register projects, draw site polygons on an interactive map, and view environmental performance metrics.

![Dashboard Placeholder](placeholder-screenshot.png)

## Features (MVP)
- **User Authentication:** JWT-based registration and login.
- **Project Management:** Create, view, edit, and manage carbon/biodiversity projects.
- **Geospatial Site Mapping:** Draw, save, and edit site boundary polygons using Mapbox GL JS and PostGIS.
- **Site Analytics:** View area calculations, carbon tonnes estimates, and biodiversity scores with historical trend charts.

## Architecture

```mermaid
graph TD
    Client[React + Mapbox GL JS] -->|REST API + GeoJSON| API[FastAPI Backend]
    API -->|SQLAlchemy + GeoAlchemy2| DB[(PostgreSQL + PostGIS)]
    
    subgraph Frontend
        Client
    end
    
    subgraph Backend
        API
    end
```

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Mapbox GL JS, Tailwind/Bootstrap CSS (Template)
- **Backend:** Python, FastAPI, SQLAlchemy, GeoAlchemy2, Alembic, Pytest
- **Database:** PostgreSQL with PostGIS extension
- **Deployment:** Vercel (Frontend), Render (Backend + Database)

## Repository Structure
```
/
├── frontend/             # React SPA (Vite)
├── backend/              # FastAPI application
├── html/                 # Original template reference (do not modify)
├── docker-compose.yml    # Local PostGIS database
└── README.md
```

## Database Schema

```mermaid
erDiagram
    USER ||--o{ PROJECT : owns
    PROJECT ||--o{ SITE : contains
    SITE ||--o{ SITEMETRIC : has

    USER {
        int id PK
        string full_name
        string email
        string password_hash
    }

    PROJECT {
        int id PK
        string name
        string description
        string project_type
        string status
        int owner_id FK
    }

    SITE {
        int id PK
        int project_id FK
        string name
        geometry boundary
        float area_hectares
    }

    SITEMETRIC {
        int id PK
        int site_id FK
        date recorded_at
        float carbon_tonnes
        float biodiversity_score
    }
```

## PostGIS and GeoJSON
All geographic boundaries are stored in the PostgreSQL database using the `PostGIS` extension (SRID 4326). 
The backend receives and outputs standard `GeoJSON` formats, while `GeoAlchemy2` handles translating these shapes into native PostGIS geometries.

## Local Setup Instructions

### 1. Database (Docker)
Ensure Docker is installed and running.
```bash
docker-compose up -d
```

### 2. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
# source venv/bin/activate
pip install -r requirements.txt
```

### 3. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
Copy `.env.example` to `.env` in both `frontend` and `backend`.

**Backend (.env):**
- `DATABASE_URL`: Connection string (e.g., `postgresql://postgres:postgres@localhost:5432/darukaa`)
- `JWT_SECRET`: Secret key for token signing.

**Frontend (.env):**
- `VITE_API_BASE_URL`: URL to the FastAPI backend (e.g., `http://localhost:8000`)
- `VITE_MAPBOX_ACCESS_TOKEN`: Mapbox API token.

## Testing and Linting
- **Frontend:** 
  - Lint: `npm run lint`
  - Format: `npx prettier --write .`
- **Backend:** 
  - Test: `pytest`
  - Lint: `ruff check .`
  - Format: `ruff format .`

## Pre-commit Hooks
This project uses `husky` and `lint-staged`. Before a commit is created, staged frontend files are automatically formatted using Prettier and linted using ESLint/Oxlint. 

## CI/CD Workflow
The project implements a robust continuous integration and deployment pipeline using **GitHub Actions**. 
On every push and pull request to the `main` branch, the workflow (`ci-cd.yml`) automates the following steps:
1. **Service Containers:** Spins up an ephemeral PostgreSQL container with the PostGIS extension to run integration tests against a real geospatial database.
2. **Frontend Checks:** Sets up Node.js, installs dependencies, runs linting checks (`npm run lint`), and verifies a successful production build (`npm run build`).
3. **Backend Checks:** Sets up Python, installs requirements, and executes the `pytest` test suite.
4. **Automated Deployment:** Upon successful completion of the CI pipeline, the connected platforms (Vercel and Render) automatically trigger deployments to production.

## Deployment
- **Database:** Render PostgreSQL Database (with PostGIS enabled).
- **Backend:** Render Web Service running FastAPI.
- **Frontend:** Vercel automatically building and deploying the Vite React application.

## Sample Data
*Note: Once implemented, the application will include a seed script providing demo carbon and biodiversity projects. All seeded data is purely illustrative.*

## Security Notes
- JWT secrets must be kept secure in production.
- API endpoints are protected to ensure users can only access their own projects.

## Known Limitations
- MVP supports one administrator role.
- Seeded data is randomly generated for UI demonstration.
