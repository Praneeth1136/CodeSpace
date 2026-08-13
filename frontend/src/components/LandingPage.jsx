import { useState } from 'react';
import { Loader2, Sparkles, Terminal, Code2, Eye } from 'lucide-react';

export default function LandingPage({ onSandboxCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createSandbox = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. First create a project to get a projectId
      const projectRes = await fetch('/api/sandbox/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Sandbox Project' })
      });
      if (!projectRes.ok) throw new Error(`Failed to create project: ${projectRes.status}`);
      const projectData = await projectRes.json();
      const projectId = projectData.project._id;

      // 2. Then start the sandbox with the projectId
      const res = await fetch('/api/sandbox/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });
      if (!res.ok) throw new Error(`Failed to start sandbox: ${res.status}`);
      const data = await res.json();
      onSandboxCreated(data.sandboxId, data.previewUrl);
    } catch (err) {
      setError(err.message || 'Failed to create sandbox');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: '#0d0d0e' }}>
      <div className="flex flex-col items-center gap-10 max-w-lg px-6">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(224,163,78,0.12)', border: '1px solid rgba(224,163,78,0.2)' }}>
            <Code2 size={32} style={{ color: '#e0a34e' }} />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight" style={{ color: '#e8e6e2', fontFamily: 'Inter, sans-serif' }}>
            CodeSpace
          </h1>
          <p className="text-center text-base leading-relaxed" style={{ color: '#8a8a8f', fontFamily: 'Inter, sans-serif' }}>
            AI-powered sandbox IDE. Spin up an isolated environment, describe what you want, and watch it build in real time.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex gap-3 flex-wrap justify-center">
          {[
            { icon: Sparkles, label: 'AI Code Generation' },
            { icon: Terminal, label: 'Live Terminal' },
            { icon: Eye, label: 'Instant Preview' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: '#1a1a1d', border: '1px solid #232326', color: '#b0b0b5' }}
            >
              <Icon size={13} style={{ color: '#8a8a8f' }} />
              {label}
            </div>
          ))}
        </div>

        {/* Create button */}
        <button
          onClick={createSandbox}
          disabled={loading}
          className="relative px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-120 cursor-pointer disabled:cursor-wait"
          style={{
            background: loading ? '#3a3a3e' : '#e0a34e',
            color: loading ? '#8a8a8f' : '#0d0d0e',
            border: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={(e) => { if (!loading) e.target.style.background = '#eab566'; }}
          onMouseLeave={(e) => { if (!loading) e.target.style.background = '#e0a34e'; }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Provisioning sandbox…
            </span>
          ) : (
            'Create Sandbox'
          )}
        </button>

        {/* Error state */}
        {error && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm"
            style={{ background: 'rgba(201,106,92,0.12)', border: '1px solid rgba(201,106,92,0.25)', color: '#c96a5c' }}
          >
            <span className="flex-1">{error}</span>
            <button
              onClick={createSandbox}
              className="text-xs font-medium px-3 py-1 rounded cursor-pointer"
              style={{ background: 'rgba(201,106,92,0.2)', color: '#c96a5c', border: 'none' }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
