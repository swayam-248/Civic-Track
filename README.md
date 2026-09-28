# CivicTrack

A civic-issue reporting platform: citizens report problems (potholes, garbage, water leaks, streetlights, electric poles) with a photo, the issue is routed to the responsible department, and progress is tracked publicly.

**Stack:** Next.js 15 (App Router) · React · Tailwind + shadcn/ui · Prisma + SQLite · NextAuth (credentials, bcrypt) · sharp

## Setup

```bash
git clone https://github.com/tanishsaini626-prog/CivicTrack.git
cd CivicTrack
cp .env.example .env        # then set NEXTAUTH_SECRET to a long random string
npm run setup               # install, prisma generate, create DB, seed
npm run dev                 # http://localhost:3000
```

Demo accounts created by the seed script:

| Role    | Email                     | Password     |
|---------|---------------------------|--------------|
| Admin   | admin@civictrack.gov.in   | Admin@1234   |
| Citizen | rahul@example.com         | Citizen@1234 |

## What is real

- Users, complaints, departments, categories and status history live in the database (`prisma/schema.prisma`).
- Passwords are bcrypt-hashed; sessions are JWT via NextAuth; admin routes are role-protected server-side.
- Uploaded photos are stored in `public/uploads/`.
- Department statistics are computed live from complaint rows (`/api/departments/stats`).

## API

| Route | Method | Access | Purpose |
|---|---|---|---|
| `/api/auth/register` | POST | public | Create account |
| `/api/auth/[...nextauth]` | GET/POST | public | Login / session |
| `/api/complaints` | GET | user (own) / admin (all) | List complaints |
| `/api/complaints` | POST | user | File complaint |
| `/api/complaints/:id` | GET | owner / admin | Complaint detail |
| `/api/complaints/:id` | PATCH | admin | Update status + note |
| `/api/departments/stats` | GET | public | Live performance stats |
| `/api/categories` | GET | public | Issue categories |
| `/api/upload` | POST | user | Upload photo |
| `/api/analyze` | POST | user | Photo quality / confidence scoring |

## Limitation (be upfront in your report)

`/api/analyze` is **not a trained ML classifier**. It computes a deterministic confidence score from real image statistics (resolution, contrast, brightness) and the category the citizen selects. A real vision model can be dropped into that single route later.
