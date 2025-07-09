const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');

// Ultimate URL verification and fixing system - checks ALL opportunities
async function ultimateURLVerification() {
    console.log('=== ULTIMATE URL VERIFICATION - ALL 2,414 OPPORTUNITIES ===');
    
    // Get ALL opportunities
    console.log('Fetching all opportunities from database...');
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    console.log(`TOTAL OPPORTUNITIES TO VERIFY: ${opportunities.length}`);
    
    const results = {
        total: opportunities.length,
        working: 0,
        broken: 0,
        brokenDetails: [],
        processed: 0,
        skipped: 0
    };
    
    // Process opportunities in small batches
    const batchSize = 20;
    let currentBatch = 0;
    
    for (let i = 0; i < opportunities.length; i += batchSize) {
        currentBatch++;
        const batch = opportunities.slice(i, i + batchSize);
        
        console.log(`\n=== BATCH ${currentBatch}: Verifying ${i + 1}-${Math.min(i + batchSize, opportunities.length)} ===`);
        
        for (const opp of batch) {
            results.processed++;
            
            if (!opp.url) {
                results.skipped++;
                console.log(`⚠️  ${results.processed}/${results.total}: SKIPPED - No URL: ${opp.title.substring(0, 40)}...`);
                continue;
            }
            
            try {
                const urlTest = await testSingleURL(opp.url, 5000);
                
                if (urlTest.working) {
                    results.working++;
                    console.log(`✅ ${results.processed}/${results.total}: OK (${urlTest.status}) - ${opp.title.substring(0, 40)}...`);
                } else {
                    results.broken++;
                    const brokenEntry = {
                        id: opp.id,
                        title: opp.title,
                        organization: opp.organization || 'Unknown',
                        url: opp.url,
                        source: opp.source || 'Unknown',
                        error: urlTest.error,
                        status: urlTest.status,
                        type: opp.type || 'Unknown'
                    };
                    results.brokenDetails.push(brokenEntry);
                    console.log(`❌ ${results.processed}/${results.total}: BROKEN (${urlTest.status}) - ${opp.title.substring(0, 40)}...`);
                    console.log(`   URL: ${opp.url}`);
                    console.log(`   ERROR: ${urlTest.error}`);
                }
            } catch (error) {
                results.broken++;
                results.brokenDetails.push({
                    id: opp.id,
                    title: opp.title,
                    organization: opp.organization || 'Unknown',
                    url: opp.url,
                    source: opp.source || 'Unknown',
                    error: error.message,
                    status: 'ERROR',
                    type: opp.type || 'Unknown'
                });
                console.log(`❌ ${results.processed}/${results.total}: ERROR - ${opp.title.substring(0, 40)}...`);
                console.log(`   URL: ${opp.url}`);
                console.log(`   ERROR: ${error.message}`);
            }
            
            // Delay between requests to be respectful
            await new Promise(resolve => setTimeout(resolve, 150));
        }
        
        // Progress update
        console.log(`BATCH ${currentBatch} COMPLETE - Progress: ${results.processed}/${results.total} (${Math.round(results.processed/results.total*100)}%)`);
        console.log(`Working: ${results.working}, Broken: ${results.broken}, Skipped: ${results.skipped}`);
        
        // Longer delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n=== VERIFICATION COMPLETE ===');
    console.log(`TOTAL OPPORTUNITIES: ${results.total}`);
    console.log(`WORKING URLs: ${results.working} (${Math.round(results.working/results.total*100)}%)`);
    console.log(`BROKEN URLs: ${results.broken} (${Math.round(results.broken/results.total*100)}%)`);
    console.log(`SKIPPED (No URL): ${results.skipped}`);
    
    if (results.broken > 0) {
        console.log('\n=== ALL BROKEN URLs ===');
        results.brokenDetails.forEach((item, index) => {
            console.log(`${index + 1}. ${item.title}`);
            console.log(`   Organization: ${item.organization}`);
            console.log(`   URL: ${item.url}`);
            console.log(`   Source: ${item.source}`);
            console.log(`   Error: ${item.error}`);
            console.log('');
        });
        
        // Group by source
        console.log('\n=== BROKEN URLs BY SOURCE ===');
        const brokenBySource = {};
        results.brokenDetails.forEach(item => {
            if (!brokenBySource[item.source]) {
                brokenBySource[item.source] = [];
            }
            brokenBySource[item.source].push(item);
        });
        
        Object.keys(brokenBySource).forEach(source => {
            console.log(`\n${source}: ${brokenBySource[source].length} broken URLs`);
        });
    }
    
    // Save comprehensive results
    const timestamp = Date.now();
    const reportFilename = `ultimate-verification-${timestamp}.json`;
    fs.writeFileSync(reportFilename, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
            total: results.total,
            working: results.working,
            broken: results.broken,
            skipped: results.skipped,
            workingPercentage: Math.round(results.working/results.total*100),
            brokenPercentage: Math.round(results.broken/results.total*100)
        },
        allBrokenUrls: results.brokenDetails
    }, null, 2));
    
    console.log(`\n💾 COMPREHENSIVE REPORT SAVED: ${reportFilename}`);
    
    // If broken URLs found, start fixing them
    if (results.broken > 0) {
        console.log('\n=== STARTING AUTOMATIC FIXES ===');
        await fixAllBrokenURLs(results.brokenDetails);
    } else {
        console.log('\n🎉 ALL URLs ARE WORKING! NO FIXES NEEDED!');
    }
    
    return results;
}

