import React, { useState, useEffect } from 'react';
import { analyzeOpponent } from '../utils/api';
import { Section, WeaknessCard, ConfidenceBar, FormationPitch, AgentPipeline, FormBadge, InfoTag } from '../components/ui';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function OpponentAnalysisPage({ selectedTeam, teams }) {
  const [selectedOpponent, setSelectedOpponent] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formations, setFormations] = useState(null);

  const opponents = teams.filter(t => t.id !== selectedTeam);

  useEffect(() => {
    if (opponents.length > 0 && !selectedOpponent) {
      setSelectedOpponent(opponents[0].id);
    }
  }, [teams, selectedTeam]);

  useEffect(() => {
    if (!selectedOpponent) return;
    fetchFormationData();
  }, [selectedOpponent]);

  const fetchFormationData = async () => {
    try {
      const r = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/formations`);
      const d = await r.json();
      setFormations(d.formations);
    } catch (e) {}
  };

  const handleAnalyze = async () => {
    if (!selectedOpponent) return;
    setLoading(true);
    try {
      const result = await analyzeOpponent(selectedOpponent);
      setAnalysis(result);
    } finally {
      setLoading(false);
    }
  };

  const opponent = teams.find(t => t.id === selectedOpponent);

  const getRadarData = () => {
    if (!analysis?.tactics) return [];
    return [
      { metric: 'Press Intensity', value: analysis.tactics.defendingStyle === 'high_press' ? 90 : analysis.tactics.defendingStyle === 'mid_block' ? 60 : 40 },
      { metric: 'Counter Speed', value: analysis.tactics.attackStyle === 'counter_attack' ? 90 : 50 },
      { metric: 'Possession', value: opponent?.stats?.possession || 50 },
      { metric: 'Set Pieces', value: analysis.tactics.strengths?.includes('set_piece_threat') ? 85 : 55 },
      { metric: 'Physicality', value: analysis.tactics.strengths?.includes('physical_midfield') ? 85 : 60 },
      { metric: 'Width', value: analysis.tactics.weaknesses?.includes('limited_width') ? 30 : 70 }
    ];
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Opponent Scout</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: 2 }}>Analyze opponent tactics, strengths, and vulnerabilities</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <select
              value={selectedOpponent}
              onChange={e => { setSelectedOpponent(e.target.value); setAnalysis(null); }}
              style={{ minWidth: 200 }}
            >
              {opponents.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading || !selectedOpponent}>
              {loading ? <><span className="loading-spinner"></span> Analyzing...</> : '🔍 Scout Opponent'}
            </button>
          </div>
        </div>
        {loading && <div style={{ marginTop: 12 }}><AgentPipeline activeStep={1} /></div>}
        {analysis && <div style={{ marginTop: 12 }}><AgentPipeline activeStep={4} completed={true} /></div>}
      </div>

      <div className="page-content">
        {!analysis ? (
          <div style={{ textAlign: 'center', padding: '64px' }}>
            <div style={{ fontSize: '64px', marginBottom: 16 }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: 8 }}>Scout {opponent?.name || 'Opponent'}</div>
            <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Run the Opponent Strategy Agent to get detailed tactical intelligence</div>
            <button className="btn btn-primary btn-lg" onClick={handleAnalyze} disabled={loading}>
              {loading ? 'Analyzing...' : '🔍 Start Opponent Analysis'}
            </button>
          </div>
        ) : (
          <>
            {/* Opponent overview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
              {/* Profile */}
              <Section title="Opponent Profile" icon="🏆">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: opponent?.color || '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚽</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{opponent?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opponent?.manager}</div>
                  </div>
                </div>
                <InfoTag label="Formation" value={analysis.formations?.primary} />
                <InfoTag label="Alt Formation" value={analysis.formations?.secondary || '-'} />
                <InfoTag label="Attack Style" value={analysis.tactics?.attackStyle?.replace(/_/g, ' ')} color="var(--warning)" />
                <InfoTag label="Defense Style" value={analysis.tactics?.defendingStyle?.replace(/_/g, ' ')} color="var(--info)" />
                <InfoTag label="Recent Form" value={
                  <div style={{ display: 'flex', gap: 4 }}>{analysis.recentForm?.map((f, i) => <FormBadge key={i} result={f.result} />)}</div>
                } />
              </Section>

              {/* Tactical radar */}
              <Section title="Tactical Profile" icon="🎯">
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={getRadarData()}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                    <Radar dataKey="value" stroke={opponent?.color || '#dc2626'} fill={opponent?.color || '#dc2626'} fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Section>

              {/* Formation visual */}
              <Section title="Preferred Formation" icon="📐">
                {formations && analysis.formations?.primary && formations[analysis.formations.primary] && (
                  <FormationPitch
                    formation={formations[analysis.formations.primary]}
                    teamColor={opponent?.color || '#dc2626'}
                    size="sm"
                  />
                )}
                <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  {analysis.formations?.primary} · {analysis.formations?.pattern?.slice(0, 60)}...
                </div>
              </Section>
            </div>

            {/* Weaknesses & Strengths */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <Section title="Exploitable Weaknesses" icon="⚠️">
                <div className="ai-banner" style={{ marginBottom: 12 }}>
                  🎯 Target these in your attacking strategy
                </div>
                {analysis.weaknessMap?.map((w, i) => <WeaknessCard key={i} item={w} type="weakness" />)}
              </Section>

              <Section title="Strengths to Neutralize" icon="🛡️">
                <div className="demo-banner" style={{ marginBottom: 12 }}>
                  ⚠️ These require defensive attention
                </div>
                {analysis.strengthMap?.map((s, i) => <WeaknessCard key={i} item={s} type="strength" />)}
              </Section>
            </div>

            {/* Attack & Defense Patterns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <Section title="Attack Patterns" icon="⚔️">
                {analysis.attackPatterns?.map((p, i) => (
                  <div key={i} style={{ padding: '12px', borderRadius: 8, marginBottom: 8, background: 'var(--bg-secondary)', borderLeft: `3px solid ${p.severity === 'high' ? 'var(--danger)' : 'var(--warning)'}` }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.type?.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{p.description}</div>
                    <span className={`badge ${p.severity === 'high' ? 'badge-danger' : 'badge-warning'}`} style={{ marginTop: 6 }}>{p.severity} threat</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
                  📋 {analysis.tactics?.patterns?.attacking?.slice(0, 200)}
                </div>
              </Section>

              <Section title="Defensive Setup" icon="🏰">
                <div style={{ padding: '12px', borderRadius: 8, background: 'var(--bg-secondary)', marginBottom: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <InfoTag label="Style" value={analysis.defensivePatterns?.style} />
                    <InfoTag label="Line Height" value={analysis.defensivePatterns?.lineHeight} />
                    <InfoTag label="Compactness" value={analysis.defensivePatterns?.compactness} />
                    <InfoTag label="Press Intensity" value={analysis.pressureAnalysis?.pressing_intensity} />
                  </div>
                </div>
                <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Press Triggers</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {analysis.defensivePatterns?.pressTriggers?.map((t, i) => (
                    <span key={i} className="badge badge-info">{t.replace(/_/g, ' ')}</span>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
                  📋 {analysis.tactics?.patterns?.defending?.slice(0, 200)}
                </div>
              </Section>
            </div>

            {/* Player threats */}
            {analysis.playerThreats?.length > 0 && (
              <Section title="Player Threat Analysis" icon="⚡" style={{ marginBottom: 24 }}>
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Player</th><th>Position</th><th>Rating</th><th>Goals</th><th>Assists</th><th>Threat</th><th>How to Neutralize</th></tr></thead>
                    <tbody>
                      {analysis.playerThreats.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.name}</td>
                          <td><span className="badge badge-muted">{p.position}</span></td>
                          <td style={{ fontWeight: 700, color: p.rating >= 8.3 ? 'var(--danger)' : 'var(--warning)' }}>{p.rating}</td>
                          <td>{p.goals}</td>
                          <td>{p.assists}</td>
                          <td><span className={`badge ${p.threatLevel === 'critical' ? 'badge-danger' : 'badge-warning'}`}>{p.threatLevel}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200 }}>{p.tacticToNeutralize}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* Vulnerable zones */}
            {analysis.vulnerableZones?.length > 0 && (
              <Section title="Vulnerable Pitch Zones" icon="🗺️">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  {analysis.vulnerableZones.map((z, i) => (
                    <div key={i} style={{
                      padding: '12px 16px', borderRadius: 8, background: 'var(--bg-secondary)',
                      borderLeft: `3px solid ${z.threat === 'critical' ? 'var(--danger)' : 'var(--warning)'}`
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{z.zone}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{z.description}</div>
                      <span className={`badge ${z.threat === 'critical' ? 'badge-danger' : 'badge-warning'}`} style={{ marginTop: 8 }}>
                        {z.threat} priority
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* AI analysis text */}
            <Section title="AI Scout Report" icon="🤖">
              <div className="ai-banner" style={{ marginBottom: 12 }}>
                🤖 Generated by {analysis.analysis?.dataSource === 'ibm_granite' ? 'IBM Granite (WatsonX)' : 'AI Analysis Engine'} using RAG-retrieved data
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, borderLeft: '3px solid var(--accent)', marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{analysis.analysis?.text}</p>
              </div>
              <ConfidenceBar value={analysis.analysis?.confidence || 0.8} />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
