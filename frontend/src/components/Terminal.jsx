import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export default function TerminalPanel({ sandboxId }) {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const initialized = useRef(false);

  const initTerminal = useCallback(() => {
    if (!sandboxId || !terminalRef.current || initialized.current) return;
    initialized.current = true;
    let isMounted = true;

    // Create xterm instance
    const term = new XTerm({
      theme: {
        background: '#0d0d0e',
        foreground: '#e8e6e2',
        cursor: '#e0a34e',
        cursorAccent: '#0d0d0e',
        selectionBackground: 'rgba(224,163,78,0.25)',
        black: '#1a1a1d',
        red: '#c96a5c',
        green: '#7ba98a',
        yellow: '#e0a34e',
        blue: '#6a9fc9',
        magenta: '#b07cc6',
        cyan: '#6aafaf',
        white: '#e8e6e2',
        brightBlack: '#5a5a5f',
        brightRed: '#d98a7e',
        brightGreen: '#97c5a6',
        brightYellow: '#eab566',
        brightBlue: '#8ab5d9',
        brightMagenta: '#c99ad8',
        brightCyan: '#8ac5c5',
        brightWhite: '#f0eeea',
      },
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 5000,
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    

    // Delay fit slightly so the container has final dimensions
    requestAnimationFrame(() => {
      try { fitAddon.fit(); } catch {}
    });

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;
    let socket = null;

    // Spawn PTY process first with retry logic
    // (the pod might be 'Ready' before Node.js actually binds port 3000, causing 504s)
    const spawnTerminalWithRetry = async (retries = 5) => {
      for (let i = 0; i < retries; i++) {
        if (!isMounted) return false;
        try {
          const res = await fetch(`/agent/${sandboxId}/spawn?sandboxId=${sandboxId}`);
          if (res.ok) return true;
          console.warn(`Spawn attempt ${i + 1} failed with status: ${res.status}`);
        } catch (err) {
          console.warn(`Spawn attempt ${i + 1} failed: ${err.message}`);
        }
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      return false;
    };

    spawnTerminalWithRetry().then((success) => {
      if (!isMounted) return;
      if (!success) {
        term.writeln(`\x1b[31mFailed to spawn terminal after multiple attempts. Is the container fully started?\x1b[0m`);
        setError('Failed to spawn terminal');
        return;
      }
        
      // Connect socket.io through the Vite proxy
      socket = io('/', {
        path: '/socket.io-agent',
        query: { sandboxId },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        if (!isMounted) { socket.disconnect(); return; }
        setConnected(true);
        setError(null);
      });

      socket.on('disconnect', () => {
        if (isMounted) setConnected(false);
      });

      socket.on('connect_error', (err) => {
        if (isMounted) {
          setError(`Connection error: ${err.message}`);
          setConnected(false);
        }
      });

      // Receive terminal output
      socket.on('terminal-output', (data) => {
        term.write(data);
      });

      // Send terminal input
      term.onData((data) => {
        socket.emit('terminal-input', data);
      });
    });

    // Resize handling
    const handleResize = () => {
      try { fitAddon.fit(); } catch {}
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(terminalRef.current);

    // Cleanup
    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      if (socket) socket.disconnect();
      if (socketRef.current) socketRef.current.disconnect();
      term.dispose();
      initialized.current = false;
    };
  }, [sandboxId]);

  useEffect(() => {
    const cleanup = initTerminal();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initTerminal]);

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0d0e' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 h-8 shrink-0"
        style={{ borderBottom: '1px solid #232326', background: '#151517' }}
      >
        <span className="text-xs font-medium" style={{ color: '#8a8a8f', fontFamily: 'var(--font-sans)' }}>
          Terminal
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: connected ? '#7ba98a' : error ? '#c96a5c' : '#5a5a5f' }}
          />
          <span className="text-xs" style={{ color: '#5a5a5f', fontSize: '10px' }}>
            {connected ? 'connected' : error ? 'error' : 'disconnected'}
          </span>
        </div>
      </div>

      {/* Terminal container */}
      <div ref={terminalRef} className="flex-1 overflow-hidden" />

      {/* Error banner */}
      {error && (
        <div
          className="px-3 py-1.5 text-xs shrink-0"
          style={{ background: 'rgba(201,106,92,0.08)', borderTop: '1px solid rgba(201,106,92,0.2)', color: '#c96a5c' }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
