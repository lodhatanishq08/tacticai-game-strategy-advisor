/**
 * Agent 2: Opponent Strategy Agent
 * Analyzes opponent historical patterns, identifies weaknesses and strengths
 */

const ragEngine = require('../rag/ragEngine');
const { callGranite, fallbackReason } = require('../utils/graniteClient');
const { teams, matches, tacticalPatterns } = require('../data/demoData');

class OpponentStrategyAgent {
  constructor() {
    this.name = 'Opponent Strategy Agent';
    this.role = 'Analyzes opponent tactics, patterns, strengths, and weaknesses';
  }

  async analyze(opponentId, customData = null) {
    const dataTeams = customData?.teams || teams;
    const dataMatches = customData?.matches || matches;
    const dataTactics = customData?.tacticalPatterns || tacticalPatterns;

    const opponent = dataTeams.find(t => t.id === opponentId);
    if (!opponent) throw new Error(`Opponent ${opponentId} not found`);

    const tactics = dataTactics[opponentId];
    
    await ragEngine.initialize(customData);
    const tacticsDoc = await ragEngine.getOpponentTactics(opponentId);
    const opponentMatches = dataMatches.filter(m => m.homeTeam === opponentId || m.awayTeam === opponentId);
    const contextDocs = await ragEngine.retrieveContext(`${opponent.name} formations weaknesses strengths tactics`, {
      topK: 5, filterTeam: opponentId
    });

    const prompt = this._buildPrompt(opponent, tactics, opponentMatches);
    let graniteResult = await callGranite(prompt, 700);

    let analysis;
    if (graniteResult) {
      analysis = { text: graniteResult, confidence: 0.91, dataSource: 'ibm_granite', model: 'granite-13b-instruct-v2' };
    } else {
      analysis = fallbackReason('opponent_strategy', { opponent, tactics, matches: opponentMatches });
    }

    return {
      agent: this.name,
      opponentId,
      opponent,
      analysis,
      tactics,
      formations: this._getFormationAnalysis(opponentId, opponentMatches, tactics),
      attackPatterns: this._getAttackPatterns(opponentId, opponentMatches, tactics),
      defensivePatterns: this._getDefensivePatterns(tactics),
      weaknessMap: this._buildWeaknessMap(tactics),
      strengthMap: this._buildStrengthMap(tactics),
      recentForm: this._getRecentForm(opponentId, opponentMatches),
      vulnerableZones: this._identifyVulnerableZones(tactics),
      pressureAnalysis: this._analyzePressureTendencies(opponentId, opponentMatches, tactics),
      playerThreats: this._identifyPlayerThreats(opponent),
      ragContext: contextDocs,
      timestamp: new Date().toISOString()
    };
  }

  _getFormationAnalysis(teamId, teamMatches, tactics) {
    const formations = {};
    teamMatches.forEach(m => {
      const f = m.homeTeam === teamId ? m.homeFormation : m.awayFormation;
      formations[f] = (formations[f] || 0) + 1;
    });

    const primary = tactics?.preferredFormations?.[0] || Object.entries(formations).sort((a, b) => b[1] - a[1])[0]?.[0];
    return {
      primary: primary || '4-4-2',
      secondary: tactics?.preferredFormations?.[1] || null,
      usageData: formations,
      pattern: tactics?.patterns?.attacking || 'Standard possession-based approach'
    };
  }

  _getAttackPatterns(teamId, teamMatches, tactics) {
    const patterns = [];

    if (tactics?.attackStyle === 'counter_attack') {
      patterns.push({ type: 'counter_attack', severity: 'high', description: 'Primarily counter-attacks with pace behind defensive lines' });
    }
    if (tactics?.attackStyle === 'possession_based') {
      patterns.push({ type: 'possession_build', severity: 'medium', description: 'Patient build-up through midfield, exploits defensive gaps' });
    }
    if (tactics?.weaknesses?.includes('wide_spaces_behind_wing_backs')) {
      patterns.push({ type: 'wing_attack', severity: 'high', description: 'Wing-backs advance aggressively into attacking positions' });
    }

    // Analyze from match data
    const totalGoals = teamMatches.reduce((s, m) => {
      const goals = m.goals || [];
      return s + goals.filter(g => g.team === teamId).length;
    }, 0);
    const counterGoals = teamMatches.reduce((s, m) => {
      const goals = m.goals || [];
      return s + goals.filter(g => g.team === teamId && g.type === 'counter').length;
    }, 0);

    if (totalGoals > 0 && counterGoals / totalGoals > 0.3) {
      patterns.push({ type: 'lethal_on_counter', severity: 'high', description: `${Math.round(counterGoals / totalGoals * 100)}% of goals from counter-attacks` });
    }

    return patterns;
  }

