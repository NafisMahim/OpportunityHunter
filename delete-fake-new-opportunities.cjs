// Delete all the fake opportunities I just added
const { neon } = require('@neondatabase/serverless');

async function deleteFakeNewOpportunities() {
    console.log('=== DELETING FAKE NEW OPPORTUNITIES ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Delete all opportunities added today that have fake URLs
    const fakeSourcesToDelete = [
        'NASA', 'NSF', 'CDC', 'DOE', 'EPA', 'NOAA', 'NIST', 'DoD', 'USGS', 'Peace Corps',
        'State Department', 'Library of Congress', 'National Archives', 'Federal Reserve',
        'Harvard', 'Stanford', 'MIT', 'Princeton', 'Yale', 'Caltech', 'UChicago', 'Columbia', 'UC Berkeley', 'CMU',
        'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Tesla', 'NVIDIA', 'Intel', 'IBM', 'Cisco',
        'Mayo Clinic', 'Cleveland Clinic', 'Johns Hopkins', 'MSKCC', 'NIH',
        'UN', 'World Bank', 'IMF', 'UNICEF', 'MSF',
        'Rhodes Trust', 'Marshall Aid', 'Gates Cambridge', 'Fulbright',
        'Team USA', 'NBA', 'MLB', 'NFL', 'Special Olympics',
        'Catholic Charities', 'Salvation Army', 'JFNA', 'ISNA', 'NCC',
        'NPR', 'PBS', 'Smithsonian', 'NEA', 'NYPL', 'NGA', 'Folger Library',
        'ACLU', 'HRC', 'Amnesty', 'SPLC', 'NAACP LDF',
        'EDF', 'NRDC', 'Sierra Club', 'Greenpeace', 'Conservation International',
        'GitHub', 'Spotify', 'Adobe', 'Salesforce', 'Twitter',
        'FBI', 'CIA', 'DHS', 'NSA', 'AMA', 'ACS', 'AHA', 'ADA',
        'College Board', 'ETS', 'Khan Academy', 'Bank of America', 'Wells Fargo', 'Morgan Stanley',
        'Lockheed Martin', 'Raytheon', 'SpaceX', 'Blue Origin',
        'NREL', 'PNNL', 'LBNL', 'DOT', 'FAA', 'FRA',
        'USAID', 'ITA', 'USDA ARS', 'FDA'
    ];
    
    try {
        // First delete applications for these fake opportunities
        console.log('Deleting applications for fake opportunities...');
        await sql`
            DELETE FROM applications 
            WHERE opportunity_id IN (
                SELECT id FROM opportunities 
                WHERE source = ANY(${fakeSourcesToDelete})
            )
        `;
        
        // Now delete the fake opportunities
        console.log('Deleting fake opportunities...');
        const result = await sql`
            DELETE FROM opportunities 
            WHERE source = ANY(${fakeSourcesToDelete})
        `;
        
        console.log(`✅ Deleted ${result.count} fake opportunities`);
        
        // Get accurate count
        const totalResult = await sql`SELECT COUNT(*) as count FROM opportunities`;
        const newTotal = totalResult[0].count;
        
        console.log(`📊 Remaining legitimate opportunities: ${newTotal}`);
        
        // Verify no fake sources remain
        const remainingFakes = await sql`
            SELECT source, COUNT(*) as count FROM opportunities 
            WHERE source = ANY(${fakeSourcesToDelete})
            GROUP BY source
        `;
        
        if (remainingFakes.length > 0) {
            console.log('⚠️ Still some fake sources:');
            remainingFakes.forEach(fake => {
                console.log(`- ${fake.source}: ${fake.count}`);
            });
        } else {
            console.log('✅ All fake opportunities removed');
        }
        
    } catch (error) {
        console.error('❌ Error during deletion:', error);
    }
}

deleteFakeNewOpportunities().catch(console.error);