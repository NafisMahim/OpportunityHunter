// Fix the final 15 opportunities with truncated/incomplete URLs
async function fixFinal15TruncatedURLs() {
    console.log('=== FIXING FINAL 15 TRUNCATED URLs ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    // Fixes for truncated and problematic URLs
    const fixes = [
        {
            title: 'Financial Aid Deadline Approaching:',
            issue: 'Contains "deadline" - likely truncated title',
            action: 'delete',
            reason: 'Invalid title format'
        },
        {
            title: 'Deadline Approaching: Manhattan College Summer Engineering',
            newUrl: 'https://manhattan.edu/academics/schools-and-programs/engineering/pre-college-programs',
            reason: 'Fixed to Manhattan College engineering programs page'
        },
        {
            title: 'Teen Life Online Summer Programs Fair',
            newUrl: 'https://www.teenlife.com/events',
            reason: 'Fixed to TeenLife events main page'
        },
        {
            title: 'Deadline Approaching: Return2College (R2C) Scholarship',
            newUrl: 'https://www.return2college.com/',
            reason: 'Fixed to Return2College main website'
        },
        {
            title: 'TeenLife LIVE Performing & Visual Arts Virtual Fair',
            newUrl: 'https://www.teenlife.com/events',
            reason: 'Fixed to TeenLife events main page'
        },
        {
            title: 'Congressional App Challenge 2024',
            newUrl: 'https://www.congressionalappchallenge.us/',
            reason: 'Fixed to Congressional App Challenge main website'
        },
        {
            title: 'Manhattan College Summer Engineering Awareness Program',
            newUrl: 'https://manhattan.edu/academics/schools-and-programs/engineering/pre-college-programs',
            reason: 'Fixed to Manhattan College engineering programs page'
        },
        {
            title: 'Event Approaching: Create Your Personal Brand Workshops',
            newUrl: 'https://www.eventbrite.com/',
            reason: 'Fixed to Eventbrite main page'
        },
        {
            title: 'Litchfield Jazz Camp & Scholarship Opportunity',
            newUrl: 'https://litchfieldjazzcamp.com/',
            reason: 'Fixed to Litchfield Jazz Camp main website'
        },
        {
            title: 'Create Real Impact Contest',
            newUrl: 'https://www.createrealimpact.com/',
            reason: 'Fixed to Create Real Impact main website'
        },
        {
            title: 'Cooper Hewitt Design Career Fair',
            newUrl: 'https://www.cooperhewitt.org/',
            reason: 'Fixed to Cooper Hewitt main website'
        },
        {
            title: 'TryEngineering Summer Institute Program',
            newUrl: 'https://tryengineeringinstitute.ieee.org/',
            reason: 'Fixed to TryEngineering Institute main website'
        },
        {
            title: 'Deadline Approaching: Create Real Impact Contest',
            newUrl: 'https://www.createrealimpact.com/',
            reason: 'Fixed to Create Real Impact main website'
        },
        {
            title: 'Deadline Approaching: TryEngineering Summer Institute Program',
            newUrl: 'https://tryengineeringinstitute.ieee.org/',
            reason: 'Fixed to TryEngineering Institute main website'
        },
        {
            title: 'Youth Communication Immigrant Youth Webinar',
            newUrl: 'https://www.youthcomm.org/',
            reason: 'Fixed to Youth Communication main website'
        }
    ];
    
    let fixedCount = 0;
    let deletedCount = 0;
    
    for (const fix of fixes) {
        const matchingOpps = opportunities.filter(opp => 
            opp.title.includes(fix.title) || opp.title === fix.title
        );
        
        if (matchingOpps.length > 0) {
            for (const opp of matchingOpps) {
                if (fix.action === 'delete') {
                    console.log(`🗑️ DELETING: ${opp.title} (${fix.reason})`);
                    try {
                        const deleteResponse = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
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
                    console.log(`🔧 FIXING: ${opp.title}`);
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
                }
            }
        } else {
            console.log(`❌ NOT FOUND: ${fix.title}`);
        }
    }
    
    console.log(`\n=== FINAL CLEANUP SUMMARY ===`);
    console.log(`🔧 Fixed URLs: ${fixedCount}`);
    console.log(`🗑️ Deleted invalid entries: ${deletedCount}`);
    console.log(`📊 Total processed: ${fixedCount + deletedCount}`);
    
    return { fixedCount, deletedCount };
}

fixFinal15TruncatedURLs().catch(console.error);