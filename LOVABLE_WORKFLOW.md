# 🔄 Lovable + GitHub Workflow

## Understanding the Setup

### What is Lovable?

**Lovable** is a visual development platform that:
- **Hosts ONLY the frontend** (React app)
- **Syncs with GitHub** (metaorcha-control repo)
- **Auto-deploys** when you push to GitHub
- **Provides live preview** URL for demos
- **AI-powered UI development** tool

### Repository Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  THIS WORKSPACE (Codespaces/Local)                              │
│  /workspaces/metaorcha-emerge/                                  │
│                                                                  │
│  ├── frontend/           ← metaorcha-control repo (Lovable)    │
│  │   ├── src/                                                   │
│  │   ├── package.json                                           │
│  │   └── .git → github.com/AHA-orcha/metaorcha-control         │
│  │                                                               │
│  ├── services/           ← Backend services (metaorcha-emerge)  │
│  │   ├── gateway/                                               │
│  │   ├── registry/                                              │
│  │   └── runtime/                                               │
│  │                                                               │
│  ├── agents/             ← Agent implementations                │
│  │   └── notion-research/                                       │
│  │                                                               │
│  └── .git → github.com/AHA-orcha/metaorcha-emerge              │
└─────────────────────────────────────────────────────────────────┘
```

### Two Repositories

**1. metaorcha-control** (Frontend ONLY):
- **GitHub**: https://github.com/AHA-orcha/metaorcha-control
- **Branch**: main
- **Lovable Project**: Connected to this repo
- **Location**: `/workspaces/metaorcha-emerge/frontend/`
- **Contains**: React app, UI components, Vite config

**2. metaorcha-emerge** (Backend):
- **GitHub**: https://github.com/AHA-orcha/metaorcha-emerge  
- **Branch**: az/mvp-core
- **NOT in Lovable**: Backend services only
- **Location**: `/workspaces/metaorcha-emerge/`
- **Contains**: Gateway, Registry, Runtime, Agents

## 🔄 Development Workflow

### Current Setup: Frontend on Lovable, Backend Local

```
┌─────────────────────┐
│  You (Developer)    │
│  This Workspace     │
└──────────┬──────────┘
           │
           │ Edit files in:
           │ frontend/src/
           │
           ▼
┌─────────────────────────────────────────────────┐
│  Git Commit & Push                              │
│  cd frontend/                                   │
│  git add .                                      │
│  git commit -m "Update feature"                 │
│  git push origin main                           │
└──────────┬──────────────────────────────────────┘
           │
           │ Pushes to GitHub
           ▼
┌─────────────────────────────────────────────────┐
│  GitHub Repository                              │
│  github.com/AHA-orcha/metaorcha-control         │
└──────────┬──────────────────────────────────────┘
           │
           │ Webhook triggers
           ▼
┌─────────────────────────────────────────────────┐
│  Lovable Platform                               │
│  • Detects commit                               │
│  • Pulls latest code                            │
│  • Runs: npm install                            │
│  • Runs: vite build                             │
│  • Deploys to preview URL                       │
└──────────┬──────────────────────────────────────┘
           │
           │ Live in ~30 seconds
           ▼
┌─────────────────────────────────────────────────┐
│  Lovable Preview URL                            │
│  https://your-project.lovable.app              │
│  • Frontend running                             │
│  • Mock mode active (no backend needed)        │
│  • 🎭 Badge visible                             │
└─────────────────────────────────────────────────┘
```

### How Changes Sync

**Step-by-step**:

1. **You edit** files in `/workspaces/metaorcha-emerge/frontend/`
2. **Git commit** your changes locally
3. **Git push** to GitHub (metaorcha-control repo)
4. **Lovable detects** the push via webhook
5. **Lovable rebuilds** and redeploys automatically
6. **Preview updates** in ~30 seconds

**You can also**:
- Edit directly in Lovable UI (AI-assisted)
- Changes in Lovable auto-commit to GitHub
- Pull those changes back to this workspace

### Bi-Directional Sync

```
This Workspace          GitHub              Lovable
     ↓                     ↓                   ↓
 Edit files         git push →         Auto-deploy
     ↑                     ↑                   ↑
 git pull      ←  Lovable commits     Edit in UI
