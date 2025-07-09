// Comprehensive CSV-based fixes - Batch 2 (MISSING entries)
const fs = require('fs');

async function comprehensiveCSVFixesBatch2() {
    console.log('=== COMPREHENSIVE CSV FIXES - BATCH 2 (MISSING ENTRIES) ===');
    
    // Read the CSV file
    const csvContent = fs.readFileSync('attached_assets/All_Opportunities_with_URL_Status_1752087099924.csv', 'utf8');
    const lines = csvContent.split('\n');
    
    // Parse CSV and collect MISSING entries
    const missingEntries = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple parsing for MISSING status
        if (line.includes(',MISSING,')) {
            // Extract title (everything before first comma, remove quotes)
            const titleMatch = line.match(/^"?([^",]+)"?,/);
            if (titleMatch) {
                const title = titleMatch[1];
                missingEntries.push({ title, lineNumber: i + 1 });
            }
        }
    }
    
    console.log(`Found ${missingEntries.length} MISSING entries to delete`);
    
    // Get current opportunities from database
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    let deletedCount = 0;
    let notFoundCount = 0;
    
    // Process MISSING entries - delete them
    console.log('\n🗑️ DELETING MISSING ENTRIES...');
    
    for (const entry of missingEntries) {
        // Find matching opportunity with flexible matching
        const matchingOpp = opportunities.find(opp => {
            // Direct title match
            if (opp.title === entry.title) return true;
            
            // Partial title match (both directions)
            if (opp.title.includes(entry.title) || entry.title.includes(opp.title)) return true;
            
            // Handle corrupted titles with XML/HTML tags
            if (entry.title.includes('<rdf:li') || entry.title.includes('<</') || 
                entry.title.includes('IFQ') || entry.title.includes('Proxref') ||
                entry.title === 'IFQ' || entry.title.includes('ModDate')) {
                // Match by corrupted patterns in database
                if (opp.title.includes('<') || opp.title.includes('IFQ') || 
                    opp.title.includes('rdf:li') || opp.title.includes('Producer(KamiHQ')) {
                    return true;
                }
            }
            
            return false;
        });
        
        if (matchingOpp) {
            console.log(`🗑️ DELETING: ${entry.title}`);
            console.log(`   Database title: ${matchingOpp.title}`);
            
            try {
                const deleteResponse = await fetch(`http://localhost:5000/api/opportunities/${matchingOpp.id}`, {
                    method: 'DELETE'
                });
                
                if (deleteResponse.ok) {
                    deletedCount++;
                    console.log(`   ✅ DELETED`);
                } else {
                    console.log(`   ❌ DELETE FAILED (${deleteResponse.status})`);
                }
            } catch (error) {
                console.log(`   ❌ DELETE ERROR: ${error.message}`);
            }
        } else {
            notFoundCount++;
            if (entry.title.length < 50) { // Only log short titles to avoid spam
                console.log(`❌ NOT FOUND: ${entry.title}`);
            }
        }
        
        // Small delay to avoid overwhelming the server
        if (deletedCount % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    console.log(`\n=== BATCH 2 SUMMARY ===`);
    console.log(`🗑️ Deleted MISSING entries: ${deletedCount}`);
    console.log(`❌ Not found in database: ${notFoundCount}`);
    console.log(`📊 Total MISSING entries: ${missingEntries.length}`);
    
    return {
        deletedCount,
        notFoundCount,
        totalMissing: missingEntries.length
    };
}

comprehensiveCSVFixesBatch2().catch(console.error);