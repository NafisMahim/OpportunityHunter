const fs = require('fs');

// Import comprehensive new opportunities found through web research
// Environmental Science, Athletics, Music, Healthcare, International Programs
async function importComprehensiveNewOpportunities() {
    try {
        console.log('=== IMPORTING COMPREHENSIVE NEW OPPORTUNITIES ===');
        
        // Read the fixed comprehensive opportunities file
        const filePath = './comprehensive-new-opportunities-fixed.json';
        if (!fs.existsSync(filePath)) {
            console.log('❌ comprehensive-new-opportunities.json not found');
            return;
        }
        
        const opportunities = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        console.log(`📊 Found ${opportunities.length} opportunities to import`);
        
        // Send to API for import
        const response = await fetch('http://localhost:5000/api/opportunities/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ opportunities })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Successfully imported ${result.imported} new opportunities`);
            console.log(`⚠ Skipped ${result.skipped} duplicates`);
            console.log(`📈 Total opportunities in database: ${result.total}`);
        } else {
            console.log('❌ Failed to import opportunities:', response.statusText);
        }
        
    } catch (error) {
        console.error('Error importing opportunities:', error);
    }
}

importComprehensiveNewOpportunities();