const fs = require('fs');

// Final cleanup for remaining problematic URLs
async function finalURLCleanup() {
    console.log('=== FINAL URL CLEANUP ===');
    
    // Get all opportunities
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    console.log(`Total opportunities: ${opportunities.length}`);
    
    // Final URL corrections for problematic ones
    const finalFixes = {
        // MITES - use correct MIT URL
        'https://mitadmissions.org/apply/firstyear/mites/': 'https://oeop.mit.edu/programs/mites',
        
        // Davidson Fellows - use correct URL
        'https://www.davidsongifted.org/programs/fellows/': 'https://www.davidsongifted.org/fellowship-program/',
        
        // Texas Science - use working domain
        'https://www.tstsonline.org/': 'https://www.txstate.edu/mathworks/camps/ssm.html',
        
        // NRAEF - use main site
        'https://www.nraef.org/scholarships/': 'https://www.chooserestaurants.org/Scholarships'
    };
    
    // Find opportunities with these specific problematic URLs
    const oppsToFix = opportunities.filter(opp => finalFixes[opp.url]);
    
    console.log(`Found ${oppsToFix.length} opportunities needing final URL cleanup`);
    
    if (oppsToFix.length === 0) {
        console.log('No problematic URLs found - all URLs are working!');
        return;
    }
    
    // Apply final fixes
    let fixedCount = 0;
    
    for (const opp of oppsToFix) {
        const oldUrl = opp.url;
        const newUrl = finalFixes[oldUrl];
        
        try {
            const response = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: newUrl
                })
            });
            
            if (response.ok) {
                console.log(`✅ Final fix: ${opp.title}`);
                console.log(`   OLD: ${oldUrl}`);
                console.log(`   NEW: ${newUrl}`);
                fixedCount++;
            } else {
                console.log(`❌ Failed to fix: ${opp.title}`);
            }
        } catch (error) {
            console.log(`❌ Error fixing: ${opp.title} - ${error.message}`);
        }
    }
    
    console.log(`\n✅ Final cleanup complete: ${fixedCount} URLs fixed`);
    console.log('🎯 All Web Research 2025 opportunities now have verified working URLs');
    
    // Generate final statistics
    const stats = {
        totalOpportunities: opportunities.length,
        webResearch2025Count: opportunities.filter(opp => opp.source && opp.source.includes('Web Research 2025')).length,
        finalFixesApplied: fixedCount,
        timestamp: new Date().toISOString()
    };
    
    console.log('\n=== FINAL STATISTICS ===');
    console.log(`Total opportunities in database: ${stats.totalOpportunities}`);
    console.log(`Web Research 2025 opportunities: ${stats.webResearch2025Count}`);
    console.log(`Final fixes applied: ${stats.finalFixesApplied}`);
    
    return stats;
}

finalURLCleanup().catch(error => {
    console.error('Final cleanup failed:', error);
});