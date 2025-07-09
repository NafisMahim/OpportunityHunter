// Final manual fix for all identified broken URLs
async function finalManualFix() {
    console.log('=== FINAL MANUAL FIX FOR ALL BROKEN URLs ===');
    
    // All broken URLs we've identified and their fixes
    const urgentFixes = [
        {
            search: 'americorps.gov/serve/americorps-vista',
            replace: 'https://www.americorps.gov/serve/americorps-vista',
            reason: 'AmeriCorps VISTA 403 error fix'
        },
        {
            search: 'nationalhonorsociety.org/students/scholarships',
            replace: 'https://www.nhs.us/students/scholarships/',
            reason: 'National Honor Society 404 error fix (user screenshot)'
        },
        {
            search: 'nationalhonorsociety.org',
            replace: 'https://www.nhs.us/',
            reason: 'National Honor Society main site fix'
        },
        {
            search: 'restaurant.org/nraef/scholarships',
            replace: 'https://www.chooserestaurants.org/Scholarships',
            reason: 'Restaurant Association scholarship fix'
        },
        {
            search: 'nraef.org/scholarships',
            replace: 'https://www.chooserestaurants.org/Scholarships',
            reason: 'NRAEF scholarship fix'
        },
        {
            search: 'careers.microsoft.com/students/us/en/ur-scholarships',
            replace: 'https://careers.microsoft.com/us/en/students',
            reason: 'Microsoft careers page fix'
        },
        {
            search: 'adobe.com/careers/university/digital-academy',
            replace: 'https://www.adobe.com/careers/university.html',
            reason: 'Adobe careers page fix'
        },
        {
            search: 'coca-colascholarsfoundation.org/apply',
            replace: 'https://www.coca-colascholarsfoundation.org/scholarships/',
            reason: 'Coca-Cola scholarship fix'
        },
        {
            search: 'arteducators.org/learn-tools/awards-grants',
            replace: 'https://www.arteducators.org/community/awards-grants',
            reason: 'Art Educators Association fix'
        },
        {
            search: 'elks.org/scholars/scholarships',
            replace: 'https://www.elks.org/scholars/',
            reason: 'Elks Foundation scholarship fix'
        },
        {
            search: 'elks.org/scholars/mvs.cfm',
            replace: 'https://www.elks.org/scholars/',
            reason: 'Elks MVS scholarship fix'
        },
        {
            search: 'carsonscholars.org/scholarships',
            replace: 'https://carsonscholars.org/scholarship-program/',
            reason: 'Carson Scholars fix'
        },
        {
            search: 'scholars.horatioalger.org/apply',
            replace: 'https://scholars.horatioalger.org/',
            reason: 'Horatio Alger scholarship fix'
        },
        {
            search: 'cee.org/programs/research-science-institute',
            replace: 'https://www.cee.org/research-science-institute',
            reason: 'Research Science Institute fix'
        },
        {
            search: 'asme.org/students/competitions',
            replace: 'https://www.asme.org/students-and-faculty/students/competitions',
            reason: 'ASME competitions fix'
        },
        {
            search: 'aiche.org/community/students/awards-scholarships-competitions',
            replace: 'https://www.aiche.org/students/awards-scholarships-competitions',
            reason: 'AIChE awards fix'
        },
        {
            search: 'ieee.org/membership/students/competitions/index.html',
            replace: 'https://www.ieee.org/membership/students/competitions.html',
            reason: 'IEEE competitions fix'
        },
        {
            search: 'txstate.edu/mathworks/camps/ssm.html',
            replace: 'https://www.txstate.edu/academics/mathematics-statistics.html',
            reason: 'Texas State math program fix'
        },
        {
            search: 'rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship',
            replace: 'https://www.rhodestrust.com/the-scholarship/',
            reason: 'Rhodes Scholarship fix'
        },
        {
            search: 'simonsfoundation.org/grant/math-x-investigator-awards',
            replace: 'https://www.simonsfoundation.org/funding-opportunities/',
            reason: 'Simons Foundation fix'
        },
        {
            search: 'davidsongifted.org/fellow-program',
            replace: 'https://www.davidsongifted.org/support-scholars/fellowship-program/',
            reason: 'Davidson Fellows fix'
        },
        {
            search: 'davidsongifted.org/fellowship-program',
            replace: 'https://www.davidsongifted.org/support-scholars/fellowship-program/',
            reason: 'Davidson Fellowship fix'
        },
        {
            search: 'mitadmissions.org/apply/firstyear/mites',
            replace: 'https://oeop.mit.edu/programs/mites',
            reason: 'MIT MITES program fix'
        },
        {
            search: 'tellurideassociation.org/programs/high-school-students/tasp',
            replace: 'https://www.tellurideassociation.org/programs/high-school-students/summer-seminar/',
            reason: 'Telluride TASP fix'
        }
    ];
    
    let totalFixed = 0;
    
    // Process each fix one by one
    for (const fix of urgentFixes) {
        console.log(`\nProcessing: ${fix.reason}`);
        console.log(`Looking for URLs containing: ${fix.search}`);
        
        try {
            // Get all opportunities
            const response = await fetch('http://localhost:5000/api/opportunities');
            const opportunities = await response.json();
            
            // Find matching opportunities
            const matchingOpps = opportunities.filter(opp => 
                opp.url && opp.url.includes(fix.search)
            );
            
            console.log(`Found ${matchingOpps.length} opportunities to fix`);
            
            for (const opp of matchingOpps) {
                console.log(`Fixing: ${opp.title.substring(0, 40)}...`);
                console.log(`  OLD: ${opp.url}`);
                console.log(`  NEW: ${fix.replace}`);
                
                const updateResponse = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: fix.replace
                    })
                });
                
                if (updateResponse.ok) {
                    console.log(`  ✅ FIXED`);
                    totalFixed++;
                } else {
                    console.log(`  ❌ FAILED (${updateResponse.status})`);
                }
                
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        } catch (error) {
            console.log(`❌ Error processing ${fix.search}: ${error.message}`);
        }
        
        // Delay between different fix patterns
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n=== HTTP TO HTTPS UPGRADE ===');
    
    // Fix HTTP to HTTPS
    try {
        const response = await fetch('http://localhost:5000/api/opportunities');
        const opportunities = await response.json();
        
        const httpOpps = opportunities.filter(opp => 
            opp.url && opp.url.startsWith('http://')
        );
        
        console.log(`Found ${httpOpps.length} HTTP URLs to upgrade to HTTPS`);
        
        for (const opp of httpOpps) {
            const newUrl = opp.url.replace('http://', 'https://');
            
            console.log(`Upgrading: ${opp.title.substring(0, 40)}...`);
            console.log(`  OLD: ${opp.url}`);
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
                console.log(`  ✅ UPGRADED`);
                totalFixed++;
            } else {
                console.log(`  ❌ FAILED (${updateResponse.status})`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    } catch (error) {
        console.log(`❌ Error upgrading HTTP URLs: ${error.message}`);
    }
    
    console.log('\n=== FINAL MANUAL FIX COMPLETE ===');
    console.log(`✅ Total URLs fixed: ${totalFixed}`);
    
    // Save fix report
    const fs = require('fs');
    const report = {
        timestamp: new Date().toISOString(),
        totalFixed,
        fixesApplied: urgentFixes.map(f => f.reason)
    };
    
    fs.writeFileSync(`final-fix-report-${Date.now()}.json`, JSON.stringify(report, null, 2));
    console.log('📄 Fix report saved');
    
    return totalFixed;
}

finalManualFix().catch(console.error);