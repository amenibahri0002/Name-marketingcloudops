import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import LoginRequiredModal from '../components/LoginRequiredModal';
import { useLoginRequiredModal } from '../hooks/useLoginRequiredModal';

const T = {
  gold:   '#f5a623',
  goldDk: '#d4881a',
  bg:     '#ffffff',
  bg2:    '#fafafa',
  card:   '#ffffff',
  border: 'rgba(0,0,0,0.08)',
  text:   '#1a1a1a',
  textLt: '#666666',
  textMuted: '#999999',
  font:   "'Inter','DM Sans',sans-serif",
};

const TYPE_CFG = {
  formation: { label: 'Formation', icon: '🎓', color: '#f5a623', bg: 'rgba(245,166,35,0.1)' },
  produit:   { label: 'Produit',   icon: '📦', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  conference:{ label: 'Conférence',icon: '🎤', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  email:     { label: 'Email',     icon: '✉',  color: '#f5a623', bg: 'rgba(245,166,35,0.1)' },
  sms:       { label: 'SMS',       icon: '💬', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  push:      { label: 'Push',      icon: '🔔', color: '#f5a623', bg: 'rgba(245,166,35,0.1)' },
};

const CAMP_IMGS = {
  formation_digital_ai: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80',
  formation_web: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
  formation_design: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
  formation_marketing: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80',
  email: 'https://images.unsplash.com/photo-1596526131083-e8c633964948?w=600&q=80',
  sms:   'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80',
  push:  'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80',
};

/* ══════════════════════════════════════════════════════════════
   PARTICLE BACKGROUND
══════════════════════════════════════════════════════════════ */
function ParticleBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    const createParticles = () => {
      particles = [];
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          r: Math.random() * 2 + 0.5,
          dx: (Math.random() - 0.5) * 0.2,
          dy: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.3 + 0.05,
        });
      }
    };
    createParticles();
    let frameId;
    const draw = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      const grad = ctx.createRadialGradient(
        window.innerWidth * 0.5, window.innerHeight * 0.3, 0,
        window.innerWidth * 0.5, window.innerHeight * 0.3, window.innerWidth * 0.8
      );
      grad.addColorStop(0, 'rgba(245,166,35,0.04)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > window.innerWidth) p.dx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,166,35,${p.opacity})`;
        ctx.fill();
      });
      frameId = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frameId); window.removeEventListener('resize', resize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%',
      zIndex: 0, pointerEvents: 'none', display: 'block',
    }} />
  );
}

/* ══════════════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, from = 'bottom' }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); o.disconnect(); }
    }, { threshold: 0.08 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  const tr = from === 'left' ? 'translateX(-40px)' : from === 'right' ? 'translateX(40px)' : 'translateY(30px)';
  return (
    <div ref={ref} style={{
      transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
      opacity: v ? 1 : 0, transform: v ? 'none' : tr,
    }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════════════════════════ */
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
    <span ref={ref} style={{ color, fontWeight: 900, fontSize: 'inherit' }}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   CIRCULAR BADGE
