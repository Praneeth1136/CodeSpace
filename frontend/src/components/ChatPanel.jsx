import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, FileText, FileEdit, Check, AlertCircle, Sparkles, User } from 'lucide-react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Custom code theme that matches our graphite palette
const codeTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: '#1a1a1d',
    margin: 0,
    padding: '12px',
    borderRadius: '6px',
    fontSize: '12px',
    lineHeight: '1.5',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: 'transparent',
    fontSize: '12px',
  },
};

// Parse SSE status lines into structured activity items
function parseStatusLine(text) {
  if (!text || text === '(empty)') return null;

  const lower = text.toLowerCase();

  if (lower.startsWith('reading files')) {
    const files = text.replace(/^Reading files\.\.\./, '').split(',').map(f => f.trim()).filter(Boolean);
    return { type: 'reading', label: 'Reading files', files, icon: FileText, color: '#6a9fc9' };
  }
  if (lower.startsWith('files read successfully')) {
    return { type: 'read-done', label: 'Files read', icon: Check, color: '#7ba98a' };
  }
  if (lower.startsWith('updating files')) {
    const files = text.replace(/^Updating files\.\.\./, '').split(',').map(f => f.trim()).filter(Boolean);
    return { type: 'updating', label: 'Updating files', files, icon: FileEdit, color: '#e0a34e' };
  }
  if (lower.startsWith('files updated successfully')) {
    return { type: 'update-done', label: 'Files updated', icon: Check, color: '#7ba98a' };
  }

  // Fallback: treat as AI text content
  return { type: 'text', content: text };
}

