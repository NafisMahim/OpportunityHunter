// Remove ALL fake opportunities with "Web Search 2025" source
async function removeAllFakeWebSearch2025() {
    console.log('=== REMOVING ALL FAKE "Web Search 2025" OPPORTUNITIES ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    // Find ALL opportunities with "Web Search 2025" source
    const fakeOpportunities = opportunities.filter(opp => 
        opp.source === 'Web Search 2025'
    );
    
    console.log(`Found ${fakeOpportunities.length} fake "Web Search 2025" opportunities to remove`);
    
    let removedCount = 0;
    
    // Remove all fake opportunities
    for (const fakeOpp of fakeOpportunities) {
        try {
            const deleteResponse = await fetch(`http://localhost:5000/api/opportunities/${fakeOpp.id}`, {
                method: 'DELETE'
            });
            
            if (deleteResponse.ok) {
                removedCount++;
                if (removedCount % 50 === 0) {
                    console.log(`Removed ${removedCount}/${fakeOpportunities.length} fake opportunities`);
                }
            }
        } catch (error) {
            console.log(`Failed to remove ${fakeOpp.title}`);
        }
    }
    
    // Check final count
    const finalResponse = await fetch('http://localhost:5000/api/opportunities');
    const finalOpportunities = await finalResponse.json();
    
    console.log(`\n=== CLEANUP COMPLETE ===`);
    console.log(`✅ Removed ${removedCount} fake opportunities`);
    console.log(`📊 Database now has ${finalOpportunities.length} opportunities`);
    console.log(`🔗 All remaining opportunities should have real URLs`);
    
    return { removedCount, finalCount: finalOpportunities.length };
}

removeAllFakeWebSearch2025().catch(console.error);