══════════════════════════════════════════════════════════════ */
function CircularBadge({ text, subtext, size = 120, color = T.gold }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, ${color}dd)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 8px 30px ${color}30`, position: 'relative', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `2px dashed ${color}30`, animation: 'spin 20s linear infinite' }} />
      <span style={{ fontSize: size * 0.25, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{text}</span>
      <span style={{ fontSize: size * 0.1, fontWeight: 600, color: '#fff', opacity: 0.8 }}>{subtext}</span>
    </div>
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
  const chatRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e) => {
      if (
        chatRef.current && !chatRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{
        role: 'assistant',
        content: "Bonjour 👋 Je suis l'assistant IA de **DigiPip** by DigiLab Solutions. Comment puis-je vous aider ?"
      }]);
    }
  }, [open, msgs.length]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, loading]);

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
    "Quels services DigiLab propose ?",
    "Comment créer une campagne email ?",
    "Quels sont les tarifs ?",
    "Comment contacter l'agence ?",
  ];
const handleReset = (e) => {
  e.stopPropagation();
  setMsgs([]);
  setHistory([]);
};
  return (
    <>
      <style>{`
        @keyframes chatIn { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:none; } }
        @keyframes pulse2 { 0%,100% { box-shadow:0 0 0 0 rgba(245,166,35,0.4); } 50% { box-shadow:0 0 0 10px rgba(245,166,35,0); } }
        @keyframes typing { 0%,80%,100% { transform:scale(0); opacity:0.3; } 40% { transform:scale(1); opacity:1; } }
        .chat-bubble-user { background:${T.gold}; color:#111; border-radius:18px 18px 4px 18px; }
        .chat-bubble-bot { background:#f5f5f5; color:#1a1a1a; border-radius:18px 18px 18px 4px; border:1px solid rgba(0,0,0,0.06); }
        .sugg-btn:hover { background:rgba(245,166,35,0.12) !important; border-color:rgba(245,166,35,0.3) !important; color:#d4881a !important; }
        .chat-input:focus { outline:none; border-color:rgba(245,166,35,0.5) !important; box-shadow:0 0 0 3px rgba(245,166,35,0.08); }
        .send-btn:hover { background:${T.goldDk} !important; }
        .send-btn:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>
      <button onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 9000,
        width: 60, height: 60, borderRadius: '50%',
        background: open ? '#333' : T.gold, border: 'none', cursor: 'pointer',
        fontSize: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 28px rgba(245,166,35,0.4)', transition: 'all 0.25s',
        animation: !open ? 'pulse2 2.5s infinite' : 'none',
      }} title="Assistant IA DigiPip">{open ? '✕' : '🤖'}</button>
      {!open && (
        <div style={{ position: 'fixed', bottom: 78, right: 28, zIndex: 9001, width: 14, height: 14, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>1</span>
        </div>
      )}
      {open && (
             
              <div onClick={(e) => e.stopPropagation()} style={{ position: 'fixed', bottom: 78, right: 28, zIndex: 9001, width: 380, maxHeight: 'calc(100vh - 120px)', background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'chatIn 0.3s cubic-bezier(0.34,1.56,0.64,1)', fontFamily: T.font }}>
          <div style={{ padding: '16px 20px', background: '#fafafa', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: '50%', background: '#10b981', border: '2px solid #fff', boxShadow: '0 0 6px #10b981' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Assistant DigiLab</div>
              <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                En ligne · Propulsé par Claude IA
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={handleReset} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,0,0,0.04)', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↺</button>
              <button onClick={(e) => { e.stopPropagation(); setOpen(false); }} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(0,0,0,0.04)', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                {m.role === 'assistant' && <div style={{ width: 28, height: 28, borderRadius: 8, background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🤖</div>}
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
                <button key={i} className="sugg-btn" onClick={() => sendMessage(s)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 500, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)', color: T.textMuted, cursor: 'pointer', fontFamily: T.font, transition: 'all .2s' }}>{s}</button>
              ))}
            </div>
          )}
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input ref={inputRef} className="chat-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()} placeholder="Posez votre question..." disabled={loading} style={{ flex: 1, padding: '11px 14px', background: '#f5f5f5', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, fontSize: 13.5, color: T.text, fontFamily: T.font, transition: 'border .2s, box-shadow .2s' }} />
            <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ width: 42, height: 42, borderRadius: 12, background: T.gold, border: 'none', color: '#111', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s', flexShrink: 0 }}>➤</button>
          </div>
          <div style={{ padding: '6px 0 10px', textAlign: 'center', fontSize: 10, color: T.textMuted }}>Propulsé par Claude AI · DigiLab Solutions © 2026</div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   SERVICE CARD
══════════════════════════════════════════════════════════════ */
function ServiceCard({ icon, title, description, features, color, stat, statLabel, index, img }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={index * 100}>
      <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          background: T.card, border: `1px solid ${hovered ? color + '40' : T.border}`,
          borderRadius: 20, overflow: 'hidden', position: 'relative',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: hovered ? 'translateY(-8px)' : 'none',
          boxShadow: hovered ? '0 24px 60px rgba(0,0,0,0.12)' : '0 2px 12px rgba(0,0,0,0.04)',
        }}>
        <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
          <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease', transform: hovered ? 'scale(1.1)' : 'scale(1)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(255,255,255,0.95) 100%)' }} />
          <div style={{ position: 'absolute', top: 16, left: 16, width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.9)', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, backdropFilter: 'blur(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>{icon}</div>
        </div>
        <div style={{ padding: '24px 28px 28px' }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 10 }}>{title}</h3>
          <p style={{ fontSize: 14, color: T.textLt, lineHeight: 1.7, marginBottom: 20 }}>{description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                </div>
                <span style={{ fontSize: 13, color: T.textLt }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ background: `linear-gradient(135deg, ${color}08, transparent)`, border: `1px solid ${color}15`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{statLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════════════ */
function Modal({ camp, onClose }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { isOpen, selectedCampagne, openModal, closeModal } = useLoginRequiredModal();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const tc = TYPE_CFG[camp.type?.toLowerCase()] || TYPE_CFG.formation;

  const submit = async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try { await api.post(`/api/campagnes/${camp.id}/inscrire`); setDone(true); }
    catch (e) { alert(e.response?.data?.message || e.message); }
    finally { setLoading(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 20, width: '100%', maxWidth: 520, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.15)', animation: 'mIn 0.3s ease' }}>
        <div style={{ padding: '24px 28px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: tc.color, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>{tc.icon} {tc.label}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: 0 }}>{camp.title}</h2>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(0,0,0,0.04)', border: 'none', color: T.textMuted, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 28 }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
              <h3 style={{ color: '#10b981', margin: '0 0 8px', fontSize: 20 }}>inscription réussie !</h3>
              <p style={{ fontSize: 14, color: T.textLt, marginBottom: 16 }}>Vous êtes inscrit à la campagne <strong>{camp.title}</strong>.</p>
              <button onClick={onClose} style={{ marginTop: 16, background: T.gold, color: '#111', border: 'none', padding: '12px 32px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>Fermer</button>
            </div>
          ) : !token ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>🔒</div>
              <p style={{ color: T.textLt, marginBottom: 24, lineHeight: 1.6 }}>Connectez-vous pour vous inscrire à cette campagne.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: 'none', color: T.textLt, cursor: 'pointer' }}>Annuler</button>
                <button onClick={() => navigate('/login')} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: T.gold, color: '#111', fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>Se connecter →</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {camp.tags?.map((tag, i) => (
                  <span key={i} style={{ padding: '4px 12px', background: tc.bg, borderRadius: 20, fontSize: 11, fontWeight: 700, color: tc.color }}>{tag}</span>
                ))}
              </div>
              <p style={{ color: T.textLt, lineHeight: 1.7, marginBottom: 20, fontSize: 14 }}>{camp.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Durée</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{camp.duration}</div>
                </div>
                <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Format</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{camp.format}</div>
                </div>
                <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Contact</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{camp.contact}</div>
                </div>
                <div style={{ padding: '12px 16px', background: '#fafafa', borderRadius: 10, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Lieu</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{camp.location}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: 'none', color: T.textLt, cursor: 'pointer', fontFamily: T.font }}>Annuler</button>
                <button onClick={submit} disabled={loading} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: T.gold, color: '#111', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: T.font }}>
                  {loading ? 'inscription...' : "✓ S'inscrire à la campagne"}
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

/* ══════════════════════════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════════════════════════ */
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true); setError('');
    try {
      const response = await fetch('https://marketingcloudops-backend.onrender.com/api/auth/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setSent(true);
    } catch (err) { setError("Erreur d'envoi. Veuillez réessayer."); }
    finally { setSending(false); }
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '13px 16px', background: '#fafafa',
    border: `1.5px solid ${focused === field ? T.gold : 'rgba(0,0,0,0.08)'}`,
    borderRadius: 10, fontSize: 14, color: T.text, fontFamily: T.font,
    transition: 'border .2s, box-shadow .2s', outline: 'none',
    boxSizing: 'border-box', boxShadow: focused === field ? '0 0 0 3px rgba(245,166,35,0.08)' : 'none',
  });

  if (sent) {
    return (
      <div style={{ background: '#fff', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, color: '#10b981', marginBottom: 10 }}>Message envoyé !</h3>
        <p style={{ fontSize: 14, color: T.textLt, lineHeight: 1.6, marginBottom: 28 }}>
          Merci <strong style={{ color: T.text }}>{form.name}</strong> ! Notre équipe vous contactera sous 24h à <strong style={{ color: T.text }}>{form.email}</strong>.
        </p>
        <button onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', subject:'', message:'' }); }}
          style={{ padding: '12px 28px', background: T.gold, color: '#111', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: T.font }}>
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 20, padding: '36px 36px', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 6 }}>Envoyez-nous un message</h3>
        <p style={{ fontSize: 13, color: T.textMuted }}>Remplissez le formulaire et nous vous répondrons rapidement.</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', fontSize: 13 }}>{error}</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Nom complet *</label>
            <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} placeholder="Jean Dupont" style={inputStyle('name')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email *</label>
            <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="vous@exemple.com" style={inputStyle('email')} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} placeholder="+216 XX XXX XXX" style={inputStyle('phone')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Sujet</label>
            <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)} style={{ ...inputStyle('subject'), cursor: 'pointer' }}>
              <option value="demo">Demander une démo DigiPip</option>
              <option value="campagne">S'inscrire à une campagne</option>
              <option value="formation">Demander une formation</option>
              <option value="pricing">Tarifs & abonnements</option>
              <option value="support">Support technique</option>
              <option value="agency">Intégration pour mon agence</option>
              <option value="other">Autre</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.textMuted, marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Message *</label>
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
        <p style={{ fontSize: 11, color: T.textMuted, textAlign: 'center' }}>Réponse garantie sous 24h · DigiLab Solutions © 2026</p>
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOMEPAGE — DIGILAB SOLUTIONS PLATFORM
══════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { isOpen, selectedCampagne, openModal, closeModal } = useLoginRequiredModal();
  const [campagnes, setCampagnes] = useState([]);
const [loadingCampagnes, setLoadingCampagnes] = useState(true);
const [scrolled, setScrolled] = useState(false);
const [selectedCamp, setSelectedCamp] = useState(null);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', s);
    return () => window.removeEventListener('scroll', s);
  }, []);

