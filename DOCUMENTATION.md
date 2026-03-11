# EidCricketFest — Full Project Documentation 🏏

Welcome to the **EidCricketFest** documentation. This document provides a comprehensive guide for developers, organizers, and maintainers to understand, deploy, and extend the application.

---

## 📖 Table of Contents

1. [Introduction](#1-introduction)
2. [Architecture Overview](#2-architecture-overview)
3. [Core Features](#3-core-features)
4. [Tech Stack](#4-tech-stack)
5. [Setup & Installation](#5-setup--installation)
6. [Frontend Deep Dive](#6-frontend-deep-dive)
7. [Backend & Database](#7-backend--database)
8. [API Documentation](#8-api-documentation)
9. [Deployment & Production](#9-deployment--production)

---

## 1. Introduction

**EidCricketFest** is a specialized tournament management platform designed for local cricket festivals. It streamlines everything from player drafting to real-time ball-by-ball scoring, ensuring a professional experience for community events.

---

## 2. Architecture Overview

The system follows a classic **Three-Tier Architecture**:

1.  **Presentation Tier**: React 18 SPA (Single Page Application).
2.  **Application Tier**: Spring Boot 3 (REST API).
3.  **Data Tier**: MySQL 8.0 (Containerized).

---

## 3. Core Features

- **Admin Dashboard**: Real-time stats (Total Teams, Players, Matches, Live Status).
- **Player Management**:
  - Photo upload with **Canvas-based compression** (400x400px).
  - Detailed skill ratings (Batting, Bowling, Fielding).
  - Squared photo display in list and modal views.
- **Squad Management**: Track playing XI vs. bench players for each team.
- **Fixture System**: Scheduled vs. Live vs. Completed match status tracking.
- **Live Scorer Console**: High-fidelity scoring interface with delivery-by-delivery recording.
- **Theme Engine**: Centralized design tokens for consistent branding.

---

## 4. Tech Stack

### Frontend

- **Framework**: React 18 (Vite build system)
- **Styling**: Tailwind CSS (Dark theme focus)
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State/Auth**: Custom `AuthContext` with JWT-style role management.

### Backend

- **Language**: Java 17
- **Framework**: Spring Boot 3.2.x
- **Data Persistence**: Spring Data JPA / Hibernate
- **Security**: Cross-Origin Resource Sharing (CORS) configured for port `5173`.
- **Serialization**: JSON-based REST controllers.

### Infrastructure

- **Containerization**: Docker & Docker Compose for MySQL.
- **Build Tools**: Maven (Backend) & NPM (Frontend).

---

## 5. Setup & Installation

### Prerequisites

- Docker Desktop
- Java 17 JDK
- Node.js (v18+)

### Step 1: Database

```bash
docker-compose up -d
```

### Step 2: Backend

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### Step 3: Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 6. Frontend Deep Dive

### Centralized Configuration

- **`src/config/theme.js`**: Contains all reusable Tailwind classes, color palettes (`neutral-950/900`, `cyan-400`), and typography rules.
- **`src/config/constants.js`**: All API endpoints, message strings, and enums are stored here to prevent hardcoding.

### Image Processing

The application uses a custom **Canvas Compression Utility** in `PlayersPage.jsx` to resize images to exactly 400x400px before uploading as Base64. This keeps the database lightweight while maintaining visual quality.

---

## 7. Backend & Database

### Database Schema

- **`players`**: Stores names, roles, ratings, and image data (`LONGTEXT`).
- **`teams`**: Tournament team registrations.
- **`match_fixtures`**: Schedule and live status.
- **`deliveries`**: Historical record of every ball bowled.

### Validations

Enhanced enum validation ensures that roles like `ALL_ROUNDER` are strictly enforced across the stack, preventing data inconsistency.

---

## 8. API Documentation

- `GET /api/players`: Paginated list of all players.
- `POST /api/players`: Register a new player with photo.
- `GET /api/teams`: List all registered teams.
- `GET /api/matches/live`: Fetch details of the currently live match.
- `POST /api/deliveries`: Record a new ball bowled.

---

## 9. Deployment & Production

- **Frontend Build**: `npm run build` generates a `dist/` folder optimized for production.
- **Backend Build**: `./mvnw package` generates a runnable `.jar`.
- **Server**: Served via standard cloud providers or local Docker environments.

---

_Documentation Version: 1.0.0 (March 2026)_
