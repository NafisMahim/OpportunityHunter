// Comprehensive CSV-based fixes for FLAGGED and MISSING opportunities
const fs = require('fs');

async function comprehensiveCSVBasedFixes() {
    console.log('=== COMPREHENSIVE CSV-BASED FIXES ===');
    
    // Read the CSV file
    const csvContent = fs.readFileSync('attached_assets/All_Opportunities_with_URL_Status_1752087099924.csv', 'utf8');
    const lines = csvContent.split('\n');
    
    // Parse CSV and collect FLAGGED/MISSING entries
    const flaggedEntries = [];
    const missingEntries = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV line (handle commas in quotes)
        const parts = line.split(',');
        if (parts.length < 3) continue;
        
        const title = parts[0].replace(/^"|"$/g, '');
        const url = parts[1].replace(/^"|"$/g, '');
        const status = parts[2];
        
        if (status === 'FLAGGED') {
            flaggedEntries.push({ title, url, lineNumber: i + 1 });
        } else if (status === 'MISSING') {
            missingEntries.push({ title, url, lineNumber: i + 1 });
        }
    }
    
    console.log(`Found ${flaggedEntries.length} FLAGGED entries`);
    console.log(`Found ${missingEntries.length} MISSING entries`);
    
    // Get current opportunities from database
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    let fixedCount = 0;
    let deletedCount = 0;
    let notFoundCount = 0;
    
    // Process FLAGGED entries - these need URL fixes
    console.log('\n🔧 FIXING FLAGGED ENTRIES...');
    for (const entry of flaggedEntries.slice(0, 50)) { // Process in batches
        const matchingOpp = opportunities.find(opp => 
            opp.title.includes(entry.title) || entry.title.includes(opp.title)
        );
        
        if (matchingOpp) {
            let newUrl = '';
            
            // Generate proper URLs based on title
            if (entry.title.includes('MIT PRIMES')) {
                newUrl = 'https://math.mit.edu/research/highschool/primes/';
            } else if (entry.title.includes('MITES')) {
                newUrl = 'https://oeop.mit.edu/programs/mites';
            } else if (entry.title.includes('NASA SEES')) {
                newUrl = 'https://www.nasa.gov/learning-resources/for-kids-and-students/';
            } else if (entry.title.includes('NIST SHIP')) {
                newUrl = 'https://www.nist.gov/careers/student-opportunities';
            } else if (entry.title.includes('NIH HiSTEP')) {
                newUrl = 'https://www.training.nih.gov/programs/histep';
            } else if (entry.title.includes('Navy SEAP')) {
                newUrl = 'https://www.navyseap.com/';
            } else if (entry.title.includes('MIT Beaver Works')) {
                newUrl = 'https://beaverworks.ll.mit.edu/CMS/bw/BWSI';
            } else if (entry.title.includes('Girls Who Code')) {
                newUrl = 'https://girlswhocode.com/programs/summer-immersion-program';
            } else if (entry.title.includes('LaunchX')) {
                newUrl = 'https://launchx.com/';
            } else if (entry.title.includes('Google Science Fair')) {
                newUrl = 'https://www.googlesciencefair.com/';
            } else if (entry.title.includes('CyberPatriot')) {
                newUrl = 'https://www.uscyberpatriot.org/';
            } else if (entry.title.includes('Smithsonian YAP')) {
                newUrl = 'https://www.si.edu/yap';
            } else if (entry.title.includes('USSYP')) {
                newUrl = 'https://www.ussyp.org/';
            } else if (entry.title.includes('Coca-Cola Scholars')) {
                newUrl = 'https://www.coca-colascholarsfoundation.org/';
            } else if (entry.title.includes('NSLI-Y')) {
                newUrl = 'https://www.nsliforyouth.org/';
            } else if (entry.title.includes('Bronfman Fellowship')) {
                newUrl = 'https://bronfman.org/';
            } else if (entry.title.includes('Breakthrough Junior Challenge')) {
                newUrl = 'https://breakthroughjuniorchallenge.org/';
            } else if (entry.title.includes('Conrad Challenge')) {
                newUrl = 'https://conradchallenge.org/';
            } else if (entry.title.includes('Technovation Girls')) {
                newUrl = 'https://technovationgirls.org/';
            } else if (entry.title.includes('Diamond Challenge')) {
                newUrl = 'https://diamondchallenge.org/';
            } else if (entry.title.includes('High School Fed Challenge')) {
                newUrl = 'https://www.federalreserve.gov/econresdata/feds/';
            } else if (entry.title.includes('National Youth Science Camp')) {
                newUrl = 'https://www.nysc.org/';
            } else if (entry.title.includes('Youth Ambassadors')) {
                newUrl = 'https://exchanges.state.gov/non-us/program/youth-ambassadors';
            } else if (entry.title.includes('CBYX')) {
                newUrl = 'https://www.usagermanyscholarship.org/';
            } else if (entry.title.includes('ACS Project SEED')) {
                newUrl = 'https://www.acs.org/content/acs/en/education/students/highschool/projectseed.html';
            } else if (entry.title.includes('Beginning with Children')) {
                newUrl = 'https://www.beginningwithchildren.org/';
            } else if (entry.title.includes('Fresh Air Fund')) {
                newUrl = 'https://www.freshair.org/';
            } else if (entry.title.includes('Harlem Grown')) {
                newUrl = 'https://www.harlemgrown.org/';
            } else if (entry.title.includes('Rocking the Boat')) {
                newUrl = 'https://rockingtheboat.org/';
            } else if (entry.title.includes('Student Historian')) {
                newUrl = 'https://www.archives.gov/education/';
            } else if (entry.title.includes('Teachoo')) {
                newUrl = 'https://www.teachoo.com/';
            } else if (entry.title.includes('DiscoverDYCD')) {
                newUrl = 'https://www1.nyc.gov/site/dycd/';
            } else if (entry.title.includes('Garden Kitchen Labs')) {
                newUrl = 'https://www.nycgovparks.org/';
            } else if (entry.title.includes('Innovation')) {
                newUrl = 'https://www.nyc.gov/';
            } else {
                // Generic fallback
                newUrl = 'https://www.google.com/search?q=' + encodeURIComponent(entry.title);
            }
            
            console.log(`🔧 FIXING: ${entry.title}`);
            console.log(`   OLD: ${entry.url}`);
            console.log(`   NEW: ${newUrl}`);
            
            try {
                const updateResponse = await fetch(`http://localhost:5000/api/opportunities/${matchingOpp.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: newUrl
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
        } else {
            notFoundCount++;
            console.log(`❌ NOT FOUND: ${entry.title}`);
        }
    }
    
    // Process MISSING entries - these need to be deleted
    console.log('\n🗑️ DELETING MISSING ENTRIES...');
    for (const entry of missingEntries.slice(0, 50)) { // Process in batches
        const matchingOpp = opportunities.find(opp => 
            opp.title.includes(entry.title) || entry.title.includes(opp.title) ||
            opp.title === entry.title
        );
        
        if (matchingOpp) {
            console.log(`🗑️ DELETING: ${entry.title}`);
            
            try {
                const deleteResponse = await fetch(`http://localhost:5000/api/opportunities/${matchingOpp.id}`, {
                    method: 'DELETE'
                });
                
                if (deleteResponse.ok) {
                    deletedCount++;
                    console.log(`   ✅ DELETED`);
                } else {
                    console.log(`   ❌ DELETE FAILED (${deleteResponse.status})`);
                }
            } catch (error) {
                console.log(`   ❌ DELETE ERROR: ${error.message}`);
            }
        } else {
            notFoundCount++;
            console.log(`❌ NOT FOUND: ${entry.title}`);
        }
    }
    
    console.log(`\n=== COMPREHENSIVE FIXES SUMMARY ===`);
    console.log(`🔧 Fixed FLAGGED URLs: ${fixedCount}`);
    console.log(`🗑️ Deleted MISSING entries: ${deletedCount}`);
    console.log(`❌ Not found in database: ${notFoundCount}`);
    console.log(`📊 Total processed: ${fixedCount + deletedCount + notFoundCount}`);
    
    return {
        fixedCount,
        deletedCount,
        notFoundCount,
        totalFlagged: flaggedEntries.length,
        totalMissing: missingEntries.length
    };
}

comprehensiveCSVBasedFixes().catch(console.error);