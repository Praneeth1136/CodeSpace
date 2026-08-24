import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Loader2, Sparkles, Terminal, Code2, Eye, Plus, Folder,
  Trash2, LogOut, ChevronDown, ArrowRight, Zap, Layers, Globe,
  X, Shield, Clock, Cpu
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
  return `${Math.floor(days / 30)}mo ago`;
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

// ── Status badge ──
function StatusBadge({ status }) {
  const config = {
    running: { label: 'Running', dotColor: '#7ba98a', className: 'status-running', pulse: true },
    waking: { label: 'Waking Up', dotColor: '#d4a843', className: 'status-waking', pulse: false },
    stopped: { label: 'Stopped', dotColor: '#5a5a5f', className: 'status-stopped', pulse: false },
  };
  const c = config[status] || config.stopped;
  return (
    <span className={`status-badge ${c.className}`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.pulse ? 'status-dot-running' : ''}`} style={{ background: c.dotColor }} />
      {c.label}
    </span>
  );
}


// ═══════════════════════════════════════════
//  TYPEWRITER HOOK
// ═══════════════════════════════════════════
function useTypewriter(words, typingSpeed = 80, deletingSpeed = 40, pauseTime = 2000) {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;

    if (!isDeleting && text === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), pauseTime);
    } else if (isDeleting && text === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, isDeleting ? text.length - 1 : text.length + 1));
      }, isDeleting ? deletingSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return text;
}


// ═══════════════════════════════════════════
//  SCROLL-TRIGGERED VISIBILITY HOOK
// ═══════════════════════════════════════════
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}


// ═══════════════════════════════════════════
//  ANIMATED CODE EDITOR MOCKUP
// ═══════════════════════════════════════════
function CodeEditorMockup() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [sectionRef, visible] = useScrollReveal(0.3);

  const codeLines = [
    { indent: 0, tokens: [{ text: 'import ', color: '#c586c0' }, { text: '{ useState }', color: '#9cdcfe' }, { text: ' from ', color: '#c586c0' }, { text: "'react'", color: '#ce9178' }] },
    { indent: 0, tokens: [] },
    { indent: 0, tokens: [{ text: 'function ', color: '#c586c0' }, { text: 'App', color: '#dcdcaa' }, { text: '() {', color: '#e8e6e2' }] },
    { indent: 1, tokens: [{ text: 'const ', color: '#569cd6' }, { text: '[count, setCount]', color: '#9cdcfe' }, { text: ' = ', color: '#e8e6e2' }, { text: 'useState', color: '#dcdcaa' }, { text: '(', color: '#e8e6e2' }, { text: '0', color: '#b5cea8' }, { text: ')', color: '#e8e6e2' }] },
    { indent: 1, tokens: [] },
    { indent: 1, tokens: [{ text: 'return ', color: '#c586c0' }, { text: '(', color: '#e8e6e2' }] },
    { indent: 2, tokens: [{ text: '<', color: '#808080' }, { text: 'div', color: '#569cd6' }, { text: ' className=', color: '#9cdcfe' }, { text: '"app"', color: '#ce9178' }, { text: '>', color: '#808080' }] },
    { indent: 3, tokens: [{ text: '<', color: '#808080' }, { text: 'h1', color: '#569cd6' }, { text: '>', color: '#808080' }, { text: 'Count: {count}', color: '#e8e6e2' }, { text: '</', color: '#808080' }, { text: 'h1', color: '#569cd6' }, { text: '>', color: '#808080' }] },
    { indent: 3, tokens: [{ text: '<', color: '#808080' }, { text: 'button', color: '#569cd6' }, { text: ' onClick=', color: '#9cdcfe' }, { text: '{() => ', color: '#e8e6e2' }, { text: 'setCount', color: '#dcdcaa' }, { text: '(c => c + 1)}', color: '#e8e6e2' }, { text: '>', color: '#808080' }] },
    { indent: 4, tokens: [{ text: 'Increment', color: '#e8e6e2' }] },
    { indent: 3, tokens: [{ text: '</', color: '#808080' }, { text: 'button', color: '#569cd6' }, { text: '>', color: '#808080' }] },
    { indent: 2, tokens: [{ text: '</', color: '#808080' }, { text: 'div', color: '#569cd6' }, { text: '>', color: '#808080' }] },
    { indent: 1, tokens: [{ text: ')', color: '#e8e6e2' }] },
    { indent: 0, tokens: [{ text: '}', color: '#e8e6e2' }] },
  ];

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= codeLines.length) { clearInterval(interval); return prev; }
        return prev + 1;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [visible, codeLines.length]);

  return (
    <div ref={sectionRef} className="code-mockup max-w-lg w-full mx-auto">
      {/* Title bar */}
      <div className="code-mockup-header">
        <div className="code-mockup-dot" style={{ background: '#ff5f57' }} />
        <div className="code-mockup-dot" style={{ background: '#ffbd2e' }} />
        <div className="code-mockup-dot" style={{ background: '#28c840' }} />
        <span className="ml-3 text-xs" style={{ color: '#5a5a5f', fontFamily: 'var(--font-mono)' }}>App.jsx</span>
      </div>
      {/* Code body */}
      <div className="p-5 overflow-hidden" style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: '1.7' }}>
        {codeLines.slice(0, visibleLines).map((line, i) => (
          <div key={i} className="code-line" style={{ paddingLeft: `${line.indent * 20}px`, animationDelay: `${i * 0.05}s`, minHeight: '1.7em' }}>
            {line.tokens.length === 0 ? '\u00A0' : line.tokens.map((token, j) => (
              <span key={j} style={{ color: token.color }}>{token.text}</span>
            ))}
          </div>
        ))}
        {visibleLines < codeLines.length && visibleLines > 0 && (
          <span className="typewriter-cursor" />
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════
//  PUBLIC LANDING PAGE
// ═══════════════════════════════════════════
function PublicLanding() {
  const heroRef = useRef(null);
  const spotlightRef = useRef(null);
  const [navScrolled, setNavScrolled] = useState(false);

  const typedWord = useTypewriter(
    ['web apps', 'REST APIs', 'landing pages', 'dashboards', 'components'],
    90, 50, 1800
  );

  // ── Mouse spotlight effect ──
  useEffect(() => {
    const handleMouse = (e) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // ── Navbar scroll effect ──
  useEffect(() => {
    const handleScroll = (e) => {
      setNavScrolled(e.target.scrollTop > 40);
    };
    const landingEl = document.querySelector('.landing-view');
    if (landingEl) landingEl.addEventListener('scroll', handleScroll);
    return () => { if (landingEl) landingEl.removeEventListener('scroll', handleScroll); };
  }, []);

  // ── Scroll reveal hooks ──
  const [featRef, featVisible] = useScrollReveal(0.1);
  const [stepsRef, stepsVisible] = useScrollReveal(0.1);
  const [statsRef, statsVisible] = useScrollReveal(0.2);
  const [ctaRef, ctaVisible] = useScrollReveal(0.2);

  const features = [
    {
      icon: Sparkles, title: 'AI Code Generation',
      desc: 'Describe what you want in plain English. The AI writes production-ready React, HTML, CSS with proper structure and best practices.',
      detail: 'Powered by advanced LLMs'
    },
    {
      icon: Terminal, title: 'Live Terminal',
      desc: 'Full terminal access to your sandboxed K8s environment. Install packages, run scripts, and debug — all in real time.',
      detail: 'Isolated containers'
    },
    {
      icon: Eye, title: 'Instant Preview',
      desc: 'See changes live as they happen. Every code update is immediately hot-reloaded into a dedicated preview panel.',
      detail: 'Zero-config HMR'
    },
  ];

  const steps = [
    { num: '1', icon: Globe, title: 'Sign In', desc: 'One-click Google authentication. Your projects are encrypted and tied to your account.' },
    { num: '2', icon: Layers, title: 'Create a Project', desc: 'Name your project. CodeSpace spins up an isolated Kubernetes pod in seconds.' },
    { num: '3', icon: Sparkles, title: 'Describe & Build', desc: 'Tell the AI what to build. Watch it write code, install packages, and preview live.' },
  ];

  return (
    <div className="landing-view" style={{ background: '#0d0d0e' }}>
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* ── Navbar ── */}
      <nav className={`landing-nav ${navScrolled ? 'scrolled' : ''}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(224,163,78,0.12)', border: '1px solid rgba(224,163,78,0.2)' }}>
              <Code2 size={18} style={{ color: '#e0a34e' }} />
            </div>
            <span className="text-lg font-semibold" style={{ color: '#e8e6e2' }}>CodeSpace</span>
          </div>
          <a href="/api/auth/google" className="google-btn google-btn-outline" style={{ padding: '8px 20px', fontSize: '13px' }}>
            <GoogleIcon size={15} />
            Sign in
          </a>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden" style={{ background: '#0d0d0e' }}>
        {/* Background effects */}
        <div className="dot-grid" />
        <div ref={spotlightRef} className="hero-spotlight" />

        {/* Beam lines */}
        <div className="beam-line" style={{ left: '15%', '--beam-duration': '7s', '--beam-delay': '0s' }} />
        <div className="beam-line" style={{ left: '45%', '--beam-duration': '9s', '--beam-delay': '2s' }} />
        <div className="beam-line" style={{ left: '75%', '--beam-duration': '8s', '--beam-delay': '4s' }} />
        <div className="beam-line" style={{ left: '30%', '--beam-duration': '11s', '--beam-delay': '1s' }} />
        <div className="beam-line" style={{ left: '85%', '--beam-duration': '10s', '--beam-delay': '3s' }} />

        {/* Orbit rings */}
        <div className="orbit-ring" style={{ width: '500px', height: '500px', top: 'calc(50% - 250px)', left: 'calc(50% - 250px)', borderColor: 'rgba(224,163,78,0.04)', '--orbit-duration': '40s' }} />
        <div className="orbit-ring" style={{ width: '700px', height: '700px', top: 'calc(50% - 350px)', left: 'calc(50% - 350px)', borderColor: 'rgba(106,159,201,0.03)', '--orbit-duration': '55s', animationDirection: 'reverse' }} />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-8">
          {/* Badge */}
          <div className="animate-fade-in-up animate-delay-1 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase" style={{ background: 'rgba(224,163,78,0.06)', border: '1px solid rgba(224,163,78,0.12)', color: '#e0a34e' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#e0a34e', boxShadow: '0 0 8px rgba(224,163,78,0.5)' }} />
            AI-Powered Cloud IDE
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up animate-delay-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.95]" style={{ color: '#e8e6e2' }}>
            Build
            <span className="gradient-text"> {typedWord}</span>
            <span className="typewriter-cursor" />
            <br />
            <span style={{ color: '#5a5a5f', fontSize: '0.65em', fontWeight: 600 }}>with AI by your side</span>
          </h1>

          {/* Subtext */}
          <p className="animate-fade-in-up animate-delay-3 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed" style={{ color: '#6a6a70' }}>
            Spin up an isolated sandbox in seconds. Describe what you want to build.
            <br className="hidden sm:block" />
            Watch CodeSpace generate, preview, and refine your code — in real time.
          </p>

          {/* CTA */}
          <div className="animate-fade-in-up animate-delay-4 flex flex-col sm:flex-row items-center gap-4 mt-2">
            <a href="/api/auth/google" className="google-btn google-btn-primary cta-glow" style={{ padding: '14px 32px', fontSize: '15px', borderRadius: '14px' }}>
              <GoogleIcon size={18} />
              Start Building — Free
              <ArrowRight size={16} />
            </a>
            <span className="text-xs" style={{ color: '#3a3a3e' }}>No credit card required</span>
          </div>

          {/* Trust pills */}
          <div className="animate-fade-in-up animate-delay-5 flex gap-6 flex-wrap justify-center mt-4">
            {[
              { icon: Shield, label: 'Isolated Sandboxes' },
              { icon: Cpu, label: 'Kubernetes Powered' },
              { icon: Clock, label: 'Real-time Preview' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs" style={{ color: '#4a4a4f' }}>
                <Icon size={13} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CODE EDITOR DEMO ══════════════ */}
      <section className="py-20 px-6 section-fade-top" style={{ background: '#0a0a0b' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#e0a34e' }}>See it in action</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#e8e6e2' }}>
              AI writes code. You watch it happen.
            </h2>
          </div>
          <CodeEditorMockup />
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section ref={featRef} className="py-28 px-6" style={{ background: '#0d0d0e' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#e0a34e' }}>Features</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#e8e6e2' }}>
              Everything you need to build
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#5a5a5f' }}>
              A complete development environment in your browser. No setup, no config.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, detail }, i) => (
              <div
                key={title}
                className="feature-card"
                style={{
                  opacity: featVisible ? 1 : 0,
                  transform: featVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: `opacity 0.6s ease ${i * 0.15}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.15}s`,
                }}
              >
                <div className="feature-card-inner flex flex-col gap-5">
                  <div className="feature-icon-wrap">
                    <Icon size={24} style={{ color: '#e0a34e' }} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2" style={{ color: '#e8e6e2' }}>{title}</h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: '#6a6a70' }}>{desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md" style={{ background: 'rgba(224,163,78,0.06)', color: '#e0a34e' }}>
                      <Zap size={10} /> {detail}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section ref={statsRef} className="py-16 px-6" style={{ background: '#0a0a0b', borderTop: '1px solid #141416', borderBottom: '1px solid #141416' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '< 30s', label: 'Sandbox Spin-Up' },
            { value: '100%', label: 'Isolated Pods' },
            { value: 'Real-time', label: 'Code Preview' },
            { value: '∞', label: 'Possibilities' },
          ].map(({ value, label }, i) => (
            <div
              key={label}
              className="stat-card"
              style={{
                opacity: statsVisible ? 1 : 0,
                transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s ease ${i * 0.1}s`,
              }}
            >
              <div className="stat-number">{value}</div>
              <p className="text-xs mt-2" style={{ color: '#5a5a5f' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section ref={stepsRef} className="py-28 px-6" style={{ background: '#0d0d0e' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: '#e0a34e' }}>How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#e8e6e2' }}>
              Idea to running app in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map(({ num, icon: Icon, title, desc }, i) => (
              <div
                key={num}
                className="step-card relative flex flex-col items-center text-center gap-5"
                style={{
                  opacity: stepsVisible ? 1 : 0,
                  transform: stepsVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.2}s`,
                }}
              >
                {i < 2 && <div className="step-connector-line hidden md:block" style={{ transform: stepsVisible ? 'scaleX(1)' : 'scaleX(0)', transition: `transform 0.8s ease ${0.6 + i * 0.3}s` }} />}
                <div className="step-number">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: '#e8e6e2' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5a5a5f' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA SECTION ══════════════ */}
      <section ref={ctaRef} className="py-28 px-6" style={{ background: '#0a0a0b' }}>
        <div
          className="max-w-3xl mx-auto text-center p-14 rounded-3xl relative overflow-hidden"
          style={{
            background: '#111113',
            border: '1px solid #1c1c1f',
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'scale(1)' : 'scale(0.95)',
            transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Ambient glow */}
          <div style={{ position: 'absolute', top: '-50%', left: '20%', width: '300px', height: '300px', background: 'rgba(224,163,78,0.04)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40%', right: '15%', width: '250px', height: '250px', background: 'rgba(106,159,201,0.03)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#e8e6e2' }}>
              Ready to build something?
            </h2>
            <p className="text-base mb-8 max-w-md mx-auto" style={{ color: '#5a5a5f' }}>
              Sign in and launch your first project in under a minute. Completely free.
            </p>
            <a href="/api/auth/google" className="google-btn google-btn-primary cta-glow" style={{ padding: '14px 32px', fontSize: '15px', borderRadius: '14px' }}>
              <GoogleIcon size={18} />
              Get Started Now
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="py-8 px-6" style={{ borderTop: '1px solid #141416', background: '#0a0a0b' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Code2 size={15} style={{ color: '#e0a34e' }} />
            <span className="text-sm font-medium" style={{ color: '#3a3a3e' }}>CodeSpace</span>
          </div>
          <span className="text-xs" style={{ color: '#2a2a2e' }}>
            © {new Date().getFullYear()} CodeSpace. Built with Kubernetes & AI.
          </span>
        </div>
      </footer>
    </div>
  );
}


// ═══════════════════════════════════════════
//  DASHBOARD (Authenticated)
// ═══════════════════════════════════════════
function Dashboard({ user, onSandboxCreated, onLogout }) {
  const [startingId, setStartingId] = useState(null); // Tracks which sandbox is starting ('new' for creation, or projectId)
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const profileRef = useRef(null);
  const createRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { fetchProjects(); }, []);

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
    setStartingId(projectId);
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
      setStartingId(null);
    }
  };

  const createAndStartSandbox = async () => {
    if (!newProjectTitle.trim()) { setError('Please enter a project title'); return; }
    setStartingId('new');
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
      await startSandbox(projectData.project._id);
    } catch (err) {
      setError(err.message || 'Failed to create sandbox');
      setStartingId(null);
    }
  };

  const deleteProject = async (projectId) => {
    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/sandbox/project/${projectId}`, { method: 'DELETE', credentials: 'include' });
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
    setTimeout(() => createRef.current?.querySelector('input')?.focus(), 400);
  };

  return (
    <div className="landing-view min-h-screen" style={{ background: '#0d0d0e' }}>

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(224,163,78,0.12)', border: '1px solid rgba(224,163,78,0.2)' }}>
              <Code2 size={18} style={{ color: '#e0a34e' }} />
            </div>
            <span className="text-lg font-semibold" style={{ color: '#e8e6e2' }}>CodeSpace</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={scrollToCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-150"
              style={{ background: '#e0a34e', color: '#0d0d0e', border: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#eab566'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#e0a34e'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <Plus size={16} /> Create Sandbox
            </button>

            <div className="relative" ref={profileRef}>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors duration-100"
                style={{ background: showProfileMenu ? '#1a1a1d' : 'transparent', border: '1px solid transparent' }}
                onMouseEnter={(e) => { if (!showProfileMenu) e.currentTarget.style.background = '#1a1a1d'; }}
                onMouseLeave={(e) => { if (!showProfileMenu) e.currentTarget.style.background = 'transparent'; }}
              >
                {user?.photoUrl ? (
                  <img src={user.photoUrl} alt={user.displayName} className="w-8 h-8 rounded-full" style={{ border: '2px solid #232326' }} referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#e0a34e', color: '#0d0d0e' }}>
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
                  <button onClick={onLogout}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-100"
                    style={{ background: 'transparent', border: 'none', color: '#c96a5c', textAlign: 'left' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(201,106,92,0.08)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Dashboard Content ── */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-10">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#e8e6e2' }}>
            Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm" style={{ color: '#5a5a5f' }}>Manage your projects or create a new sandbox.</p>
        </div>

        {/* Create */}
        <div ref={createRef} className="flex flex-col gap-4 p-6 rounded-xl mb-8" style={{ background: '#151517', border: '1px solid #232326' }}>
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#e8e6e2' }}>
            <Plus size={14} style={{ color: '#e0a34e' }} /> Create New Project
          </h2>
          <div className="flex gap-3">
            <input
              type="text" placeholder="Project title (e.g., React Todo App)"
              value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createAndStartSandbox(); }}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{ background: '#0d0d0e', border: '1px solid #2a2a2e', color: '#e8e6e2' }}
              disabled={startingId !== null}
            />
            <button onClick={createAndStartSandbox} disabled={startingId !== null}
              className="flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-120 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
              style={{ background: '#e0a34e', color: '#0d0d0e', border: 'none' }}
            >
              {startingId === 'new' ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} className="mr-2"/>Create & Launch</>}
            </button>
          </div>
        </div>

        {/* Projects */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: '#e8e6e2' }}>Your Projects</h2>
            <span className="text-xs" style={{ color: '#5a5a5f' }}>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
          </div>

          {loadingProjects ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: '#5a5a5f' }} />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-xl" style={{ background: '#151517', border: '1px solid #232326' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(90,90,95,0.1)', border: '1px solid #232326' }}>
                <Folder size={28} style={{ color: '#3a3a3e' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#8a8a8f' }}>No projects yet</p>
              <p className="text-xs" style={{ color: '#5a5a5f' }}>Create your first project above to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <div key={project._id} className="project-card p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(224,163,78,0.08)', border: '1px solid rgba(224,163,78,0.12)' }}>
                        <Folder size={16} style={{ color: '#e0a34e' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: '#e8e6e2' }}>{project.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#5a5a5f' }}>Updated {timeAgo(project.updatedAt || project.createdAt || new Date())}</p>
                      </div>
                    </div>
                    <StatusBadge status={project.status || 'stopped'} />
                  </div>

                  {confirmDeleteId === project._id && (
                    <div className="delete-confirm flex items-center gap-2 p-3 rounded-lg text-xs" style={{ background: 'rgba(201,106,92,0.08)', border: '1px solid rgba(201,106,92,0.15)' }}>
                      <span style={{ color: '#c96a5c' }} className="flex-1">Delete this project? All resources will be destroyed.</span>
                      <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-1 rounded text-xs cursor-pointer" style={{ background: 'transparent', border: '1px solid #3a3a3e', color: '#8a8a8f' }}>Cancel</button>
                      <button onClick={() => deleteProject(project._id)} disabled={deletingId === project._id} className="px-2 py-1 rounded text-xs font-medium cursor-pointer" style={{ background: 'rgba(201,106,92,0.15)', border: '1px solid rgba(201,106,92,0.3)', color: '#c96a5c' }}>
                        {deletingId === project._id ? <Loader2 size={12} className="animate-spin" /> : 'Delete'}
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid #1c1c1f' }}>
                    <button onClick={() => setConfirmDeleteId(confirmDeleteId === project._id ? null : project._id)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors duration-100"
                      style={{ background: 'transparent', border: 'none', color: '#5a5a5f' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#c96a5c'; e.currentTarget.style.background = 'rgba(201,106,92,0.06)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#5a5a5f'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Trash2 size={13} />
                    </button>
                    <button onClick={() => startSandbox(project._id)} disabled={startingId !== null}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-wait"
                      style={{ background: 'rgba(224,163,78,0.1)', border: '1px solid rgba(224,163,78,0.2)', color: '#e0a34e' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(224,163,78,0.18)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(224,163,78,0.1)'}
                    >
                      {startingId === project._id ? <Loader2 size={12} className="animate-spin" /> : <>{project.status === 'running' ? 'Open' : 'Launch'}<ArrowRight size={12} /></>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm mt-6" style={{ background: 'rgba(201,106,92,0.12)', border: '1px solid rgba(201,106,92,0.25)', color: '#c96a5c' }}>
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="p-1 rounded cursor-pointer" style={{ background: 'transparent', border: 'none', color: '#c96a5c' }}><X size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════
export default function LandingPage({ user, onSandboxCreated, onLogout }) {
  if (!user) return <PublicLanding />;
  return <Dashboard user={user} onSandboxCreated={onSandboxCreated} onLogout={onLogout} />;
}
