// Delete obviously corrupted entries first
async function deleteCorruptedEntries() {
    console.log('=== DELETING CORRUPTED ENTRIES ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    // Patterns that indicate corrupted data that should be deleted
    const corruptedPatterns = [
        'IFQ',
        '<rdf:li xml:lang',
        '<</CreationDate',
        '<</Subtype/Link',
        '"""New:"""',
        'document viewer and editor',
        'Producer(KamiHQ.com',
        '/BS<</W 0>>/F 4/A',
        'BHHS Summer Programs</rdf:li>',
        '/ModDate(D:20231201',
        'StructParent'
    ];
    
    let deleteCount = 0;
    
    for (const opp of opportunities) {
        const isCorrupted = corruptedPatterns.some(pattern => 
            opp.title.includes(pattern) || 
            (opp.url && opp.url.includes(pattern)) ||
            opp.title.length > 200 ||
            opp.title.includes('<</') ||
            opp.title.includes('xml:lang') ||
            opp.title.includes('ModDate') ||
            opp.title.includes('Producer')
        );
        
        if (isCorrupted) {
            console.log(`🗑️ DELETING: ${opp.title.substring(0, 80)}...`);
            try {
                const deleteResponse = await fetch(`http://localhost:5000/api/opportunities/${opp.id}`, {
                    method: 'DELETE'
                });
                if (deleteResponse.ok) {
                    deleteCount++;
                    console.log(`   ✅ Deleted ID ${opp.id}`);
                } else {
                    console.log(`   ❌ Delete failed (${deleteResponse.status})`);
                }
            } catch (error) {
                console.log(`   ❌ Delete error: ${error.message}`);
            }
        }
    }
    
    console.log(`\n=== DELETED ${deleteCount} CORRUPTED ENTRIES ===`);
    return deleteCount;
}

deleteCorruptedEntries().catch(console.error);