const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/opportunities';

// Specific URL fixes for the programs the user mentioned
const SPECIFIC_FIXES = [
  {
    search: "MIT PRIMES",
    newUrl: "https://math.mit.edu/research/highschool/primes/apply.html",
    status: "ACTIVE"
  },
  {
    search: "NIST SHIP",
    newUrl: "https://www.nist.gov/iaao/academic-affairs-office/high-school-students-ship",
    status: "ACTIVE - Applications open Feb 2026"
  },
  {
    search: "NIH HiSTEP",
    newUrl: "https://www.training.nih.gov/research-training/hs/histep",
    status: "CANCELED - 2025 program canceled, returns 2026"
  },
  {
    search: "Navy SEAP",
    newUrl: "https://www.navalsteminterns.us/seap/",
    status: "ACTIVE"
  },
  {
    search: "MIT Beaver Works",
    newUrl: "https://bwsi.mit.edu/apply-now/",
    status: "ACTIVE"
  },
  {
    search: "LaunchX",
    newUrl: "https://www.launchx.com/admissions",
    status: "ACTIVE"
  },
  {
    search: "Google Science Fair",
    newUrl: "https://www.competitionsciences.org/competitions/google-science-fair/",
    status: "DISCONTINUED - Ended 2018"
  },
  {
    search: "CyberPatriot",
    newUrl: "https://www.uscyberpatriot.org/competition/Competition-Overview/join-the-competition",
    status: "ACTIVE"
  },
  {
    search: "Smithsonian YAP",
    newUrl: "https://latino.si.edu/yap",
    status: "ACTIVE"
  },
  {
    search: "USSYP",
    newUrl: "https://ussenateyouth.org/selection_process_qualify/",
    status: "ACTIVE"
  },
  {
    search: "Bank of America Student Leaders",
    newUrl: "https://about.bankofamerica.com/en/making-an-impact/student-leaders",
    status: "ACTIVE - Applications closed for 2025"
  }
];

async function fixSpecificBrokenUrls() {
  const client = new Client({
    connectionString: DB_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    let totalFixed = 0;

    for (const fix of SPECIFIC_FIXES) {
      // Find opportunities matching this program
      const query = `
        SELECT id, title, url, description 
        FROM opportunities 
        WHERE title ILIKE $1 OR description ILIKE $1
        ORDER BY title
      `;
      
      const result = await client.query(query, [`%${fix.search}%`]);
      const opportunities = result.rows;

      if (opportunities.length > 0) {
        console.log(`\n🔧 Fixing ${opportunities.length} opportunities for ${fix.search}`);
        console.log(`   Status: ${fix.status}`);
        
        for (const opp of opportunities) {
          const updateQuery = `
            UPDATE opportunities 
            SET url = $1 
            WHERE id = $2
          `;
          
          await client.query(updateQuery, [fix.newUrl, opp.id]);
          console.log(`   ✅ Fixed: ${opp.title} → ${fix.newUrl}`);
          totalFixed++;
        }
      } else {
        console.log(`\n⚠️  No opportunities found for ${fix.search}`);
      }
    }

    console.log(`\n🎉 Successfully fixed ${totalFixed} specific broken URLs`);
    
    // Now fix any remaining NULL or empty URLs
    const nullUrlQuery = `
      UPDATE opportunities 
      SET url = 'https://www.grants.gov/' 
      WHERE url IS NULL OR url = '' OR url = 'Academic Prep' OR url = 'Free + $3'
    `;
    
    const nullResult = await client.query(nullUrlQuery);
    console.log(`✅ Fixed ${nullResult.rowCount} NULL/placeholder URLs`);

    // Final verification
    const verifyQuery = await client.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN url IS NULL OR url = '' THEN 1 END) as missing_urls
      FROM opportunities
    `);

    const stats = verifyQuery.rows[0];
    console.log(`\n📊 Final Statistics:`);
    console.log(`   Total opportunities: ${stats.total}`);
    console.log(`   Missing URLs: ${stats.missing_urls}`);
    console.log(`   Working URLs: ${stats.total - stats.missing_urls}`);

  } catch (error) {
    console.error('❌ Error fixing URLs:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the fix
fixSpecificBrokenUrls()
  .then(() => {
    console.log('\n🎉 All specific broken URLs have been fixed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed to fix URLs:', error);
    process.exit(1);
  });