useEffect(() => {
  const fetchCampagnes = async () => {
    try {
      setLoadingCampagnes(true);
      const response = await api.get('/api/campagnes/public');
      
      if (response.data && response.data.length > 0) {
        setCampagnes(response.data);
      } else {
        setCampagnes([]);
      }
    } catch (err) {
      console.error('Erreur chargement campagnes:', err);
      setCampagnes([]);
    } finally {
      setLoadingCampagnes(false);
    }
  };

  fetchCampagnes();
}, []);

  // DIGILAB SOLUTIONS DATA
  const MARKETING_SERVICES = [
    { icon: '🎨', color: '#f5a623', title: 'Création Graphique', img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80', description: 'Conception visuelle professionnelle pour votre marque : logos, affiches, brochures, packaging et identité visuelle complète.', features: ['Design logos', 'Charte graphique', 'Print & digital', 'Branding'], stat: { icon: '🎯', value: '500+' }, statLabel: 'Projets réalisés' },
    { icon: '📱', color: '#10b981', title: 'Community Management', img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80', description: 'Gestion complète de vos réseaux sociaux avec stratégie de contenu, modération et analyse des performances.', features: ['Stratégie RS', 'Calendrier éditorial', 'Modération', 'Reporting'], stat: { icon: '📈', value: '50+' }, statLabel: 'Comptes gérés' },
    { icon: '🎬', color: '#f5a623', title: 'Production Vidéo', img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&q=80', description: 'Création de contenu vidéo professionnel : spots publicitaires, motion design, vidéos corporate et reels.', features: ['Tournage', 'Montage', 'Motion design', 'Drone'], stat: { icon: '🎥', value: '200+' }, statLabel: 'Vidéos produites' },
    { icon: '💻', color: '#7c3aed', title: 'Développement Web', img: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80', description: 'Sites web et applications sur mesure avec les dernières technologies : React, Node.js, cloud et CI/CD.', features: ['Sites vitrines', 'E-commerce', 'Applications web', 'API REST'], stat: { icon: '⚡', value: '100+' }, statLabel: 'Sites livrés' },
    { icon: '📧', color: '#f97316', title: 'Email & SMS Marketing', img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80', description: 'Campagnes email et SMS personnalisées avec segmentation avancée, A/B testing et analytics en temps réel.', features: ['Templates HTML', 'Segmentation', 'A/B Testing', 'Automatisation'], stat: { icon: '📊', value: '15M+' }, statLabel: 'Messages envoyés' },
    { icon: '🤖', color: '#ec4899', title: 'Assistant IA Claude', img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80', description: 'Intelligence artificielle intégrée pour optimiser vos campagnes, générer du contenu et analyser vos données.', features: ['Chatbot IA', 'Génération contenu', 'Analyse données', 'Support 24/7'], stat: { icon: '🧠', value: '< 2s' }, statLabel: 'Temps de réponse' },
  ];

  const PRICING = [
    { name: 'Essentiel', price: 'À partir de 500 DT', period: '/mois', description: 'Pour les TPE et indépendants', features: ['1 réseau social', '4 posts/mois', 'Rapport mensuel', 'Support email'], cta: 'Commencer', popular: false },
    { name: 'Business', price: 'À partir de 1 500 DT', period: '/mois', description: 'Pour les PME en croissance', features: ['3 réseaux sociaux', '12 posts/mois', 'Stories & Reels', 'Campagnes sponsorisées', 'Rapport hebdo', 'Community manager dédié'], cta: 'Rejoindre DigiLab', popular: true },
    { name: 'Premium', price: 'Sur devis', period: '', description: 'Pour les entreprises et grands comptes', features: ['Tous réseaux sociaux', 'Posts illimités', 'Production vidéo', 'Influence marketing', 'Stratégie sur mesure', 'Account manager dédié'], cta: 'Contacter ventes', popular: false },
  ];

  const TESTIMONIALS = [
    { name: 'Ahmed Ben Salah', role: 'CEO, TechStart Tunisie', text: "DigiLab Solutions a transformé notre présence digitale. Leur équipe créative et réactive a dépassé toutes nos attentes. Nos leads ont augmenté de 300% en 6 mois.", avatar: 'A' },
    { name: 'Fatima Trabelsi', role: 'Directrice Marketing, Sfax Retail', text: "La plateforme DigiPip nous fait gagner un temps précieux. La gestion centralisée de nos campagnes email et SMS est intuitive et puissante.", avatar: 'F' },
    { name: 'Karim Mansour', role: 'Fondateur, EcoStore', text: "Leur expertise en e-commerce et en référencement naturel nous a permis de passer de 0 à 10 000 ventes en ligne en moins d'un an. Un partenaire de confiance.", avatar: 'K' },
  ];

  const PROCESS_STEPS = [
    { num: '01', title: 'Audit & Stratégie', desc: 'Analyse de votre présence digitale actuelle et définition d\'une stratégie personnalisée alignée sur vos objectifs business.' },
    { num: '02', title: 'Création & Déploiement', desc: 'Conception et mise en œuvre de vos campagnes avec nos outils DigiPip : design, contenu, développement et lancement.' },
    { num: '03', title: 'Analyse & Optimisation', desc: 'Suivi des performances en temps réel, rapports détaillés et ajustements continus pour maximiser votre ROI.' },
  ];

  const CLIENTS = [
    'TechStart', 'Sfax Retail', 'EcoStore', 'MediaPro', 'TunisAir'
  ];

  return (
    <div style={{ fontFamily: T.font, color: T.text, minHeight: '100vh', overflowX: 'hidden', position: 'relative', background: T.bg }}>
      <ParticleBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          * { box-sizing:border-box; margin:0; padding:0; }
          html { scroll-behavior:smooth; }
          ::-webkit-scrollbar { width:4px; }
          ::-webkit-scrollbar-thumb { background:rgba(245,166,35,0.4); border-radius:2px; }
          @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
          @keyframes spin { to { transform:rotate(360deg); } }
          .nav-a { color:rgba(0,0,0,0.5); text-decoration:none; font-size:14px; font-weight:500; transition:color .2s; }
          .nav-a:hover { color:#1a1a1a; }
          .btn-gold { transition:all .2s; }
          .btn-gold:hover { background:#d4881a !important; transform:translateY(-2px); box-shadow:0 12px 36px rgba(245,166,35,0.3) !important; }
          .btn-ghost { transition:all .2s; }
          .btn-ghost:hover { background:rgba(0,0,0,0.04) !important; border-color:rgba(0,0,0,0.2) !important; }
          .camp-card { transition:all .3s; }
          .camp-card:hover { transform:translateY(-6px); box-shadow:0 24px 60px rgba(0,0,0,0.1) !important; border-color:rgba(245,166,35,0.2) !important; }
          .pricing-card { transition:all .3s; }
          .pricing-card:hover { transform:translateY(-8px); box-shadow:0 24px 60px rgba(0,0,0,0.1) !important; }
          .pricing-popular { border-color:rgba(245,166,35,0.5) !important; box-shadow:0 0 40px rgba(245,166,35,0.1) !important; }
          .testimonial-card { transition:all .3s; }
          .testimonial-card:hover { transform:translateY(-4px); border-color:rgba(245,166,35,0.2) !important; }
          .client-logo { filter: grayscale(100%); opacity: 0.5; transition: all .3s; }
          .client-logo:hover { filter: grayscale(0%); opacity: 1; }
          .formation-tag { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; margin-right:6px; margin-bottom:6px; }
          .camp-type-badge { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }
        `}</style>

        {/* NAVBAR */}
        <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 72, background: scrolled ? 'rgba(255,255,255,0.98)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? `1px solid ${T.border}` : '1px solid transparent', transition: 'all 0.35s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #f5a623, #d97706)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white', boxShadow: '0 4px 15px rgba(245,166,35,0.3)', flexShrink: 0 }}>☁️</div>
            <div>
              <div style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.02em', color: T.text }}>Digi<span style={{ color:T.gold }}>Pip</span></div>
              <div style={{ fontSize:9, color:T.textMuted, letterSpacing:'0.06em' }}>by DigiLab Solutions</div>
            </div>
          </div> 
          <div style={{ display: 'flex', gap: 32 }}>
            {[['#hero','Accueil'],['#services','Services'],['#about','À propos'],['#process','Processus'],['#pricing','Tarifs'],['#campagnes','Campagnes'],['#contact','Contact']].map(([h,l]) => (
              <a key={l} className="nav-a" href={h}>{l}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-ghost" onClick={() => navigate('/login')} style={{ background: 'transparent', color: T.text, border: `1px solid rgba(0,0,0,0.12)`, padding: '10px 22px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: T.font }}>Se connecter</button>
            <button className="btn-gold" onClick={() => navigate('/login')} style={{ background: T.gold, color: '#111', border: 'none', padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>Espace Client →</button>
          </div>
        </nav>

        {/* HERO */}
        <section id="hero" style={{ minHeight: '100vh', padding: '140px 5% 80px', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 80, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 30, padding: '8px 20px', marginBottom: 32 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.gold }}>🚀 Plateforme Cloud & Marketing</span>
              </div>
              <h1 style={{ fontSize: 'clamp(44px,5.5vw,72px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24, color: T.text }}>
                Gérez vos campagnes<br /><span style={{ color: T.gold }}>marketing</span><br />sur tous les canaux pour vos clients
              </h1>
              <p style={{ fontSize: 18, color: T.textLt, lineHeight: 1.75, maxWidth: 520, marginBottom: 40 }}>
DigiPip est la plateforme de DigiLab Solutions pour créer, planifier et suivre vos campagnes — le tout depuis un seul tableau de bord.              </p>
              <div style={{ display: 'flex', gap: 14, marginBottom: 48, flexWrap: 'wrap' }}>
                <button className="btn-gold" onClick={() => navigate('/login')} style={{ background: T.gold, color: '#111', border: 'none', padding: '16px 40px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>Espace Client DigiPip →</button>
                <button className="btn-ghost" onClick={() => document.getElementById('campagnes')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: T.text, border: `1px solid rgba(0,0,0,0.12)`, padding: '16px 32px', borderRadius: 12, fontSize: 15, cursor: 'pointer', fontFamily: T.font }}>Nos Campagnes ↓</button>
              </div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[['🎨','Création Graphique'],['📱','Social Media'],['🎬','Production Vidéo'],['💻','Développement Web']].map(([icon,label],i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,166,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.textLt }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 420, height: 520, borderRadius: 24, overflow: 'hidden', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.12)' }}>
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&q=80" alt="DigiLab Team" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(255,255,255,0.6) 0%, transparent 50%)' }} />
              </div>
              <div style={{ position: 'absolute', bottom: 60, right: -20, animation: 'float 4s ease-in-out infinite' }}>
                <CircularBadge text="500+" subtext="Projets" size={110} color={T.gold} />
              </div>
              <div style={{ position: 'absolute', top: 40, left: -30, display: 'flex', alignItems: 'center' }}>
                {['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&q=80','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&q=80'].map((src, i) => (
                  <img key={i} src={src} alt="" style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #fff', marginLeft: i > 0 ? -12 : 0, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                ))}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -12, border: '3px solid #fff', fontSize: 12, fontWeight: 800, color: '#111', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>+50</div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section style={{ padding: '0 5% 100px' }}>
          <Reveal>
            <div style={{ maxWidth: 1200, margin: '0 auto', background: '#fff', border: `1px solid ${T.border}`, borderRadius: 24, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
              <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(245,166,35,0.06), transparent 70%)', pointerEvents: 'none' }} />
              {[
                { value: 500, suffix: '+', label: 'Projets réalisés', color: T.gold },
                { value: 50, suffix: '+', label: 'Clients satisfaits', color: T.text },
                { value: 99, suffix: '.9%', label: 'Taux de satisfaction', color: '#10b981' },
                { value: 10, suffix: '+', label: 'Années d\'expérience', color: T.gold },
              ].map((stat, i) => (
                <div key={i} style={{ padding: '48px 28px', textAlign: 'center', borderRight: i < 3 ? `1px solid ${T.border}` : 'none', position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 12, color: stat.color }}>
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} color={stat.color} />
                  </div>
                  <div style={{ fontSize: 13, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* SERVICES */}
        <section id="services" style={{ padding: '100px 5%', background: '#fafafa' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Nos Services</span>
                </div>
                <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1, color: T.text }}>
                  Solutions Digitales <span style={{ color: T.gold }}>Sur Mesure</span>
                </h2>
                <p style={{ color: T.textLt, fontSize: 17, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                  De la stratégie à l'exécution, nous couvrons tous les aspects du marketing digital pour faire croître votre entreprise.
                </p>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {MARKETING_SERVICES.map((s, i) => (
                <ServiceCard key={i} {...s} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" style={{ padding: '100px 5%', background: '#fff', borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
              <Reveal from="left">
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.15em', textTransform: 'uppercase' }}>À Propos de DigiLab</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1, color: T.text }}>
                    Une agence digitale<br />passionnée à <span style={{ color: T.gold }}>Sfax</span>
                  </h2>
                  <p style={{ fontSize: 16, color: T.textLt, lineHeight: 1.85, marginBottom: 24 }}>
                    DigiLab Solutions est une agence de marketing digital et de communication créative basée à Sfax, en Tunisie. Depuis plus de 10 ans, nous accompagnons les entreprises locales et internationales dans leur transformation digitale.
                  </p>
                  <p style={{ fontSize: 16, color: T.textLt, lineHeight: 1.85, marginBottom: 32 }}>
                    Notre équipe pluridisciplinaire combine expertise technique et créativité pour offrir des solutions sur mesure : création graphique, community management, production vidéo, développement web et marketing digital.
                  </p>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <button className="btn-gold" onClick={() => document.getElementById('campagnes')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: T.gold, color: '#111', border: 'none', padding: '14px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>Découvrir nos Campagnes →</button>
                  </div>
                </div>
              </Reveal>
              <Reveal from="right">
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ width: 380, height: 380, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(245,166,35,0.08), rgba(124,58,237,0.08))', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ width: 280, height: 280, borderRadius: '50%', border: '2px dashed rgba(245,166,35,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', animation: 'spin 30s linear infinite' }}>
                      {['C','R','E','A','T','I','V','E','A','G','E','N'].map((letter, i) => (
                        <span key={i} style={{ position: 'absolute', transform: `rotate(${i * 30}deg) translateY(-130px)`, fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{letter}</span>
                      ))}
                      <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #f5a623, #d4881a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(245,166,35,0.3)' }}>
                        <span style={{ fontSize: 40 }}>☁️</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" style={{ padding: '100px 5%', background: '#fafafa' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Notre Méthodologie</span>
                </div>
                <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1, color: T.text }}>
                  Comment nous <span style={{ color: T.gold }}>travaillons</span>
                </h2>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 50, left: '20%', right: '20%', height: 2, background: 'rgba(0,0,0,0.06)' }}>
                <div style={{ height: '100%', background: `linear-gradient(90deg, ${T.gold}, transparent)`, width: '66%' }} />
              </div>
              {PROCESS_STEPS.map((step, i) => (
                <Reveal key={i} delay={i * 150}>
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(245,166,35,0.08)', border: `2px solid ${i === 0 ? T.gold : 'rgba(0,0,0,0.08)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: i === 0 ? '0 0 30px rgba(245,166,35,0.1)' : 'none' }}>
                      <span style={{ fontSize: 28, fontWeight: 900, color: T.gold }}>{step.num}</span>
                    </div>
                    <h4 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 12 }}>{step.title}</h4>
                    <p style={{ fontSize: 14, color: T.textLt, lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PORTFOLIO */}
        <section style={{ padding: '100px 5%', background: '#fff', borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Portfolio</span>
                </div>
                <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1, color: T.text }}>
                  Nos <span style={{ color: T.gold }}>Réalisations</span>
                </h2>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80','https://images.unsplash.com/photo-1558655146-d09347e92766?w=500&q=80','https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=500&q=80','https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80','https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&q=80','https://images.unsplash.com/photo-1531498860502-7c67cf02f657?w=500&q=80'].map((src, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', aspectRatio: '4/3', cursor: 'pointer' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} onMouseEnter={e => e.target.style.transform = 'scale(1.1)'} onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)', opacity: 0, transition: 'opacity 0.3s' }} className="portfolio-overlay" />
                    <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, opacity: 0, transform: 'translateY(10px)', transition: 'all 0.3s ease' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Projet {i + 1}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>DigiLab Solutions</div>
                    </div>
                    <style>{`.portfolio-overlay { opacity: 0 !important; } div:hover .portfolio-overlay { opacity: 1 !important; } div:hover div:last-child { opacity: 1 !important; transform: translateY(0) !important; }`}</style>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* WHY CHOOSE */}
        <section style={{ padding: '100px 5%', background: '#fafafa' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
              <Reveal from="left">
                <div style={{ position: 'relative' }}>
                  <img src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=600&q=80" alt="DigiLab Team" style={{ width: '100%', borderRadius: 20, boxShadow: '0 40px 80px rgba(0,0,0,0.08)' }} />
                  <div style={{ position: 'absolute', bottom: -20, right: -20, width: 160, height: 160, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(245,166,35,0.15), rgba(124,58,237,0.15))', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 32, fontWeight: 900, color: T.gold }}>10+</div>
                      <div style={{ fontSize: 11, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ans d'expérience</div>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal from="right">
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Pourquoi Nous Choisir</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1, color: T.text }}>
                    Votre partenaire<br /><span style={{ color: T.gold }}>digital de confiance</span>
                  </h2>
                  <p style={{ fontSize: 16, color: T.textLt, lineHeight: 1.85, marginBottom: 32 }}>
                    Chez DigiLab Solutions, nous ne créons pas juste des campagnes, nous construisons des relations durables avec nos clients. Notre approche data-driven et créative garantit des résultats mesurables.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                      { icon: '🎯', title: 'Résultats Mesurables', desc: 'KPIs clairs et reporting transparent pour suivre chaque dinar investi.', color: T.gold },
                      { icon: '⚡', title: 'Réactivité & Agilité', desc: 'Une équipe réactive qui s\'adapte rapidement aux évolutions de votre marché.', color: '#10b981' },
                      { icon: '🤝', title: 'Accompagnement Personnalisé', desc: 'Un account manager dédié pour chaque client, disponible et à l\'écoute.', color: '#7c3aed' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ width: 50, height: 50, borderRadius: 12, background: item.color + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                        <div>
                          <h4 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>{item.title}</h4>
                          <p style={{ fontSize: 14, color: T.textLt, lineHeight: 1.6 }}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section style={{ padding: '100px 5%', background: '#fff', borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Témoignages</span>
                </div>
                <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1, color: T.text }}>
                  Ils nous <span style={{ color: T.gold }}>font confiance</span>
                </h2>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="testimonial-card" style={{ background: '#fafafa', border: `1px solid ${T.border}`, borderRadius: 20, padding: '32px', position: 'relative' }}>
                    <div style={{ fontSize: 60, color: 'rgba(245,166,35,0.1)', position: 'absolute', top: 16, right: 20, fontFamily: 'Georgia, serif', lineHeight: 1 }}>"</div>
                    <p style={{ fontSize: 15, color: T.textLt, lineHeight: 1.8, marginBottom: 28, fontStyle: 'italic' }}>{t.text}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${T.gold}, ${T.goldDk})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#111' }}>{t.avatar}</div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: T.textMuted }}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CLIENTS LOGOS */}
        <section style={{ padding: '60px 5%', background: '#fafafa', borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Ils nous font confiance</h3>
              </div>
            </Reveal>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
              {CLIENTS.map((name, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="client-logo" style={{ fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>{name}</div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{ padding: '100px 5%', background: '#fafafa' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Nos Tarifs</span>
                </div>
                <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1, color: T.text }}>
                  Des offres <span style={{ color: T.gold }}>adaptées</span>
                </h2>
                <p style={{ color: T.textLt, fontSize: 17, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                  Des forfaits flexibles pour répondre à tous les besoins, des startups aux grandes entreprises.
                </p>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, alignItems: 'start' }}>
              {PRICING.map((plan, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className={`pricing-card ${plan.popular ? 'pricing-popular' : ''}`} style={{ background: '#fff', border: `1px solid ${plan.popular ? 'rgba(245,166,35,0.5)' : T.border}`, borderRadius: 20, padding: '40px 32px', position: 'relative', boxShadow: plan.popular ? '0 0 40px rgba(245,166,35,0.1)' : '0 2px 12px rgba(0,0,0,0.04)' }}>
                    {plan.popular && (
                      <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: T.gold, color: '#111', padding: '6px 18px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Le plus populaire
                      </div>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, color: plan.popular ? T.gold : T.textMuted, marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{plan.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                      <span style={{ fontSize: 28, fontWeight: 900, color: T.text, letterSpacing: '-0.04em' }}>{plan.price}</span>
                      <span style={{ fontSize: 14, color: T.textMuted }}>{plan.period}</span>
                    </div>
                    <p style={{ fontSize: 13, color: T.textLt, marginBottom: 28, lineHeight: 1.5 }}>{plan.description}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                      {plan.features.map((f, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: plan.popular ? 'rgba(245,166,35,0.12)' : 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 10, color: plan.popular ? T.gold : '#10b981', fontWeight: 700 }}>✓</span>
                          </div>
                          <span style={{ fontSize: 13, color: T.textLt }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '14px', background: plan.popular ? T.gold : 'transparent', color: plan.popular ? '#111' : T.text, border: `1px solid ${plan.popular ? T.gold : T.border}`, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, transition: 'all .2s' }}
                      onMouseEnter={e => { if (!plan.popular) { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}}
                      onMouseLeave={e => { if (!plan.popular) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = T.border; }}}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
           CAMPAGNES - Événements multi-types gérés par DigiPip (DevOps & Cloud)
        ═══════════════════════════════════════════════════════════════ */}
         <section id="campagnes" style={{ padding: '100px 5%', background: '#fff', borderTop: `1px solid ${T.border}` }}>
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Reveal>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'block', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Plateforme DigiPip</span>
          </div>
          <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1, color: T.text }}>
            Nos <span style={{ color: T.gold }}>Campagnes</span>
          </h2>
          <p style={{ color: T.textLt, fontSize: 17, maxWidth: 640, margin: '0 auto', lineHeight: 1.7 }}>
            Gérez vos campagnes multi-canal depuis DigiPip : <strong>formations</strong>, <strong>produits</strong>, <strong>conférences</strong> — orchestrées avec DevOps & Cloud.
          </p>
        </div>
      </Reveal>
      
      {loadingCampagnes ? (
        <div style={{ textAlign: 'center', padding: 60, color: T.textMuted }}>
          <div style={{ 
            width: 40, height: 40, 
            border: '3px solid rgba(245,166,35,0.15)', 
            borderTop: '3px solid #f5a623', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          Chargement des campagnes...
        </div>
      ) : campagnes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 16 }}>📢</div>
          <p style={{ color: T.textMuted }}>Aucune campagne disponible pour le moment.</p>
          <button className="btn-gold" onClick={() => navigate('/login')} style={{ marginTop: 20, background: T.gold, color: '#111', border: 'none', padding: '12px 32px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>Accéder à DigiPip →</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 28 }}>
          {campagnes.map((c, idx) => {
            const tc = TYPE_CFG[c.type?.toLowerCase()] || TYPE_CFG.formation;
            return (
              <Reveal key={c.id} delay={idx * 100}>
                <div className="camp-card" style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 20, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {/* Image */}
                  <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={c.image || 'https://via.placeholder.com/400x200?text=Formation'} 
                      alt={c.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                      onMouseEnter={e => e.target.style.transform = 'scale(1.08)'} 
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'} 
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6))' }} />
                    
                    {/* Badge type dynamique */}
                    <div className="camp-type-badge" style={{ position: 'absolute', top: 16, left: 16, background: tc.color, color: '#fff' }}>
                      {tc.icon} {tc.label}
                    </div>
                    
                    {/* Durée */}
                    <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#fff' }}>
                      ⏱ {c.duration || 'Variable'}
                    </div>
                  </div>
                  
                  {/* Contenu */}
                  <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {(c.tags || []).map((tag, ti) => (
                        <span key={ti} className="formation-tag" style={{ background: ti === 0 ? 'rgba(245,166,35,0.1)' : 'rgba(16,185,129,0.1)', color: ti === 0 ? T.gold : '#10b981', border: `1px solid ${ti === 0 ? 'rgba(245,166,35,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, lineHeight: 1.35, color: T.text }}>{c.title}</h3>
                    
                    <p style={{ fontSize: 13.5, color: T.textLt, lineHeight: 1.7, marginBottom: 16, flex: 1 }}>
                      {(c.description || '').substring(0, 140)}...
                    </p>
                    
                    {/* Outils */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Outils & Technologies</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(c.tools || []).map((tool, ti) => (
                          <span key={ti} style={{ padding: '4px 10px', background: '#f5f5f5', borderRadius: 6, fontSize: 11, fontWeight: 600, color: T.textLt }}>
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Infos pratiques */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18, padding: '12px 14px', background: '#fafafa', borderRadius: 12, border: `1px solid ${T.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textLt }}>
                        <span>📍</span> {c.location || 'Sfax, Tunisia'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textLt }}>
                        <span>📞</span> {c.contact || '+216 22 044 105'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.textLt }}>
                        <span>✨</span> {c.format || '100% Pratique'}
                      </div>
                    </div>
                    
                    {/* Prix et bouton */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div>
                        {c.prixOriginal && c.prixOriginal > c.prix && (
                          <span style={{ fontSize: 14, color: T.textMuted, textDecoration: 'line-through', marginRight: 8 }}>
                            {c.prixOriginal} TND
                          </span>
                        )}
                        <span style={{ fontSize: 22, fontWeight: 800, color: T.gold }}>
                          {c.prix} TND
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          if (!token) {
                            openModal('/LoginRequiredModal');
                          } else {
                            navigate(`/campagnes/${c.slug}`);
                          }
                        }}
                        style={{ 
                          padding: '10px 20px', 
                          background: T.gold, 
                          color: '#111', 
                          border: 'none', 
                          borderRadius: 10,
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'pointer',
                          fontFamily: T.font,
                          transition: 'background .2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = T.goldDk}
                        onMouseLeave={e => e.currentTarget.style.background = T.gold}
                      >
                        Voir & S'inscrire →
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
      
      {/* DevOps & Cloud Banner */}
      <Reveal>
        <div style={{ marginTop: 56, background: 'linear-gradient(135deg, #1a1a2e, #16213e)', borderRadius: 20, padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(245,166,35,0.15), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 20, padding: '4px 14px', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>DevOps & Cloud</span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Gestion multi-tenant de vos campagnes</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 500, lineHeight: 1.7 }}>
              DigiPip orchestre vos campagnes Email, SMS, Push et Réseaux Sociaux via une infrastructure cloud scalable. CI/CD, monitoring en temps réel et multi-tenant.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16, position: 'relative', zIndex: 1 }}>
            {['☁️ Cloud','⚙️ DevOps','🔒 Sécurisé','📊 Analytics'].map((badge, i) => (
              <div key={i} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#fff', backdropFilter: 'blur(10px)' }}>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  </section>


        {/* CONTACT */}
        <section id="contact" style={{ padding: '100px 5%', background: '#fafafa', borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 56 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.gold, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Contact</span>
                </div>
                <h2 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1, color: T.text }}>
                  Besoin d'aide ? <span style={{ color: T.gold }}>Contactez-nous</span>
                </h2>
                <p style={{ color: T.textLt, fontSize: 17, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                  Prêt à démarrer votre projet ? Notre équipe vous répond sous 24h.
                </p>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 40, alignItems: 'start' }}>
              <Reveal from="left">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[ 
                    { icon: '📞', label: 'Téléphone', value: '+216 74 600 500', color: '#10b981' },
                    { icon: '✉️', label: 'Email', value: 'contact@digilabsolutions.tn', color: '#4f8ef7' },
                    { icon: '🌐', label: 'Site web', value: 'digilabsolutions.tn', color: T.gold },
                    { icon: '📍', label: 'Adresse', value: 'Route Bouzayen Km 5, Immeuble El Bachir, 4ème étage App 4-2, Sfax, Tunisie', color: '#7c3aed' },
                  ].map((info, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 20px' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: info.color + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{info.icon}</div>
                      <div>
                        <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{info.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{info.value}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px 22px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.gold, marginBottom: 12 }}>✨ Pourquoi DigiLab ?</div>
                    {['10+ ans d\'expérience','Formations certifiantes','100% Pratique','Support réactif'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: 5, background: 'rgba(245,166,35,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.gold }} />
                        </div>
                        <span style={{ fontSize: 13, color: T.textLt }}>{item}</span>
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

        {/* CTA FINAL */}
        <section style={{ padding: '120px 5%', background: '#fff', borderTop: `1px solid ${T.border}`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(245,166,35,0.05), transparent 70%)', pointerEvents: 'none' }} />
          <Reveal>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
              <h2 style={{ fontSize: 'clamp(36px,5vw,60px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 20, color: T.text }}>
                Prêt à booster votre<br />présence <span style={{ color: T.gold }}>digitale ?</span>
              </h2>
              <p style={{ fontSize: 17, color: T.textLt, lineHeight: 1.75, marginBottom: 48, maxWidth: 500, margin: '0 auto 48px' }}>
                Rejoignez les 50+ entreprises qui font confiance à DigiLab Solutions pour leur stratégie digitale.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-gold" onClick={() => navigate('/login')} style={{ background: T.gold, color: '#111', border: 'none', padding: '17px 48px', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>Espace Client DigiPip →</button>
                <button className="btn-ghost" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} style={{ background: 'transparent', color: T.text, border: `1px solid rgba(0,0,0,0.12)`, padding: '17px 36px', borderRadius: 12, fontSize: 16, cursor: 'pointer', fontFamily: T.font }}>Demander un devis</button>
              </div>
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer style={{ background: '#1a1a2e', borderTop: `1px solid ${T.border}`, padding: '64px 5% 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr', gap: 48, marginBottom: 56 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #f5a623, #d97706)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'white', boxShadow: '0 4px 15px rgba(245,166,35,0.3)', flexShrink: 0 }}>☁️</div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: T.bg, letterSpacing: '-0.02em' }}>DigiPip</span>
                </div>
                <p style={{ fontSize: 13, color: T.textLt, lineHeight: 1.75, marginBottom: 22, maxWidth: 280 }}>
                  Plateforme de gestion de campagnes marketing par DigiLab Solutions. Email, SMS, Push et événements depuis un seul dashboard cloud.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { icon: '🐙', label: 'GitHub', url: 'https://github.com/amenibahri0002' },
                    { icon: '💼', label: 'LinkedIn', url: '#' },
                    { icon: '🌐', label: 'DigiLab', url: 'https://digilabsolutions.tn' },
                  ].map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noreferrer"
                      style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(0,0,0,0.03)', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, textDecoration: 'none', transition: 'all .2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,166,35,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = T.border; }}
                      title={s.label}
                    >{s.icon}</a>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.bg, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Services</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['#services', 'Création Graphique'],
                    ['#services', 'Community Management'],
                    ['#services', 'Production Vidéo'],
                    ['#services', 'Développement Web'],
                    ['#services', 'Email Marketing'],
                    ['#services', 'Assistant IA'],
                  ].map(([href, label]) => (
                    <a key={label} href={href}
                      style={{ fontSize: 13, color: T.textLt, textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = T.gold}
                      onMouseLeave={e => e.currentTarget.style.color = T.textLt}
                    >{label}</a>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.bg, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Plateforme</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['#hero', 'Accueil'],
                    ['#about', 'À propos'],
                    ['#process', 'Méthodologie'],
                    ['#pricing', 'Tarifs'],
                    ['#campagnes', 'Campagnes'],
                    ['#contact', 'Contact'],
                  ].map(([href, label]) => (
                    <a key={label} href={href}
                      style={{ fontSize: 13, color: T.textLt, textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = T.gold}
                      onMouseLeave={e => e.currentTarget.style.color = T.textLt}
                    >{label}</a>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.bg, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Contact</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { icon: '📍', text: 'Route Bouzayen Km 5, Immeuble El Bachir, 4ème étage App 4-2, Sfax, Tunisie 3000' },
                    { icon: '✉️', text: 'contact@digilabsolutions.tn' },
                    { icon: '📞', text: '+216 74 600 500 / +216 22 044 105' },
                    { icon: '🌐', text: 'digilabsolutions.tn' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                      <span style={{ fontSize: 12, color: T.textLt, lineHeight: 1.6 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate('/login')} style={{ marginTop: 20, width: '100%', padding: '11px', background: T.gold, color: '#111', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, transition: 'background .2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = T.goldDk}
                  onMouseLeave={e => e.currentTarget.style.background = T.gold}
                >
                  Espace Client →
                </button>
              </div>
            </div>
            <div style={{ height: 1, background: T.border, marginBottom: 28 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <span style={{ fontSize: 12, color: T.textMuted }}>© 2026 DigiLab Solutions. Tous droits réservés.</span>
              <div style={{ display: 'flex', gap: 20 }}>
                <a href="#" style={{ fontSize: 12, color: T.textMuted, textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = T.gold}
                  onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
                >Mentions légales</a>
                <a href="#" style={{ fontSize: 12, color: T.textMuted, textDecoration: 'none', transition: 'color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = T.gold}
                  onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
                >Politique de confidentialité</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
      <AIChatbot />
      {selectedCamp && <Modal camp={selectedCamp} onClose={() => setSelectedCamp(null)} />}
      <LoginRequiredModal 
        isOpen={isOpen} 
        onClose={closeModal} 
        campagneTitle={selectedCampagne?.title} 
      />
    </div>
  );
}
