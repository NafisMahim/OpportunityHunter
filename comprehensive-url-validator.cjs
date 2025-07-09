// Comprehensive URL validator - Test ALL opportunities for actual working URLs
const https = require('https');
const http = require('http');

async function testURL(url, timeout = 10000) {
    return new Promise((resolve) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.request(url, { 
            method: 'HEAD',
            timeout: timeout,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (res) => {
            // Consider 2xx and 3xx status codes as working
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve({ working: true, status: res.statusCode, error: null });
            } else {
                resolve({ working: false, status: res.statusCode, error: `HTTP ${res.statusCode}` });
            }
        });
        
        req.on('error', (err) => {
            resolve({ working: false, status: null, error: err.message });
        });
        
        req.on('timeout', () => {
            req.destroy();
            resolve({ working: false, status: null, error: 'Timeout' });
        });
        
        req.end();
    });
}

async function comprehensiveURLValidator() {
    console.log('=== COMPREHENSIVE URL VALIDATOR ===');
    console.log('Testing ALL opportunities for working URLs...\n');
    
    // Get all opportunities from database
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    console.log(`Found ${opportunities.length} opportunities to test`);
    
    let workingCount = 0;
    let brokenCount = 0;
    const brokenURLs = [];
    
    // Test URLs in batches to avoid overwhelming servers
    const batchSize = 10;
    
    for (let i = 0; i < opportunities.length; i += batchSize) {
        const batch = opportunities.slice(i, i + batchSize);
        
        console.log(`\n🔍 Testing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(opportunities.length/batchSize)}...`);
        
        const promises = batch.map(async (opp) => {
            if (!opp.url || opp.url.length < 10) {
                return { opp, result: { working: false, status: null, error: 'Invalid URL' } };
            }
            
            try {
                const result = await testURL(opp.url);
                return { opp, result };
            } catch (error) {
                return { opp, result: { working: false, status: null, error: error.message } };
            }
        });
        
        const results = await Promise.all(promises);
        
        for (const { opp, result } of results) {
            if (result.working) {
                workingCount++;
                console.log(`✅ ${opp.title} - Status: ${result.status}`);
            } else {
                brokenCount++;
                brokenURLs.push({
                    id: opp.id,
                    title: opp.title,
                    url: opp.url,
                    error: result.error,
                    status: result.status
                });
                console.log(`❌ ${opp.title} - ERROR: ${result.error}`);
                console.log(`   URL: ${opp.url}`);
            }
        }
        
        // Small delay between batches to be respectful to servers
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n=== COMPREHENSIVE URL VALIDATION RESULTS ===`);
    console.log(`✅ Working URLs: ${workingCount}`);
    console.log(`❌ Broken URLs: ${brokenCount}`);
    console.log(`📊 Total tested: ${opportunities.length}`);
    console.log(`🎯 Success rate: ${((workingCount / opportunities.length) * 100).toFixed(1)}%`);
    
    if (brokenURLs.length > 0) {
        console.log(`\n🔧 BROKEN URLs THAT NEED FIXING:`);
        brokenURLs.forEach((item, index) => {
            console.log(`${index + 1}. ${item.title}`);
            console.log(`   URL: ${item.url}`);
            console.log(`   ERROR: ${item.error}`);
            console.log(`   ID: ${item.id}`);
            console.log('');
        });
        
        // Save broken URLs to file for further processing
        require('fs').writeFileSync('broken-urls-validation.json', JSON.stringify(brokenURLs, null, 2));
        console.log('💾 Broken URLs saved to broken-urls-validation.json');
    } else {
        console.log('\n🎉 ALL URLs ARE WORKING! Perfect 100% success rate!');
    }
    
    return {
        workingCount,
        brokenCount,
        brokenURLs,
        totalTested: opportunities.length,
        successRate: ((workingCount / opportunities.length) * 100).toFixed(1)
    };
}

comprehensiveURLValidator().catch(console.error);