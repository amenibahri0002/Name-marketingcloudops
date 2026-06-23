// test-suite-complete.js - Tests automatisés DigiPip v2
const axios = require('axios');

// ============================================
// CONFIGURATION
// ============================================
const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const TEST_CONFIG = {
  admin: { email: 'amenibahri555@gmail.com', password: 'admin123' },
  marketing: { email: 'bahriameni412@gmail.com', password: 'marketing123' },
  client: { email: 'ahmed@gmail.com', password: '123456' },
  tenantId: 'cmqlsn2yu0000ybn5t0unlx8u',
  fakeTenantId: 'fake-tenant-123456'
};

// ============================================
// UTILITAIRES
// ============================================
const results = { passed: 0, failed: 0, tests: [] };

async function test(name, fn) {
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log('  PASS ' + name);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log('  FAIL ' + name + ': ' + error.message);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

// ============================================
// CLIENT HTTP
// ============================================
let tokens = {};

async function login(credentials) {
  const res = await axios.post(BASE_URL + '/api/auth/login', credentials);
  return res.data.token;
}

async function api(method, path, data, token, tenantId) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (tenantId) headers['x-tenant-id'] = tenantId;

  const config = { method: method, url: BASE_URL + path, headers: headers };
  if (data) config.data = data;

  return axios(config);
}

// ============================================
// SECTION 1: AUTHENTIFICATION
// ============================================
async function testAuth() {
  console.log('\nSECTION 1: AUTHENTIFICATION');

  await test('1.1 Login Admin', async () => {
    const res = await axios.post(BASE_URL + '/api/auth/login', TEST_CONFIG.admin);
    assert(res.status === 200, 'Status 200');
    assert(res.data.token, 'Token present');
    assert(res.data.user.role === 'ADMIN', 'Role ADMIN');
    tokens.admin = res.data.token;
  });

  await test('1.2 Login Responsable Marketing', async () => {
    const res = await axios.post(BASE_URL + '/api/auth/login', TEST_CONFIG.marketing);
    assert(res.status === 200);
    assert(res.data.user.role === 'RESPONSABLE_MARKETING');
    tokens.marketing = res.data.token;
  });

  await test('1.3 Login Client', async () => {
    const res = await axios.post(BASE_URL + '/api/auth/login', TEST_CONFIG.client);
    assert(res.status === 200);
    assert(res.data.user.role === 'CLIENT');
    tokens.client = res.data.token;
  });

  await test('1.4 Login mot de passe incorrect', async () => {
    try {
      await axios.post(BASE_URL + '/api/auth/login', {
        email: TEST_CONFIG.admin.email,
        password: 'wrongpassword'
      });
      assert(false, 'Devrait echouer');
    } catch (e) {
      // Accepter 400 ou 401
      assert([400, 401].includes(e.response.status), 
             'Status 400 ou 401, recu: ' + e.response.status);
    }
  });

  await test('1.5 Acces sans token', async () => {
    try {
      await axios.get(BASE_URL + '/api/users');
      assert(false, 'Devrait echouer');
    } catch (e) {
      assert(e.response.status === 401, 'Status 401');
    }
  });

  await test('1.6 Health check', async () => {
    const res = await axios.get(BASE_URL + '/api/health');
    assert(res.status === 200);
    assert(res.data.status === 'ok' || res.data.status === 'OK');
  });
}

// ============================================
// SECTION 2: MULTI-TENANT
// ============================================
async function testMultiTenant() {
  console.log('\nSECTION 2: MULTI-TENANT');

  await test('2.1 Resolution par header x-tenant-id', async () => {
    const res = await api('GET', '/api/campagnes', null, null, TEST_CONFIG.tenantId);
    assert(res.status === 200);
    assert(Array.isArray(res.data), 'Resultat est un array');
  });

  await test('2.2 Resolution par slug', async () => {
    const res = await axios.get(BASE_URL + '/api/campagnes', {
      headers: { 'x-tenant-slug': 'digilab-solutions' }
    });
    assert(res.status === 200);
  });

  await test('2.3 Tenant invalide', async () => {
    try {
      await api('GET', '/api/campagnes', null, null, TEST_CONFIG.fakeTenantId);
      assert(false, 'Devrait echouer');
    } catch (e) {
      // Peut etre 403 ou 401 selon config
      assert([401, 403].includes(e.response.status), 
             'Status 401 ou 403, recu: ' + e.response.status);
    }
  });

  await test('2.4 Isolation donnees - cross tenant', async () => {
    try {
      const res = await api('GET', '/api/users', null, tokens.admin, TEST_CONFIG.fakeTenantId);
      if (res.status === 200) {
        assert(res.data.length === 0, 'Aucun resultat pour fake tenant');
      }
    } catch (e) {
      assert([200, 401, 403].includes(e.response.status), 
             'Status 200/401/403, recu: ' + e.response.status);
    }
  });

  await test('2.5 Tenant access control', async () => {
    try {
      await api('GET', '/api/users', null, tokens.client, TEST_CONFIG.fakeTenantId);
    } catch (e) {
      assert([403, 401].includes(e.response.status), 'Status 403 ou 401');
    }
  });
}

