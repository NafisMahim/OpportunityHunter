// Mass fix for manually identified broken URLs
async function massFixBrokenURLs() {
    console.log('=== MASS FIX FOR BROKEN URLs ===');
    
    // Get all opportunities
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    console.log(`Total opportunities: ${opportunities.length}`);
    
    // Manually identified broken URLs and their fixes based on verification
    const criticalFixes = {
        // National Association of Realtors - 404 error
        'https://www.nar.realtor/education-and-events': 'https://www.nar.realtor/education',
        
        // AmeriCorps VISTA - 403 error
        'https://americorps.gov/serve/americorps-vista': 'https://www.americorps.gov/serve/americorps-vista',
        
        // National Honor Society - 404 error (from user screenshot)
        'https://www.nationalhonorsociety.org/students/scholarships/': 'https://www.nhs.us/students/scholarships/',
        'https://www.nationalhonorsociety.org/': 'https://www.nhs.us/',
        
        // Additional broken URLs from patterns
        'https://www.nraef.org/scholarships/': 'https://www.chooserestaurants.org/Scholarships',
        'https://restaurant.org/nraef/scholarships/': 'https://www.chooserestaurants.org/Scholarships',
        
        // Peace Corps variations
        'https://www.peacecorps.gov/': 'https://www.peacecorps.gov/volunteer/',
        
        // Education URLs that commonly break
        'https://mitadmissions.org/apply/firstyear/mites/': 'https://oeop.mit.edu/programs/mites',
        'https://www.davidsongifted.org/fellow-program': 'https://www.davidsongifted.org/support-scholars/fellowship-program/',
        'https://www.davidsongifted.org/fellowship-program/': 'https://www.davidsongifted.org/support-scholars/fellowship-program/',
        
        // Microsoft career URLs
        'https://careers.microsoft.com/students/us/en/ur-scholarships': 'https://careers.microsoft.com/us/en/students',
        
        // Adobe career URLs
        'https://www.adobe.com/careers/university/digital-academy.html': 'https://www.adobe.com/careers/university.html',
        
        // Foundation URLs
        'https://www.coca-colascholarsfoundation.org/apply/': 'https://www.coca-colascholarsfoundation.org/scholarships/',
        'https://www.reaganfoundation.org/media/355919/grf-scholarship-application-instructions.pdf': 'https://www.reaganfoundation.org/education/scholarship-programs/grf-scholarship/',
        
        // Art education
        'https://www.arteducators.org/learn-tools/awards-grants': 'https://www.arteducators.org/community/awards-grants',
        
        // Medical associations
        'https://www.adafoundation.org/en/how-we-help/scholarships': 'https://www.adafoundation.org/en/how-we-help/scholarships',
        'https://nmfonline.org': 'https://www.nmfonline.org/',
        
        // Veterans organizations
        'https://www.vfw.org/community/youth-and-education/youth-scholarships': 'https://www.vfw.org/community/youth-and-education/youth-scholarships',
        'https://www.elks.org/scholars/scholarships/': 'https://www.elks.org/scholars/',
        'https://www.elks.org/scholars/mvs.cfm': 'https://www.elks.org/scholars/',
        
        // Corporate scholarships
        'https://corporate.target.com/sustainability-social-responsibility/education/': 'https://corporate.target.com/sustainability-ESG/social/education',
        'https://carsonscholars.org/scholarships/': 'https://carsonscholars.org/scholarship-program/',
        'https://scholars.horatioalger.org/apply/': 'https://scholars.horatioalger.org/',
        
        // Science programs
        'https://www.cee.org/programs/research-science-institute': 'https://www.cee.org/research-science-institute',
        'https://www.tellurideassociation.org/programs/high-school-students/tasp/': 'https://www.tellurideassociation.org/programs/high-school-students/summer-seminar/',
        
        // Engineering organizations
        'https://www.asme.org/students/competitions': 'https://www.asme.org/students-and-faculty/students/competitions',
        'https://www.aiche.org/community/students/awards-scholarships-competitions': 'https://www.aiche.org/students/awards-scholarships-competitions',
        'https://www.ieee.org/membership/students/competitions/index.html': 'https://www.ieee.org/membership/students/competitions.html',
        
        // State education programs
        'https://www.txstate.edu/mathworks/camps/ssm.html': 'https://www.txstate.edu/academics/mathematics-statistics.html',
        'https://ucop.edu/mesa/': 'https://www.ucop.edu/student-affairs/programs-and-initiatives/mesa/',
        
        // International programs
        'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/': 'https://www.rhodestrust.com/the-scholarship/',
        'https://us.fulbrightonline.org': 'https://us.fulbrightonline.org/',
        
        // Tech companies
        'https://www.amazonfutureengineer.com/scholarships': 'https://www.amazonfutureengineer.com/scholarships',
        'https://summerofcode.withgoogle.com': 'https://summerofcode.withgoogle.com/',
        
        // Math and science foundations
        'https://www.simonsfoundation.org/grant/math-x-investigator-awards/': 'https://www.simonsfoundation.org/funding-opportunities/',
        
        // Summer programs
        'https://summerscience.org': 'https://summerscience.org/',
        'https://camp.interlochen.org': 'https://camp.interlochen.org/',
        'https://diamondchallenge.org': 'https://diamondchallenge.org/',
        'https://clscholarship.org': 'https://clscholarship.org/',
        
        // State science organizations
        'https://www.floridaacademyofsciences.org': 'https://www.floridaacademyofsciences.org/',
        'https://www.stanys.org': 'https://www.stanys.org/',
        
        // Writers organizations
        'https://www.wgfoundation.org/': 'https://www.wgfoundation.org'
    };
    
    // Find opportunities that need fixing
    const oppsNeedingFix = opportunities.filter(opp => 
        opp.url && (
            criticalFixes[opp.url] ||
            // Pattern matches for variations
            opp.url.includes('nationalhonorsociety.org/students/scholarships') ||
            opp.url.includes('nar.realtor/education-and-events/scholarships') ||
            opp.url.includes('americorps.gov/serve/americorps-vista') ||
            opp.url.includes('restaurant.org/nraef') ||
            opp.url.includes('nraef.org/scholarships') ||
            opp.url.includes('careers.microsoft.com/students/us/en/ur-scholarships') ||
            opp.url.includes('adobe.com/careers/university/digital-academy') ||
            opp.url.includes('coca-colascholarsfoundation.org/apply') ||
            opp.url.includes('arteducators.org/learn-tools/awards-grants') ||
            opp.url.includes('elks.org/scholars/scholarships') ||
            opp.url.includes('elks.org/scholars/mvs.cfm') ||
            opp.url.includes('carsonscholars.org/scholarships') ||
            opp.url.includes('scholars.horatioalger.org/apply') ||
            opp.url.includes('cee.org/programs/research-science-institute') ||
            opp.url.includes('asme.org/students/competitions') ||
            opp.url.includes('aiche.org/community/students/awards-scholarships-competitions') ||
            opp.url.includes('ieee.org/membership/students/competitions/index.html') ||
            opp.url.includes('txstate.edu/mathworks/camps/ssm.html') ||
            opp.url.includes('rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship') ||
            opp.url.includes('simonsfoundation.org/grant/math-x-investigator-awards') ||
            opp.url.includes('davidsongifted.org/fellow-program') ||
            opp.url.includes('davidsongifted.org/fellowship-program') ||
            opp.url.includes('mitadmissions.org/apply/firstyear/mites') ||
            opp.url.includes('tellurideassociation.org/programs/high-school-students/tasp') ||
            // HTTP to HTTPS upgrades
            opp.url.startsWith('http://')
        )
    );
    
    console.log(`Found ${oppsNeedingFix.length} opportunities needing URL fixes`);
    
    let fixedCount = 0;
    const failedFixes = [];
    
    for (const opp of oppsNeedingFix) {
        let newUrl = criticalFixes[opp.url];
        
        // Pattern-based fixes if not in direct mapping
        if (!newUrl) {
            const oldUrl = opp.url;
            
            if (oldUrl.includes('nationalhonorsociety.org/students/scholarships')) {
                newUrl = 'https://www.nhs.us/students/scholarships/';
            } else if (oldUrl.includes('nar.realtor/education-and-events/scholarships')) {
                newUrl = 'https://www.nar.realtor/education';
            } else if (oldUrl.includes('americorps.gov/serve/americorps-vista')) {
                newUrl = 'https://www.americorps.gov/serve/americorps-vista';
            } else if (oldUrl.includes('restaurant.org/nraef') || oldUrl.includes('nraef.org/scholarships')) {
                newUrl = 'https://www.chooserestaurants.org/Scholarships';
            } else if (oldUrl.includes('careers.microsoft.com/students/us/en/ur-scholarships')) {
                newUrl = 'https://careers.microsoft.com/us/en/students';
            } else if (oldUrl.includes('adobe.com/careers/university/digital-academy')) {
                newUrl = 'https://www.adobe.com/careers/university.html';
            } else if (oldUrl.includes('coca-colascholarsfoundation.org/apply')) {
                newUrl = 'https://www.coca-colascholarsfoundation.org/scholarships/';
            } else if (oldUrl.includes('arteducators.org/learn-tools/awards-grants')) {
                newUrl = 'https://www.arteducators.org/community/awards-grants';
            } else if (oldUrl.includes('elks.org/scholars/scholarships') || oldUrl.includes('elks.org/scholars/mvs.cfm')) {
                newUrl = 'https://www.elks.org/scholars/';
            } else if (oldUrl.includes('carsonscholars.org/scholarships')) {
                newUrl = 'https://carsonscholars.org/scholarship-program/';
            } else if (oldUrl.includes('scholars.horatioalger.org/apply')) {
                newUrl = 'https://scholars.horatioalger.org/';
            } else if (oldUrl.includes('cee.org/programs/research-science-institute')) {
                newUrl = 'https://www.cee.org/research-science-institute';
            } else if (oldUrl.includes('asme.org/students/competitions')) {
                newUrl = 'https://www.asme.org/students-and-faculty/students/competitions';
            } else if (oldUrl.includes('aiche.org/community/students/awards-scholarships-competitions')) {
                newUrl = 'https://www.aiche.org/students/awards-scholarships-competitions';
            } else if (oldUrl.includes('ieee.org/membership/students/competitions/index.html')) {
                newUrl = 'https://www.ieee.org/membership/students/competitions.html';
            } else if (oldUrl.includes('txstate.edu/mathworks/camps/ssm.html')) {
                newUrl = 'https://www.txstate.edu/academics/mathematics-statistics.html';
            } else if (oldUrl.includes('rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship')) {
                newUrl = 'https://www.rhodestrust.com/the-scholarship/';
            } else if (oldUrl.includes('simonsfoundation.org/grant/math-x-investigator-awards')) {
                newUrl = 'https://www.simonsfoundation.org/funding-opportunities/';
            } else if (oldUrl.includes('davidsongifted.org/fellow-program') || oldUrl.includes('davidsongifted.org/fellowship-program')) {
                newUrl = 'https://www.davidsongifted.org/support-scholars/fellowship-program/';
            } else if (oldUrl.includes('mitadmissions.org/apply/firstyear/mites')) {
                newUrl = 'https://oeop.mit.edu/programs/mites';
            } else if (oldUrl.includes('tellurideassociation.org/programs/high-school-students/tasp')) {
                newUrl = 'https://www.tellurideassociation.org/programs/high-school-students/summer-seminar/';
            } else if (oldUrl.startsWith('http://')) {
                newUrl = oldUrl.replace('http://', 'https://');
            }
        }
        
        if (!newUrl) {
            console.log(`⚠️  No fix available for: ${opp.title.substring(0, 50)}... (${opp.url})`);
            continue;
        }
        
        // Apply the fix
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
                console.log(`✅ FIXED: ${opp.title.substring(0, 50)}...`);
                console.log(`   OLD: ${opp.url}`);
                console.log(`   NEW: ${newUrl}`);
                fixedCount++;
            } else {
                console.log(`❌ FAILED: ${opp.title.substring(0, 50)}...`);
                failedFixes.push({ id: opp.id, title: opp.title, url: opp.url, newUrl, error: response.statusText });
            }
        } catch (error) {
            console.log(`❌ ERROR: ${opp.title.substring(0, 50)}... - ${error.message}`);
            failedFixes.push({ id: opp.id, title: opp.title, url: opp.url, newUrl, error: error.message });
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('\n=== MASS FIX COMPLETE ===');
    console.log(`✅ Successfully fixed: ${fixedCount} URLs`);
    console.log(`❌ Failed to fix: ${failedFixes.length} URLs`);
    
    if (failedFixes.length > 0) {
        console.log('\nFailed fixes:');
        failedFixes.forEach(item => {
            console.log(`- ${item.title.substring(0, 40)}... (${item.url})`);
        });
    }
    
    // Save results
    const fs = require('fs');
    fs.writeFileSync(`mass-fix-results-${Date.now()}.json`, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalOpportunities: opportunities.length,
        foundNeedingFix: oppsNeedingFix.length,
        successfullyFixed: fixedCount,
        failedToFix: failedFixes.length,
        failedFixes
    }, null, 2));
    
    console.log('\n💾 Results saved to mass-fix-results file');
    
    return { fixedCount, failedFixes };
}

massFixBrokenURLs().catch(console.error);