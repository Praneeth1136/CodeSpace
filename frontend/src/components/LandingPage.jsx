import { useState, useEffect, useRef } from 'react';
import {
  Loader2, Sparkles, Terminal, Code2, Eye, Plus, Folder,
  Trash2, LogOut, ChevronDown, ArrowRight, Zap, Layers, Globe,
  X
} from 'lucide-react';

// ── Relative time helper ──
function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ── Google SVG icon ──
function GoogleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ── Status badge component ──
function StatusBadge({ status }) {
  const config = {
    running: { label: 'Running', dotColor: '#7ba98a', className: 'status-running', pulse: true },
    waking: { label: 'Waking Up', dotColor: '#d4a843', className: 'status-waking', pulse: false },
    stopped: { label: 'Stopped', dotColor: '#5a5a5f', className: 'status-stopped', pulse: false },
  };
  const c = config[status] || config.stopped;

  return (
    <span className={`status-badge ${c.className}`}>
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${c.pulse ? 'status-dot-running' : ''}`}
        style={{ background: c.dotColor }}
      />
      {c.label}
    </span>
  );
}


// ═══════════════════════════════════════
//  LANDING PAGE — PUBLIC (Unauthenticated)
// ═══════════════════════════════════════
function PublicLanding() {
  return (
    <div className="landing-view" style={{ background: '#0d0d0e' }}>

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(224,163,78,0.12)', border: '1px solid rgba(224,163,78,0.2)' }}
            >
              <Code2 size={18} style={{ color: '#e0a34e' }} />
            </div>
            <span className="text-lg font-semibold" style={{ color: '#e8e6e2' }}>CodeSpace</span>
          </div>
          <a href="/api/auth/google" className="google-btn google-btn-outline">
            <GoogleIcon size={16} />
            Sign in with Google
          </a>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="hero-gradient relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Glow orbs */}
        <div className="glow-orb glow-orb-amber float-slow" style={{ width: '400px', height: '400px', top: '10%', left: '15%' }} />
        <div className="glow-orb glow-orb-blue float-medium" style={{ width: '300px', height: '300px', bottom: '15%', right: '10%' }} />
        <div className="glow-orb glow-orb-amber float-fast" style={{ width: '200px', height: '200px', top: '60%', left: '60%', opacity: 0.08 }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center gap-8">
          {/* Badge */}
          <div
            className="animate-fade-in-up animate-delay-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'rgba(224,163,78,0.1)', border: '1px solid rgba(224,163,78,0.2)', color: '#e0a34e' }}
          >
            <Zap size={12} />
            AI-Powered Cloud IDE
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up animate-delay-2 text-5xl md:text-7xl font-bold tracking-tight leading-tight"
            style={{ color: '#e8e6e2' }}
          >
            Build anything with
            <br />
            <span className="gradient-text">AI by your side</span>
          </h1>

          {/* Subtext */}
          <p
            className="animate-fade-in-up animate-delay-3 text-lg md:text-xl max-w-2xl leading-relaxed"
            style={{ color: '#8a8a8f' }}
          >
            Spin up an isolated sandbox, describe what you want to build, and watch CodeSpace generate, preview, and refine your code in real time.
          </p>

          {/* CTA */}
          <div className="animate-fade-in-up animate-delay-4 flex flex-col sm:flex-row items-center gap-4">
            <a href="/api/auth/google" className="google-btn google-btn-primary">
              <GoogleIcon size={18} />
              Get Started — It's Free
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Feature pills */}
          <div className="animate-fade-in-up animate-delay-5 flex gap-3 flex-wrap justify-center mt-4">
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
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-24 px-6" style={{ background: '#0d0d0e' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#e8e6e2' }}>
              Everything you need to build
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#8a8a8f' }}>
              A complete development environment in your browser. No setup, no configuration, just start building.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'AI Code Generation',
                description: 'Describe what you want in natural language. The AI writes production-ready code with proper structure, styling, and logic.',
                gradient: 'linear-gradient(135deg, rgba(224,163,78,0.08), transparent)',
              },
              {
                icon: Terminal,
                title: 'Live Terminal',
                description: 'Full terminal access to your sandboxed environment. Install packages, run scripts, and debug — all in real time.',
                gradient: 'linear-gradient(135deg, rgba(106,159,201,0.08), transparent)',
              },
              {
                icon: Eye,
                title: 'Instant Preview',
                description: 'See your changes live as the AI builds. Every code update is immediately reflected in a live preview panel.',
                gradient: 'linear-gradient(135deg, rgba(123,169,138,0.08), transparent)',
              },
            ].map(({ icon: Icon, title, description, gradient }) => (
              <div key={title} className="glass-card p-8 flex flex-col gap-4" style={{ background: gradient }}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(224,163,78,0.1)', border: '1px solid rgba(224,163,78,0.15)' }}
                >
                  <Icon size={24} style={{ color: '#e0a34e' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#e8e6e2' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8a8a8f' }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 px-6" style={{ background: '#0a0a0b' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#e8e6e2' }}>
              How it works
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#8a8a8f' }}>
              From idea to running app in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Globe, title: 'Sign In', description: 'Authenticate with Google. Your projects are securely tied to your account.' },
              { step: '02', icon: Layers, title: 'Create a Project', description: 'Give your project a name. CodeSpace spins up an isolated Kubernetes sandbox instantly.' },
              { step: '03', icon: Sparkles, title: 'Describe & Build', description: 'Tell the AI what you want. Watch it write code, install dependencies, and preview — all live.' },
            ].map(({ step, icon: Icon, title, description }, idx) => (
              <div key={step} className="relative flex flex-col items-center text-center gap-4 p-6">
                {idx < 2 && <div className="step-connector hidden md:block" />}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
                  style={{ background: 'rgba(224,163,78,0.1)', border: '1px solid rgba(224,163,78,0.2)' }}
                >
                  <Icon size={24} style={{ color: '#e0a34e' }} />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#e0a34e' }}>{step}</span>
                <h3 className="text-base font-semibold" style={{ color: '#e8e6e2' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8a8a8f' }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 px-6" style={{ background: '#0d0d0e' }}>
        <div
          className="max-w-3xl mx-auto text-center p-12 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(224,163,78,0.06), rgba(106,159,201,0.04))',
            border: '1px solid rgba(224,163,78,0.15)',
          }}
        >
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#e8e6e2' }}>
            Ready to build something amazing?
          </h2>
          <p className="text-base mb-8" style={{ color: '#8a8a8f' }}>
            Sign in and start your first project in seconds. No credit card required.
          </p>
          <a href="/api/auth/google" className="google-btn google-btn-primary">
            <GoogleIcon size={18} />
            Start Building Now
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-6" style={{ borderTop: '1px solid #1c1c1f' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 size={16} style={{ color: '#e0a34e' }} />
            <span className="text-sm font-medium" style={{ color: '#5a5a5f' }}>CodeSpace</span>
          </div>
          <span className="text-xs" style={{ color: '#3a3a3e' }}>
            © {new Date().getFullYear()} CodeSpace. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}


// ═══════════════════════════════════════
//  DASHBOARD — Authenticated
// ═══════════════════════════════════════
function Dashboard({ user, onSandboxCreated, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const profileRef = useRef(null);
  const createRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

  const deleteProject = async (projectId) => {
    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/sandbox/project/${projectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Failed to delete project: ${res.status}`);
      setProjects((prev) => prev.filter((p) => p._id !== projectId));
      setConfirmDeleteId(null);
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  };

  const scrollToCreate = () => {
    createRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Focus the input after scroll
    setTimeout(() => {
      createRef.current?.querySelector('input')?.focus();
    }, 400);
  };

  return (
    <div className="landing-view min-h-screen" style={{ background: '#0d0d0e' }}>

      {/* ── Dashboard Navbar ── */}
      <nav className="landing-nav">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(224,163,78,0.12)', border: '1px solid rgba(224,163,78,0.2)' }}
            >
              <Code2 size={18} style={{ color: '#e0a34e' }} />
            </div>
            <span className="text-lg font-semibold" style={{ color: '#e8e6e2' }}>CodeSpace</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Create Sandbox button */}
            <button
              onClick={scrollToCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150"
              style={{ background: '#e0a34e', color: '#0d0d0e', border: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#eab566'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#e0a34e'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Plus size={16} />
              Create Sandbox
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors duration-100"
                style={{ background: showProfileMenu ? '#1a1a1d' : 'transparent', border: '1px solid transparent' }}
                onMouseEnter={(e) => { if (!showProfileMenu) e.currentTarget.style.background = '#1a1a1d'; }}
                onMouseLeave={(e) => { if (!showProfileMenu) e.currentTarget.style.background = 'transparent'; }}
              >
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full"
                    style={{ border: '2px solid #232326' }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: '#e0a34e', color: '#0d0d0e' }}
                  >
                    {user?.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <ChevronDown size={14} style={{ color: '#8a8a8f', transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="px-3 py-3 flex items-center gap-3">
                    {user?.photoUrl ? (
                      <img src={user.photoUrl} alt="" className="w-10 h-10 rounded-full" style={{ border: '2px solid #232326' }} referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#e0a34e', color: '#0d0d0e' }}>
                        {user?.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: '#e8e6e2' }}>{user?.displayName}</p>
                      <p className="text-xs truncate" style={{ color: '#5a5a5f' }}>{user?.email}</p>
                    </div>
                  </div>
                  <div style={{ height: '1px', background: '#232326', margin: '2px 0' }} />
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-100"
                    style={{ background: 'transparent', border: 'none', color: '#c96a5c', textAlign: 'left' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,106,92,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Dashboard Content ── */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#e8e6e2' }}>
            Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm" style={{ color: '#5a5a5f' }}>
            Manage your projects or create a new sandbox.
          </p>
        </div>

        {/* Create New Project */}
        <div ref={createRef} className="flex flex-col gap-4 p-6 rounded-xl mb-8" style={{ background: '#151517', border: '1px solid #232326' }}>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#e8e6e2' }}>
            <Plus size={14} style={{ color: '#e0a34e' }} />
            Create New Project
          </h2>
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
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} className="mr-2"/>Create & Launch</>}
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: '#e8e6e2' }}>Your Projects</h2>
            <span className="text-xs" style={{ color: '#5a5a5f' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loadingProjects ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: '#5a5a5f' }} />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl" style={{ background: '#151517', border: '1px solid #232326' }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(90,90,95,0.1)', border: '1px solid #232326' }}
              >
                <Folder size={28} style={{ color: '#3a3a3e' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium mb-1" style={{ color: '#8a8a8f' }}>No projects yet</p>
                <p className="text-xs" style={{ color: '#5a5a5f' }}>Create your first project above to get started!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project._id} className="project-card p-5 flex flex-col gap-3">
                  {/* Card header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(224,163,78,0.08)', border: '1px solid rgba(224,163,78,0.12)' }}
                      >
                        <Folder size={16} style={{ color: '#e0a34e' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: '#e8e6e2' }}>{project.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#5a5a5f' }}>
                          Updated {timeAgo(project.updatedAt || project.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={project.status || 'stopped'} />
                  </div>

                  {/* Delete confirmation */}
                  {confirmDeleteId === project._id && (
                    <div className="delete-confirm flex items-center gap-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(201,106,92,0.08)', border: '1px solid rgba(201,106,92,0.15)' }}>
                      <span style={{ color: '#c96a5c' }} className="flex-1">Delete this project? This will destroy all resources.</span>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 rounded text-xs cursor-pointer"
                        style={{ background: 'transparent', border: '1px solid #3a3a3e', color: '#8a8a8f' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => deleteProject(project._id)}
                        disabled={deletingId === project._id}
                        className="px-2 py-1 rounded text-xs font-medium cursor-pointer"
                        style={{ background: 'rgba(201,106,92,0.15)', border: '1px solid rgba(201,106,92,0.3)', color: '#c96a5c' }}
                      >
                        {deletingId === project._id ? <Loader2 size={12} className="animate-spin" /> : 'Delete'}
                      </button>
                    </div>
                  )}

                  {/* Card actions */}
                  <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid #1c1c1f' }}>
                    <button
                      onClick={() => setConfirmDeleteId(confirmDeleteId === project._id ? null : project._id)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors duration-100"
                      style={{ background: 'transparent', border: 'none', color: '#5a5a5f' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#c96a5c'; e.currentTarget.style.background = 'rgba(201,106,92,0.06)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#5a5a5f'; e.currentTarget.style.background = 'transparent'; }}
                      title="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                    <button
                      onClick={() => startSandbox(project._id)}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-wait"
                      style={{ background: 'rgba(224,163,78,0.1)', border: '1px solid rgba(224,163,78,0.2)', color: '#e0a34e' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(224,163,78,0.18)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(224,163,78,0.1)'; }}
                    >
                      {loading ? <Loader2 size={12} className="animate-spin" /> : (
                        <>
                          {project.status === 'running' ? 'Open' : 'Launch'}
                          <ArrowRight size={12} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm mt-6"
            style={{ background: 'rgba(201,106,92,0.12)', border: '1px solid rgba(201,106,92,0.25)', color: '#c96a5c' }}
          >
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded cursor-pointer"
              style={{ background: 'transparent', border: 'none', color: '#c96a5c' }}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════
export default function LandingPage({ user, onSandboxCreated, onLogout }) {
  if (!user) {
    return <PublicLanding />;
  }

  return (
    <Dashboard
      user={user}
      onSandboxCreated={onSandboxCreated}
      onLogout={onLogout}
    />
  );
}
