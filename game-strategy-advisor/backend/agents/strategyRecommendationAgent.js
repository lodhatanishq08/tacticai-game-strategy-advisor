/**
 * Agent 3: Strategy Recommendation Agent
 * Combines match analysis and opponent analysis to build an optimal game plan
 */

const ragEngine = require('../rag/ragEngine');
const { callGranite, fallbackReason } = require('../utils/graniteClient');
const { teams, matches, tacticalPatterns, formations } = require('../data/demoData');

class StrategyRecommendationAgent {
  constructor() {
    this.name = 'Strategy Recommendation Agent';
    this.role = 'Generates optimized game plans combining all available intelligence';
  }

  async recommend(teamId, opponentId, matchAnalysis, opponentAnalysis, customData = null) {
    const dataTeams = customData?.teams || teams;
    const dataTactics = customData?.tacticalPatterns || tacticalPatterns;
    const dataFormations = customData?.formations || formations;

    const team = dataTeams.find(t => t.id === teamId);
    const opponent = dataTeams.find(t => t.id === opponentId);
    const teamTactics = dataTactics[teamId];
    const opponentTactics = dataTactics[opponentId];

    if (!team || !opponent) throw new Error('Team or opponent not found');

    // Retrieve supporting evidence via RAG
    await ragEngine.initialize(customData);
    const evidence = await ragEngine.retrieveContext(
      `${team.name} vs ${opponent.name} formation tactics strategy`,
      { topK: 5 }
    );

    const prompt = this._buildPrompt(team, opponent, teamTactics, opponentTactics, matchAnalysis, opponentAnalysis);
    let graniteResult = await callGranite(prompt, 900);

    let baseRecommendation;
    if (graniteResult) {
      baseRecommendation = { text: graniteResult, confidence: 0.93, dataSource: 'ibm_granite' };
    } else {
      baseRecommendation = fallbackReason('strategy_recommendation', {
        team, opponent, teamTactics, opponentTactics
      });
    }

    const recommendation = this._buildStructuredRecommendation(team, opponent, teamTactics, opponentTactics, baseRecommendation, dataFormations);

    return {
      agent: this.name,
      teamId,
      opponentId,
      recommendation,
      alternativePlans: this._generateAlternativePlans(team, opponent, teamTactics, opponentTactics, dataFormations),
      inGameAdjustments: this._generateInGameAdjustments(team, opponent, teamTactics, opponentTactics),
      keyPrinciples: this._getKeyPrinciples(teamTactics, opponentTactics),
      supportingEvidence: evidence,
      confidence: baseRecommendation.confidence,
      timestamp: new Date().toISOString()
    };
  }

  _buildStructuredRecommendation(team, opponent, teamTactics, opponentTactics, baseRec, dataFormations) {
    const formation = baseRec.recommendedFormation || this._selectFormation(teamTactics, opponentTactics);
    const altFormation = baseRec.alternativeFormation || this._selectAltFormation(formation, teamTactics);

    return {
      formation,
      formationData: dataFormations[formation],
      alternativeFormation: altFormation,
      alternativeFormationData: dataFormations[altFormation],
      attacking: this._buildAttackPlan(team, opponent, teamTactics, opponentTactics),
      defending: this._buildDefensePlan(team, opponent, teamTactics, opponentTactics),
      pressing: this._buildPressingPlan(teamTactics, opponentTactics),
      transitions: this._buildTransitionPlan(teamTactics, opponentTactics),
      setpieces: this._buildSetPiecePlan(team, opponentTactics),
      playerInstructions: this._getPlayerInstructions(team, formation, opponentTactics),
      summary: baseRec.text,
      reasoning: baseRec.reasoning || [],
      confidence: baseRec.confidence
    };
  }

  _selectFormation(teamTactics, opponentTactics) {
    // Rule-based formation selection considering team and opponent
    if (!opponentTactics) return teamTactics?.preferredFormations?.[0] || '4-3-3';
    
    if (opponentTactics.attackStyle === 'counter_attack' && opponentTactics.defendingStyle === 'mid_block') {
      return '4-2-3-1'; // Double pivot for security against counters
    }
    if (opponentTactics.preferredFormations?.includes('3-5-2')) {
      return '4-3-3'; // Wide advantage against 3-5-2
    }
    if (opponentTactics.weaknesses?.includes('wide_spaces_behind_wing_backs')) {
      return '4-3-3'; // Wings exploit behind advancing wing-backs
    }
    if (opponentTactics.strengths?.includes('physical_midfield')) {
      return '4-2-3-1'; // Avoid midfield battle, play around them
    }
    return teamTactics?.preferredFormations?.[0] || '4-3-3';
  }

  _selectAltFormation(primaryFormation, teamTactics) {
    const alternatives = { '4-3-3': '4-2-3-1', '4-2-3-1': '4-3-3', '3-5-2': '4-3-3', '4-4-2': '4-2-3-1', '5-3-2': '3-5-2' };
    return alternatives[primaryFormation] || teamTactics?.preferredFormations?.[1] || '4-2-3-1';
  }

