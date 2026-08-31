# ♿ AccessMap

**See barriers. Report them. Create change.**

AccessMap is a community-powered web app for reporting, discovering, and tracking accessibility barriers in public spaces.

Built for **HackSocial 2026**.

## The Problem

Accessibility barriers such as broken elevators, blocked ramps, inaccessible entrances, and obstructed pathways can prevent people from accessing everyday spaces.

Reporting these issues can also feel like a dead end. AccessMap makes the process transparent:

**Report → Review → Action → Resolution**

## 🔐 Demo Admin Access

To check the admin workflow:

**Admin Dashboard:** [Open Admin Dashboard](https://accessmap-brown.vercel.app//admin)

- **Email:** `demo-admin@accessmap.app`
- **Password:** `12345678`

> This is a disposable demo account. AccessMap's MVP uses explicitly allowlisted administrator accounts enforced through Supabase Auth and PostgreSQL Row Level Security. A production version would use organization membership and role-based access control.

## Features

### Community
- Report accessibility barriers
- Attach photo evidence to reports
- Use AI-assisted reporting to turn natural descriptions into structured reports
- Explore community reports
- View barriers on an interactive map
- Add current location to reports
- Track report status
- See organization updates

### Organizations
- Secure admin login
- Review incoming reports
- Verify accessibility issues
- Mark issues as in progress
- Publish public updates
- Mark issues as resolved

## Report Lifecycle

```text
Submitted → Verified → In Progress → Resolved
```

Reports remain visible so the community can see what happens after an issue is submitted.

## Tech Stack

- **Next.js + React** — web application
- **TypeScript** — type safety
- **Tailwind CSS** — UI styling
- **Supabase** — backend and authentication
- **Supabase Storage** — photo evidence storage
- **PostgreSQL** — database
- **Row Level Security (RLS)** — database permissions
- **OpenAI API** — AI-assisted report structuring
- **Leaflet + OpenStreetMap** — interactive map
- **Lucide React** — icons
- **Vercel** — deployment

## Project Structure

```text
accessmap/
├── public/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   └── assist-report/
│   │   │       └── route.ts
│   │   ├── issues/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── report/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── accessibility-map.tsx
│   │   ├── map-section.tsx
│   │   ├── navbar.tsx
│   │   ├── report-card.tsx
│   │   └── status-badge.tsx
│   │
│   ├── lib/
│   │   ├── report-mappers.ts
│   │   └── supabase.ts
│   │
│   └── types/
│       └── report.ts
│
├── .env.local
├── package.json
└── README.md
```

## Security

Supabase Row Level Security controls database access.

**Public users can:**
- Read reports
- Submit reports
- Upload report photo evidence

**Public users cannot:**
- Modify existing reports
- Delete reports
- Publish organization updates

For this MVP, administrator accounts are manually provisioned through Supabase.

The OpenAI API key is kept server-side and is never exposed to the browser. If the external AI service is unavailable, AccessMap falls back to basic automatic report categorization so reporting remains functional.

## Run Locally

Requirements:

- Node.js 20.9+
- npm
- Supabase project
- OpenAI API key for AI-assisted reporting

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
OPENAI_API_KEY=your_openai_api_key
```

Start development:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Check

```bash
npm run lint
npm run build
npm start
```

## What's Next

With more time, AccessMap could add:

- Organization roles and permissions
- Notifications
- Address search/geocoding

## Built for HackSocial 2026

Accessibility barriers become easier to address when communities can make them visible.

**AccessMap — See barriers. Report them. Create change.**
