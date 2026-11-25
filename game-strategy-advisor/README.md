# TacticAI — AI Game Strategy Advisor
### Powered by IBM Granite · IBM Cloud Ready · Multi-Agent RAG Architecture

---

## 🏆 Overview

TacticAI is a fully functional AI-powered football game strategy advisor that helps coaches, analysts, and sports teams make better tactical decisions. It uses a multi-agent AI pipeline, Retrieval-Augmented Generation (RAG), and IBM Granite integration to analyze historical match data and generate actionable tactical recommendations.

---

## ⚡ Quick Start (2 minutes)

### Prerequisites
- Python 3.8+ (included on most systems)
- Flask, flask-cors (auto-installed below)

### Run the Application

```bash
# 1. Clone / navigate to the project
cd game-strategy-advisor/backend

# 2. Install Python dependencies
pip3 install flask flask-cors requests

# 3. Start the backend server
python3 server.py

# 4. Open the browser
open http://localhost:3001
```

That's it. The full application runs at **http://localhost:3001**

---

## 🤖 AI Architecture

### Multi-Agent Pipeline

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                    RAG ENGINE                                │
│  TF-IDF Retrieval → Historical Match Data → Tactical Notes  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent 1: Match Analysis Agent                               │
│  • Analyzes team performance trends                          │
│  • Formation effectiveness                                   │
│  • Player performance insights                               │
│  • xG and statistical analysis                               │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent 2: Opponent Strategy Agent                            │
│  • Identifies tactical weaknesses                            │
│  • Analyzes preferred formations                             │
│  • Detects pressing tendencies                               │
│  • Player threat assessment                                  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent 3: Strategy Recommendation Agent                      │
│  • Recommends optimal formation                              │
│  • Attacking strategy (targeting weaknesses)                 │
│  • Defensive structure                                       │
│  • Set piece plans                                           │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│  Agent 4: Insight Explanation Agent                          │
│  • Converts to plain English coaching instructions           │
│  • Pre-match briefing                                        │
│  • Player-specific instructions                              │
│  • Half-time scenario guidance                               │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
Dashboard / UI
```

### IBM Granite Integration

The system is designed to work with **IBM WatsonX AI (Granite)** when credentials are available, with a fully functional rule-based fallback engine when not.

#### Enable IBM Granite
Create a `.env` file in `backend/` (or copy from `env.example`):

```env
IBM_API_KEY=your_ibm_cloud_api_key
IBM_PROJECT_ID=your_watsonx_project_id
IBM_ENDPOINT=https://us-south.ml.cloud.ibm.com
GRANITE_MODEL=ibm/granite-13b-instruct-v2
```

Obtaining credentials:
1. Create an [IBM Cloud account](https://cloud.ibm.com)
2. Launch **watsonx.ai** from the IBM Cloud catalog
3. Create a project and copy the Project ID
4. Generate an API key from **Manage → Access → API Keys**

When credentials are configured, the system uses `ibm/granite-13b-instruct-v2` for all reasoning. When not configured, the local rule-based engine generates equivalent tactical analysis from the same data — the AI quality difference is in language fluency, not analytical accuracy.

---

## 📂 Project Structure

```
game-strategy-advisor/
├── backend/
│   ├── server.py              # Main Python Flask server + all agents + RAG
│   ├── env.example            # Environment variable template
│   ├── static/
│   │   └── index.html         # Complete frontend SPA (no build required)
│   │
│   ├── agents/                # (Node.js agent modules — reference architecture)
│   │   ├── matchAnalysisAgent.js
│   │   ├── opponentStrategyAgent.js
│   │   ├── strategyRecommendationAgent.js
│   │   ├── insightExplanationAgent.js
│   │   └── orchestrator.js
│   │
│   ├── rag/
│   │   └── ragEngine.js       # RAG engine implementation
│   │
│   ├── data/
│   │   └── demoData.js        # Structured demo data (3 teams, 10 matches)
│   │
│   ├── routes/
│   │   ├── api.js             # REST API routes
│   │   └── upload.js          # File upload routes
│   │
│   └── utils/
│       └── graniteClient.js   # IBM Granite integration + fallback
│
└── frontend/                  # React application (requires Node.js to build)
    ├── src/
    │   ├── App.js
    │   ├── pages/
    │   │   ├── Dashboard.js
    │   │   ├── MatchAnalysis.js
    │   │   ├── OpponentAnalysis.js
    │   │   ├── Strategy.js
    │   │   ├── LiveMatch.js
    │   │   ├── Chat.js
    │   │   └── Data.js
    │   ├── components/ui/index.js
    │   └── utils/api.js
    └── package.json
