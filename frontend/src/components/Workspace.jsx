import { useState, useRef, useCallback, useEffect } from 'react';
import { PanelLeftClose, PanelLeft, Copy, Check, X, ArrowLeft } from 'lucide-react';
import FileExplorer from './FileExplorer';
import ChatPanel from './ChatPanel';
import TerminalPanel from './Terminal';
import Preview from './Preview';
import { getAgentConfig } from '../utils/agentUrl';

// ── Resizable divider ──
function Divider({ direction = 'vertical', onMouseDown }) {
  const isV = direction === 'vertical';

  return (
    <div
      onMouseDown={onMouseDown}
      className="group relative shrink-0"
      style={{
        width: isV ? '1px' : '100%',
        height: isV ? '100%' : '1px',
        cursor: isV ? 'col-resize' : 'row-resize',
        background: '#232326',
        zIndex: 10,
      }}
    >
      {/* Wider invisible hit area */}
      <div
        className="absolute"
        style={{
          [isV ? 'left' : 'top']: '-3px',
          [isV ? 'right' : 'bottom']: '-3px',
          [isV ? 'width' : 'height']: '7px',
          [isV ? 'top' : 'left']: 0,
          [isV ? 'bottom' : 'right']: 0,
        }}
      />
    </div>
  );
}

