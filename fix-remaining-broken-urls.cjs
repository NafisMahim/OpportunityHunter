// Fix remaining broken URLs found through manual testing
async function fixRemainingBrokenURLs() {
    console.log('=== FIXING REMAINING BROKEN URLs ===');
    
    const brokenURLs = [
        {
            broken: 'https://portfolioday.net/',
            fixed: 'https://www.portfolioday.net/',
            reason: 'portfolioday.net not responding, trying www version'
        }
    ];
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    let fixedCount = 0;
    
    for (const urlFix of brokenURLs) {
        const matchingOpps = opportunities.filter(opp => opp.url === urlFix.broken);
        
        if (matchingOpps.length > 0) {
            console.log(`\nFound ${matchingOpps.length} opportunities with broken URL: ${urlFix.broken}`);
            
            for (const opp of matchingOpps) {
                console.log(`Fixing: ${opp.title}`);
                console.log(`  OLD: ${urlFix.broken}`);
                console.log(`  NEW: ${urlFix.fixed}`);
                
                try {
                    const updateResponse = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            url: urlFix.fixed
                        })
                    });
                    
                    if (updateResponse.ok) {
                        console.log(`  ✅ FIXED`);
                        fixedCount++;
                    } else {
                        console.log(`  ❌ FAILED (${updateResponse.status})`);
                    }
                } catch (error) {
                    console.log(`  ❌ ERROR: ${error.message}`);
                }
            }
        } else {
            console.log(`No opportunities found with URL: ${urlFix.broken}`);
        }
    }
    
    console.log(`\n=== FIXED ${fixedCount} ADDITIONAL BROKEN URLs ===`);
    return fixedCount;
}

fixRemainingBrokenURLs().catch(console.error);