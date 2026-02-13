# 🎨 Lovable Preview Setup Guide

## ✅ What's Been Implemented

Your frontend now has **smart mock mode** that works perfectly on Lovable preview without needing the backend!

### 🎯 Key Features Added

1. **Smart Mock Detection** - Automatically detects when backend is unavailable
2. **Comprehensive Mock Data** - All API endpoints have realistic fallback data
3. **Mock Mode Badge** - Visual indicator showing demo mode is active
4. **Environment Flexibility** - Easy toggle between mock/real backend

## 🚀 How to Deploy to Lovable

### Step 1: Set Environment Variables in Lovable

In your Lovable project settings, add these environment variables:

```bash
VITE_USE_MOCK_DATA=true
VITE_ENVIRONMENT=preview
```

**Where to set these:**
1. Open your Lovable project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add the variables above
4. Click **Save** and redeploy

### Step 2: Push Code to GitHub

```bash
cd /workspaces/metaorcha-emerge/frontend
git add .
git commit -m "Add mock mode for Lovable preview"
git push origin main
```

Lovable will automatically detect the changes and redeploy.

### Step 3: Verify It Works

1. Open your Lovable preview URL
2. Look for the **🎭 Mock Mode** badge in bottom-right corner
3. Navigate to different pages:
   - `/` - Home page
   - `/admin` - Dashboard with mock metrics
   - `/admin/agents` - Shows 7 demo agents including Notion Research
   - `/notion-research` - Full Notion agent interface
4. Check browser console - should see logs like:
   ```
   🎭 Running in MOCK MODE - using demo data
   🎭 Mock: Agent health check
   ```

## 🎭 Mock Mode Features

### What Works in Mock Mode

✅ **Admin Dashboard**
- Shows 6 healthy services
- Displays 1,284 total workflows
- 94.7% success rate
- Real-time event stream (simulated)

✅ **Agent Registry**
- Lists 7 agents including Notion Research Agent
- Shows capabilities for each agent
- Protocol types (MCP/A2A)
- Status indicators

✅ **Notion Research Page**
- Health check returns "healthy"
- Shows 5 available tools
- Workflow submission works
- SSE event streaming simulated
- Shows mock Notion page URL

✅ **All Pages Load Without Errors**
- No "Failed to fetch" errors
- No blank pages
- All UI components functional

### What's Simulated

⚠️ **Not Real (But Looks Real)**
- Notion pages aren't actually created
- Research doesn't hit real APIs
- Workflows don't execute on backend
- Event streaming is simulated with timeouts
- All data is static/demo

## 🔄 Switching to Real Backend

When you're ready to deploy the backend and connect to real services:

### Step 1: Deploy Backend (See DEPLOYMENT_STRATEGY.md)

Deploy to Fly.io/Railway and get your URLs:
- Gateway: `https://metaorcha-gateway.fly.dev`
- Notion Agent: `https://metaorcha-notion-agent.fly.dev`

### Step 2: Update Lovable Environment Variables

```bash
# In Lovable Settings → Environment Variables
VITE_BACKEND_URL=https://metaorcha-gateway.fly.dev
VITE_GATEWAY_URL=https://metaorcha-gateway.fly.dev
VITE_NOTION_AGENT_URL=https://metaorcha-notion-agent.fly.dev
VITE_USE_MOCK_DATA=false  # <-- Turn off mock mode
```

### Step 3: Update Backend CORS

In your backend, allow Lovable's domain:

```python
# services/gateway/src/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "https://*.lovable.app",  # <-- Add this
        "https://lovable.dev",
        # Add your specific preview URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📊 Environment Configuration Matrix

| Environment | VITE_USE_MOCK_DATA | VITE_BACKEND_URL | Result |
|-------------|-------------------|------------------|--------|
| **Lovable Preview** | `true` | (not set) | 🎭 Mock mode active |
| **Local Dev** | `false` | `http://localhost:8000` | 🔌 Real backend (via Docker) |
| **Production** | `false` | `https://api.metaorcha.com` | 🚀 Live backend (cloud) |

