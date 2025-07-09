// Remove all fake opportunities added since starting the 600 target
async function removeFakeOpportunities() {
    console.log('=== REMOVING ALL FAKE OPPORTUNITIES WITH BROKEN URLS ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    // Find opportunities with fake URLs (containing our generated domains)
    const fakeOpportunities = opportunities.filter(opp => 
        opp.url && (
            opp.url.includes('aerospace') ||
            opp.url.includes('airesearch') ||
            opp.url.includes('medicaldevice') ||
            opp.url.includes('securitysolutions') ||
            opp.url.includes('analytics') ||
            opp.url.includes('greentech') ||
            opp.url.includes('fintech') ||
            opp.url.includes('genomics') ||
            opp.url.includes('healthinnovation') ||
            opp.url.includes('globalaffairs') ||
            opp.url.includes('biotechinstitute') ||
            opp.url.includes('climateresearch') ||
            opp.url.includes('aiethics') ||
            opp.url.includes('cleanenergy') ||
            opp.url.includes('oceanresearch') ||
            opp.url.includes('brainresearch') ||
            opp.url.includes('quantumlab') ||
            opp.url.includes('spaceresearch') ||
            opp.url.includes('roboticsinstitute') ||
            opp.url.includes('healthtech') ||
            opp.url.includes('university') ||
            opp.url.includes('techcompany') ||
            opp.url.includes('corporation') ||
            opp.url.includes('foundation') ||
            opp.url.includes('hospital') ||
            opp.url.includes('museum') ||
            opp.url.includes('npo') ||
            opp.url.includes('communityorganization') ||
            opp.url.includes('/programs/students/') ||
            opp.url.includes('/programs/highschool') ||
            opp.title.includes('Program 1') ||
            opp.title.includes('Program 2') ||
            opp.title.includes('Program 3') ||
            opp.title.includes('Program 4') ||
            opp.title.includes('Program 5') ||
            opp.title.includes('Professional Program') ||
            opp.source === 'Web Search 2025'
        )
    );
    
    console.log(`Found ${fakeOpportunities.length} fake opportunities to remove`);
    
    let removedCount = 0;
    
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
            } else {
                console.log(`Failed to remove ${fakeOpp.title} (ID: ${fakeOpp.id})`);
            }
        } catch (error) {
            console.log(`Error removing ${fakeOpp.title}: ${error.message}`);
        }
    }
    
    // Check final count
    const finalResponse = await fetch('http://localhost:5000/api/opportunities');
    const finalOpportunities = await finalResponse.json();
    
    console.log(`\n=== CLEANUP COMPLETE ===`);
    console.log(`✅ Removed ${removedCount} fake opportunities`);
    console.log(`📊 Database now has ${finalOpportunities.length} opportunities`);
    console.log(`🎯 Ready to add 600 REAL opportunities with working URLs`);
    
    return { removedCount, finalCount: finalOpportunities.length };
}

removeFakeOpportunities().catch(console.error);