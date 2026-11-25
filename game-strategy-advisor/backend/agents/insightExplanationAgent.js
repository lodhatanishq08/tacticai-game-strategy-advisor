/**
 * Agent 4: Insight Explanation Agent
 * Converts technical AI analysis into clear, simple coaching advice
 */

const { callGranite, fallbackReason } = require('../utils/graniteClient');

class InsightExplanationAgent {
  constructor() {
    this.name = 'Insight Explanation Agent';
    this.role = 'Translates technical analysis into clear, actionable coaching instructions';
  }

  async explain(recommendation, team, opponent, customData = null) {
    const { formation, attacking, defending, pressing, transitions, setpieces, playerInstructions, reasoning } = recommendation;

    const prompt = this._buildPrompt(recommendation, team, opponent);
    let graniteResult = await callGranite(prompt, 700);

    let explanation;
    if (graniteResult) {
      explanation = { text: graniteResult, confidence: 0.92, dataSource: 'ibm_granite' };
    } else {
      explanation = fallbackReason('insight_explanation', {
        recommendation,
        formation: formation,
        attackPlan: attacking?.priorities?.map(p => p.instruction).join('; ') || '',
        defensePlan: defending?.priorities?.map(p => p.instruction).join('; ') || '',
        opponent
      });
    }

    return {
      agent: this.name,
      briefing: this._generateCoachBriefing(recommendation, team, opponent),
      halftimeAdjustments: this._generateHalftimeAdjustments(recommendation, team, opponent),
      playerTalkingPoints: this._generatePlayerTalkingPoints(playerInstructions, formation),
      pregameChecklist: this._generatePregameChecklist(recommendation, opponent),
      tacticalKeywords: this._extractKeywords(recommendation),
      explanation,
      timestamp: new Date().toISOString()
    };
  }

  _generateCoachBriefing(rec, team, opponent) {
    const { formation, attacking, defending, pressing } = rec;
    const topPriority = attacking?.priorities?.[0]?.instruction || 'Dominate possession';

    return {
      openingStatement: `Today we face ${opponent?.name} in what will be a tactical battle. Here's exactly how we win this game.`,
      formationRationale: `We set up in ${formation}. ${this._getFormationExplanation(formation)}`,
      primaryObjective: topPriority,
      offensiveInstruction: attacking?.priorities?.map(p => `✓ ${p.instruction}: ${p.detail}`).join('\n') || 'Attack with pace and width',
      defensiveInstruction: defending?.priorities?.map(p => `✓ ${p.instruction}: ${p.detail}`).join('\n') || 'Stay compact and organized',
      pressingTriggers: `Press when: ${pressing?.trigger?.join(', ') || 'back pass, goalkeeper ball'}`,
      transitionRule: 'On losing the ball: 6-second rule — press immediately OR reorganize your shape. No ball watching.'
    };
  }

  _generateHalftimeAdjustments(rec, team, opponent) {
    return [
      { scenario: 'Winning at halftime', instruction: 'Keep the shape. No unnecessary risks. Let them come to us. One change max if energy is low.' },
      { scenario: 'Drawing at halftime', instruction: 'Push full-backs 10 metres higher. More direct passes to the striker. Front 3 press immediately on goalkeeper kicks.' },
      { scenario: 'Losing at halftime', instruction: 'Switch to attacking formation immediately. Bring on the striker substitute. Increase the press — their back line is not comfortable.' },
      { scenario: 'Opponent changed formation', instruction: `If they switched to a defensive shape: more crosses, switch play quicker, test their goalkeeper with long shots.` }
    ];
  }

  _generatePlayerTalkingPoints(playerInstructions, formation) {
    if (!playerInstructions?.length) {
      return this._getDefaultTalkingPoints(formation);
    }
    return playerInstructions.map(pi => ({
      player: pi.player,
      position: pi.position,
      instruction: pi.instruction,
      isKeyPlayer: pi.isKeyPlayer,
      simpleVersion: pi.instruction.split(';')[0]
    }));
  }

