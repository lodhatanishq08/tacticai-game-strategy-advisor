import React, { useState, useRef, useEffect } from 'react';
import { askChat } from '../utils/api';
import { ConfidenceBar } from '../components/ui';

const SUGGESTED_QUESTIONS = [
  'How should we play against this opponent?',
  'Why should we use this formation?',
  'What are this team\'s biggest weaknesses?',
  'How should we change our tactics if we\'re losing?',
  'Which players are underperforming?',
  'What defensive setup should we use in the second half?',
  'How do we press effectively against their build-up?',
  'What set piece strategy works best against them?'
];

export default function ChatPage({ selectedTeam, teams }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello coach! I\'m your AI Tactical Advisor powered by IBM Granite. I have access to historical match data, formation analysis, and opponent scouting reports.\n\nAsk me anything about tactics, strategy, formations, or player performance. I\'ll give you data-backed answers.',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState('');
  const messagesEndRef = useRef(null);

  const opponents = teams.filter(t => t.id !== selectedTeam);

  useEffect(() => {
    if (opponents.length > 0 && !selectedOpponent) setSelectedOpponent(opponents[0].id);
  }, [teams, selectedTeam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question) => {
    const q = question || input.trim();
    if (!q) return;
    
    setMessages(m => [...m, { role: 'user', text: q, timestamp: new Date().toISOString() }]);
    setInput('');
    setLoading(true);

    try {
      const r = await askChat(q, selectedTeam, selectedOpponent);
      setMessages(m => [...m, {
        role: 'assistant',
        text: r.response?.text || 'I encountered an issue generating a response. Please try again.',
        confidence: r.response?.confidence,
        dataSource: r.response?.dataSource,
        ragDocs: r.ragDocuments,
        agents: r.agentPipeline,
        timestamp: r.timestamp
      }]);
    } catch (err) {
      setMessages(m => [...m, {
        role: 'assistant',
        text: 'Unable to connect to the AI backend. Please ensure the backend server is running.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const team = teams.find(t => t.id === selectedTeam);
  const opponent = teams.find(t => t.id === selectedOpponent);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>🤖 AI Tactical Advisor</h1>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: 2 }}>
              Multi-agent RAG-powered assistant · {team?.name} vs {opponent?.name}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Analyzing against:</div>
            <select value={selectedOpponent} onChange={e => setSelectedOpponent(e.target.value)}>
              {opponents.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Chat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className="slide-in"
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 16
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', marginRight: 12, flexShrink: 0,
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                  }}>🤖</div>
                )}
                
                <div style={{
                  maxWidth: '70%',
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-card)',
                  border: `1px solid ${msg.role === 'user' ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '14px 18px',
                  boxShadow: 'var(--shadow)'
                }}>
                  <div style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: msg.role === 'user' ? 'white' : 'var(--text-primary)' }}>
                    {msg.text}
                  </div>

                  {msg.role === 'assistant' && msg.confidence && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                      <ConfidenceBar value={msg.confidence} label="Response Confidence" />
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 6, display: 'flex', gap: 12 }}>
                        <span>Source: {msg.dataSource}</span>
                        {msg.ragDocs && <span>RAG docs: {msg.ragDocs}</span>}
                      </div>
                      {msg.agents && (
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 4 }}>
                          Pipeline: {msg.agents.join(' → ')}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: '10px', color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginTop: 6 }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', marginLeft: 12, flexShrink: 0,
                    background: 'var(--bg-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
                  }}>👤</div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px 16px 16px 4px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0,1,2].map(i => (
                      <div key={i} className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 32px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a tactical question... (Enter to send, Shift+Enter for new line)"
                rows={2}
                style={{ flex: 1, resize: 'none', padding: '12px 16px', fontSize: '14px', lineHeight: 1.5 }}
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                className="btn btn-primary"
                disabled={loading || !input.trim()}
                style={{ alignSelf: 'flex-end', padding: '12px 20px' }}
              >
                {loading ? <span className="loading-spinner"></span> : '→ Send'}
              </button>
            </div>
          </div>
        </div>

        {/* Suggested questions sidebar */}
        <div style={{ width: 280, borderLeft: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '20px', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>💡 Suggested Questions</div>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              disabled={loading}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 12px',
                borderRadius: 8, marginBottom: 6, background: 'var(--bg-primary)',
                border: '1px solid var(--border)', color: 'var(--text-secondary)',
                fontSize: '12px', cursor: 'pointer', lineHeight: 1.4,
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => e.target.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
            >
              {q}
            </button>
          ))}

          <div style={{ marginTop: 20, padding: '12px', background: 'var(--bg-primary)', borderRadius: 8, fontSize: '11px', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>How it works</div>
            <div>1. RAG retrieves relevant match data</div>
            <div>2. Match Analysis Agent processes team stats</div>
            <div>3. Opponent Scout provides tactical context</div>
            <div>4. Explanation Agent gives clear coaching advice</div>
          </div>
        </div>
      </div>
    </div>
  );
}
