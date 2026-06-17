import React from 'react';

export default function Logo({ size = 42, showText = true, collapsed = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Cercle Orange avec Nuage */}
      <div style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.floor(size * 0.62),
        color: '#ffffff',
        boxShadow: '0 4px 20px rgba(245, 158, 11, 0.55)',
        position: 'relative',
        flexShrink: 0,
        transition: 'all 0.3s ease'
      }}>
        ☁️
        <div style={{
          position: 'absolute',
          top: size * 0.18,
          left: size * 0.22,
          width: size * 0.32,
          height: size * 0.32,
          background: 'rgba(255,255,255,0.85)',
          borderRadius: '50%',
          filter: 'blur(2px)'
        }} />
      </div>

      {showText && !collapsed && (
        <div>
          <div style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: size * 0.62,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.04em'
          }}>
            Digi<span style={{ color: '#f5a623' }}>Pip</span>
          </div>
          <div style={{
            fontSize: size * 0.23,
            color: '#f5a623',
            fontWeight: 600,
            letterSpacing: '1.6px',
            marginTop: -3
          }}>
            CLOUD MARKETING
          </div>
        </div>
      )}
    </div>
  );
}
