// Emergency comprehensive fix for ALL broken URLs
async function emergencyURLFix() {
    console.log('=== EMERGENCY COMPREHENSIVE URL FIX ===');
    
    // Get all opportunities
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    console.log(`Checking all ${opportunities.length} opportunities for broken URLs...`);
    
    // Common URL patterns that are likely broken and their fixes
    const emergencyFixes = {
        // Restaurant industry URLs
        'restaurant.org/nraef/scholarships/': 'https://www.chooserestaurants.org/Scholarships',
        'nraef.org/scholarships/': 'https://www.chooserestaurants.org/Scholarships',
        
        // Real estate industry
        'nar.realtor/education-and-events/scholarships': 'https://www.nar.realtor/education-and-events',
        
        // Government URLs that changed
        'peacecorps.gov/': 'https://www.peacecorps.gov/volunteer/',
        
        // Education URLs that moved
        'mitadmissions.org/apply/firstyear/mites': 'https://oeop.mit.edu/programs/mites',
        'davidsongifted.org/fellow-program': 'https://www.davidsongifted.org/support-scholars/fellowship-program/',
        'davidsongifted.org/fellowship-program': 'https://www.davidsongifted.org/support-scholars/fellowship-program/',
        
        // Tech company URLs that changed
        'careers.microsoft.com/students/us/en/ur-scholarships': 'https://careers.microsoft.com/us/en/students',
        'adobe.com/careers/university/digital-academy': 'https://www.adobe.com/careers/university.html',
        
        // Foundation URLs
        'coca-colascholarsfoundation.org/apply': 'https://www.coca-colascholarsfoundation.org/scholarships/',
        'reaganfoundation.org/media/355919/grf-scholarship-application-instructions.pdf': 'https://www.reaganfoundation.org/education/scholarship-programs/grf-scholarship/',
        'simonsfoundation.org/grant/math-x-investigator-awards': 'https://www.simonsfoundation.org/funding-opportunities/',
        
        // Art education
        'arteducators.org/learn-tools/awards-grants': 'https://www.arteducators.org/community/awards-grants',
        
        // Medical scholarships
        'adafoundation.org/en/how-we-help/scholarships': 'https://www.adafoundation.org/en/how-we-help/scholarships',
        
        // Veterans organizations
        'vfw.org/community/youth-and-education/youth-scholarships': 'https://www.vfw.org/community/youth-and-education/youth-scholarships',
        
        // Elks organization
        'elks.org/scholars/scholarships': 'https://www.elks.org/scholars/',
        
        // Corporate scholarships
        'corporate.target.com/sustainability-social-responsibility/education': 'https://corporate.target.com/sustainability-ESG/social/education',
        'carsonscholars.org/scholarships': 'https://carsonscholars.org/scholarship-program/',
        'scholars.horatioalger.org/apply': 'https://scholars.horatioalger.org/',
        
        // Science programs
        'cee.org/programs/research-science-institute': 'https://www.cee.org/research-science-institute',
        'tellurideassociation.org/programs/high-school-students/tasp': 'https://www.tellurideassociation.org/programs/high-school-students/summer-seminar/',
        
        // Engineering organizations  
        'asme.org/students/competitions': 'https://www.asme.org/students-and-faculty/students/competitions',
        'aiche.org/community/students/awards-scholarships-competitions': 'https://www.aiche.org/students/awards-scholarships-competitions',
        'ieee.org/membership/students/competitions/': 'https://www.ieee.org/membership/students/competitions.html',
        
        // State science programs
        'txstate.edu/mathworks/camps/ssm.html': 'https://www.txstate.edu/academics/mathematics-statistics.html',
        'ucop.edu/mesa/': 'https://www.ucop.edu/student-affairs/programs-and-initiatives/mesa/',
        
        // International programs
        'rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship': 'https://www.rhodestrust.com/the-scholarship/',
        
        // Summer programs
        'amazonfutureengineer.com/scholarships': 'https://www.amazonfutureengineer.com/scholarships',
        'summerofcode.withgoogle.com': 'https://summerofcode.withgoogle.com/',
        
        // Generic fixes for common issues
        'http://': 'https://',  // Upgrade HTTP to HTTPS
    };
    
    let fixedCount = 0;
    const brokenUrls = [];
    
    // Process all opportunities and fix URLs that match patterns
    for (const opp of opportunities) {
        if (!opp.url) continue;
        
        let needsFix = false;
        let newUrl = opp.url;
        
        // Check for pattern matches and apply fixes
        for (const [pattern, replacement] of Object.entries(emergencyFixes)) {
            if (opp.url.includes(pattern)) {
                if (pattern === 'http://') {
                    // Only replace if it's actually HTTP (not HTTPS)
                    if (opp.url.startsWith('http://')) {
                        newUrl = opp.url.replace('http://', 'https://');
                        needsFix = true;
                    }
                } else {
                    // For other patterns, replace the matching part
                    newUrl = replacement;
                    needsFix = true;
                }
                break;
            }
        }
        
        // Apply fix if needed
        if (needsFix && newUrl !== opp.url) {
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
                    console.log(`✅ EMERGENCY FIX: ${opp.title.substring(0, 50)}...`);
                    console.log(`   OLD: ${opp.url}`);
                    console.log(`   NEW: ${newUrl}`);
                    fixedCount++;
                } else {
                    console.log(`❌ Failed to fix: ${opp.title.substring(0, 50)}...`);
                    brokenUrls.push({ id: opp.id, title: opp.title, url: opp.url, error: 'Failed to update' });
                }
            } catch (error) {
                console.log(`❌ Error fixing: ${opp.title.substring(0, 50)}... - ${error.message}`);
                brokenUrls.push({ id: opp.id, title: opp.title, url: opp.url, error: error.message });
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
    
    console.log('\n=== EMERGENCY FIX COMPLETE ===');
    console.log(`✅ Fixed ${fixedCount} broken URLs`);
    console.log(`❌ ${brokenUrls.length} URLs still need attention`);
    
    if (brokenUrls.length > 0) {
        console.log('\nRemaining problematic URLs:');
        brokenUrls.slice(0, 10).forEach(item => {
            console.log(`- ${item.title.substring(0, 50)}... (${item.url})`);
        });
        if (brokenUrls.length > 10) {
            console.log(`... and ${brokenUrls.length - 10} more`);
        }
    }
    
    // Save results
    const fs = require('fs');
    const timestamp = Date.now();
    fs.writeFileSync(`emergency-fix-results-${timestamp}.json`, JSON.stringify({
        timestamp: new Date().toISOString(),
        fixedCount,
        brokenUrls,
        totalOpportunities: opportunities.length
    }, null, 2));
    
    console.log(`\n💾 Results saved to emergency-fix-results-${timestamp}.json`);
    
    return { fixedCount, brokenUrls };
}

emergencyURLFix().catch(console.error);