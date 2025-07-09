const https = require('https');
const http = require('http');
const { URL } = require('url');

// Comprehensive verification of ALL URLs in the database
async function verifyAllURLs() {
    console.log('=== COMPREHENSIVE URL VERIFICATION OF ALL 2,505 OPPORTUNITIES ===');
    
    // Get ALL opportunities
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    console.log(`Total opportunities to verify: ${opportunities.length}`);
    
    const results = {
        total: opportunities.length,
        working: 0,
        broken: 0,
        brokenUrls: [],
        processed: 0
    };
    
    // Process in smaller batches to avoid timeouts
    const batchSize = 50;
    let batch = 0;
    
    for (let i = 0; i < opportunities.length; i += batchSize) {
        batch++;
        const currentBatch = opportunities.slice(i, i + batchSize);
        console.log(`\n=== BATCH ${batch}: Processing opportunities ${i + 1} - ${Math.min(i + batchSize, opportunities.length)} ===`);
        
        for (const opp of currentBatch) {
            results.processed++;
            
            try {
                const urlResult = await testURL(opp.url, 3000); // 3 second timeout
                
                if (urlResult.success) {
                    results.working++;
                    console.log(`✅ ${results.processed}/${results.total}: ${opp.title.substring(0, 50)}...`);
                } else {
                    results.broken++;
                    results.brokenUrls.push({
                        id: opp.id,
                        title: opp.title,
                        organization: opp.organization || 'Unknown',
                        url: opp.url,
                        source: opp.source || 'Unknown',
                        error: urlResult.error || urlResult.status,
                        type: opp.type || 'Unknown'
                    });
                    console.log(`❌ ${results.processed}/${results.total}: ${opp.title.substring(0, 50)}... - ${urlResult.error || urlResult.status}`);
                }
            } catch (error) {
                results.broken++;
                results.brokenUrls.push({
                    id: opp.id,
                    title: opp.title,
                    organization: opp.organization || 'Unknown',
                    url: opp.url,
                    source: opp.source || 'Unknown',
                    error: error.message,
                    type: opp.type || 'Unknown'
                });
                console.log(`❌ ${results.processed}/${results.total}: ${opp.title.substring(0, 50)}... - ERROR: ${error.message}`);
            }
            
            // Small delay between requests to be respectful
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log(`Batch ${batch} complete. Progress: ${results.processed}/${results.total} (${Math.round(results.processed/results.total*100)}%)`);
        console.log(`Working: ${results.working}, Broken: ${results.broken}`);
    }
    
    console.log('\n=== VERIFICATION COMPLETE ===');
    console.log(`Total opportunities: ${results.total}`);
    console.log(`Working URLs: ${results.working} (${Math.round(results.working/results.total*100)}%)`);
    console.log(`Broken URLs: ${results.broken} (${Math.round(results.broken/results.total*100)}%)`);
    
    if (results.broken > 0) {
        console.log('\n=== BROKEN URLs BY SOURCE ===');
        const brokenBySource = {};
        results.brokenUrls.forEach(item => {
            if (!brokenBySource[item.source]) {
                brokenBySource[item.source] = [];
            }
            brokenBySource[item.source].push(item);
        });
        
        Object.keys(brokenBySource).forEach(source => {
            console.log(`\n${source}: ${brokenBySource[source].length} broken URLs`);
            brokenBySource[source].slice(0, 5).forEach(item => {
                console.log(`  - ${item.title.substring(0, 60)}... (${item.url})`);
            });
            if (brokenBySource[source].length > 5) {
                console.log(`  ... and ${brokenBySource[source].length - 5} more`);
            }
        });
    }
    
    // Save detailed results
    const timestamp = Date.now();
    const filename = `comprehensive-verification-${timestamp}.json`;
    const fs = require('fs');
    fs.writeFileSync(filename, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: results,
        brokenUrls: results.brokenUrls
    }, null, 2));
    
    console.log(`\n💾 Detailed results saved to: ${filename}`);
    
    return results;
}

function testURL(url, timeout = 5000) {
    return new Promise((resolve) => {
        try {
            if (!url || !url.startsWith('http')) {
                return resolve({ success: false, error: 'Invalid URL format' });
            }

            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: 'HEAD',
                timeout: timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; OpportunityChecker/1.0)'
                }
            };

            const req = client.request(options, (res) => {
                const statusCode = res.statusCode;
                
                // Accept 2xx and 3xx status codes as working
                if (statusCode >= 200 && statusCode < 400) {
                    resolve({ success: true, status: statusCode });
                } else {
                    resolve({ success: false, status: statusCode });
                }
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({ success: false, error: 'timeout' });
            });

            req.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });

            req.end();
            
        } catch (error) {
            resolve({ success: false, error: error.message });
        }
    });
}

verifyAllURLs().catch(error => {
    console.error('Comprehensive verification failed:', error);
});