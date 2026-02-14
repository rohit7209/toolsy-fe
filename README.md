# Toolsy Frontend

This repository contains the production frontend for **Toolsy**, built using **React + TypeScript + Vite**. It powers the client-facing web experience and is optimized for performance, reliability, and safe production deployments.

This is **not a template project** — it is a production-grade application with CI/CD, atomic deployments, and rollback capabilities.

---

# 📌 Purpose of This Repository

The frontend is designed to:

* Deliver a fast, modern web experience
* Communicate seamlessly with backend APIs
* Deploy safely without downtime
* Allow instant rollback if a release fails
* Remain easy for engineers to operate and debug

The infrastructure supporting this repo prioritizes **predictability over cleverness**.

> Boring deployments are good deployments.

---

# 🧱 Tech Stack

### Core

* **React** – UI layer
* **TypeScript** – Type safety and maintainability
* **Vite** – Lightning-fast build tool
* **ESLint** – Code quality enforcement

### Infrastructure

* **Nginx** – Static asset serving
* **EC2** – Hosting
* **GitHub Actions** – CI/CD
* **Atomic Releases** – Zero downtime deploys

---

# 🚀 Getting Started (Local Development)

## Prerequisites

* Node.js ≥ 18
* npm / pnpm / yarn
* Git

---

## Install Dependencies

```bash
npm install
```

---

## Start Development Server

```bash
npm run dev
```

Vite will start a local server with:

✅ Hot Module Replacement
✅ Fast refresh
✅ Type checking

Default URL:

```
http://localhost:5173
```

---

## Build for Production

```bash
npm run build
```

This generates:

```
dist/
```

⚠️ Never edit files inside `dist`.
They are build artifacts and will be replaced on every deploy.

---

## Preview Production Build

```bash
npm run preview
```

This simulates how the app behaves behind nginx.

Always preview large UI changes before merging.

---

# 📂 Project Structure

Typical layout:

```
src/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── services/     # API integrations
 ├── utils/
 └── main.tsx

public/
dist/              # build output (ignored in git)
```

### Structural Philosophy

* Keep components small and reusable
* Avoid business logic inside UI
* Centralize API calls
* Prefer composition over inheritance

---

# ⚙️ Environment Configuration (Local)

Environment variables are handled via Vite.

Example (APIs at root; no `/api` prefix):

```
VITE_API_BASE_URL=https://api.toolsy.xyz
# VITE_API_BASE_PATH is optional; omit or leave empty for APIs at /
```

### Rules:

✅ Prefix with `VITE_`
❌ Never commit secrets
❌ Never hardcode API URLs

---

# 🧪 Linting

Run:

```bash
npm run lint
```

Linting is enforced to maintain long-term code health.

Strong typing + linting reduces production bugs significantly.

---

# 🚢 Deployment Overview (Important)

Deployments are automated via **GitHub Actions**.

No manual server uploads should ever happen.

## High-Level Flow

1. Code merged to `main`
2. CI builds the app
3. A versioned release is created
4. Files uploaded to EC2
5. `current` symlink is switched
6. nginx reloads safely
7. Traffic moves instantly

**No downtime occurs.**

---

## Atomic Deployment Model

Server structure:

```
/var/www/toolsy
├── releases/
│    ├── 1770749001
│    ├── 1770749502
│
└── current -> releases/1770749502
```

nginx always serves:

```
/var/www/toolsy/current
```

Switching versions is just a symlink update — not a file overwrite.

This is why deployments are safe.

---

# 🔁 Rollback (Production Safety)

If a release causes issues:

```bash
ln -sfn releases/<previous> current
sudo systemctl reload nginx
```

Rollback time: **~2 seconds**

No rebuild required.

---

# 🧠 Deployment Guardrails

Before activating a release:

```
index.html must exist
```

If missing → deployment aborts.

This prevents broken builds from reaching users.

---

# 🛑 Operational Rules

These are non-negotiable.

### ❌ Never SSH and modify live files

### ❌ Never deploy directly into `/var/www/toolsy`

### ❌ Never edit old releases

### ❌ Never point nginx to a specific version

### ✅ Always use the CI pipeline

### ✅ Always deploy via releases

### ✅ Always validate builds locally

---

# 🐞 Debugging Production Issues

When something breaks, check in this order:

### 1️⃣ GitHub Actions logs

### 2️⃣ Build output (`dist`)

### 3️⃣ Server filesystem

### 4️⃣ Symlink (`current`)

### 5️⃣ Permissions

### 6️⃣ nginx logs

**Most issues are filesystem-related — not nginx.**

---

# 🧹 Maintenance

Old releases accumulate over time.

Keep the latest **5–7 releases**.

Example cleanup:

```bash
ls -dt /var/www/toolsy/releases/* | tail -n +6 | xargs rm -rf
```

This prevents disk exhaustion.

---

# 🔐 Security Notes

* Never expose secrets in `.env`
* Restrict SSH access
* Validate nginx configs before reload
* Prefer automation over manual access

---

# 📈 Recommended Engineering Practices

### Build before pushing large changes

Prevents CI surprises.

### Keep PRs focused

Smaller diffs = safer deploys.

### Avoid “Friday deploys”

Production incidents love weekends.

### Treat deploys as transactions:

**Prepare → Validate → Activate**

---

# 🔮 Future Improvements (Planned Direction)

* CDN in front of nginx for global performance
* Staging environment
* Health-check based auto rollback
* Preview deployments per PR
* Backend atomic deployments

---

# 🧭 Mental Model to Remember

> **Releases are immutable.
> The symlink controls traffic.
> CI controls releases.
> nginx stays boring.**

If deploying ever feels stressful — something is wrong with the process.

---

# Final Note

This frontend is backed by infrastructure designed for **calm production operations**.

The goal is simple:

👉 Deploy confidently
👉 Rollback instantly
👉 Sleep peacefully

Welcome to Toolsy 🚀
