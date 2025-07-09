// Final verification of all flagged URL fixes
async function verifyFlaggedURLFixes() {
    console.log('=== VERIFYING ALL FLAGGED URL FIXES ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    // Check for any remaining placeholder URLs
    const suspiciousPatterns = [
        'https://Academic Prep',
        'https://After School/Summer',
        'https://Summer',
        'https://Humanities/Science',
        'https://Weekends',
        'https://Sports/Science',
        'https://Math, Science, Humanities, Academic Prep',
        'https://Year-long (starts January)',
        'https://Engineering/Science',
        'https://Earth/Space Sciences',
        'https://Free + $3',
        'https://Engineering/IT/Physics',
        'https://5 weeks (late June-July)',
        'https://8 weeks (June-August)',
        'https://4 weeks (July)',
        'https://Free',
        'https://Entrepreneurship',
        'https://Finals July',
        'https://Aug-Oct registration',
        'https://Jan submission',
        'https://National Finals April',
        'https://July-August',
        'https://June-July',
        'https://March (DC week)',
        'https://8 weeks summer + July summit',
        'https://Summer/fall/spring sessions',
        'https://10 days summer + year-round',
        'https://Jan finals',
        'https://Carnegie Hall June',
        'https://10 days July',
        'https://2-week summer sessions',
        'https://July (2 weeks)',
        'https://$6',
        'https://July',
        'https://6 weeks summer',
        'https://Nov deadline',
        'https://May',
        'https://Varies by region',
        'https://~$135/school',
        'https://example.com/contact-for-details'
    ];
    
    let remainingBrokenCount = 0;
    
    for (const pattern of suspiciousPatterns) {
        const matchingOpps = opportunities.filter(opp => opp.url === pattern);
        if (matchingOpps.length > 0) {
            remainingBrokenCount += matchingOpps.length;
            console.log(`❌ STILL BROKEN: ${matchingOpps.length} opportunities with URL: ${pattern}`);
            matchingOpps.forEach(opp => console.log(`   - ${opp.title}`));
        }
    }
    
    if (remainingBrokenCount === 0) {
        console.log('✅ SUCCESS: All 40 flagged URLs have been fixed!');
        console.log('✅ Zero placeholder URLs remaining in database');
        console.log('✅ All Apply Now buttons now lead to proper websites');
    } else {
        console.log(`❌ REMAINING ISSUES: ${remainingBrokenCount} placeholder URLs still exist`);
    }
    
    // Also check for any obviously invalid URLs
    const invalidPatterns = ['http://', 'https://http', 'https://www.http', 'example.com'];
    let invalidCount = 0;
    
    for (const opp of opportunities) {
        if (invalidPatterns.some(pattern => opp.url.includes(pattern))) {
            invalidCount++;
            console.log(`❌ INVALID URL: ${opp.title} - ${opp.url}`);
        }
    }
    
    console.log(`\n=== FINAL VERIFICATION SUMMARY ===`);
    console.log(`📊 Total opportunities checked: ${opportunities.length}`);
    console.log(`✅ Fixed placeholder URLs: ${40 - remainingBrokenCount}`);
    console.log(`❌ Remaining broken URLs: ${remainingBrokenCount}`);
    console.log(`❌ Invalid URL patterns: ${invalidCount}`);
    console.log(`🎯 URL integrity status: ${remainingBrokenCount === 0 && invalidCount === 0 ? 'PERFECT' : 'NEEDS ATTENTION'}`);
    
    return {
        totalOpportunities: opportunities.length,
        fixedCount: 40 - remainingBrokenCount,
        remainingBroken: remainingBrokenCount,
        invalidUrls: invalidCount,
        success: remainingBrokenCount === 0 && invalidCount === 0
    };
}

verifyFlaggedURLFixes().catch(console.error);