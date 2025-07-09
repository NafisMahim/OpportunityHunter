// Systematic cleanup for all FLAGGED and MISSING opportunities from CSV
async function systematicURLCleanup() {
    console.log('=== SYSTEMATIC URL CLEANUP STARTING ===');
    
    // First, let's get all opportunities with FLAGGED and MISSING status
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    let deleteCount = 0;
    let fixCount = 0;
    let skipCount = 0;
    
    // Define opportunities that should be DELETED (corrupted data)
    const deletePatterns = [
        'IFQ',
        '<</CreationDate',
        '<</Subtype/Link',
        '"""New:"""',
        '"""New: Girls in Science',
        '"""New: Stevens Institute',
        '"""New: St. John\'s College',
        '"""New: New Settlement',
        '"""New: Information Session',
        '<rdf:li xml:lang',
        'BHHS Summer Programs</rdf:li>',
        'document viewer and editor'
    ];
    
    // First pass: Delete corrupted entries
    for (const opp of opportunities) {
        const shouldDelete = deletePatterns.some(pattern => 
            opp.title.includes(pattern) || 
            (opp.url && opp.url.includes(pattern))
        );
        
        if (shouldDelete) {
            console.log(`🗑️ DELETING CORRUPTED: ${opp.title}`);
            try {
                const deleteResponse = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
                    method: 'DELETE'
                });
                if (deleteResponse.ok) {
                    deleteCount++;
                    console.log(`   ✅ Deleted`);
                } else {
                    console.log(`   ❌ Delete failed (${deleteResponse.status})`);
                }
            } catch (error) {
                console.log(`   ❌ Delete error: ${error.message}`);
            }
        }
    }
    
    console.log(`\n=== Phase 1 Complete: ${deleteCount} corrupted entries deleted ===`);
    
    // Refresh data after deletions
    const response2 = await fetch('http://localhost:5000/api/opportunities');
    const updatedOpportunities = await response2.json();
    
    // Define placeholder URL patterns that need fixing
    const placeholderFixes = [
        { pattern: 'Academic Prep', replacement: 'https://www.beginningwithchildren.org/', title: 'Beginning with Children Legacy Network' },
        { pattern: 'After School/Summer', replacement: 'https://www.nyc.gov/site/dycd/services/after-school/discover-dycd.page', title: 'Free After-School & Summer Programs' },
        { pattern: 'https://Summer', replacement: 'https://www.freshair.org/our-programs/summer-camps/', title: 'Fresh Air Fund Summer Camps' },
        { pattern: 'Humanities/Science', replacement: 'https://www.nycgovparks.org/programs/rangers/garden-kitchen-labs', title: 'Garden Kitchen Labs' },
        { pattern: 'https://Weekends', replacement: 'https://www.harlemgrown.org/', title: 'Harlem Grown' },
        { pattern: 'Sports/Science', replacement: 'https://www.rockingtheboat.org/', title: 'Rocking the Boat' },
        { pattern: 'Math, Science, Humanities', replacement: 'https://www.teachoo.com/', title: 'Teachoo' },
        { pattern: 'Year-long (starts January)', replacement: 'https://math.mit.edu/research/highschool/primes/', title: 'MIT PRIMES' },
        { pattern: 'Engineering/Science', replacement: 'https://oeop.mit.edu/programs/mites', title: 'MITES' },
        { pattern: 'Earth/Space Sciences', replacement: 'https://www.nasa.gov/stem/highschoolvirtualinternship/', title: 'NASA SEES' },
        { pattern: 'Free + $3', replacement: 'https://fish.uw.edu/students/junior-fisheries-biology-program/', title: 'Hutton Junior Fisheries' },
        { pattern: 'Engineering/IT/Physics', replacement: 'https://www.nist.gov/careers/student-opportunities/summer-high-school-intern-program-ship', title: 'NIST SHIP' },
        { pattern: '5 weeks (late June-July)', replacement: 'https://www.training.nih.gov/programs/histep', title: 'NIH HiSTEP' },
        { pattern: '8 weeks (June-August)', replacement: 'https://www.navsea.navy.mil/Our-Team/STEM-Education/SEAP/', title: 'Navy SEAP' },
        { pattern: '4 weeks (July)', replacement: 'https://beaverworks.ll.mit.edu/CMS/bw/bwsi', title: 'MIT Beaver Works' },
        { pattern: 'https://Free', replacement: 'https://girlswhocode.com/programs/summer-immersion-program', title: 'Girls Who Code' },
        { pattern: 'https://Entrepreneurship', replacement: 'https://launchx.org/', title: 'LaunchX' },
        { pattern: 'Finals July', replacement: 'https://www.googlesciencefair.com/', title: 'Google Science Fair' }
    ];
    
    // Second pass: Fix placeholder URLs
    for (const opp of updatedOpportunities) {
        if (!opp.url || opp.url.length < 10) {
            console.log(`⚠️ SKIPPING (no URL): ${opp.title}`);
            skipCount++;
            continue;
        }
        
        let fixed = false;
        for (const fix of placeholderFixes) {
            if (opp.url.includes(fix.pattern) || (fix.title && opp.title.includes(fix.title))) {
                console.log(`🔧 FIXING: ${opp.title}`);
                console.log(`   OLD: ${opp.url}`);
                console.log(`   NEW: ${fix.replacement}`);
                
                try {
                    const updateResponse = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            url: fix.replacement
                        })
                    });
                    
                    if (updateResponse.ok) {
                        fixCount++;
                        console.log(`   ✅ Fixed`);
                        fixed = true;
                        break;
                    } else {
                        console.log(`   ❌ Fix failed (${updateResponse.status})`);
                    }
                } catch (error) {
                    console.log(`   ❌ Fix error: ${error.message}`);
                }
            }
        }
        
        if (!fixed && (opp.url.includes('http://') || opp.url.length < 15 || !opp.url.includes('.'))) {
            console.log(`⚠️ NEEDS ATTENTION: ${opp.title} - ${opp.url}`);
        }
    }
    
    console.log(`\n=== CLEANUP SUMMARY ===`);
    console.log(`🗑️ Deleted corrupted entries: ${deleteCount}`);
    console.log(`🔧 Fixed placeholder URLs: ${fixCount}`);
    console.log(`⚠️ Skipped (no URL): ${skipCount}`);
    console.log(`📊 Total processed opportunities: ${opportunities.length}`);
    
    return { deleteCount, fixCount, skipCount, totalProcessed: opportunities.length };
}

systematicURLCleanup().catch(console.error);