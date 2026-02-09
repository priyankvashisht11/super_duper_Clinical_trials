const axios = require('axios');

async function testPerplexityAPI() {
  try {
    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant specializing in clinical research.'
        },
        {
          role: 'user',
          content: 'What is a clinical trial?'
        }
      ],
      max_tokens: 100,
      temperature: 0.3
    }, {
      headers: {
        'Authorization': `Bearer PPLX_API_KEY_REDACTED_FROM_HISTORY`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Perplexity API Test Successful!');
    console.log('Response:', response.data.choices[0].message.content);
    console.log('Citations:', response.data.citations || 'No citations');
  } catch (error) {
    console.log('❌ Perplexity API Test Failed:');
    console.log('Error:', error.response?.data || error.message);
  }
}

testPerplexityAPI();