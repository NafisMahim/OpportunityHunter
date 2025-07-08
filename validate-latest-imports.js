import axios from 'axios';
import fs from 'fs';

async function validateLatestImports() {
  console.log('🔍 Validating URLs for the most recently imported opportunities...');
  
  try {
    // Get all opportunities from the API
    const response = await axios.get('http://localhost:5000/api/opportunities');
    const opportunities = response.data;
    
    console.log(`Found ${opportunities.length} total opportunities`);
    
    // Get the 50 most recent opportunities (by ID)
    const recentOpportunities = opportunities
      .sort((a, b) => b.id - a.id)
      .slice(0, 50);
    
    console.log(`Validating the 50 most recent opportunities (IDs: ${recentOpportunities[0].id} to ${recentOpportunities[recentOpportunities.length-1].id})`);
    
    let validCount = 0;
    let invalidCount = 0;
    const invalidURLs = [];
    
    // Check each URL
    for (const opportunity of recentOpportunities) {
      const url = opportunity.applicationUrl;
      
      if (!url || url === 'N/A' || url === 'null' || url === '' || url === 'https://www.google.com/search?q=') {
        invalidCount++;
        invalidURLs.push({
          id: opportunity.id,
          title: opportunity.title,
          url: url || 'null',
          source: opportunity.source || 'unknown',
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
        console.log(`✅ Valid: ${opportunity.title.substring(0, 50)}...`);
      } catch (error) {
        // For some URLs, HEAD request might fail but GET works
        try {
          await axios.get(url, {
            timeout: 5000,
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 400
          });
          validCount++;
          console.log(`✅ Valid: ${opportunity.title.substring(0, 50)}...`);
        } catch (error2) {
          invalidCount++;
          invalidURLs.push({
            id: opportunity.id,
            title: opportunity.title,
            url: url,
            source: opportunity.source || 'unknown',
            issue: error2.response?.status || error2.code || error2.message
          });
          
          console.log(`❌ Invalid: ${opportunity.title.substring(0, 50)}... - ${error2.message}`);
        }
      }
    }
    
    console.log('\n📊 VALIDATION RESULTS:');
    console.log(`✅ Valid URLs: ${validCount}`);
    console.log(`❌ Invalid URLs: ${invalidCount}`);
    console.log(`📈 Success Rate: ${((validCount / recentOpportunities.length) * 100).toFixed(1)}%`);
    
    if (invalidURLs.length > 0) {
      console.log('\n❌ INVALID URLS FOUND:');
      invalidURLs.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} (ID: ${item.id})`);
        console.log(`   URL: ${item.url}`);
        console.log(`   Source: ${item.source}`);
        console.log(`   Issue: ${item.issue}\n`);
      });
      
      // Save invalid URLs to file for fixing
      fs.writeFileSync('invalid-urls-latest.json', JSON.stringify(invalidURLs, null, 2));
      console.log('📁 Invalid URLs saved to invalid-urls-latest.json');
    }
    
  } catch (error) {
    console.error('❌ Error validating URLs:', error);
  }
}

validateLatestImports();