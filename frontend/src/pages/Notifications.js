// frontend/src/pages/Notifications.js
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Mail, MessageSquare, Smartphone, Check, Settings, X,
  Trash2, Clock, Megaphone, GraduationCap, Calendar, CreditCard, Award,
  Zap, CheckCircle2, Search, SlidersHorizontal, Filter, ChevronRight,
  AlertTriangle, Inbox, Sparkles, TrendingUp, BarChart3, Layers
} from 'lucide-react';
import Layout from '../Layout';
import api from '../api';

// ============ COLORS ============
const gold = '#F5A623';
const goldLight = '#FFF8E7';
const goldDark = '#D48A1A';
const dark = '#0F172A';
const white = '#FFFFFF';
const gray = '#F8FAFC';
const grayLight = '#F1F5F9';
const textGray = '#64748B';
const textMuted = '#94A3B8';
const border = '#E2E8F0';
const borderLight = '#F1F5F9';
const success = '#10B981';
const successLight = '#ECFDF5';
const blue = '#3B82F6';
const blueLight = '#EFF6FF';
const purple = '#8B5CF6';
const purpleLight = '#F3E8FF';
const red = '#EF4444';
const redLight = '#FEE2E2';
const orange = '#F97316';
const orangeLight = '#FFF7ED';

// ============ TYPE CONFIG ============
const TYPE_CONFIG = {
  CAMPAGNE_NOUVELLE: {
    label: 'Nouvelle formation',
    icon: GraduationCap,
    color: blue,
    bg: blueLight,
    border: '#93C5FD',
  },
  CAMPAGNE_PROMO: {
    label: 'Promotion',
    icon: Megaphone,
    color: orange,
    bg: orangeLight,
    border: '#FDBA74',
  },
  EVENEMENT: {
    label: 'Événement',
    icon: Calendar,
    color: purple,
    bg: purpleLight,
    border: '#C4B5FD',
  },
  INSCRIPTION_CONFIRMATION: {
    label: 'Inscription',
    icon: CheckCircle2,
    color: success,
    bg: successLight,
    border: '#6EE7B7',
  },
  PAIEMENT_RECU: {
    label: 'Paiement',
    icon: CreditCard,
    color: '#059669',
    bg: '#D1FAE5',
    border: '#6EE7B7',
  },
  CERTIFICAT_DISPONIBLE: {
    label: 'Certificat',
    icon: Award,
    color: goldDark,
    bg: goldLight,
    border: '#FCD34D',
  },
  RAPPEL: {
    label: 'Rappel',
    icon: Clock,
    color: '#7C3AED',
    bg: '#EDE9FE',
    border: '#C4B5FD',
  },
  SYSTEM: {
    label: 'Système',
    icon: Zap,
    color: '#6B7280',
    bg: '#F3F4F6',
    border: '#D1D5DB',
  },
};

// ============ CHANNEL CONFIG ============
const CHANNEL_CONFIG = {
  EMAIL: { icon: Mail, label: 'Email', color: blue },
  SMS: { icon: Smartphone, label: 'SMS', color: '#059669' },
  PUSH: { icon: Bell, label: 'Push', color: goldDark },
  WHATSAPP: { icon: MessageSquare, label: 'WhatsApp', color: '#10B981' },
  SOCIAL: { icon: Megaphone, label: 'Social', color: '#EC4899' },
  IN_APP: { icon: Bell, label: 'In-App', color: '#6B7280' },
};

