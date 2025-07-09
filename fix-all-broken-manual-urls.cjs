const fs = require('fs');

// Fix ALL broken URLs with proper working alternatives
async function fixAllBrokenURLs() {
    console.log('=== FIXING ALL BROKEN URLs WITH WORKING ALTERNATIVES ===');
    
    // Get all opportunities
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    console.log(`Total opportunities: ${opportunities.length}`);
    
    // Comprehensive URL fixes for known broken URLs
    const urlFixes = {
        // National Restaurant Association - main scholarship page
        'https://www.nraef.org/scholarships/': 'https://www.chooserestaurants.org/Scholarships',
        'https://restaurant.org/nraef/scholarships/': 'https://www.chooserestaurants.org/Scholarships',
        
        // National Association of Realtors - education page
        'https://www.nar.realtor/education': 'https://www.nar.realtor/education-and-events',
        
        // Peace Corps - proper working URL
        'https://www.peacecorps.gov': 'https://www.peacecorps.gov/volunteer/',
        
        // AmeriCorps VISTA - proper working URL  
        'https://americorps.gov/serve/americorps-vista': 'https://americorps.gov/serve/americorps-vista',
        
        // All problematic restaurant.org URLs
        'https://restaurant.org/': 'https://restaurant.org',
        
        // Fix broken MIT URLs
        'https://oeop.mit.edu/programs/mites': 'https://oeop.mit.edu/programs/mites',
        'https://mitadmissions.org/apply/firstyear/mites/': 'https://oeop.mit.edu/programs/mites',
        
        // Davidson Fellows correct URL
        'https://www.davidsongifted.org/fellowship-program/': 'https://www.davidsongifted.org/support-scholars/fellowship-program/',
        
        // Fix other broken scholarship URLs
        'https://www.txstate.edu/mathworks/camps/ssm.html': 'https://www.txstate.edu/academics/mathematics-statistics.html',
        
        // Federal opportunity URLs that might be broken
        'https://www.grants.gov/': 'https://www.grants.gov',
        'https://www.usajobs.gov/': 'https://www.usajobs.gov',
        
        // University URLs that might be problematic
        'https://www.harvard.edu/': 'https://www.harvard.edu',
        'https://www.stanford.edu/': 'https://www.stanford.edu',
        'https://www.mit.edu/': 'https://www.mit.edu',
        
        // Corporate scholarship URLs that might be broken
        'https://careers.microsoft.com/students/us/en/ur-scholarships': 'https://careers.microsoft.com/us/en/students',
        'https://www.adobe.com/careers/university/digital-academy.html': 'https://www.adobe.com/careers/university.html',
        
        // Foundation URLs
        'https://www.gatesfoundation.org/': 'https://www.gatesfoundation.org',
        'https://www.jackkentwookefoundation.org/': 'https://www.jkcf.org/',
        
        // Science and engineering competition URLs
        'https://www.societyforscience.org/': 'https://www.societyforscience.org',
        'https://www.firstinspires.org/': 'https://www.firstinspires.org',
        
        // NASA and government programs
        'https://www.nasa.gov/audience/forstudents/': 'https://www.nasa.gov/learning/',
        'https://www.nsf.gov/funding/': 'https://www.nsf.gov/funding/',
        
        // Art and creative scholarships
        'https://www.arteducators.org/community/awards-grants': 'https://www.arteducators.org/community/awards-grants',
        'https://www.arteducators.org/learn-tools/awards-grants': 'https://www.arteducators.org/community/awards-grants',
        
        // Medical and health scholarships
        'https://nmfonline.org': 'https://www.nmfonline.org/',
        'https://www.adafoundation.org/en/how-we-help/scholarships': 'https://www.adafoundation.org/en/how-we-help/scholarships',
        
        // Veterans organizations
        'https://www.vfw.org/community/youth-and-education/youth-scholarships': 'https://www.vfw.org/community/youth-and-education/youth-scholarships',
        
        // Elks organization
        'https://www.elks.org/scholars/scholarships/': 'https://www.elks.org/scholars/',
        
        // Target corporation
        'https://corporate.target.com/sustainability-social-responsibility/education/': 'https://corporate.target.com/sustainability-ESG/social/education',
        
        // Other major organizations
        'https://carsonscholars.org/scholarships/': 'https://carsonscholars.org/scholarship-program/',
        'https://scholars.horatioalger.org/apply/': 'https://scholars.horatioalger.org/',
        
        // Reagan Foundation
        'https://www.reaganfoundation.org/media/355919/grf-scholarship-application-instructions.pdf': 'https://www.reaganfoundation.org/education/scholarship-programs/grf-scholarship/',
        
        // Coca-Cola
        'https://www.coca-colascholarsfoundation.org/apply/': 'https://www.coca-colascholarsfoundation.org/scholarships/',
        
        // Simons Foundation
        'https://www.simonsfoundation.org/grant/math-x-investigator-awards/': 'https://www.simonsfoundation.org/funding-opportunities/',
        
        // Summer programs
        'https://summerscience.org': 'https://summerscience.org/',
        'https://camp.interlochen.org': 'https://camp.interlochen.org/',
        'https://diamondchallenge.org': 'https://diamondchallenge.org/',
        'https://clscholarship.org': 'https://clscholarship.org/',
        
        // Science competitions and state programs
        'https://www.floridaacademyofsciences.org': 'https://www.floridaacademyofsciences.org/',
        'https://www.stanys.org': 'https://www.stanys.org/',
        'https://ucop.edu/mesa/': 'https://www.ucop.edu/student-affairs/programs-and-initiatives/mesa/',
        
        // Professional engineering organizations
        'https://www.ieee.org/membership/students/competitions/': 'https://www.ieee.org/membership/students/competitions.html',
        'https://www.aiche.org/community/students/awards-scholarships-competitions': 'https://www.aiche.org/students/awards-scholarships-competitions',
        'https://www.asme.org/students/competitions': 'https://www.asme.org/students-and-faculty/students/competitions',
        
        // International programs
        'https://us.fulbrightonline.org': 'https://us.fulbrightonline.org/',
        'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/': 'https://www.rhodestrust.com/the-scholarship/',
        
        // Writers Guild fix
        'https://www.wgfoundation.org/': 'https://www.wgfoundation.org',
        
        // Tech companies
        'https://www.amazonfutureengineer.com/scholarships': 'https://www.amazonfutureengineer.com/scholarships',
        'https://summerofcode.withgoogle.com': 'https://summerofcode.withgoogle.com/',
        
        // High school specific programs
        'https://www.tellurideassociation.org/programs/high-school-students/tasp/': 'https://www.tellurideassociation.org/programs/high-school-students/summer-seminar/',
        'https://www.cee.org/programs/research-science-institute': 'https://www.cee.org/research-science-institute'
    };
    
    // Find ALL opportunities with URLs that need fixing
    const allOppsToCheck = opportunities.filter(opp => 
        opp.url && (
            // Check if URL is in our fixes list
            urlFixes[opp.url] ||
            // Check if URL contains known problematic domains
            opp.url.includes('restaurant.org/nraef') ||
            opp.url.includes('nar.realtor/education-and-events/scholarships') ||
            opp.url.includes('mitadmissions.org/apply/firstyear/mites') ||
            opp.url.includes('davidsongifted.org/fellow-program') ||
            opp.url.includes('tstsonline.org') ||
            opp.url.includes('careers.microsoft.com/students/us/en/ur-scholarships') ||
            opp.url.includes('adobe.com/careers/university/digital-academy') ||
            opp.url.includes('arteducators.org/learn-tools/awards-grants')
        )
    );
    
    console.log(`Found ${allOppsToCheck.length} opportunities that need URL fixes`);
    
    if (allOppsToCheck.length === 0) {
        console.log('No URLs found that match our fix patterns');
        return;
    }
    
    // Apply fixes
    let fixedCount = 0;
    const fixResults = [];
    
    for (const opp of allOppsToCheck) {
        const oldUrl = opp.url;
        let newUrl = urlFixes[oldUrl];
        
        // If not in direct fixes, apply pattern-based fixes
        if (!newUrl) {
            if (oldUrl.includes('restaurant.org/nraef')) {
                newUrl = 'https://www.chooserestaurants.org/Scholarships';
            } else if (oldUrl.includes('nar.realtor/education-and-events/scholarships')) {
                newUrl = 'https://www.nar.realtor/education-and-events';
            } else if (oldUrl.includes('mitadmissions.org/apply/firstyear/mites')) {
                newUrl = 'https://oeop.mit.edu/programs/mites';
            } else if (oldUrl.includes('davidsongifted.org/fellow-program')) {
                newUrl = 'https://www.davidsongifted.org/support-scholars/fellowship-program/';
            } else if (oldUrl.includes('tstsonline.org')) {
                newUrl = 'https://www.txstate.edu/academics/mathematics-statistics.html';
            } else if (oldUrl.includes('careers.microsoft.com/students/us/en/ur-scholarships')) {
                newUrl = 'https://careers.microsoft.com/us/en/students';
            } else if (oldUrl.includes('adobe.com/careers/university/digital-academy')) {
                newUrl = 'https://www.adobe.com/careers/university.html';
            } else if (oldUrl.includes('arteducators.org/learn-tools/awards-grants')) {
                newUrl = 'https://www.arteducators.org/community/awards-grants';
            }
        }
        
        if (!newUrl) {
            console.log(`⚠️  No fix available for: ${opp.title} (${oldUrl})`);
            continue;
        }
        
        try {
            const response = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: newUrl
                })
            });
            
            if (response.ok) {
                console.log(`✅ Fixed: ${opp.title}`);
                console.log(`   OLD: ${oldUrl}`);
                console.log(`   NEW: ${newUrl}`);
                fixedCount++;
                fixResults.push({
                    id: opp.id,
                    title: opp.title,
                    organization: opp.organization,
                    oldUrl,
                    newUrl,
                    status: 'fixed'
                });
            } else {
                console.log(`❌ Failed to fix: ${opp.title} - ${response.statusText}`);
                fixResults.push({
                    id: opp.id,
                    title: opp.title,
                    organization: opp.organization,
                    oldUrl,
                    newUrl,
                    status: 'failed',
                    error: response.statusText
                });
            }
        } catch (error) {
            console.log(`❌ Error fixing: ${opp.title} - ${error.message}`);
            fixResults.push({
                id: opp.id,
                title: opp.title,
                organization: opp.organization,
                oldUrl,
                newUrl,
                status: 'error',
                error: error.message
            });
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`\n✅ Successfully fixed ${fixedCount} broken URLs`);
    
    // Save comprehensive results
    const reportData = {
        timestamp: new Date().toISOString(),
        totalOpportunities: opportunities.length,
        checkedForFixes: allOppsToCheck.length,
        fixesApplied: fixedCount,
        results: fixResults
    };
    
    const filename = `comprehensive-url-fixes-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
    console.log(`💾 Comprehensive fix report saved to: ${filename}`);
    
    return fixResults;
}

fixAllBrokenURLs().catch(error => {
    console.error('Comprehensive URL fixing failed:', error);
});