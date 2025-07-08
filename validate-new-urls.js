import axios from 'axios';
import fs from 'fs';

async function validateNewURLs() {
  console.log('🔍 Validating URLs for opportunities imported in the latest batch...');
  
  try {
    // Get all opportunities from the API
    const response = await axios.get('http://localhost:5000/api/opportunities');
    const opportunities = response.data;
    
    console.log(`Found ${opportunities.length} total opportunities`);
    
    // Filter for opportunities from the new 2023 files
    const newOpportunities = opportunities.filter(opp => 
      opp.source && opp.source.includes('2023') && 
      (opp.source.includes('SOB-1-September') || 
       opp.source.includes('SOB-2L-September') ||
       opp.source.includes('SOB-3L-September') ||
       opp.source.includes('SOB-4L-September') ||
       opp.source.includes('SOB-5L-October') ||
       opp.source.includes('SOB-6L-October') ||
       opp.source.includes('SOB-7L-October') ||
       opp.source.includes('SOB-8L-October') ||
       opp.source.includes('SOB-9L-November') ||
       opp.source.includes('SOB-13L-December') ||
       opp.source.includes('SOB-14L-December') ||
       opp.source.includes('SOB-15L-December'))
    );
    
    console.log(`Found ${newOpportunities.length} opportunities from the new 2023 import batch`);
    
    let validCount = 0;
    let invalidCount = 0;
    const invalidURLs = [];
    
    // Check each URL
    for (const opportunity of newOpportunities) {
      const url = opportunity.applicationUrl;
      
      if (!url || url === 'N/A' || url === 'null' || url === '' || url === 'https://www.google.com/search?q=') {
        invalidCount++;
        invalidURLs.push({
          id: opportunity.id,
          title: opportunity.title,
          url: url,
          source: opportunity.source,
          issue: 'Missing or invalid URL'
        });
        continue;
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
        invalidCount++;
        invalidURLs.push({
          id: opportunity.id,
          title: opportunity.title,
          url: url,
          source: opportunity.source,
          issue: error.message
        });
        
        console.log(`❌ Invalid URL: ${opportunity.title} - ${error.message}`);
      }
    }
    
    console.log('\n📊 VALIDATION RESULTS:');
    console.log(`✅ Valid URLs: ${validCount}`);
    console.log(`❌ Invalid URLs: ${invalidCount}`);
    console.log(`📈 Success Rate: ${((validCount / newOpportunities.length) * 100).toFixed(1)}%`);
    
    if (invalidURLs.length > 0) {
      console.log('\n❌ INVALID URLS FOUND:');
      invalidURLs.forEach(item => {
        console.log(`- ${item.title} (${item.source})`);
        console.log(`  URL: ${item.url}`);
        console.log(`  Issue: ${item.issue}\n`);
      });
      
      // Save invalid URLs to file for fixing
      fs.writeFileSync('invalid-urls-2023-import.json', JSON.stringify(invalidURLs, null, 2));
      console.log('📁 Invalid URLs saved to invalid-urls-2023-import.json');
    }
    
  } catch (error) {
    console.error('❌ Error validating URLs:', error);
  }
}

validateNewURLs();