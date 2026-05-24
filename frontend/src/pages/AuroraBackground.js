import { useEffect, useRef } from 'react';

/* ══════════════════════════════════════════════════════════════
   AURORA BACKGROUND — Gradient animé pleine page
   
   USAGE : Ajoutez <AuroraBackground /> comme premier enfant
   de votre <div style={{ fontFamily: T.font, background: T.bg, ... }}>
   principal dans HomePage.
   
   Il se positionne en fixed, couvre toute la page, et passe
   sous tout le contenu (zIndex: 0). Tout votre contenu reste
   au-dessus grâce au z-index naturel (≥1).
══════════════════════════════════════════════════════════════ */
export default function AuroraBackground() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let t = 0;

    /* Orbes aurora — chaque orbe a sa trajectoire propre */
    const orbs = [
      { baseX: 0.15, baseY: 0.20, rx: 0.18, ry: 0.12, freq: 0.22, phase: 0.00, r: 520, color: [79,  142, 247], alpha: 0.07 }, // bleu   — haut gauche
      { baseX: 0.85, baseY: 0.15, rx: 0.14, ry: 0.10, freq: 0.17, phase: 1.10, r: 460, color: [124,  58, 237], alpha: 0.06 }, // violet — haut droite
      { baseX: 0.50, baseY: 0.50, rx: 0.20, ry: 0.15, freq: 0.13, phase: 2.20, r: 580, color: [245, 166,  35], alpha: 0.05 }, // or     — centre
      { baseX: 0.80, baseY: 0.75, rx: 0.16, ry: 0.12, freq: 0.19, phase: 3.50, r: 500, color: [ 16, 185, 129], alpha: 0.06 }, // vert   — bas droite
      { baseX: 0.20, baseY: 0.80, rx: 0.14, ry: 0.10, freq: 0.25, phase: 4.80, r: 440, color: [124,  58, 237], alpha: 0.05 }, // violet — bas gauche
      { baseX: 0.60, baseY: 0.25, rx: 0.12, ry: 0.08, freq: 0.30, phase: 0.70, r: 380, color: [ 79, 142, 247], alpha: 0.04 }, // bleu   — haut centre
    ];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width: W, height: H } = canvas;

      /* Fond de base */
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, W, H);

      /* Grille subtile */
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.018)';
      ctx.lineWidth   = 0.5;
      const step = 50;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();

      /* Orbes */
      orbs.forEach(o => {
        const cx = (o.baseX + Math.sin(t * o.freq + o.phase)           * o.rx) * W;
        const cy = (o.baseY + Math.cos(t * o.freq * 0.7 + o.phase + 1) * o.ry) * H;

        /* Pulse léger sur le rayon */
        const radius = o.r * (1 + Math.sin(t * o.freq * 1.3 + o.phase) * 0.08);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0,   `rgba(${o.color.join(',')},${o.alpha})`);
        grad.addColorStop(0.4, `rgba(${o.color.join(',')},${o.alpha * 0.5})`);
        grad.addColorStop(1,   `rgba(${o.color.join(',')},0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      });

      /* Bande de vignette en bas pour que le contenu reste lisible */
      const vignette = ctx.createLinearGradient(0, 0, 0, H);
      vignette.addColorStop(0,   'rgba(8,12,20,0)');
      vignette.addColorStop(0.7, 'rgba(8,12,20,0)');
      vignette.addColorStop(1,   'rgba(8,12,20,0.6)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      t += 0.008; // vitesse — augmentez pour accélérer
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}