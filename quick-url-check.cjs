const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Quick URL verification for small batches
async function quickURLCheck() {
    console.log('=== QUICK URL VERIFICATION ===');
    
    // Get opportunities from database
    try {
        const response = await fetch('http://localhost:5000/api/opportunities');
        const opportunities = await response.json();
        
        // Filter for Web Research 2025 opportunities
        const webResearchOpps = opportunities.filter(opp => 
            opp.source && opp.source.includes('Web Research 2025')
        );
        
        console.log(`Found ${webResearchOpps.length} Web Research 2025 opportunities`);
        
        // Take first 20 for quick check
        const quickBatch = webResearchOpps.slice(0, 20);
        
        console.log(`Testing first ${quickBatch.length} URLs...`);
        
        const results = {
            working: [],
            broken: [],
            total: quickBatch.length
        };
        
        for (let i = 0; i < quickBatch.length; i++) {
            const opp = quickBatch[i];
            console.log(`\n${i + 1}/${quickBatch.length}: Checking ${opp.title}`);
            console.log(`URL: ${opp.url}`);
            
            try {
                const urlCheck = await checkURL(opp.url);
                
                if (urlCheck.working) {
                    console.log(`✅ WORKING (${urlCheck.status})`);
                    results.working.push({
                        id: opp.id,
                        title: opp.title,
                        url: opp.url,
                        status: urlCheck.status
                    });
                } else {
                    console.log(`❌ BROKEN (${urlCheck.status})`);
                    results.broken.push({
                        id: opp.id,
                        title: opp.title,
                        url: opp.url,
                        status: urlCheck.status,
                        error: urlCheck.error
                    });
                }
            } catch (error) {
                console.log(`❌ ERROR: ${error.message}`);
                results.broken.push({
                    id: opp.id,
                    title: opp.title,
                    url: opp.url,
                    status: 'error',
                    error: error.message
                });
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Summary
        console.log('\n=== QUICK CHECK RESULTS ===');
        console.log(`✅ Working: ${results.working.length}/${results.total}`);
        console.log(`❌ Broken: ${results.broken.length}/${results.total}`);
        
        if (results.broken.length > 0) {
            console.log('\n🚨 BROKEN URLs:');
            results.broken.forEach((item, index) => {
                console.log(`${index + 1}. ${item.title}`);
                console.log(`   URL: ${item.url}`);
                console.log(`   Status: ${item.status}`);
            });
        }
        
        // Save results
        const filename = `quick-url-check-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        console.log(`\n💾 Results saved to: ${filename}`);
        
        return results;
        
    } catch (error) {
        console.error('Failed to fetch opportunities:', error);
    }
}

function checkURL(url) {
    return new Promise((resolve) => {
        try {
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: 'HEAD',
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; URLChecker/1.0)'
                }
            };

            const req = client.request(options, (res) => {
                const statusCode = res.statusCode;
                
                if (statusCode >= 200 && statusCode < 400) {
                    resolve({ working: true, status: statusCode });
                } else {
                    resolve({ working: false, status: statusCode });
                }
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({ working: false, status: 'timeout' });
            });

            req.on('error', (error) => {
                resolve({ working: false, status: 'error', error: error.message });
            });

            req.end();
            
        } catch (error) {
            resolve({ working: false, status: 'invalid', error: error.message });
        }
    });
}

quickURLCheck();