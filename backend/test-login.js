const axios = require('axios');

async function test() {
  try {
    // 1. Login
    const login = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'amenibahri555@gmail.com',
      password: 'admin123'
    });
    console.log('✅ LOGIN:', login.data);
    
    // 2. Get users avec token
    const users = await axios.get('http://localhost:5000/api/users', {
      headers: { Authorization: `Bearer ${login.data.token}` }
    });
    console.log('✅ USERS:', users.data.length, 'users');
    
  } catch (e) {
    console.error('❌ ERREUR:', e.response?.status, e.response?.data || e.message);
  }
}

test();