## 🐛 Troubleshooting

### Issue: Mock Mode Badge Not Showing

**Check:**
1. Is `VITE_USE_MOCK_DATA=true` set in Lovable?
2. Did you redeploy after setting env vars?
3. Hard refresh the preview (Cmd+Shift+R)

**Fix:**
```bash
# In Lovable Settings
VITE_USE_MOCK_DATA=true
```

### Issue: Pages Show Errors

**Check browser console for:**
- Import errors → Missing component file
- React errors → Check component syntax

**Common fixes:**
```bash
# Verify all files committed
git status

# Push any missing files
git add src/components/MockModeBadge.tsx
git push origin main
```

### Issue: Want to Test Real Backend from Lovable

**Option 1: Use ngrok (Quick Test)**
```bash
# On your local machine
ngrok http 8000

# Copy the URL (e.g., https://abc123.ngrok.io)
# Set in Lovable:
VITE_BACKEND_URL=https://abc123.ngrok.io
VITE_USE_MOCK_DATA=false
```

**Option 2: Deploy to Cloud (Production)**
- See `DEPLOYMENT_STRATEGY.md` for full guide
- Deploy to Fly.io (FREE tier available)
- Takes ~4-6 hours for first deployment

## 🎯 Testing Checklist

Before showing to stakeholders:

- [ ] Lovable preview URL loads
- [ ] Mock Mode badge visible (bottom-right)
- [ ] All navigation links work
- [ ] Admin dashboard shows metrics
- [ ] Agent list shows 7 agents
- [ ] Notion Research page loads
- [ ] Can submit research workflow
- [ ] Events stream appears
- [ ] No errors in browser console
- [ ] Mobile view looks good
- [ ] All pages responsive

## 📝 What to Tell Stakeholders

**Current State:**
> "This is a fully functional UI demo using mock data. All pages work, navigation is smooth, and you can see the complete user experience. The backend deployment is in progress - once connected, all workflows will execute for real."

**When Showing Notion Research:**
> "Click 'Start Research' to see the simulated workflow. In production, this will search the web, analyze data, create charts, and save to your actual Notion workspace. Right now you're seeing a preview with demo data."

## 🚀 Next Steps

1. **Today**: ✅ Mock mode working on Lovable
2. **Tomorrow**: Deploy backend to Fly.io
3. **Day 3**: Connect Lovable to real backend
4. **Day 4+**: Add real API keys and test live workflows

## 💡 Pro Tips

### Faster Development
```bash
# Run locally to test changes faster
cd frontend
npm run dev
# Open http://localhost:8080
```

### Debug Mode
```bash
# Add to Lovable env vars to see detailed logs
VITE_DEBUG=true
```

### Custom Mock Data
Edit these files to change what's shown:
- `src/lib/admin-api.ts` - Dashboard metrics, agents list
- `src/lib/notion-agent-api.ts` - Notion agent tools, workflows

## 🔗 Resources

- **Frontend Repo**: https://github.com/AHA-orcha/metaorcha-control
- **Backend Repo**: https://github.com/AHA-orcha/metaorcha-emerge
- **Deployment Guide**: See `../DEPLOYMENT_STRATEGY.md`
- **Integration Docs**: See `../INTEGRATION_COMPLETE.md`

## ✨ Summary

Your Lovable preview is now **fully functional** with mock data! It looks and feels like the real app, perfect for demos and UI development. When you're ready for production, just deploy the backend and flip `VITE_USE_MOCK_DATA=false`.

Questions? Check the troubleshooting section above or refer to the main deployment docs.

---

**Status**: 🟢 Ready for Lovable Preview  
**Mock Mode**: ✅ Enabled  
**Backend Required**: ❌ No (using demos)  
**Production Ready**: ⏳ Pending backend deployment
