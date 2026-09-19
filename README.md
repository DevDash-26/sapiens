# Universal College Lanka (UCL) — Digital Campus Management System

> **An authoritative, multi-tenant digital hub and communication platform built for students, faculty, staff, and alumni at Universal College Lanka.**  
> Developed for the **DevDash '26 Hackathon**.

---

## Executive Overview

The **Universal College Lanka (UCL) Digital Campus Management System** consolidates fragmented university communication channels—such as disparate chat groups, physical bulletin boards, and one-off emails—into a unified, real-time institutional platform. Engineered as a cross-platform mobile and web application, it provides an authoritative single source of truth for academic notices, emergency safety broadcasts, campus facility reservations, student life, career opportunities, and conversational AI assistance.

---

## Core Capabilities & System Modules

- **Unified Institutional Noticeboard & Alerts**  
  Categorized, priority-ranked campus notices and safety alerts with targeted cohort delivery based on faculty, academic year, and role.

- **Automated & Manual Emergency SMS Broadcast**  
  Instant SMS dispatch integrated directly with telecom gateways to deliver critical safety updates to students and staff mobile devices in real time.

- **Conversational AI Campus Assistant**  
  An interactive, natural-language campus companion grounded in official UCL regulations, facility locations, and academic FAQs, providing instant guidance and intelligent in-app routing.

- **Campus Facilities, Services & Defect Triage**  
  End-to-end management of campus operations, including real-time classroom availability, study room reservations, maintenance reporting, and lost & found claim verification.

- **Student Engagement, Societies & Mentorship**  
  Centralized club directory, event RSVP tracking, academic milestone recaps, and an alumni mentorship network connecting current cohorts with graduates.

- **Administrative Console & Enterprise Bulk Data Transfer**  
  Comprehensive staff administration suite supporting high-throughput CSV/JSON data ingestion and export across students, faculty, society rosters, and university asset catalogs.

---

## Access Governance & 8-Tier RBAC

The platform enforces least-privilege security through an **8-Tier Role-Based Access Control (RBAC)** architecture verified via cryptographic claims and strict database authorization policies:

| Tier | Role | Scope & Privileges |
| :---: | :--- | :--- |
| **8** | **Super Admin** | Full system governance, security override, audit log inspection, and global data migration. |
| **7** | **Admin Staff** | Campus-wide broadcast administration, account lifecycle management, and facility triage. |
| **6** | **Manager** | Departmental operations oversight, approval queues, and institutional telemetry analysis. |
| **5** | **Finance Staff** | Scholarship allocation, tuition verification, and financial reconciliation exports. |
| **4** | **Academic Staff** | Faculty announcements, lecture scheduling, academic support resolution, and attendance. |
| **3** | **Society Representative** | Student club profile administration, event hosting, and member registration review. |
| **2** | **Student** | Timetable discovery, room reservations, incident reporting, lost & found claims, and AI assistant access. |
| **1** | **Past Alumni** | Alumni directory participation, career mentorship programs, and reunion networking. |

---

## Technology Stack & Attributions

### Frontend & Client Architecture
- **Framework:** Expo SDK 57 (React Native for Web, iOS, and Android)
- **Engine:** React 19 & React Native 0.86
- **Web Runtime & Responsive Layout:** `react-native-web` with constrained mobile aspect framing
- **Icons & Visual System:** `@expo/vector-icons` (Vectorized Ionicons, Material Design, FontAwesome)
- **Hosting & CDN:** Netlify Global Edge Network

### Backend, Database & Cloud Infrastructure
- **Serverless Compute:** Firebase Cloud Functions (Node.js 20, TypeScript, Express API layer)
- **Real-Time Database:** Google Cloud Firestore (Document database with role-guarded security rules)
- **Authentication:** Firebase Authentication with 8-tier Custom Claims
- **Object Storage:** Google Cloud Storage for digital assets, posters, and verification attachments

### Third-Party APIs & External Integrations
- **SMS Gateway:** [Text.lk](https://app.text.lk/) REST API (Bearer token authentication) for high-priority emergency notifications
- **AI Engine:** Google Gemini API (`gemini-3.1-flash-lite`) for fast, natural-language student inquiry resolution and campus guidance

### AI Assistance & Engineering Attributions
In accordance with DevDash '26 guidelines and transparency standards, the following AI systems were utilized as engineering aids during development:
- **Google Antigravity & Google Jules:** Agentic code generation, architecture planning, and workflow orchestration.
- **Google Veo:** Presentation visual asset generation.

---

## License & Intellectual Property

Developed by **Team Sapiens** for Universal College Lanka (UCL). All rights reserved.
