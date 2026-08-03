import { useState, useRef } from 'react';
import { RefreshCw, ExternalLink, Loader2 } from 'lucide-react';

export default function Preview({ previewUrl }) {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = () => {
    setLoading(true);
    setError(false);
    if (iframeRef.current) {
      iframeRef.current.src = previewUrl;
    }
  };

  const openExternal = () => {
    window.open(previewUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#151517' }}>
      {/* Address bar */}
      <div
        className="flex items-center gap-2 px-3 h-10 shrink-0"
        style={{ borderBottom: '1px solid #232326' }}
      >
        <button
          onClick={reload}
          className="p-1 rounded cursor-pointer transition-colors duration-100"
          style={{ background: 'transparent', border: 'none', color: '#8a8a8f' }}
          onMouseEnter={(e) => e.target.style.color = '#e8e6e2'}
          onMouseLeave={(e) => e.target.style.color = '#8a8a8f'}
          title="Refresh preview"
        >
          <RefreshCw size={14} />
        </button>

        <div
          className="flex-1 px-3 py-1 rounded text-xs truncate select-all"
          style={{ background: '#1a1a1d', border: '1px solid #232326', color: '#8a8a8f', fontFamily: 'var(--font-mono)' }}
        >
          {previewUrl}
        </div>

        <button
          onClick={openExternal}
          className="p-1 rounded cursor-pointer transition-colors duration-100"
          style={{ background: 'transparent', border: 'none', color: '#8a8a8f' }}
          onMouseEnter={(e) => e.target.style.color = '#e8e6e2'}
          onMouseLeave={(e) => e.target.style.color = '#8a8a8f'}
          title="Open in new tab"
        >
          <ExternalLink size={14} />
        </button>
      </div>

      {/* Iframe */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: '#151517' }}>
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin" style={{ color: '#e0a34e' }} />
              <span className="text-xs" style={{ color: '#8a8a8f' }}>Loading preview…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: '#151517' }}>
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm" style={{ color: '#c96a5c' }}>Failed to load preview</span>
              <button
                onClick={reload}
                className="text-xs px-3 py-1.5 rounded cursor-pointer"
                style={{ background: 'rgba(201,106,92,0.15)', border: '1px solid rgba(201,106,92,0.25)', color: '#c96a5c' }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="w-full h-full border-0"
          style={{ background: '#fff' }}
          onLoad={() => { setLoading(false); setError(false); }}
          onError={() => { setLoading(false); setError(true); }}
          title="Sandbox Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}
