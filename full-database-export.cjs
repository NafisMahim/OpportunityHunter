// Complete database export - ALL 3,371 opportunities
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');

async function fullDatabaseExport() {
    console.log('=== FULL DATABASE EXPORT: ALL 3,371 OPPORTUNITIES ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Get ALL opportunities - no filtering, no deduplication
    const allOpportunities = await sql`
        SELECT * FROM opportunities 
        ORDER BY id
    `;
    
    console.log(`Exporting ${allOpportunities.length} total opportunities...`);
    
    // Create comprehensive export
    const exportData = {
        export_timestamp: new Date().toISOString(),
        total_count: allOpportunities.length,
        opportunities: allOpportunities
    };
    
    // Save as JSON
    fs.writeFileSync('complete_database_export_3371.json', JSON.stringify(exportData, null, 2));
    
    // Also create CSV for easier analysis
    const csvHeaders = 'id,title,description,organization,type,category,location,url,deadline,eligibility,source,created_at\n';
    const csvRows = allOpportunities.map(opp => {
        // Escape commas and quotes in CSV fields
        const escape = (field) => {
            if (!field) return '';
            const str = String(field).replace(/"/g, '""');
            return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
        };
        
        return [
            opp.id,
            escape(opp.title),
            escape(opp.description),
            escape(opp.organization),
            escape(opp.type),
            escape(opp.category),
            escape(opp.location),
            escape(opp.url),
            escape(opp.deadline),
            escape(opp.eligibility),
            escape(opp.source),
            escape(opp.created_at)
        ].join(',');
    }).join('\n');
    
    fs.writeFileSync('complete_database_export_3371.csv', csvHeaders + csvRows);
    
    // URL validation report
    console.log('\n=== URL VALIDATION REPORT ===');
    const urlStats = {
        total: allOpportunities.length,
        with_url: allOpportunities.filter(o => o.url && o.url.trim() !== '').length,
        https_urls: allOpportunities.filter(o => o.url && o.url.startsWith('https://')).length,
        http_urls: allOpportunities.filter(o => o.url && o.url.startsWith('http://')).length,
        no_url: allOpportunities.filter(o => !o.url || o.url.trim() === '').length
    };
    
    console.log(`Total opportunities: ${urlStats.total}`);
    console.log(`With URLs: ${urlStats.with_url}`);
    console.log(`HTTPS URLs: ${urlStats.https_urls}`);
    console.log(`HTTP URLs: ${urlStats.http_urls}`);
    console.log(`Without URLs: ${urlStats.no_url}`);
    
    // Source breakdown
    console.log('\n=== SOURCE BREAKDOWN ===');
    const sourceCounts = {};
    allOpportunities.forEach(opp => {
        const source = opp.source || 'Unknown';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    
    Object.entries(sourceCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .forEach(([source, count]) => {
            console.log(`${source}: ${count}`);
        });
    
    console.log('\n✅ EXPORT COMPLETED:');
    console.log('• complete_database_export_3371.json (full JSON export)');
    console.log('• complete_database_export_3371.csv (CSV for analysis)');
    console.log(`• Contains ALL ${allOpportunities.length} opportunities from database`);
    console.log('• No filtering or deduplication applied');
    console.log('• Ready for comprehensive URL validation');
}

fullDatabaseExport().catch(console.error);