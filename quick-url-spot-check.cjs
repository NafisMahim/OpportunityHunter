// Quick URL spot check for specific problematic URLs
const https = require('https');
const http = require('http');

async function quickTestURL(url, timeout = 5000) {
    return new Promise((resolve) => {
        if (!url || url.length < 10) {
            resolve({ working: false, status: null, error: 'Invalid URL' });
            return;
        }
        
        try {
            const urlObj = new URL(url);
            const client = urlObj.protocol === 'https:' ? https : http;
            
            const req = client.request(url, { 
                method: 'HEAD',
                timeout: timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }, (res) => {
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
        } catch (error) {
            resolve({ working: false, status: null, error: error.message });
        }
    });
}

async function quickURLSpotCheck() {
    console.log('=== QUICK URL SPOT CHECK ===');
    
    // Get all opportunities from database
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    // Find the specific problematic URLs mentioned by user
    const problematicTitles = [
        'National Hispanic Youth Initiative Program',
        'West Point Summer Leaders Seminar', 
        'National Honors Society', 
        'National Honor Society'
    ];
    
    const problematicOpps = opportunities.filter(opp => 
        problematicTitles.some(title => 
            opp.title.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(opp.title.toLowerCase())
        )
    );
    
    console.log(`Found ${problematicOpps.length} opportunities matching user's concerns:`);
    
    const brokenURLs = [];
    
    for (const opp of problematicOpps) {
        console.log(`\n🔍 Testing: ${opp.title}`);
        console.log(`   URL: ${opp.url}`);
        
        const result = await quickTestURL(opp.url);
        
        if (result.working) {
            console.log(`✅ Status: ${result.status} - WORKING`);
        } else {
            console.log(`❌ ERROR: ${result.error}`);
            brokenURLs.push({
                id: opp.id,
                title: opp.title,
                url: opp.url,
                error: result.error,
                status: result.status
            });
        }
    }
    
    // Test a random sample of 20 other URLs
    console.log('\n=== RANDOM SAMPLE CHECK (20 URLs) ===');
    const randomSample = opportunities
        .filter(opp => !problematicOpps.includes(opp))
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);
    
    let randomWorkingCount = 0;
    
    for (const opp of randomSample) {
        const result = await quickTestURL(opp.url);
        
        if (result.working) {
            randomWorkingCount++;
            console.log(`✅ ${opp.title} - Status: ${result.status}`);
        } else {
            console.log(`❌ ${opp.title} - ERROR: ${result.error}`);
            brokenURLs.push({
                id: opp.id,
                title: opp.title,
                url: opp.url,
                error: result.error,
                status: result.status
            });
        }
    }
    
    console.log(`\n=== SPOT CHECK RESULTS ===`);
    console.log(`🔍 Problematic URLs tested: ${problematicOpps.length}`);
    console.log(`🎲 Random sample tested: ${randomSample.length}`);
    console.log(`❌ Total broken URLs found: ${brokenURLs.length}`);
    console.log(`✅ Random sample success rate: ${((randomWorkingCount / randomSample.length) * 100).toFixed(1)}%`);
    
    if (brokenURLs.length > 0) {
        console.log(`\n🔧 BROKEN URLs THAT NEED FIXING:`);
        brokenURLs.forEach((item, index) => {
            console.log(`${index + 1}. ${item.title}`);
            console.log(`   URL: ${item.url}`);
            console.log(`   ERROR: ${item.error}`);
            console.log(`   ID: ${item.id}`);
            console.log('');
        });
        
        return brokenURLs;
    } else {
        console.log('\n🎉 All tested URLs are working!');
        return [];
    }
}

quickURLSpotCheck().catch(console.error);