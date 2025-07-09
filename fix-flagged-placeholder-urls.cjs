// Fix FLAGGED opportunities with placeholder URLs
async function fixFlaggedPlaceholderURLs() {
    console.log('=== FIXING FLAGGED PLACEHOLDER URLs ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    // Specific fixes for placeholder URLs found in FLAGGED entries
    const placeholderFixes = [
        { old: 'https://Academic Prep', new: 'https://www.beginningwithchildren.org/', title: 'Beginning with Children Legacy Network' },
        { old: 'https://After School/Summer', new: 'https://www.nyc.gov/site/dycd/services/after-school/discover-dycd.page', title: 'Free After-School & Summer Programs' },
        { old: 'https://Summer', new: 'https://www.freshair.org/our-programs/summer-camps/', title: 'Fresh Air Fund Summer Camps' },
        { old: 'https://Humanities/Science', new: 'https://www.nycgovparks.org/programs/rangers/garden-kitchen-labs', title: 'Garden Kitchen Labs' },
        { old: 'https://Weekends', new: 'https://www.harlemgrown.org/', title: 'Harlem Grown' },
        { old: 'https://Sports/Science', new: 'https://www.rockingtheboat.org/', title: 'Rocking the Boat' },
        { old: 'https://Math, Science, Humanities, Academic Prep', new: 'https://www.teachoo.com/', title: 'Teachoo: Learn Math' },
        { old: 'https://Year-long (starts January)', new: 'https://math.mit.edu/research/highschool/primes/', title: 'MIT PRIMES' },
        { old: 'https://Engineering/Science', new: 'https://oeop.mit.edu/programs/mites', title: 'MITES & MOSTEC' },
        { old: 'https://Earth/Space Sciences', new: 'https://www.nasa.gov/stem/highschoolvirtualinternship/', title: 'NASA SEES' },
        { old: 'https://Free + $3', new: 'https://fish.uw.edu/students/junior-fisheries-biology-program/', title: 'Hutton Junior Fisheries' },
        { old: 'https://Engineering/IT/Physics', new: 'https://www.nist.gov/careers/student-opportunities/summer-high-school-intern-program-ship', title: 'NIST SHIP' },
        { old: 'https://5 weeks (late June-July)', new: 'https://www.training.nih.gov/programs/histep', title: 'NIH HiSTEP' },
        { old: 'https://8 weeks (June-August)', new: 'https://www.navsea.navy.mil/Our-Team/STEM-Education/SEAP/', title: 'Navy SEAP' },
        { old: 'https://4 weeks (July)', new: 'https://beaverworks.ll.mit.edu/CMS/bw/bwsi', title: 'MIT Beaver Works' },
        { old: 'https://Free', new: 'https://girlswhocode.com/programs/summer-immersion-program', title: 'Girls Who Code SIP' },
        { old: 'https://Entrepreneurship', new: 'https://launchx.org/', title: 'LaunchX' },
        { old: 'https://Finals July', new: 'https://www.googlesciencefair.com/', title: 'Google Science Fair' },
        { old: 'https://Aug-Oct registration', new: 'https://www.conradchallenge.org/', title: 'Conrad Challenge' },
        { old: 'https://Jan submission', new: 'https://diamondchallenge.org/', title: 'Diamond Challenge' },
        { old: 'https://National Finals April', new: 'https://www.uscyberpatriot.org/', title: 'CyberPatriot' },
        { old: 'https://July-August', new: 'https://www.nysc.org/', title: 'National Youth Science Camp' },
        { old: 'https://June-July', new: 'https://www.si.edu/ofi/internship-opportunities', title: 'Smithsonian YAP' },
        { old: 'https://March (DC week)', new: 'https://www.ussyp.org/', title: 'USSYP' },
        { old: 'https://8 weeks summer + July summit', new: 'https://about.bankofamerica.com/en/making-an-impact/student-leaders', title: 'Bank of America Leaders' }
    ];
    
    let fixedCount = 0;
    
    for (const fix of placeholderFixes) {
        const matchingOpps = opportunities.filter(opp => opp.url === fix.old);
        
        if (matchingOpps.length > 0) {
            console.log(`\nFound ${matchingOpps.length} opportunities with URL: ${fix.old}`);
            
            for (const opp of matchingOpps) {
                console.log(`🔧 Fixing: ${opp.title}`);
                console.log(`   OLD: ${fix.old}`);
                console.log(`   NEW: ${fix.new}`);
                
                try {
                    const updateResponse = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            url: fix.new
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
        }
    }
    
    console.log(`\n=== FIXED ${fixedCount} PLACEHOLDER URLs ===`);
    return fixedCount;
}

fixFlaggedPlaceholderURLs().catch(console.error);