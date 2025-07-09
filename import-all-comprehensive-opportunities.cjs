const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

async function importAllOpportunities() {
    console.log('🚀 IMPORTING ALL COMPREHENSIVE OPPORTUNITIES TO DATABASE\n');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Load extracted opportunities from both files
    const csvTxtOpportunities = JSON.parse(fs.readFileSync('./comprehensive-batch-opportunities.json', 'utf-8'));
    const pdfOpportunities = JSON.parse(fs.readFileSync('./manual-pdf-opportunities.json', 'utf-8'));
    
    console.log(`📊 CSV/TXT Opportunities: ${csvTxtOpportunities.length}`);
    console.log(`📊 PDF Opportunities: ${pdfOpportunities.length}`);
    
    // Combine all opportunities
    const allOpportunities = [...csvTxtOpportunities, ...pdfOpportunities];
    console.log(`📊 Total Combined Opportunities: ${allOpportunities.length}\n`);
    
    // Get existing opportunities to avoid duplicates
    const existingOpportunities = await sql`SELECT title, url FROM opportunities`;
    const existingTitles = new Set(existingOpportunities.map(opp => opp.title.toLowerCase()));
    const existingUrls = new Set(existingOpportunities.map(opp => opp.url.toLowerCase()));
    
    console.log(`🔍 Found ${existingOpportunities.length} existing opportunities in database\n`);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const opportunity of allOpportunities) {
        const title = opportunity.title.trim();
        const description = opportunity.description.trim();
        const url = opportunity.url.trim();
        const location = opportunity.location || 'Various locations';
        
        // Skip if title or URL already exists (case-insensitive)
        const titleLower = title.toLowerCase();
        const urlLower = url.toLowerCase();
        
        if (existingTitles.has(titleLower) || existingUrls.has(urlLower)) {
            console.log(`⏭️  Skipping duplicate: ${title}`);
            skippedCount++;
            continue;
        }
        
        // Skip invalid entries
        if (!title || title.length < 3 || !description || description.length < 10) {
            console.log(`❌ Skipping invalid entry: ${title}`);
            skippedCount++;
            continue;
        }
        
        try {
            await sql`
                INSERT INTO opportunities (title, description, type, source, url, location, categories, created_at)
                VALUES (${title}, ${description}, 'program', 'manual_extraction', ${url}, ${location}, ${opportunity.categories || ['Academic Programs']}, NOW())
            `;
            
            console.log(`✅ Imported: ${title}`);
            importedCount++;
            
            // Add to existing sets to prevent duplicates within this batch
            existingTitles.add(titleLower);
            existingUrls.add(urlLower);
            
        } catch (error) {
            console.log(`❌ Error importing "${title}": ${error.message}`);
            skippedCount++;
        }
    }
    
    // Get final count
    const finalResult = await sql`SELECT COUNT(*) as total FROM opportunities`;
    const finalTotal = finalResult[0].total;
    
    console.log(`\n🎉 IMPORT COMPLETE!`);
    console.log(`✅ Successfully imported: ${importedCount} opportunities`);
    console.log(`⏭️  Skipped duplicates/invalid: ${skippedCount} opportunities`);
    console.log(`📊 Total opportunities in database: ${finalTotal}`);
    console.log(`📈 Database grew from ${existingOpportunities.length} to ${finalTotal} opportunities (+${finalTotal - existingOpportunities.length})`);
}

importAllOpportunities().catch(console.error);