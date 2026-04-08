# Telecom Technician Job Scheduler

A full-stack application for managing technician-to-job assignments in the telecom domain, featuring an interactive Gantt chart for field supervisors and admins.

## Architecture

- **Backend**: Spring Boot 3.2 + MySQL + JPA
- **Frontend**: React 18 + dhtmlx-gantt

## Features

- Territory and market-based search for technician schedules
- Interactive Gantt chart showing daily technician-job mappings
- Color-coded task types: jobs (by type), travel time, breaks, return home
- Drag-and-drop to reschedule assignments
- Double-click to update job status
- Full CRUD REST APIs for all entities
- Auto-seeded demo data

## Data Model

- **Territory**: Geographic regions (Ohio, Texas, California)
- **Market**: Sub-regions within a territory (Columbus, Cleveland, Dallas)
- **Technician**: Field technicians with skills (copper, fiber, modem, router, networking)
- **Job**: Work orders with type, address, and duration
- **Assignment**: Technician-job mappings with time slots, travel time, and status

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Node.js 18+

### Backend Setup

```bash
# Create MySQL database
mysql -u root -e "CREATE DATABASE techjob_gantt; CREATE USER 'techjob'@'localhost' IDENTIFIED BY 'techjob123'; GRANT ALL ON techjob_gantt.* TO 'techjob'@'localhost';"

# Build and run
cd backend
mvn spring-boot:run
```

Backend runs on http://localhost:8080

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/territories | List all territories |
| GET | /api/markets?territoryId={id} | List markets by territory |
| GET/POST/PUT/DELETE | /api/technicians | CRUD technicians |
| GET/POST/PUT/DELETE | /api/jobs | CRUD jobs |
| GET/POST/PUT/DELETE | /api/assignments | CRUD assignments |
| GET | /api/gantt?territoryId={id}&marketIds={ids}&date={date} | Gantt chart data |
