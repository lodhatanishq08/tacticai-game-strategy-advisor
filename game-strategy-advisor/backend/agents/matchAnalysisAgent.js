/**
 * Agent 1: Match Analysis Agent
 * Analyzes historical match data, identifies trends, compares formations
 */

const ragEngine = require('../rag/ragEngine');
const { callGranite, fallbackReason } = require('../utils/graniteClient');
const { teams, matches, tacticalPatterns } = require('../data/demoData');

class MatchAnalysisAgent {
  constructor() {
    this.name = 'Match Analysis Agent';
    this.role = 'Analyzes historical match data and team performance trends';
  }

  async analyze(teamId, customData = null) {
    const dataTeams = customData?.teams || teams;
    const dataMatches = customData?.matches || matches;

    const team = dataTeams.find(t => t.id === teamId);
    if (!team) throw new Error(`Team ${teamId} not found`);

    // Get relevant matches via RAG
    await ragEngine.initialize(customData);
    const relevantDocs = await ragEngine.getTeamHistory(teamId, 10);
    const teamMatches = dataMatches.filter(m => m.homeTeam === teamId || m.awayTeam === teamId);

    // Compute stats
    const stats = this._computeStats(team, teamMatches);

    // Try Granite first, fall back to rule-based
    const prompt = this._buildPrompt(team, teamMatches, stats);
    let graniteResult = await callGranite(prompt, 600);
    
    let analysis;
    if (graniteResult) {
      analysis = { text: graniteResult, confidence: 0.92, dataSource: 'ibm_granite', model: 'granite-13b-instruct-v2' };
    } else {
      analysis = fallbackReason('match_analysis', { team, matches: teamMatches, teamStats: stats });
      analysis.dataSource = 'rule_based_fallback';
    }

    return {
      agent: this.name,
      teamId,
      team,
      analysis,
      stats,
      formationHistory: this._getFormationHistory(teamId, teamMatches),
      performanceTrend: this._getPerformanceTrend(teamId, teamMatches),
      playerInsights: this._getPlayerInsights(team),
      ragDocuments: relevantDocs.length,
      timestamp: new Date().toISOString()
    };
  }

  _computeStats(team, teamMatches) {
    if (!teamMatches.length) return team.stats;

    let goals = 0, conceded = 0, totalPossession = 0, totalShots = 0, wins = 0, draws = 0, losses = 0;
    
    teamMatches.forEach(m => {
      const isHome = m.homeTeam === team.id;
      const myGoals = isHome ? m.homeScore : m.awayScore;
      const theirGoals = isHome ? m.awayScore : m.homeScore;
      const myPossession = isHome ? m.homePossession : m.awayPossession;
      const myShots = isHome ? m.homeShots : m.awayShots;

      goals += myGoals;
      conceded += theirGoals;
      totalPossession += myPossession;
      totalShots += myShots;

      if (myGoals > theirGoals) wins++;
      else if (myGoals === theirGoals) draws++;
      else losses++;
    });

    const n = teamMatches.length;
    return {
      ...team.stats,
      computedWins: wins,
      computedDraws: draws,
      computedLosses: losses,
      computedGoalsScored: goals,
      computedGoalsConceded: conceded,
      avgPossession: parseFloat((totalPossession / n).toFixed(1)),
      avgShots: parseFloat((totalShots / n).toFixed(1)),
      matchesAnalyzed: n
    };
  }

  _getFormationHistory(teamId, teamMatches) {
    const counts = {};
    teamMatches.forEach(m => {
      const f = m.homeTeam === teamId ? m.homeFormation : m.awayFormation;
      counts[f] = (counts[f] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([formation, count]) => ({ formation, count, percentage: Math.round((count / teamMatches.length) * 100) }))
      .sort((a, b) => b.count - a.count);
  }

  _getPerformanceTrend(teamId, teamMatches) {
    return teamMatches.slice(0, 8).reverse().map(m => {
      const isHome = m.homeTeam === teamId;
      const myGoals = isHome ? m.homeScore : m.awayScore;
      const theirGoals = isHome ? m.awayScore : m.homeScore;
      const result = myGoals > theirGoals ? 'W' : myGoals === theirGoals ? 'D' : 'L';
      return {
        date: m.date,
        result,
        goalsFor: myGoals,
        goalsAgainst: theirGoals,
        possession: isHome ? m.homePossession : m.awayPossession,
        shots: isHome ? m.homeShots : m.awayShots,
        opponent: isHome ? m.awayTeam : m.homeTeam,
        xG: isHome ? m.xG?.home : m.xG?.away
      };
    });
  }

  _getPlayerInsights(team) {
    if (!team.players) return [];
    return team.players
      .sort((a, b) => b.rating - a.rating)
      .map(p => ({
        ...p,
        performance: p.rating >= 8.3 ? 'excellent' : p.rating >= 7.8 ? 'good' : p.rating >= 7.2 ? 'average' : 'below_average',
        isKeyPlayer: p.rating >= 8.3,
        contribution: p.goals + p.assists * 0.7
      }));
  }

  _buildPrompt(team, teamMatches, stats) {
    return `You are a professional football analyst. Analyze the following team data and provide tactical insights.

Team: ${team.name}
Formation: ${team.formation}
Record: ${stats.computedWins}W/${stats.computedDraws}D/${stats.computedLosses}L
Avg Possession: ${stats.avgPossession}%
Avg Shots: ${stats.avgShots} per game
Recent matches: ${teamMatches.length}

Provide: 1) Key performance insights 2) Formation effectiveness 3) Attacking patterns 4) Defensive observations 5) Recommended tactical adjustments.

Analysis:`;
  }
}

module.exports = new MatchAnalysisAgent();
