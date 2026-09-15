# SkillSync AI – AI-Powered Career Intelligence Platform

SkillSync AI is an enterprise-ready career intelligence platform that aggregates student achievements across competitive coding and professional platforms (**GitHub**, **LeetCode**, **Codeforces**, and **CodeChef**), calculates an automated **Placement Readiness Score**, detects role-specific **Skill Gaps**, powers an interactive **ATS Resume Builder**, and provides a **Recruiter Talent Explorer**.

---

## 📁 Project Directory Structure

```text
SkillSync-AI/
├── backend/                  # FastAPI Python Backend & Database Layer
│   ├── app/
│   │   ├── api/              # REST API Router & Controller Endpoints
│   │   │   ├── deps.py       # JWT Bearer Token validation & DB dependencies
│   │   │   ├── router.py     # Main API router registry
│   │   │   └── endpoints/
│   │   │       ├── auth.py           # Email verification, register, login, session
│   │   │       ├── career.py         # AI recommendations & milestone achievements
│   │   │       ├── dashboard.py      # Aggregated dashboard metrics & progress history
│   │   │       ├── projects.py       # Portfolio project CRUD & resume impact scores
│   │   │       ├── recruiter.py      # Candidate talent discovery & filter endpoints
│   │   │       ├── resume.py         # ATS resume data & AI evaluation engine
│   │   │       ├── skills.py         # Student technical skills & proficiency levels
│   │   │       └── users.py          # Student profile & on-demand platform sync
│   │   ├── core/             # Application Configuration & Security
│   │   │   ├── config.py     # Environment variables, CORS, and settings
│   │   │   └── security.py   # Bcrypt password hashing & JWT token generation
│   │   ├── db/               # PostgreSQL Database Connectivity
│   │   │   ├── init_db.py    # Database seeder (demo student & recruiter data)
│   │   │   └── session.py    # SQLAlchemy engine & session maker
│   │   ├── models/           # SQLAlchemy Relational Models (PostgreSQL Tables)
│   │   │   ├── achievement.py    # Milestones and coding contest achievements
│   │   │   ├── profile.py        # Student profile, connected accounts & platform stats
│   │   │   ├── project.py        # Portfolio projects with GitHub/live URLs
│   │   │   ├── recommendation.py # AI personalized career next steps
│   │   │   ├── resume.py         # Structured ATS resume records
│   │   │   ├── skill.py          # Student skills & role-specific algorithmic skill gaps
│   │   │   └── user.py           # User accounts (student / recruiter, verification)
│   │   ├── schemas/          # Pydantic Schemas (Input/Output Data Validation)
│   │   │   └── __init__.py   # Auth, profile, skills, projects, and resume schemas
│   │   ├── services/         # External APIs & AI Engine
│   │   │   ├── ai_service.py     # 4-pillar placement readiness scoring & skill gaps
│   │   │   └── sync_service.py   # Public API sync for GitHub, LeetCode, Codeforces
│   │   └── main.py           # FastAPI application entrypoint & middleware configuration
│   ├── .env                  # Environment configuration (PostgreSQL credentials, JWT key)
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Local development server runner (Port 8000)
│
├── frontend/                 # React 18 + Vite Frontend Application
│   ├── public/               # Static assets & icons
│   ├── src/
│   │   ├── assets/           # UI graphics & SVG logos
│   │   ├── components/       # Reusable Modular UI Components
│   │   │   ├── auth/         # Login, Register wizards, and input fields
│   │   │   ├── common/       # PageHeader (with Back button), StatCard, LoadingSpinner
│   │   │   ├── dashboard/    # Coding overview, readiness score rings, skill gap cards
│   │   │   ├── layout/       # Responsive Navbar, Sidebar navigation, and UserDropdown
│   │   │   └── modals/       # Modals for Add Project, Add Skill, Edit Profile, Placement Report
│   │   ├── constants/        # API route constants and local storage keys
│   │   ├── context/          # React Context Providers (AuthContext, UserContext, SidebarContext)
│   │   ├── data/             # Registration options (branches, years, career goals)
│   │   ├── hooks/            # Custom hooks (useAuth, useUser, useSidebar)
│   │   ├── pages/            # Application Views
│   │   │   ├── auth/         # Login & Register pages
│   │   │   ├── dashboard/    # Main student analytics dashboard
│   │   │   ├── profile/      # Student profile & connected accounts
│   │   │   ├── progress/     # 6-month growth charts and momentum trends
│   │   │   ├── projects/     # Portfolio projects manager with resume impact ratings
│   │   │   ├── skills/       # Verified skills & role gap radar
│   │   │   ├── achievements/ # Timeline of contest and coding milestones
│   │   │   ├── recommendations/ # AI sequenced learning path
│   │   │   ├── resume/       # Interactive ATS Resume Builder with AI review & PDF export
│   │   │   ├── recruiter/    # Recruiter Candidate Discovery & multi-parameter filter
│   │   │   └── settings/     # Account preferences & notification channels
│   │   ├── routes/           # React Router DOM route declarations & route guards
│   │   ├── services/         # Axios API clients for backend endpoints
│   │   ├── utils/            # Form validation and toast utilities
│   │   ├── App.jsx           # Root application component
│   │   ├── main.jsx          # React DOM mounting & router setup
│   │   └── index.css         # Tailwind CSS styling directives
│   ├── package.json          # Node dependencies & npm scripts
│   ├── tailwind.config.js    # Tailwind theme configuration
│   └── vite.config.js        # Vite bundler configuration
│
└── README.md                 # Complete project documentation and architecture guide
```

---

## ⚡ Quick Start & Running Locally

### 1. Start the Backend Server
```powershell
cd C:\mini_project\SkillSync-AI\backend
# Activate virtual environment
.\.venv\Scripts\Activate.ps1
# Run the FastAPI server
python run.py
```
> Backend runs at: **http://127.0.0.1:8000**  
> Swagger Documentation: **http://127.0.0.1:8000/docs**

### 2. Start the Frontend Application
```powershell
cd C:\mini_project\SkillSync-AI\frontend
# Install dependencies (if not already installed)
npm install
# Run development server
npm run dev
```
> Frontend runs at: **http://localhost:5173/**

---

## 🔑 Demo Login Accounts

| Role | Email | Password | What to Test |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `subhi@example.com` | `password123` | Dashboard analytics, platform sync, ATS resume builder, project CRUD |
| **Demo Recruiter** | `recruiter@techhire.com` | `password123` | Candidate talent pool, filter by score, LeetCode count & target skills |
| **Register New** | *Any email* | *Any password* | Receive live 6-digit OTP code, verify email, create distinct PostgreSQL profile |

---

## 🧠 Core Features & Workflow

1. **Email Verification**:
   - Registering students request a 6-digit OTP verified in real time before entering technical handles.
2. **Platform Sync**:
   - Clicking **"Sync Now"** retrieves real problem counts and ratings from GitHub, LeetCode, and Codeforces.
3. **AI Placement Readiness**:
   - Computes a weighted score across 4 pillars: Competitive Coding (35%), Projects (30%), Core Skills (20%), and Resume ATS (15%).
4. **ATS Resume Builder**:
   - Allows editing sections, triggers an automated AI evaluation for keyword optimization, and exports directly to print/PDF.
5. **Back Page Navigation**:
   - Every page features intuitive back buttons and one-click account switching.
