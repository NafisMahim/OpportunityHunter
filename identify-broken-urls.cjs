// Identify actual broken URLs in the database
const { neon } = require('@neondatabase/serverless');

async function identifyBrokenUrls() {
    console.log('=== IDENTIFYING BROKEN URLS ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    try {
        // Find the FAO opportunity specifically
        const faoOpp = await sql`
            SELECT id, title, organization, url FROM opportunities 
            WHERE organization LIKE '%Food and Agriculture%' 
            OR title LIKE '%FAO%'
            OR url LIKE '%fao.org%'
            LIMIT 5
        `;
        
        console.log('FAO Opportunities:');
        faoOpp.forEach(opp => {
            console.log(`ID: ${opp.id}, Title: ${opp.title}`);
            console.log(`Organization: ${opp.organization}`);
            console.log(`URL: ${opp.url}\n`);
        });
        
        // Check for common broken URL patterns
        const suspiciousUrls = await sql`
            SELECT id, title, organization, url FROM opportunities 
            WHERE url LIKE '%/internships/en/%' 
            OR url LIKE '%404%'
            OR url LIKE '%error%'
            OR url LIKE '%not-found%'
            OR url LIKE '%employment/opportunities-at-fao%'
            LIMIT 20
        `;
        
        console.log('Suspicious URLs found:');
        suspiciousUrls.forEach(opp => {
            console.log(`ID: ${opp.id}, Title: ${opp.title}`);
            console.log(`URL: ${opp.url}\n`);
        });
        
        // Check for organizations that commonly have broken URLs
        const problematicOrgs = await sql`
            SELECT organization, COUNT(*) as count, 
                   ARRAY_AGG(DISTINCT url) as sample_urls
            FROM opportunities 
            WHERE organization IN (
                'Food and Agriculture Organization',
                'World Health Organization', 
                'World Food Programme',
                'International Rescue Committee',
                'Mercy Corps',
                'Save the Children International',
                'CARE International',
                'Oxfam International'
            )
            GROUP BY organization
        `;
        
        console.log('International Organizations URLs:');
        problematicOrgs.forEach(org => {
            console.log(`${org.organization}: ${org.count} opportunities`);
            org.sample_urls.forEach(url => {
                console.log(`  - ${url}`);
            });
            console.log('');
        });
        
        // Find recent opportunities that might have working URLs for reference
        const recentGood = await sql`
            SELECT title, organization, url FROM opportunities 
            WHERE organization IN ('NASA', 'National Science Foundation', 'Harvard University', 'Stanford University')
            LIMIT 10
        `;
        
        console.log('Sample Good URLs (for reference):');
        recentGood.forEach(opp => {
            console.log(`${opp.organization}: ${opp.url}`);
        });
        
    } catch (error) {
        console.error('❌ Error identifying URLs:', error);
    }
}

identifyBrokenUrls().catch(console.error);