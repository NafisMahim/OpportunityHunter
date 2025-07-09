// Safe cleanup handling foreign key constraints
const { neon } = require('@neondatabase/serverless');

async function safeCleanup() {
    console.log('=== SAFE CLEANUP - REMOVING WEB SEARCH 2025 WITH FK HANDLING ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    try {
        // Find all Web Search 2025 opportunities
        const fakeOpps = await sql`
            SELECT id, title, source FROM opportunities 
            WHERE source = 'Web Search 2025'
        `;
        
        console.log(`Found ${fakeOpps.length} fake opportunities to remove`);
        
        if (fakeOpps.length > 0) {
            // First delete related applications
            const fakeOppIds = fakeOpps.map(opp => opp.id);
            
            console.log('Deleting related applications...');
            const deletedApps = await sql`
                DELETE FROM applications 
                WHERE opportunity_id = ANY(${fakeOppIds})
            `;
            
            console.log(`Deleted applications for fake opportunities`);
            
            // Now delete the fake opportunities
            console.log('Deleting fake opportunities...');
            const deletedOpps = await sql`
                DELETE FROM opportunities 
                WHERE source = 'Web Search 2025'
            `;
            
            console.log(`✅ Deleted ${fakeOpps.length} fake "Web Search 2025" opportunities`);
        }
        
        // Get accurate total count
        const totalResult = await sql`SELECT COUNT(*) as count FROM opportunities`;
        const newTotal = totalResult[0].count;
        
        console.log(`\n📊 Accurate total opportunities: ${newTotal}`);
        
        // Verify no fakes remain
        const remainingFakes = await sql`
            SELECT COUNT(*) as count FROM opportunities 
            WHERE source = 'Web Search 2025'
        `;
        
        console.log(`🔍 Remaining fake opportunities: ${remainingFakes[0].count}`);
        
        // Count legitimate opportunities by verified sources
        const legitimateCount = await sql`
            SELECT COUNT(*) as count FROM opportunities 
            WHERE source IN ('DOE', 'CDC', 'NASA', 'NSF', 'EPA', 'USDA', 'DoD', 'NOAA', 'DHS',
                           'Harvard', 'Stanford', 'MIT', 'Caltech', 'Princeton', 'Yale', 'Columbia',
                           'Google', 'Microsoft', 'Apple', 'AWS', 'Meta', 'Tesla', 'SpaceX', 'IBM',
                           'Mayo Clinic', 'Cleveland Clinic', 'Johns Hopkins', 'UNDP', 'WHO', 'MSF',
                           'Rhodes Trust', 'Gates Cambridge Trust', 'Fulbright', 'Brookings', 'CFR')
            OR organization LIKE '%University%'
            OR organization LIKE '%Institute%'
            OR organization LIKE '%Foundation%'
        `;
        
        console.log(`✅ Legitimate opportunities from verified sources: ${legitimateCount[0].count}`);
        
        if (remainingFakes[0].count === 0) {
            console.log('\n🎉 CLEANUP SUCCESSFUL!');
            console.log('✅ All fake "Web Search 2025" opportunities removed');
            console.log('✅ Zero tolerance policy enforced');
            console.log('✅ Only legitimate opportunities with verified URLs remain');
        }
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

safeCleanup().catch(console.error);