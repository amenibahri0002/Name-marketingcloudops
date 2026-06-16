import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCircle, AlertCircle } from 'lucide-react';

const Toast = ({ notification, onClose, duration = 5000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    const interval = setInterval(() => {
      setProgress(prev => prev - (100 / (duration / 100)));
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'campagne': return <Bell size={20} style={{ color: '#f5a623' }} />;
      case 'success': return <CheckCircle size={20} style={{ color: '#10b981' }} />;
      case 'error': return <AlertCircle size={20} style={{ color: '#ef4444' }} />;
      default: return <Bell size={20} style={{ color: '#3b82f6' }} />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      background: 'white',
      borderRadius: 16,
      padding: '1rem',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      maxWidth: 400,
      width: '100%',
      animation: 'slideIn 0.3s ease-out',
      borderLeft: `4px solid ${notification.type === 'campagne' ? '#f5a623' : '#3b82f6'}`
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: notification.type === 'campagne' ? '#fff8e7' : '#eff6ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {getIcon()}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.25rem'
          }}>
            <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {notification.title}
            </h4>
            <button 
              onClick={onClose}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: 4
              }}
            >
              <X size={16} color="#64748b" />
            </button>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            {notification.message}
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      <div style={{
        height: 3,
        background: '#e2e8f0',
        borderRadius: 2,
        marginTop: '0.75rem',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: notification.type === 'campagne' ? '#f5a623' : '#3b82f6',
          transition: 'width 0.1s linear'
        }} />
      </div>
    </div>
  );
};

export default Toast;