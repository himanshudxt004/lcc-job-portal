# Lead Connects Career (LCC) — Full-Stack Job Portal

A **premium recruitment consultancy platform** for **Lead Connects Career Pvt Ltd** (LCC) — public marketing site, admin-managed jobs & blog, candidate applications, and an employer **hiring-request** portal (not self-serve job posting).

> **Mission:** Empowering India's next generation of professionals — bridging the gap between college and career.

---

## ✓ What's built

### Frontend (`/frontend`)
**Public site** (multi-page, GRPL-design preserved, GSAP animations, fully responsive):
- `index.html` — Hero, ticker, featured services & industries, quote, CTA
- `about.html` — Who We Are, Founders' DNA, Vision, Challenge cards
- `services.html` — 6 services + 5 training pillars + 4-step approach
- `industries.html` — 4 core sectors detail + supporting industries grid + advantage stats
- `how-it-works.html` — 5-step hiring process + candidate/employer journeys
- `reviews.html` — Advantage stats + 9 testimonials (students/candidates/employers)
- `contact.html` — Real LCC contact + lead form (WhatsApp redirect) + Google map

**Auth + portal:**
- `signup.html` — Role tab (Job Seeker / Employer) → registration
- `login.html` — Role-aware login
- `jobs.html` — Public job listings with filters (search / location / industry / type) + pagination
- `job-details.html` — Single job view + Apply form (resume upload + cover note)
- `dashboard-jobseeker.html` — Profile, resume, application history, status tracking
- `blog.html` / `blog-post.html` — Public blog with categories and featured posts
- `request-hiring.html` — Submit hiring / consultation requests (employers & guests)
- `dashboard-employer.html` — Hiring partner portal (track hiring requests)
- `dashboard-admin.html` + `admin-*.html` — Admin panel (jobs, applications, blogs, hiring requests)
- `post-job.html` — Redirects to `request-hiring.html`
- `404.html` — Friendly error page

**Shared assets:**
- `css/style.css`     — GRPL design system (Navy + Gold + Cream, Playfair + DM Sans)
- `css/auth.css`      — Auth pages styling
- `css/dashboard.css` — Dashboards / jobs / listings styling
- `js/include.js`         — Shared header / footer / WhatsApp float (DRY pattern)
- `js/main.js`            — Navbar scroll, hamburger, reveal fallback, contact form WhatsApp redirect
- `js/gsap-animations.js` — Hero entrance, ScrollTrigger reveals, stat counters
- `js/api.js`             — Fetch wrapper, JWT/localStorage session
- `js/auth.js`            — Signup / login form handlers
- `js/jobs.js`            — Listings + filters + pagination
- `js/job-details.js`     — Detail view + apply (multipart upload)
- `js/dashboard-common.js` — Shared dashboard helpers (auth gate, user chip, toast)
- `js/dashboard-jobseeker.js` — Profile, resume upload, my applications
- `js/dashboard-employer.js`  — My jobs, applicants, status updates
- `js/post-job.js`        — Create / edit job

### Backend (`/backend`) — Node + Express + MongoDB + JWT
```
backend/
├── server.js                       Entry, security, routes wiring
├── package.json
├── .env.example
├── config/db.js                    Mongoose connection
├── models/
│   ├── User.js                     bcrypt pre-save hook, comparePassword(), toJSON sanitiser
│   ├── Job.js                      Text index for search
│   └── Application.js              Unique (jobId, userId) compound index
├── controllers/
│   ├── authController.js           signup, login, me, updateProfile
│   ├── jobController.js            list (filters+pagination), getOne, create, update, remove, mine
│   └── applicationController.js    apply (with resume), uploadOnly, userApplications, employerApplications, updateStatus
├── routes/
│   ├── authRoutes.js               POST /signup /login, GET /me, PATCH /profile
│   ├── jobRoutes.js                CRUD + GET /employer/mine
│   └── applicationRoutes.js        POST /apply (multer), GET /applications/user|employer, PATCH /:id/status
├── middleware/
│   ├── auth.js                     protect — JWT verify
│   ├── role.js                     requireRole('jobseeker'|'employer')
│   ├── errorHandler.js             Mongoose / JWT / generic
│   ├── validate.js                 express-validator wrapper
│   └── upload.js                   Multer disk storage, PDF/DOC/DOCX, 5 MB
├── scripts/seed.js                 Sample employer + jobseeker + 6 jobs
└── uploads/                        Resume files (gitignored)
```