```

## 🎯 Where to Work

### Frontend Development

**Option A: Work Here (Recommended for code)**
```bash
cd /workspaces/metaorcha-emerge/frontend

# Edit files
code src/pages/NotionResearch.tsx

# Test locally
npm run dev  # http://localhost:8080

# Commit & push
git add .
git commit -m "Add feature"
git push origin main

# Wait ~30s, check Lovable preview
```

**Option B: Work in Lovable (Recommended for UI)**
1. Open Lovable project
2. Use AI chat: "Add a button to the dashboard"
3. Lovable generates code
4. Review changes
5. Click "Save" → auto-commits to GitHub
6. Pull changes here:
   ```bash
   cd frontend
   git pull origin main
   ```

### Backend Development

**Currently: Only in This Workspace**
```bash
cd /workspaces/metaorcha-emerge/services/gateway

# Edit backend code
code src/main.py

# Test with Docker
cd ../../mvp
docker-compose up -d

# Commit to metaorcha-emerge repo
git add .
git commit -m "Update gateway"
git push origin az/mvp-core
```

## 🤔 Can Backend Run on Lovable?

### Current Situation: NO

Lovable currently only supports:
- ✅ Frontend (React, Vue, Svelte)
- ✅ Static site generation  
- ✅ Environment variables
- ❌ Backend services (Python FastAPI)
- ❌ Docker containers
- ❌ Databases (PostgreSQL)
- ❌ Message queues (Kafka)

### Possible Solutions

**Option 1: Deploy Backend Elsewhere** (Recommended)
```
Frontend (Lovable)  →  Backend (Fly.io/Railway)  →  Database (Supabase)
  React App             Python Services              PostgreSQL
  VITE_BACKEND_URL=     Gateway, Registry,          Managed DB
  https://api.*.fly.dev Runtime, Agents
```

**Option 2: Serverless Functions** (If Lovable Adds Support)
- Convert Python services to edge functions
- Use Lovable's serverless platform (if available)
- Would require major architecture changes

**Option 3: Full-Stack Hosting** (Future)
- If Lovable adds backend support
- Could run Docker containers
- Would allow full-stack in one platform

### Architecture Compatibility

**Our Current Backend**:
```python
# services/gateway/Dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0"]
```

❌ **Not compatible** with Lovable (requires Docker/containerization)

**What WOULD Work on Lovable** (if they add backend support):
- Node.js API routes
- Edge functions (Cloudflare Workers style)
- Serverless endpoints
- Static API (JSON files)

### Recommendation: Hybrid Approach

✅ **Keep Current Split**:
- **Frontend**: Lovable (great for UI, fast deploys, AI assistance)
- **Backend**: Fly.io or Railway (built for Python/Docker)
- **Database**: Supabase or Fly Postgres (managed)

**Why**:
- Lovable excels at frontend
- Backend needs Docker/Python (not Lovable's strength)
- Easier to scale independently
- Better tool for each job

## 📋 Keeping Repos in Sync

### Two-Repo Strategy

**metaorcha-control** (Frontend):
```bash
cd /workspaces/metaorcha-emerge/frontend

# Check remote
git remote -v
# origin  https://github.com/AHA-orcha/metaorcha-control.git

# Always work on main branch
git checkout main

# Pull before editing
git pull origin main

# Make changes, commit, push
git add .
git commit -m "Update UI"
git push origin main
```

**metaorcha-emerge** (Backend):
```bash
cd /workspaces/metaorcha-emerge

# Check remote
git remote -v
# origin  https://github.com/AHA-orcha/metaorcha-emerge.git

# Work on feature branch
git checkout az/mvp-core

# Pull latest
git pull origin az/mvp-core