  _buildAttackPlan(team, opponent, teamTactics, opponentTactics) {
    const weaknesses = opponentTactics?.weaknesses || [];
    const plan = {
      style: teamTactics?.attackStyle?.replace(/_/g, ' ') || 'possession-based',
      buildUp: 'short_passing',
      priorities: [],
      keyInstructions: []
    };

    if (weaknesses.includes('vulnerable_behind_high_line')) {
      plan.priorities.push({ priority: 1, instruction: 'Target space behind defensive line', detail: 'Use striker runs and through-balls; timing is crucial on offside trap' });
    }
    if (weaknesses.includes('slow_build_from_back') || weaknesses.includes('vulnerable_to_pressing')) {
      plan.priorities.push({ priority: 2, instruction: 'Press immediately on opponent build-up', detail: 'Front 3 press with triggers on goalkeeper, back pass, or poor touch' });
      plan.buildUp = 'high_press_on_ball_loss';
    }
    if (weaknesses.includes('right_flank_less_active') || weaknesses.includes('right_back_pace_issue')) {
      plan.priorities.push({ priority: 1, instruction: 'Overload left side of opponent attack', detail: 'Your left winger and left back create 2v1 against their right back consistently' });
    }
    if (weaknesses.includes('wide_spaces_behind_wing_backs')) {
      plan.priorities.push({ priority: 1, instruction: 'Exploit spaces behind advancing wing-backs', detail: 'Early balls in behind when their wing-backs advance — time the run precisely' });
    }
    if (weaknesses.includes('limited_width')) {
      plan.priorities.push({ priority: 2, instruction: 'Stretch opponent with early width', detail: 'Get the ball to wide players early to force their central block to expand' });
    }

    plan.keyInstructions = plan.priorities.map(p => p.instruction);
    return plan;
  }

  _buildDefensePlan(team, opponent, teamTactics, opponentTactics) {
    const strengths = opponentTactics?.strengths || [];
    const attackStyle = opponentTactics?.attackStyle;

    const plan = {
      structure: 'compact_block',
      lineHeight: 'medium',
      pressingIntensity: 'medium',
      priorities: [],
      keyInstructions: []
    };

    if (attackStyle === 'counter_attack') {
      plan.lineHeight = 'medium_low';
      plan.priorities.push({ priority: 1, instruction: 'Restrict counter-attack space', detail: 'No more than one forward attack at a time; always leave DM to protect back line' });
      plan.priorities.push({ priority: 1, instruction: 'Tracking runs of their striker', detail: 'CB must track striker runs and not ball-watch during transitions' });
    }
    if (strengths.includes('set_piece_threat')) {
      plan.priorities.push({ priority: 1, instruction: 'Zonal set piece defense', detail: 'Mark zones not players on corners; attack the ball early' });
    }
    if (strengths.includes('clinical_striker') || strengths.includes('striker_quality')) {
      plan.priorities.push({ priority: 1, instruction: 'Isolate their striker', detail: 'Restrict supply lines to striker; CB partner takes offensive duel, other CB covers' });
    }
    if (strengths.includes('wide_attack_variety') || strengths.includes('wing_back_overlaps')) {
      plan.priorities.push({ priority: 2, instruction: 'Narrow defensive shape, force inside', detail: 'Compress wide channels, funnel them centrally where you have numerical advantage' });
    }

    plan.keyInstructions = plan.priorities.map(p => p.instruction);
    return plan;
  }

  _buildPressingPlan(teamTactics, opponentTactics) {
    const myStyle = teamTactics?.attackStyle;
    const theirStyle = opponentTactics?.defendingStyle;

    return {
      trigger: opponentTactics?.pressingTriggers?.slice(0, 3) || ['back_pass', 'goalkeeper_ball', 'poor_touch'],
      intensity: myStyle === 'possession_based' ? 'high' : 'medium',
      shape: '4-3-3_press',
      description: `Press in a ${opponentTactics?.weaknesses?.includes('slow_build_from_back') ? 'high' : 'mid'} block. ` +
        `Trigger press on ${(opponentTactics?.pressingTriggers || ['back pass']).join(', ')}.`
    };
  }

  _buildTransitionPlan(teamTactics, opponentTactics) {
    return {
      attacking: 'Win ball → immediate vertical pass → 3-second sprint transition',
      defending: 'Lose ball → immediate press → recover compact shape within 6 seconds',
      focus: opponentTactics?.attackStyle === 'counter_attack' ? 
        'Block counter immediately on turnover — do NOT commit all players forward' :
        'Quick transitions with pace to exploit disorganized defense'
    };
  }

  _buildSetPiecePlan(team, opponentTactics) {
    return {
      attacking: {
        corners: 'Near post flick-on with second-wave runner; use decoy runs to clear space',
        freekicks: 'Near post wall jump and second man runner on far post',
        keyTaker: team.players?.filter(p => p.assists > 7)?.[0]?.name || 'Set piece specialist'
      },
      defending: {
        corners: opponentTactics?.strengths?.includes('set_piece_threat') ? 'Full zonal — assign zones 1-6' : 'Mixed: zonal blocks, man-mark key headers',
        freekicks: '5-man wall, goalkeeper commands area'
      }
    };
  }

