import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile, downloadTemplate } from '../utils/api';
import { Section } from '../components/ui';

export default function DataPage({ selectedTeam, teams }) {
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);
    
    try {
      const r = await uploadFile(file);
      if (r.success) {
        setUploadResult(r);
      } else {
        setUploadError(r.error || 'Upload failed');
      }
    } catch (err) {
      setUploadError('Failed to connect to backend: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'], 'application/json': ['.json'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  });

  const CSV_TEMPLATE_HEADERS = 'date,homeTeam,awayTeam,homeScore,awayScore,homeFormation,awayFormation,homePossession,awayPossession,homeShots,awayShots,homePassAccuracy,awayPassAccuracy,competition';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Data Manager</h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: 2 }}>Upload custom match data or use built-in demo data</div>
        </div>
      </div>

      <div className="page-content">
        {/* Demo data info */}
        <Section title="Current Data Source" icon="📊" style={{ marginBottom: 24 }}>
          <div className="demo-banner" style={{ marginBottom: 16 }}>
            ⚠️ All data displayed is SIMULATED/SAMPLE data for demonstration purposes only
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            {[
              { label: 'Teams', value: teams.length, icon: '🏆' },
              { label: 'Matches', value: '10+', icon: '⚽' },
              { label: 'Players', value: '33+', icon: '👤' },
              { label: 'Formations', value: '5', icon: '📐' }
            ].map((s, i) => (
              <div key={i} className="stat-box">
                <div style={{ fontSize: '24px', marginBottom: 4 }}>{s.icon}</div>
                <div className="stat-value" style={{ fontSize: '24px' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </Section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Upload */}
          <Section title="Upload Custom Data" icon="📤">
            <div
              {...getRootProps()}
              style={{
                border: `2px dashed ${isDragActive ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 12, padding: '48px 24px', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                background: isDragActive ? 'var(--accent-glow)' : 'var(--bg-secondary)'
              }}
            >
              <input {...getInputProps()} />
              <div style={{ fontSize: '48px', marginBottom: 12 }}>{uploading ? '⏳' : '📂'}</div>
              {uploading ? (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Processing...</div>
                  <span className="loading-spinner"></span>
                </>
              ) : isDragActive ? (
                <div style={{ fontWeight: 600, color: 'var(--accent)' }}>Drop the file here!</div>
              ) : (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Drag & drop CSV or JSON</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 8 }}>or click to browse files</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Max 10MB · CSV, JSON, TXT</div>
                </>
              )}
            </div>

            {uploadResult && (
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 4 }}>✓ Upload Successful</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div>File: {uploadResult.filename}</div>
                  <div>Format: {uploadResult.format?.toUpperCase()}</div>
                  <div>Records added: {uploadResult.recordsAdded}</div>
                  <div>Message: {uploadResult.message}</div>
                </div>
              </div>
            )}

            {uploadError && (
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 4 }}>✕ Upload Failed</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{uploadError}</div>
              </div>
            )}
          </Section>

          {/* Template */}
          <Section title="CSV Template" icon="📋">
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 16 }}>
              Download the CSV template to format your match data correctly. Fill in your historical match data and upload it to analyze your own team.
            </p>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px', marginBottom: 16, overflowX: 'auto' }}>
              <code style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', display: 'block', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {CSV_TEMPLATE_HEADERS}
              </code>
            </div>
            <button className="btn btn-secondary w-full" onClick={downloadTemplate}>
              📥 Download CSV Template
            </button>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '13px' }}>JSON Format</div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px', overflowX: 'auto' }}>
                <code style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', display: 'block' }}>
                  {`[{"date":"2024-11-01","homeTeam":"My Team",\n"awayTeam":"Opponent","homeScore":2,\n"awayScore":1,"homeFormation":"4-3-3"}]`}
                </code>
              </div>
            </div>
          </Section>
        </div>

        {/* Teams list */}
        <Section title="Demo Teams" icon="🏆" style={{ marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {teams.map(t => (
              <div key={t.id} className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color || '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚽</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.formation}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: 'var(--success)' }}>{t.id === selectedTeam ? (teams.find(x => x.id === selectedTeam)?.stats?.wins || '-') : '-'}</div>
                    <div style={{ color: 'var(--text-muted)' }}>W</div>
                  </div>
                </div>
                {t.id === selectedTeam && <span className="badge badge-accent" style={{ marginTop: 8, display: 'inline-block' }}>Selected Team</span>}
              </div>
            ))}
          </div>
        </Section>

        {/* RAG info */}
        <Section title="RAG System Status" icon="🔍">
          <div className="ai-banner" style={{ marginBottom: 12 }}>
            🔍 RAG Engine uses TF-IDF local retrieval. For production, replace with IBM Watson Discovery or a vector database.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '13px' }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>What's Indexed</div>
              <div style={{ color: 'var(--text-muted)', lineHeight: 2 }}>
                ✓ All historical match data<br/>
                ✓ Tactical pattern analysis<br/>
                ✓ Player statistics<br/>
                ✓ Formation records<br/>
                ✓ User-uploaded data
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Production Upgrade Path</div>
              <div style={{ color: 'var(--text-muted)', lineHeight: 2 }}>
                → IBM Watson Discovery<br/>
                → Chroma or Pinecone vector DB<br/>
                → IBM Granite embeddings<br/>
                → IBM Cloud Object Storage<br/>
                → Real-time data APIs
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
