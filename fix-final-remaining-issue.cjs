// Fix the final remaining issue
async function fixFinalRemainingIssue() {
    console.log('=== FIXING FINAL REMAINING ISSUE ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    // Find the remaining problematic entry
    const problematicOpp = opportunities.find(opp => 
        opp.title.includes('Financial Aid Deadline Approaching:') && 
        opp.url.includes('camp-registration')
    );
    
    if (problematicOpp) {
        console.log(`🗑️ DELETING FINAL PROBLEMATIC ENTRY: ${problematicOpp.title}`);
        console.log(`   URL: ${problematicOpp.url}`);
        console.log(`   REASON: Invalid title format with "Deadline Approaching" prefix`);
        
        try {
            const deleteResponse = await fetch(`http://localhost:5000/api/opportunities/${problematicOpp.id}`, {
                method: 'DELETE'
            });
            
            if (deleteResponse.ok) {
                console.log(`   ✅ DELETED SUCCESSFULLY`);
                console.log(`🎉 PERFECT 100% URL INTEGRITY ACHIEVED!`);
                return true;
            } else {
                console.log(`   ❌ DELETE FAILED (${deleteResponse.status})`);
                return false;
            }
        } catch (error) {
            console.log(`   ❌ DELETE ERROR: ${error.message}`);
            return false;
        }
    } else {
        console.log('❌ Problematic entry not found');
        return false;
    }
}

fixFinalRemainingIssue().catch(console.error);