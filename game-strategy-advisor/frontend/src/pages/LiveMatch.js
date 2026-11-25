import React, { useState } from 'react';
import { getLiveAdvice } from '../utils/api';
import { Section, ConfidenceBar } from '../components/ui';

export default function LiveMatchPage({ selectedTeam, teams }) {
  const [form, setForm] = useState({
    score: '0-0',
    minute: '45',
    teamFormation: '4-3-3',
    opponentFormation: '4-2-3-1',
    possession: '50',
    fatigue: false,
    cards: '',
    notes: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const team = teams.find(t => t.id === selectedTeam);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await getLiveAdvice(form);
      setResult(r);
      setHistory(h => [{ ...form, result: r, timestamp: new Date().toLocaleTimeString() }, ...h.slice(0, 4)]);
    } finally {
      setLoading(false);
    }
  };

  const setField = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const urgencyColor = { high: 'var(--danger)', elevated: 'var(--warning)', normal: 'var(--accent)', low: 'var(--success)' };

  const QUICK_SCENARIOS = [
    { label: 'Winning 1-0 (75min)', score: '1-0', minute: '75' },
    { label: 'Losing 0-1 (60min)', score: '0-1', minute: '60' },
    { label: 'Draw (85min)', score: '1-1', minute: '85' },
    { label: 'Conceding early (20min)', score: '0-1', minute: '20' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>⚡ Live Match Advisor</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: 2 }}>Real-time tactical guidance during the match</div>
        </div>
      </div>

      <div className="page-content">
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24 }}>
          {/* Input Panel */}
          <div>
            <Section title="Match Status Input" icon="📋">
              <div className="demo-banner" style={{ marginBottom: 16 }}>⚠️ Manual input mode — enter live match data</div>

              {/* Quick scenarios */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Quick Scenarios</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {QUICK_SCENARIOS.map((s, i) => (
                    <button
                      key={i}
                      className="btn btn-secondary btn-sm"
                      onClick={() => setForm(f => ({ ...f, score: s.score, minute: s.minute }))}
                      style={{ fontSize: '11px', padding: '6px 8px' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <label className="form-label">Score (Your Team - Opponent)</label>
                  <input className="form-input" value={form.score} onChange={e => setField('score', e.target.value)} placeholder="e.g. 1-2" required />
                </div>
                <div className="form-row">
                  <label className="form-label">Match Minute</label>
                  <input className="form-input" type="number" value={form.minute} onChange={e => setField('minute', e.target.value)} min="1" max="120" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-row">
                    <label className="form-label">Our Formation</label>
                    <select className="form-input" value={form.teamFormation} onChange={e => setField('teamFormation', e.target.value)}>
                      {['4-3-3', '4-2-3-1', '3-5-2', '4-4-2', '5-3-2'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Opponent Formation</label>
                    <select className="form-input" value={form.opponentFormation} onChange={e => setField('opponentFormation', e.target.value)}>
                      {['4-3-3', '4-2-3-1', '3-5-2', '4-4-2', '5-3-2'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <label className="form-label">Current Possession %</label>
                  <input className="form-input" type="number" value={form.possession} onChange={e => setField('possession', e.target.value)} min="0" max="100" />
                </div>
                <div className="form-row">
                  <label className="form-label">Cards / Substitutions</label>
                  <input className="form-input" value={form.cards} onChange={e => setField('cards', e.target.value)} placeholder="e.g. Red card #9, Sub at 65min" />
                </div>
                <div className="form-row">
                  <label className="form-label">Tactical Observation</label>
                  <textarea className="form-input" rows={3} value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="e.g. We're being overrun in midfield, their left back is pushing high..." />
                </div>
                <div className="form-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" id="fatigue" checked={form.fatigue} onChange={e => setField('fatigue', e.target.checked)} />
                  <label htmlFor="fatigue" style={{ fontSize: '13px', cursor: 'pointer' }}>Players showing fatigue signs</label>
                </div>
                <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ marginTop: 8 }}>
                  {loading ? <><span className="loading-spinner"></span> Getting Advice...</> : '⚡ Get Live Tactical Advice'}
                </button>
              </form>
            </Section>
          </div>

          {/* Results Panel */}
          <div>
            {result ? (
              <>
                <Section title="Tactical Recommendations" icon="⚡" style={{ marginBottom: 24 }}>
                  <div style={{
                    background: `${urgencyColor[result.analysis?.urgency] || 'var(--accent)'}15`,
                    border: `1px solid ${urgencyColor[result.analysis?.urgency] || 'var(--accent)'}40`,
                    borderRadius: 8, padding: '12px 16px', marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <span style={{ fontSize: '20px' }}>
                      {result.analysis?.urgency === 'high' ? '🚨' : result.analysis?.urgency === 'elevated' ? '⚠️' : result.analysis?.urgency === 'low' ? '✅' : '📋'}
                    </span>
                    <span style={{ fontWeight: 600, color: urgencyColor[result.analysis?.urgency] || 'var(--accent)', fontSize: '13px' }}>
                      Urgency: {result.analysis?.urgency?.toUpperCase() || 'NORMAL'}
                    </span>
                  </div>

                  {result.analysis?.advice?.map((adv, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 12, padding: '14px 16px',
                      borderRadius: 8, marginBottom: 10, background: 'var(--bg-secondary)',
                      borderLeft: `3px solid ${urgencyColor[result.analysis?.urgency] || 'var(--accent)'}`,
                      transition: 'all 0.2s', cursor: 'default'
                    }}
                      className="slide-in"
                    >
                      <span style={{ fontSize: '18px', minWidth: 24 }}>
                        {i === 0 ? '🎯' : i === 1 ? '♟️' : '💡'}
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{adv}</div>
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 16 }}>
                    <ConfidenceBar value={result.analysis?.confidence || 0.87} label="AI Confidence" />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                      Analyzed at {new Date(result.timestamp).toLocaleTimeString()} · Source: {result.analysis?.dataSource}
                    </div>
                  </div>
                </Section>

                {/* Match summary */}
                <Section title="Current Match State" icon="📊">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                      { label: 'Score', value: form.score },
                      { label: 'Minute', value: `${form.minute}'` },
                      { label: 'Possession', value: `${form.possession}%` },
                      { label: 'Our Formation', value: form.teamFormation },
                      { label: 'Opp Formation', value: form.opponentFormation },
                      { label: 'Urgency', value: result.analysis?.urgency?.toUpperCase() || 'NORMAL' }
                    ].map((s, i) => (
                      <div key={i} className="stat-box">
                        <div className="stat-value" style={{ fontSize: '18px' }}>{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              </>
            ) : (
              <Section title="Waiting for Match Data" icon="⚡">
                <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                  <div style={{ fontSize: '64px', marginBottom: 16 }}>⚡</div>
                  <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: 8 }}>Live Tactical Advisor Ready</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: 400, margin: '0 auto' }}>
                    Enter the current match state and get immediate tactical suggestions tailored to the situation.
                    <br/><br/>
                    Example: "We're 0-1 down at 65 minutes with low possession — what do we change?"
                  </div>
                </div>
              </Section>
            )}

            {/* History */}
            {history.length > 0 && (
              <Section title="Advice History" icon="📜" style={{ marginTop: 24 }}>
                {history.map((h, i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 6, background: 'var(--bg-secondary)', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{h.score} at {h.minute}'</span>
                      <span style={{ color: 'var(--text-muted)' }}>{h.timestamp}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>{h.result?.analysis?.advice?.[0]?.slice(0, 100)}...</div>
                  </div>
                ))}
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
