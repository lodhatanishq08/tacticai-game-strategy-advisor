import React, { useState, useEffect } from 'react';
import { fetchMatches, fetchMatch, analyzeTeam } from '../utils/api';
import { FormBadge, Section, StatBar, ConfidenceBar, FormationPitch, AgentPipeline, Skeleton } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function MatchAnalysisPage({ selectedTeam, teams, status }) {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchDetail, setMatchDetail] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchMatches(selectedTeam).then(d => {
      const ms = d.matches || [];
      setMatches(ms);
      if (ms.length > 0 && !selectedMatch) setSelectedMatch(ms[0].id);
    });
  }, [selectedTeam]);

  useEffect(() => {
    if (!selectedMatch) return;
    fetchMatch(selectedMatch).then(d => setMatchDetail(d.match));
  }, [selectedMatch]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeTeam(selectedTeam);
      setAnalysis(result);
    } finally {
      setAnalyzing(false);
    }
  };

  const team = teams.find(t => t.id === selectedTeam);

  const getResult = (match, teamId) => {
    const isHome = match.homeTeam === teamId;
    const my = isHome ? match.homeScore : match.awayScore;
    const opp = isHome ? match.awayScore : match.homeScore;
    return my > opp ? 'W' : my === opp ? 'D' : 'L';
  };

  const getOpponentName = (match, teamId) => {
    const oppId = match.homeTeam === teamId ? match.awayTeam : match.homeTeam;
    return teams.find(t => t.id === oppId)?.name || oppId;
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Match Analysis</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: 2 }}>Historical match performance & trends</div>
          </div>
          <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? <><span className="loading-spinner"></span> Running Agent...</> : '🤖 Run Match Analysis Agent'}
          </button>
        </div>
        {analyzing && <div style={{ marginTop: 12 }}><AgentPipeline activeStep={0} /></div>}
        {analysis && <div style={{ marginTop: 12 }}><AgentPipeline activeStep={4} completed={true} /></div>}
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>
          {/* Match list */}
          <div>
            <Section title="Match History" icon="📋">
              {matches.map(m => {
                const isHome = m.homeTeam === selectedTeam;
                const result = getResult(m, selectedTeam);
                const oppName = getOpponentName(m, selectedTeam);
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMatch(m.id)}
                    style={{
                      padding: '12px',
                      borderRadius: 8,
                      marginBottom: 8,
                      cursor: 'pointer',
                      background: selectedMatch === m.id ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                      border: `1px solid ${selectedMatch === m.id ? 'var(--accent)' : 'var(--border)'}`,
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>
                          {isHome ? 'vs' : '@'} {oppName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                          {m.date} · {m.competition}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                          {isHome ? m.homeScore : m.awayScore}–{isHome ? m.awayScore : m.homeScore}
                        </span>
                        <FormBadge result={result} />
                      </div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                      <span>⚽ Poss: {isHome ? m.homePossession : m.awayPossession}%</span>
                      <span>🎯 xG: {isHome ? m.xG?.home : m.xG?.away}</span>
                    </div>
                  </div>
                );
              })}
            </Section>
          </div>

          {/* Match detail */}
          <div>
            {matchDetail ? (
              <>
                <Section title="Match Statistics" icon="📊" style={{ marginBottom: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--accent)', fontSize: '15px' }}>
                        {matchDetail.homeTeamData?.name || matchDetail.homeTeam}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 8, fontWeight: 400 }}>({matchDetail.homeFormation})</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: '15px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: 8, fontWeight: 400 }}>({matchDetail.awayFormation})</span>
                        {matchDetail.awayTeamData?.name || matchDetail.awayTeam}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', margin: '0 0 20px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '8px' }}>
                      {matchDetail.homeScore} – {matchDetail.awayScore}
                    </span>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>xG: {matchDetail.xG?.home} – {matchDetail.xG?.away}</div>
                  </div>

                  <StatBar label="Possession" homeValue={matchDetail.homePossession} awayValue={matchDetail.awayPossession} format="%" />
                  <StatBar label="Shots" homeValue={matchDetail.homeShots} awayValue={matchDetail.awayShots} />
                  <StatBar label="Shots on Target" homeValue={matchDetail.homeShotsOnTarget} awayValue={matchDetail.awayShotsOnTarget} />
                  <StatBar label="Pass Accuracy" homeValue={matchDetail.homePassAccuracy} awayValue={matchDetail.awayPassAccuracy} format="%" />
                  <StatBar label="Tackles" homeValue={matchDetail.homeTackles} awayValue={matchDetail.awayTackles} />
                  <StatBar label="Corners" homeValue={matchDetail.homeCorners} awayValue={matchDetail.awayCorners} />
                </Section>

                {/* Goals */}
                {matchDetail.goals?.length > 0 && (
                  <Section title="Goal Timeline" icon="⚽" style={{ marginBottom: 24 }}>
                    {matchDetail.goals.map((g, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                        background: 'var(--bg-secondary)',
                        borderLeft: `3px solid ${g.team === selectedTeam ? 'var(--success)' : 'var(--danger)'}`
                      }}>
                        <span style={{ fontWeight: 700, color: 'var(--accent)', minWidth: 36, fontFamily: 'monospace' }}>{g.minute}'</span>
                        <span>⚽</span>
                        <div>
                          <span style={{ fontWeight: 600 }}>{g.scorer}</span>
                          {g.assist && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> (assist: {g.assist})</span>}
                        </div>
                        <span className={`badge ${g.team === selectedTeam ? 'badge-success' : 'badge-danger'}`} style={{ marginLeft: 'auto' }}>
                          {g.type?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </Section>
                )}

                {/* Key moments */}
                {matchDetail.keyMoments?.length > 0 && (
                  <Section title="Key Tactical Moments" icon="🔑">
                    {matchDetail.keyMoments.map((m, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                        <span style={{ color: 'var(--accent)', minWidth: 20 }}>{i+1}.</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{m}</span>
                      </div>
                    ))}
                  </Section>
                )}
              </>
            ) : (
              <Section title="Select a Match" icon="👆">
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '48px', marginBottom: 16 }}>⚽</div>
                  Select a match from the list to see detailed statistics
                </div>
              </Section>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        {analysis && (
          <Section title="Match Analysis Agent Results" icon="🤖" style={{ marginTop: 24 }}>
            <div className="ai-banner" style={{ marginBottom: 16 }}>
              🤖 Analysis generated by {analysis.analysis?.dataSource === 'ibm_granite' ? 'IBM Granite (WatsonX)' : 'AI Analysis Engine'} · {analysis.ragDocuments} RAG documents retrieved
            </div>
            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 8, borderLeft: '3px solid var(--accent)', marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{analysis.analysis?.text}</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {analysis.formationHistory?.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 12, fontSize: '14px' }}>Formation Usage</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={analysis.formationHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="formation" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                      <Bar dataKey="count" fill="var(--accent)" name="Times Used" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div>
                <ConfidenceBar value={analysis.analysis?.confidence || 0.8} label="Analysis Confidence" />
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '13px' }}>Top Performers</div>
                  {analysis.playerInsights?.slice(0, 4).map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                      <span>{p.name} <span style={{ color: 'var(--text-muted)' }}>({p.position})</span></span>
                      <span style={{ fontWeight: 700, color: p.isKeyPlayer ? 'var(--success)' : 'var(--warning)' }}>{p.rating} ⭐</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
