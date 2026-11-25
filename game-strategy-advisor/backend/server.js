require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const apiRoutes = require('./routes/api');
const uploadRoutes = require('./routes/upload');
const ragEngine = require('./rag/ragEngine');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
}

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' });
});

// Initialize RAG on startup
ragEngine.initialize().then(() => {
  console.log('[RAG] Engine initialized with demo data');
}).catch(err => {
  console.warn('[RAG] Init warning:', err.message);
});

app.listen(PORT, () => {
  console.log(`\n🏆 AI Game Strategy Advisor Backend`);
  console.log(`📡 Running on http://localhost:${PORT}`);
  console.log(`🤖 AI Backend: ${process.env.IBM_API_KEY ? 'IBM Granite (WatsonX)' : 'Rule-Based Fallback'}`);
  console.log(`📊 Demo data: 3 teams, 10+ matches loaded\n`);
});

module.exports = app;
