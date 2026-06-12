import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Inscriptions from './pages/MesCampagnes';
// Lazy loading pour les pages lourdes
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const Segments = lazy(() => import('./pages/Segments'));
const Reporting = lazy(() => import('./pages/Reporting'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const Analytics= lazy(() => import('./pages/Analytics'));
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

// ── UTILS ──
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

// ── DASHBOARD ROUTE INTELLIGENT ──
function DashboardRoute() {
  const role = getUserRole();

  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'RESPONSABLE_MARKETING') return <Navigate to="/marketing/dashboard" replace />;
  if (role === 'CLIENT') return <Navigate to="/client/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

// ── CLIENT LAYOUT (SidebarClient noir) ──
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

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* ═══════════════════════════════════════════
              ROUTES PUBLIQUES (sans authentification)
          ═══════════════════════════════════════════ */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/campagnes-public" element={<PublicCampagnes />} />
          <Route path="/campagnes/:idOrSlug" element={<CampagneDetail />} />

          {/* ═══════════════════════════════════════════
              DASHBOARD REDIRECTION (selon role)
          ═══════════════════════════════════════════ */}
          <Route path="/dashboard" element={<DashboardRoute />} />

          {/* ═══════════════════════════════════════════
              ROUTES ADMIN (Layout global)
          ═══════════════════════════════════════════ */}
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
          <Route path="/admin/inscriptions" element={
            <PrivateRoute roles={['ADMIN']}>
              <Layout><div style={{ padding: 40 }}>Inscriptions (a implementer)</div></Layout>
            </PrivateRoute>
          } />

          {/* ═══════════════════════════════════════════
              ROUTES MARKETING (Layout global)
          ═══════════════════════════════════════════ */}
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
          <Route path="/analytics" element={
            <PrivateRoute roles={['RESPONSABLE_MARKETING']}>
              <Analytics />
            </PrivateRoute>
          } />
          <Route path="/Clients" element={
            <PrivateRoute roles={['RESPONSABLE_MARKETING']}>
              <Layout><Clients /></Layout>
            </PrivateRoute>
          } />

          {/* ═══════════════════════════════════════════
              ROUTES CLIENT (SidebarClient noir)
          ═══════════════════════════════════════════ */}
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
             <Inscriptions />
            </PrivateRoute>
          } />
          <Route path="/Certificats" element={
            <PrivateRoute roles={['CLIENT']}>
              <MesCertificats />
            </PrivateRoute>
          } />
          <Route path="/Paiements" element={
            <PrivateRoute roles={['CLIENT']}>
              <Paiements/>
            </PrivateRoute>
          } />
          <Route path="/Profil" element={
            <PrivateRoute roles={['CLIENT']}>
              <Profil />
            </PrivateRoute>
          } />

          {/* ═══════════════════════════════════════════
              ROUTES COMMUNES (multi-roles)
          ═══════════════════════════════════════════ */}
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

          {/* ═══════════════════════════════════════════
              ROUTES ADMIN SUPPLEMENTAIRES
          ═══════════════════════════════════════════ */}
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

          {/* ═══════════════════════════════════════════
              404 - NOT FOUND
          ═══════════════════════════════════════════ */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;