const fs = require('fs');
const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Web search for accurate URLs
async function searchForProgramUrl(programName) {
    try {
        console.log(`Searching for URL: ${programName}`);
        
        // Use Google search to find the most relevant URL
        const searchQuery = encodeURIComponent(`${programName} application official site`);
        const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
        
        // For now, return a search URL - in production we'd use a web search API
        return `https://www.google.com/search?q=${searchQuery}`;
        
    } catch (error) {
        console.error(`Search error for ${programName}:`, error);
        return `https://www.google.com/search?q=${encodeURIComponent(programName + ' application')}`;
    }
}

// Enhanced URL improvement based on program name
function improveUrl(programName, currentUrl) {
    const name = programName.toLowerCase();
    
    // Known program URL mappings
    const urlMappings = {
        'summer health professions education program': {
            'columbia': 'https://www.cuimc.columbia.edu/education/shpep',
            'howard': 'https://medicine.howard.edu/education/enrichment-programs/shpep',
            'louisville': 'https://louisville.edu/medicine/departments/dmbs/research/shpep',
            'nebraska': 'https://www.unmc.edu/mmi/pipeline/shpep/',
            'rutgers': 'https://shrp.rutgers.edu/shpep',
            'ucla': 'https://www.medschool.ucla.edu/shpep',
            'houston': 'https://med.uth.edu/oaa/current-students/md-programs/shpep/',
            'washington': 'https://www.uwmedicine.org/education/shpep',
            'western': 'https://www.westernu.edu/shpep/'
        },
        'american university': 'https://www.american.edu/spexs/summer-programs/',
        'babson college': 'https://www.babson.edu/academics/undergraduate-school/pre-college-programs/',
        'boston university': 'https://www.bu.edu/summer/high-school-programs/',
        'brown university': 'https://precollege.brown.edu/',
        'ucla': 'https://www.summer.ucla.edu/',
        'carnegie mellon': 'https://www.cmu.edu/enrollment/pre-college/',
        'columbia university': 'https://www.ce.columbia.edu/high-school',
        'cornell university': 'https://www.sce.cornell.edu/precollege/',
        'harvard university': 'https://www.summer.harvard.edu/high-school-programs',
        'johns hopkins': 'https://cty.jhu.edu/programs/summer/',
        'mit': 'http://esp.mit.edu/learn/index.html',
        'stanford university': 'https://summerinstitutes.spcs.stanford.edu/',
        'research science institute': 'http://www.cee.org/programs/rsi',
        'nasa high school aerospace': 'http://aerospacescholars.jsc.nasa.gov/abouthas.htm',
        'telluride association': 'http://www.tellurideassociation.org/programs/high_school_students/tasp/',
        'bank of america student leaders': 'http://www.bankofamerica.com/neistudentleaders'
    };
    
    // Check for direct matches
    for (const [key, url] of Object.entries(urlMappings)) {
        if (name.includes(key)) {
            if (typeof url === 'object') {
                // Handle nested mappings (like SHPEP programs)
                for (const [subkey, suburl] of Object.entries(url)) {
                    if (name.includes(subkey)) {
                        return suburl;
                    }
                }
            } else {
                return url;
            }
        }
    }
    
    return currentUrl;
}

// Import opportunities to database
async function importOpportunities() {
    console.log('=== IMPORTING NEW OPPORTUNITIES TO DATABASE ===\n');
    
    try {
        // Read the extracted opportunities
        const opportunities = JSON.parse(fs.readFileSync('robust-new-opportunities.json', 'utf8'));
        console.log(`Loaded ${opportunities.length} opportunities from file`);
        
        // Get existing opportunities to avoid duplicates
        const existingOpportunities = await sql`
            SELECT title FROM opportunities
        `;
        const existingTitles = new Set(existingOpportunities.map(opp => opp.title.toLowerCase()));
        console.log(`Found ${existingOpportunities.length} existing opportunities in database`);
        
        let importCount = 0;
        let skipCount = 0;
        
        for (const opportunity of opportunities) {
            // Check for duplicates
            if (existingTitles.has(opportunity.title.toLowerCase())) {
                console.log(`Skipping duplicate: ${opportunity.title}`);
                skipCount++;
                continue;
            }
            
            try {
                // Improve the URL
                const improvedUrl = improveUrl(opportunity.title, opportunity.applicationUrl);
                
                // Map category to type and determine appropriate fields
                let type = 'internship'; // default
                let amount = null;
                let salary = null;
                
                if (opportunity.category?.toLowerCase().includes('scholarship')) {
                    type = 'scholarship';
                    amount = opportunity.cost;
                } else if (opportunity.category?.toLowerCase().includes('research')) {
                    type = 'internship';
                    salary = opportunity.stipend || opportunity.cost;
                } else if (opportunity.category?.toLowerCase().includes('competition')) {
                    type = 'competition';
                } else if (opportunity.category?.toLowerCase().includes('grant')) {
                    type = 'grant';
                    amount = opportunity.cost;
                } else {
                    type = 'internship';
                }
                
                // Insert into database
                await sql`
                    INSERT INTO opportunities (
                        title, description, type, location, 
                        url, deadline, requirements, source, salary, amount
                    ) VALUES (
                        ${opportunity.title},
                        ${opportunity.description},
                        ${type},
                        ${opportunity.location},
                        ${improvedUrl},
                        ${opportunity.deadline},
                        ${[opportunity.eligibility]},
                        ${opportunity.source},
                        ${salary},
                        ${amount}
                    )
                `;
                
                console.log(`✓ Imported: ${opportunity.title}`);
                importCount++;
                
            } catch (insertError) {
                console.error(`Error importing ${opportunity.title}:`, insertError);
            }
        }
        
        console.log(`\n=== IMPORT COMPLETE ===`);
        console.log(`Successfully imported: ${importCount} opportunities`);
        console.log(`Skipped duplicates: ${skipCount} opportunities`);
        console.log(`Total processed: ${importCount + skipCount} opportunities`);
        
        // Get updated database count
        const finalCount = await sql`SELECT COUNT(*) as count FROM opportunities`;
        console.log(`Total opportunities in database: ${finalCount[0].count}`);
        
        return { imported: importCount, skipped: skipCount, total: finalCount[0].count };
        
    } catch (error) {
        console.error('Import failed:', error);
        throw error;
    }
}

// Run the import
if (require.main === module) {
    importOpportunities().catch(console.error);
}

module.exports = { importOpportunities };