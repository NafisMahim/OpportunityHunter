// Comprehensive status check against the CSV categories
async function comprehensiveStatusCheck() {
    console.log('=== COMPREHENSIVE DATABASE STATUS CHECK ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    let flaggedCount = 0;
    let missingCount = 0;
    let fineCount = 0;
    let suspiciousCount = 0;
    
    // Check for remaining placeholder patterns
    const placeholderPatterns = [
        'Academic Prep', 'After School/Summer', 'https://Summer', 'Humanities/Science',
        'https://Weekends', 'Sports/Science', 'Year-long (starts January)',
        'Engineering/Science', 'Earth/Space Sciences', 'Free + $3',
        'Engineering/IT/Physics', '5 weeks (late June-July)', '8 weeks (June-August)',
        '4 weeks (July)', 'https://Free', 'Entrepreneurship', 'Finals July'
    ];
    
    // Check for corrupted/missing data patterns
    const corruptedPatterns = [
        'IFQ', '<rdf:li', '<</CreationDate', '<</Subtype/Link',
        '"""New:', 'document viewer', 'Producer(KamiHQ'
    ];
    
    console.log('\n🔍 SCANNING ALL OPPORTUNITIES...\n');
    
    for (const opp of opportunities) {
        let status = 'FINE';
        let issues = [];
        
        // Check for placeholder URLs
        if (placeholderPatterns.some(pattern => 
            (opp.url && opp.url.includes(pattern)) || 
            opp.title.includes(pattern)
        )) {
            status = 'FLAGGED';
            issues.push('placeholder URL');
        }
        
        // Check for corrupted data
        if (corruptedPatterns.some(pattern => 
            opp.title.includes(pattern) || 
            (opp.url && opp.url.includes(pattern))
        )) {
            status = 'MISSING';
            issues.push('corrupted data');
        }
        
        // Check for missing or invalid URLs
        if (!opp.url || opp.url.length < 10 || !opp.url.includes('.')) {
            status = 'MISSING';
            issues.push('no valid URL');
        }
        
        // Check for suspicious URLs
        if (opp.url && (
            opp.url.includes('example.com') ||
            opp.url.includes('placeholder') ||
            opp.url.includes('contact-for-details') ||
            opp.url.startsWith('http://http') ||
            opp.url.includes('google.com/search')
        )) {
            status = 'FLAGGED';
            issues.push('suspicious URL');
        }
        
        // Count by status
        switch(status) {
            case 'FLAGGED':
                flaggedCount++;
                console.log(`❌ FLAGGED: ${opp.title} - ${issues.join(', ')}`);
                console.log(`   URL: ${opp.url}`);
                break;
            case 'MISSING':
                missingCount++;
                console.log(`🚫 MISSING: ${opp.title} - ${issues.join(', ')}`);
                console.log(`   URL: ${opp.url || 'NO URL'}`);
                break;
            default:
                fineCount++;
                break;
        }
        
        // Additional suspicious checks
        if (status === 'FINE' && opp.url && (
            opp.url.length > 200 ||
            opp.title.length > 150 ||
            opp.title.includes('<') ||
            opp.title.includes('xml:')
        )) {
            suspiciousCount++;
            console.log(`⚠️ SUSPICIOUS: ${opp.title.substring(0, 80)}...`);
        }
    }
    
    console.log(`\n=== STATUS SUMMARY ===`);
    console.log(`✅ FINE: ${fineCount} opportunities`);
    console.log(`❌ FLAGGED: ${flaggedCount} opportunities (need URL fixes)`);
    console.log(`🚫 MISSING: ${missingCount} opportunities (need deletion or major fixes)`);
    console.log(`⚠️ SUSPICIOUS: ${suspiciousCount} opportunities (need review)`);
    console.log(`📊 TOTAL: ${opportunities.length} opportunities`);
    
    const successRate = ((fineCount / opportunities.length) * 100).toFixed(1);
    console.log(`🎯 SUCCESS RATE: ${successRate}%`);
    
    if (flaggedCount === 0 && missingCount === 0) {
        console.log('\n🎉 PERFECT! All opportunities have valid URLs!');
    } else {
        console.log(`\n🔧 ACTION NEEDED: ${flaggedCount + missingCount} opportunities need attention`);
    }
    
    return {
        fine: fineCount,
        flagged: flaggedCount, 
        missing: missingCount,
        suspicious: suspiciousCount,
        total: opportunities.length,
        successRate: parseFloat(successRate)
    };
}

comprehensiveStatusCheck().catch(console.error);