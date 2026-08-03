import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Workspace from './components/Workspace';

function App() {
  const [phase, setPhase] = useState('landing'); // 'landing' | 'workspace'
  const [sandboxId, setSandboxId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleSandboxCreated = (id, url) => {
    setSandboxId(id);
    setPreviewUrl(url);
    setPhase('workspace');
  };

  if (phase === 'workspace' && sandboxId) {
    return <Workspace sandboxId={sandboxId} previewUrl={previewUrl} />;
  }

  return <LandingPage onSandboxCreated={handleSandboxCreated} />;
}

export default App;
