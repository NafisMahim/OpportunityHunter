// Emergency cleanup of all remaining fake "Web Search 2025" opportunities
const { neon } = require('@neondatabase/serverless');

async function emergencyCleanup() {
    console.log('=== EMERGENCY CLEANUP - REMOVING ALL WEB SEARCH 2025 FAKES ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    try {
        // Find all Web Search 2025 opportunities
        const fakeOpps = await sql`
            SELECT id, title, url FROM opportunities 
            WHERE source = 'Web Search 2025'
            ORDER BY id
        `;
        
        console.log(`Found ${fakeOpps.length} fake "Web Search 2025" opportunities to remove`);
        
        if (fakeOpps.length > 0) {
            console.log('\nSample fake opportunities being removed:');
            fakeOpps.slice(0, 10).forEach((opp, index) => {
                console.log(`${index + 1}. ${opp.title}`);
                console.log(`   URL: ${opp.url}`);
            });
            
            // Delete all Web Search 2025 opportunities
            const deleteResult = await sql`
                DELETE FROM opportunities 
                WHERE source = 'Web Search 2025'
            `;
            
            console.log(`\n✅ Deleted ${fakeOpps.length} fake opportunities`);
        }
        
        // Get new total count
        const totalResult = await sql`SELECT COUNT(*) as count FROM opportunities`;
        const newTotal = totalResult[0].count;
        
        console.log(`\n📊 New total opportunities: ${newTotal}`);
        
        // Verify no Web Search 2025 remain
        const remainingFakes = await sql`
            SELECT COUNT(*) as count FROM opportunities 
            WHERE source = 'Web Search 2025'
        `;
        
        console.log(`🔍 Remaining "Web Search 2025" opportunities: ${remainingFakes[0].count}`);
        
        if (remainingFakes[0].count === 0) {
            console.log('\n🎉 SUCCESS! All fake "Web Search 2025" opportunities removed');
            console.log('✅ Zero tolerance policy enforced');
            console.log('✅ Only legitimate opportunities remain');
        } else {
            console.log('\n⚠️ Warning: Some fake opportunities may still remain');
        }
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

emergencyCleanup().catch(console.error);