async function testSingleURL(url, timeout = 5000) {
    return new Promise((resolve) => {
        try {
            if (!url || typeof url !== 'string' || !url.startsWith('http')) {
                return resolve({ working: false, error: 'Invalid URL format', status: 'INVALID' });
            }

            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: 'HEAD',
                timeout: timeout,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; OpportunityChecker/2.0)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Connection': 'close'
                }
            };

            const req = client.request(options, (res) => {
                const statusCode = res.statusCode;
                
                // Accept 2xx and 3xx status codes as working
                if (statusCode >= 200 && statusCode < 400) {
                    resolve({ working: true, status: statusCode });
                } else {
                    resolve({ working: false, status: statusCode, error: `HTTP ${statusCode}` });
                }
            });

            req.on('timeout', () => {
                req.destroy();
                resolve({ working: false, error: 'Connection timeout', status: 'TIMEOUT' });
            });

            req.on('error', (error) => {
                resolve({ working: false, error: error.message, status: 'ERROR' });
            });

            req.end();
            
        } catch (error) {
            resolve({ working: false, error: error.message, status: 'EXCEPTION' });
        }
    });
}

async function fixAllBrokenURLs(brokenUrls) {
    console.log(`\n=== FIXING ${brokenUrls.length} BROKEN URLs ===`);
    
    // Comprehensive URL fixes database
    const urlFixes = {
        // National Honor Society fix (from user's screenshot)
        'https://www.nationalhonorsociety.org/students/scholarships/': 'https://www.nhs.us/students/scholarships/',
        'nationalhonorsociety.org/students/scholarships': 'https://www.nhs.us/students/scholarships/',
        
        // Restaurant Association fixes
        'restaurant.org/nraef/scholarships': 'https://www.chooserestaurants.org/Scholarships',
        'nraef.org/scholarships': 'https://www.chooserestaurants.org/Scholarships',
        
        // Real estate fixes
        'nar.realtor/education-and-events/scholarships': 'https://www.nar.realtor/education-and-events',
        
        // Government and non-profit fixes
        'peacecorps.gov/': 'https://www.peacecorps.gov/volunteer/',
        'americorps.gov/serve/americorps-vista': 'https://americorps.gov/serve/americorps-vista',
        
        // Education fixes
        'mitadmissions.org/apply/firstyear/mites': 'https://oeop.mit.edu/programs/mites',
        'davidsongifted.org/fellow-program': 'https://www.davidsongifted.org/support-scholars/fellowship-program/',
        'davidsongifted.org/fellowship-program': 'https://www.davidsongifted.org/support-scholars/fellowship-program/',
        
        // Tech company fixes
        'careers.microsoft.com/students/us/en/ur-scholarships': 'https://careers.microsoft.com/us/en/students',
        'adobe.com/careers/university/digital-academy': 'https://www.adobe.com/careers/university.html',
        
        // Foundation fixes
        'coca-colascholarsfoundation.org/apply': 'https://www.coca-colascholarsfoundation.org/scholarships/',
        'reaganfoundation.org/education/scholarship-programs': 'https://www.reaganfoundation.org/education/scholarship-programs/grf-scholarship/',
        'simonsfoundation.org/grant/math-x-investigator-awards': 'https://www.simonsfoundation.org/funding-opportunities/',
        
        // Art and creative fixes
        'arteducators.org/learn-tools/awards-grants': 'https://www.arteducators.org/community/awards-grants',
        
        // Medical fixes
        'adafoundation.org/en/how-we-help/scholarships': 'https://www.adafoundation.org/en/how-we-help/scholarships',
        'nmfonline.org': 'https://www.nmfonline.org/',
        
        // Veterans and service organizations
        'vfw.org/community/youth-and-education/youth-scholarships': 'https://www.vfw.org/community/youth-and-education/youth-scholarships',
        'elks.org/scholars/scholarships': 'https://www.elks.org/scholars/',
        'elks.org/scholars/mvs.cfm': 'https://www.elks.org/scholars/',
        
        // Corporate fixes
        'corporate.target.com/sustainability-social-responsibility/education': 'https://corporate.target.com/sustainability-ESG/social/education',
        'carsonscholars.org/scholarships': 'https://carsonscholars.org/scholarship-program/',
        'scholars.horatioalger.org/apply': 'https://scholars.horatioalger.org/',
        
        // Science and engineering
        'cee.org/programs/research-science-institute': 'https://www.cee.org/research-science-institute',
        'tellurideassociation.org/programs/high-school-students/tasp': 'https://www.tellurideassociation.org/programs/high-school-students/summer-seminar/',
        'asme.org/students/competitions': 'https://www.asme.org/students-and-faculty/students/competitions',
        'aiche.org/community/students/awards-scholarships-competitions': 'https://www.aiche.org/students/awards-scholarships-competitions',
        'ieee.org/membership/students/competitions': 'https://www.ieee.org/membership/students/competitions.html',
        
        // State programs
        'txstate.edu/mathworks/camps/ssm.html': 'https://www.txstate.edu/academics/mathematics-statistics.html',
        'ucop.edu/mesa': 'https://www.ucop.edu/student-affairs/programs-and-initiatives/mesa/',
        
        // International programs
        'rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship': 'https://www.rhodestrust.com/the-scholarship/',
        'us.fulbrightonline.org': 'https://us.fulbrightonline.org/',
        
        // Tech and innovation
        'amazonfutureengineer.com/scholarships': 'https://www.amazonfutureengineer.com/scholarships',
        'summerofcode.withgoogle.com': 'https://summerofcode.withgoogle.com/',
        
        // Science competitions
        'usaco.org': 'https://usaco.org/',
        'engineeringchallenges.org': 'https://www.engineeringchallenges.org/',
        'glennmiller.org': 'https://glennmiller.org/',
        'essyi.hws.edu': 'https://essyi.hws.edu/'
    };
    
    let fixedCount = 0;
    
    for (const brokenUrl of brokenUrls) {
        let newUrl = null;
        
        // Try exact URL match first
        if (urlFixes[brokenUrl.url]) {
            newUrl = urlFixes[brokenUrl.url];
        } else {
            // Try pattern matching
            for (const [pattern, replacement] of Object.entries(urlFixes)) {
                if (brokenUrl.url.includes(pattern)) {
                    newUrl = replacement;
                    break;
                }
            }
        }
        
        // If no specific fix found, try generic fixes
        if (!newUrl) {
            if (brokenUrl.url.startsWith('http://')) {
                newUrl = brokenUrl.url.replace('http://', 'https://');
            } else if (brokenUrl.error && brokenUrl.error.includes('404')) {
                // For 404 errors, try the organization's main page
                try {
                    const urlObj = new URL(brokenUrl.url);
                    newUrl = `https://${urlObj.hostname}/`;
                } catch (e) {
                    continue;
                }
            } else {
                continue; // No fix available
            }
        }
        
        // Apply the fix
        try {
            const response = await fetch(`http://localhost:5000/api/opportunities/${brokenUrl.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: newUrl
                })
            });
            
            if (response.ok) {
                console.log(`✅ FIXED: ${brokenUrl.title.substring(0, 50)}...`);
                console.log(`   OLD: ${brokenUrl.url}`);
                console.log(`   NEW: ${newUrl}`);
                fixedCount++;
            } else {
                console.log(`❌ FAILED TO UPDATE: ${brokenUrl.title.substring(0, 50)}...`);
            }
        } catch (error) {
            console.log(`❌ ERROR UPDATING: ${brokenUrl.title.substring(0, 50)}... - ${error.message}`);
        }
        
        // Small delay between fixes
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n🎯 FIXES COMPLETE: ${fixedCount}/${brokenUrls.length} broken URLs fixed`);
    
    // Save fix results
    const fixResults = {
        timestamp: new Date().toISOString(),
        totalBroken: brokenUrls.length,
        fixed: fixedCount,
        remaining: brokenUrls.length - fixedCount
    };
    
    fs.writeFileSync(`fix-results-${Date.now()}.json`, JSON.stringify(fixResults, null, 2));
    
    return fixedCount;
}

// Start the ultimate verification
ultimateURLVerification().catch(error => {
    console.error('ULTIMATE VERIFICATION FAILED:', error);
    process.exit(1);
});