  _getDefensivePatterns(tactics) {
    const style = tactics?.defendingStyle;
    const descriptions = {
      high_press: { style: 'High Press', lineHeight: 'High', compactness: 'Medium', description: 'Aggressive pressing high up the pitch', pressTriggers: tactics?.pressingTriggers || [] },
      mid_block: { style: 'Mid Block', lineHeight: 'Medium', compactness: 'High', description: 'Disciplined medium block, force play wide', pressTriggers: tactics?.pressingTriggers || [] },
      medium_block: { style: 'Medium Block', lineHeight: 'Medium', compactness: 'Medium', description: 'Balanced defensive shape, organized transitions', pressTriggers: tactics?.pressingTriggers || [] },
      low_block: { style: 'Low Block', lineHeight: 'Low', compactness: 'Very High', description: 'Deep defensive shape, absorb pressure', pressTriggers: [] }
    };
    return descriptions[style] || descriptions.medium_block;
  }

  _buildWeaknessMap(tactics) {
    const labels = {
      vulnerable_behind_high_line: { label: 'Space In Behind', severity: 'critical', zone: 'defensive_line', howToExploit: 'Quick through-balls to striker runs' },
      right_flank_less_active: { label: 'Weak Right Flank', severity: 'high', zone: 'right_wing', howToExploit: 'Attack left side with pace' },
      slow_build_from_back: { label: 'Slow Build-Up', severity: 'high', zone: 'goalkeeper_cbs', howToExploit: 'High press on goalkeeper and CBs' },
      vulnerable_to_pressing: { label: 'Poor Under Pressure', severity: 'critical', zone: 'midfield', howToExploit: 'Press aggressively with front 3' },
      right_back_pace_issue: { label: 'Slow Right Back', severity: 'high', zone: 'right_back', howToExploit: 'Attack with fastest winger' },
      limited_width: { label: 'Narrow Attack', severity: 'medium', zone: 'wide_areas', howToExploit: 'Stretch play wide, create central gaps' },
      wide_spaces_behind_wing_backs: { label: 'Exposed Flanks', severity: 'critical', zone: 'wing_backs', howToExploit: 'Early balls behind advancing wing-backs' },
      slow_in_transition: { label: 'Slow Transitions', severity: 'high', zone: 'midfield', howToExploit: 'Immediate counter-attack when ball is won' },
      aerial_vulnerability_in_3CB: { label: 'Aerial Weakness', severity: 'medium', zone: 'central_defense', howToExploit: 'Deliver crosses to target man' },
      right_wing_back_coverage: { label: 'Right WB Coverage Gap', severity: 'medium', zone: 'right_wing_back', howToExploit: 'Overload left side early' }
    };
    return (tactics?.weaknesses || []).map(w => labels[w] || { label: w.replace(/_/g, ' '), severity: 'medium', zone: 'general', howToExploit: 'Exploit through direct play' });
  }

  _buildStrengthMap(tactics) {
    const labels = {
      central_midfield_dominance: { label: 'Central Midfield Control', severity: 'danger', howToCounter: 'Use wide overloads to bypass midfield' },
      wide_attack_variety: { label: 'Wide Attack Variety', severity: 'warning', howToCounter: 'Narrow shape, reduce wing space' },
      set_piece_threat: { label: 'Set Piece Danger', severity: 'danger', howToCounter: 'Zonal defending on corners, man-mark key headers' },
      clinical_striker: { label: 'Clinical Striker', severity: 'danger', howToCounter: 'Deny space, double team striker' },
      physical_midfield: { label: 'Physical Midfield', severity: 'warning', howToCounter: 'Use quick 1-2s to bypass physicality' },
      striker_quality: { label: 'Elite Striker Quality', severity: 'danger', howToCounter: 'Restrict supply to striker, offside trap' },
      set_piece_defending: { label: 'Strong Set Piece Defense', severity: 'info', howToCounter: 'Focus on open play combinations' },
      organized_shape: { label: 'Well-Organized Shape', severity: 'warning', howToCounter: 'Patient possession to disorganize them' },
      aerial_duels: { label: 'Aerial Dominance', severity: 'warning', howToCounter: 'Play low and wide, avoid high balls' },
      wing_back_overlaps: { label: 'Dangerous Overlaps', severity: 'warning', howToCounter: 'Narrow shape, block overlap channels' },
      two_striker_combination: { label: 'Two-Striker Combination', severity: 'danger', howToCounter: 'Two CBs stay tight, midfielder screens' }
    };
    return (tactics?.strengths || []).map(s => labels[s] || { label: s.replace(/_/g, ' '), severity: 'warning', howToCounter: 'Contain with organized defending' });
  }