// ============ NOTIFICATION CARD ============
const NotificationCard = ({ notif, onMarkRead, onDelete, index }) => {
  const typeConfig = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
  const Icon = typeConfig.icon;
  const isUnread = !notif.read;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const cardStyle = {
    position: 'relative',
    borderRadius: 20,
    border: isUnread ? `2px solid ${gold}` : `1px solid ${border}`,
    background: isUnread ? white : grayLight,
    padding: '24px 28px',
    marginBottom: 16,
    transition: 'all 0.3s ease',
    cursor: 'default',
    boxShadow: isUnread ? '0 4px 20px rgba(245, 166, 35, 0.08)' : 'none',
  };

  const unreadLineStyle = {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    background: `linear-gradient(to bottom, ${gold}, ${goldDark})`,
    borderRadius: '20px 0 0 20px',
  };

  const iconBoxStyle = {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: typeConfig.bg,
    border: `1px solid ${typeConfig.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: '0.75rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: typeConfig.bg,
    color: typeConfig.color,
    border: `1px solid ${typeConfig.border}`,
  };

  const dotStyle = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: red,
    animation: 'pulse 2s infinite',
  };

  const channelIconStyle = (color) => ({
    width: 32,
    height: 32,
    borderRadius: 10,
    background: color + '15',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  const actionBtnStyle = {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      layout
    >
      <div style={cardStyle}>
        {isUnread && <div style={unreadLineStyle} />}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
          {/* Icon */}
          <div style={iconBoxStyle}>
            <Icon size={22} color={typeConfig.color} />
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={badgeStyle}>
                {typeConfig.label}
              </span>
              {isUnread && <div style={dotStyle} />}
            </div>

            <h4 style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: isUnread ? dark : '#334155',
              margin: '0 0 6px',
              lineHeight: 1.4,
            }}>
              {notif.title}
            </h4>

            <p style={{
              fontSize: '0.9rem',
              color: textGray,
              lineHeight: 1.6,
              margin: '0 0 14px',
            }}>
              {notif.message}
            </p>

            {/* Footer: Channels + Date + Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Channel icons */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {(notif.recipients?.flatMap(r => r.channels || []) || notif.channels || [])
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((ch, i) => {
                      const chConfig = CHANNEL_CONFIG[ch];
                      if (!chConfig) return null;
                      const ChIcon = chConfig.icon;
                      return (
                        <div key={i} style={channelIconStyle(chConfig.color)} title={chConfig.label}>
                          <ChIcon size={15} color={chConfig.color} />
                        </div>
                      );
                    })}
                </div>

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: textMuted }}>
                  <Clock size={13} />
                  <span>{formatDate(notif.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 4 }}>
                {isUnread && (
                  <button
                    onClick={() => onMarkRead(notif.id)}
                    style={{ ...actionBtnStyle, color: textMuted }}
                    onMouseEnter={e => { e.currentTarget.style.background = successLight; e.currentTarget.style.color = success; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; }}
                    title="Marquer comme lu"
                  >
                    <CheckCircle2 size={18} />
                  </button>
                )}
                <button
                  onClick={() => onDelete(notif.id)}
                  style={{ ...actionBtnStyle, color: textMuted }}
                  onMouseEnter={e => { e.currentTarget.style.background = redLight; e.currentTarget.style.color = red; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; }}
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
      `}</style>
    </motion.div>
  );
};

