import axios from 'axios';

async function validateStuyvesantURLs() {
  console.log('🔍 Final validation of Stuyvesant URLs after fixing...');
  
  try {
    // Get all opportunities from the API
    const response = await axios.get('http://localhost:5000/api/opportunities');
    const opportunities = response.data;
    
    console.log(`Found ${opportunities.length} total opportunities`);
    
    // Filter for Stuyvesant opportunities from the 2023 files
    const stuyvesantOpps = opportunities.filter(opp => 
      opp.source && opp.source.includes('Stuyvesant') && 
      opp.source.includes('2023')
    );
    
    console.log(`Found ${stuyvesantOpps.length} Stuyvesant 2023 opportunities`);
    
    let validCount = 0;
    let invalidCount = 0;
    let googleSearchCount = 0;
    const invalidURLs = [];
    
    // Check each URL
    for (const opportunity of stuyvesantOpps) {
      const url = opportunity.url;
      
      if (!url || url === 'null' || url === null) {
        invalidCount++;
        invalidURLs.push({
          id: opportunity.id,
          title: opportunity.title,
          url: url || 'null',
          source: opportunity.source,
          issue: 'Missing URL'
        });
        continue;
      }
      
      // Count Google search fallbacks
      if (url.includes('google.com/search')) {
        googleSearchCount++;
      }
      
      try {
        // Test the URL
        const urlResponse = await axios.head(url, {
          timeout: 5000,
          maxRedirects: 5,
          validateStatus: (status) => status >= 200 && status < 400
        });
        
        validCount++;
        
        if (validCount % 10 === 0) {
          console.log(`✓ Validated ${validCount} URLs so far...`);
        }
      } catch (error) {
        // For some URLs, HEAD request might fail but GET works
        try {
          await axios.get(url, {
            timeout: 5000,
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 400
          });
          validCount++;
        } catch (error2) {
          invalidCount++;
          invalidURLs.push({
            id: opportunity.id,
            title: opportunity.title,
            url: url,
            source: opportunity.source,
            issue: error2.response?.status || error2.code || error2.message
          });
          
          console.log(`❌ Invalid URL: ${opportunity.title.substring(0, 50)}... - ${error2.message}`);
        }
      }
    }
    
    console.log('\n📊 FINAL VALIDATION RESULTS:');
    console.log(`✅ Valid URLs: ${validCount}`);
    console.log(`❌ Invalid URLs: ${invalidCount}`);
    console.log(`🔍 Google Search Fallbacks: ${googleSearchCount}`);
    console.log(`📈 Success Rate: ${((validCount / stuyvesantOpps.length) * 100).toFixed(1)}%`);
    
    if (invalidURLs.length > 0) {
      console.log('\n❌ REMAINING INVALID URLS:');
      invalidURLs.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} (ID: ${item.id})`);
        console.log(`   URL: ${item.url}`);
        console.log(`   Issue: ${item.issue}\n`);
      });
    }
    
    // Show examples of successful URLs
    const successfulURLs = stuyvesantOpps.filter(opp => 
      opp.url && opp.url !== 'null' && opp.url !== null
    ).slice(0, 10);
    
    console.log('\n✅ EXAMPLES OF SUCCESSFUL URLS:');
    successfulURLs.forEach(opp => {
      console.log(`• ${opp.title.substring(0, 50)}...`);
      console.log(`  URL: ${opp.url}`);
    });
    
  } catch (error) {
    console.error('❌ Error validating URLs:', error);
  }
}

validateStuyvesantURLs();