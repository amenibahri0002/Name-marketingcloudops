import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const T = {
  gold:   '#f5a623',
  goldDk: '#d4881a',
  bg:     '#080c14',
  bg2:    '#0d1420',
  card:   '#141c2e',
  border: 'rgba(255,255,255,0.07)',
  blue:   '#4f8ef7',
  blueLt: '#60a5fa',
  purple: '#7c3aed',
  purpleLt: '#a78bfa',
  green:  '#10b981',
  greenLt: '#34d399',
  red:    '#ef4444',
  white:  '#ffffff',
  gray:   'rgba(255,255,255,0.5)',
  font:   "'Inter','DM Sans',sans-serif",
};

const TYPE_CFG = {
  email: { label: 'Email', icon: '✉', color: T.blue  },
  sms:   { label: 'SMS',   icon: '💬', color: T.green },
  push:  { label: 'Push',  icon: '🔔', color: T.gold  },
};

const CAMP_IMGS = {
  email: 'https://images.unsplash.com/photo-1596526131083-e8c633964948?w=600&q=80',
  sms:   'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
  push:  'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80',
};

/* ══════════════════════════════════════════════════════════════
   AURORA BACKGROUND
══════════════════════════════════════════════════════════════ */
function AuroraBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let t = 0;
    let frameId;

    const orbs = [
      { baseX: 0.15, baseY: 0.25, rx: 0.20, ry: 0.15, freq: 0.22, phase: 0.00, r: 750, color: [79,  142, 247], alpha: 0.38 },
      { baseX: 0.85, baseY: 0.15, rx: 0.16, ry: 0.12, freq: 0.17, phase: 1.10, r: 700, color: [124,  58, 237], alpha: 0.35 },
      { baseX: 0.50, baseY: 0.60, rx: 0.22, ry: 0.18, freq: 0.13, phase: 2.20, r: 800, color: [245, 166,  35], alpha: 0.22 },
      { baseX: 0.80, baseY: 0.78, rx: 0.18, ry: 0.14, freq: 0.19, phase: 3.50, r: 720, color: [ 16, 185, 129], alpha: 0.28 },
      { baseX: 0.20, baseY: 0.75, rx: 0.16, ry: 0.12, freq: 0.25, phase: 4.80, r: 650, color: [124,  58, 237], alpha: 0.30 },
      { baseX: 0.65, baseY: 0.20, rx: 0.14, ry: 0.10, freq: 0.30, phase: 0.70, r: 600, color: [ 79, 142, 247], alpha: 0.32 },
      { baseX: 0.35, baseY: 0.45, rx: 0.18, ry: 0.14, freq: 0.18, phase: 5.50, r: 680, color: [160,  60, 255], alpha: 0.25 },
    ];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.018)';
      ctx.lineWidth = 0.5;
      const step = 50;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();

      orbs.forEach(o => {
        const cx = (o.baseX + Math.sin(t * o.freq + o.phase) * o.rx) * W;
        const cy = (o.baseY + Math.cos(t * o.freq * 0.7 + o.phase + 1) * o.ry) * H;
        const radius = o.r * (1 + Math.sin(t * o.freq * 1.3 + o.phase) * 0.10);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0,    `rgba(${o.color.join(',')},${o.alpha})`);
        grad.addColorStop(0.25, `rgba(${o.color.join(',')},${(o.alpha * 0.6).toFixed(3)})`);
        grad.addColorStop(0.55, `rgba(${o.color.join(',')},${(o.alpha * 0.2).toFixed(3)})`);
        grad.addColorStop(1,    `rgba(${o.color.join(',')},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });

      t += 0.008;
      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none', display: 'block',
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════════════
   AI CHATBOT
══════════════════════════════════════════════════════════════ */
function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const SYSTEM = `Tu es l'assistant IA de DigiPip...`;

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{
        role: 'assistant',
        content: "Bonjour 👋 Je suis l'assistant IA de **DigiPip**. Comment puis-je vous aider ?\n\nJe peux vous renseigner sur nos fonctionnalités **Marketing**, **Cloud** et **DevOps**.",
      }]);
    }
  }, [open, msgs.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, loading]);

  const sendMessage = useCallback(async (textOverride = null) => {
    const text = textOverride || input.trim();
    if (!text || loading) return;
    if (!textOverride) setInput('');
    const userMsg = { role: 'user', content: text };
    setMsgs(prev => [...prev, userMsg]);
    const newHistory = [...history, { role: 'user', content: text }];
    setHistory(newHistory);
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'https://marketingcloudops-backend.onrender.com'}/api/chat`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: newHistory }) }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const reply = data.reply || "Désolé, je n'ai pas pu traiter votre demande.";
      setMsgs(prev => [...prev, { role: 'assistant', content: reply }]);
      setHistory(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMsgs(prev => [...prev, { role: 'assistant', content: "⚠️ Service temporairement indisponible." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, loading, history]);

  const formatMsg = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

  const SUGGESTIONS = [
    "C'est quoi DigiPip ?",
    "Comment fonctionne le CI/CD ?",
    "Quels canaux marketing ?",
    "Comment accéder à la plateforme ?",
  ];

  const handleReset = () => { setMsgs([]); setHistory([]); };

  return (
    <>
      <style>{`
        @keyframes chatIn { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:none; } }
        @keyframes pulse2 { 0%,100% { box-shadow:0 0 0 0 rgba(245,166,35,0.4); } 50% { box-shadow:0 0 0 10px rgba(245,166,35,0); } }
        @keyframes typing { 0%,80%,100% { transform:scale(0); opacity:0.3; } 40% { transform:scale(1); opacity:1; } }
        .chat-bubble-user { background:${T.gold}; color:#111; border-radius:18px 18px 4px 18px; }
        .chat-bubble-bot { background:rgba(255,255,255,0.06); color:${T.white}; border-radius:18px 18px 18px 4px; border:1px solid rgba(255,255,255,0.08); }
        .sugg-btn:hover { background:rgba(245,166,35,0.15) !important; border-color:rgba(245,166,35,0.4) !important; color:${T.gold} !important; }
        .chat-input:focus { outline:none; border-color:rgba(245,166,35,0.4) !important; box-shadow:0 0 0 3px rgba(245,166,35,0.08); }
        .send-btn:hover { background:${T.goldDk} !important; }
        .send-btn:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>

      <button onClick={() => setOpen(o => !o)} style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 9000,
        width: 60, height: 60, borderRadius: '50%',
        background: open ? '#333' : T.gold, border: 'none', cursor: 'pointer',
        fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 28px rgba(245,166,35,0.4)', transition: 'all 0.25s',
        animation: !open ? 'pulse2 2.5s infinite' : 'none',
      }} title="Assistant IA DigiPip" aria-label="Ouvrir le chatbot IA">
        {open ? '✕' : '🤖'}
      </button>

      {!open && (
        <div style={{
          position: 'fixed', bottom: 78, right: 28, zIndex: 9001,
          width: 14, height: 14, borderRadius: '50%',
          background: '#ef4444', border: '2px solid #080c14',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>1</span>
        </div>
      )}

      {open && (
        <div style={{
          position: 'fixed', bottom: 100, right: 28, zIndex: 9000,
          width: 380, maxHeight: 'calc(100vh - 120px)',
          background: '#0d1420', border: `1px solid rgba(245,166,35,0.2)`,
          borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'chatIn 0.3s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: T.font,
        }}>
          <div style={{
            padding: '16px 20px', background: 'linear-gradient(135deg, #141c2e, #0d1420)',
            borderBottom: `1px solid rgba(255,255,255,0.06)`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: T.green, border: '2px solid #0d1420', boxShadow: `0 0 6px ${T.green}` }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.white }}>Assistant DigiPip</div>
              <div style={{ fontSize: 11, color: T.green, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, display: 'inline-block' }} />
                En ligne · Propulsé par Claude IA
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={handleReset} title="Réinitialiser" style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', color: T.gray, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↺</button>
              <button onClick={() => setOpen(false)} title="Fermer" style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', color: T.gray, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, scrollbarWidth: 'thin', scrollbarColor: 'rgba(245,166,35,0.2) transparent' }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                {m.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🤖</div>
                )}
                <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'} style={{ maxWidth: '78%', padding: '11px 15px', fontSize: 13.5, lineHeight: 1.55, wordBreak: 'break-word' }} dangerouslySetInnerHTML={{ __html: formatMsg(m.content) }} />
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                <div className="chat-bubble-bot" style={{ padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: T.gold, animation: `typing 1.2s ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {msgs.length <= 1 && !loading && (
            <div style={{ padding: '0 12px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="sugg-btn" onClick={() => sendMessage(s)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 500, background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.1)`, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: T.font, transition: 'all .2s' }}>{s}</button>
              ))}
            </div>
          )}

          <div style={{ padding: '12px 14px', borderTop: `1px solid rgba(255,255,255,0.06)`, display: 'flex', gap: 8, flexShrink: 0 }}>
            <input ref={inputRef} className="chat-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder="Posez votre question..." disabled={loading} style={{ flex: 1, padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 12, fontSize: 13.5, color: T.white, fontFamily: T.font, transition: 'border .2s, box-shadow .2s' }} />
            <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ width: 42, height: 42, borderRadius: 12, background: T.gold, border: 'none', color: '#111', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s', flexShrink: 0 }}>➤</button>
          </div>
          <div style={{ padding: '6px 0 10px', textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>Propulsé par Claude AI · DigiPip © 2026</div>
        </div>
      )}
    </>
  );
}

