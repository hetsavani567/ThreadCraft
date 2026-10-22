# ThreadCraft — Retail Clothing Store

ThreadCraft is a full-stack modern retail clothing store web application featuring a React + Vite + Tailwind CSS frontend and a Node.js + Express + MySQL backend.

---

## 📁 Project Structure

```text
ThreadCraft/
├── backend/                  # Express REST API & Database logic
│   ├── config/
│   │   └── db.js             # MySQL connection pool configuration
│   ├── .env                  # Backend environment variables (git-ignored)
│   ├── .env.example          # Sample environment variables template
│   ├── .gitignore            # Backend git-ignore rules
│   ├── package.json          # Backend dependencies and scripts
│   └── server.js             # Express server entry point & API endpoints
│
├── database/                 # Database setup and migrations
│   ├── schema.sql            # Table definitions (category, brand, product)
│   └── sample_data.sql       # Seed data for initial testing
│
├── frontend/                 # React + Vite frontend application
│   ├── public/               # Static assets (favicons, SVG icons)
│   ├── src/
│   │   ├── assets/           # Images and logos
│   │   ├── components/       # Reusable React components (Navbar, ProductCard)
│   │   ├── data/             # Static fallback product catalog
│   │   ├── services/         # API integration client (api.js)
│   │   ├── App.css           # Component styles
│   │   ├── App.jsx           # Main Store UI & cart state
│   │   ├── index.css         # Tailwind CSS styling
│   │   └── main.jsx          # React DOM entry point
│   ├── .env                  # Frontend environment variables (git-ignored)
│   ├── .env.example          # Sample environment variables template
│   ├── .gitignore            # Frontend git-ignore rules
│   ├── eslint.config.js      # ESLint configuration
│   ├── index.html            # Vite HTML entry point
│   ├── package.json          # Frontend dependencies and scripts
│   └── vite.config.js        # Vite + Tailwind configuration
│
├── .gitignore                # Root repository git-ignore rules
├── package.json              # Root monorepo workspace & dev scripts
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [MySQL Server](https://www.mysql.com/)

---

### 1. Database Setup

1. Open your MySQL client (MySQL Workbench, MySQL CLI, etc.).
2. Execute the schema script:
   ```sql
   source database/schema.sql;
   ```
3. Populate sample data:
   ```sql
   source database/sample_data.sql;
   ```

---

### 2. Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=threadcraft_db
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`.

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## ⚡ Root Convenience Scripts

You can also control the projects from the root directory:

| Command | Action |
| --- | --- |
| `npm run dev:frontend` | Start frontend development server |
| `npm run dev:backend` | Start backend server with nodemon |
| `npm run build:frontend` | Build frontend for production |
| `npm run install:all` | Install dependencies for both frontend and backend |

---

## 🔌 API Endpoints

- `GET /api/health` — Check server status
- `GET /api/test-db` — Test MySQL database connectivity
- `GET /api/products` — Retrieve all clothing products with category & brand information