  _getPlayerInstructions(team, formation, opponentTactics) {
    if (!team.players) return [];
    const instructions = [];
    team.players.forEach(p => {
      let instruction = '';
      if (p.position === 'ST') {
        instruction = opponentTactics?.weaknesses?.includes('vulnerable_behind_high_line')
          ? 'Time runs in behind the last defender — stay onside and time your movement'
          : 'Hold up play, link with midfield, create space for runners';
      } else if (p.position === 'LW' || p.position === 'RW') {
        instruction = opponentTactics?.weaknesses?.includes('right_back_pace_issue')
          ? 'Attack the right back aggressively with direct dribbling; use speed'
          : 'Stay wide, cut inside to shoot, track back to defend width';
      } else if (p.position === 'CM') {
        instruction = 'Control tempo, switch play, track runners from deep. Screen space when defending.';
      } else if (p.position === 'CB') {
        instruction = opponentTactics?.strengths?.includes('clinical_striker')
          ? 'Stay tight on striker; do not ball-watch; communicate with goalkeeper'
          : 'Maintain line, intercept early, push line high when in possession';
      } else if (p.position === 'LB' || p.position === 'RB') {
        instruction = formation === '4-3-3'
          ? 'Overlap wide player when attacking; track back immediately on transition'
          : 'Stay disciplined, support midfield, do not commit forward without cover';
      }
      if (instruction) instructions.push({ player: p.name, position: p.position, instruction, isKeyPlayer: p.rating >= 8.3 });
    });
    return instructions;
  }

  _generateAlternativePlans(team, opponent, teamTactics, opponentTactics, dataFormations) {
    return [
      {
        scenario: 'If losing by 1 goal (60+ minutes)',
        formation: '3-4-3',
        description: 'Push an extra attacker, use wing-backs for width, more direct attacking play',
        formationData: dataFormations['3-5-2'] // Closest available
      },
      {
        scenario: 'If winning and need to protect lead',
        formation: '5-3-2',
        description: 'Drop deep with five defenders, block spaces, attack on counter only',
        formationData: dataFormations['5-3-2']
      },
      {
        scenario: 'If opponent changes to high press',
        formation: '4-2-3-1',
        description: 'Double pivot shields back line, quick triangles to bypass press, use GK distribution',
        formationData: dataFormations['4-2-3-1']
      }
    ];
  }

  _generateInGameAdjustments(team, opponent, teamTactics, opponentTactics) {
    return [
      { trigger: 'Winning by 1 goal (last 15 min)', action: 'Narrow shape to 4-5-1, reduce pressing risk, time wasting allowed' },
      { trigger: 'Losing by 1 goal (60+ min)', action: 'Push full-backs higher, add extra attacker, increase crosses into box' },
      { trigger: 'Opponent exploiting wide areas', action: 'Drop wide midfielder to form 4-4-2 defensive shape' },
      { trigger: 'Red card (11 vs 10)', action: 'Maintain possession, tire opponent, attack spaces on turnover' },
      { trigger: 'Red card (10 vs 11)', action: 'Reorganize to 4-4-1, compact shape, counter-attack on chance' },
      { trigger: 'Opponent fatigue (70+ min)', action: 'Increase tempo, more direct play, substitute fresh legs in attack' }
    ];
  }

  _getKeyPrinciples(teamTactics, opponentTactics) {
    return [
      'Maintain tactical shape at all times — individual brilliance within the system',
      `Press as a unit — ${opponentTactics?.weaknesses?.includes('slow_build_from_back') ? 'apply high press on their goalkeeper and CBs' : 'trigger at designated cues only'}`,
      `Attack with width to exploit ${opponentTactics?.weaknesses?.[0]?.replace(/_/g, ' ') || 'identified vulnerabilities'}`,
      'Transitions: 6-second rule — press or reorganize within 6 seconds of losing the ball',
      'Set pieces: assign zones, all 11 players in designated positions before every corner'
    ];
  }

  _buildPrompt(team, opponent, teamTactics, opponentTactics, matchAnalysis, opponentAnalysis) {
    return `You are a professional football head coach. Create a comprehensive tactical game plan.

My Team: ${team.name} (${team.formation}, ${teamTactics?.attackStyle} style)
Opponent: ${opponent.name} (${opponentTactics?.preferredFormations?.join('/')}, ${opponentTactics?.attackStyle} style)
Opponent Weaknesses: ${opponentTactics?.weaknesses?.join(', ')}
Opponent Strengths: ${opponentTactics?.strengths?.join(', ')}

Provide: 1) Recommended formation and reason 2) Attacking strategy targeting weaknesses 3) Defensive setup neutralizing threats 4) Set piece approach 5) Key tactical principles.

Game Plan:`;
  }
}

module.exports = new StrategyRecommendationAgent();