  _getDefaultTalkingPoints(formation) {
    const defaults = {
      '4-3-3': [
        { position: 'ST', instruction: 'Stay in line with their last defender. Time your run on the through-ball.' },
        { position: 'LW/RW', instruction: 'Stay wide, cut inside to shoot. Track back — you are part of the defensive structure.' },
        { position: 'CM', instruction: 'Control tempo. No unnecessary risks. Switch play when space is on the far side.' },
        { position: 'CB', instruction: 'Push line high when in possession. Drop with striker runs. Communicate constantly.' },
        { position: 'LB/RB', instruction: 'Overlap when the winger cuts inside. Sprint back immediately on loss of possession.' }
      ],
      '4-2-3-1': [
        { position: 'ST', instruction: 'Hold the ball up. Bring the number 10 into play. Make runs at the right moment.' },
        { position: 'AM', instruction: 'Find pockets between lines. Quick 1-2 combinations. Drive at the defense.' },
        { position: 'DM', instruction: 'Stay in front of the back four. Intercept, recycle, control. Do not venture forward without cover.' },
        { position: 'CB', instruction: 'No risks in the back. Clear if in doubt. Push up 5 metres in the second half.' }
      ]
    };
    return defaults[formation] || defaults['4-3-3'];
  }

  _generatePregameChecklist(rec, opponent) {
    return [
      `✓ Formation confirmed: ${rec.formation} — everyone knows their position`,
      `✓ Primary target: ${rec.attacking?.priorities?.[0]?.instruction || 'Attack with purpose'}`,
      `✓ Defensive key: ${rec.defending?.priorities?.[0]?.instruction || 'Stay organized'}`,
      `✓ Press triggers memorized: ${rec.pressing?.trigger?.join(', ') || 'back pass, goalkeeper'}`,
      `✓ Set piece zones assigned: corners and free-kicks practiced`,
      `✓ Alternative formation ready: ${rec.alternativeFormation || '4-2-3-1'} if game state requires`,
      `✓ Key player to neutralize: ${opponent?.players?.sort((a, b) => b.rating - a.rating)[0]?.name || 'their striker'}`,
      `✓ Transition rule: 6 seconds to press or reorganize after losing ball`
    ];
  }

  _extractKeywords(rec) {
    const keywords = new Set();
    if (rec.formation) keywords.add(rec.formation);
    rec.attacking?.priorities?.forEach(p => p.instruction.split(' ').slice(0, 3).forEach(w => keywords.add(w)));
    rec.defending?.priorities?.forEach(p => p.instruction.split(' ').slice(0, 3).forEach(w => keywords.add(w)));
    rec.pressing?.trigger?.forEach(t => keywords.add(t.replace(/_/g, ' ')));
    return [...keywords].filter(k => k.length > 3).slice(0, 15);
  }

  _getFormationExplanation(formation) {
    const explanations = {
      '4-3-3': 'Four defenders give us width at the back. Three midfielders control the game. Three forwards press and create chances. Everyone has a clear role.',
      '4-2-3-1': 'The two defensive midfielders are our safety net. The number 10 links everything. The lone striker is the focal point. This formation is hard to beat.',
      '3-5-2': 'Three center-backs give us defensive cover. Wing-backs are our width — attack AND defend. Two strikers work as a unit. This is about control.',
      '4-4-2': 'Simple and effective. Two banks of four — compact, organized, hard to break down. The two strikers work together at all times.',
      '5-3-2': 'Five defenders means we are rock solid. When we win the ball, we burst forward on the counter. Discipline and patience win this game.'
    };
    return explanations[formation] || 'This formation matches our strengths and exploits their weaknesses.';
  }

  _buildPrompt(rec, team, opponent) {
    return `You are a football head coach explaining tactics to your players. Use simple, direct language.

Formation: ${rec.formation}
Attack Focus: ${rec.attacking?.priorities?.map(p => p.instruction).join('; ')}
Defense Focus: ${rec.defending?.priorities?.map(p => p.instruction).join('; ')}
Against: ${opponent?.name}

Explain in 3-4 sentences: what we need to do, why it will work, and what each player must remember. No jargon.

Pre-match Talk:`;
  }
}

module.exports = new InsightExplanationAgent();
