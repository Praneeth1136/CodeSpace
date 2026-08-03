import { useState, useEffect, useCallback } from 'react';
import { FolderOpen, File, ChevronRight, ChevronDown, RefreshCw, Loader2 } from 'lucide-react';

// Map file extensions to display colors
const extColors = {
  jsx: '#6a9fc9',
  js: '#e0a34e',
  css: '#c96a5c',
  json: '#7ba98a',
  html: '#c96a5c',
  md: '#b0b0b5',
  svg: '#e0a34e',
  png: '#8a8a8f',
};

function getExtColor(name) {
  const ext = name.split('.').pop()?.toLowerCase();
  return extColors[ext] || '#8a8a8f';
}

// Convert flat file list to tree structure
function buildTree(files) {
  const root = { name: '', children: {}, isDir: true };

  for (const filePath of files) {
    const parts = filePath.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: parts.slice(0, i + 1).join('/'),
          children: {},
          isDir: !isLast,
        };
      }
      current = current.children[part];
    }
  }

  return root;
}

function TreeNode({ node, depth = 0, onFileClick, activeFile }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const children = Object.values(node.children).sort((a, b) => {
    // Directories first, then alphabetical
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return a.name.localeCompare(b.name);
  });

  if (node.isDir) {
    return (
      <div>
        {node.name && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 w-full text-left py-0.5 cursor-pointer transition-colors duration-75"
            style={{
              paddingLeft: `${depth * 14 + 8}px`,
              background: 'transparent',
              border: 'none',
              color: '#b0b0b5',
              fontSize: '12px',
              fontFamily: 'var(--font-sans)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1d'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {expanded ? <ChevronDown size={12} style={{ color: '#5a5a5f' }} /> : <ChevronRight size={12} style={{ color: '#5a5a5f' }} />}
            <FolderOpen size={13} style={{ color: '#e0a34e', opacity: 0.7 }} />
            <span className="truncate">{node.name}</span>
          </button>
        )}
        {expanded && children.map((child) => (
          <TreeNode
            key={child.path || child.name}
            node={child}
            depth={node.name ? depth + 1 : depth}
            onFileClick={onFileClick}
            activeFile={activeFile}
          />
        ))}
      </div>
    );
  }

  const isActive = activeFile === node.path;

  return (
    <button
      onClick={() => onFileClick(node.path)}
      className="flex items-center gap-1.5 w-full text-left py-0.5 cursor-pointer transition-colors duration-75"
      style={{
        paddingLeft: `${depth * 14 + 8}px`,
        background: isActive ? 'rgba(224,163,78,0.08)' : 'transparent',
        border: 'none',
        color: isActive ? '#e8e6e2' : '#8a8a8f',
        fontSize: '12px',
        fontFamily: 'var(--font-sans)',
        borderRight: isActive ? '2px solid #e0a34e' : '2px solid transparent',
      }}
      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#1a1a1d'; }}
      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      <File size={13} style={{ color: getExtColor(node.name) }} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export default function FileExplorer({ sandboxId, onFileSelect, activeFile }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    if (!sandboxId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/agent/${sandboxId}/list-files`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sandboxId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const tree = buildTree(files);

  return (
    <div className="flex flex-col h-full" style={{ background: '#151517' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 h-10 shrink-0"
        style={{ borderBottom: '1px solid #232326' }}
      >
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#5a5a5f' }}>
          Files
        </span>
        <button
          onClick={fetchFiles}
          className="p-1 rounded cursor-pointer transition-colors duration-100"
          style={{ background: 'transparent', border: 'none', color: '#5a5a5f' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#b0b0b5'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#5a5a5f'}
          title="Refresh files"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={16} className="animate-spin" style={{ color: '#5a5a5f' }} />
          </div>
        ) : error ? (
          <div className="px-3 py-4 text-center">
            <p className="text-xs mb-2" style={{ color: '#c96a5c' }}>Failed to load files</p>
            <button
              onClick={fetchFiles}
              className="text-xs px-2 py-1 rounded cursor-pointer"
              style={{ background: 'rgba(201,106,92,0.12)', border: '1px solid rgba(201,106,92,0.2)', color: '#c96a5c' }}
            >
              Retry
            </button>
          </div>
        ) : files.length === 0 ? (
          <p className="px-3 py-4 text-xs text-center" style={{ color: '#5a5a5f' }}>
            No files yet
          </p>
        ) : (
          <TreeNode node={tree} onFileClick={onFileSelect} activeFile={activeFile} />
        )}
      </div>
    </div>
  );
}
