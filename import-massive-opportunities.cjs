const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function importMassiveOpportunities() {
    console.log('🚀 IMPORTING MASSIVE OPPORTUNITIES TO DATABASE 🚀\n');
    
    // Load extracted opportunities
    const opportunities = JSON.parse(fs.readFileSync('quick-extracted-opportunities.json', 'utf8'));
    console.log(`📊 Loaded ${opportunities.length} extracted opportunities`);
    
    // Get existing opportunities for duplicate checking
    const existing = await sql`SELECT title, organization FROM opportunities`;
    console.log(`📋 Found ${existing.length} existing opportunities in database`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    // Function to check for duplicates
    function isDuplicate(opp, existingOpps) {
        return existingOpps.some(existing => {
            const titleMatch = existing.title.toLowerCase().trim() === opp.title.toLowerCase().trim();
            const similarTitle = existing.title.toLowerCase().includes(opp.title.toLowerCase()) || 
                               opp.title.toLowerCase().includes(existing.title.toLowerCase());
            return titleMatch || similarTitle;
        });
    }
    
    // Process in batches to avoid memory issues
    const batchSize = 1000;
    const totalBatches = Math.ceil(opportunities.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, opportunities.length);
        const batch = opportunities.slice(start, end);
        
        console.log(`\n🔄 Processing batch ${batchIndex + 1}/${totalBatches} (${start}-${end})`);
        
        for (const opportunity of batch) {
            try {
                // Skip if duplicate
                if (isDuplicate(opportunity, existing)) {
                    skipped++;
                    continue;
                }
                
                // Clean and validate URL
                let cleanUrl = opportunity.url;
                if (!cleanUrl || cleanUrl === 'undefined') {
                    cleanUrl = `https://www.google.com/search?q=${encodeURIComponent(opportunity.title + ' application')}`;
                }
                
                // Ensure required fields
                const title = opportunity.title || 'Academic Opportunity';
                const description = opportunity.description || `${title} - Check website for details`;
                const type = opportunity.type || 'internship';
                const location = opportunity.location || 'Various';
                const source = opportunity.source || 'CSV Import';
                const requirements = Array.isArray(opportunity.requirements) ? opportunity.requirements : ['Check requirements'];
                const tags = Array.isArray(opportunity.tags) ? opportunity.tags : [];
                
                // Insert into database
                await sql`
                    INSERT INTO opportunities (
                        title, description, type, location, 
                        url, deadline, requirements, source, tags
                    ) VALUES (
                        ${title},
                        ${description},
                        ${type},
                        ${location},
                        ${cleanUrl},
                        ${opportunity.deadline || 'Check website'},
                        ${requirements},
                        ${source},
                        ${tags}
                    )
                `;
                
                imported++;
                
                // Add to existing array to prevent duplicates within this batch
                existing.push({ title: title, organization: opportunity.organization || '' });
                
            } catch (error) {
                console.error(`❌ Error importing "${opportunity.title}":`, error.message);
                errors++;
            }
        }
        
        // Progress update
        console.log(`✅ Batch ${batchIndex + 1} complete: +${imported - (batchIndex * batchSize)} imported`);
        console.log(`📊 Total progress: ${imported} imported, ${skipped} skipped, ${errors} errors`);
    }
    
    // Final count
    const finalCount = await sql`SELECT COUNT(*) as count FROM opportunities`;
    
    console.log(`\n🎉 MASSIVE IMPORT COMPLETE! 🎉`);
    console.log(`✅ Successfully imported: ${imported} opportunities`);
    console.log(`⏭️ Skipped duplicates: ${skipped} opportunities`);
    console.log(`❌ Errors encountered: ${errors} opportunities`);
    console.log(`📊 Total opportunities in database: ${finalCount[0].count}`);
    
    return {
        imported,
        skipped,
        errors,
        total: finalCount[0].count
    };
}

// Run the import
if (require.main === module) {
    importMassiveOpportunities().catch(console.error);
}

module.exports = { importMassiveOpportunities };