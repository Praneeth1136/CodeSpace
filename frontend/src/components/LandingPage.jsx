import { useState, useEffect } from 'react';
import { Loader2, Sparkles, Terminal, Code2, Eye, Plus, Folder } from 'lucide-react';

export default function LandingPage({ onSandboxCreated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/sandbox/project', { credentials: 'include' });
      if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load existing projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const startSandbox = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sandbox/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectId })
      });
      if (!res.ok) throw new Error(`Failed to start sandbox: ${res.status}`);
      const data = await res.json();
      onSandboxCreated(data.sandboxId, data.previewUrl, data.agentToken);
    } catch (err) {
      setError(err.message || 'Failed to start sandbox');
      setLoading(false);
    }
  };

  const createAndStartSandbox = async () => {
    if (!newProjectTitle.trim()) {
      setError('Please enter a project title');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const projectRes = await fetch('/api/sandbox/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: newProjectTitle })
      });
      if (!projectRes.ok) throw new Error(`Failed to create project: ${projectRes.status}`);
      const projectData = await projectRes.json();
      const projectId = projectData.project._id;

      await startSandbox(projectId);
    } catch (err) {
      setError(err.message || 'Failed to create sandbox');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center py-20" style={{ background: '#0d0d0e' }}>
      <div className="flex flex-col items-center gap-10 max-w-2xl w-full px-6">
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
        <div className="flex gap-3 flex-wrap justify-center mb-4">
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

        {/* Projects / Create Section */}
        <div className="w-full flex flex-col gap-8">
          
          {/* Create New */}
          <div className="flex flex-col gap-4 p-6 rounded-xl" style={{ background: '#151517', border: '1px solid #232326' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#e8e6e2' }}>Create New Project</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Project title (e.g., React Todo App)"
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createAndStartSandbox(); }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{ background: '#0d0d0e', border: '1px solid #2a2a2e', color: '#e8e6e2' }}
                disabled={loading}
              />
              <button
                onClick={createAndStartSandbox}
                disabled={loading}
                className="flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-120 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                style={{ background: '#e0a34e', color: '#0d0d0e', border: 'none' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} className="mr-2"/> Create</>}
              </button>
            </div>
          </div>

          {/* Existing Projects */}
          <div className="flex flex-col gap-4 p-6 rounded-xl" style={{ background: '#151517', border: '1px solid #232326' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#e8e6e2' }}>Recent Projects</h2>
            
            {loadingProjects ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-neutral-500" />
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Folder size={32} style={{ color: '#3a3a3e' }} />
                <p className="text-sm" style={{ color: '#8a8a8f' }}>No projects found. Create one above!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {projects.map((project) => (
                  <button
                    key={project._id}
                    onClick={() => startSandbox(project._id)}
                    disabled={loading}
                    className="flex items-center gap-3 w-full p-4 rounded-lg text-left transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-wait"
                    style={{ background: '#0d0d0e', border: '1px solid #232326' }}
                  >
                    <Folder size={18} style={{ color: '#e0a34e' }} className="shrink-0" />
                    <div className="flex-1 truncate">
                      <p className="text-sm font-medium truncate" style={{ color: '#e8e6e2' }}>{project.title}</p>
                      <p className="text-xs mt-1" style={{ color: '#5a5a5f' }}>ID: {project._id}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm"
            style={{ background: 'rgba(201,106,92,0.12)', border: '1px solid rgba(201,106,92,0.25)', color: '#c96a5c' }}
          >
            <span className="flex-1">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
