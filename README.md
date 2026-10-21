# NewsLens — AI-Powered News Aggregator

> **Full-Stack MERN Application** | MongoDB | Express.js | React 18 | Node.js

NewsLens is an intelligent, multi-source news aggregator that clusters breaking stories across **60+ rated media outlets**, performs statistical bias analysis, flags left/right coverage blindspots, and delivers multi-perspective story breakdowns — all in a fast, modern web interface.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-optional-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [Architecture Overview](#architecture-overview)
- [Frontend Components](#frontend-components)
- [Database Models](#database-models)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Feature | Description |
|---|---|
| **Story Clustering** | TF-IDF tokenization with Agglomerative Centroid clustering groups related articles across outlets |
| **Bias Analysis** | Statistical coverage-rate algorithm calculates political skew (Left / Center / Right) per story |
| **Blindspot Detection** | Flags stories significantly underreported by left-leaning or right-leaning outlets |
| **Multi-Perspective View** | Side-by-side article comparison with AI Perspective Brief synthesis |
| **60+ News Sources** | Comprehensive directory with outlet ratings, political lean, and live feed status |
| **My Bias Tracker** | Real-time personal media diet tracker showing your reading patterns |
| **Offline / Cache Mode** | Automatically falls back to in-memory cache if MongoDB is unavailable |
| **RSS/Atom Harvesting** | Parallel concurrent feed fetcher with graceful per-source error tolerance |

---

## Tech Stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.21.2 | REST API server |
| `mongoose` | ^8.9.5 | MongoDB ODM |
| `axios` | ^1.7.9 | HTTP client for feed fetching |
| `fast-xml-parser` | ^4.5.1 | RSS/Atom XML parsing |
| `node-cron` | ^3.0.3 | Scheduled pipeline runs |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `dotenv` | ^16.4.7 | Environment variable management |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.3.1 | UI library |
| `react-dom` | ^18.3.1 | DOM rendering |
| `axios` | ^1.7.9 | API communication |
| `lucide-react` | ^0.475.0 | Icon set |
| `vite` | ^6.1.0 | Build tool and dev server |

---

## Project Structure

```
groundish-mern/
├── backend/
│   ├── models/
│   │   ├── AuthSession.js      # Auth session schema
│   │   ├── Meta.js             # Pipeline metadata schema
│   │   ├── Source.js           # News outlet schema
│   │   ├── Story.js            # Clustered story schema
│   │   └── User.js             # User schema
│   ├── routes/
│   │   └── auth.js             # Authentication routes
│   ├── services/
│   │   ├── analyze.js          # Bias and blindspot engine
│   │   ├── cluster.js          # TF-IDF clustering engine
│   │   ├── feeds.js            # RSS/Atom feed harvester
│   │   ├── pipeline.js         # Full data pipeline orchestrator
│   │   └── sources.js          # 60+ outlet definitions and ratings
│   ├── .env                    # Environment variables (not committed)
│   ├── package.json
│   └── server.js               # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddStoryModal.jsx
│   │   │   ├── BiasBar.jsx
│   │   │   ├── BlindspotBadge.jsx
│   │   │   ├── BlindspotsView.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── MethodView.jsx
│   │   │   ├── MyBiasView.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── SourcesView.jsx
│   │   │   ├── StoryCard.jsx
│   │   │   └── StoryModal.jsx
│   │   ├── App.jsx             # Root component and routing
│   │   ├── index.css           # Global styles and design tokens
│   │   └── main.jsx            # React DOM entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── package.json                # Monorepo root scripts
└── README.md
```

---

## Prerequisites

Make sure the following are installed on your system:

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **npm** v9 or higher (comes with Node.js)
- **MongoDB** v6+ *(optional)* — [Download](https://www.mongodb.com/try/download/community)

> **Note:** MongoDB is **optional**. If it is not running, the backend automatically switches to an in-memory/cache mode with no data persistence between restarts.

---

## Installation

### Option A — Install All at Once (Monorepo Script)

```bash
# From the project root
npm run install:all
```

### Option B — Install Separately

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/groundish_news
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port the Express server listens on |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/groundish_news` | MongoDB connection string |

> **Security:** Never commit your `.env` file. It is already listed in `.gitignore`.

---

## Running the App

### 1. Start the Backend (Port 5000)

```bash
cd backend
npm start
```

For development with auto-reload:

```bash
cd backend
npm run dev
```

### 2. Start the Frontend (Port 5173)

```bash
cd frontend
npm run dev
```

### 3. Open in Browser

```
http://localhost:5173
```

### 4. (Optional) Run Data Pipeline Manually

```bash
cd backend
npm run pipeline
```

This triggers a full fetch → cluster → analyze cycle immediately, outside the scheduled cron.

---

## API Reference

All endpoints are served from `http://localhost:5000`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stories` | Returns all clustered and analyzed stories |
| `GET` | `/api/sources` | Returns all 60+ outlet definitions with ratings |
| `GET` | `/api/meta` | Returns pipeline metadata (last run, article count, etc.) |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate and receive a session token |
| `POST` | `/api/auth/logout` | Invalidate a session token |

---

## Architecture Overview

```
+-----------------------------------------------------+
|                    DATA PIPELINE                    |
|                                                     |
|  feeds.js --> cluster.js --> analyze.js --> MongoDB |
|  (RSS/Atom)   (TF-IDF)      (Bias Stats)  (Storage) |
+-----------------------------------------------------+
         ^                             |
   node-cron                   Express REST API
   (scheduled)                         |
                                       v
                              +-----------------+
                              |  React Frontend  |
                              |  Vite + React 18 |
                              +-----------------+
```

### Core Services

#### `feeds.js` — Feed Harvester

- Concurrently fetches RSS and Atom feeds from 60+ sources.
- Normalizes article structure across varying feed schemas.
- Handles network failures gracefully with per-source error isolation.

#### `cluster.js` — Clustering Engine

- **TF-IDF Tokenization** — Scores term importance across the full article corpus.
- **Inverted Index Candidate Blocking** — Efficiently narrows the comparison space before clustering.
- **Agglomerative Centroid Clustering** — Groups articles by semantic similarity into unified story objects.

#### `analyze.js` — Bias Engine

- Computes per-story **Left / Center / Right** coverage rates based on outlet ratings.
- Detects **blindspots** where one political side covers a story significantly less than the other.
- Produces bias scores and article counts per political lean.

#### `pipeline.js` — Orchestrator

- Chains Fetch → Cluster → Analyze → Persist in sequence.
- Scheduled via `node-cron` on the server for automatic updates.
- Exposes a manual `runPipeline()` export for CLI execution.

#### `sources.js` — Outlet Registry

- Defines 60+ news outlets with political lean rating, RSS feed URL, and display metadata.
- Single source of truth used by both the harvester and the frontend sources directory.

---

## Frontend Components

| Component | Description |
|---|---|
| `Navbar.jsx` | Top navigation with view switcher and branding |
| `FilterBar.jsx` | Category and bias filter controls |
| `StoryCard.jsx` | Summary card with 3-segment bias bar, blindspot badges, and outlet avatars |
| `StoryModal.jsx` | Full story modal with side-by-side article comparison and AI Perspective Brief |
| `BiasBar.jsx` | Reusable 3-segment Left / Center / Right visual indicator |
| `BlindspotBadge.jsx` | Badge indicating a left or right blindspot on a story |
| `BlindspotsView.jsx` | Filtered view dedicated to underreported stories |
| `SourcesView.jsx` | Searchable directory of all 60+ outlets with ratings and feed status |
| `MyBiasView.jsx` | Personal media diet tracker showing reading patterns by political lean |
| `MethodView.jsx` | Explains the clustering and bias methodology to the user |
| `AddStoryModal.jsx` | Form to manually submit a news story URL |

---

## Database Models

| Model | File | Description |
|---|---|---|
| `Story` | `models/Story.js` | Clustered story with articles array, bias scores, and blindspot flags |
| `Source` | `models/Source.js` | News outlet definition with political lean and feed URL |
| `Meta` | `models/Meta.js` | Pipeline run metadata (timestamp, article count, cluster count) |
| `User` | `models/User.js` | User account (username, hashed password) |
| `AuthSession` | `models/AuthSession.js` | Session tokens with expiry |

---

## Contributing

Contributions are welcome! To get started:

1. **Fork** this repository.
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push** to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open** a Pull Request against the `main` branch.

---

## License

This project is licensed under the **MIT License**.

---

<div align="center">
  <strong>Built with the MERN Stack</strong><br/>
  MongoDB &middot; Express.js &middot; React 18 &middot; Node.js
</div>