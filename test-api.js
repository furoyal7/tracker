const axios = require('axios');

async function test() {
  try {
    const response = await axios.get('http://localhost:5000/api/chat/conversations?merchantId=test');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
  } catch (error) {
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
  }
}

test();
