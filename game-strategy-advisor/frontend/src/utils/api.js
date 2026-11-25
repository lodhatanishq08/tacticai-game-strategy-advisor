const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export async function fetchStatus() {
  const r = await fetch(`${API_BASE}/status`);
  return r.json();
}

export async function fetchTeams() {
  const r = await fetch(`${API_BASE}/teams`);
  return r.json();
}

export async function fetchTeam(id) {
  const r = await fetch(`${API_BASE}/teams/${id}`);
  return r.json();
}

export async function fetchMatches(teamId) {
  const url = teamId ? `${API_BASE}/matches?teamId=${teamId}` : `${API_BASE}/matches`;
  const r = await fetch(url);
  return r.json();
}

export async function fetchMatch(id) {
  const r = await fetch(`${API_BASE}/matches/${id}`);
  return r.json();
}

export async function runAnalysis(teamId, opponentId) {
  const r = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, opponentId })
  });
  return r.json();
}

export async function analyzeTeam(teamId) {
  const r = await fetch(`${API_BASE}/analyze/team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId })
  });
  return r.json();
}

export async function analyzeOpponent(opponentId) {
  const r = await fetch(`${API_BASE}/analyze/opponent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opponentId })
  });
  return r.json();
}

export async function getLiveAdvice(matchContext) {
  const r = await fetch(`${API_BASE}/live`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matchContext)
  });
  return r.json();
}

export async function askChat(question, teamId, opponentId) {
  const r = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, teamId, opponentId })
  });
  return r.json();
}

export async function fetchFormations() {
  const r = await fetch(`${API_BASE}/formations`);
  return r.json();
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const r = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });
  return r.json();
}

export async function downloadTemplate() {
  const r = await fetch(`${API_BASE}/upload/template`);
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'match_data_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}
