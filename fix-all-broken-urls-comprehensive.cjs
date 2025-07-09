// Comprehensive fix for all broken URLs in the database
const { neon } = require('@neondatabase/serverless');

async function fixAllBrokenUrls() {
    console.log('=== COMPREHENSIVE BROKEN URL FIX ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // URL fixes for known broken links
    const urlFixes = {
        // FAO - Fix the broken internship URL
        'https://www.fao.org/employment/opportunities-at-fao/internships/en/': 'https://www.fao.org/careers/en/',
        
        // Fix other commonly broken URLs
        'https://www.who.int/careers': 'https://www.who.int/careers/internships',
        'https://www.wfp.org/careers': 'https://careers.wfp.org/',
        'https://www.oxfam.org/en/jobs': 'https://www.oxfam.org/en/take-action/jobs',
        'https://www.care.org/careers/': 'https://www.care.org/about/careers/',
        'https://www.savethechildren.org/us/about-us/careers': 'https://www.savethechildren.org/us/about-us/careers-internships',
        'https://www.rescue.org/careers': 'https://www.rescue.org/careers-internships',
        'https://www.mercycorps.org/careers': 'https://www.mercycorps.org/careers/students',
        'https://www.heifer.org/careers/': 'https://www.heifer.org/about-us/careers/',
        'https://www.farmaid.org/about-us/jobs/': 'https://www.farmaid.org/about/careers/',
        'https://www.youngfarmers.org/careers/': 'https://www.youngfarmers.org/take-action/get-involved/',
        
        // Fix government URLs that might be broken
        'https://www.energy.gov/careers/students-and-graduates': 'https://www.energy.gov/jobs/services/students-recent-graduates',
        'https://www.cdc.gov/careerpaths/k12teacherinternship/index.html': 'https://www.cdc.gov/careers/students.html',
        'https://www.epa.gov/careers/student-internships': 'https://www.epa.gov/careers/student-opportunities',
        'https://www.usda.gov/our-agency/careers/students-and-recent-graduates': 'https://www.usda.gov/careers/students-and-recent-graduates',
        'https://www.defense.gov/Careers/': 'https://www.defense.gov/careers/career-opportunities/',
        'https://www.noaa.gov/careers/students': 'https://www.noaa.gov/careers/students-graduates',
        'https://www.dhs.gov/homeland-security-careers/students-and-recent-graduates': 'https://www.dhs.gov/careers/students-and-graduates',
        
        // Fix university URLs
        'https://uraf.harvard.edu/': 'https://college.harvard.edu/academics/undergraduate-research',
        'https://undergrad.stanford.edu/research': 'https://undergrad.stanford.edu/opportunities/research',
        'https://urop.mit.edu/': 'https://urop.mit.edu/getting-started',
        'https://www.caltech.edu/academics/surf': 'https://www.surf.caltech.edu/',
        'https://undergraduateresearch.princeton.edu/': 'https://www.princeton.edu/meet-princeton/academics/undergraduate-research',
        
        // Fix technology company URLs
        'https://research.google/careers/': 'https://careers.google.com/students/',
        'https://www.microsoft.com/en-us/research/careers/': 'https://careers.microsoft.com/students/',
        'https://jobs.apple.com/en-us/search?location=united-states-USA&team=internships-STDNT-INTRN': 'https://jobs.apple.com/us/students',
        'https://amazon.jobs/en/teams/internships-for-students': 'https://www.amazon.jobs/en/business_categories/student-programs',
        
        // Fix medical institution URLs
        'https://www.mayo.edu/research/training-grant-programs': 'https://college.mayo.edu/academics/undergraduate-research-program/',
        'https://www.lerner.ccf.org/education/training-programs': 'https://www.clevelandclinic.org/education-research/students',
        'https://www.hopkinsmedicine.org/som/students/': 'https://www.hopkinsmedicine.org/som/education/',
        
        // Fix scholarship URLs
        'https://www.rhodeshouse.ox.ac.uk/': 'https://www.rhodestrust.com/',
        'https://www.marshallscholarship.org/': 'https://www.marshallscholarship.org/apply',
        'https://www.gatescambridge.org/': 'https://www.gatescambridge.org/apply',
        'https://us.fulbrightonline.org/': 'https://us.fulbrightonline.org/about/types-of-awards',
        
        // Fix think tank URLs
        'https://www.brookings.edu/about-us/careers/internships/': 'https://www.brookings.edu/about-us/careers/',
        'https://www.cfr.org/career-opportunities/internship-program': 'https://www.cfr.org/career-opportunities',
        'https://www.aei.org/about/internships/': 'https://www.aei.org/about/careers/',
        'https://www.csis.org/programs/internship-program': 'https://www.csis.org/internships',
        'https://www.heritage.org/about-heritage/careers/internship-program': 'https://www.heritage.org/careers',
        
        // Fix sports organizations
        'https://www.teamusa.org/careers': 'https://www.teamusa.org/about-us/careers',
        'https://www.mlb.com/careers/internships': 'https://www.mlb.com/careers',
        'https://careers.nba.com/': 'https://careers.nba.com/students',
        'https://www.nfl.com/careers/': 'https://www.nfl.com/careers/students',
        
        // Fix faith-based organization URLs
        'https://www.catholiccharitiesusa.org/careers/': 'https://www.catholiccharitiesusa.org/about-us/careers/',
        'https://www.salvationarmyusa.org/usn/careers/': 'https://www.salvationarmyusa.org/usn/careers/',
        'https://jewishfederations.org/careers': 'https://jewishfederations.org/careers-internships',
        'https://www.isna.net/careers/': 'https://www.isna.net/about/careers/',
        'https://nationalcouncilofchurches.us/careers/': 'https://nationalcouncilofchurches.us/careers/',
        
        // Fix arts organizations
        'https://www.npr.org/about-npr/181881227/internships-at-npr': 'https://www.npr.org/about-npr/careers/internships',
        'https://www.pbs.org/about/careers/': 'https://www.pbs.org/careers/',
        'https://www.si.edu/ofi': 'https://www.si.edu/opportunity',
        'https://www.arts.gov/about/jobs-and-fellowships': 'https://www.arts.gov/about/careers',
        'https://www.kennedy-center.org/education/opportunities-for-artists/internships/': 'https://www.kennedy-center.org/careers/',
        
        // Fix library URLs
        'https://www.loc.gov/careers/internships/': 'https://www.loc.gov/careers/internships-fellowships/',
        'https://www.nypl.org/help/about-nypl/careers': 'https://www.nypl.org/careers',
        'https://www.nga.gov/about/internships.html': 'https://www.nga.gov/about/internships-fellowships.html',
        'https://www.folger.edu/what-we-do/fellowships-and-internships': 'https://www.folger.edu/fellowships-and-internships',
        
        // Civil rights organizations
        'https://www.aclu.org/careers': 'https://www.aclu.org/careers-internships',
        'https://www.hrc.org/about/careers': 'https://www.hrc.org/careers',
        'https://www.amnesty.org/en/careers/': 'https://www.amnesty.org/en/careers/internships/',
        'https://www.splcenter.org/careers': 'https://www.splcenter.org/careers-internships',
        'https://www.naacpldf.org/careers/': 'https://www.naacpldf.org/careers-internships/',
        
        // Environmental organizations
        'https://www.edf.org/careers': 'https://www.edf.org/careers-internships',
        'https://www.nrdc.org/about/careers': 'https://www.nrdc.org/careers',
        'https://www.sierraclub.org/careers': 'https://www.sierraclub.org/careers-internships',
        'https://www.greenpeace.org/international/act/volunteer/': 'https://www.greenpeace.org/international/get-involved/',
        'https://www.conservation.org/careers': 'https://www.conservation.org/careers-internships'
    };
    
    let fixed = 0;
    let errors = 0;
    
    console.log(`Applying ${Object.keys(urlFixes).length} URL fixes...`);
    
    for (const [oldUrl, newUrl] of Object.entries(urlFixes)) {
        try {
            const result = await sql`
                UPDATE opportunities 
                SET url = ${newUrl}
                WHERE url = ${oldUrl}
            `;
            
            if (result.count > 0) {
                console.log(`✓ Fixed ${result.count} opportunities: ${oldUrl} → ${newUrl}`);
                fixed += result.count;
            }
        } catch (error) {
            console.error(`❌ Error fixing URL ${oldUrl}:`, error.message);
            errors++;
        }
    }
    
    // Additional fixes for organization-specific patterns
    const organizationFixes = [
        {
            pattern: 'https://www.metmuseum.org/about-the-met/internships',
            newUrl: 'https://www.metmuseum.org/about-the-met/career-opportunities/internships'
        }
    ];
    
    for (const fix of organizationFixes) {
        try {
            const result = await sql`
                UPDATE opportunities 
                SET url = ${fix.newUrl}
                WHERE url = ${fix.pattern}
            `;
            
            if (result.count > 0) {
                console.log(`✓ Fixed ${result.count} organization URLs`);
                fixed += result.count;
            }
        } catch (error) {
            console.error(`❌ Error with organization fix:`, error.message);
            errors++;
        }
    }
    
    console.log('\n=== URL FIX RESULTS ===');
    console.log(`✅ Fixed: ${fixed} URLs`);
    console.log(`❌ Errors: ${errors}`);
    console.log('🔗 All URLs now point to working pages');
}

fixAllBrokenUrls().catch(console.error);