  _getRecentForm(teamId, teamMatches) {
    return teamMatches.slice(0, 5).map(m => {
      const isHome = m.homeTeam === teamId;
      const myGoals = isHome ? m.homeScore : m.awayScore;
      const theirGoals = isHome ? m.awayScore : m.homeScore;
      return {
        date: m.date,
        result: myGoals > theirGoals ? 'W' : myGoals === theirGoals ? 'D' : 'L',
        score: `${myGoals}-${theirGoals}`,
        possession: isHome ? m.homePossession : m.awayPossession,
        shots: isHome ? m.homeShots : m.awayShots
      };
    });
  }

  _identifyVulnerableZones(tactics) {
    const zones = [];
    if (tactics?.weaknesses?.includes('vulnerable_behind_high_line')) {
      zones.push({ zone: 'Behind Defensive Line', x: 50, y: 15, threat: 'critical', description: 'Space behind high defensive line' });
    }
    if (tactics?.weaknesses?.includes('right_flank_less_active') || tactics?.weaknesses?.includes('right_back_pace_issue')) {
      zones.push({ zone: 'Right Flank', x: 85, y: 40, threat: 'high', description: 'Underperforming right-side coverage' });
    }
    if (tactics?.weaknesses?.includes('wide_spaces_behind_wing_backs')) {
      zones.push({ zone: 'Behind Left Wing-Back', x: 10, y: 25, threat: 'critical', description: 'Space when LWB pushes forward' });
      zones.push({ zone: 'Behind Right Wing-Back', x: 90, y: 25, threat: 'critical', description: 'Space when RWB pushes forward' });
    }
    if (tactics?.weaknesses?.includes('slow_in_transition')) {
      zones.push({ zone: 'Central Midfield (Transition)', x: 50, y: 50, threat: 'high', description: 'Exposed during defensive transitions' });
    }
    return zones;
  }

  _analyzePressureTendencies(teamId, teamMatches, tactics) {
    return {
      style: tactics?.defendingStyle?.replace(/_/g, ' ') || 'medium block',
      triggers: tactics?.pressingTriggers || [],
      averagePressureSuccessRate: 0.62,
      bypassMethod: tactics?.attackStyle === 'counter_attack' ? 'quick vertical passes' : 'possession circulation',
      pressing_intensity: tactics?.defendingStyle === 'high_press' ? 'Very High' : tactics?.defendingStyle === 'mid_block' ? 'Medium' : 'Low-Medium'
    };
  }

  _identifyPlayerThreats(opponent) {
    if (!opponent.players) return [];
    return opponent.players
      .filter(p => p.rating >= 8.0)
      .sort((a, b) => b.rating - a.rating)
      .map(p => ({
        ...p,
        threatLevel: p.rating >= 8.4 ? 'critical' : p.rating >= 8.1 ? 'high' : 'medium',
        tacticToNeutralize: p.position === 'ST' ? 'Double-mark, restrict supply' :
          p.position === 'AM' || p.position === 'CM' ? 'Man-mark in midfield, disrupt passing rhythm' :
          'Tight marking, force toward weak foot'
      }));
  }

  _buildPrompt(opponent, tactics, teamMatches) {
    return `You are a tactical scout. Analyze this opponent and identify key tactical vulnerabilities.

Opponent: ${opponent.name}
Formation: ${tactics?.preferredFormations?.join(' / ')}
Attack Style: ${tactics?.attackStyle}
Defense Style: ${tactics?.defendingStyle}
Identified Weaknesses: ${tactics?.weaknesses?.join(', ')}
Recent Matches: ${teamMatches.length}

Provide: 1) Main tactical weaknesses to exploit 2) Dangerous attacking patterns to neutralize 3) How to set up defensively against them 4) Key players to mark.

Scout Report:`;
  }
}

module.exports = new OpponentStrategyAgent();
