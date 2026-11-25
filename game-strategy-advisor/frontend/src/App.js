import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MatchAnalysisPage from './pages/MatchAnalysis';
import OpponentAnalysisPage from './pages/OpponentAnalysis';
import StrategyPage from './pages/Strategy';
import LiveMatchPage from './pages/LiveMatch';
import ChatPage from './pages/Chat';
import DataPage from './pages/Data';
import { fetchStatus, fetchTeams } from './utils/api';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '⬛' },
  { path: '/analysis', label: 'Match Analysis', icon: '📊' },
  { path: '/opponent', label: 'Opponent Scout', icon: '🔍' },
  { path: '/strategy', label: 'Strategy', icon: '♟️' },
  { path: '/live', label: 'Live Match', icon: '⚡' },
  { path: '/chat', label: 'AI Advisor', icon: '🤖' },
  { path: '/data', label: 'Data Manager', icon: '📂' },
];

function Sidebar({ status, teams, selectedTeam, onTeamChange }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px'
          }}>⚽</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>TacticAI</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Strategy Advisor</div>
          </div>
        </div>
        
        {/* AI Status */}
        <div style={{
          marginTop: '12px', padding: '8px 12px', borderRadius: '8px',
          background: status?.graniteConnected ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${status?.graniteConnected ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`,
          fontSize: '11px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: status?.graniteConnected ? 'var(--success)' : 'var(--warning)', display: 'inline-block' }}></span>
            <span style={{ color: status?.graniteConnected ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
              {status?.graniteConnected ? 'IBM Granite Active' : 'AI Engine Active'}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px', fontSize: '10px' }}>
            {status?.aiBackend || 'Loading...'}
          </div>
        </div>
      </div>

      {/* Team Selector */}
      {teams.length > 0 && (
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>My Team</div>
          <select
            value={selectedTeam}
            onChange={e => onTeamChange(e.target.value)}
            style={{ width: '100%', fontSize: '13px' }}
          >
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ padding: '12px 12px', flex: 1 }}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '8px',
              marginBottom: '2px',
              fontWeight: isActive ? 600 : 400,
              fontSize: '14px',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: '16px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <div style={{ marginBottom: '4px' }}>⚠️ Demo data — simulated stats</div>
          <div>🏆 Powered by IBM Granite</div>
          <div>🔧 IBM Cloud Ready</div>
        </div>
      </div>
    </aside>
  );
}

function AppContent() {
  const [status, setStatus] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('team_alpha');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStatus(), fetchTeams()])
      .then(([statusData, teamsData]) => {
        setStatus(statusData);
        setTeams(teamsData.teams || []);
        if (teamsData.teams?.length > 0) {
          setSelectedTeam(teamsData.teams[0].id);
        }
      })
      .catch(err => {
        console.error('API connection failed:', err);
        setStatus({ status: 'offline', aiBackend: 'Backend not available', graniteConnected: false });
      })
      .finally(() => setLoading(false));
  }, []);

  const sharedProps = { selectedTeam, teams, status };

  return (
    <div className="app-layout">
      <Sidebar status={status} teams={teams} selectedTeam={selectedTeam} onTeamChange={setSelectedTeam} />
      <main className="main-content">
        {status?.status === 'offline' && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', margin: '16px 32px', padding: '12px 16px', borderRadius: '8px', color: 'var(--danger)', fontSize: '13px' }}>
            ⚠️ Backend server not available. Start the backend with <code>cd backend && npm start</code>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Dashboard {...sharedProps} />} />
          <Route path="/analysis" element={<MatchAnalysisPage {...sharedProps} />} />
          <Route path="/opponent" element={<OpponentAnalysisPage {...sharedProps} />} />
          <Route path="/strategy" element={<StrategyPage {...sharedProps} />} />
          <Route path="/live" element={<LiveMatchPage {...sharedProps} />} />
          <Route path="/chat" element={<ChatPage {...sharedProps} />} />
          <Route path="/data" element={<DataPage {...sharedProps} />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