/* ── Scroll Reveal ── */
function Reveal({ children, delay = 0, from = 'bottom' }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  const tr = from === 'left' ? 'translateX(-32px)' : from === 'right' ? 'translateX(32px)' : 'translateY(24px)';
  return (
    <div ref={ref} style={{ transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`, opacity: v ? 1 : 0, transform: v ? 'none' : tr }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ╔═══════════════════════════════════════════════════════════╗
   ║  SERVICES VISUELS AMÉLIORÉS — MARKETING / CLOUD / DEVOPS  ║
   ╚═══════════════════════════════════════════════════════════╝
   
   NOUVEAU: Composants interactifs avec animations, compteurs,
   et visualisations pour rendre les services plus attractifs
══════════════════════════════════════════════════════════════ */

/* ── Compteur animé ── */
function AnimatedCounter({ end, suffix = '', duration = 2000, color = T.gold }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) {
        setStarted(true);
        const startTime = Date.now();
        const tick = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(tick);
        };
        tick();
      }
    }, { threshold: 0.5 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [end, duration, started]);

  return (
    <span ref={ref} style={{ color, fontWeight: 900 }}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ── Barre de progression animée ── */
function ProgressBar({ label, value, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setWidth(value), delay);
        o.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [value, delay]);

  return (
    <div ref={ref} style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${width}%`, background: color,
          borderRadius: 3, transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
      </div>
    </div>
  );
}

/* ── Carte de service avec hover 3D ── */
function ServiceCard({ icon, title, description, features, color, stat, statLabel, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Reveal delay={index * 100}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: T.card,
          border: `1px solid ${hovered ? color + '50' : T.border}`,
          borderRadius: 20,
          padding: '32px 28px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: hovered ? 'translateY(-8px) scale(1.02)' : 'none',
          boxShadow: hovered ? `0 24px 60px rgba(0,0,0,0.5), 0 0 40px ${color}15` : '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: -50, right: -50,
          width: 150, height: 150, borderRadius: '50%',
          background: `radial-gradient(circle, ${color}20, transparent 70%)`,
          transition: 'opacity 0.4s', opacity: hovered ? 1 : 0,
        }} />

        {/* Icon */}
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: `linear-gradient(135deg, ${color}25, ${color}08)`,
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, marginBottom: 20, position: 'relative', zIndex: 1,
          transition: 'transform 0.3s', transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'none',
        }}>
          {icon}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 20, fontWeight: 800, color: T.white,
          marginBottom: 10, position: 'relative', zIndex: 1,
        }}>{title}</h3>

        {/* Description */}
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.7, marginBottom: 20, position: 'relative', zIndex: 1,
        }}>{description}</p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, position: 'relative', zIndex: 1 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 20, height: 20, borderRadius: 5,
                background: color + '15', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Stat highlight */}
        <div style={{
          background: `linear-gradient(135deg, ${color}10, transparent)`,
          border: `1px solid ${color}20`,
          borderRadius: 12, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: color + '20', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            {stat.icon}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{statLabel}</div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ── Timeline DevOps interactive ── */
function DevOpsTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { icon: '💻', num: '01', title: 'Code & Push', desc: 'Développez et poussez votre code sur GitHub. Chaque commit déclenche automatiquement le pipeline.', color: T.blue, time: '< 1s' },
    { icon: '🧪', num: '02', title: 'Tests CI', desc: 'Lint, tests unitaires et d\'intégration s\'exécutent automatiquement. Zéro régression en production.', color: T.purple, time: '~ 45s' },
    { icon: '🚀', num: '03', title: 'Build & Deploy', desc: 'Build optimisé et déploiement automatique sur Vercel (frontend) et Render (backend).', color: T.green, time: '~ 90s' },
    { icon: '📡', num: '04', title: 'Monitoring', desc: 'Surveillance temps réel des services. Alertes instantanées par email et Slack si anomalie.', color: T.gold, time: '24/7' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Ligne de connexion */}
      <div style={{
        position: 'absolute', top: 40, left: '12.5%', right: '12.5%',
        height: 2, background: 'rgba(255,255,255,0.06)',
      }}>
        <div style={{
          height: '100%', background: `linear-gradient(90deg, ${steps[activeStep].color}, transparent)`,
          width: `${(activeStep + 1) * 33.33}%`, transition: 'width 0.6s ease',
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {steps.map((step, i) => (
          <div
            key={i}
            onClick={() => setActiveStep(i)}
            onMouseEnter={() => setActiveStep(i)}
            style={{ cursor: 'pointer', textAlign: 'center', position: 'relative', zIndex: 1 }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: activeStep === i ? step.color + '20' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${activeStep === i ? step.color : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28,
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: activeStep === i ? 'scale(1.1)' : 'scale(1)',
              boxShadow: activeStep === i ? `0 0 30px ${step.color}30` : 'none',
            }}>
              {step.icon}
            </div>
            <div style={{
              fontSize: 11, fontWeight: 800, color: activeStep === i ? step.color : 'rgba(255,255,255,0.25)',
              letterSpacing: '0.1em', marginBottom: 8, transition: 'color 0.3s',
            }}>{step.num}</div>
            <h4 style={{
              fontSize: 15, fontWeight: 700, color: T.white,
              marginBottom: 6, transition: 'color 0.3s',
            }}>{step.title}</h4>
            <div style={{
              fontSize: 11, color: step.color, fontWeight: 700,
              marginBottom: 8, opacity: activeStep === i ? 1 : 0,
              transition: 'opacity 0.3s',
            }}>⏱ {step.time}</div>
            <p style={{
              fontSize: 12, color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.6, maxWidth: 200, margin: '0 auto',
              opacity: activeStep === i ? 1 : 0.5,
              transition: 'opacity 0.3s',
            }}>{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Visualisation du pipeline */}
      <div style={{
        marginTop: 40, background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: '24px 32px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap',
      }}>
        {[
          { label: 'git push', color: T.blue, active: activeStep >= 0 },
          { label: 'npm test ✓', color: T.purple, active: activeStep >= 1 },
          { label: 'npm build ✓', color: T.green, active: activeStep >= 2 },
          { label: 'deploy ✓', color: T.gold, active: activeStep >= 3 },
          { label: '🟢 Live', color: T.green, active: activeStep >= 3 },
        ].map((item, i) => (
          <React.Fragment key={i}>
            <div style={{
              background: item.active ? item.color + '18' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${item.active ? item.color + '40' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 10, padding: '12px 20px', textAlign: 'center',
              transition: 'all 0.4s',
              transform: item.active ? 'scale(1.05)' : 'scale(1)',
            }}>
              <code style={{
                fontSize: 13, color: item.active ? item.color : 'rgba(255,255,255,0.2)',
                fontWeight: 600, transition: 'color 0.4s',
              }}>{item.label}</code>
            </div>
            {i < 4 && (
              <span style={{
                color: item.active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)',
                padding: '0 10px', fontSize: 16, transition: 'color 0.4s',
              }}>→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ── Dashboard Cloud animé ── */
function CloudDashboard() {
  const [metrics, setMetrics] = useState([
    { label: 'CPU', value: 42, color: T.blue },
    { label: 'Mémoire', value: 67, color: T.purple },
    { label: 'Stockage', value: 34, color: T.green },
    { label: 'Réseau', value: 78, color: T.gold },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => ({
        ...m,
        value: Math.max(15, Math.min(95, m.value + (Math.random() - 0.5) * 15)),
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 16, padding: '24px', fontFamily: T.font,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.white }}>Infrastructure Cloud</div>
          <div style={{ fontSize: 11, color: T.green, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, boxShadow: `0 0 6px ${T.green}` }} />
            Tous les systèmes opérationnels
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
          {new Date().toLocaleTimeString('fr-FR')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 12,
            padding: '16px', border: `1px solid ${T.border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{m.label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{Math.round(m.value)}%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${m.value}%`, background: m.color,
                borderRadius: 2, transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 16, padding: '12px 16px',
        background: 'rgba(16,185,129,0.06)', borderRadius: 10,
        border: '1px solid rgba(16,185,129,0.15)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, animation: 'pulse 2s infinite' }} />
        <span style={{ fontSize: 12, color: T.green }}>Auto-scaling actif · 3 instances en cours</span>
      </div>
    </div>
  );
}

/* ── Mockup Dashboard Marketing ── */
function MockupDashboard() {
  return (
    <div style={{ background: T.card, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.5)', fontFamily: T.font }}>
      <div style={{ background: '#0a0f1a', padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        {['#ef4444','#f59e0b','#10b981'].map((c,i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 18, marginLeft: 8 }} />
      </div>
      <div style={{ display: 'flex', height: 320 }}>
        <div style={{ width: 150, background: '#0a0f1a', padding: '16px 12px', borderRight: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 24, height: 24, background: T.gold, borderRadius: 5 }} />
            <span style={{ color: T.white, fontSize: 13, fontWeight: 700 }}>DigiPip</span>
          </div>
          {[['Dashboard', true], ['Campagnes', false], ['Contacts', false], ['Analytics', false], ['Monitoring', false]].map(([l, a]) => (
            <div key={l} style={{ padding: '8px 10px', borderRadius: 8, background: a ? 'rgba(245,166,35,0.12)' : 'transparent', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: a ? T.gold : 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: 11, color: a ? T.gold : 'rgba(255,255,255,0.35)', fontWeight: a ? 700 : 400 }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 14, background: '#0d1420', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
            {[['Clients','1.2K','#f5a623'],['Campagnes','847','#ef4444'],['Contacts','45.3K','#10b981'],['Segments','128','#4f8ef7']].map(([l,v,c]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px', border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', marginBottom: 4, textTransform: 'uppercase' }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12, marginBottom: 10, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Évolution 7 jours</div>
            <svg width="100%" height="60" viewBox="0 0 380 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f8ef7" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#4f8ef7" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points="0,55 50,40 110,44 170,25 230,30 290,12 350,18 380,22 380,60 0,60" fill="url(#g1)" />
              <polyline points="0,55 50,40 110,44 170,25 230,30 290,12 350,18 380,22" fill="none" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round" />
              <polyline points="0,58 50,52 110,54 170,46 230,44 290,36 350,38 380,35" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 2" />
            </svg>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 12px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Performance canaux</div>
            {[['Email','72%','#4f8ef7'],['SMS','55%','#10b981'],['Push','88%','#f5a623']].map(([l,p,c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', width: 26 }}>{l}</span>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 3, height: 5 }}>
                  <div style={{ width: p, height: '100%', background: c, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: c }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Modal inscription ── */
function Modal({ camp, onClose }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const tc = TYPE_CFG[camp.type?.toLowerCase()] || TYPE_CFG.email;

  const submit = async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try { await api.post(`/api/campagnes/${camp.id}/inscrire`); setDone(true); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', animation: 'mIn 0.3s ease' }}>
        <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>{tc.icon} {tc.label}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: T.white, margin: 0 }}>{camp.title}</h2>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: 'none', color: T.gray, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 28 }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
              <h3 style={{ color: T.green, margin: '0 0 8px', fontSize: 20 }}>Inscription réussie !</h3>
              <button onClick={onClose} style={{ marginTop: 16, background: T.gold, color: '#111', border: 'none', padding: '12px 32px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>Fermer</button>
            </div>
          ) : !token ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
              <p style={{ color: T.gray, marginBottom: 24, lineHeight: 1.6 }}>Connectez-vous pour vous inscrire.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: 'none', color: T.gray, cursor: 'pointer' }}>Annuler</button>
                <button onClick={() => navigate('/login')} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: T.gold, color: '#111', fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>Se connecter →</button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: T.gray, lineHeight: 1.6, marginBottom: 24, fontSize: 14 }}>{camp.description || "Campagne marketing multi-canal avec suivi des performances en temps réel."}</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: 'none', color: T.gray, cursor: 'pointer', fontFamily: T.font }}>Annuler</button>
                <button onClick={submit} disabled={loading} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: T.gold, color: '#111', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: T.font }}>
                  {loading ? 'Inscription...' : "✓ S'inscrire"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes mIn { from { opacity:0; transform:scale(0.94) translateY(16px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(null);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setError('');
    try {
      const response = await fetch('https://marketingcloudops-backend.onrender.com/api/auth/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setSent(true);
    } catch (err) {
      setError("Erreur d'envoi. Veuillez réessayer.");
    } finally {
      setSending(false);
    }
  };
 
  const inputStyle = (field) => ({
    width: '100%', padding: '13px 16px', background: 'rgba(255,255,255,0.04)',
    border: `1.5px solid ${focused === field ? T.gold : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 10, fontSize: 14, color: T.white, fontFamily: T.font,
    transition: 'border .2s, box-shadow .2s', outline: 'none',
    boxSizing: 'border-box', boxShadow: focused === field ? `0 0 0 3px rgba(245,166,35,0.08)` : 'none',
  });
 
  if (sent) {
    return (
      <div style={{ background: T.card, border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 20, padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: T.green, marginBottom: 10 }}>Message envoyé !</h3>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 28 }}>
          Merci <strong style={{ color: T.white }}>{form.name}</strong> ! Notre équipe vous contactera sous 24h à <strong style={{ color: T.white }}>{form.email}</strong>.
        </p>
        <button onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', subject:'', message:'' }); }}
          style={{ padding: '12px 28px', background: T.gold, color: '#111', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: T.font }}>
          Envoyer un autre message
        </button>
      </div>
    );
  }
 
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: '36px 36px', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: T.white, marginBottom: 6 }}>Envoyez-nous un message</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Remplissez le formulaire et nous vous répondrons rapidement.</p>
      </div>
 
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#ef4444', fontSize: 13 }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Nom complet *</label>
            <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} placeholder="Jean Dupont" style={inputStyle('name')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email *</label>
            <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="vous@exemple.com" style={inputStyle('email')} />
          </div>
        </div>
 
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} placeholder="+216 XX XXX XXX" style={inputStyle('phone')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sujet</label>
            <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)} style={{ ...inputStyle('subject'), cursor: 'pointer' }}>
              <option value="demo">Demander une démo DigiPip</option>
              <option value="pricing">Tarifs & abonnements</option>
              <option value="support">Support technique</option>
              <option value="agency">Intégration pour mon agence</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>
 
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Message *</label>
          <textarea required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} onFocus={() => setFocused('message')} onBlur={() => setFocused(null)} placeholder="Décrivez votre besoin..." rows={5} style={{ ...inputStyle('message'), resize: 'vertical', minHeight: 120 }} />
        </div>
 
        <button type="submit" disabled={sending} style={{
          width: '100%', padding: '15px', background: T.gold, color: '#111',
          border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 700,
          cursor: sending ? 'not-allowed' : 'pointer', fontFamily: T.font,
          opacity: sending ? 0.7 : 1, transition: 'all .2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }} onMouseEnter={e => { if (!sending) e.currentTarget.style.background = T.goldDk; }} onMouseLeave={e => { e.currentTarget.style.background = T.gold; }}>
          {sending ? (
            <>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #111', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
              Envoi en cours...
            </>
          ) : '📨 Envoyer le message'}
        </button>
 
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          Réponse garantie sous 24h · DigiLab Solutions © 2026
        </p>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOMEPAGE — SERVICES VISUELS AMÉLIORÉS
══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCamp, setSelectedCamp] = useState(null);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', s);
    return () => window.removeEventListener('scroll', s);
  }, []);

  useEffect(() => {
    api.get('/api/campagnes/public')
      .then(r => setCampagnes(Array.isArray(r.data) ? r.data : []))
      .catch(() => setCampagnes([]))
      .finally(() => setLoading(false));
  }, []);

  const TAB_CONTENT = [
    { 
      title: 'Pilotez vos campagnes marketing', 
      desc: 'Email, SMS, Push Notifications — gérez tous vos canaux depuis un seul dashboard avec segmentation avancée et analytics temps réel.', 
      features: ['Campagnes multi-canal unifiées','Segmentation & ciblage comportemental','Analytics & KPIs en temps réel','Automation & lead nurturing'], 
      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80', 
      color: T.blue 
    },
    { 
      title: 'Infrastructure cloud scalable', 
      desc: 'Architecture multi-tenant isolée sur Vercel + Render + Neon DB — haute disponibilité et sécurité pour votre agence.', 
      features: ['Hébergement Vercel + Render','Base de données Neon Postgres','Architecture multi-tenant isolée','99.9% de disponibilité garantie'], 
      img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&q=80', 
      color: T.purple 
    },
    { 
      title: 'Pipeline DevOps automatisé', 
      desc: 'CI/CD avec GitHub Actions — chaque commit déclenche tests automatiques, build et déploiement. Monitoring temps réel.', 
      features: ['CI/CD GitHub Actions automatique','Tests unitaires à chaque push','Monitoring des services en live','Alertes email & Slack instantanées'], 
      img: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=700&q=80', 
      color: T.gold 
    },
  ];

  const PRICING = [
    {
      name: 'Starter', price: '€99', period: '/mois',
      description: 'Pour les freelances et petites agences',
      features: ['3 clients max', 'Email & SMS', '1 000 contacts', 'Rapports basiques', 'Support email'],
      cta: 'Commencer', popular: false,
    },
    {
      name: 'Agency', price: '€299', period: '/mois',
      description: 'Pour les agences en croissance',
      features: ['Clients illimités', 'Email, SMS & Push', '50 000 contacts', 'Marque blanche', 'Analytics avancés', 'API complète', 'Support prioritaire'],
      cta: 'Essai gratuit 14j', popular: true,
    },
    {
      name: 'Enterprise', price: 'Sur devis', period: '',
      description: 'Pour les grands groupes',
      features: ['Multi-agences', 'Tous les canaux', 'Contacts illimités', 'SLA dédié', 'Hébergement sur site', 'Intégrations custom', 'Account manager'],
      cta: 'Contacter ventes', popular: false,
    },
  ];

  const TESTIMONIALS = [
    {
      name: 'Sarah Ben Ali', role: 'Directrice Marketing, MediaPro Tunisie',
      text: "DigiPip a réduit nos coûts d'outils marketing de 60%. Le dashboard unifié nous fait gagner 10h par semaine.", avatar: 'S',
    },
    {
      name: 'Karim Mansour', role: 'CEO, Digital Agency Casablanca',
      text: "L'intégration CI/CD est transparente. Nos déploiements sont passés de 2h à 2 minutes. Impressionnant.", avatar: 'K',
    },
    {
      name: 'Leila Trabelsi', role: 'Responsable CRM, Sfax Retail Group',
      text: "La segmentation comportementale a augmenté nos taux de conversion de 34%. Le ROI est visible dès le premier mois.", avatar: 'L',
    },
  ];

  /* ══════════════════════════════════════════════════════════════
     NOUVEAUX SERVICES AVEC VISUALISATIONS
  ═══════════════════════════════════════════════════════════════ */

  const MARKETING_SERVICES = [
    {
      icon: '✉️', color: T.blue, title: 'Email Marketing',
      description: 'Créez et envoyez des campagnes email professionnelles avec tracking des ouvertures, clics et conversions en temps réel.',
      features: ['Templates personnalisés', 'A/B Testing', "Taux d'ouverture live", 'SMTP sécurisé'],
      stat: { icon: '📈', value: '47%' }, statLabel: 'Taux d\'ouverture moyen',
    },
    {
      icon: '💬', color: T.green, title: 'SMS Marketing',
      description: 'Atteignez vos clients directement sur leur mobile avec des messages SMS personnalisés via Twilio.',
      features: ['Envoi en masse', 'Personnalisation', 'Taux de livraison 98%', 'Réponses automatiques'],
      stat: { icon: '📱', value: '98%' }, statLabel: 'Taux de livraison',
    },
    {
      icon: '🔔', color: T.gold, title: 'Push Notifications',
      description: 'Envoyez des notifications push instantanées sur tous les appareils via Firebase Cloud Messaging.',
      features: ['Multi-plateforme', 'Ciblage précis', 'Notifications riches', 'Analytics intégrés'],
      stat: { icon: '⚡', value: '88%' }, statLabel: 'Taux d\'engagement',
    },
    {
      icon: '🎯', color: T.purple, title: 'Segmentation Avancée',
      description: "Segmentez votre audience par comportement, localisation, historique d'achat pour des campagnes ultra-ciblées.",
      features: ['Segments dynamiques', 'Ciblage comportemental', 'Import CSV', 'Tags & filtres'],
      stat: { icon: '🎯', value: '12x' }, statLabel: 'ROI moyen par segment',
    },
    {
      icon: '📊', color: '#f97316', title: 'Analytics & KPIs',
      description: 'Suivez les performances de vos campagnes en temps réel avec des tableaux de bord détaillés.',
      features: ['Dashboard temps réel', 'ROI calculé', 'Rapports PDF', 'Comparaison canaux'],
      stat: { icon: '📊', value: '24/7' }, statLabel: 'Monitoring temps réel',
    },
    {
      icon: '🤖', color: '#ec4899', title: 'Assistant IA',
      description: "Bénéficiez d'un assistant IA propulsé par Claude pour optimiser vos campagnes et répondre à vos questions.",
      features: ['Suggestions automatiques', 'Optimisation contenu', 'Support 24/7', 'Propulsé par Claude'],
      stat: { icon: '🧠', value: '< 2s' }, statLabel: 'Temps de réponse moyen',
    },
  ];

  const CLOUD_FEATURES = [
    { icon: '☁️', title: 'Multi-Cloud', desc: 'Vercel + Render + Neon', color: T.blue },
    { icon: '🛡️', title: 'Sécurisé', desc: 'ISO 27001, chiffrement AES-256', color: T.green },
    { icon: '⚡', title: 'Rapide', desc: 'CDN global, edge caching', color: T.gold },
    { icon: '🔄', title: 'Auto-scaling', desc: 'Mise à l\'échelle automatique', color: T.purple },
  ];

  return (
    <div style={{ fontFamily: T.font, color: T.white, minHeight: '100vh', overflowX: 'hidden', position: 'relative' }}>

      <AuroraBackground />

      <div style={{ position: 'relative', zIndex: 1 }}>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          * { box-sizing:border-box; margin:0; padding:0; }
          html { scroll-behavior:smooth; }
          ::-webkit-scrollbar { width:4px; }
          ::-webkit-scrollbar-thumb { background:rgba(245,166,35,0.4); border-radius:2px; }
          @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
          @keyframes spin { to { transform:rotate(360deg); } }
          @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
          .nav-a { color:rgba(255,255,255,0.6); text-decoration:none; font-size:14px; font-weight:500; transition:color .2s; }
          .nav-a:hover { color:#fff; }
          .btn-gold { transition:all .2s; }
          .btn-gold:hover { background:#d4881a !important; transform:translateY(-2px); box-shadow:0 12px 36px rgba(245,166,35,0.4) !important; }
          .btn-ghost { transition:all .2s; }
          .btn-ghost:hover { background:rgba(255,255,255,0.08) !important; }
          .camp-card { transition:all .3s; }
          .camp-card:hover { transform:translateY(-6px); box-shadow:0 24px 60px rgba(0,0,0,0.4) !important; border-color:rgba(245,166,35,0.25) !important; }
          .tab-btn { transition:all .2s; cursor:pointer; border:none; font-family:inherit; }
          .feat-card { transition:all .3s; }
          .feat-card:hover { transform:translateY(-6px); border-color:rgba(245,166,35,0.3) !important; }
          .pricing-card { transition:all .3s; }
          .pricing-card:hover { transform:translateY(-8px); box-shadow:0 24px 60px rgba(0,0,0,0.4) !important; }
          .pricing-popular { border-color:rgba(245,166,35,0.5) !important; box-shadow:0 0 40px rgba(245,166,35,0.15) !important; }
          .testimonial-card { transition:all .3s; }
          .testimonial-card:hover { transform:translateY(-4px); border-color:rgba(245,166,35,0.2) !important; }
        `}</style>

        {/* NAVBAR */}
        <nav style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, 
          height: 68, background: scrolled ? 'rgba(8,12,20,0.97)' : 'transparent', 
          backdropFilter: scrolled ? 'blur(20px)' : 'none', 
          borderBottom: scrolled ? `1px solid ${T.border}` : '1px solid transparent', 
          transition: 'all 0.35s', display: 'flex', alignItems: 'center', 
          justifyContent: 'space-between', padding: '0 5%' 
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width: 42, height: 42, background: 'linear-gradient(135deg, #f5a623, #d97706)',
              borderRadius: '50% 40% 65% 45%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', fontSize: 22, color: 'white',
              boxShadow: '0 4px 15px rgba(245,166,35,0.4)', flexShrink: 0, position: 'relative'
            }}>
              ☁️
              <div style={{ position: 'absolute', top: 6, left: 8, width: 12, height: 12, background: 'rgba(255,255,255,0.6)', borderRadius: '50%', filter: 'blur(2px)' }} />
            </div>
            <div>
              <div style={{ fontSize:20, fontWeight:800, letterSpacing:'-0.02em' }}>
                Digi<span style={{ color:T.gold }}>Pip</span>
              </div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', letterSpacing:'0.06em' }}>
                by DigiLab Solutions
              </div>
            </div>
          </div> 
          <div style={{ display: 'flex', gap: 32 }}>
            {[['#marketing','Marketing'],['#services','Services'],['#cloud','Cloud'],['#devops','DevOps'],['#pricing','Tarifs'],['#campagnes','Campagnes'],['#contact','Contact']].map(([h,l]) => (
              <a key={l} className="nav-a" href={h}>{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" onClick={() => navigate('/login')} style={{ 
              background: 'transparent', color: T.white, border: `1px solid rgba(255,255,255,0.15)`, 
              padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, 
              cursor: 'pointer', fontFamily: T.font 
            }}>Se connecter</button>
            <button className="btn-gold" onClick={() => navigate('/login')} style={{ 
              background: T.gold, color: '#111', border: 'none', padding: '9px 22px', 
              borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.font 
            }}>Essai gratuit →</button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ 
          minHeight: '100vh', padding: '120px 5% 80px', display: 'flex', 
          alignItems: 'center', position: 'relative', overflow: 'hidden' 
        }}>
          <div style={{ 
            position: 'absolute', inset: 0, 
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,142,247,0.06) 0%, transparent 60%)', 
            pointerEvents: 'none' 
          }} />
          <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 10, 
                background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.3)', 
                borderRadius: 30, padding: '8px 18px', marginBottom: 32 
              }}>
                <div style={{ display: 'flex' }}>
                  {['#f5a623','#4f8ef7','#10b981'].map((c,i) => (
                    <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2px solid #080c14', marginLeft: i > 0 ? -8 : 0 }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                  Plateforme cloud pour agences marketing
                </span>
              </div>
              <h1 style={{ 
                fontSize: 'clamp(40px,5vw,64px)', fontWeight: 900, 
                lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24 
              }}>
                La plateforme<br />
                <span style={{ 
                  background: 'linear-gradient(135deg,#f5a623,#ffc048)', 
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' 
                }}>tout-en-un</span><br />
                pour agences modernes
              </h1>
              <p style={{ 
                fontSize: 17, color: 'rgba(255,255,255,0.55)', 
                lineHeight: 1.75, maxWidth: 480, marginBottom: 40 
              }}>
                Gérez vos <strong style={{ color: T.white }}>campagnes Email, SMS et Push</strong>, 
                segmentez votre audience et suivez vos <strong style={{ color: T.white }}>KPIs en temps réel</strong> 
                — tout depuis un seul dashboard.
              </p>
              <div style={{ display: 'flex', gap: 14, marginBottom: 48, flexWrap: 'wrap' }}>
                <button className="btn-gold" onClick={() => navigate('/login')} style={{ 
                  background: T.gold, color: '#111', border: 'none', 
                  padding: '15px 36px', borderRadius: 10, fontSize: 15, 
                  fontWeight: 700, cursor: 'pointer', fontFamily: T.font 
                }}>Essai gratuit 14 jours →</button>
                <button className="btn-ghost" onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })} style={{ 
                  background: 'transparent', color: T.white, 
                  border: `1px solid rgba(255,255,255,0.15)`, 
                  padding: '15px 28px', borderRadius: 10, fontSize: 15, 
                  cursor: 'pointer', fontFamily: T.font 
                }}>Découvrir les fonctionnalités ↓</button>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[['📊','Marketing Digital',T.blue],['☁️','Cloud Scalable',T.purple],['⚙️','DevOps CI/CD',T.gold]].map(([icon,label,color],i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: 8, 
                      background: color+'18', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', fontSize: 16 
                    }}>{icon}</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', animation: 'float 6s ease-in-out infinite' }}>
              <MockupDashboard />
              <div style={{ 
                position: 'absolute', bottom: -16, right: -16, 
                background: T.card, border: `1px solid ${T.border}`, 
                borderRadius: 14, padding: '12px 18px', 
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)', 
                display: 'flex', alignItems: 'center', gap: 12 
              }}>
                <div style={{ 
                  width: 36, height: 36, borderRadius: 10, 
                  background: 'rgba(16,185,129,0.15)', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: 18 
                }}>📈</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>+88% Push rate</div>
                  <div style={{ fontSize: 11, color: T.gray }}>ce mois-ci</div>
                </div>
              </div>
              <div style={{ 
                position: 'absolute', top: -12, left: -20, 
                background: T.card, border: `1px solid ${T.border}`, 
                borderRadius: 14, padding: '10px 16px', 
                display: 'flex', alignItems: 'center', gap: 10 
              }}>
                <div style={{ 
                  width: 8, height: 8, borderRadius: '50%', 
                  background: T.green, boxShadow: `0 0 8px ${T.green}` 
                }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>99.9% uptime</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            STATS ANIMÉES — Impact visuel immédiat
        ═══════════════════════════════════════════════════════ */}
        <section style={{ padding: '0 5% 80px' }}>
          <Reveal>
            <div style={{ 
              maxWidth: 1200, margin: '0 auto', 
              background: `linear-gradient(135deg,rgba(79,142,247,0.06),rgba(124,58,237,0.06),rgba(245,166,35,0.06))`, 
              border: `1px solid ${T.border}`, borderRadius: 20, 
              display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', 
              overflow: 'hidden' 
            }}>
              {[
                { value: 200, suffix: '+', label: 'Agences clientes', icon: '🏢', color: T.blue },
                { value: 15, suffix: 'M+', label: 'Messages envoyés', icon: '📨', color: T.purple },
                { value: 99, suffix: '.9%', label: 'Uptime garanti', icon: '🟢', color: T.green },
                { value: 60, suffix: '%', label: 'Réduction des coûts', icon: '💰', color: T.gold },
              ].map((stat, i) => (
                <div key={i} style={{ 
                  padding: '44px 28px', textAlign: 'center', 
                  borderRight: i < 3 ? `1px solid ${T.border}` : 'none' 
                }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{stat.icon}</div>
                  <div style={{ 
                    fontSize: 44, fontWeight: 900, 
                    letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 10 
                  }}>
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} color={stat.color} />
                  </div>
                  <div style={{ 
                    fontSize: 12, color: 'rgba(255,255,255,0.35)', 
                    textTransform: 'uppercase', letterSpacing: '0.08em' 
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SERVICES MARKETING — VISUELS AMÉLIORÉS
            Cartes interactives avec hover 3D, stats, et animations
        ═══════════════════════════════════════════════════════ */}
        <section id="services" style={{ padding: '120px 5%' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 8, 
                  background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', 
                  borderRadius: 20, padding: '6px 16px', marginBottom: 20 
                }}>
                  <span style={{ 
                    fontSize: 11, fontWeight: 700, color: T.blue, 
                    letterSpacing: '0.15em', textTransform: 'uppercase' 
                  }}>Nos Services</span>
                </div>
                <h2 style={{ 
                  fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, 
                  letterSpacing: '-0.03em', marginBottom: 14 
                }}>
                  Marketing Digital <span style={{ color: T.gold }}>puissant</span>
                </h2>
                <p style={{ 
                  color: 'rgba(255,255,255,0.4)', fontSize: 16, 
                  maxWidth: 500, margin: '0 auto' 
                }}>
                  Des outils conçus pour maximiser l'engagement et le ROI de chaque campagne.
                </p>
              </div>
            </Reveal>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {MARKETING_SERVICES.map((s, i) => (
                <ServiceCard key={i} {...s} index={i} />
              ))}
            </div>

            {/* Barres de progression des performances */}
            <Reveal>
              <div style={{ 
                marginTop: 48, background: T.card, border: `1px solid ${T.border}`, 
                borderRadius: 20, padding: '32px 40px' 
              }}>
                <div style={{ 
                  display: 'flex', justifyContent: 'space-between', 
                  alignItems: 'center', marginBottom: 24 
                }}>
                  <div>
                    <h3 style={{ 
                      fontSize: 20, fontWeight: 800, color: T.white, marginBottom: 4 
                    }}>Performances moyennes par canal</h3>
                    <p style={{ 
                      fontSize: 13, color: 'rgba(255,255,255,0.4)' 
                    }}>Basé sur les données de nos 200+ agences clientes</p>
                  </div>
                  <div style={{ 
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', 
                    borderRadius: 20, padding: '6px 14px', fontSize: 11, 
                    color: T.green, fontWeight: 700 
                  }}>
                    📈 +23% vs l'année dernière
                  </div>
                </div>
                <ProgressBar label="Email Marketing — Taux d'ouverture" value={47} color={T.blue} delay={0} />
                <ProgressBar label="SMS Marketing — Taux de conversion" value={35} color={T.green} delay={200} />
                <ProgressBar label="Push Notifications — Taux d'engagement" value={88} color={T.gold} delay={400} />
                <ProgressBar label="Segmentation — Précision du ciblage" value={92} color={T.purple} delay={600} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            CLOUD — SECTION VISUELLE AVEC DASHBOARD ANIMÉ
        ═══════════════════════════════════════════════════════ */}
        <section id="cloud" style={{ 
          padding: '120px 5%', 
          background: 'rgba(8,12,20,0.30)', backdropFilter: 'blur(20px)', 
          borderTop: `1px solid ${T.border}` 
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
              <Reveal from="left">
                <div>
                  <div style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: 8, 
                    background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', 
                    borderRadius: 20, padding: '6px 16px', marginBottom: 20 
                  }}>
                    <span style={{ 
                      fontSize: 11, fontWeight: 700, color: T.purple, 
                      letterSpacing: '0.15em', textTransform: 'uppercase' 
                    }}>Cloud Infrastructure</span>
                  </div>
                  <h2 style={{ 
                    fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, 
                    letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1 
                  }}>
                    Une infrastructure<br />
                    <span style={{ color: T.purple }}>scalable & sécurisée</span>
                  </h2>
                  <p style={{ 
                    fontSize: 16, color: 'rgba(255,255,255,0.5)', 
                    lineHeight: 1.75, marginBottom: 32 
                  }}>
                    Architecture multi-tenant isolée avec haute disponibilité. 
                    Vos données sont chiffrées, vos services auto-scalés, 
                    votre agence protégée.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 32 }}>
                    {CLOUD_FEATURES.map((f, i) => (
                      <div key={i} style={{ 
                        display: 'flex', alignItems: 'center', gap: 12, 
                        background: 'rgba(255,255,255,0.03)', borderRadius: 12, 
                        padding: '16px', border: `1px solid ${T.border}` 
                      }}>
                        <div style={{ 
                          width: 40, height: 40, borderRadius: 10, 
                          background: f.color + '15', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center', 
                          fontSize: 20, flexShrink: 0 
                        }}>{f.icon}</div>
                        <div>
                          <div style={{ 
                            fontSize: 14, fontWeight: 700, color: T.white 
                          }}>{f.title}</div>
                          <div style={{ 
                            fontSize: 12, color: 'rgba(255,255,255,0.4)' 
                          }}>{f.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <button className="btn-gold" onClick={() => navigate('/login')} style={{ 
                      background: T.gold, color: '#111', border: 'none', 
                      padding: '13px 28px', borderRadius: 10, fontSize: 14, 
                      fontWeight: 700, cursor: 'pointer', fontFamily: T.font 
                    }}>Déployer mon agence →</button>
                  </div>
                </div>
              </Reveal>

              <Reveal from="right">
                <CloudDashboard />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            DEVOPS — TIMELINE INTERACTIVE
        ═══════════════════════════════════════════════════════ */}
        <section id="devops" style={{ padding: '120px 5%' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 8, 
                  background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', 
                  borderRadius: 20, padding: '6px 16px', marginBottom: 20 
                }}>
                  <span style={{ 
                    fontSize: 11, fontWeight: 700, color: T.gold, 
                    letterSpacing: '0.15em', textTransform: 'uppercase' 
                  }}>DevOps Automatisé</span>
                </div>
                <h2 style={{ 
                  fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, 
                  letterSpacing: '-0.03em', marginBottom: 14 
                }}>
                  Du code à la prod en <span style={{ color: T.gold }}>2 minutes</span>
                </h2>
                <p style={{ 
                  color: 'rgba(255,255,255,0.4)', fontSize: 16, 
                  maxWidth: 500, margin: '0 auto' 
                }}>
                  Pipeline CI/CD entièrement automatisé. Zéro downtime, zéro stress.
                </p>
              </div>
            </Reveal>

            <DevOpsTimeline />
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{ 
          padding: '120px 5%', 
          background: 'rgba(8,12,20,0.30)', backdropFilter: 'blur(20px)', 
          borderTop: `1px solid ${T.border}` 
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 8, 
                  background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', 
                  borderRadius: 20, padding: '6px 16px', marginBottom: 20 
                }}>
                  <span style={{ 
                    fontSize: 11, fontWeight: 700, color: T.gold, 
                    letterSpacing: '0.15em', textTransform: 'uppercase' 
                  }}>Tarifs</span>
                </div>
                <h2 style={{ 
                  fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, 
                  letterSpacing: '-0.03em', marginBottom: 14 
                }}>
                  Des prix <span style={{ color: T.gold }}>transparents</span>
                </h2>
                <p style={{ 
                  color: 'rgba(255,255,255,0.4)', fontSize: 16, 
                  maxWidth: 500, margin: '0 auto' 
                }}>
                  Choisissez le plan adapté à votre agence. Sans engagement.
                </p>
              </div>
            </Reveal>

            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', 
              gap: 24, alignItems: 'start' 
            }}>
              {PRICING.map((plan, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className={`pricing-card ${plan.popular ? 'pricing-popular' : ''}`} style={{ 
                    background: T.card, 
                    border: `1px solid ${plan.popular ? 'rgba(245,166,35,0.5)' : T.border}`, 
                    borderRadius: 20, padding: '36px 28px', 
                    position: 'relative', 
                    boxShadow: plan.popular ? '0 0 40px rgba(245,166,35,0.15)' : 'none' 
                  }}>
                    {plan.popular && (
                      <div style={{ 
                        position: 'absolute', top: -12, left: '50%', 
                        transform: 'translateX(-50%)', 
                        background: T.gold, color: '#111', 
                        padding: '6px 16px', borderRadius: 20, 
                        fontSize: 11, fontWeight: 800, 
                        letterSpacing: '0.05em', textTransform: 'uppercase' 
                      }}>
                        Le plus populaire
                      </div>
                    )}
                    <div style={{ 
                      fontSize: 13, fontWeight: 700, 
                      color: plan.popular ? T.gold : 'rgba(255,255,255,0.5)', 
                      marginBottom: 12, letterSpacing: '0.1em', 
                      textTransform: 'uppercase' 
                    }}>{plan.name}</div>
                    <div style={{ 
                      display: 'flex', alignItems: 'baseline', 
                      gap: 4, marginBottom: 8 
                    }}>
                      <span style={{ 
                        fontSize: 42, fontWeight: 900, 
                        color: T.white, letterSpacing: '-0.04em' 
                      }}>{plan.price}</span>
                      <span style={{ 
                        fontSize: 14, color: 'rgba(255,255,255,0.35)' 
                      }}>{plan.period}</span>
                    </div>
                    <p style={{ 
                      fontSize: 13, color: 'rgba(255,255,255,0.4)', 
                      marginBottom: 28, lineHeight: 1.5 
                    }}>{plan.description}</p>
                    <div style={{ 
                      display: 'flex', flexDirection: 'column', 
                      gap: 12, marginBottom: 32 
                    }}>
                      {plan.features.map((f, j) => (
                        <div key={j} style={{ 
                          display: 'flex', alignItems: 'center', gap: 10 
                        }}>
                          <div style={{ 
                            width: 18, height: 18, borderRadius: '50%', 
                            background: plan.popular ? 'rgba(245,166,35,0.15)' : 'rgba(16,185,129,0.15)', 
                            display: 'flex', alignItems: 'center', 
                            justifyContent: 'center', flexShrink: 0 
                          }}>
                            <span style={{ 
                              fontSize: 10, 
                              color: plan.popular ? T.gold : T.green, 
                              fontWeight: 700 
                            }}>✓</span>
                          </div>
                          <span style={{ 
                            fontSize: 13, 
                            color: 'rgba(255,255,255,0.6)' 
                          }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => navigate('/login')} style={{ 
                      width: '100%', padding: '14px', 
                      background: plan.popular ? T.gold : 'transparent', 
                      color: plan.popular ? '#111' : T.white, 
                      border: `1px solid ${plan.popular ? T.gold : T.border}`, 
                      borderRadius: 10, fontSize: 14, fontWeight: 700, 
                      cursor: 'pointer', fontFamily: T.font, 
                      transition: 'all .2s' 
                    }}
                      onMouseEnter={e => { 
                        if (!plan.popular) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        }
                      }}
                      onMouseLeave={e => { 
                        if (!plan.popular) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderColor = T.border;
                        }
                      }}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding: '120px 5%' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 8, 
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', 
                  borderRadius: 20, padding: '6px 16px', marginBottom: 20 
                }}>
                  <span style={{ 
                    fontSize: 11, fontWeight: 700, color: T.green, 
                    letterSpacing: '0.15em', textTransform: 'uppercase' 
                  }}>Témoignages</span>
                </div>
                <h2 style={{ 
                  fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, 
                  letterSpacing: '-0.03em', marginBottom: 14 
                }}>
                  Ils nous <span style={{ color: T.gold }}>font confiance</span>
                </h2>
              </div>
            </Reveal>

            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', 
              gap: 20 
            }}>
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="testimonial-card" style={{ 
                    background: T.card, border: `1px solid ${T.border}`, 
                    borderRadius: 18, padding: '28px', position: 'relative' 
                  }}>
                    <div style={{ 
                      fontSize: 48, color: 'rgba(245,166,35,0.1)', 
                      position: 'absolute', top: 16, right: 20, 
                      fontFamily: 'Georgia, serif', lineHeight: 1 
                    }}>"</div>
                    <p style={{ 
                      fontSize: 14, color: 'rgba(255,255,255,0.7)', 
                      lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' 
                    }}>{t.text}</p>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: 12 
                    }}>
                      <div style={{ 
                        width: 44, height: 44, borderRadius: '50%', 
                        background: `linear-gradient(135deg, ${T.gold}, ${T.goldDk})`, 
                        display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontSize: 16, 
                        fontWeight: 800, color: '#111' 
                      }}>{t.avatar}</div>
                      <div>
                        <div style={{ 
                          fontSize: 14, fontWeight: 700, color: T.white 
                        }}>{t.name}</div>
                        <div style={{ 
                          fontSize: 12, 
                          color: 'rgba(255,255,255,0.4)' 
                        }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CAMPAGNES */}
        <section id="campagnes" style={{ 
          padding: '120px 5%', 
          background: 'rgba(8,12,20,0.30)', backdropFilter: 'blur(20px)', 
          borderTop: `1px solid ${T.border}` 
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 8, 
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', 
                  borderRadius: 20, padding: '6px 16px', marginBottom: 20 
                }}>
                  <span style={{ 
                    width: 7, height: 7, borderRadius: '50%', 
                    background: T.green, display: 'block', 
                    boxShadow: `0 0 6px ${T.green}` 
                  }} />
                  <span style={{ 
                    fontSize: 11, fontWeight: 700, color: T.green, 
                    letterSpacing: '0.15em', textTransform: 'uppercase' 
                  }}>Live — Campagnes Actives</span>
                </div>
                <h2 style={{ 
                  fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, 
                  letterSpacing: '-0.03em', marginBottom: 14 
                }}>Inscrivez-vous à nos campagnes</h2>
                <p style={{ 
                  color: 'rgba(255,255,255,0.4)', fontSize: 16, 
                  maxWidth: 440, margin: '0 auto' 
                }}>Campagnes Email, SMS et Push de nos agences partenaires.</p>
              </div>
            </Reveal>
            {loading ? (
              <div style={{ 
                textAlign: 'center', padding: 60, 
                color: 'rgba(255,255,255,0.3)' 
              }}>
                <div style={{ 
                  width: 34, height: 34, 
                  border: '3px solid rgba(245,166,35,0.15)', 
                  borderTop: `3px solid ${T.gold}`, 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite', 
                  margin: '0 auto 16px' 
                }} />
                Chargement...
              </div>
            ) : campagnes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 80 }}>
                <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 16 }}>📢</div>
                <p style={{ color: 'rgba(255,255,255,0.25)' }}>Aucune campagne disponible.</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', 
                gap: 22 
              }}>
                {campagnes.map((c,idx) => (
                  <Reveal key={c.id} delay={idx*60}>
                    <div className="camp-card" onClick={() => {
                      sessionStorage.setItem('redirect_after_login', `/campagnes/${c.id}`);
                      const token = localStorage.getItem('token');
                      if (token) {
                        window.location.href = `/campagnes/${c.id}`;
                      } else {
                        window.location.href = '/login';
                      }
                    }} style={{ 
                      background: T.card, border: `1px solid ${T.border}`, 
                      borderRadius: 18, overflow: 'hidden', 
                      cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' 
                    }}>
                      <div style={{ height: 190, overflow: 'hidden', position: 'relative' }}>
                        <img src={CAMP_IMGS[c.type?.toLowerCase()] || CAMP_IMGS.email} alt={c.title} style={{ 
                          width: '100%', height: '100%', 
                          objectFit: 'cover' 
                        }} onError={e => { 
                          e.target.src = `https://picsum.photos/seed/${c.id}/600/400`; 
                        }} />
                        <div style={{ 
                          position: 'absolute', inset: 0, 
                          background: 'linear-gradient(to bottom,transparent 40%,rgba(20,28,46,0.9))' 
                        }} />
                      </div>
                      <div style={{ padding: '20px 22px 24px' }}>
                        {c.client?.name && <div style={{ 
                          fontSize: 11, color: 'rgba(255,255,255,0.3)', 
                          marginBottom: 8 
                        }}>🏢 {c.client.name}</div>}
                        <h3 style={{ 
                          fontSize: 17, fontWeight: 700, 
                          marginBottom: 18, lineHeight: 1.35 
                        }}>{c.title}</h3>
                        <button style={{ 
                          width: '100%', padding: '12px', 
                          background: T.gold, color: '#111', 
                          border: 'none', borderRadius: 10, 
                          fontWeight: 700, fontSize: 14, 
                          cursor: 'pointer', fontFamily: T.font, 
                          transition: 'background .2s' 
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = T.goldDk}
                          onMouseLeave={e => e.currentTarget.style.background = T.gold}
                        >Voir détails & s'inscrire</button>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" style={{ 
          padding: '120px 5%', 
          borderTop: `1px solid ${T.border}` 
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 8, 
                  background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', 
                  borderRadius: 20, padding: '6px 16px', marginBottom: 20 
                }}>
                  <span style={{ 
                    fontSize: 11, fontWeight: 700, color: T.gold, 
                    letterSpacing: '0.15em', textTransform: 'uppercase' 
                  }}>Contact</span>
                </div>
                <h2 style={{ 
                  fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, 
                  letterSpacing: '-0.03em', marginBottom: 14 
                }}>
                  Contactez <span style={{ color: T.gold }}>DigiPip</span>
                </h2>
                <p style={{ 
                  color: 'rgba(255,255,255,0.4)', fontSize: 16, 
                  maxWidth: 480, margin: '0 auto' 
                }}>
                  Une question sur la plateforme ? Notre équipe vous répond sous 24h.
                </p>
              </div>
            </Reveal>
            <div style={{ 
              display: 'grid', gridTemplateColumns: '1fr 1.4fr', 
              gap: 40, alignItems: 'start' 
            }}>
              <Reveal from="left">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[ 
                    { icon: '📞', label: 'Téléphone', value: '+216 22 044 105', color: T.green },
                    { icon: '✉️', label: 'Email', value: 'contact@digilabsolutions.tn', color: T.blue },
                    { icon: '🌐', label: 'Site web', value: 'digipip.vercel.app', color: T.gold },
                    { icon: '📍', label: 'Adresse', value: 'Sfax, Tunisie', color: T.purple },
                  ].map((info, i) => (
                    <div key={i} style={{ 
                      display: 'flex', alignItems: 'center', gap: 16, 
                      background: T.card, border: `1px solid ${T.border}`, 
                      borderRadius: 14, padding: '18px 20px' 
                    }}>
                      <div style={{ 
                        width: 44, height: 44, borderRadius: 12, 
                        background: info.color + '18', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', 
                        fontSize: 20, flexShrink: 0 
                      }}>{info.icon}</div>
                      <div>
                        <div style={{ 
                          fontSize: 11, color: 'rgba(255,255,255,0.35)', 
                          fontWeight: 600, marginBottom: 3, 
                          textTransform: 'uppercase', letterSpacing: '0.06em' 
                        }}>{info.label}</div>
                        <div style={{ 
                          fontSize: 14, fontWeight: 700, color: T.white 
                        }}>{info.value}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ 
                    background: `linear-gradient(135deg,rgba(245,166,35,0.08),rgba(79,142,247,0.08))`, 
                    border: `1px solid ${T.border}`, borderRadius: 14, 
                    padding: '20px 22px' 
                  }}>
                    <div style={{ 
                      fontSize: 13, fontWeight: 700, 
                      color: T.gold, marginBottom: 12 
                    }}>✨ Pourquoi choisir DigiPip ?</div>
                    {['Expertise marketing digital & cloud','Support réactif 7j/7','Solutions sur mesure pour agences','Déploiement rapide en 24h'].map((item, i) => (
                      <div key={i} style={{ 
                        display: 'flex', alignItems: 'center', 
                        gap: 10, marginBottom: 8 
                      }}>
                        <div style={{ 
                          width: 18, height: 18, borderRadius: 5, 
                          background: 'rgba(245,166,35,0.15)', 
                          display: 'flex', alignItems: 'center', 
                          justifyContent: 'center', flexShrink: 0 
                        }}>
                          <div style={{ 
                            width: 6, height: 6, borderRadius: '50%', 
                            background: T.gold 
                          }} />
                        </div>
                        <span style={{ 
                          fontSize: 13, 
                          color: 'rgba(255,255,255,0.6)' 
                        }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal from="right">
                <ContactForm />
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ 
          padding: '120px 5%', 
          background: 'rgba(8,12,20,0.30)', backdropFilter: 'blur(20px)', 
          borderTop: `1px solid ${T.border}`, textAlign: 'center', 
          position: 'relative', overflow: 'hidden' 
        }}>
          <Reveal>
            <div style={{ 
              position: 'relative', zIndex: 1, 
              maxWidth: 640, margin: '0 auto' 
            }}>
              <h2 style={{ 
                fontSize: 'clamp(36px,5vw,60px)', fontWeight: 900, 
                letterSpacing: '-0.03em', lineHeight: 1.08, 
                marginBottom: 20 
              }}>
                Prêt à transformer votre<br />agence <span style={{ color: T.gold }}>marketing ?</span>
              </h2>
              <p style={{ 
                fontSize: 17, color: 'rgba(255,255,255,0.4)', 
                lineHeight: 1.75, marginBottom: 48, 
                maxWidth: 500, margin: '0 auto 48px' 
              }}>
                Rejoignez +200 agences qui utilisent déjà DigiPip pour gérer leurs campagnes.
              </p>
              <div style={{ 
                display: 'flex', gap: 14, justifyContent: 'center', 
                flexWrap: 'wrap' 
              }}>
                <button className="btn-gold" onClick={() => navigate('/login')} style={{ 
                  background: T.gold, color: '#111', 
                  border: 'none', padding: '17px 48px', 
                  borderRadius: 12, fontSize: 16, fontWeight: 700, 
                  cursor: 'pointer', fontFamily: T.font 
                }}>Essai gratuit 14 jours →</button>
                <button className="btn-ghost" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} style={{ 
                  background: 'transparent', color: T.white, 
                  border: `1px solid rgba(255,255,255,0.15)`, 
                  padding: '17px 36px', borderRadius: 12, 
                  fontSize: 16, cursor: 'pointer', fontFamily: T.font 
                }}>Demander une démo</button>
              </div>
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer style={{ 
          background: 'rgba(5,8,16,0.95)', 
          backdropFilter: 'blur(20px)', 
          borderTop: `1px solid ${T.border}`, 
          padding: '64px 5% 32px' 
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>

            <div style={{ 
              display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr', 
              gap: 48, marginBottom: 56 
            }}>

              <div>
                <div style={{ 
                  display: 'flex', alignItems: 'center', 
                  gap: 10, marginBottom: 18 
                }}>
                  <div style={{
                    width: 42, height: 42,
                    background: 'linear-gradient(135deg, #f5a623, #d97706)',
                    borderRadius: '50% 40% 65% 45%',
                    display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', fontSize: 24, 
                    color: 'white', boxShadow: '0 4px 15px rgba(245,166,35,0.5)',
                    flexShrink: 0, position: 'relative'
                  }}>
                    ☁️
                    <div style={{
                      position: 'absolute', top: 6, left: 8,
                      width: 12, height: 12,
                      background: 'rgba(255,255,255,0.6)',
                      borderRadius: '50%', filter: 'blur(2px)'
                    }} />
                  </div>
                  <span style={{ 
                    fontSize: 18, fontWeight: 800, 
                    color: T.white, letterSpacing: '-0.02em' 
                  }}>DigiPip</span>
                </div>
                <p style={{ 
                  fontSize: 13, color: 'rgba(255,255,255,0.4)', 
                  lineHeight: 1.75, marginBottom: 22, maxWidth: 280 
                }}>
                  DigiPip est une plateforme cloud tout-en-un pour agences marketing. Gérez vos campagnes Email, SMS et Push, votre infrastructure cloud et votre pipeline DevOps depuis un seul dashboard.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { icon: '🐙', label: 'GitHub', url: 'https://github.com/amenibahri0002' },
                    { icon: '💼', label: 'LinkedIn', url: '#' },
                    { icon: '🌐', label: 'DigiLab', url: 'https://digilabsolutions.tn' },
                  ].map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer"
                      style={{ 
                        width: 36, height: 36, borderRadius: 9, 
                        background: 'rgba(255,255,255,0.05)', 
                        border: `1px solid ${T.border}`, 
                        display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontSize: 16, 
                        textDecoration: 'none', transition: 'all .2s' 
                      }}
                      onMouseEnter={e => { 
                        e.currentTarget.style.background = 'rgba(245,166,35,0.12)'; 
                        e.currentTarget.style.borderColor = 'rgba(245,166,35,0.3)'; 
                      }}
                      onMouseLeave={e => { 
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; 
                        e.currentTarget.style.borderColor = T.border; 
                      }}
                      title={s.label}
                    >{s.icon}</a>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ 
                  fontSize: 12, fontWeight: 800, color: T.white, 
                  letterSpacing: '0.1em', textTransform: 'uppercase', 
                  marginBottom: 20 
                }}>Plateforme</div>
                <div style={{ 
                  display: 'flex', flexDirection: 'column', gap: 10 
                }}>
                  {[
                    ['#marketing', 'Marketing Digital'],
                    ['#services', 'Services'],
                    ['#cloud', 'Cloud Infrastructure'],
                    ['#devops', 'Pipeline DevOps'],
                    ['#campagnes', 'Campagnes'],
                    ['#contact', 'Contact'],
                  ].map(([href, label]) => (
                    <a key={label} href={href}
                      style={{ 
                        fontSize: 13, color: 'rgba(255,255,255,0.4)', 
                        textDecoration: 'none', transition: 'color .2s' 
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = T.gold}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                    >{label}</a>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ 
                  fontSize: 12, fontWeight: 800, color: T.white, 
                  letterSpacing: '0.1em', textTransform: 'uppercase', 
                  marginBottom: 20 
                }}>Fonctionnalités</div>
                <div style={{ 
                  display: 'flex', flexDirection: 'column', gap: 10 
                }}>
                  {[
                    'Campagnes Email',
                    'SMS Marketing',
                    'Push Notifications',
                    'Analytics & KPIs',
                    'Monitoring Live',
                    'CI/CD GitHub Actions',
                  ].map(label => (
                    <span key={label} style={{ 
                      fontSize: 13, 
                      color: 'rgba(255,255,255,0.4)' 
                    }}>{label}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ 
                  fontSize: 12, fontWeight: 800, color: T.white, 
                  letterSpacing: '0.1em', textTransform: 'uppercase', 
                  marginBottom: 20 
                }}>Contact</div>
                <div style={{ 
                  display: 'flex', flexDirection: 'column', gap: 14 
                }}>
                  {[
                    { icon: '📍', text: 'Route Bouzayen Km 5, Immeuble El Bachir 4ème étage, Sfax, Tunisie 3000' },
                    { icon: '✉️', text: 'Contact@digilabsolutions.tn' },
                    { icon: '📞', text: '+216 22 044 105' },
                    { icon: '🌐', text: 'digilabsolutions.tn' },
                  ].map((item, i) => (
                    <div key={i} style={{ 
                      display: 'flex', alignItems: 'flex-start', gap: 10 
                    }}>
                      <span style={{ 
                        fontSize: 16, flexShrink: 0, marginTop: 1 
                      }}>{item.icon}</span>
                      <span style={{ 
                        fontSize: 12, color: 'rgba(255,255,255,0.45)', 
                        lineHeight: 1.6 
                      }}>{item.text}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/login')} style={{ 
                  marginTop: 20, width: '100%', padding: '11px', 
                  background: T.gold, color: '#111', border: 'none', 
                  borderRadius: 9, fontSize: 13, fontWeight: 700, 
                  cursor: 'pointer', fontFamily: T.font, 
                  transition: 'background .2s' 
                }}
                  onMouseEnter={e => e.currentTarget.style.background = T.goldDk}
                  onMouseLeave={e => e.currentTarget.style.background = T.gold}
                >
                  Essai gratuit →
                </button>
              </div>
            </div>

            <div style={{ 
              height: 1, background: T.border, marginBottom: 28 
            }} />

            <div style={{ 
              display: 'flex', justifyContent: 'space-between', 
              alignItems: 'center', flexWrap: 'wrap', gap: 16 
            }}>
              <span style={{ 
                fontSize: 12, color: 'rgba(255,255,255,0.2)' 
              }}>© 2026 DigiPip — by DigiLab Solutions. Tous droits réservés.</span>
              <div style={{ display: 'flex', gap: 20 }}>
                <a href="#" style={{ 
                  fontSize: 12, color: 'rgba(255,255,255,0.2)', 
                  textDecoration: 'none', transition: 'color .2s' 
                }}
                  onMouseEnter={e => e.currentTarget.style.color = T.gold}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                >Mentions légales</a>
                <a href="#" style={{ 
                  fontSize: 12, color: 'rgba(255,255,255,0.2)', 
                  textDecoration: 'none', transition: 'color .2s' 
                }}
                  onMouseEnter={e => e.currentTarget.style.color = T.gold}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                >Politique de confidentialité</a>
              </div>
            </div>
          </div>
        </footer>

      </div>

      <AIChatbot />
      {selectedCamp && <Modal camp={selectedCamp} onClose={() => setSelectedCamp(null)} />}

    </div>
  );
}