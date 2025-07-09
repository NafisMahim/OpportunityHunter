// Final validation check for remaining broken URLs
async function finalValidationCheck() {
    console.log('=== FINAL VALIDATION CHECK ===');
    
    // Check for remaining broken URL patterns
    const brokenPatterns = [
        'nationalhonorsociety.org',
        'restaurant.org/nraef',
        'nraef.org/scholarships',
        'careers.microsoft.com/students/us/en/ur-scholarships',
        'adobe.com/careers/university/digital-academy',
        'coca-colascholarsfoundation.org/apply',
        'arteducators.org/learn-tools/awards-grants',
        'elks.org/scholars/scholarships',
        'elks.org/scholars/mvs.cfm',
        'carsonscholars.org/scholarships',
        'scholars.horatioalger.org/apply',
        'cee.org/programs/research-science-institute',
        'asme.org/students/competitions',
        'aiche.org/community/students/awards-scholarships-competitions',
        'ieee.org/membership/students/competitions/index.html',
        'txstate.edu/mathworks/camps/ssm.html',
        'rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship',
        'simonsfoundation.org/grant/math-x-investigator-awards',
        'davidsongifted.org/fellow-program',
        'davidsongifted.org/fellowship-program',
        'mitadmissions.org/apply/firstyear/mites',
        'tellurideassociation.org/programs/high-school-students/tasp'
    ];
    
    try {
        const response = await fetch('http://localhost:5000/api/opportunities');
        const opportunities = await response.json();
        
        console.log(`Checking ${opportunities.length} opportunities for broken URL patterns...`);
        
        let foundBroken = 0;
        let httpCount = 0;
        
        for (const pattern of brokenPatterns) {
            const matching = opportunities.filter(opp => opp.url && opp.url.includes(pattern));
            if (matching.length > 0) {
                console.log(`❌ Found ${matching.length} opportunities with broken pattern: ${pattern}`);
                foundBroken += matching.length;
                matching.forEach(opp => {
                    console.log(`  - ${opp.title.substring(0, 50)}... (${opp.url})`);
                });
            }
        }
        
        // Check HTTP URLs
        const httpOpps = opportunities.filter(opp => opp.url && opp.url.startsWith('http://'));
        httpCount = httpOpps.length;
        
        if (httpCount > 0) {
            console.log(`⚠️  Found ${httpCount} HTTP URLs that should be upgraded to HTTPS`);
            httpOpps.slice(0, 5).forEach(opp => {
                console.log(`  - ${opp.title.substring(0, 50)}... (${opp.url})`);
            });
            if (httpCount > 5) {
                console.log(`  ... and ${httpCount - 5} more`);
            }
        }
        
        console.log('\n=== VALIDATION SUMMARY ===');
        console.log(`Total opportunities: ${opportunities.length}`);
        console.log(`Broken URL patterns found: ${foundBroken}`);
        console.log(`HTTP URLs needing upgrade: ${httpCount}`);
        console.log(`Total issues remaining: ${foundBroken + httpCount}`);
        
        if (foundBroken === 0 && httpCount === 0) {
            console.log('🎉 ALL URLs APPEAR TO BE FIXED!');
        } else {
            console.log(`⚠️  ${foundBroken + httpCount} URLs still need fixing`);
        }
        
        return { foundBroken, httpCount, total: opportunities.length };
        
    } catch (error) {
        console.log(`❌ Error during validation: ${error.message}`);
        return { error: error.message };
    }
}

finalValidationCheck().catch(console.error);