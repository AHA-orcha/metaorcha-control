# Contributing to MetaOrcha Control

Guide for developing the MetaOrcha frontend. This repo is UI-only — all backend logic, API integration, and orchestration live in [metaorcha-emerge](https://github.com/AHA-orcha/metaorcha-emerge).

## Two Development Options

### Option 1: Lovable (UI Development)

Use [Lovable](https://lovable.dev) for visual UI work — component design, layout changes, styling.

1. Open the Lovable project
2. Prompt or edit visually
3. Lovable auto-commits to this repo
4. Changes sync to GitHub automatically

**Best for**: New pages, component styling, layout tweaks, rapid prototyping.

### Option 2: IDE / Codespace (Integration Work)

Use your IDE or GitHub Codespaces for API integration, state management, and logic.

```bash
git clone https://github.com/AHA-orcha/metaorcha-control.git
cd metaorcha-control
npm install
npm run dev    # http://localhost:5173
```

**Best for**: API client code (`src/lib/`), data fetching, hooks, context providers, tests.

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production branch — Lovable syncs here |

### Workflow

1. **Lovable changes** commit directly to `main` (auto-sync)
2. **Manual changes** should also target `main`:
   ```bash
   git pull origin main          # always pull first (Lovable may have pushed)
   # make changes
   git add -A && git commit -m "feat: description"
   git push origin main
   ```
3. **Before pushing manually**, always pull to avoid conflicts with Lovable auto-commits:
   ```bash
   git pull --rebase origin main
   git push origin main
   ```

### Conflict Resolution

If Lovable and manual edits conflict:
1. `git pull --rebase origin main`
2. Resolve conflicts (prefer your logic changes, keep Lovable's styling)
3. `git push origin main`

## Frontend / Backend Separation

| Concern | Where |
|---------|-------|
| UI components, pages, styling | This repo (`metaorcha-control`) |
| API clients (`src/lib/*.ts`) | This repo (calls backend endpoints) |
| Backend services, APIs, Kafka, agents | `metaorcha-emerge` repo |
| Database, auth, orchestration logic | `metaorcha-emerge` repo |

### Connecting to Backend

The backend runs from the `metaorcha-emerge` repo. To develop with a live backend:

```bash
# Terminal 1: Start backend (in metaorcha-emerge repo)
cd /path/to/metaorcha-emerge/mvp
docker-compose up -d --build

# Terminal 2: Start frontend
cd /path/to/metaorcha-control
npm run dev
```

The `.env` file already points to `localhost:8000` (Gateway) and `localhost:8001` (Registry). If the backend is not running, the app enters mock mode automatically.

## Adding Features

### New Page

1. Create `src/pages/MyPage.tsx`
2. Add route in `src/App.tsx`:
   ```tsx
   <Route path="/my-page" element={<MyPage />} />
   ```
3. Add nav link in `src/components/TopNav.tsx`

### New Component

1. Create in `src/components/` (or subdirectory for related groups)
2. Use shadcn/ui primitives from `src/components/ui/` for consistency
3. Follow existing patterns: TypeScript, Tailwind classes, lucide-react icons

### New API Integration

1. Add client functions in `src/lib/` (e.g., `my-api.ts`)
2. Include mock fallback for when backend is unavailable
3. Use `@tanstack/react-query` for data fetching in components

### Adding shadcn/ui Components

```bash
npx shadcn-ui@latest add [component-name]
```

Components install to `src/components/ui/`.

## Testing

```bash
npm run test         # run vitest
npm run lint         # eslint check
npm run build        # type-check + build
```

## Project Structure

```
metaorcha-control/
├── src/
│   ├── App.tsx              # Router + providers
│   ├── pages/               # 8 route pages
│   ├── components/          # Shared components
│   │   ├── ui/              # 40+ shadcn/ui primitives
│   │   ├── execution/       # Event stream, status, cards
│   │   └── workflow/        # Input, hero, query examples
│   ├── contexts/            # AuthContext
│   ├── hooks/               # use-mobile, use-toast
│   ├── integrations/        # Supabase client
│   ├── lib/                 # API clients, utilities
│   └── test/                # Test setup
├── public/                  # Static assets
├── .env                     # Environment variables
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```
