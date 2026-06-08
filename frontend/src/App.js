import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout      from './Layout';
import NotFound    from './pages/NotFound';
import Profile     from './pages/Profile';
import Settings    from './pages/Settings';
import HomePage    from './pages/HomePage';
import PublicCampagnes from './pages/PublicCampagnes';
import Campagnes from './pages/Campagnes';
import CampagneDetail from './pages/CampagneDetail';
import SidebarClient from './components/SidebarClient';
import GestionCampagnesMarketing from './pages/GestionCampagnesMarketing'; 

// Pages client manquantes
import MesCampagnesPage from './pages/MesCampagnes';
import CertificatsPage from './pages/Certificats';
import PaiementsPage from './pages/Paiements';
import ProfilPage from './pages/Profil';

const Login               = lazy(() => import('./pages/Login'));
const Dashboard           = lazy(() => import('./pages/Dashboard'));
const AdminDashboard      = lazy(() => import('./pages/AdminDashboard'));
const Clients             = lazy(() => import('./pages/Clients'));
const Segments            = lazy(() => import('./pages/Segments'));
const Reporting           = lazy(() => import('./pages/Reporting'));
const UsersPage           = lazy(() => import('./pages/UsersPage'));
const Monitoring          = lazy(() => import('./pages/Monitoring'));
const Analytics           = lazy(() => import('./pages/Analytics'));
const AccessDenied        = lazy(() => import('./pages/AccessDenied'));
const DevOpsCentral       = lazy(() => import('./pages/DevOpsCentral'));
const PipelineStatus      = lazy(() => import('./pages/PipelineStatus'));
const MesCampagnes        = lazy(() => import('./pages/MesCampagnes'));
const CampagneAdminDetail = lazy(() => import('./pages/CampagneAdminDetail'));
const Register            = lazy(() => import('./pages/Register'));
const CloudOperations     = lazy(() => import('./pages/CloudOperations'));