// ============ SETTINGS PANEL ============
const SettingsPanel = ({ show, preferences, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState('channels');

  if (!preferences || !show) return null;

  const panelStyle = {
    background: white,
    borderRadius: 24,
    border: `1px solid ${border}`,
    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    marginBottom: 28,
  };

  const headerStyle = {
    padding: '24px 28px',
    borderBottom: `1px solid ${borderLight}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: `linear-gradient(135deg, ${gray} 0%, ${white} 100%)`,
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '14px 20px',
    border: 'none',
    background: isActive ? goldLight : 'transparent',
    color: isActive ? goldDark : textGray,
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderBottom: isActive ? `3px solid ${gold}` : `3px solid transparent`,
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  });

  const toggleStyle = (checked) => ({
    width: 44,
    height: 24,
    borderRadius: 12,
    background: checked ? gold : '#D1D5DB',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s',
    flexShrink: 0,
  });

  const toggleDotStyle = (checked) => ({
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: white,
    position: 'absolute',
    top: 2,
    left: checked ? 22 : 2,
    transition: 'all 0.3s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
  });

  const channelItems = [
    { key: 'emailEnabled', label: 'Email', icon: Mail, color: blue, desc: 'Recevoir les notifications par email' },
    { key: 'smsEnabled', label: 'SMS', icon: Smartphone, color: '#059669', desc: 'Recevoir les notifications par SMS' },
    { key: 'pushEnabled', label: 'Push', icon: Bell, color: goldDark, desc: 'Notifications push sur navigateur' },
    { key: 'inAppEnabled', label: 'In-App', icon: MessageSquare, color: '#6B7280', desc: 'Notifications dans l\'application' },
  ];

  const typeItems = [
    { key: 'campagneNouvelle', label: 'Nouvelles formations', icon: GraduationCap, color: blue },
    { key: 'campagnePromo', label: 'Promotions', icon: Megaphone, color: orange },
    { key: 'evenement', label: 'Événements', icon: Calendar, color: purple },
    { key: 'inscription', label: 'Confirmations d\'inscription', icon: CheckCircle2, color: success },
    { key: 'paiement', label: 'Confirmations de paiement', icon: CreditCard, color: '#059669' },
    { key: 'certificat', label: 'Certificats disponibles', icon: Award, color: goldDark },
  ];

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'hidden', marginBottom: 28 }}
    >
      <div style={panelStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: goldLight,
              border: `1px solid ${gold}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SlidersHorizontal size={20} color={goldDark} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: dark, margin: 0 }}>Préférences</h3>
              <p style={{ fontSize: '0.8rem', color: textMuted, margin: '2px 0 0' }}>Personnalisez vos canaux et types</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: `1px solid ${border}`,
              background: white,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color={textGray} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${borderLight}` }}>
          <button onClick={() => setActiveTab('channels')} style={tabStyle(activeTab === 'channels')}>
            <Bell size={16} /> Canaux
          </button>
          <button onClick={() => setActiveTab('types')} style={tabStyle(activeTab === 'types')}>
            <Filter size={16} /> Types
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>
          {activeTab === 'channels' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {channelItems.map(({ key, label, icon: Icon, color, desc }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: 18,
                    borderRadius: 16,
                    border: `1px solid ${border}`,
                    background: gray,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => onUpdate(key, !preferences[key])}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.background = goldLight; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = gray; }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: dark, fontSize: '0.9rem' }}>{label}</span>
                      <div style={toggleStyle(preferences[key])}>
                        <div style={toggleDotStyle(preferences[key])} />
                      </div>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: textMuted, margin: 0, lineHeight: 1.4 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'types' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {typeItems.map(({ key, label, icon: Icon, color }) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    borderRadius: 14,
                    border: `1px solid ${border}`,
                    background: gray,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => onUpdate(key, !preferences[key])}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.background = goldLight; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = gray; }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={16} color={color} />
                  </div>
                  <span style={{ flex: 1, fontWeight: 600, color: dark, fontSize: '0.9rem' }}>{label}</span>
                  <div style={toggleStyle(preferences[key])}>
                    <div style={toggleDotStyle(preferences[key])} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============ EMPTY STATE ============
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    style={{
      textAlign: 'center',
      padding: '60px 24px',
      background: white,
      borderRadius: 24,
      border: `1px solid ${border}`,
    }}
  >
    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
      <div style={{
        width: 96,
        height: 96,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${grayLight} 0%, ${borderLight} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
      }}>
        <Inbox size={40} color={textMuted} />
      </div>
      <div style={{
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: successLight,
        border: `2px solid ${white}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Check size={16} color={success} />
      </div>
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: dark, margin: '0 0 8px' }}>Aucune notification</h3>
    <p style={{ color: textMuted, maxWidth: 400, margin: '0 auto', lineHeight: 1.6, fontSize: '0.9rem' }}>
      Vous n'avez pas encore de notifications. Elles apparaîtront ici quand vous recevrez des alertes sur vos formations et événements.
    </p>
  </motion.div>
);

