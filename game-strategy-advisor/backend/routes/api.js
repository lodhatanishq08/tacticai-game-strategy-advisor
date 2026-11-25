const express = require('express');
const router = express.Router();
const orchestrator = require('../agents/orchestrator');
const matchAnalysisAgent = require('../agents/matchAnalysisAgent');
const opponentStrategyAgent = require('../agents/opponentStrategyAgent');
const ragEngine = require('../rag/ragEngine');
const { teams, matches, tacticalPatterns, formations } = require('../data/demoData');

// GET /api/teams - List all teams
router.get('/teams', (req, res) => {
  res.json({ success: true, teams: teams.map(t => ({ id: t.id, name: t.name, shortName: t.shortName, formation: t.formation, color: t.color })) });
});

// GET /api/teams/:id - Get team details
router.get('/teams/:id', (req, res) => {
  const team = teams.find(t => t.id === req.params.id);
  if (!team) return res.status(404).json({ success: false, error: 'Team not found' });
  res.json({ success: true, team });
});

// GET /api/matches - Get all matches
router.get('/matches', (req, res) => {
  const { teamId } = req.query;
  let result = matches;
  if (teamId) {
    result = matches.filter(m => m.homeTeam === teamId || m.awayTeam === teamId);
  }
  res.json({ success: true, matches: result, count: result.length });
});

// GET /api/matches/:id - Get single match
router.get('/matches/:id', (req, res) => {
  const match = matches.find(m => m.id === req.params.id);
  if (!match) return res.status(404).json({ success: false, error: 'Match not found' });

  const homeTeam = teams.find(t => t.id === match.homeTeam);
  const awayTeam = teams.find(t => t.id === match.awayTeam);
  res.json({ success: true, match: { ...match, homeTeamData: homeTeam, awayTeamData: awayTeam } });
});

// POST /api/analyze - Run full pipeline
router.post('/analyze', async (req, res) => {
  const { teamId, opponentId } = req.body;
  if (!teamId || !opponentId) return res.status(400).json({ success: false, error: 'teamId and opponentId required' });
  if (teamId === opponentId) return res.status(400).json({ success: false, error: 'Team and opponent cannot be the same' });

  try {
    const result = await orchestrator.runFullPipeline(teamId, opponentId);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Analyze]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/analyze/team - Analyze a single team
router.post('/analyze/team', async (req, res) => {
  const { teamId } = req.body;
  if (!teamId) return res.status(400).json({ success: false, error: 'teamId required' });
  try {
    const result = await matchAnalysisAgent.analyze(teamId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/analyze/opponent - Analyze opponent
router.post('/analyze/opponent', async (req, res) => {
  const { opponentId } = req.body;
  if (!opponentId) return res.status(400).json({ success: false, error: 'opponentId required' });
  try {
    const result = await opponentStrategyAgent.analyze(opponentId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/live - Live match advice
router.post('/live', async (req, res) => {
  const { score, minute, teamFormation, opponentFormation, possession, fatigue, cards, notes } = req.body;
  if (!score || !minute) return res.status(400).json({ success: false, error: 'score and minute required' });
  
  try {
    const result = await orchestrator.runLiveMatchAnalysis({ score, minute: parseInt(minute), teamFormation, opponentFormation, possession, fatigue, cards, notes });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/chat - AI tactical assistant
router.post('/chat', async (req, res) => {
  const { question, teamId, opponentId } = req.body;
  if (!question) return res.status(400).json({ success: false, error: 'question required' });
  
  try {
    const result = await orchestrator.runChatQuery(question, teamId, opponentId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/formations - Get formation diagrams
router.get('/formations', (req, res) => {
  const { name } = req.query;
  if (name) {
    const formation = formations[name];
    if (!formation) return res.status(404).json({ success: false, error: 'Formation not found' });
    return res.json({ success: true, formation });
  }
  res.json({ success: true, formations });
});

// GET /api/status - System status
router.get('/status', (req, res) => {
  const { isGraniteAvailable } = require('../utils/graniteClient');
  res.json({
    success: true,
    status: 'online',
    aiBackend: isGraniteAvailable() ? 'IBM Granite (WatsonX)' : 'Rule-Based Engine (Fallback)',
    graniteConnected: isGraniteAvailable(),
    ragStatus: 'ready',
    agentPipeline: ['Match Analysis Agent', 'Opponent Strategy Agent', 'Strategy Recommendation Agent', 'Insight Explanation Agent'],
    dataMode: 'demo',
    teamsLoaded: teams.length,
    matchesLoaded: matches.length,
    version: '1.0.0'
  });
});

module.exports = router;
