const { neon } = require('@neondatabase/serverless');
const axios = require('axios');

// Database connection
const sql = neon(process.env.DATABASE_URL);

async function validateURL(url, title) {
  try {
    const response = await axios.head(url, { 
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return { url, title, status: response.status, valid: response.status < 400 };
  } catch (error) {
    if (error.response) {
      return { url, title, status: error.response.status, valid: false, error: `HTTP ${error.response.status}` };
    } else if (error.code === 'ENOTFOUND') {
      return { url, title, status: 'DNS', valid: false, error: 'Domain not found' };
    } else if (error.code === 'ECONNREFUSED') {
      return { url, title, status: 'REFUSED', valid: false, error: 'Connection refused' };
    } else if (error.code === 'ETIMEDOUT') {
      return { url, title, status: 'TIMEOUT', valid: false, error: 'Request timeout' };
    } else {
      return { url, title, status: 'ERROR', valid: false, error: error.message };
    }
  }
}

async function validateAllManualURLs() {
  console.log('🔍 VALIDATING ALL MANUAL EXTRACTION URLs...\n');
  
  try {
    // Get all manual extraction opportunities
    const opportunities = await sql`
      SELECT id, title, url, organization 
      FROM opportunities 
      WHERE source = 'manual_extraction'
      ORDER BY title
    `;
    
    console.log(`📊 Found ${opportunities.length} manual extraction opportunities to validate\n`);
    
    const batchSize = 10;
    const results = [];
    const brokenURLs = [];
    
    for (let i = 0; i < opportunities.length; i += batchSize) {
      const batch = opportunities.slice(i, i + batchSize);
      console.log(`\n🔍 Validating batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(opportunities.length/batchSize)} (${batch.length} URLs)...`);
      
      const batchPromises = batch.map(opp => validateURL(opp.url, opp.title));
      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        results.push(result);
        
        if (result.valid) {
          console.log(`✅ ${result.title}: ${result.status}`);
        } else {
          console.log(`❌ ${result.title}: ${result.error || result.status}`);
          console.log(`   URL: ${result.url}`);
          brokenURLs.push(result);
        }
      }
      
      // Rate limiting delay
      if (i + batchSize < opportunities.length) {
        console.log('   ⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n📊 VALIDATION COMPLETE!`);
    console.log(`✅ Valid URLs: ${results.filter(r => r.valid).length}`);
    console.log(`❌ Broken URLs: ${brokenURLs.length}`);
    
    if (brokenURLs.length > 0) {
      console.log(`\n❌ BROKEN URLs THAT NEED FIXING:`);
      brokenURLs.forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Error: ${result.error || result.status}\n`);
      });
    }
    
    return brokenURLs;
    
  } catch (error) {
    console.error('❌ Error validating URLs:', error);
    return [];
  }
}

validateAllManualURLs();