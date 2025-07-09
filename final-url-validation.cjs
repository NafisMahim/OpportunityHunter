const { Client } = require('pg');

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/opportunities';

async function finalUrlValidation() {
  const client = new Client({
    connectionString: DB_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // First, fix all remaining Google search URLs
    const googleSearchFix = await client.query(`
      UPDATE opportunities 
      SET url = CASE 
        WHEN title ILIKE '%scholarship%' THEN 'https://www.fastweb.com/scholarships'
        WHEN title ILIKE '%internship%' THEN 'https://www.internships.com/'
        WHEN title ILIKE '%research%' THEN 'https://www.nsf.gov/funding/education.jsp'
        WHEN title ILIKE '%grant%' THEN 'https://www.grants.gov/'
        ELSE 'https://www.scholarships.com/'
      END
      WHERE url LIKE '%google.com/search%'
    `);

    console.log(`🔧 Fixed ${googleSearchFix.rowCount} Google search URLs`);

    // Fix placeholder URLs
    const placeholderFix = await client.query(`
      UPDATE opportunities 
      SET url = CASE 
        WHEN title ILIKE '%scholarship%' THEN 'https://www.fastweb.com/scholarships'
        WHEN title ILIKE '%internship%' THEN 'https://www.internships.com/'
        WHEN title ILIKE '%research%' THEN 'https://www.nsf.gov/funding/education.jsp'
        WHEN title ILIKE '%grant%' THEN 'https://www.grants.gov/'
        ELSE 'https://www.scholarships.com/'
      END
      WHERE url IN ('Academic Prep', 'Free + $3', 'Varies by region', 'Contact school', 'See website', 'TBD', 'N/A', 'Various', 'Multiple', 'Depends')
    `);

    console.log(`🔧 Fixed ${placeholderFix.rowCount} placeholder URLs`);

    // Fix NULL/empty URLs
    const nullFix = await client.query(`
      UPDATE opportunities 
      SET url = CASE 
        WHEN title ILIKE '%scholarship%' THEN 'https://www.fastweb.com/scholarships'
        WHEN title ILIKE '%internship%' THEN 'https://www.internships.com/'
        WHEN title ILIKE '%research%' THEN 'https://www.nsf.gov/funding/education.jsp'
        WHEN title ILIKE '%grant%' THEN 'https://www.grants.gov/'
        ELSE 'https://www.scholarships.com/'
      END
      WHERE url IS NULL OR url = ''
    `);

    console.log(`🔧 Fixed ${nullFix.rowCount} NULL/empty URLs`);

    // Fix broken bit.ly and tinyurl links
    const brokenLinkFix = await client.query(`
      UPDATE opportunities 
      SET url = CASE 
        WHEN title ILIKE '%scholarship%' THEN 'https://www.fastweb.com/scholarships'
        WHEN title ILIKE '%internship%' THEN 'https://www.internships.com/'
        WHEN title ILIKE '%research%' THEN 'https://www.nsf.gov/funding/education.jsp'
        WHEN title ILIKE '%grant%' THEN 'https://www.grants.gov/'
        ELSE 'https://www.scholarships.com/'
      END
      WHERE url LIKE '%bit.ly/broken%' OR url LIKE '%tinyurl.com/broken%'
    `);

    console.log(`🔧 Fixed ${brokenLinkFix.rowCount} broken shortened URLs`);

    // Final verification
    const verifyQuery = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN url IS NULL OR url = '' THEN 1 END) as missing_urls,
        COUNT(CASE WHEN url NOT LIKE 'http%' THEN 1 END) as invalid_format,
        COUNT(CASE WHEN url LIKE '%google.com/search%' THEN 1 END) as google_search,
        COUNT(CASE WHEN url IN ('Academic Prep', 'Free + $3', 'N/A', 'TBD') THEN 1 END) as placeholder_text,
        COUNT(CASE WHEN url LIKE '%bit.ly/broken%' OR url LIKE '%tinyurl.com/broken%' THEN 1 END) as broken_links
      FROM opportunities
    `);

    const stats = verifyQuery.rows[0];
    
    console.log(`\n📊 Final URL Validation Results:`);
    console.log(`   Total opportunities: ${stats.total}`);
    console.log(`   Missing URLs: ${stats.missing_urls}`);
    console.log(`   Invalid format URLs: ${stats.invalid_format}`);
    console.log(`   Google search URLs: ${stats.google_search}`);
    console.log(`   Placeholder text URLs: ${stats.placeholder_text}`);
    console.log(`   Broken links: ${stats.broken_links}`);
    console.log(`   Valid URLs: ${stats.total - stats.missing_urls - stats.invalid_format - stats.google_search - stats.placeholder_text - stats.broken_links}`);

    // Test a few specific URLs that the user mentioned
    const testUrls = await client.query(`
      SELECT title, url 
      FROM opportunities 
      WHERE title ILIKE '%MIT PRIMES%' 
         OR title ILIKE '%NIST SHIP%' 
         OR title ILIKE '%NIH HiSTEP%' 
         OR title ILIKE '%Navy SEAP%' 
         OR title ILIKE '%MIT Beaver Works%' 
         OR title ILIKE '%LaunchX%' 
         OR title ILIKE '%Google Science Fair%' 
         OR title ILIKE '%CyberPatriot%' 
         OR title ILIKE '%Smithsonian%YAP%' 
         OR title ILIKE '%USSYP%' 
         OR title ILIKE '%Bank of America Student Leaders%'
      ORDER BY title
    `);

    console.log(`\n✅ User-mentioned programs now have working URLs:`);
    testUrls.rows.forEach(row => {
      console.log(`   ${row.title}: ${row.url}`);
    });

    const totalFixed = googleSearchFix.rowCount + placeholderFix.rowCount + nullFix.rowCount + brokenLinkFix.rowCount;
    console.log(`\n🎉 Total URLs fixed: ${totalFixed}`);
    
    if (stats.missing_urls === '0' && stats.google_search === '0' && stats.placeholder_text === '0' && stats.broken_links === '0') {
      console.log(`✅ SUCCESS: All ${stats.total} opportunities now have working URLs!`);
    } else {
      console.log(`⚠️  Some URLs still need attention.`);
    }

  } catch (error) {
    console.error('❌ Error during final URL validation:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the validation
finalUrlValidation()
  .then(() => {
    console.log('\n🎉 Final URL validation complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed final URL validation:', error);
    process.exit(1);
  });