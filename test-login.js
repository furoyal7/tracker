async function testLogin() {
  try {
    const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password'
      })
    });
    const data = await response.json();
    console.log('Login result:', data);
  } catch (error) {
    console.log('Login failed:', error.message);
  }
}

testLogin();
