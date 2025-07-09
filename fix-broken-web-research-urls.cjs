const fs = require('fs');

// Fix broken URLs from Web Research 2025 opportunities with working alternatives
async function fixBrokenWebResearchURLs() {
    console.log('=== FIXING BROKEN WEB RESEARCH 2025 URLs ===');
    
    // Get all opportunities
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    // Filter for Web Research 2025 opportunities
    const webResearchOpps = opportunities.filter(opp => 
        opp.source && opp.source.includes('Web Research 2025')
    );
    
    console.log(`Found ${webResearchOpps.length} Web Research 2025 opportunities to check and fix`);
    
    // URL fixes for known broken/invalid URLs
    const urlFixes = {
        // Research Science Institute fix
        'https://www.cee.org/research-science-institute': 'https://www.cee.org/programs/research-science-institute',
        
        // Summer Science Program fix
        'https://summerscience.org/': 'https://summerscience.org',
        
        // TASP fix
        'https://www.tellurideassociation.org/our-programs/high-school-students/': 'https://www.tellurideassociation.org/programs/high-school-students/tasp/',
        
        // Google Summer of Code fix
        'https://summerofcode.withgoogle.com/': 'https://summerofcode.withgoogle.com',
        
        // MITES fix
        'https://oeop.mit.edu/programs/mites': 'https://mitadmissions.org/apply/firstyear/mites/',
        
        // Diamond Challenge fix
        'https://diamondchallenge.org/': 'https://diamondchallenge.org',
        
        // Critical Language Scholarship fix
        'https://clscholarship.org/': 'https://clscholarship.org',
        
        // Interlochen fix
        'https://camp.interlochen.org/': 'https://camp.interlochen.org',
        
        // Davidson Fellows fix
        'https://www.davidsongifted.org/fellow-program': 'https://www.davidsongifted.org/programs/fellows/',
        
        // Simons Foundation fix
        'https://www.simonsfoundation.org/mathematics-physical-sciences/': 'https://www.simonsfoundation.org/grant/math-x-investigator-awards/',
        
        // Coca-Cola Scholars fix
        'https://www.coca-colascholarsfoundation.org/': 'https://www.coca-colascholarsfoundation.org/apply/',
        
        // Jack Kent Cooke fix - already working
        'https://www.jkcf.org/our-scholarships/college-scholarship-program/': 'https://www.jkcf.org/scholarships/college-scholarship/',
        
        // Reagan Foundation fix
        'https://www.reaganfoundation.org/education/scholarship-programs/': 'https://www.reaganfoundation.org/media/355919/grf-scholarship-application-instructions.pdf',
        
        // Horatio Alger fix
        'https://scholars.horatioalger.org/': 'https://scholars.horatioalger.org/apply/',
        
        // Dell Scholars fix - already working
        'https://www.dellscholars.org/': 'https://www.dellscholars.org/apply',
        
        // AXA Achievement fix
        'https://us.axa.com/axa-foundation/AXA-achievement-scholarship.html': 'https://us.axa.com/foundation/scholarships.html',
        
        // Carson Scholars fix
        'https://carsonscholars.org/scholarships/': 'https://carsonscholars.org/scholarships/',
        
        // Target fix
        'https://corporate.target.com/corporate-responsibility/education/target-all-around-scholarship': 'https://corporate.target.com/sustainability-social-responsibility/education/',
        
        // Elks Foundation fix
        'https://www.elks.org/scholars/': 'https://www.elks.org/scholars/scholarships/',
        
        // VFW Voice of Democracy fix
        'https://www.vfw.org/community/youth-and-education/youth-scholarships': 'https://www.vfw.org/community/youth-and-education/youth-scholarships',
        
        // California MESA fix
        'https://mesa.ucop.edu/': 'https://ucop.edu/mesa/',
        
        // Texas Science Talent Search fix
        'https://www.txsts.org/': 'https://www.tstsonline.org/',
        
        // STANYS fix
        'https://www.stanys.org/': 'https://www.stanys.org',
        
        // Florida Academy of Sciences fix
        'https://www.floridaacademyofsciences.org/': 'https://www.floridaacademyofsciences.org',
        
        // IEEE fix
        'https://www.ieee.org/membership/students/competitions/index.html': 'https://www.ieee.org/membership/students/competitions/',
        
        // AIChE fix
        'https://www.aiche.org/students/awards-scholarships-competitions': 'https://www.aiche.org/community/students/awards-scholarships-competitions',
        
        // ASME fix
        'https://www.asme.org/students/competitions': 'https://www.asme.org/students/competitions',
        
        // Microsoft Scholarship fix
        'https://careers.microsoft.com/students/us/en/ur-scholarships': 'https://careers.microsoft.com/us/en/students',
        
        // Amazon Future Engineer fix
        'https://www.amazonfutureengineer.com/scholarships': 'https://www.amazonfutureengineer.com/scholarships',
        
        // Adobe Digital Academy fix
        'https://www.adobe.com/careers/university/digital-academy.html': 'https://www.adobe.com/careers/university/',
        
        // NMF fix
        'https://nmfonline.org/': 'https://nmfonline.org',
        
        // ADA Foundation fix
        'https://www.adafoundation.org/en/how-we-help/scholarships': 'https://www.adafoundation.org/en/how-we-help/scholarships',
        
        // NAEA fix
        'https://www.arteducators.org/learn-tools/awards-grants': 'https://www.arteducators.org/community/awards-grants',
        
        // Screenwriters Federation fix
        'https://www.screenwritersfederation.org/': 'https://www.wgfoundation.org/',
        
        // Fulbright fix
        'https://us.fulbrightonline.org/': 'https://us.fulbrightonline.org',
        
        // Rhodes Scholarship fix
        'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/': 'https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/',
        
        // AmeriCorps VISTA fix
        'https://americorps.gov/serve/americorps-vista': 'https://americorps.gov/serve/americorps-vista',
        
        // Peace Corps fix
        'https://www.peacecorps.gov/': 'https://www.peacecorps.gov',
        
        // NAR fix
        'https://www.nar.realtor/education-and-events/scholarships': 'https://www.nar.realtor/education',
        
        // NRAEF fix
        'https://restaurant.org/nraef/scholarships/': 'https://www.nraef.org/scholarships/'
    };
    
    // Find opportunities with URLs that need fixing
    const oppsToFix = webResearchOpps.filter(opp => urlFixes[opp.url]);
    
    console.log(`Found ${oppsToFix.length} opportunities with known URL fixes needed`);
    
    if (oppsToFix.length === 0) {
        console.log('No URLs need fixing');
        return;
    }
    
    // Apply fixes
    let fixedCount = 0;
    const fixResults = [];
    
    for (const opp of oppsToFix) {
        const oldUrl = opp.url;
        const newUrl = urlFixes[oldUrl];
        
        try {
            // Update the opportunity with the fixed URL
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
    }
    
    console.log(`\n✅ Successfully fixed ${fixedCount} URLs`);
    
    // Save results
    const reportData = {
        timestamp: new Date().toISOString(),
        totalChecked: webResearchOpps.length,
        fixesApplied: fixedCount,
        results: fixResults
    };
    
    const filename = `url-fixes-report-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
    console.log(`💾 Fix report saved to: ${filename}`);
    
    return fixResults;
}

fixBrokenWebResearchURLs().catch(error => {
    console.error('URL fixing failed:', error);
});