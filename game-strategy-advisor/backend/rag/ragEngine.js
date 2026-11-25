/**
 * RAG Engine - Retrieval Augmented Generation
 * Local implementation using TF-IDF and keyword matching
 * Production: replace retrieveContext() with vector DB calls (Chroma, Pinecone, IBM Watson Discovery)
 */

const { matches, tacticalPatterns, teams } = require('../data/demoData');

class RAGEngine {
  constructor() {
    this.documents = [];
    this.index = new Map();
    this.initialized = false;
  }

  async initialize(customData = null) {
    this.documents = [];
    
    // Index all matches as documents
    const matchDocs = (customData?.matches || matches).map(m => {
      const homeTeam = (customData?.teams || teams).find(t => t.id === m.homeTeam);
      const awayTeam = (customData?.teams || teams).find(t => t.id === m.awayTeam);
      const homeName = homeTeam?.name || m.homeTeam;
      const awayName = awayTeam?.name || m.awayTeam;

      return {
        id: m.id,
        type: 'match_result',
        source: 'demo_data',
        content: `Match: ${homeName} vs ${awayName} on ${m.date}. Score: ${m.homeScore}-${m.awayScore}. ` +
          `Formation: ${m.homeFormation} vs ${m.awayFormation}. ` +
          `Possession: ${m.homePossession}% vs ${m.awayPossession}%. ` +
          `Shots: ${m.homeShots} vs ${m.awayShots}. ` +
          `xG: ${m.xG?.home || 'N/A'} vs ${m.xG?.away || 'N/A'}. ` +
          `Key moments: ${(m.keyMoments || []).join('. ')}. ` +
          `Goals: ${(m.goals || []).map(g => `${g.minute}' ${g.scorer} (${g.type})`).join(', ')}.`,
        metadata: { homeTeam: m.homeTeam, awayTeam: m.awayTeam, date: m.date, result: `${m.homeScore}-${m.awayScore}` },
        match: m
      };
    });

    // Index tactical pattern documents
    const tacticalDocs = Object.entries(customData?.tacticalPatterns || tacticalPatterns).map(([teamId, patterns]) => {
      const team = (customData?.teams || teams).find(t => t.id === teamId);
      return {
        id: `tactics_${teamId}`,
        type: 'tactical_analysis',
        source: 'demo_data',
        content: `Team: ${team?.name || teamId}. ` +
          `Preferred formations: ${patterns.preferredFormations.join(', ')}. ` +
          `Attack style: ${patterns.attackStyle}. Defending style: ${patterns.defendingStyle}. ` +
          `Weaknesses: ${patterns.weaknesses.join(', ')}. ` +
          `Strengths: ${patterns.strengths.join(', ')}. ` +
          `Attacking pattern: ${patterns.patterns?.attacking}. ` +
          `Defending pattern: ${patterns.patterns?.defending}. ` +
          `Transition pattern: ${patterns.patterns?.transitions}.`,
        metadata: { teamId, teamName: team?.name || teamId },
        tactics: patterns
      };
    });

    // Index player data
    const playerDocs = (customData?.teams || teams).flatMap(team =>
      (team.players || []).map(player => ({
        id: `player_${player.id}`,
        type: 'player_stats',
        source: 'demo_data',
        content: `Player: ${player.name}. Team: ${team.name}. Position: ${player.position}. ` +
          `Rating: ${player.rating}. Goals: ${player.goals}. Assists: ${player.assists}. ` +
          `Age: ${player.age}. Nationality: ${player.nationality}.`,
        metadata: { teamId: team.id, playerId: player.id, position: player.position },
        player
      }))
    );

    this.documents = [...matchDocs, ...tacticalDocs, ...playerDocs];
    this._buildIndex();
    this.initialized = true;
    return true;
  }

  _buildIndex() {
    this.index.clear();
    this.documents.forEach((doc, idx) => {
      const tokens = this._tokenize(doc.content);
      tokens.forEach(token => {
        if (!this.index.has(token)) this.index.set(token, []);
        this.index.get(token).push(idx);
      });
    });
  }

  _tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2)
      .filter(t => !['the', 'and', 'for', 'with', 'this', 'that', 'are', 'was', 'has', 'have'].includes(t));
  }

  _tfidf(query, doc) {
    const queryTokens = this._tokenize(query);
    const docTokens = this._tokenize(doc.content);
    const docLength = docTokens.length;
    
    let score = 0;
    queryTokens.forEach(qt => {
      const tf = docTokens.filter(dt => dt === qt).length / docLength;
      const docCount = this.index.get(qt)?.length || 1;
      const idf = Math.log(this.documents.length / docCount);
      score += tf * idf;
    });
    return score;
  }

  async retrieveContext(query, options = {}) {
    if (!this.initialized) await this.initialize();
    
    const { topK = 5, filterTeam = null, filterType = null } = options;
    
    let candidates = this.documents;
    if (filterTeam) {
      candidates = candidates.filter(d => 
        d.metadata?.teamId === filterTeam || 
        d.metadata?.homeTeam === filterTeam || 
        d.metadata?.awayTeam === filterTeam
      );
    }
    if (filterType) {
      candidates = candidates.filter(d => d.type === filterType);
    }

    const scored = candidates.map(doc => ({
      doc,
      score: this._tfidf(query, doc)
    })).sort((a, b) => b.score - a.score);

    return scored.slice(0, topK).map(s => ({
      ...s.doc,
      relevanceScore: parseFloat(s.score.toFixed(4))
    }));
  }

  async getTeamHistory(teamId, limit = 5) {
    if (!this.initialized) await this.initialize();
    return this.documents
      .filter(d => d.type === 'match_result' && 
        (d.metadata?.homeTeam === teamId || d.metadata?.awayTeam === teamId))
      .slice(0, limit);
  }

  async getOpponentTactics(teamId) {
    if (!this.initialized) await this.initialize();
    return this.documents.find(d => d.type === 'tactical_analysis' && d.metadata?.teamId === teamId);
  }

  async ingestCustomData(rawData, format = 'json') {
    let parsed;
    if (format === 'json') {
      parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    } else if (format === 'csv') {
      parsed = this._parseCSV(rawData);
    }
    
    const newDocs = parsed.map((row, idx) => ({
      id: `custom_${idx}`,
      type: 'custom_match',
      source: 'user_upload',
      content: Object.entries(row).map(([k, v]) => `${k}: ${v}`).join('. '),
      metadata: { source: 'user_upload', ...row }
    }));

    this.documents.push(...newDocs);
    this._buildIndex();
    return newDocs.length;
  }

  _parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] }), {});
    });
  }
}

module.exports = new RAGEngine();
