import React, { Suspense, lazy, useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './components/PrivateRoute';
import Layout from './Layout';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import HomePage from './pages/HomePage';
import PublicCampagnes from './pages/PublicCampagnes';
import Campagnes from './pages/Campagnes';
import CampagneDetail from './pages/CampagneDetail';
import GestionCampagnesMarketing from './pages/GestionCampagnesMarketing';
import AdminDashboard from './pages/AdminDashboard';
import MesCampagnes from './pages/MesCampagnes';
import MesCertificats from './pages/Certificats';
import Paiements from './pages/Paiements';
import Profil from './pages/Profil';
import ReportingCloud from './pages/Reporting';
import Monitoring from './pages/Monitoring';
import MesInscriptions from './pages/MesCampagnes';
import Notifications from './pages/Notifications';
import AnalyticsMarketing from './pages/kpis';
import Feedbacks from './pages/Feedbacks';
import FeedbacksCampagne from './pages/FeedbacksCampagne';
import { TenantProvider } from './context/TenantContext';
import { requestNotificationPermission, onForegroundMessage } from './firebase';
// Lazy loading
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const Segments = lazy(() => import('./pages/Segments'));
const Reporting = lazy(() => import('./pages/Reporting'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const DevOpsCentral = lazy(() => import('./pages/DevOpsCentral'));
const PipelineStatus = lazy(() => import('./pages/PipelineStatus'));
const CampagneAdminDetail = lazy(() => import('./pages/CampagneAdminDetail'));
const Register = lazy(() => import('./pages/Register'));
const CloudOperations = lazy(() => import('./pages/CloudOperations'));

const Loading = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c14', fontFamily: "'Inter',sans-serif" }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(245,166,35,0.2)', borderTop: '3px solid #f5a623', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Chargement...</p>
    </div>
    <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
  </div>
);

const getUserRole = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload.role || '').toUpperCase();
    } catch (e) {}
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return (user.role || '').toUpperCase();
    } catch (e) {}
  }

  return '';
};

function DashboardRoute() {
  const role = getUserRole();

  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'RESPONSABLE_MARKETING') return <Navigate to="/marketing/dashboard" replace />;
  if (role === 'CLIENT') return <Navigate to="/client/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function ClientLayout({ children }) {
  const userRole = getUserRole();
  const showSidebar = userRole === 'CLIENT';

  if (!showSidebar) return <>{children}</>;

  return (
    <div style={{ display: 'flex' }}>
      <Layout />
      <div style={{ marginLeft: 280, flex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// SON DE NOTIFICATION
// ============================================
const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

function playNotificationSound() {
  try {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (err) {}
}

// ============================================
// SOCKET.IO NOTIFICATIONS — STABLE
// ============================================
function SocketIOConnector() {
  const socketRef = useRef(null);
  const lastSoundTime = useRef(0);
  const recentNotifications = useRef(new Set());
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Si déjà connecté avec le même token, ne rien faire
    if (socketRef.current?.connected) {
      return;
    }

    // Déconnecter l'ancien socket si existe
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,      // 5 secondes entre tentatives
      reconnectionDelayMax: 10000,  // Max 10 secondes
      timeout: 20000,               // 20 secondes timeout
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket.io connecté');
      setIsConnected(true);
    });

    newSocket.on('notification', (data) => {
      console.log('📩 Notification reçue:', data);

      // Clé de déduplication
      const dedupKey = `${data.campagneId || data.title}-${Math.floor(Date.now() / 60000)}`;

      if (recentNotifications.current.has(dedupKey)) {
        console.log('🔇 Notification dupliquée ignorée');
        return;
      }

      recentNotifications.current.add(dedupKey);
      setTimeout(() => recentNotifications.current.delete(dedupKey), 120000);

      // Son (max 1 fois toutes les 3 secondes)
      const now = Date.now();
      if (now - lastSoundTime.current > 3000) {
        playNotificationSound();
        lastSoundTime.current = now;
      }

      // Toast
      toast.info(
        <div>
          <strong>{data.title}</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>{data.message}</p>
        </div>,
        { 
          icon: '🔔', 
          position: 'top-right', 
          autoClose: 8000,
          toastId: dedupKey,
          style: { background: '#1a1a2e', color: '#fff', borderLeft: '4px solid #f5a623' }
        }
      );
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket.io déconnecté:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.log('❌ Socket.io erreur:', err.message);
      setIsConnected(false);
    });

    window.socket = newSocket;
    socketRef.current = newSocket;
  }, []);

  useEffect(() => {
    // Connexion initiale
    connectSocket();

    // Écouter les changements de localStorage (login/logout)
    const handleStorage = (e) => {
      if (e.key === 'token') {
        setTimeout(connectSocket, 500);
      }
    };
    window.addEventListener('storage', handleStorage);

    // Vérifier la connexion toutes les 10 secondes (pas 3)
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && (!socketRef.current || !socketRef.current.connected)) {
        console.log('🔄 Tentative de reconnexion Socket.io...');
        connectSocket();
      }
    }, 10000); // 10 secondes au lieu de 3

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [connectSocket]);

  return null;
}