### API Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET    | `/api/health` | — | — | Health check |
| POST   | `/api/auth/signup` | — | — | Register |
| POST   | `/api/auth/login` | — | — | Login |
| GET    | `/api/auth/me` | ✓ | any | Current user |
| PATCH  | `/api/auth/profile` | ✓ | any | Update profile |
| POST   | `/api/auth/resume` (multipart) | ✓ | jobseeker | Upload resume |
| GET    | `/api/jobs` | — | — | List + filters: `search,location,industry,type,page,limit` |
| GET    | `/api/jobs/:id` | — | — | Single job |
| GET    | `/api/jobs/admin/all` | ✓ | admin | All jobs (incl. inactive) |
| GET    | `/api/jobs?featured=true` | — | — | Featured jobs for homepage |
| POST   | `/api/jobs` | ✓ | admin | Create job |
| PUT    | `/api/jobs/:id` | ✓ | admin | Update job |
| DELETE | `/api/jobs/:id` | ✓ | admin | Delete job |
| GET    | `/api/jobs/employer/mine` | ✓ | employer | Deprecated (403) |
| POST   | `/api/hiring-requests` | optional | any/employer | Submit hiring request |
| GET    | `/api/hiring-requests/mine` | ✓ | employer | My hiring requests |
| GET    | `/api/hiring-requests` | ✓ | admin | All hiring requests |
| PATCH  | `/api/hiring-requests/:id/status` | ✓ | admin | Update request status |
| GET    | `/api/blogs` | — | — | Published blog list |
| GET    | `/api/blogs/:slug` | — | — | Single published post |
| GET/POST/PUT/DELETE | `/api/blogs/...` | ✓ | admin | Blog CRUD |
| GET    | `/api/admin/stats` | ✓ | admin | Dashboard counts |
| POST   | `/api/apply` (multipart) | ✓ | jobseeker | Apply to a job (`jobId`, `coverNote`, `resume` file optional) |
| GET    | `/api/applications/user` | ✓ | jobseeker | My applications |
| GET    | `/api/applications/admin?jobId=` | ✓ | admin | All applicants |
| PATCH  | `/api/applications/:id/status` | ✓ | admin | `pending\|reviewing\|shortlisted\|rejected\|hired` |

### Admin account (seed only)

After `npm run seed` in `backend/`:

| Email | Password | Role |
|---|---|---|
| `admin@lcc.com` | `admin1234` (or `ADMIN_PASSWORD` in `.env`) | admin |

Admin login: `login.html?admin=1` — public signup cannot create admin accounts.

### Security
- Passwords hashed with **bcrypt** (10 rounds).
- **JWT** (HS256, configurable expiry) sent via `Authorization: Bearer <token>`.
- **helmet** for HTTP headers.
- **cors** with allow-list from `CORS_ORIGINS` env.
- **express-rate-limit** — 300 req / 15 min global, 25 req / 15 min on `/api/auth`.
- **express-validator** input checks on auth + job creation.
- Multer with strict file-type and 5 MB cap.

---

## 🚀 Setup

