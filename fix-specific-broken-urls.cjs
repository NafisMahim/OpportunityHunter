// Fix specific broken URLs found through manual testing
async function fixSpecificBrokenURLs() {
    console.log('=== FIXING SPECIFIC BROKEN URLs ===');
    
    const brokenURLs = [
        {
            broken: 'https://www.anl.gov/',
            fixed: 'https://www.anl.gov/education/students-and-postdocs',
            reason: 'ANL main page returns 403, redirecting to student programs'
        },
        {
            broken: 'https://www.txsts.org/',
            fixed: 'https://www.txstate.edu/',
            reason: 'TXSTS appears to be broken, redirecting to Texas State University'
        }
    ];
    
    console.log('Getting all opportunities...');
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    console.log(`Checking ${opportunities.length} opportunities for specific broken URLs...`);
    
    let fixedCount = 0;
    
    for (const urlFix of brokenURLs) {
        const matchingOpps = opportunities.filter(opp => opp.url === urlFix.broken);
        
        if (matchingOpps.length > 0) {
            console.log(`\nFound ${matchingOpps.length} opportunities with broken URL: ${urlFix.broken}`);
            
            for (const opp of matchingOpps) {
                console.log(`Fixing: ${opp.title}`);
                console.log(`  Reason: ${urlFix.reason}`);
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
                
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } else {
            console.log(`No opportunities found with URL: ${urlFix.broken}`);
        }
    }
    
    console.log(`\n=== FIXED ${fixedCount} SPECIFIC BROKEN URLs ===`);
    
    return fixedCount;
}

fixSpecificBrokenURLs().catch(console.error);