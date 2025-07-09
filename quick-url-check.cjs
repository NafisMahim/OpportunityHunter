// Quick check and fix for specific known broken URLs
async function quickURLCheck() {
    console.log('=== QUICK URL CHECK AND FIX ===');
    
    // Specific broken URLs identified from verification and user screenshot
    const knownBrokenURLs = [
        'https://www.nar.realtor/education-and-events',
        'https://americorps.gov/serve/americorps-vista',
        'https://www.nationalhonorsociety.org/students/scholarships/',
        'https://www.nationalhonorsociety.org/'
    ];
    
    const fixes = {
        'https://www.nar.realtor/education-and-events': 'https://www.nar.realtor/education',
        'https://americorps.gov/serve/americorps-vista': 'https://www.americorps.gov/serve/americorps-vista',
        'https://www.nationalhonorsociety.org/students/scholarships/': 'https://www.nhs.us/students/scholarships/',
        'https://www.nationalhonorsociety.org/': 'https://www.nhs.us/'
    };
    
    console.log('Checking specific broken URLs...');
    
    for (const url of knownBrokenURLs) {
        console.log(`\nLooking for opportunities with URL: ${url}`);
        
        try {
            // Get all opportunities and find ones with this URL
            const response = await fetch('http://localhost:5000/api/opportunities');
            const opportunities = await response.json();
            
            const matchingOpps = opportunities.filter(opp => opp.url === url);
            
            console.log(`Found ${matchingOpps.length} opportunities with this URL`);
            
            for (const opp of matchingOpps) {
                const newUrl = fixes[url];
                
                console.log(`Fixing: ${opp.title.substring(0, 50)}...`);
                console.log(`  OLD: ${url}`);
                console.log(`  NEW: ${newUrl}`);
                
                const updateResponse = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: newUrl
                    })
                });
                
                if (updateResponse.ok) {
                    console.log(`  ✅ FIXED`);
                } else {
                    console.log(`  ❌ FAILED`);
                }
                
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            console.log(`❌ Error processing ${url}: ${error.message}`);
        }
    }
    
    console.log('\n=== QUICK CHECK COMPLETE ===');
}

quickURLCheck().catch(console.error);