const fs = require('fs');

// Fix the comprehensive opportunities to match database schema
function fixComprehensiveOpportunities() {
    console.log('=== FIXING COMPREHENSIVE OPPORTUNITIES SCHEMA ===');
    
    const opportunities = JSON.parse(fs.readFileSync('./comprehensive-new-opportunities.json', 'utf-8'));
    console.log(`📊 Found ${opportunities.length} opportunities to fix`);
    
    const fixedOpportunities = opportunities.map(opp => {
        return {
            title: opp.title,
            description: opp.description,
            type: opp.type,
            location: opp.location,
            salary: opp.cost || null,
            amount: null,
            prize: opp.cost && opp.cost.includes('$') ? opp.cost : null,
            organization: opp.organization,
            source: "Web Research 2025", // Required field
            deadline: opp.deadline,
            url: opp.applicationUrl, // Fix field name
            relevancyScore: 95, // High relevancy for manually researched opportunities
            requirements: [opp.requirements], // Convert string to array
            tags: [opp.category], // Use category as tag
            categories: [opp.category],
            isRemote: opp.isRemote
        };
    });
    
    // Save fixed opportunities
    fs.writeFileSync('./comprehensive-new-opportunities-fixed.json', JSON.stringify(fixedOpportunities, null, 2));
    console.log('✅ Fixed opportunities saved to comprehensive-new-opportunities-fixed.json');
}

fixComprehensiveOpportunities();