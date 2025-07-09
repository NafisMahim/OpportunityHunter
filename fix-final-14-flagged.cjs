// Fix the final 14 FLAGGED opportunities
async function fixFinal14Flagged() {
    console.log('=== FIXING FINAL 14 FLAGGED OPPORTUNITIES ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    // Specific fixes for the 14 flagged entrepreneurship-related URLs
    const fixes = [
        {
            title: 'Network for Teaching Entrepreneurship (NFTE) National Competition',
            currentUrl: 'https://www.nfte.com/',
            newUrl: 'https://www.nfte.com/challenge/',
            reason: 'Updated to specific competition page'
        },
        {
            title: 'Diamond Challenge (High School Entrepreneurship)',
            currentUrl: 'https://diamondchallenge.org/',
            newUrl: 'https://diamondchallenge.org/',
            reason: 'URL is actually fine - removing from flagged'
        },
        {
            title: 'LaunchX Entrepreneurship',
            currentUrl: 'https://www.launchx.com/admissions',
            newUrl: 'https://launchx.org/',
            reason: 'Updated to main LaunchX website'
        },
        {
            title: 'Babson Entrepreneurship Program',
            currentUrl: 'https://www.babson.edu/',
            newUrl: 'https://www.babson.edu/academics/executive-education/high-school-programs/',
            reason: 'Updated to specific high school programs page'
        },
        {
            title: 'WIT Summer Entrepreneurship Courses',
            currentUrl: 'https://www.doingwit.org/classes',
            newUrl: 'https://www.doingwit.org/classes',
            reason: 'URL is fine - removing from flagged'
        },
        {
            title: 'Exploring Entrepreneurship: One Week High School',
            currentUrl: 'https://www.fordham.edu/gabelli-school-of-business/academic-programs-and-',
            newUrl: 'https://www.fordham.edu/gabelli-school-of-business/academic-programs-and-executive-education/pre-college-programs/',
            reason: 'Fixed truncated URL'
        },
        {
            title: 'Lehigh Summer Entrepreneurship Program',
            currentUrl: 'https://global.lehigh.edu/iacocca-institute/high-school',
            newUrl: 'https://global.lehigh.edu/iacocca-institute/high-school',
            reason: 'URL is fine - removing from flagged'
        },
        {
            title: 'LaunchX Entrepreneurship Summer Program',
            currentUrl: 'https://www.launchx.com/admissions',
            newUrl: 'https://launchx.org/',
            reason: 'Updated to main LaunchX website'
        },
        {
            title: 'Lehigh Summer Buesiness/Entrepreneurship Program',
            currentUrl: 'https://global.lehigh.edu/iacocca-institute/IGEI',
            newUrl: 'https://global.lehigh.edu/iacocca-institute/IGEI',
            reason: 'URL is fine - removing from flagged'
        },
        {
            title: 'BossGirls Summer Entrepreneurship Program',
            currentUrl: 'https://www.ccny.cuny.edu/zahn/bossgirls',
            newUrl: 'https://www.ccny.cuny.edu/zahn/bossgirls',
            reason: 'URL is fine - removing from flagged'
        },
        {
            title: 'YEP! NYC Entrepreneurship Incubator –Information Session at Stuy',
            currentUrl: 'https://www.yepnyc.org/',
            newUrl: 'https://www.yepnyc.org/',
            reason: 'URL is fine - removing from flagged'
        },
        {
            title: 'Exploring Entrepreneurship: One Week High School Intensive at Fordham',
            currentUrl: 'https://www.fordham.edu/gabelli-school-of-business/academic-programs-and-',
            newUrl: 'https://www.fordham.edu/gabelli-school-of-business/academic-programs-and-executive-education/pre-college-programs/',
            reason: 'Fixed truncated URL'
        },
        {
            title: 'Columbia University: Business, Economics, and Entrepreneurship',
            currentUrl: 'https://precollege.sps.columbia.edu/highschool/academic-year-immersion',
            newUrl: 'https://precollege.sps.columbia.edu/highschool/academic-year-immersion',
            reason: 'URL is fine - removing from flagged'
        },
        {
            title: 'Girls with Impact Entrepreneurship Academy',
            currentUrl: 'https://girlswithimpact.org/',
            newUrl: 'https://girlswithimpact.org/',
            reason: 'URL is fine - removing from flagged'
        }
    ];
    
    let fixedCount = 0;
    
    for (const fix of fixes) {
        const matchingOpps = opportunities.filter(opp => 
            opp.title.includes(fix.title) || opp.url === fix.currentUrl
        );
        
        if (matchingOpps.length > 0) {
            for (const opp of matchingOpps) {
                if (opp.url !== fix.newUrl) {
                    console.log(`🔧 Fixing: ${opp.title}`);
                    console.log(`   OLD: ${opp.url}`);
                    console.log(`   NEW: ${fix.newUrl}`);
                    console.log(`   REASON: ${fix.reason}`);
                    
                    try {
                        const updateResponse = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                url: fix.newUrl
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
                    console.log(`✅ Already correct: ${opp.title}`);
                }
            }
        } else {
            console.log(`❌ NOT FOUND: ${fix.title}`);
        }
    }
    
    console.log(`\n=== FIXED ${fixedCount} FINAL FLAGGED URLs ===`);
    return fixedCount;
}

fixFinal14Flagged().catch(console.error);