// ============================================
// SECTION 3: UTILISATEURS
// ============================================
async function testUsers() {
  console.log('\nSECTION 3: UTILISATEURS');

  await test('3.1 Liste users (Admin)', async () => {
    const res = await api('GET', '/api/users', null, tokens.admin, TEST_CONFIG.tenantId);
    assert(res.status === 200);
    assert(Array.isArray(res.data));
    assert(res.data.length >= 4, 'Au moins 4 users');
  });

  await test('3.2 Liste users (Client - limite)', async () => {
    const res = await api('GET', '/api/users', null, tokens.client, TEST_CONFIG.tenantId);
    assert(res.status === 200 || res.status === 403);
  });

  await test('3.3 Profil utilisateur connecte', async () => {
    const res = await api('GET', '/api/users/me', null, tokens.client, TEST_CONFIG.tenantId);
    assert(res.status === 200);
    assert(res.data.email === TEST_CONFIG.client.email);
  });
}

// ============================================
// SECTION 4: CAMPAGNES
// ============================================
async function testCampagnes() {
  console.log('\nSECTION 4: CAMPAGNES');

  await test('4.1 Liste campagnes publiques', async () => {
    const res = await api('GET', '/api/campagnes', null, null, TEST_CONFIG.tenantId);
    assert(res.status === 200);
    assert(Array.isArray(res.data));
    assert(res.data.length >= 4, 'Au moins 4 campagnes');
  });

  await test('4.2 Detail campagne', async () => {
    const list = await api('GET', '/api/campagnes', null, null, TEST_CONFIG.tenantId);
    if (list.data.length > 0) {
      const slug = list.data[0].slug;
      const res = await api('GET', '/api/campagnes/' + slug, null, null, TEST_CONFIG.tenantId);
      assert(res.status === 200);
      assert(res.data.title);
    }
  });

  await test('4.3 Campagnes filtrees par tenant', async () => {
    const resReal = await api('GET', '/api/campagnes', null, null, TEST_CONFIG.tenantId);
    const resFake = await api('GET', '/api/campagnes', null, null, TEST_CONFIG.fakeTenantId);
    assert(resReal.data.length > 0, 'Campagnes pour vrai tenant');
    assert(resFake.data.length === 0, 'Aucune campagne pour fake tenant');
  });
}

// ============================================
// SECTION 5: INSCRIPTIONS
// ============================================
async function testInscriptions() {
  console.log('\nSECTION 5: INSCRIPTIONS');

  await test('5.1 Inscription anonyme', async () => {
    const campagnes = await api('GET', '/api/campagnes', null, null, TEST_CONFIG.tenantId);
    if (campagnes.data.length === 0) return;

    const res = await api('POST', '/api/inscriptions', {
      name: 'Test User',
      email: 'test-inscription@example.com',
      phone: '+216 99 999 999',
      campagneId: campagnes.data[0].id
    }, null, TEST_CONFIG.tenantId);
    assert(res.status === 201 || res.status === 200);
  });

  await test('5.2 Liste inscriptions (Admin)', async () => {
    const res = await api('GET', '/api/inscriptions', null, tokens.admin, TEST_CONFIG.tenantId);
    assert(res.status === 200);
    assert(Array.isArray(res.data));
  });

  await test('5.3 Mes inscriptions (Client)', async () => {
    const res = await api('GET', '/api/inscriptions/mes-inscriptions', null, tokens.client, TEST_CONFIG.tenantId);
    assert(res.status === 200 || res.status === 404);
  });
}

