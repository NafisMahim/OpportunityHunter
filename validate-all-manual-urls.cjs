const { neon } = require('@neondatabase/serverless');
const axios = require('axios');

// Database connection
const sql = neon(process.env.DATABASE_URL);

async function validateAllManualURLs() {
  console.log('🔍 COMPREHENSIVE URL VALIDATION FOR ALL MANUAL EXTRACTION OPPORTUNITIES...\n');
  
  try {
    // Get all manual extraction opportunities
    const opportunities = await sql`
      SELECT id, title, url, organization 
      FROM opportunities 
      WHERE source = 'manual_extraction'
      ORDER BY title
    `;
    
    console.log(`📊 Found ${opportunities.length} manual extraction opportunities to validate\n`);
    
    const brokenURLs = [];
    const workingURLs = [];
    let checkedCount = 0;
    
    for (const opp of opportunities) {
      checkedCount++;
      
      try {
        // Test the URL with a HEAD request (faster than GET)
        const response = await axios.head(opp.url, {
          timeout: 5000,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept redirects
          },
          maxRedirects: 5
        });
        
        if (response.status >= 200 && response.status < 400) {
          workingURLs.push(opp);
          console.log(`✅ Working: ${opp.title} (${response.status})`);
        } else {
          brokenURLs.push({ ...opp, error: `HTTP ${response.status}` });
          console.log(`❌ Broken: ${opp.title} - HTTP ${response.status}`);
        }
        
      } catch (error) {
        let errorType = 'Unknown error';
        
        if (error.code === 'ENOTFOUND') {
          errorType = 'Domain not found';
        } else if (error.code === 'ECONNREFUSED') {
          errorType = 'Connection refused';
        } else if (error.code === 'ETIMEDOUT') {
          errorType = 'Timeout';
        } else if (error.response) {
          errorType = `HTTP ${error.response.status}`;
        }
        
        brokenURLs.push({ ...opp, error: errorType });
        console.log(`❌ Broken: ${opp.title} - ${errorType}`);
      }
      
      // Progress indicator
      if (checkedCount % 10 === 0) {
        console.log(`📊 Checked ${checkedCount}/${opportunities.length} URLs...\n`);
      }
      
      // Small delay to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n🎯 VALIDATION SUMMARY:`);
    console.log(`✅ Working URLs: ${workingURLs.length}`);
    console.log(`❌ Broken URLs: ${brokenURLs.length}`);
    console.log(`📊 Total checked: ${checkedCount}`);
    
    if (brokenURLs.length > 0) {
      console.log(`\n💥 BROKEN URLs BY ERROR TYPE:`);
      
      const errorGroups = {};
      brokenURLs.forEach(opp => {
        if (!errorGroups[opp.error]) {
          errorGroups[opp.error] = [];
        }
        errorGroups[opp.error].push(opp);
      });
      
      Object.keys(errorGroups).forEach(errorType => {
        console.log(`\n❌ ${errorType} (${errorGroups[errorType].length} URLs):`);
        errorGroups[errorType].slice(0, 5).forEach(opp => {
          console.log(`   - ${opp.title}: ${opp.url}`);
        });
        if (errorGroups[errorType].length > 5) {
          console.log(`   ... and ${errorGroups[errorType].length - 5} more`);
        }
      });
      
      // Save broken URLs to file for fixing
      const fs = require('fs');
      fs.writeFileSync('broken-manual-urls.json', JSON.stringify(brokenURLs, null, 2));
      console.log(`\n💾 Saved broken URLs to broken-manual-urls.json for fixing`);
    }
    
  } catch (error) {
    console.error('❌ Error validating URLs:', error);
  }
}

validateAllManualURLs();