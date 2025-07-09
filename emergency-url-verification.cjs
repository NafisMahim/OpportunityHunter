// Emergency URL verification and cleanup for recently added opportunities
const { neon } = require('@neondatabase/serverless');
const https = require('https');
const http = require('http');

async function verifyURL(url) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        const options = {
            method: 'HEAD',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };
        
        const req = protocol.request(url, options, (res) => {
            resolve({
                status: res.statusCode,
                valid: res.statusCode >= 200 && res.statusCode < 400
            });
        });
        
        req.on('error', () => resolve({ status: 0, valid: false }));
        req.on('timeout', () => {
            req.destroy();
            resolve({ status: 0, valid: false });
        });
        
        req.setTimeout(10000);
        req.end();
    });
}

async function emergencyURLVerification() {
    console.log('=== EMERGENCY URL VERIFICATION ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Get recently added opportunities (last 300 IDs)
    const recentOpps = await sql`
        SELECT id, title, organization, url 
        FROM opportunities 
        WHERE id > 3700 
        ORDER BY id DESC
    `;
    
    console.log(`Found ${recentOpps.length} recent opportunities to verify...`);
    
    const brokenURLs = [];
    const validURLs = [];
    
    for (const opp of recentOpps) {
        console.log(`Checking: ${opp.title} - ${opp.url}`);
        
        const result = await verifyURL(opp.url);
        
        if (!result.valid) {
            brokenURLs.push({
                id: opp.id,
                title: opp.title,
                organization: opp.organization,
                url: opp.url,
                status: result.status
            });
            console.log(`❌ BROKEN: ${opp.title} (Status: ${result.status})`);
        } else {
            validURLs.push(opp);
            console.log(`✅ VALID: ${opp.title}`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n=== VERIFICATION RESULTS ===');
    console.log(`✅ Valid URLs: ${validURLs.length}`);
    console.log(`❌ Broken URLs: ${brokenURLs.length}`);
    
    if (brokenURLs.length > 0) {
        console.log('\n=== BROKEN URLs TO DELETE ===');
        for (const broken of brokenURLs) {
            console.log(`${broken.id}: ${broken.title} - ${broken.organization}`);
            console.log(`   URL: ${broken.url}`);
            console.log(`   Status: ${broken.status}`);
            
            // Delete broken opportunities
            await sql`DELETE FROM opportunities WHERE id = ${broken.id}`;
            console.log(`   DELETED ❌`);
        }
    }
    
    // Final count
    const finalCount = await sql`SELECT COUNT(*) as count FROM opportunities`;
    console.log(`\n📊 Final opportunity count: ${finalCount[0].count}`);
    console.log(`🗑️ Deleted ${brokenURLs.length} broken opportunities`);
    console.log('✅ Database cleaned of invalid URLs');
}

emergencyURLVerification().catch(console.error);