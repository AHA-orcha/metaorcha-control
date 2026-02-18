# MetaOrcha Control — Frontend

React frontend for the MetaOrcha AI agent orchestration platform. Built with Lovable, deployed via GitHub sync.

**Repo**: [AHA-orcha/metaorcha-control](https://github.com/AHA-orcha/metaorcha-control)
**Backend**: [AHA-orcha/metaorcha-emerge](https://github.com/AHA-orcha/metaorcha-emerge) (separate repo)

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Workflow Executor | Submit natural language queries, view SSE event stream |
| `/notion-research` | Notion Research | Notion agent interface (research → Notion pages) |
| `/admin` | Admin Dashboard | Platform overview, metrics summary |
| `/admin/metrics` | Metrics | Workflow execution metrics and charts |
| `/admin/agents` | Agents | Registered agent management |
| `/admin/api-keys` | API Keys | API key management |

## Components

| Component | Purpose |
|-----------|---------|
| `TopNav` | Navigation bar across all pages |
| `WorkflowExecutor` | Main workflow submission + live execution viewer |
| `ExecutionViewer` | Real-time SSE event stream display |
| `ExecutionTimeline` | Visual timeline of workflow steps |
| `ConsoleStream` | Raw event console output |
| `InterruptModal` | Human-in-the-loop interrupt handling |
| `LiveExecution` | Live workflow status indicator |
| `MockModeBadge` | Shows "Mock Mode" badge when backend is not connected |
| `NewWorkflow` | Workflow creation form |
| `Sidebar` | Navigation sidebar |

### UI Library

Built on [shadcn/ui](https://ui.shadcn.com/) — all primitives in `src/components/ui/`.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS** + **shadcn/ui** — styling
- **React Router** — client-side routing
- **TanStack Query** — data fetching
- **Recharts** — charts and metrics
- **Supabase** — auth (configured, not active in MVP)
- **Framer Motion** — animations

## Architecture

```
src/
├── pages/              # Route-level page components
├── components/         # Shared components
│   ├── ui/             # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── execution/      # Workflow execution display components
│   └── workflow/       # Workflow input and hero components
├── contexts/           # React contexts (AuthContext)
├── hooks/              # Custom hooks (use-mobile, use-toast)
├── integrations/       # Supabase client + types
├── lib/                # API clients and utilities
│   ├── admin-api.ts    # Gateway API client + mock mode detection
│   ├── notion-agent-api.ts  # Notion agent API client
│   └── utils.ts        # Shared utilities (cn, etc.)
└── test/               # Test setup + example test
```

## Mock Mode

When the backend is not reachable, the app automatically enters **mock mode** — showing demo data and a yellow "Mock Mode" badge. Controlled by:

- `VITE_USE_MOCK_DATA=true` — force mock mode
- Auto-detected when `VITE_BACKEND_URL` is unreachable

## Environment Variables

```bash
# Backend services (set in .env)
VITE_API_BASE_URL=http://localhost:8000
VITE_GATEWAY_URL=http://localhost:8000
VITE_REGISTRY_URL=http://localhost:8001
VITE_NOTION_AGENT_URL=http://localhost:3003

# Supabase (pre-configured)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Mock mode override
VITE_USE_MOCK_DATA=true
```

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for full workflow.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build
npm run test         # vitest
npm run lint         # eslint
```
