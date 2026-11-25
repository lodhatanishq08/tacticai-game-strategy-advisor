import React from 'react';

// Formation pitch visualizer
export function FormationPitch({ formation, teamColor = '#3b82f6', size = 'md', showLabels = true }) {
  if (!formation || !formation.positions) return null;
  
  const heights = { sm: 240, md: 340, lg: 480 };
  const height = heights[size] || heights.md;
  const width = height * 0.65;

  return (
    <div className="pitch-container" style={{ width, height, margin: '0 auto', position: 'relative' }}>
      {/* Pitch markings */}
      <svg className="pitch-lines" viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }}>
        {/* Center circle */}
        <circle cx={width/2} cy={height/2} r={height*0.1} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none"/>
        {/* Center spot */}
        <circle cx={width/2} cy={height/2} r={3} fill="rgba(255,255,255,0.3)"/>
        {/* Halfway line */}
        <line x1={0} y1={height/2} x2={width} y2={height/2} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        {/* Penalty areas */}
        <rect x={width*0.2} y={height*0.02} width={width*0.6} height={height*0.18} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none"/>
        <rect x={width*0.2} y={height*0.8} width={width*0.6} height={height*0.18} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none"/>
        {/* Goals */}
        <rect x={width*0.38} y={-2} width={width*0.24} height={height*0.025} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="rgba(255,255,255,0.1)"/>
        <rect x={width*0.38} y={height*0.975} width={width*0.24} height={height*0.025} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="rgba(255,255,255,0.1)"/>
        {/* Small boxes */}
        <rect x={width*0.32} y={height*0.02} width={width*0.36} height={height*0.09} stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none"/>
        <rect x={width*0.32} y={height*0.89} width={width*0.36} height={height*0.09} stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none"/>
      </svg>

      {/* Players */}
      {formation.positions.map((pos, idx) => {
        const x = (pos.x / 100) * width;
        const y = (pos.y / 100) * height;
        return (
          <div
            key={idx}
            className="pitch-player"
            style={{
              left: x,
              top: y,
              background: teamColor,
              boxShadow: `0 0 12px ${teamColor}60`,
              fontSize: showLabels ? '9px' : '8px',
              width: size === 'sm' ? 28 : 36,
              height: size === 'sm' ? 28 : 36,
            }}
            title={pos.role}
          >
            {pos.label}
          </div>
        );
      })}
    </div>
  );
}

// Heatmap overlay
export function HeatmapOverlay({ zones = [], width = 300, height = 450 }) {
  const colors = { critical: '#ef444480', high: '#f59e0b60', medium: '#3b82f640' };
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} viewBox={`0 0 ${width} ${height}`}>
      {zones.map((zone, i) => (
        <circle
          key={i}
          cx={(zone.x / 100) * width}
          cy={(zone.y / 100) * height}
          r={width * 0.12}
          fill={colors[zone.threat] || colors.medium}
        />
      ))}
    </svg>
  );
}

// Stat bar comparison
export function StatBar({ label, homeValue, awayValue, homeLabel, awayLabel, format = '' }) {
  const total = homeValue + awayValue || 1;
  const homePct = (homeValue / total) * 100;
  
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{homeValue}{format}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{label}</span>
        <span style={{ color: '#94a3b8', fontWeight: 600 }}>{awayValue}{format}</span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'var(--bg-surface)', display: 'flex' }}>
        <div style={{ width: `${homePct}%`, background: 'var(--accent)', transition: 'width 0.5s' }}></div>
        <div style={{ flex: 1, background: '#475569' }}></div>
      </div>
    </div>
  );
}

// Form badge W/D/L
export function FormBadge({ result }) {
  const styles = {
    W: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    D: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    L: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' }
  };
  const s = styles[result] || styles.D;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 28, height: 28, borderRadius: '6px',
      background: s.bg, color: s.color,
      fontSize: '12px', fontWeight: 700
    }}>{result}</span>
  );
}

// Confidence indicator
export function ConfidenceBar({ value, label = 'Confidence' }) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? 'var(--success)' : pct >= 70 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
        <span>{label}</span><span style={{ color, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }}></div>
      </div>
    </div>
  );
}

// Loading skeleton
export function Skeleton({ width = '100%', height = 20, style = {} }) {
  return (
    <div className="pulse" style={{ width, height, background: 'var(--bg-surface)', borderRadius: '4px', ...style }} />
  );
}

// Agent pipeline indicator
export function AgentPipeline({ activeStep = 0, completed = false }) {
  const agents = ['Match Analysis', 'Opponent Scout', 'Strategy', 'Explanation'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
      {agents.map((agent, i) => (
        <React.Fragment key={i}>
          <div style={{
            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
            background: completed ? 'rgba(34,197,94,0.15)' : i < activeStep ? 'rgba(34,197,94,0.15)' : i === activeStep ? 'rgba(59,130,246,0.15)' : 'var(--bg-surface)',
            color: completed ? 'var(--success)' : i < activeStep ? 'var(--success)' : i === activeStep ? 'var(--accent)' : 'var(--text-muted)',
            border: `1px solid ${completed ? 'rgba(34,197,94,0.3)' : i === activeStep ? 'rgba(59,130,246,0.3)' : 'transparent'}`,
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            {completed || i < activeStep ? '✓' : i === activeStep ? <span className="loading-spinner" style={{ width: 10, height: 10, borderWidth: 1.5 }}></span> : '○'}
            {agent}
          </div>
          {i < agents.length - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// Weakness/Strength card
export function WeaknessCard({ item, type = 'weakness' }) {
  const severityColor = {
    critical: 'var(--danger)',
    high: 'var(--warning)',
    medium: 'var(--info)',
    danger: 'var(--danger)',
    warning: 'var(--warning)',
    info: 'var(--info)'
  };
  const color = severityColor[item.severity] || 'var(--text-muted)';
  
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '8px',
      background: 'var(--bg-secondary)',
      border: `1px solid ${color}40`,
      borderLeft: `3px solid ${color}`,
      marginBottom: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{item.label}</div>
        <span className="badge" style={{ background: `${color}15`, color, fontSize: '10px' }}>{item.severity}</span>
      </div>
      {type === 'weakness' && item.howToExploit && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          → {item.howToExploit}
        </div>
      )}
      {type === 'strength' && item.howToCounter && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          🛡 {item.howToCounter}
        </div>
      )}
    </div>
  );
}

// Empty state
export function EmptyState({ icon = '📊', title, description, action, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</div>
      {description && <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>{description}</div>}
      {action && <button className="btn btn-primary" onClick={onAction}>{action}</button>}
    </div>
  );
}

// Info tooltip
export function InfoTag({ label, value, color = 'var(--text-secondary)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

// Section with header
export function Section({ title, icon, children, action, style = {} }) {
  return (
    <div className="card" style={{ marginBottom: '24px', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="section-title" style={{ margin: 0 }}>
          {icon && <span>{icon}</span>}{title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}
