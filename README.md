# 🛡️ CivicTrack

<p align="center">
  <img src="public/logo.svg" alt="CivicTrack Logo" width="100"/>
</p>

<h3 align="center">AI-Powered Civic Issue Reporting & Municipal Management System</h3>

<p align="center">
  <a href="https://civic-track-blond.vercel.app/"><strong>🌐 View Live Demo</strong></a> ·
  <a href="#-key-features">Features</a> ·
  <a href="#-tech-stack">Tech Stack</a> ·
  <a href="#-api-documentation">API Docs</a> ·
  <a href="#-getting-started">Setup</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB Atlas" />
  <img src="https://img.shields.io/badge/NextAuth.js-JWT-blueviolet?style=for-the-badge&logo=next.js" alt="NextAuth.js" />
  <img src="https://img.shields.io/badge/OpenRouter-AI%20Vision-FF6B6B?style=for-the-badge" alt="OpenRouter AI Vision" />
  <img src="https://img.shields.io/badge/TailwindCSS-Vanilla-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel" alt="Vercel" />
</p>

---

## 📌 Executive Summary

**CivicTrack** is an end-to-end civic tech platform empowering citizens to report infrastructure hazards (potholes, garbage accumulation, water leaks, non-functional streetlights, damaged electric poles) in seconds. 

Utilizing **LLM Vision AI**, submitted photos are automatically analyzed, classified, and assigned a confidence score before being routed to the appropriate municipal department. The platform offers live status tracking for citizens, an administrative resolution portal for city officials, and a transparent public analytics dashboard.

---

## ✨ Key Features

- 👁️ **AI-Powered Image Recognition**: Analyzes user-uploaded photos in real time using OpenRouter LLM Vision models (`meta-llama/llama-3.2-11b-vision-instruct`) to identify issue categories with confidence scoring.
- 👥 **Concurrent Multi-Role Sessions**: Built-in support for simultaneous Citizen and Admin sessions across different browser contexts via NextAuth JWT authentication.
- 🔄 **Real-Time Live Synchronization**: Background polling synchronizes complaint progress and department statistics across Citizen and Admin dashboards seamlessly.
- 🏢 **Automated Department Routing**: Dynamically assigns complaints to specialized departments (*Road Maintenance, Sanitation, Water Supply, Electricity, Public Works*).
- 📊 **Transparent Public Analytics**: Real-time metrics on total complaints, resolution rates, and average resolution times per municipal department.
- 🔒 **Enterprise Role-Based Access**: Server-side route protection and bcrypt password hashing ensuring data integrity.
- 📱 **Modern Glassmorphic UI**: Dynamic responsive design built with React 19, Tailwind CSS, and Lucide icons.

---

## 🌐 Live Production Application

- **Production URL**: [https://civic-track-blond.vercel.app/](https://civic-track-blond.vercel.app/)

### 🔑 Demo Accounts

| Role | Email | Password | Dashboard Route |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin@civictrack.gov.in` | `Admin@1234` | `/admin` |
| **Citizen User** | `rahul@example.com` | `Citizen@1234` | `/dashboard` |

---

## 🛠️ Tech Stack

### Frontend & UI
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19, Tailwind CSS, Shadcn UI Components
- **Icons**: Lucide React
- **Notifications**: Sonner Toasts

### Backend & Auth
- **Server**: Next.js Serverless Route Handlers
- **Authentication**: NextAuth.js (Credentials Provider with JWT Strategy)
- **Password Security**: `bcryptjs` salted hashing

### Database & AI
- **Database**: MongoDB Atlas (Cloud Distributed Database)
- **Database Driver**: Official Native MongoDB Driver (`mongodb`) & Prisma Schema definition
- **AI / Vision Inference**: OpenRouter API (`meta-llama/llama-3.2-11b-vision-instruct`)

---

## 📡 API Documentation

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register a new Citizen account (or Admin for `@civictrack.gov.in` emails) |
| `/api/auth/[...nextauth]` | `GET/POST` | Public | NextAuth authentication handler (Login, Logout, Session check) |
| `/api/complaints` | `GET` | Authenticated | List complaints (Scoped to owner for Citizens, all for Admins) |
| `/api/complaints` | `POST` | Citizen | Submit a new civic complaint with location and photo |
| `/api/complaints/[id]` | `GET` | Authenticated | Fetch detailed complaint timeline and status updates |
| `/api/complaints/[id]` | `PATCH` | Admin Only | Update complaint status (`ACKNOWLEDGED`, `IN_PROGRESS`, `RESOLVED`) & add notes |
| `/api/departments/stats` | `GET` | Public | Compute live department resolution rates and metrics |
| `/api/categories` | `GET` | Public | Fetch supported issue categories and department mappings |
| `/api/upload` | `POST` | Authenticated | Upload complaint evidence photo |
| `/api/analyze` | `POST` | Authenticated | Execute LLM Vision analysis on submitted image |

---

## ⚙️ Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/swayam-248/Civic-Track.git
cd Civic-Track
npm install
```

### 2. Configure Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/civictrack?retryWrites=true&w=majority"
NEXTAUTH_SECRET="your-super-secret-jwt-key"
NEXTAUTH_URL="http://localhost:3000"
OPENROUTER_API_KEY="your-openrouter-api-key"
```

### 3. Seed MongoDB Database
Initialize default departments, categories, demo users, and complaints:
```bash
node prisma/seed_mongo.js
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment Instructions

### Deploy to Vercel

1. Push your repository to GitHub.
2. Connect your GitHub repository to [Vercel](https://vercel.com).
3. Add the following **Environment Variables** in Vercel settings:
   - `DATABASE_URL`: Your MongoDB Atlas Connection String
   - `NEXTAUTH_SECRET`: A secure random secret string
   - `OPENROUTER_API_KEY`: Your OpenRouter API Key
4. Click **Deploy**.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
