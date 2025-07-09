// Fix all 40 URLs flagged as "YES" in the CSV with proper working URLs
async function fixAllFlaggedURLs() {
    console.log('=== FIXING ALL 40 FLAGGED URLs FROM CSV ===');
    
    const urlFixes = [
        // NYC Organizations
        {
            title: 'Beginning with Children Legacy Network',
            broken: 'https://Academic Prep',
            fixed: 'https://www.beginningwithchildren.org/',
            reason: 'Fixed placeholder with actual organization URL'
        },
        {
            title: 'Free After-School & Summer Programs (via DiscoverDYCD)',
            broken: 'https://After School/Summer',
            fixed: 'https://www.nyc.gov/site/dycd/services/after-school/discover-dycd.page',
            reason: 'Fixed placeholder with NYC DYCD discover page'
        },
        {
            title: 'Fresh Air Fund Summer Camps',
            broken: 'https://Summer',
            fixed: 'https://www.freshair.org/our-programs/summer-camps/',
            reason: 'Fixed placeholder with Fresh Air Fund summer camps page'
        },
        {
            title: 'Garden Kitchen Labs with NYC Parks',
            broken: 'https://Humanities/Science',
            fixed: 'https://www.nycgovparks.org/programs/rangers/garden-kitchen-labs',
            reason: 'Fixed placeholder with NYC Parks garden labs page'
        },
        {
            title: 'Harlem Grown',
            broken: 'https://Weekends',
            fixed: 'https://www.harlemgrown.org/',
            reason: 'Fixed placeholder with Harlem Grown main website'
        },
        {
            title: 'Rocking the Boat: Rowing',
            broken: 'https://Sports/Science',
            fixed: 'https://www.rockingtheboat.org/',
            reason: 'Fixed placeholder with Rocking the Boat main website'
        },
        {
            title: 'Teachoo: Learn Math',
            broken: 'https://Math, Science, Humanities, Academic Prep',
            fixed: 'https://www.teachoo.com/',
            reason: 'Fixed placeholder with Teachoo main website'
        },
        
        // Prestigious STEM Programs
        {
            title: 'MIT PRIMES',
            broken: 'https://Year-long (starts January)',
            fixed: 'https://math.mit.edu/research/highschool/primes/',
            reason: 'Fixed placeholder with MIT PRIMES official page'
        },
        {
            title: 'MITES & MOSTEC',
            broken: 'https://Engineering/Science',
            fixed: 'https://oeop.mit.edu/programs/mites',
            reason: 'Fixed placeholder with MIT MITES program page'
        },
        {
            title: 'NASA SEES',
            broken: 'https://Earth/Space Sciences',
            fixed: 'https://www.nasa.gov/audience/forstudents/postsecondary/features/F_NASA_SEES_Internship_Program.html',
            reason: 'Fixed placeholder with NASA SEES program page'
        },
        {
            title: 'Hutton Junior Fisheries',
            broken: 'https://Free + $3',
            fixed: 'https://fish.uw.edu/students/junior-fisheries-biology-program/',
            reason: 'Fixed placeholder with UW Fisheries program page'
        },
        {
            title: 'NIST SHIP',
            broken: 'https://Engineering/IT/Physics',
            fixed: 'https://www.nist.gov/careers/student-opportunities/summer-high-school-intern-program-ship',
            reason: 'Fixed placeholder with NIST SHIP official page'
        },
        {
            title: 'NIH HiSTEP',
            broken: 'https://5 weeks (late June-July)',
            fixed: 'https://www.training.nih.gov/programs/histep',
            reason: 'Fixed placeholder with NIH HiSTEP program page'
        },
        {
            title: 'Navy SEAP',
            broken: 'https://8 weeks (June-August)',
            fixed: 'https://www.navsea.navy.mil/Our-Team/STEM-Education/SEAP/',
            reason: 'Fixed placeholder with Navy SEAP official page'
        },
        {
            title: 'MIT Beaver Works',
            broken: 'https://4 weeks (July)',
            fixed: 'https://beaverworks.ll.mit.edu/CMS/bw/bwsi',
            reason: 'Fixed placeholder with MIT Beaver Works Summer Institute'
        },
        {
            title: 'Girls Who Code SIP',
            broken: 'https://Free',
            fixed: 'https://girlswhocode.com/programs/summer-immersion-program',
            reason: 'Fixed placeholder with Girls Who Code SIP page'
        },
        {
            title: 'LaunchX',
            broken: 'https://Entrepreneurship',
            fixed: 'https://launchx.org/',
            reason: 'Fixed placeholder with LaunchX main website'
        },
        {
            title: 'Google Science Fair',
            broken: 'https://Finals July',
            fixed: 'https://www.googlesciencefair.com/',
            reason: 'Fixed placeholder with Google Science Fair website'
        },
        
        // Competitions & Challenges
        {
            title: 'Conrad Challenge',
            broken: 'https://Aug-Oct registration',
            fixed: 'https://www.conradchallenge.org/',
            reason: 'Fixed placeholder with Conrad Challenge main website'
        },
        {
            title: 'Diamond Challenge',
            broken: 'https://Jan submission',
            fixed: 'https://diamondchallenge.org/',
            reason: 'Fixed placeholder with Diamond Challenge main website'
        },
        {
            title: 'CyberPatriot',
            broken: 'https://National Finals April',
            fixed: 'https://www.uscyberpatriot.org/',
            reason: 'Fixed placeholder with CyberPatriot main website'
        },
        {
            title: 'National Youth Science Camp',
            broken: 'https://July-August',
            fixed: 'https://www.nysc.org/',
            reason: 'Fixed placeholder with NYSC main website'
        },
        {
            title: 'Smithsonian YAP',
            broken: 'https://June-July',
            fixed: 'https://www.si.edu/ofi/internship-opportunities',
            reason: 'Fixed placeholder with Smithsonian internship page'
        },
        {
            title: 'USSYP',
            broken: 'https://March (DC week)',
            fixed: 'https://www.ussyp.org/',
            reason: 'Fixed placeholder with USSYP main website'
        },
        {
            title: 'Bank of America Leaders',
            broken: 'https://8 weeks summer + July summit',
            fixed: 'https://about.bankofamerica.com/en/making-an-impact/student-leaders',
            reason: 'Fixed placeholder with Bank of America Student Leaders page'
        },
        {
            title: 'U.S. Senate Page',
            broken: 'https://Summer/fall/spring sessions',
            fixed: 'https://www.senate.gov/reference/common/faq/Pages.htm',
            reason: 'Fixed placeholder with US Senate Page program information'
        },
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
            opp.url === urlFix.broken || opp.title === urlFix.title
        );
        
        if (matchingOpps.length > 0) {
            console.log(`\nFound ${matchingOpps.length} opportunities for: ${urlFix.title}`);
            
            for (const opp of matchingOpps) {
                console.log(`Fixing: ${opp.title}`);
                console.log(`  OLD: ${opp.url}`);
                console.log(`  NEW: ${urlFix.fixed}`);
                console.log(`  REASON: ${urlFix.reason}`);
                
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
            console.log(`❌ NOT FOUND: ${urlFix.title} with URL: ${urlFix.broken}`);
            notFoundCount++;
        }
    }
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`✅ FIXED: ${fixedCount} URLs`);
    console.log(`❌ NOT FOUND: ${notFoundCount} URLs`);
    console.log(`📊 TOTAL PROCESSED: ${urlFixes.length} flagged URLs`);
    
    return { fixedCount, notFoundCount, totalProcessed: urlFixes.length };
}

fixAllFlaggedURLs().catch(console.error);