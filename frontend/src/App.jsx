import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Workspace from './components/Workspace';
import { Code2 } from 'lucide-react';

function App() {
  const [phase, setPhase] = useState('landing'); // 'landing' | 'workspace'
  const [sandboxId, setSandboxId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [agentToken, setAgentToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleSandboxCreated = (id, url, token) => {
    setSandboxId(id);
    setPreviewUrl(url);
    setAgentToken(token);
    setPhase('workspace');
  };

  const handleBackToLanding = () => {
    // Small delay to allow Workspace cleanup effects to run
    setTimeout(() => {
      setSandboxId(null);
      setPreviewUrl(null);
      setAgentToken(null);
      setPhase('landing');
    }, 100);
  };

  const handleLogout = async () => {
    try {
      // Navigate to logout endpoint which clears the cookie and redirects
      window.location.href = '/api/auth/logout';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Anti-flicker: show loading screen while checking auth
  if (isAuthLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(224,163,78,0.12)', border: '1px solid rgba(224,163,78,0.2)' }}
          >
            <Code2 size={32} style={{ color: '#e0a34e' }} />
          </div>
          <span className="text-lg font-semibold" style={{ color: '#e8e6e2' }}>CodeSpace</span>
        </div>
      </div>
    );
  }

  if (phase === 'workspace' && sandboxId) {
    return (
      <Workspace
        sandboxId={sandboxId}
        previewUrl={previewUrl}
        agentToken={agentToken}
        onBackToLanding={handleBackToLanding}
      />
    );
  }

  return (
    <LandingPage
      user={user}
      onSandboxCreated={handleSandboxCreated}
      onLogout={handleLogout}
    />
  );
}

export default App;
