const express = require('express');
const router = express.Router();
const multer = require('multer');
const ragEngine = require('../rag/ragEngine');
const { teams, matches, tacticalPatterns } = require('../data/demoData');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/json', 'text/csv', 'application/csv', 'text/plain'];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.csv') || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and CSV files are supported'));
    }
  }
});

// POST /api/upload - Upload custom match data
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  
  try {
    const content = req.file.buffer.toString('utf-8');
    const isCSV = req.file.originalname.endsWith('.csv') || req.file.mimetype === 'text/csv';
    const isJSON = req.file.originalname.endsWith('.json') || req.file.mimetype === 'application/json';

    let count = 0;
    let format = 'unknown';

    if (isCSV) {
      format = 'csv';
      count = await ragEngine.ingestCustomData(content, 'csv');
    } else if (isJSON) {
      format = 'json';
      const parsed = JSON.parse(content);
      count = await ragEngine.ingestCustomData(parsed, 'json');
    } else {
      // Try JSON first, then CSV
      try {
        const parsed = JSON.parse(content);
        format = 'json';
        count = await ragEngine.ingestCustomData(parsed, 'json');
      } catch {
        format = 'csv';
        count = await ragEngine.ingestCustomData(content, 'csv');
      }
    }

    res.json({
      success: true,
      message: `Successfully ingested ${count} records from ${req.file.originalname}`,
      format,
      recordsAdded: count,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    res.status(400).json({ success: false, error: `Failed to process file: ${err.message}` });
  }
});

// GET /api/upload/template - Download CSV template
router.get('/template', (req, res) => {
  const csvTemplate = `date,homeTeam,awayTeam,homeScore,awayScore,homeFormation,awayFormation,homePossession,awayPossession,homeShots,awayShots,homeShotsOnTarget,awayShotsOnTarget,homePassAccuracy,awayPassAccuracy,competition
2024-11-01,My Team,Opponent A,2,1,4-3-3,4-2-3-1,56,44,13,9,6,4,85,79,League
2024-10-25,Opponent B,My Team,0,2,4-4-2,4-3-3,48,52,10,14,3,7,80,86,League
2024-10-18,My Team,Opponent C,1,1,4-3-3,3-5-2,55,45,12,10,5,4,84,81,Cup`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="match_data_template.csv"');
  res.send(csvTemplate);
});

module.exports = router;