// ── File tab bar ──
function FileTabs({ tabs, activeTab, onSelect, onClose }) {
  if (tabs.length === 0) return null;

  return (
    <div
      className="flex items-center h-8 shrink-0 overflow-x-auto"
      style={{ borderBottom: '1px solid #232326', background: '#151517' }}
    >
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        const name = tab.split('/').pop();
        return (
          <div
            key={tab}
            className="flex items-center gap-1.5 px-3 h-full cursor-pointer shrink-0 group"
            style={{
              borderRight: '1px solid #1c1c1f',
              background: isActive ? '#1a1a1d' : 'transparent',
              borderBottom: isActive ? '2px solid #e0a34e' : '2px solid transparent',
            }}
            onClick={() => onSelect(tab)}
          >
            <span
              className="text-xs truncate max-w-32"
              style={{ color: isActive ? '#e8e6e2' : '#8a8a8f', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
            >
              {name}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(tab); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded cursor-pointer transition-opacity duration-75"
              style={{ background: 'transparent', border: 'none', color: '#5a5a5f' }}
            >
              <X size={10} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── File content viewer ──
function FileViewer({ content, fileName }) {
  if (!content) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: '#5a5a5f' }}>
        <p className="text-xs">Select a file to view its contents</p>
      </div>
    );
  }

  return (
    <pre
      className="flex-1 overflow-auto p-4 m-0 text-xs leading-relaxed"
      style={{
        background: '#0d0d0e',
        color: '#e8e6e2',
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        tabSize: 2,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}
    >
      {content}
    </pre>
  );
}

// ── Toast notification ──
function Toast({ message, type = 'error', onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    error: { bg: 'rgba(201,106,92,0.1)', border: 'rgba(201,106,92,0.25)', text: '#c96a5c' },
    success: { bg: 'rgba(123,169,138,0.1)', border: 'rgba(123,169,138,0.25)', text: '#7ba98a' },
    info: { bg: 'rgba(106,159,201,0.1)', border: 'rgba(106,159,201,0.25)', text: '#6a9fc9' },
  };

  const c = colors[type] || colors.error;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs max-w-sm"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, animation: 'toast-in 150ms ease-out' }}
    >
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="p-0.5 rounded cursor-pointer"
        style={{ background: 'transparent', border: 'none', color: c.text }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ── Disconnect banner ──
function DisconnectBanner({ onReconnect }) {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-40 flex items-center justify-center gap-3 px-4 py-2 text-xs"
      style={{ background: 'rgba(201,106,92,0.1)', borderBottom: '1px solid rgba(201,106,92,0.2)', color: '#c96a5c' }}
    >
      <span>Sandbox disconnected</span>
      <button
        onClick={onReconnect}
        className="px-2 py-0.5 rounded text-xs font-medium cursor-pointer"
        style={{ background: 'rgba(201,106,92,0.2)', border: '1px solid rgba(201,106,92,0.3)', color: '#c96a5c' }}
      >
        Reconnect
      </button>
    </div>
  );
}

export default function Workspace({ sandboxId, previewUrl, agentToken, onBackToLanding }) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = () => {
    setIsLeaving(true);
    // Allow cleanup effects to run before transitioning
    if (onBackToLanding) onBackToLanding();
  };
  // Panel sizes (percentages)
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(40); // percentage of remaining space
  const [terminalHeight, setTerminalHeight] = useState(35); // percentage of center column

  // File state
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [fileContents, setFileContents] = useState({});

  // UI state
  const [toasts, setToasts] = useState([]);
  const [showFileViewer, setShowFileViewer] = useState(false);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef(null);

  // ── Toast helper ──
  const addToast = useCallback((message, type = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── File selection ──
  const handleFileSelect = useCallback(async (filePath) => {
    // Open tab
    setOpenTabs((prev) => prev.includes(filePath) ? prev : [...prev, filePath]);
    setActiveTab(filePath);
    setShowFileViewer(true);

    // Fetch content if not already loaded
    if (!fileContents[filePath]) {
      try {
        const config = getAgentConfig(sandboxId, agentToken);
        const res = await fetch(config.readFilesUrl(filePath), {
          headers: { 'Authorization': `Bearer ${agentToken}` }
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        // Extract content from the response
        const fileData = data.files?.[0];
        if (fileData) {
          const content = Object.values(fileData)[0];
          setFileContents((prev) => ({ ...prev, [filePath]: content }));
        }
      } catch (err) {
        addToast(`Failed to read ${filePath.split('/').pop()}: ${err.message}`);
      }
    }
  }, [sandboxId, fileContents, addToast]);

  const handleTabClose = useCallback((filePath) => {
    setOpenTabs((prev) => prev.filter((t) => t !== filePath));
    if (activeTab === filePath) {
      const remaining = openTabs.filter((t) => t !== filePath);
      setActiveTab(remaining.length > 0 ? remaining[remaining.length - 1] : null);
      if (remaining.length === 0) setShowFileViewer(false);
    }
  }, [activeTab, openTabs]);

  // ── Copy sandbox ID ──
  const copySandboxId = useCallback(() => {
    navigator.clipboard.writeText(sandboxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [sandboxId]);

  // ── Drag resize: sidebar ──
  const startSidebarResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMove = (e) => {
      const delta = e.clientX - startX;
      const newWidth = Math.max(140, Math.min(400, startWidth + delta));
      setSidebarWidth(newWidth);
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [sidebarWidth]);

  // ── Drag resize: preview width ──
  const startPreviewResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const startPercent = previewWidth;

    const onMove = (e) => {
      const delta = startX - e.clientX; // Reversed: dragging left increases preview
      const deltaPercent = (delta / containerWidth) * 100;
      const newPercent = Math.max(20, Math.min(60, startPercent + deltaPercent));
      setPreviewWidth(newPercent);
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [previewWidth]);

  // ── Drag resize: terminal height ──
  const startTerminalResize = useCallback((e) => {
    e.preventDefault();
    const startY = e.clientY;
    const container = containerRef.current;
    if (!container) return;

    const centerEl = container.querySelector('[data-center-col]');
    if (!centerEl) return;
    const centerHeight = centerEl.offsetHeight;
    const startPercent = terminalHeight;

    const onMove = (e) => {
      const delta = startY - e.clientY; // Dragging up increases terminal
      const deltaPercent = (delta / centerHeight) * 100;
      const newPercent = Math.max(15, Math.min(70, startPercent + deltaPercent));
      setTerminalHeight(newPercent);
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [terminalHeight]);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+B: toggle sidebar
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }
      // Ctrl+`: focus terminal
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        const termEl = containerRef.current?.querySelector('.xterm-helper-textarea');
        termEl?.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const effectiveSidebarWidth = sidebarCollapsed ? 0 : sidebarWidth;

  return (
    <div className="flex flex-col h-screen w-screen workspace-view" style={{ background: '#0d0d0e' }}>
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-3 h-10 shrink-0"
        style={{ borderBottom: '1px solid #232326', background: '#151517' }}
      >
        <div className="flex items-center gap-3">
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="p-1 rounded cursor-pointer transition-colors duration-100"
            style={{ background: 'transparent', border: 'none', color: '#8a8a8f' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#e8e6e2'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#8a8a8f'}
            title={sidebarCollapsed ? 'Show sidebar (Ctrl+B)' : 'Hide sidebar (Ctrl+B)'}
          >
            {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>

          <span className="text-sm font-semibold" style={{ color: '#e8e6e2', fontFamily: 'var(--font-sans)' }}>
            CodeSpace
          </span>

          {onBackToLanding && (
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer transition-colors duration-100"
              style={{ background: '#1a1a1d', border: '1px solid #232326', color: '#8a8a8f', marginLeft: '8px' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3a3a3e'; e.currentTarget.style.color = '#e8e6e2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#232326'; e.currentTarget.style.color = '#8a8a8f'; }}
              title="Back to Dashboard"
            >
              <ArrowLeft size={12} />
              Dashboard
            </button>
          )}
        </div>

        {/* Sandbox ID */}
        <button
          onClick={copySandboxId}
          className="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer transition-colors duration-100"
          style={{ background: '#1a1a1d', border: '1px solid #232326', color: '#5a5a5f', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
          title="Copy sandbox ID"
        >
          <span className="truncate max-w-48">{sandboxId}</span>
          {copied ? <Check size={11} style={{ color: '#7ba98a' }} /> : <Copy size={11} />}
        </button>
      </header>

      {/* ── Main layout ── */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        {!sidebarCollapsed && (
          <>
            <div style={{ width: `${effectiveSidebarWidth}px`, minWidth: `${effectiveSidebarWidth}px` }} className="h-full overflow-hidden">
              <FileExplorer sandboxId={sandboxId} agentToken={agentToken} onFileSelect={handleFileSelect} activeFile={activeTab} />
            </div>
            <Divider direction="vertical" onMouseDown={startSidebarResize} />
          </>
        )}

        {/* Center column: chat/file viewer + terminal */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0" data-center-col>
          {/* Top: chat + file viewer tabs */}
          <div style={{ height: `${100 - terminalHeight}%` }} className="flex flex-col overflow-hidden">
            {/* Center tab bar */}
            <div
              className="flex items-center h-8 shrink-0 overflow-x-auto"
              style={{ borderBottom: '1px solid #232326', background: '#151517' }}
            >
              {/* Chat tab (always present) */}
              <button
                onClick={() => { setActiveTab(null); setShowFileViewer(false); }}
                className="flex items-center gap-1.5 px-3 h-full cursor-pointer shrink-0"
                style={{
                  borderRight: '1px solid #1c1c1f',
                  background: !showFileViewer ? '#1a1a1d' : 'transparent',
                  borderBottom: !showFileViewer ? '2px solid #e0a34e' : '2px solid transparent',
                  border: 'none',
                  borderRight: '1px solid #1c1c1f',
                  color: !showFileViewer ? '#e0a34e' : '#8a8a8f',
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                AI Chat
              </button>

              {/* File tabs */}
              {openTabs.map((tab) => {
                const isActive = showFileViewer && tab === activeTab;
                const name = tab.split('/').pop();
                return (
                  <div
                    key={tab}
                    className="flex items-center gap-1.5 px-3 h-full cursor-pointer shrink-0 group"
                    style={{
                      borderRight: '1px solid #1c1c1f',
                      background: isActive ? '#1a1a1d' : 'transparent',
                      borderBottom: isActive ? '2px solid #e0a34e' : '2px solid transparent',
                    }}
                    onClick={() => { setActiveTab(tab); setShowFileViewer(true); }}
                  >
                    <span
                      className="text-xs truncate max-w-32"
                      style={{ color: isActive ? '#e8e6e2' : '#8a8a8f', fontFamily: 'var(--font-mono)', fontSize: '11px' }}
                    >
                      {name}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTabClose(tab); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded cursor-pointer transition-opacity duration-75"
                      style={{ background: 'transparent', border: 'none', color: '#5a5a5f' }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-hidden">
              {showFileViewer && activeTab ? (
                <FileViewer content={fileContents[activeTab]} fileName={activeTab} />
              ) : (
                <ChatPanel sandboxId={sandboxId} />
              )}
            </div>
          </div>

          <Divider direction="horizontal" onMouseDown={startTerminalResize} />

          {/* Bottom: terminal */}
          <div style={{ height: `${terminalHeight}%` }} className="overflow-hidden">
            <TerminalPanel sandboxId={sandboxId} agentToken={agentToken} />
          </div>
        </div>

        {/* Preview divider */}
        <Divider direction="vertical" onMouseDown={startPreviewResize} />

        {/* Right: preview */}
        <div style={{ width: `${previewWidth}%` }} className="h-full overflow-hidden">
          <Preview previewUrl={previewUrl} />
        </div>
      </div>

      {/* ── Toasts ── */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
