import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout      from './Layout';
import NotFound    from './pages/NotFound';
import Profile     from './pages/Profile';
import Settings    from './pages/Settings';
import HomePage    from './pages/HomePage';
import PublicCampagnes from './pages/PublicCampagnes';

const Login               = lazy(() => import('./pages/Login'));
const Dashboard           = lazy(() => import('./pages/Dashboard'));
const Clients             = lazy(() => import('./pages/Clients'));
const Campagnes           = lazy(() => import('./pages/Campagnes'));
const Contacts            = lazy(() => import('./pages/Contacts'));
const Segments            = lazy(() => import('./pages/Segments'));
const Reporting           = lazy(() => import('./pages/Reporting'));
const Users               = lazy(() => import('./pages/Users'));
const Monitoring          = lazy(() => import('./pages/Monitoring'));
const Analytics           = lazy(() => import('./pages/Analytics'));
const AccessDenied        = lazy(() => import('./pages/AccessDenied'));
const PipelineStatus      = lazy(() => import('./pages/PipelineStatus'));
const MesCampagnes        = lazy(() => import('./pages/MesCampagnes'));
const CampagneDetail      = lazy(() => import('./pages/CampagneDetail'));
const CampagneAdminDetail = lazy(() => import('./pages/CampagneAdminDetail'));
const Register = lazy(() => import('./pages/Register'));

const Loading = () => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080c14', fontFamily:"'Inter',sans-serif" }}>
    <div style={{ textAlign:'center' }}>
      <div style={{ width:40, height:40, border:'3px solid rgba(245,166,35,0.2)', borderTop:'3px solid #f5a623', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px' }}/>
      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14 }}>Chargement...</p>
    </div>
    <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>

          {/* ── PUBLIQUES ── */}
          <Route path="/"                 element={<HomePage />} />
          <Route path="/login"            element={<Login />} />
          <Route path="/access-denied"    element={<AccessDenied />} />
          <Route path="/campagnes-public" element={<PublicCampagnes />} />
          <Route path="/register" element={<Register />} />

          {/* ── FLUX CAMPAGNE (visiteur → login → inscription) ── */}
          <Route path="/campagnes"        element={<MesCampagnes />} />
          <Route path="/campagnes/:id"    element={<CampagneDetail />} />

          {/* ── DASHBOARD ADMIN inscrits (protégé) ── */}
          <Route path="/admin/campagnes/:id" element={
            <PrivateRoute roles={['ADMIN', 'RESPONSABLE_MARKETING']}>
              <CampagneAdminDetail />
            </PrivateRoute>
          } />

          {/* ── PRIVÉES ── */}
          <Route path="/dashboard" element={
            <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><Layout><Profile /></Layout></PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute><Layout><Settings /></Layout></PrivateRoute>
          } />
          <Route path="/mes-campagnes" element={
            <PrivateRoute roles={['ADMIN','RESPONSABLE_MARKETING','CLIENT']}>
              <Layout><MesCampagnes /></Layout>
            </PrivateRoute>
          } />
          <Route path="/contacts" element={
            <PrivateRoute roles={['ADMIN','RESPONSABLE_MARKETING','CLIENT']}>
              <Layout><Contacts /></Layout>
            </PrivateRoute>
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
            <PrivateRoute roles={['ADMIN']}><Layout><Clients /></Layout></PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute roles={['ADMIN']}><Layout><Users /></Layout></PrivateRoute>
          } />
          <Route path="/monitoring" element={
            <PrivateRoute roles={['ADMIN']}><Layout><Monitoring /></Layout></PrivateRoute>
          } />
          <Route path="/analytics" element={
            <PrivateRoute roles={['ADMIN','RESPONSABLE_MARKETING']}>
              <Layout><Analytics /></Layout>
            </PrivateRoute>
          } />
          <Route path="/pipeline" element={
            <PrivateRoute roles={['ADMIN']}><Layout><PipelineStatus /></Layout></PrivateRoute>
          } />

          <Route path="*" element={<NotFound />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;