function ActivityItem({ item }) {
  const Icon = item.icon;

  if (item.type === 'text') return null; // Text items rendered separately

  return (
    <div className="flex items-start gap-2 py-1">
      <Icon size={13} style={{ color: item.color, marginTop: '2px', flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium" style={{ color: item.color }}>{item.label}</span>
        {item.files && item.files.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {item.files.map((f, i) => (
              <span
                key={i}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: '#1a1a1d', color: '#8a8a8f', fontFamily: 'var(--font-mono)', fontSize: '10px' }}
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className="flex gap-2.5 py-3" style={{ borderBottom: '1px solid #1a1a1d' }}>
      {/* Avatar */}
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: isUser ? '#232326' : 'rgba(224,163,78,0.12)',
          border: `1px solid ${isUser ? '#2e2e32' : 'rgba(224,163,78,0.2)'}`,
        }}
      >
        {isUser
          ? <User size={12} style={{ color: '#8a8a8f' }} />
          : <Sparkles size={12} style={{ color: '#e0a34e' }} />
        }
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium mb-1 block" style={{ color: isUser ? '#b0b0b5' : '#e0a34e' }}>
          {isUser ? 'You' : 'CodeSpace AI'}
        </span>

        {/* User messages: plain text */}
        {isUser && (
          <p className="text-sm leading-relaxed m-0" style={{ color: '#e8e6e2' }}>{message.content}</p>
        )}

        {/* AI messages: activity feed + markdown */}
        {!isUser && (
          <div>
            {/* Activity feed */}
            {message.activities && message.activities.length > 0 && (
              <div
                className="rounded-md px-2.5 py-1.5 mb-2"
                style={{ background: '#0d0d0e', border: '1px solid #1c1c1f' }}
              >
                {message.activities.map((item, i) => (
                  <ActivityItem key={i} item={item} />
                ))}
              </div>
            )}

            {/* Markdown content */}
            {message.content && (
              <div className="prose-sm" style={{ color: '#e8e6e2', fontSize: '13px', lineHeight: '1.6' }}>
                <Markdown
                  components={{
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={codeTheme}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className={className}
                          style={{
                            background: '#1a1a1d',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            fontFamily: 'var(--font-mono)',
                            color: '#e0a34e',
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    p({ children }) {
                      return <p style={{ margin: '4px 0', color: '#e8e6e2' }}>{children}</p>;
                    },
                    a({ children, href }) {
                      return <a href={href} target="_blank" rel="noopener" style={{ color: '#6a9fc9' }}>{children}</a>;
                    },
                  }}
                >
                  {message.content}
                </Markdown>
              </div>
            )}

            {/* Loading indicator */}
            {message.loading && (
              <div className="flex items-center gap-2 mt-1">
                <Loader2 size={12} className="animate-spin" style={{ color: '#e0a34e' }} />
                <span className="text-xs" style={{ color: '#5a5a5f' }}>Thinking…</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPanel({ sandboxId, agentToken }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMessage = { role: 'user', content: text };
    const aiMessage = { role: 'ai', content: '', activities: [], loading: true };

    setMessages((prev) => [...prev, userMessage, aiMessage]);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/ai/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sandboxId, agentToken }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let textContent = '';
      const activities = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const chunk = JSON.parse(raw);

            // Handle different LangChain event types
            if (chunk.event === 'on_chat_model_stream') {
              const token = chunk.data?.chunk?.content;
              if (token) {
                textContent += token;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  updated[updated.length - 1] = { ...last, content: textContent };
                  return updated;
                });
              }
            } else if (chunk.event === 'on_tool_start') {
              const toolName = chunk.name || '';
              const toolInput = chunk.data?.input || {};
              let activity = null;

              if (toolName === 'read_files' || toolName === 'list_files') {
                const files = toolInput.files || [];
                activity = { type: 'reading', label: `Reading files`, files, icon: FileText, color: '#6a9fc9' };
              } else if (toolName === 'update_files' || toolName === 'create_files') {
                const files = (toolInput.updates || toolInput.file || []).map(f => f.file || f).filter(Boolean);
                activity = { type: 'updating', label: `Updating files`, files, icon: FileEdit, color: '#e0a34e' };
              }

              if (activity) {
                activities.push(activity);
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  updated[updated.length - 1] = { ...last, activities: [...activities] };
                  return updated;
                });
              }
            } else if (chunk.event === 'on_tool_end') {
              const toolName = chunk.name || '';
              let doneActivity = null;

              if (toolName === 'read_files' || toolName === 'list_files') {
                doneActivity = { type: 'read-done', label: 'Files read', icon: Check, color: '#7ba98a' };
              } else if (toolName === 'update_files' || toolName === 'create_files') {
                doneActivity = { type: 'update-done', label: 'Files updated', icon: Check, color: '#7ba98a' };
              }

              if (doneActivity) {
                activities.push(doneActivity);
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  updated[updated.length - 1] = { ...last, activities: [...activities] };
                  return updated;
                });
              }
            }
          } catch {
            // Non-JSON SSE line — try parsing as status text
            const parsed = parseStatusLine(raw);
            if (parsed && parsed.type !== 'text') {
              activities.push(parsed);
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, activities: [...activities] };
                return updated;
              });
            } else if (parsed && parsed.type === 'text') {
              textContent += parsed.content + '\n';
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, content: textContent };
                return updated;
              });
            }
          }
        }
      }

      // Finalize: mark loading done
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, loading: false };
        return updated;
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...last,
          loading: false,
          content: '',
          activities: [{ type: 'error', label: `Error: ${err.message}`, icon: AlertCircle, color: '#c96a5c' }],
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#151517' }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Sparkles size={24} style={{ color: '#3a3a3e' }} />
            <p className="text-xs text-center" style={{ color: '#5a5a5f', maxWidth: '260px' }}>
              Describe what you'd like to build and the AI will generate the code in your sandbox.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 pb-3 pt-2" style={{ borderTop: '1px solid #232326' }}>
        <div
          className="flex items-end gap-2 rounded-lg px-3 py-2"
          style={{ background: '#1a1a1d', border: '1px solid #232326' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build…"
            rows={1}
            className="flex-1 resize-none bg-transparent border-none outline-none text-sm"
            style={{
              color: '#e8e6e2',
              fontFamily: 'var(--font-sans)',
              maxHeight: '120px',
              lineHeight: '1.5',
            }}
            disabled={streaming}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="p-1.5 rounded-md cursor-pointer transition-all duration-100 shrink-0"
            style={{
              background: input.trim() && !streaming ? '#e0a34e' : '#232326',
              border: 'none',
              color: input.trim() && !streaming ? '#0d0d0e' : '#5a5a5f',
            }}
          >
            {streaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
