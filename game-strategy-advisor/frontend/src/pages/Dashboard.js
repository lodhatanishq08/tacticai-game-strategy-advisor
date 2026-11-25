import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchTeam, fetchMatches, analyzeTeam } from '../utils/api';
import { FormBadge, ConfidenceBar, Section, StatBar, Skeleton } from '../components/ui';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts';

export default function Dashboard({ selectedTeam, teams, status }) {
  const [team, setTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedTeam) return;
    setLoading(true);
    Promise.all([fetchTeam(selectedTeam), fetchMatches(selectedTeam)])
      .then(([teamData, matchData]) => {
        setTeam(teamData.team);
        setMatches(matchData.matches || []);
      })
      .finally(() => setLoading(false));
  }, [selectedTeam]);

  const handleAnalyze = async () => {
    if (!selectedTeam) return;
    setLoading(true);
    try {
      const result = await analyzeTeam(selectedTeam);
      setAnalysis(result);
    } finally {
      setLoading(false);
    }
  };

  if (!team) return (
    <div className="page-content">
      <Skeleton height={200} style={{ marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} height={100} />)}
      </div>
    </div>
  );

  const teamMatches = matches.filter(m => m.homeTeam === selectedTeam || m.awayTeam === selectedTeam);
  
  const performanceTrend = teamMatches.slice(0, 8).reverse().map(m => {
    const isHome = m.homeTeam === selectedTeam;
    return {
      date: m.date?.slice(5),
      goalsFor: isHome ? m.homeScore : m.awayScore,
      goalsAgainst: isHome ? m.awayScore : m.homeScore,
      possession: isHome ? m.homePossession : m.awayPossession,
      shots: isHome ? m.homeShots : m.awayShots,
    };
  });

  const radarData = [
    { metric: 'Attack', value: Math.round((team.stats.goalsScored / 50) * 100) },
    { metric: 'Defense', value: Math.round(((50 - team.stats.goalsConceded) / 50) * 100) },
    { metric: 'Possession', value: team.stats.possession },
    { metric: 'Passing', value: team.stats.passAccuracy },
    { metric: 'Pressing', value: Math.round((team.stats.tacklesPerGame / 25) * 100) },
    { metric: 'Accuracy', value: Math.round((team.stats.shotsOnTarget / team.stats.shotsPerGame) * 100) }
  ];

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
              <span style={{ color: team.color || 'var(--accent)' }}>●</span> {team.name}
            </h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
              {team.league} · {team.manager} · {team.formation}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="demo-banner">⚠️ Demo Data — Simulated Statistics</div>
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading}>
              {loading ? <><span className="loading-spinner"></span> Analyzing...</> : '🤖 AI Analyze'}
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Stats grid */}
        <div className="stat-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Wins', value: team.stats.wins, color: 'var(--success)' },
            { label: 'Draws', value: team.stats.draws, color: 'var(--warning)' },
            { label: 'Losses', value: team.stats.losses, color: 'var(--danger)' },
            { label: 'Goals Scored', value: team.stats.goalsScored, color: 'var(--accent)' },
            { label: 'Goals Conceded', value: team.stats.goalsConceded, color: 'var(--text-secondary)' },
            { label: 'Possession %', value: `${team.stats.possession}%`, color: 'var(--info)' },
            { label: 'Pass Accuracy', value: `${team.stats.passAccuracy}%`, color: 'var(--accent)' },
            { label: 'Shots/Game', value: team.stats.shotsPerGame, color: 'var(--warning)' }
          ].map((stat, i) => (
            <div key={i} className="stat-box">
              <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Form + Radar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          <Section title="Recent Form" icon="📈">
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {team.stats.form?.map((r, i) => <FormBadge key={i} result={r} />)}
            </div>
            {performanceTrend.length > 0 && (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="goalsFor" stroke="var(--success)" strokeWidth={2} dot={{ r: 3 }} name="Goals For" />
                  <Line type="monotone" dataKey="goalsAgainst" stroke="var(--danger)" strokeWidth={2} dot={{ r: 3 }} name="Goals Against" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Section>

          <Section title="Performance Radar" icon="🎯">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Radar name="Performance" dataKey="value" stroke={team.color || '#3b82f6'} fill={team.color || '#3b82f6'} fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Section>
        </div>

        {/* Possession & Shots trend */}
        {performanceTrend.length > 0 && (
          <Section title="Match Trends" icon="📊" style={{ marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="possession" fill="var(--accent)" name="Possession %" opacity={0.8} />
                <Bar dataKey="shots" fill="var(--warning)" name="Shots" opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </Section>
        )}

        {/* AI Analysis */}
        {analysis && (
          <Section title="AI Analysis Results" icon="🤖" style={{ marginBottom: 24 }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '16px', marginBottom: 16, borderLeft: '3px solid var(--accent)' }}>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {analysis.analysis?.text}
              </p>
            </div>
            <ConfidenceBar value={analysis.analysis?.confidence || 0.8} />
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
              Data source: {analysis.analysis?.dataSource} · RAG documents: {analysis.ragDocuments}
            </div>
          </Section>
        )}

        {/* Top Players */}
        {team.players && (
          <Section title="Player Performance" icon="👤">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Player</th><th>Pos</th><th>Rating</th><th>Goals</th><th>Assists</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.sort((a, b) => b.rating - a.rating).map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td><span className="badge badge-muted">{p.position}</span></td>
                      <td style={{ fontWeight: 700, color: p.rating >= 8.3 ? 'var(--success)' : p.rating >= 7.8 ? 'var(--warning)' : 'var(--text-secondary)' }}>{p.rating}</td>
                      <td>{p.goals}</td>
                      <td>{p.assists}</td>
                      <td><span className={`badge ${p.rating >= 8.3 ? 'badge-success' : p.rating >= 7.8 ? 'badge-warning' : 'badge-muted'}`}>
                        {p.rating >= 8.3 ? 'Key Player' : p.rating >= 7.8 ? 'Good Form' : 'Average'}
                      </span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { to: '/analysis', icon: '📊', label: 'Deep Match Analysis', desc: 'Analyze historical patterns' },
            { to: '/strategy', icon: '♟️', label: 'Get Strategy', desc: 'AI-powered game plan' },
            { to: '/live', icon: '⚡', label: 'Live Advisor', desc: 'Real-time match guidance' }
          ].map((link, i) => (
            <Link key={i} to={link.to} style={{ textDecoration: 'none' }}>
              <div className="card card-hover" style={{ cursor: 'pointer', padding: '20px' }}>
                <div style={{ fontSize: '28px', marginBottom: 8 }}>{link.icon}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{link.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