// ============================================
// NOTIFICATIONS PUSH (FCM)
// ============================================
function PushNotificationSetup() {
  const [fcmReady, setFcmReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const setupNotifications = async () => {
      // Attendre que le token soit disponible
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⏳ Pas de token, attente de connexion...');
        return;
      }

      console.log('🔔 Demande de permission de notifications...');
      const fcmToken = await requestNotificationPermission();

      if (isMounted && fcmToken) {
        console.log('✅ Notifications push activées ! Token:', fcmToken.substring(0, 20) + '...');
        setFcmReady(true);
      }
    };

    // Écouter les changements de localStorage pour détecter le login
    const handleStorage = (e) => {
      if (e.key === 'token') {
        if (e.newValue) {
          console.log('🔔 Utilisateur connecté, activation des notifications...');
          setTimeout(setupNotifications, 1000);
        } else {
          console.log('🔔 Utilisateur déconnecté');
          setFcmReady(false);
        }
      }
    };

    // Écouter les messages en premier plan
    onForegroundMessage((payload) => {
      console.log('📩 Notification push reçue en premier plan:', payload);

      // Son
      try {
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (err) {}

      // Toast
      toast.info(
        <div>
          <strong>{payload.notification?.title || 'DigiPip'}</strong>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>{payload.notification?.body || ''}</p>
        </div>,
        { 
          icon: '🔔', 
          position: 'top-right', 
          autoClose: 8000,
          style: { background: '#1a1a2e', color: '#fff', borderLeft: '4px solid #f5a623' }
        }
      );
    });

    // Setup initial
    setupNotifications();
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return null;
}

function App() {
  return (
    <TenantProvider>
      <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SocketIOConnector />
        <PushNotificationSetup />
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* ROUTES PUBLIQUES */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/campagnes-public" element={<PublicCampagnes />} />
            <Route path="/campagnes/:idOrSlug" element={<CampagneDetail />} />

            {/* DASHBOARD */}
            <Route path="/dashboard" element={<DashboardRoute />} />

            {/* ROUTES ADMIN */}
            <Route path="/admin/dashboard" element={
              <PrivateRoute roles={['ADMIN']}>
                <AdminDashboard />
              </PrivateRoute>
            } />
            <Route path="/admin/users" element={
              <PrivateRoute roles={['ADMIN']}>
                <Layout><UsersPage /></Layout>
              </PrivateRoute>
            } />
            <Route path="/admin/campagnes" element={
              <PrivateRoute roles={['ADMIN']}>
                <Layout><Campagnes /></Layout>
              </PrivateRoute>
            } />
            <Route path="/admin/campagnes/:id" element={
              <PrivateRoute roles={['ADMIN']}>
                <CampagneAdminDetail />
              </PrivateRoute>
            } />
            <Route path="/admin/Clients" element={
              <PrivateRoute roles={['ADMIN']}>
                <Layout><Clients /></Layout>
              </PrivateRoute>
            } />
            <Route path="/admin/inscription" element={
              <PrivateRoute roles={['ADMIN']}>
                <Layout><div style={{ padding: 40 }}>inscription (a implementer)</div></Layout>
              </PrivateRoute>
            } />

            {/* ROUTES MARKETING */}
            <Route path="/marketing/dashboard" element={
              <PrivateRoute roles={['RESPONSABLE_MARKETING']}>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/gestion-campagnes-marketing" element={
              <PrivateRoute roles={['RESPONSABLE_MARKETING']}>
                <Layout><GestionCampagnesMarketing /></Layout>
              </PrivateRoute>
            } />
            <Route path="/kpis" element={
              <PrivateRoute roles={['RESPONSABLE_MARKETING']}>
                <AnalyticsMarketing />
              </PrivateRoute>
            } />
            <Route path="/Clients" element={
              <PrivateRoute roles={['RESPONSABLE_MARKETING']}>
                <Layout><Clients /></Layout>
              </PrivateRoute>
            } />
            <Route path="/FeedbacksCampagne/:campagneId" element={
              <PrivateRoute roles={['RESPONSABLE_MARKETING']}>
                <FeedbacksCampagne />
              </PrivateRoute>
            } />
            <Route path="/FeedbacksCampagne" element={
              <PrivateRoute roles={['RESPONSABLE_MARKETING']}>
                <FeedbacksCampagne />
              </PrivateRoute>
            } />

            {/* ROUTES CLIENT */}
            <Route path="/client/Accueil" element={
              <PrivateRoute roles={['CLIENT']}>
                <Layout><HomePage /></Layout>
              </PrivateRoute>
            } />
            <Route path="/client/dashboard" element={
              <PrivateRoute roles={['CLIENT']}>
                <Layout><Dashboard /></Layout>
              </PrivateRoute>
            } />
            <Route path="/client/campagnes" element={
              <PrivateRoute roles={['CLIENT']}>
                <Layout><Campagnes /></Layout>
              </PrivateRoute>
            } />
            <Route path="/client/campagnes/:idOrSlug" element={
              <PrivateRoute roles={['CLIENT']}>
                <Layout><CampagneDetail /></Layout>
              </PrivateRoute>
            } />
            <Route path="/MesCampagnes" element={
              <PrivateRoute roles={['CLIENT']}>
                <MesCampagnes />
              </PrivateRoute>
            } />
            <Route path="/Certificats" element={
              <PrivateRoute roles={['CLIENT']}>
                <MesCertificats />
              </PrivateRoute>
            } />
            <Route path="/Paiements" element={
              <PrivateRoute roles={['CLIENT']}>
                <Paiements />
              </PrivateRoute>
            } />
            <Route path="/Profil" element={
              <PrivateRoute roles={['CLIENT']}>
                <Profil />
              </PrivateRoute>
            } />
            <Route path="/notifications" element={
              <PrivateRoute roles={['CLIENT']}>
                <Notifications />
              </PrivateRoute>
            } />

            {/* ROUTES COMMUNES */}
            <Route path="/campagnes" element={
              <Layout><Campagnes /></Layout>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Layout><Profile /></Layout>
              </PrivateRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <Layout><Settings /></Layout>
              </PrivateRoute>
            } />
            <Route path="/segments" element={
              <PrivateRoute roles={['ADMIN', 'RESPONSABLE_MARKETING', 'CLIENT']}>
                <Layout><Segments /></Layout>
              </PrivateRoute>
            } />

            {/* ROUTES ADMIN SUPPLEMENTAIRES */}
            <Route path="/reporting" element={
              <PrivateRoute roles={['ADMIN']}>
                <Reporting />
              </PrivateRoute>
            } />
            <Route path="/monitoring" element={
              <PrivateRoute roles={['ADMIN']}>
                <Monitoring />
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute roles={['ADMIN']}>
                <Layout><UsersPage /></Layout>
              </PrivateRoute>
            } />
            <Route path="/devops-central" element={
              <PrivateRoute roles={['ADMIN', 'RESPONSABLE_MARKETING']}>
                <Layout><DevOpsCentral /></Layout>
              </PrivateRoute>
            } />
            <Route path="/pipeline" element={
              <PrivateRoute roles={['ADMIN']}>
                <Layout><PipelineStatus /></Layout>
              </PrivateRoute>
            } />
            <Route path="/cloud-operations" element={
              <PrivateRoute roles={['ADMIN']}>
                <CloudOperations />
              </PrivateRoute>
            } />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <ToastContainer position="top-right" autoClose={8000} />
      </BrowserRouter>
    </TenantProvider>
  );
}

export default App;