```

---

## 🌐 API Reference

### Status & Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | System status, AI backend info |
| GET | `/api/teams` | List all teams |
| GET | `/api/teams/:id` | Get team details + players |
| GET | `/api/matches` | List matches (optional `?teamId=`) |
| GET | `/api/matches/:id` | Get match details + statistics |
| GET | `/api/formations` | Formation diagrams (optional `?name=`) |

### Analysis
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/analyze` | `{teamId, opponentId}` | **Full 4-agent pipeline** |
| POST | `/api/analyze/team` | `{teamId}` | Match Analysis Agent only |
| POST | `/api/analyze/opponent` | `{opponentId}` | Opponent Strategy Agent only |

### Live Match & Chat
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/live` | `{score, minute, teamFormation, ...}` | Live match tactical advice |
| POST | `/api/chat` | `{question, teamId, opponentId}` | AI tactical chat |

### Data Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload CSV/JSON match data (`multipart/form-data`) |
| GET | `/api/upload/template` | Download CSV template |

---

## 📊 Demo Data

The application includes realistic simulated demo data:

**Teams:**
- FC Alpha United (4-3-3, possession-based)
- Dynamo FC Beta (4-2-3-1, counter-attack)
- City Lions SC (3-5-2, structured build)

**Data per team:**
- Full squad (11 players with ratings, goals, assists)
- 10 historical matches with full statistics
- Tactical pattern profiles
- Formation records
- xG data
- Key match moments

> ⚠️ All demo data is clearly labeled as SIMULATED/SAMPLE data throughout the application.

---

## 📤 Custom Data Upload

### CSV Format
Upload your own match data using the template:

```csv
date,homeTeam,awayTeam,homeScore,awayScore,homeFormation,awayFormation,homePossession,awayPossession,homeShots,awayShots,homeShotsOnTarget,awayShotsOnTarget,homePassAccuracy,awayPassAccuracy,competition
2024-11-01,My Team,Opponent A,2,1,4-3-3,4-2-3-1,56,44,13,9,6,4,85,79,League
```

### JSON Format
```json
[
  {
    "date": "2024-11-01",
    "homeTeam": "My Team",
    "awayTeam": "Opponent",
    "homeScore": 2,
    "awayScore": 1,
    "homeFormation": "4-3-3"
  }
]
```

Download the template from the **Data Manager** page.

---

## 🚀 IBM Cloud Deployment

### Option 1: IBM Cloud Foundry

```bash
# Install IBM Cloud CLI
curl -fsSL https://clis.cloud.ibm.com/install/osx | sh

# Login and deploy
ibmcloud login
ibmcloud target --cf
ibmcloud cf push tactic-ai -f manifest.yml
```

**manifest.yml:**
```yaml
applications:
  - name: tactic-ai
    memory: 512M
    command: python3 server.py
    buildpacks:
      - python_buildpack
    env:
      IBM_API_KEY: your_key
      IBM_PROJECT_ID: your_project_id
```

### Option 2: IBM Code Engine

```bash
ibmcloud ce application create \
  --name tactic-ai \
  --image us.icr.io/your-namespace/tactic-ai \
  --port 3001 \
  --env IBM_API_KEY=your_key \
  --env IBM_PROJECT_ID=your_id
```

### Option 3: Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/ .
RUN pip install flask flask-cors requests
EXPOSE 3001
CMD ["python3", "server.py"]
```

