// Fix remaining flagged URLs from the CSV
async function fixRemainingFlaggedURLs() {
    console.log('=== FIXING REMAINING FLAGGED URLs ===');
    
    // URLs that still need fixing (continuing from where the previous script left off)
    const urlFixes = [
        {
            title: 'Princeton SJP',
            broken: 'https://10 days summer + year-round',
            fixed: 'https://psjp.princeton.edu/',
            reason: 'Fixed placeholder with Princeton Summer Journalism Program'
        },
        {
            title: 'YoungArts Awards',
            broken: 'https://Jan finals',
            fixed: 'https://www.youngarts.org/',
            reason: 'Fixed placeholder with YoungArts main website'
        },
        {
            title: 'Scholastic Awards',
            broken: 'https://Carnegie Hall June',
            fixed: 'https://www.artandwriting.org/',
            reason: 'Fixed placeholder with Scholastic Art & Writing Awards'
        },
        {
            title: 'Notre Dame Leadership',
            broken: 'https://10 days July',
            fixed: 'https://nd.edu/admissions/visit/summer-programs/',
            reason: 'Fixed placeholder with Notre Dame summer programs'
        },
        {
            title: 'YYGS',
            broken: 'https://2-week summer sessions',
            fixed: 'https://globalscholars.yale.edu/',
            reason: 'Fixed placeholder with Yale Young Global Scholars'
        },
        {
            title: 'ISSYP',
            broken: 'https://July (2 weeks)',
            fixed: 'https://www.perimeterinstitute.ca/outreach/students/international-summer-school-young-physicists',
            reason: 'Fixed placeholder with ISSYP Perimeter Institute page'
        },
        {
            title: 'Shad Canada',
            broken: 'https://$6',
            fixed: 'https://www.shad.ca/',
            reason: 'Fixed broken URL with Shad Canada main website'
        },
        {
            title: 'Technion SciTech',
            broken: 'https://July',
            fixed: 'https://www.technion.ac.il/en/academics/international-school/',
            reason: 'Fixed placeholder with Technion International School'
        },
        {
            title: 'PROMYS',
            broken: 'https://6 weeks summer',
            fixed: 'https://promys.org/',
            reason: 'Fixed placeholder with PROMYS main website'
        },
        {
            title: 'Regeneron STS',
            broken: 'https://Nov deadline',
            fixed: 'https://www.societyforscience.org/regeneron-sts/',
            reason: 'Fixed placeholder with Regeneron Science Talent Search'
        },
        {
            title: 'Regeneron ISEF',
            broken: 'https://May',
            fixed: 'https://www.societyforscience.org/isef/',
            reason: 'Fixed placeholder with Regeneron ISEF main page'
        },
        {
            title: 'Academic Decathlon',
            broken: 'https://Varies by region',
            fixed: 'https://www.usad.org/',
            reason: 'Fixed placeholder with USAD main website'
        },
        {
            title: 'Odyssey of the Mind',
            broken: 'https://~$135/school',
            fixed: 'https://www.odysseyofthemind.com/',
            reason: 'Fixed broken URL with Odyssey of the Mind main website'
        },
        {
            title: 'Summer Health Professions Education Program (SHPEP) - Columbia University',
            broken: 'https://example.com/contact-for-details',
            fixed: 'https://www.shpep.org/',
            reason: 'Fixed example URL with SHPEP main website'
        }
    ];
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    let fixedCount = 0;
    let notFoundCount = 0;
    
    for (const urlFix of urlFixes) {
        const matchingOpps = opportunities.filter(opp => 
            opp.title === urlFix.title
        );
        
        if (matchingOpps.length > 0) {
            console.log(`\nFound ${matchingOpps.length} opportunities for: ${urlFix.title}`);
            
            for (const opp of matchingOpps) {
                console.log(`Fixing: ${opp.title}`);
                console.log(`  OLD: ${opp.url}`);
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
            console.log(`❌ NOT FOUND: ${urlFix.title}`);
            notFoundCount++;
        }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`✅ FIXED: ${fixedCount} additional URLs`);
    console.log(`❌ NOT FOUND: ${notFoundCount} URLs`);
    
    return { fixedCount, notFoundCount };
}

fixRemainingFlaggedURLs().catch(console.error);