const Loading = () => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080c14', fontFamily:"'Inter',sans-serif" }}>
    <div style={{ textAlign:'center' }}>
      <div style={{ width:40, height:40, border:'3px solid rgba(245,166,35,0.2)', borderTop:'3px solid #f5a623', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px'}}/>
      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Chargement...</p>
    </div>
    <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
  </div>
);

// Get user role from token or localStorage
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

// Check if user is CLIENT
const isClient = () => getUserRole() === 'CLIENT';

// ClientLayout: ONLY renders SidebarClient for CLIENT role
function ClientLayout({ children }) {
  const userRole = getUserRole();
  const showSidebar = userRole === 'CLIENT';

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: 'flex' }}>
      <SidebarClient />
      <div style={{ marginLeft: 280, flex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}

// MarketingLayout: Uses existing Layout (admin sidebar), NEVER shows SidebarClient
function MarketingLayout({ children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}

// AdminLayout: Uses existing Layout
function AdminLayout({ children }) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* ── PUBLIQUES ── */}
          <Route path="/"              element={<HomePage />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route path="/campagnes-public" element={<PublicCampagnes />} />

          {/* ── REDIRECTION RACINE ── */}
          <Route path="/" element={
            <PrivateRoute>
              <RoleRedirect />
            </PrivateRoute>
          } />

          {/* ── DASHBOARD ADMIN ── */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute roles={['ADMIN']}>
              <AdminLayout><AdminDashboard /></AdminLayout>
            </PrivateRoute>
          } />

          {/* ── DASHBOARD MARKETING (separate from CLIENT) ── */}
          <Route path="/dashboard" element={
            <PrivateRoute roles={['RESPONSABLE_MARKETING']}>
              <MarketingLayout><Dashboard /></MarketingLayout>
            </PrivateRoute>
          } />

          {/* ── DASHBOARD CLIENT (with SidebarClient) ── */}
          <Route path="/client/dashboard" element={
            <PrivateRoute roles={['CLIENT']}>
              <ClientLayout><Dashboard /></ClientLayout>
            </PrivateRoute>
          } />

          {/* ── FORMATIONS PUBLIQUES (with SidebarClient only for CLIENT) ── */}
          <Route path="/campagnes" element={
            <ClientLayout><Campagnes /></ClientLayout>
          } />
          <Route path="/campagnes/:id" element={
            <ClientLayout><CampagneDetail /></ClientLayout>
          } />

          {/* ── ROUTES CLIENT (SidebarClient noir) ── */}
          <Route path="/mescampagnes" element={
            <PrivateRoute roles={['CLIENT']}>
              <ClientLayout><MesCampagnesPage /></ClientLayout>
            </PrivateRoute>
          } />

          <Route path="/certificats" element={
            <PrivateRoute roles={['CLIENT']}>
              <ClientLayout><CertificatsPage /></ClientLayout>
            </PrivateRoute>
          } />

          <Route path="/paiements" element={
            <PrivateRoute roles={['CLIENT']}>
              <ClientLayout><PaiementsPage /></ClientLayout>
            </PrivateRoute>
          } />

          <Route path="/profil" element={
            <PrivateRoute roles={['CLIENT']}>
              <ClientLayout><ProfilPage /></ClientLayout>
            </PrivateRoute>
          } />

          {/* ── GESTION CAMPAGNES MARKETING (Layout admin, NO SidebarClient) ── */}
          <Route path="/gestion-campagnes-marketing" element={
            <PrivateRoute roles={['RESPONSABLE_MARKETING']}>
              <MarketingLayout><GestionCampagnesMarketing /></MarketingLayout>
            </PrivateRoute>
          } />

          {/* ── GESTION CAMPAGNES (Admin + Marketing) ── */}
          <Route path="/gestion-campagnes" element={
            <PrivateRoute roles={['ADMIN', 'RESPONSABLE_MARKETING']}>
              <Layout><Campagnes /></Layout>
            </PrivateRoute>
          } />

          {/* ── DETAIL ADMIN campagne ── */}
          <Route path="/admin/campagnes/:id" element={
            <PrivateRoute roles={['ADMIN']}>
              <CampagneAdminDetail />
            </PrivateRoute>
          } />

          {/* ── PRIVÉES ── */}
          <Route path="/profile" element={
            <PrivateRoute><Layout><Profile /></Layout></PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute><Layout><Settings /></Layout></PrivateRoute>
          } />

          <Route path="/segments" element={
            <PrivateRoute roles={['ADMIN','RESPONSABLE_MARKETING','CLIENT']}>
              <Layout><Segments /></Layout>
            </PrivateRoute>
          } />
          <Route path="/reporting" element={
            <PrivateRoute roles={['ADMIN','RESPONSABLE_MARKETING']}>
              <Layout><Reporting /></Layout>
            </PrivateRoute>
          } />
          <Route path="/clients" element={
            <PrivateRoute roles={['ADMIN','RESPONSABLE_MARKETING']}>
              <Layout><Clients /></Layout>
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute roles={['ADMIN']}><Layout><UsersPage /></Layout></PrivateRoute>
          } />
          <Route path="/monitoring" element={
            <PrivateRoute roles={['ADMIN']}><Layout><Monitoring /></Layout></PrivateRoute>
          } />
          <Route path="/analytics" element={
            <PrivateRoute roles={['ADMIN','RESPONSABLE_MARKETING']}>
              <Layout><Analytics /></Layout>
            </PrivateRoute>
          } />
          <Route path="/devops-central" element={
            <PrivateRoute roles={['ADMIN','RESPONSABLE_MARKETING']}>
              <Layout><DevOpsCentral /></Layout>
            </PrivateRoute>
          } />
          <Route path="/pipeline" element={
            <PrivateRoute roles={['ADMIN']}><Layout><PipelineStatus /></Layout></PrivateRoute>
          } />
          <Route path="/cloud-operations" element={
            <PrivateRoute roles={['ADMIN']}>
              <Layout><CloudOperations /></Layout>
            </PrivateRoute>
          } />

          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// Role redirect component
function RoleRedirect() {
  const role = getUserRole();

  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'RESPONSABLE_MARKETING') return <Navigate to="/dashboard" replace />;
  if (role === 'CLIENT') return <Navigate to="/campagnes" replace />;
  return <Navigate to="/login" replace />;
}

export default App;