# Make changes, commit, push
git add services/gateway/
git commit -m "Update backend"
git push origin az/mvp-core
```

### Preventing Sync Issues

**Rules**:
1. ✅ **Frontend files** → Only commit to `metaorcha-control`
2. ✅ **Backend files** → Only commit to `metaorcha-emerge`
3. ❌ **Don't mix** repos in commits
4. ✅ **Pull before push** to avoid conflicts
5. ✅ **Check remote** before committing (`git remote -v`)

**Current Structure**:
```
/workspaces/metaorcha-emerge/
├── frontend/          ← Separate git repo (metaorcha-control)
│   └── .git/
│
├── services/          ← Part of metaorcha-emerge repo
├── agents/
├── mvp/
└── .git/              ← metaorcha-emerge repo
```

### Sync Checklist

**Before Editing Frontend**:
- [ ] `cd frontend/`
- [ ] `git pull origin main`
- [ ] Check Lovable for any uncommitted changes
- [ ] Edit files
- [ ] `git push origin main`
- [ ] Verify Lovable preview updated

**Before Editing Backend**:
- [ ] `cd /workspaces/metaorcha-emerge/`
- [ ] `git pull origin az/mvp-core`
- [ ] Edit files (services/, agents/, etc.)
- [ ] `git push origin az/mvp-core`
- [ ] Test locally with Docker

## 🚀 Complete Development Loop

### Scenario: Add New Feature

**Frontend Part**:
```bash
# 1. Edit UI in this workspace
cd /workspaces/metaorcha-emerge/frontend
code src/pages/NewFeature.tsx

# 2. Test locally
npm run dev
# Open http://localhost:8080

# 3. Commit and push
git add src/pages/NewFeature.tsx
git commit -m "Add new feature page"
git push origin main

# 4. Verify on Lovable
# Wait ~30s
# Open https://your-project.lovable.app
```

**Backend Part**:
```bash
# 1. Update API endpoint
cd /workspaces/metaorcha-emerge/services/gateway
code src/routes/new_feature.py

# 2. Test locally
cd ../../mvp
docker-compose restart gateway

# 3. Commit and push (different repo!)
cd ../
git add services/gateway/
git commit -m "Add new feature endpoint"
git push origin az/mvp-core

# 4. Deploy backend (when ready)
# Deploy to Fly.io (separate step)
```

**Connect Them**:
```bash
# Update frontend to call new backend endpoint
cd frontend
# Edit .env or Lovable env vars
# VITE_BACKEND_URL=https://your-backend.fly.dev

# Push changes
git commit -m "Connect to new backend endpoint"
git push origin main
```

## 🎯 Quick Reference

### What Lives Where

| Component | Repository | Platform | URL |
|-----------|-----------|----------|-----|
| **Frontend** | metaorcha-control | Lovable | https://*.lovable.app |
| **Backend** | metaorcha-emerge | Fly.io/Railway | https://*.fly.dev |
| **Database** | metaorcha-emerge | Supabase/Fly | postgres://... |
| **Agents** | metaorcha-emerge | Fly.io | https://agents.*.fly.dev |

### Git Remotes

```bash
# Frontend
cd frontend/
git remote -v
# → github.com/AHA-orcha/metaorcha-control

# Backend
cd ../
git remote -v  
# → github.com/AHA-orcha/metaorcha-emerge
```

### Environment Variables

**Frontend** (Lovable Settings):
```
VITE_USE_MOCK_DATA=true              # For preview (no backend)
VITE_BACKEND_URL=https://api.*.fly.dev  # For production
```

**Backend** (Fly.io Secrets):
```bash
flyctl secrets set \
  OPENROUTER_API_KEY=sk-... \
  DATABASE_URL=postgres://...
```

## 🆘 Troubleshooting

### "Lovable shows old code"
```bash
# Force rebuild
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

### "Changes not syncing from Lovable"
```bash
cd frontend/
git pull origin main  # Pull Lovable's commits
```

### "Wrong repo!"
```bash
# Verify before committing
git remote -v

# If in wrong repo, stash and move
git stash
cd <correct-directory>
git stash pop
```

### "Backend not accessible from Lovable"
- ✅ Deploy backend to cloud (Fly.io/Railway)
- ✅ Set `VITE_BACKEND_URL` in Lovable
- ✅ Update CORS in backend to allow Lovable domain

---

**Summary**: 
- 📱 **Frontend**: Edit here → Push to GitHub → Lovable auto-deploys
- 🖥️ **Backend**: Edit here → Push to GitHub → Deploy to Fly.io manually
- ✅ **Two repos**: Keep them separate, sync carefully
- 🚀 **Lovable**: Frontend hosting + AI UI builder (not for backend)

