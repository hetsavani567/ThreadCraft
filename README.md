# ThreadCraft — Retail Clothing Store

ThreadCraft is a full-stack modern retail clothing store web application featuring a React + Vite + Tailwind CSS frontend and a Node.js + Express + MySQL backend.

---

## 📁 Project Structure

```text
ThreadCraft/
├── backend/                  # Express REST API & Database logic
│   ├── src/
│   │   ├── controllers/      # Route controllers (product, category, health, brand)
│   │   ├── db/               # MySQL pool & automated db:init script
│   │   ├── models/           # MySQL SQL queries (joins, stock, variants)
│   │   ├── routes/           # Express API endpoints
│   │   └── services/         # Layered business logic & fallback handlers
│   ├── .env                  # Backend environment variables
│   ├── .env.example          # Sample environment variables template
│   ├── package.json          # Backend dependencies and scripts
│   └── server.js             # Express server entry point
│
├── database/                 # Database schema & sample seed data
│   ├── schema.sql            # Table definitions (category, brand, product, inventory...)
│   └── sample_data.sql       # Initial seed data
│
├── frontend/                 # React + Vite frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/           # Images and logos
│   │   ├── components/       # UI Components (Dashboard, Navbar, ProductCard, Auth)
│   │   ├── data/             # Fallback demo catalog
│   │   ├── services/         # API integration client (api.js)
│   │   ├── App.jsx           # Application root & views
│   │   └── main.jsx          # React DOM entry point
│   ├── package.json          # Frontend dependencies and scripts
│   └── vite.config.js        # Vite + Tailwind configuration
│
├── scripts/                  # Development scripts (parallel runner)
├── package.json              # Root monorepo workspace & dev scripts
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start (Running Everything)

### 1. Start MySQL Server
Make sure your MySQL server is running:
- **Windows Service (MySQL 8.0)**: Run in Administrator Command Prompt / PowerShell:
  ```powershell
  net start MySQL80
  ```
- **XAMPP**: Open XAMPP Control Panel and click **Start** next to MySQL.

### 2. Configure Environment (`backend/.env`)
Verify your credentials in `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=retail_db
```

### 3. Initialize & Seed Database (Automated)
Run this single command from the project root:
```bash
npm run db:init
```
This automatically connects to MySQL, creates the `retail_db` database, and executes `database/schema.sql` and `database/sample_data.sql`.

### 4. Start Full-Stack App (Backend + Frontend)
Run from the project root:
```bash
npm run dev
```
This starts:
- **Backend API**: `http://localhost:5000`
- **Frontend UI**: `http://localhost:5173`

> [!NOTE]
> Even if MySQL is not started, the application will automatically run in **Demo / Fallback Mode**, allowing you to preview products, test filtering, search, the shopping cart, and the employee portal without crashing.

---

## ⚡ Root Convenience Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start **both** backend API and frontend UI concurrently |
| `npm run db:init` | Create database `retail_db` and seed all tables from SQL files |
| `npm run dev:frontend` | Start frontend development server only (port 5173) |
| `npm run dev:backend` | Start backend development server only (port 5000) |
| `npm run build:frontend` | Build frontend for production |
