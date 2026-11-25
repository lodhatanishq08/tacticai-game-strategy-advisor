/**
 * Agent Orchestrator - Coordinates the multi-agent pipeline
 * 
 * Pipeline:
 * 1. Match Analysis Agent
 * 2. Opponent Strategy Agent
 * 3. Strategy Recommendation Agent
 * 4. Insight Explanation Agent
 */

const matchAnalysisAgent = require('./matchAnalysisAgent');
const opponentStrategyAgent = require('./opponentStrategyAgent');
const strategyRecommendationAgent = require('./strategyRecommendationAgent');
const insightExplanationAgent = require('./insightExplanationAgent');
const ragEngine = require('../rag/ragEngine');
const { callGranite, fallbackReason, isGraniteAvailable } = require('../utils/graniteClient');

class AgentOrchestrator {
  constructor() {
    this.name = 'Agent Orchestrator';
    this.pipelineStatus = {};
  }

  async runFullPipeline(teamId, opponentId, customData = null) {
    const pipelineId = `${teamId}_vs_${opponentId}_${Date.now()}`;
    this.pipelineStatus[pipelineId] = { status: 'running', step: 0 };

    try {
      // Step 1: Initialize RAG
      await ragEngine.initialize(customData);

      // Step 2: Run Match Analysis and Opponent Analysis in parallel
      this.pipelineStatus[pipelineId] = { status: 'running', step: 1, message: 'Analyzing team performance...' };
      const [matchAnalysis, opponentAnalysis] = await Promise.all([
        matchAnalysisAgent.analyze(teamId, customData),
        opponentStrategyAgent.analyze(opponentId, customData)
      ]);

      // Step 3: Strategy Recommendation
      this.pipelineStatus[pipelineId] = { status: 'running', step: 2, message: 'Generating strategic recommendations...' };
      const strategyResult = await strategyRecommendationAgent.recommend(
        teamId, opponentId, matchAnalysis, opponentAnalysis, customData
      );

      // Step 4: Insight Explanation
      this.pipelineStatus[pipelineId] = { status: 'running', step: 3, message: 'Converting to coaching instructions...' };
      const explanationResult = await insightExplanationAgent.explain(
        strategyResult.recommendation,
        matchAnalysis.team,
        opponentAnalysis.opponent,
        customData
      );

      this.pipelineStatus[pipelineId] = { status: 'complete', step: 4 };

      return {
        pipelineId,
        aiBackend: isGraniteAvailable() ? 'IBM Granite (WatsonX)' : 'Rule-Based Fallback Engine',
        graniteConnected: isGraniteAvailable(),
        note: isGraniteAvailable() ? null : 'IBM Granite credentials not configured — using local rule-based reasoning engine. Add IBM_API_KEY and IBM_PROJECT_ID to .env to enable Granite.',
        agents: {
          matchAnalysis,
          opponentAnalysis,
          strategyRecommendation: strategyResult,
          insightExplanation: explanationResult
        },
        summary: this._buildPipelineSummary(matchAnalysis, opponentAnalysis, strategyResult, explanationResult),
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      this.pipelineStatus[pipelineId] = { status: 'error', error: err.message };
      throw err;
    }
  }

  async runLiveMatchAnalysis(matchContext) {
    const { callGranite, fallbackReason } = require('../utils/graniteClient');
    
    const prompt = `You are a live match tactical advisor. The coach needs immediate suggestions.

Match Context: ${matchContext.score} at minute ${matchContext.minute}
My Formation: ${matchContext.teamFormation}
Opponent Formation: ${matchContext.opponentFormation}
Possession: ${matchContext.possession}%
Notes: ${matchContext.notes || 'No additional notes'}

Provide 3 specific, urgent tactical suggestions. Be direct and practical.

Suggestions:`;

    let graniteResult = await callGranite(prompt, 400);
    let analysis;
    
    if (graniteResult) {
      analysis = { text: graniteResult, confidence: 0.9, dataSource: 'ibm_granite' };
    } else {
      analysis = fallbackReason('live_match', matchContext);
    }

    return {
      agent: 'Live Match Advisor',
      context: matchContext,
      analysis,
      timestamp: new Date().toISOString()
    };
  }

  async runChatQuery(question, teamId, opponentId, customData = null) {
    await ragEngine.initialize(customData);
    
    const { teams, tacticalPatterns } = require('../data/demoData');
    const dataTeams = customData?.teams || teams;
    const dataTactics = customData?.tacticalPatterns || tacticalPatterns;

    const team = dataTeams.find(t => t.id === teamId);
    const opponent = dataTeams.find(t => t.id === opponentId);

    const ragContext = await ragEngine.retrieveContext(question, {
      topK: 5,
      filterTeam: teamId
    });

    const contextText = ragContext.map(r => r.content?.slice(0, 300)).join('\n');

    const prompt = `You are an AI football tactical assistant. Answer the coach's question using the provided data.

Team: ${team?.name} | Opponent: ${opponent?.name}
Historical Data: ${contextText}

Question: ${question}

Answer (be specific, use data, give practical advice):`;

    let graniteResult = await callGranite(prompt, 500);
    let response;

    if (graniteResult) {
      response = { text: graniteResult, confidence: 0.9, dataSource: 'ibm_granite' };
    } else {
      response = fallbackReason('chat', {
        question, team, opponent,
        ragContext,
        matchHistory: ragContext.filter(r => r.type === 'match_result')
      });
    }

    return {
      question,
      response,
      ragDocuments: ragContext.length,
      agentPipeline: ['RAG Retrieval', 'Match Analysis', 'Opponent Analysis', 'Strategy', 'Explanation'],
      timestamp: new Date().toISOString()
    };
  }

  _buildPipelineSummary(matchAnalysis, opponentAnalysis, strategyResult, explanationResult) {
    return {
      teamName: matchAnalysis.team?.name,
      opponentName: opponentAnalysis.opponent?.name,
      recommendedFormation: strategyResult.recommendation?.formation,
      alternativeFormation: strategyResult.recommendation?.alternativeFormation,
      topAttackingPriority: strategyResult.recommendation?.attacking?.priorities?.[0]?.instruction,
      topDefensivePriority: strategyResult.recommendation?.defending?.priorities?.[0]?.instruction,
      keyWeaknessToExploit: opponentAnalysis.weaknessMap?.[0]?.label,
      overallConfidence: parseFloat(((matchAnalysis.analysis.confidence + opponentAnalysis.analysis.confidence + strategyResult.confidence) / 3).toFixed(2)),
      pregameChecklist: explanationResult.pregameChecklist,
      coachBriefing: explanationResult.briefing?.openingStatement
    };
  }
}

module.exports = new AgentOrchestrator();
