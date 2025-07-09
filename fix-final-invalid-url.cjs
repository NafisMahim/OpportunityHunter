// Fix the final invalid URL found in verification
async function fixFinalInvalidURL() {
    console.log('=== FIXING FINAL INVALID URL ===');
    
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    
    const brokenURL = 'https://http://apply.brooklynda.org/videsktop/viRecruitSelfApply/ReDefault.aspx?Tag=ee371';
    const fixedURL = 'https://www.brooklynda.org/careers/';
    
    const matchingOpp = opportunities.find(opp => opp.url === brokenURL);
    
    if (matchingOpp) {
        console.log(`Fixing: ${matchingOpp.title}`);
        console.log(`  OLD: ${brokenURL}`);
        console.log(`  NEW: ${fixedURL}`);
        
        try {
            const updateResponse = await fetch(`http://localhost:5000/api/opportunities/${matchingOpp.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: fixedURL
                })
            });
            
            if (updateResponse.ok) {
                console.log(`✅ FIXED: Brooklyn DA URL corrected`);
                return true;
            } else {
                console.log(`❌ FAILED (${updateResponse.status})`);
                return false;
            }
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            return false;
        }
    } else {
        console.log('❌ Brooklyn DA opportunity not found');
        return false;
    }
}

fixFinalInvalidURL().catch(console.error);