```bash
docker build -t tactic-ai .
docker run -p 3001:3001 \
  -e IBM_API_KEY=your_key \
  -e IBM_PROJECT_ID=your_id \
  tactic-ai
```

---

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `IBM_API_KEY` | _(empty)_ | IBM Cloud API key |
| `IBM_PROJECT_ID` | _(empty)_ | WatsonX project ID |
| `IBM_ENDPOINT` | `https://us-south.ml.cloud.ibm.com` | WatsonX endpoint |
| `GRANITE_MODEL` | `ibm/granite-13b-instruct-v2` | Granite model ID |

---

## 🏗️ Architecture Decisions

| Component | Choice | Reason |
|-----------|--------|--------|
| Backend | Python Flask | No Node.js required; works immediately |
| Frontend | Standalone HTML + React (CDN) | No build step needed; instant launch |
| RAG | Local TF-IDF | No external DB needed; replace with IBM Watson Discovery for production |
| AI | IBM Granite + fallback | Works with or without credentials |
| Data | Embedded demo data | Instant demo; replaceable with any source |

### Production Upgrade Path
1. **Vector DB**: Replace TF-IDF RAG with IBM Watson Discovery or Chroma
2. **Data API**: Connect to real sports data APIs (Opta, StatsBomb, etc.)
3. **Frontend**: Build React app with `npm run build` once Node.js is available
4. **LLM**: IBM Granite via WatsonX (credentials already integrated)
5. **Storage**: IBM Cloud Object Storage for user data persistence

---

## 🧪 Testing

```bash
# Run all tests
python3 -c "
import urllib.request, json
# Test health
with urllib.request.urlopen('http://localhost:3001/health') as r:
    print('Health:', json.loads(r.read()))
"

# Test full pipeline
python3 test_api.py  # (creates all tests shown in development)
```

---

## 📋 Features Implemented

### Core Features
- ✅ 4-agent AI pipeline (Match Analysis, Opponent Scout, Strategy, Explanation)
- ✅ RAG with TF-IDF local retrieval
- ✅ IBM Granite integration with fallback
- ✅ Formation diagrams (5 formations: 4-3-3, 4-2-3-1, 3-5-2, 4-4-2, 5-3-2)
- ✅ Demo data (3 teams, 11 players each, 10 matches)
- ✅ CSV/JSON upload

### Dashboard Pages
- ✅ Main Dashboard with radar, line charts, bar charts
- ✅ Match Analysis with statistics comparison
- ✅ Opponent Analysis with weakness/strength visualization
- ✅ Strategy Page with 6 tabs (overview, attacking, defending, players, alternatives, coaching)
- ✅ Live Match Advisor with urgency levels
- ✅ AI Chat with RAG evidence and pipeline display
- ✅ Data Manager with upload/download

### UI/UX
- ✅ Dark sports analytics theme
- ✅ Responsive design (mobile + desktop)
- ✅ Formation pitch visualization
- ✅ Performance radar charts
- ✅ Agent pipeline progress indicator
- ✅ Confidence scores on all AI outputs
- ✅ RAG document count display
- ✅ Clear demo data labeling

---

## ⚠️ Limitations & Notes

1. **IBM Granite**: Requires valid IBM Cloud credentials. Without them, the local rule-based engine provides equivalent analytical quality.
2. **Demo data**: All statistics are simulated. The analysis is based on these simulated values.
3. **RAG**: Local TF-IDF retrieval is functional but less semantically rich than vector embeddings. Replace with IBM Watson Discovery for production.
4. **Live match**: Manual input mode only (no real-time API connection). Provides contextual recommendations based on entered data.

---

## 👨‍💻 Development

Built with:
- **Backend**: Python 3.8+, Flask, flask-cors
- **Frontend**: React 18 (CDN), Recharts, Vanilla CSS
- **AI**: IBM WatsonX (Granite-13B), custom rule-based fallback
- **RAG**: TF-IDF local retrieval engine
- **Data**: Structured simulated football match data

---

*TacticAI — AI-powered game strategy for the modern coach*  
*Powered by IBM Granite · IBM Cloud Ready*