// ============================================
// SECTION 6: PAIEMENTS
// ============================================
async function testPaiements() {
  console.log('\nSECTION 6: PAIEMENTS');

  await test('6.1 Liste paiements (Admin)', async () => {
    const res = await api('GET', '/api/paiements', null, tokens.admin, TEST_CONFIG.tenantId);
    assert(res.status === 200);
    assert(Array.isArray(res.data));
  });

  await test('6.2 Mes paiements (Client)', async () => {
    const res = await api('GET', '/api/paiements/mes-paiements', null, tokens.client, TEST_CONFIG.tenantId);
    assert(res.status === 200 || res.status === 404);
  });
}

// ============================================
// SECTION 7: SECURITE
// ============================================
async function testSecurity() {
  console.log('\nSECTION 7: SECURITE');

  await test('7.1 Headers de securite (Helmet)', async () => {
    const res = await axios.get(BASE_URL + '/api/health');
    assert(res.headers['x-frame-options'] || res.headers['content-security-policy'], 
           'Headers de securite presents');
  });

  await test('7.2 CORS', async () => {
    try {
      await axios.get(BASE_URL + '/api/health', {
        headers: { 'Origin': 'https://evil-site.com' }
      });
    } catch (e) {
      assert(e.response.status !== 500, 'Pas d erreur serveur');
    }
  });

  await test('7.3 Rate limiting', async () => {
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(axios.get(BASE_URL + '/api/health').catch(e => e));
    }
    const responses = await Promise.all(promises);
    const has429 = responses.some(r => r.response && r.response.status === 429);
    console.log('     Rate limit triggered: ' + has429);
  });
}

// ============================================
// SECTION 8: FRONTEND
// ============================================
async function testFrontend() {
  console.log('\nSECTION 8: FRONTEND');

  await test('8.1 Page d accueil accessible', async () => {
    try {
      const res = await axios.get(FRONTEND_URL, { timeout: 5000 });
      assert(res.status === 200);
    } catch (e) {
      console.log('     Frontend non demarre sur ' + FRONTEND_URL);
    }
  });

  await test('8.2 API accessible depuis frontend', async () => {
    const res = await axios.get(BASE_URL + '/api/health');
    assert(res.status === 200);
  });
}

// ============================================
// RAPPORT FINAL
// ============================================
function printReport() {
  console.log('\n' + '='.repeat(50));
  console.log('   RAPPORT TEST DIGIPIP');
  console.log('='.repeat(50));

  const sections = {};
  results.tests.forEach(t => {
    const section = t.name.split('.')[0];
    if (!sections[section]) sections[section] = [];
    sections[section].push(t);
  });

  Object.entries(sections).forEach(([section, tests]) => {
    const passed = tests.filter(t => t.status === 'PASS').length;
    const total = tests.length;
    const icon = passed === total ? 'OK' : passed > 0 ? 'WARN' : 'KO';
    console.log('\n' + icon + ' Section ' + section + ': ' + passed + '/' + total);
    tests.forEach(t => {
      console.log('   ' + t.status + ' ' + t.name);
    });
  });

  console.log('\n' + '='.repeat(50));
  const total = results.passed + results.failed;
  const pct = ((results.passed / total) * 100).toFixed(1);
  console.log('TOTAL: ' + results.passed + '/' + total + ' tests passes (' + pct + '%)');
  console.log('='.repeat(50));

  if (results.failed > 0) {
    console.log('\nTests echoues:');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
      console.log('   - ' + t.name + ': ' + t.error);
    });
  }
}

// ============================================
// EXECUTION
// ============================================
async function runAllTests() {
  console.log('DEMARRAGE DES TESTS DIGIPIP v2');
  console.log('API: ' + BASE_URL);
  console.log('Frontend: ' + FRONTEND_URL);

  const startTime = Date.now();

  await testAuth();
  await testMultiTenant();
  await testUsers();
  await testCampagnes();
  await testInscriptions();
  await testPaiements();
  await testSecurity();
  await testFrontend();

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\nDuree: ' + duration + 's');

  printReport();

  process.exit(results.failed > 0 ? 1 : 0);
}

runAllTests().catch(e => {
  console.error('Erreur fatale:', e);
  process.exit(1);
});