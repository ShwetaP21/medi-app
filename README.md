# MediVault 🏥

> A secure, full-stack personal health records platform with AI-powered lab report summarisation.

Built with **Next.js 16**, **TypeScript**, **PostgreSQL + Prisma**, **NextAuth.js v5**, and **Grok**.

## Live Demo

- **URL**: [https://medi-app-two.vercel.app/](https://medi-app-two.vercel.app/)

---

## ✨ Features

- **🔐 Authentication** — JWT-based auth with NextAuth.js, bcrypt password hashing, role-based access (patient/doctor/admin)
- **🩺 Health Records** — Log doctor visits, diagnoses, procedures, vaccinations, allergies, lab results — full CRUD
- **📅 Appointments** — Book, reschedule, cancel appointments with status tracking (upcoming/completed/cancelled)
- **💊 Medications** — Track active medications, dosage, frequency, toggle active/inactive
- **📄 Documents** — Upload and manage lab reports, prescriptions, imaging scans
- **🤖 AI Lab Summariser** — Upload a text lab report → get a plain-English AI summary via Grok
- **📊 Dashboard** — At-a-glance stats, next appointment card, recent records
- **🛡️ Security** — Middleware route protection, security headers, Zod validation, Prisma (no raw SQL)
- **📱 Responsive** — Mobile, tablet, and desktop ready

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, DM Sans font |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 (JWT) |
| Validation | Zod |
| AI | Grok |
| CI/CD | GitHub Actions |

---

## 🚀 Local Setup

### 1. Clone & install

```bash
git clone https://github.com/yourusername/medivault.git
cd medivault
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Get a free PostgreSQL DB from https://neon.tech
DATABASE_URL="postgresql://user:password@host/medivault?sslmode=require"

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

GROQ_API_KEY="sk-..."
```

### 3. Database setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to your DB
npm run db:push

# Seed with demo data (optional)
npm run db:seed
```

**Demo login credentials** (after seeding):
- Email: `demo@medivault.app`
- Password: `Demo@1234`

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## 📁 Project Structure

```
medivault/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handler
│   │   ├── register/              # Registration endpoint
│   │   ├── health-records/        # CRUD + [id]
│   │   ├── appointments/          # CRUD + [id]
│   │   ├── medications/           # CRUD + [id]
│   │   ├── documents/             # CRUD + [id]
│   │   ├── ai/summarise/          # AI lab report summariser
│   │   └── dashboard/             # Stats aggregation
│   ├── dashboard/
│   │   ├── page.tsx               # Dashboard home
│   │   ├── records/               # Health records UI
│   │   ├── appointments/          # Appointments UI
│   │   ├── medications/           # Medications UI
│   │   └── documents/             # Documents + AI UI
│   ├── login/
│   ├── register/
│   └── page.tsx                   # Landing page
├── components/
│   ├── sidebar.tsx                # Nav sidebar
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── modal.tsx
│       ├── stat-card.tsx
│       ├── empty-state.tsx
│       └── toaster.tsx
├── lib/
│   ├── auth.ts                    # NextAuth config
│   ├── prisma.ts                  # Prisma singleton
│   ├── utils.ts                   # cn, formatDate, getInitials
│   └── validations.ts             # Zod schemas
├── prisma/
│   ├── schema.prisma              # DB schema (6 models)
│   └── seed.ts                    # Demo data seeder
├── types/
│   └── next-auth.d.ts             # Session type extensions
├── middleware.ts                   # Route protection
├── .github/workflows/ci.yml       # GitHub Actions CI
└── .env.example
```

---

## 🤖 AI Feature — Lab Report Summariser

1. Go to **Documents** → **Upload Document**
2. Select type **Lab Report**, upload a `.txt` file with lab values
3. Click **"🤖 AI Summary"** on the card
4. AI explains results in plain English, flags abnormal values, suggests follow-up

> ⚠️ Informational only — always consult your doctor.

---

## 🔒 Security Measures

- All dashboard routes protected by NextAuth middleware
- Passwords hashed with bcrypt (12 rounds)
- All DB queries scoped by `userId` — prevents IDOR attacks
- Input validated with Zod before touching the database
- Prisma ORM — no raw SQL, no injection risk
- HTTP security headers on all routes

---

## 📜 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run db:push      # Push schema to DB (no migration history)
npm run db:migrate   # Run migrations (with history)
npm run db:seed      # Seed demo data
npm run db:studio    # Prisma Studio (visual DB browser)
```

---

## 👨‍💻 Author


- 🐙 GitHub: [github.com/yourusername](https://github.com/ShwetaP21)

---

*MediVault — House of Edtech Fullstack Developer Assignment, Jan 2026*
# medi-app
