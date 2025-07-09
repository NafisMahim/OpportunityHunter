const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function ultraFastImport() {
    console.log('⚡ ULTRA-FAST IMPORT - Adding 10,000 opportunities immediately ⚡\n');
    
    // Load opportunities
    const allOpportunities = JSON.parse(fs.readFileSync('quick-extracted-opportunities.json', 'utf8'));
    console.log(`📊 Loaded ${allOpportunities.length} total opportunities`);
    
    // Take first 10,000 unique opportunities
    const seen = new Set();
    const uniqueOpportunities = [];
    
    for (const opp of allOpportunities) {
        const key = opp.title.toLowerCase().trim();
        if (!seen.has(key) && opp.title.length > 5) {
            seen.add(key);
            uniqueOpportunities.push(opp);
            if (uniqueOpportunities.length >= 10000) break;
        }
    }
    
    console.log(`🎯 Processing ${uniqueOpportunities.length} unique opportunities`);
    
    // Build massive INSERT query
    const values = uniqueOpportunities.map(opp => {
        const title = (opp.title || 'Academic Opportunity').replace(/'/g, "''");
        const description = (opp.description || `${opp.title} - Check website for details`).replace(/'/g, "''");
        const type = opp.type || 'internship';
        const location = (opp.location || 'Various').replace(/'/g, "''");
        const url = opp.url || `https://www.google.com/search?q=${encodeURIComponent(opp.title + ' application')}`;
        const deadline = (opp.deadline || 'Check website').replace(/'/g, "''");
        const source = (opp.source || 'CSV Import').replace(/'/g, "''");
        
        return `('${title}', '${description}', '${type}', '${location}', '${url}', '${deadline}', ARRAY['Check requirements'], '${source}', ARRAY[]::text[])`;
    });
    
    // Split into chunks of 500 for efficiency
    const chunkSize = 500;
    let imported = 0;
    
    for (let i = 0; i < values.length; i += chunkSize) {
        const chunk = values.slice(i, i + chunkSize);
        
        try {
            const query = `
                INSERT INTO opportunities (title, description, type, location, url, deadline, requirements, source, tags)
                VALUES ${chunk.join(', ')}
                ON CONFLICT DO NOTHING
            `;
            
            await sql([query]);
            imported += chunk.length;
            
            console.log(`✅ Imported chunk ${Math.floor(i/chunkSize) + 1}: ${imported}/${uniqueOpportunities.length} total`);
            
        } catch (error) {
            console.error(`❌ Error in chunk ${Math.floor(i/chunkSize) + 1}:`, error.message);
        }
    }
    
    // Get final count
    const finalCount = await sql`SELECT COUNT(*) as count FROM opportunities`;
    
    console.log(`\n🚀 ULTRA-FAST IMPORT COMPLETE! 🚀`);
    console.log(`✅ Added ${imported} new opportunities`);
    console.log(`📊 Total database size: ${finalCount[0].count} opportunities`);
    
    return finalCount[0].count;
}

if (require.main === module) {
    ultraFastImport().catch(console.error);
}

module.exports = { ultraFastImport };