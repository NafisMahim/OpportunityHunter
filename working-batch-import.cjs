const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function workingBatchImport() {
    console.log('🔧 WORKING BATCH IMPORT - Using safe SQL syntax 🔧\n');
    
    const allOpportunities = JSON.parse(fs.readFileSync('quick-extracted-opportunities.json', 'utf8'));
    console.log(`📊 Loaded ${allOpportunities.length} total opportunities`);
    
    // Get existing titles to avoid duplicates
    const existing = await sql`SELECT title FROM opportunities`;
    const existingTitles = new Set(existing.map(row => row.title.toLowerCase().trim()));
    
    // Filter for unique opportunities
    const uniqueOpportunities = [];
    for (const opp of allOpportunities) {
        const titleKey = opp.title.toLowerCase().trim();
        if (!existingTitles.has(titleKey) && opp.title.length > 5) {
            uniqueOpportunities.push(opp);
            existingTitles.add(titleKey);
            if (uniqueOpportunities.length >= 5000) break; // Limit to 5000 for efficiency
        }
    }
    
    console.log(`🎯 Will import ${uniqueOpportunities.length} unique opportunities`);
    
    let imported = 0;
    let errors = 0;
    
    // Import one by one with proper SQL escaping
    for (let i = 0; i < uniqueOpportunities.length; i++) {
        const opp = uniqueOpportunities[i];
        
        try {
            const title = opp.title || 'Academic Opportunity';
            const description = opp.description || `${title} - Check website for details`;
            const type = opp.type || 'internship';
            const location = opp.location || 'Various';
            const url = opp.url || `https://www.google.com/search?q=${encodeURIComponent(title + ' application')}`;
            const deadline = opp.deadline || 'Check website';
            const source = opp.source || 'CSV Import';
            const requirements = ['Check requirements'];
            const tags = [];
            
            await sql`
                INSERT INTO opportunities (
                    title, description, type, location, url, deadline, requirements, source, tags
                ) VALUES (
                    ${title}, ${description}, ${type}, ${location}, ${url}, ${deadline}, ${requirements}, ${source}, ${tags}
                )
            `;
            
            imported++;
            
            if (imported % 100 === 0) {
                console.log(`✅ Progress: ${imported}/${uniqueOpportunities.length} imported`);
            }
            
        } catch (error) {
            console.error(`❌ Error importing "${opp.title}": ${error.message}`);
            errors++;
        }
    }
    
    const finalCount = await sql`SELECT COUNT(*) as count FROM opportunities`;
    
    console.log(`\n🎉 WORKING BATCH IMPORT COMPLETE! 🎉`);
    console.log(`✅ Successfully imported: ${imported} opportunities`);
    console.log(`❌ Errors: ${errors} opportunities`);
    console.log(`📊 Total database size: ${finalCount[0].count} opportunities`);
    
    return finalCount[0].count;
}

if (require.main === module) {
    workingBatchImport().catch(console.error);
}

module.exports = { workingBatchImport };