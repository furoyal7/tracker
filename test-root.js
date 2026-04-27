async function testRoot() {
  try {
    const response = await fetch('http://127.0.0.1:5000/');
    const data = await response.json();
    console.log('Root result:', data);
  } catch (error) {
    console.log('Root failed:', error.message);
  }
}

testRoot();
