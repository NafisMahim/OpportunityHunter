// Final accurate status check - only flag actual URL problems
async function finalAccurateStatusCheck() {
    console.log('=== FINAL ACCURATE STATUS CHECK ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    let flaggedCount = 0;
    let missingCount = 0;
    let fineCount = 0;
    
    console.log('\n🔍 SCANNING FOR ACTUAL URL PROBLEMS...\n');
    
    for (const opp of opportunities) {
        let status = 'FINE';
        let issues = [];
        
        // Check for actual placeholder URLs (in the URL field, not title)
        if (opp.url && (
            opp.url.includes('Academic Prep') ||
            opp.url.includes('After School/Summer') ||
            opp.url === 'https://Summer' ||
            opp.url.includes('Humanities/Science') ||
            opp.url === 'https://Weekends' ||
            opp.url.includes('Sports/Science') ||
            opp.url.includes('Year-long (starts January)') ||
            opp.url.includes('Engineering/Science') ||
            opp.url.includes('Earth/Space Sciences') ||
            opp.url.includes('Free + $3') ||
            opp.url.includes('Engineering/IT/Physics') ||
            opp.url.includes('weeks (late June-July)') ||
            opp.url.includes('weeks (June-August)') ||
            opp.url.includes('weeks (July)') ||
            opp.url === 'https://Free' ||
            opp.url.includes('Finals July') ||
            opp.url.includes('registration') ||
            opp.url.includes('submission') ||
            opp.url.includes('National Finals') ||
            opp.url.includes('July-August') ||
            opp.url.includes('June-July') ||
            opp.url.includes('March (DC week)') ||
            opp.url.includes('summer + July summit')
        )) {
            status = 'FLAGGED';
            issues.push('actual placeholder URL');
        }
        
        // Check for corrupted data
        if (opp.title.includes('IFQ') ||
            opp.title.includes('<rdf:li') ||
            opp.title.includes('<</CreationDate') ||
            opp.title.includes('<</Subtype/Link') ||
            opp.title.includes('"""New:') ||
            opp.title.includes('document viewer') ||
            opp.title.includes('Producer(KamiHQ')
        ) {
            status = 'MISSING';
            issues.push('corrupted data');
        }
        
        // Check for missing or invalid URLs
        if (!opp.url || opp.url.length < 10 || !opp.url.includes('.')) {
            status = 'MISSING';
            issues.push('no valid URL');
        }
        
        // Check for actually suspicious URLs
        if (opp.url && (
            opp.url.includes('example.com') ||
            opp.url.includes('placeholder') ||
            opp.url.includes('contact-for-details') ||
            opp.url.startsWith('http://http') ||
            opp.url.includes('google.com/search') ||
            opp.url.includes('bit.ly') ||
            opp.url.includes('tinyurl') ||
            opp.url === 'https://' ||
            opp.url.endsWith('https://') ||
            opp.url.includes('varies by region') ||
            opp.url.includes('~$') ||
            opp.url.includes('deadline') ||
            opp.url.includes('date varies')
        )) {
            status = 'FLAGGED';
            issues.push('suspicious URL pattern');
        }
        
        // Count by status and only report actual problems
        switch(status) {
            case 'FLAGGED':
                flaggedCount++;
                console.log(`❌ FLAGGED: ${opp.title}`);
                console.log(`   URL: ${opp.url}`);
                console.log(`   ISSUE: ${issues.join(', ')}`);
                console.log('');
                break;
            case 'MISSING':
                missingCount++;
                console.log(`🚫 MISSING: ${opp.title}`);
                console.log(`   URL: ${opp.url || 'NO URL'}`);
                console.log(`   ISSUE: ${issues.join(', ')}`);
                console.log('');
                break;
            default:
                fineCount++;
                break;
        }
    }
    
    console.log(`\n=== FINAL STATUS SUMMARY ===`);
    console.log(`✅ FINE: ${fineCount} opportunities`);
    console.log(`❌ FLAGGED: ${flaggedCount} opportunities (actual URL problems)`);
    console.log(`🚫 MISSING: ${missingCount} opportunities (need deletion or major fixes)`);
    console.log(`📊 TOTAL: ${opportunities.length} opportunities`);
    
    const successRate = ((fineCount / opportunities.length) * 100).toFixed(1);
    console.log(`🎯 SUCCESS RATE: ${successRate}%`);
    
    if (flaggedCount === 0 && missingCount === 0) {
        console.log('\n🎉 PERFECT! All opportunities have valid URLs!');
    } else {
        console.log(`\n🔧 REMAINING ISSUES: ${flaggedCount + missingCount} opportunities need attention`);
    }
    
    return {
        fine: fineCount,
        flagged: flaggedCount, 
        missing: missingCount,
        total: opportunities.length,
        successRate: parseFloat(successRate)
    };
}

finalAccurateStatusCheck().catch(console.error);