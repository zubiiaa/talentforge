# TalentForge

A LinkedIn-style job platform I built to go past the usual CRUD demo — real auth, file uploads, search, a job board, a social feed, an analytics dashboard, and a resume builder that exports to PDF.

It started as a static Create React App page and got rebuilt from scratch on Next.js.

> Live: _add your Vercel URL here_
> Try it without signing up — there's an "Explore as guest" option on the login page (job-seeker or employer).

## What's in it

- **Auth** — email/password with Auth.js (JWT in an httpOnly cookie), route protection via middleware, register / login / logout.
- **Profiles** — headline, bio, skills, and full experience/education, plus avatar, cover, and resume uploads.
- **Feed** — post text and images, like, comment, delete your own posts.
- **Jobs** — employers post roles; seekers search, filter, paginate, save, and apply. Applications are stored per user.
- **Dashboard** — profile views, posts, applications and saved jobs, with charts and a full application history.
- **Resume builder** — keep several resumes, edit them in a split-screen editor with a live preview, and download each as a branded PDF.

## Stack

Next.js 15 (App Router) + TypeScript, Tailwind + shadcn/ui, Auth.js v5, MongoDB/Mongoose, Vercel Blob for uploads, react-hook-form + Zod, Recharts, and @react-pdf/renderer.

## Running it locally

You'll need Node 20+ and a MongoDB connection string (Atlas free tier is fine).

```bash
npm install
cp .env.example .env.local   # fill in the three values below
npm run seed                 # optional — loads some demo users, jobs and posts
npm run dev
```

`.env.local`:

| Variable | What it's for |
| --- | --- |
| `MONGODB_URI` | Your MongoDB connection string |
| `AUTH_SECRET` | Auth.js signing secret — run `npx auth secret` to generate one |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for uploads (optional locally) |

If you don't set a Blob token, uploads just get written to `public/uploads` so local dev works out of the box. On Vercel you need the token, because the filesystem there is read-only.

## Deploying

Push to GitHub and import the repo into Vercel. `.env.local` is gitignored on purpose, so add the same variables under the project's Environment Variables settings. Add Vercel Blob from the Storage tab and it wires up `BLOB_READ_WRITE_TOKEN` for you.

## A note on the folder layout

```
src/
  app/
    (auth)/      login, register
    (app)/       feed, jobs, profile, dashboard, resume, settings
    api/         auth + resume-PDF endpoints
  components/    ui primitives + feature components
  data/          read queries (users, jobs, posts, dashboard, resumes)
  server/actions/ writes (auth, profile, jobs, posts, resumes)
  models/        Mongoose schemas
  lib/           auth, db, session, uploads, validation
scripts/seed.ts  demo data
```

Reads and writes are kept apart — `data/` only queries, `server/actions/` only mutates — so it's easy to follow where state changes.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run seed` | Load demo data |
| `npm run lint` | Lint |
