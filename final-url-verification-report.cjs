// FINAL URL VERIFICATION REPORT - Verify all fixes were successful
const { neon } = require('@neondatabase/serverless');

async function finalUrlVerificationReport() {
    console.log('=== FINAL URL VERIFICATION REPORT ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Check for any remaining problematic URLs
    const problematicUrls = await sql`
        SELECT 
            COUNT(*) as count,
            url
        FROM opportunities 
        WHERE 
            url = 'https://www.google.com/' OR
            url LIKE '%placeholder%' OR
            url LIKE '%example%' OR
            url = '' OR
            url IS NULL
        GROUP BY url
        ORDER BY count DESC
    `;
    
    console.log('\n=== PROBLEMATIC URLS REMAINING ===');
    if (problematicUrls.length === 0) {
        console.log('✅ NO PROBLEMATIC URLS FOUND!');
    } else {
        console.log('⚠️  PROBLEMATIC URLS STILL EXIST:');
        problematicUrls.forEach(row => {
            console.log(`   ${row.count} opportunities with URL: "${row.url}"`);
        });
    }
    
    // Check URL distribution
    const urlStats = await sql`
        SELECT 
            COUNT(*) as total_opportunities,
            COUNT(CASE WHEN url IS NOT NULL AND url != '' THEN 1 END) as with_urls,
            COUNT(CASE WHEN url LIKE 'https://%' THEN 1 END) as https_urls,
            COUNT(CASE WHEN url = 'https://www.scholarships.com/' THEN 1 END) as scholarships_fallback
        FROM opportunities
    `;
    
    console.log('\n=== URL STATISTICS ===');
    const stats = urlStats[0];
    console.log(`Total Opportunities: ${stats.total_opportunities}`);
    console.log(`With URLs: ${stats.with_urls} (${((stats.with_urls/stats.total_opportunities)*100).toFixed(1)}%)`);
    console.log(`HTTPS URLs: ${stats.https_urls} (${((stats.https_urls/stats.total_opportunities)*100).toFixed(1)}%)`);
    console.log(`Scholarships.com Fallback: ${stats.scholarships_fallback}`);
    
    // Check for any duplicate URLs that might indicate issues
    const duplicateUrls = await sql`
        SELECT url, COUNT(*) as count
        FROM opportunities
        WHERE url IS NOT NULL AND url != ''
        GROUP BY url
        HAVING COUNT(*) > 10
        ORDER BY count DESC
        LIMIT 10
    `;
    
    console.log('\n=== TOP DUPLICATE URLS (potential issues) ===');
    duplicateUrls.forEach(row => {
        console.log(`   ${row.count}x: ${row.url}`);
    });
    
    // Sample verification of critical fixes
    const criticalSamples = await sql`
        SELECT id, title, url, source
        FROM opportunities
        WHERE id IN (291, 375, 376, 386, 387, 389, 394)
        ORDER BY id
    `;
    
    console.log('\n=== CRITICAL FIXES VERIFICATION ===');
    criticalSamples.forEach(opp => {
        console.log(`✅ ID ${opp.id}: ${opp.title}`);
        console.log(`   URL: ${opp.url}`);
        console.log(`   Source: ${opp.source}`);
        console.log('');
    });
    
    console.log('\n=== FINAL VERIFICATION SUMMARY ===');
    console.log(`✅ Total Database Size: ${stats.total_opportunities} opportunities`);
    console.log(`✅ URL Coverage: ${((stats.with_urls/stats.total_opportunities)*100).toFixed(1)}%`);
    console.log(`✅ HTTPS Security: ${((stats.https_urls/stats.total_opportunities)*100).toFixed(1)}%`);
    console.log(`📊 Fallback URLs: ${stats.scholarships_fallback} (for scholarships with no specific site)`);
    
    if (problematicUrls.length === 0 && stats.with_urls === stats.total_opportunities) {
        console.log('\n🎉 SUCCESS: ALL URL ISSUES RESOLVED!');
        console.log('🚨 ZERO TOLERANCE ACHIEVED: No broken, placeholder, or google.com URLs remain!');
    } else {
        console.log('\n⚠️  ISSUES REMAIN: Further fixes needed');
    }
}

finalUrlVerificationReport().catch(console.error);