// ============ LOADING SKELETON ============
const LoadingSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    {[1, 2, 3].map(i => (
      <div key={i} style={{
        background: white,
        borderRadius: 20,
        border: `1px solid ${border}`,
        padding: 24,
        animation: 'pulse 2s infinite',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: grayLight, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 16, borderRadius: 8, background: grayLight, width: 100, marginBottom: 10 }} />
            <div style={{ height: 20, borderRadius: 8, background: grayLight, width: '60%', marginBottom: 8 }} />
            <div style={{ height: 14, borderRadius: 8, background: grayLight, width: '90%', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ height: 28, borderRadius: 8, background: grayLight, width: 80 }} />
              <div style={{ height: 28, borderRadius: 8, background: grayLight, width: 60 }} />
            </div>
          </div>
        </div>
      </div>
    ))}
    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `}</style>
  </div>
);

// ============ MAIN COMPONENT ============
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/notifications/mes-notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Erreur notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await api.get('/api/notifications/preferences');
      setPreferences(res.data || {
        emailEnabled: true, smsEnabled: false, pushEnabled: true, inAppEnabled: true,
        campagneNouvelle: true, campagnePromo: true, evenement: true,
        inscription: true, paiement: true, certificat: true,
      });
    } catch (err) {
      console.error('Erreur préférences:', err);
      setPreferences({
        emailEnabled: true, smsEnabled: false, pushEnabled: true, inAppEnabled: true,
        campagneNouvelle: true, campagnePromo: true, evenement: true,
        inscription: true, paiement: true, certificat: true,
      });
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    const socket = window.socket;
    if (socket) {
      socket.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });
    }
    return () => { if (socket) socket.off('notification'); };
  }, [fetchNotifications, fetchPreferences]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/lu`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Erreur mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/lu-toutes');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Erreur mark all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Erreur delete:', err);
    }
  };

  const updatePreferences = async (key, value) => {
    try {
      const updated = { ...preferences, [key]: value };
      await api.put('/api/notifications/preferences', { [key]: value });
      setPreferences(updated);
    } catch (err) {
      console.error('Erreur update prefs:', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  }).filter(n => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q);
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  // Header stats
  const stats = [
    { label: 'Total', value: notifications.length, color: dark, bg: grayLight },
    { label: 'Non lues', value: unreadCount, color: red, bg: redLight },
    { label: 'Lues', value: readCount, color: success, bg: successLight },
  ];

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: gray, padding: '40px 60px', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* HEADER */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    background: `linear-gradient(135deg, ${gold} 0%, ${goldDark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(245, 166, 35, 0.3)',
                  }}>
                    <Bell size={26} color={white} />
                  </div>
                  <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: dark, margin: 0 }}>Notifications</h1>
                    <p style={{ color: textGray, fontSize: '0.95rem', margin: '4px 0 0' }}>
                      {unreadCount > 0 
                        ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''} sur ${notifications.length}` 
                        : 'Toutes vos notifications sont à jour'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 10 }}>
                  {stats.map((s, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 16px',
                      borderRadius: 12,
                      background: s.bg,
                      border: `1px solid ${border}`,
                    }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: textMuted, textTransform: 'uppercase' }}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 14,
                      border: 'none',
                      background: successLight,
                      color: success,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = success; e.currentTarget.style.color = white; }}
                    onMouseLeave={e => { e.currentTarget.style.background = successLight; e.currentTarget.style.color = success; }}
                  >
                    <CheckCircle2 size={18} /> Tout marquer comme lu
                  </button>
                )}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: 14,
                    border: showSettings ? 'none' : `1px solid ${border}`,
                    background: showSettings ? gold : white,
                    color: showSettings ? white : dark,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    boxShadow: showSettings ? '0 4px 16px rgba(245, 166, 35, 0.3)' : 'none',
                  }}
                >
                  <Settings size={18} /> Préférences
                </button>
              </div>
            </div>
          </motion.div>

          {/* SETTINGS PANEL */}
          <SettingsPanel 
            show={showSettings} 
            preferences={preferences} 
            onUpdate={updatePreferences}
            onClose={() => setShowSettings(false)}
          />

          {/* FILTERS & SEARCH */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}
          >
            <div style={{
              display: 'flex',
              gap: 6,
              padding: 6,
              borderRadius: 14,
              background: white,
              border: `1px solid ${border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              {[
                { id: 'all', label: 'Toutes', count: notifications.length },
                { id: 'unread', label: 'Non lues', count: unreadCount },
                { id: 'read', label: 'Lues', count: readCount },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: 'none',
                    background: filter === tab.id ? gold : 'transparent',
                    color: filter === tab.id ? white : textGray,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: filter === tab.id ? 'rgba(255,255,255,0.25)' : grayLight,
                      color: filter === tab.id ? white : textGray,
                      fontWeight: 700,
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: 280 }}>
              <Search size={16} color={textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  borderRadius: 14,
                  border: `1px solid ${border}`,
                  background: white,
                  fontSize: '0.85rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: "'Inter', sans-serif",
                }}
                onFocus={e => { e.target.style.borderColor = gold; e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = border; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </motion.div>

          {/* NOTIFICATIONS LIST */}
          <AnimatePresence mode="popLayout">
            {loading ? (
              <LoadingSkeleton />
            ) : filteredNotifications.length === 0 ? (
              <EmptyState />
            ) : (
              <div>
                {filteredNotifications.map((notif, index) => (
                  <NotificationCard
                    key={notif.id}
                    notif={notif}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                    index={index}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* FOOTER */}
          {!loading && filteredNotifications.length > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', fontSize: '0.8rem', color: textMuted, marginTop: 32, paddingBottom: 40 }}
            >
              {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''} affichée{filteredNotifications.length > 1 ? 's' : ''}
            </motion.p>
          )}
        </div>
      </div>
    </Layout>
  );
}