### 1. Prerequisites
- **Node.js** 18+ and **npm**
- **MongoDB** — either local install ([download](https://www.mongodb.com/try/download/community)) or a free **Atlas** cluster

### 2. Backend

```bash
cd backend
npm install
copy .env.example .env       # (Windows)   /  on macOS/Linux: cp .env.example .env
# edit .env — set MONGO_URI and JWT_SECRET
npm run dev                  # uses nodemon
# OR
npm start                    # production-style
```

You should see:

```
✓ MongoDB connected: 127.0.0.1/lcc_job_portal
==============================================
  LCC Job Portal API
  Mode:  development
  Port:  5000
  <!-- URL:   http://localhost:5000/api/health -->
  URL: https://lcc-job-portal.onrender.com
==============================================
```

### 3. Seed sample data (optional)

```bash
cd backend
npm run seed
```

Creates:
- Employer login → `hr@lccdemo.com` / `demo1234`
- Jobseeker login → `fresher@lccdemo.com` / `demo1234`
- 6 sample job postings across IT / BFSI / Healthcare / Retail / HR

### 4. Frontend

The frontend is pure static HTML/CSS/JS. Serve `frontend/` with any static server.

**Easiest — VS Code Live Server:**
1. Install **Live Server** extension (Ritwick Dey).
2. Right-click `frontend/index.html` → **Open with Live Server**.
3. Default URL: <http://127.0.0.1:5500/index.html>.

**Or via Python:**

```bash
cd frontend
python -m http.server 5500
```

**Or via Node (http-server):**

```bash
npx http-server frontend -p 5500
```

> **Important — CORS:** The default `.env` whitelists `http://localhost:5500` and `http://127.0.0.1:5500`. If you serve frontend from a different port, add it to `CORS_ORIGINS` in `backend/.env` and restart the API.

### 5. Pointing frontend to a different API host

By default frontend calls `http://localhost:5000/api`. To override (e.g. when deployed), set `window.LCC_API_BASE` BEFORE `js/api.js` loads, in any HTML page:

```html
<script>window.LCC_API_BASE = 'https://api.lead-jobs.com/api';</script>
<script src="js/api.js"></script>
```

---

## 🧭 User Flows

### Job Seeker
1. `signup.html` → pick **Job Seeker** tab → fill name, email, password → JWT issued, redirected to dashboard.
2. **Dashboard** → save profile (name, phone, headline, location, skills) + upload resume.
3. **Browse Jobs** (`jobs.html`) → search/filter → open a job.
4. **Job Details** → click Apply → resume reused or upload new + cover note → submitted.
5. **Dashboard** → see all applications with live status (pending → reviewing → shortlisted → hired/rejected).

### Employer
1. `signup.html` → pick **Employer** tab → fill name, email, password, **company** → JWT issued, redirected to dashboard.
2. **Dashboard** → click "+ Post New Job" → fill role, location, salary, description, skills → publish.
3. **Dashboard** → see your jobs list (edit, pause/resume, delete).
4. **Applicants section** → filter by job → view candidate profile + resume → change status via dropdown.

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `--navy` | `#0B1F3A` | Primary brand, dark sections |
| `--navy-2` | `#162B4A` | Gradient pair |
| `--gold` | `#C9A84C` | Accent / CTA / highlights |
| `--gold-light` | `#E5C97E` | Soft accents on dark bg |
| `--cream` | `#FDF8F0` | Light section background |
| `--font-display` | `Playfair Display` | Headings |
| `--font-body` | `DM Sans` | Body, UI |

**Animations:**
- Hero entrance (GSAP timeline stagger)
- Section heading reveals (ScrollTrigger, 85% trigger)
- Card grid stagger (services, pillars, sectors, testimonials)
- Stat counters (`data-counter` + target attributes)
- CSS fallback `.reveal` class for offline / no-GSAP scenarios

---

## 🗂 Final Project Structure

```
lcc website/
├── README.md
├── frontend/
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   ├── industries.html
│   ├── how-it-works.html
│   ├── reviews.html
│   ├── contact.html
│   ├── login.html
│   ├── signup.html
│   ├── jobs.html
│   ├── job-details.html
│   ├── dashboard-jobseeker.html
│   ├── dashboard-employer.html
│   ├── post-job.html
│   ├── 404.html
│   ├── css/  (style.css, auth.css, dashboard.css)
│   ├── js/   (include, main, gsap-animations, api, auth, jobs, job-details, dashboard-common, dashboard-jobseeker, dashboard-employer, post-job)
│   └── images/
└── backend/
    ├── server.js
    ├── package.json
    ├── .env.example
    ├── .gitignore
    ├── config/db.js
    ├── models/  (User, Job, Application)
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── scripts/seed.js
    └── uploads/  (resume files, gitignored)
```

---

## 🔭 Roadmap (out of scope right now)

- Email/OTP verification on signup, password reset
- OAuth (Google / LinkedIn) login
- Admin panel for LCC team to moderate jobs / users
- Real-time chat between candidate & employer
- Notifications (email + in-app)
- Saved jobs / job alerts
- Advanced search (Elasticsearch / Atlas Search)
- Deployment scripts (Docker, PM2, nginx, CI/CD)

---

## 📞 Contact

**Lead Connects Career Pvt Ltd**
Office No. 12, Sai Complex, Opp. BBD Green City,
Ayodhya Road, Lucknow — 226028, Uttar Pradesh

Phone: [+91 91961 09055](tel:+919196109055) · [+91 94554 05381](tel:+919455405381)
Email: [leadconnectscareer@gmail.com](mailto:leadconnectscareer@gmail.com)
Website: <https://www.lead-jobs.com>

© 2026 Lead Connects Career Private Limited. All rights reserved.
