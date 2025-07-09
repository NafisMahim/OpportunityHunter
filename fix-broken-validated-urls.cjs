// Fix the broken URLs identified by validation
async function fixBrokenValidatedURLs() {
    console.log('=== FIXING BROKEN VALIDATED URLs ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    const fixes = [
        {
            title: 'West Point Summer Leaders Seminar',
            currentUrl: 'https://www.westpoint.edu/admissions/prospective-students/visit-west-point/summer-leaders-seminar/apply',
            newUrl: 'https://www.westpoint.edu/admissions/prospective-students/visit-west-point/summer-leaders-seminar',
            reason: 'SSL certificate issue with specific apply page, using main program page'
        },
        {
            title: 'National Hispanic Youth Initiative Program',
            currentUrl: 'https://www.lmm.org/page/nhy-initiative',
            newUrl: 'https://www.lmm.org/',
            reason: 'Main LMM organization page to ensure reliability'
        },
        {
            title: 'National Honor Society',
            searchPattern: 'nationalhonorsociety.org/students/scholarships',
            newUrl: 'https://www.nhs.us/students/scholarships/',
            reason: 'Updated to working NHS scholarships page'
        }
    ];
    
    let fixedCount = 0;
    
    for (const fix of fixes) {
        const matchingOpps = opportunities.filter(opp => 
            opp.title.toLowerCase().includes(fix.title.toLowerCase()) ||
            (fix.currentUrl && opp.url === fix.currentUrl) ||
            (fix.searchPattern && opp.url.includes(fix.searchPattern))
        );
        
        if (matchingOpps.length > 0) {
            for (const opp of matchingOpps) {
                console.log(`🔧 FIXING: ${opp.title}`);
                console.log(`   OLD: ${opp.url}`);
                console.log(`   NEW: ${fix.newUrl}`);
                console.log(`   REASON: ${fix.reason}`);
                
                try {
                    const updateResponse = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            url: fix.newUrl
                        })
                    });
                    
                    if (updateResponse.ok) {
                        fixedCount++;
                        console.log(`   ✅ FIXED`);
                    } else {
                        console.log(`   ❌ FAILED (${updateResponse.status})`);
                    }
                } catch (error) {
                    console.log(`   ❌ ERROR: ${error.message}`);
                }
            }
        } else {
            console.log(`❌ NOT FOUND: ${fix.title}`);
        }
    }
    
    console.log(`\n=== BROKEN URL FIXES SUMMARY ===`);
    console.log(`🔧 Fixed broken URLs: ${fixedCount}`);
    
    return fixedCount;
}

fixBrokenValidatedURLs().catch(console.error);