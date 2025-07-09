const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon(process.env.DATABASE_URL);

async function finalValidationCheck() {
  console.log('🔍 FINAL VALIDATION: Checking critical fixes...\n');
  
  try {
    // Check Shad Canada specifically
    const shadCanada = await sql`
      SELECT id, title, url, description 
      FROM opportunities 
      WHERE title = 'Shad Canada'
    `;
    
    if (shadCanada.length > 0) {
      console.log('✅ SHAD CANADA STATUS:');
      console.log(`   Title: ${shadCanada[0].title}`);
      console.log(`   URL: ${shadCanada[0].url}`);
      console.log(`   Description length: ${shadCanada[0].description.length} chars`);
      console.log(`   Has bullet points: ${shadCanada[0].description.includes('•') ? 'YES' : 'NO'}\n`);
    }
    
    // Check other critical programs
    const criticalPrograms = await sql`
      SELECT title, url, LENGTH(description) as desc_length
      FROM opportunities 
      WHERE source = 'manual_extraction' 
      AND title IN ('PROMYS', 'Girls Who Code SIP', 'MIT PRIMES', 'NASA SEES', 'MIT Beaver Works')
      ORDER BY title
    `;
    
    console.log('🎯 CRITICAL PROGRAMS STATUS:');
    for (const program of criticalPrograms) {
      console.log(`✅ ${program.title}:`);
      console.log(`   URL: ${program.url}`);
      console.log(`   Description: ${program.desc_length} chars\n`);
    }
    
    // Check for any remaining problematic URLs
    const problematicUrls = await sql`
      SELECT COUNT(*) as count
      FROM opportunities 
      WHERE source = 'manual_extraction' 
      AND (
        url LIKE '%svg%' OR
        url LIKE '%.svg' OR
        url LIKE '%image%' OR
        url LIKE '%placeholder%' OR
        url LIKE '%example.%' OR
        url LIKE '%test.%' OR
        LENGTH(url) < 15
      )
    `;
    
    console.log(`🔧 REMAINING PROBLEMATIC URLs: ${problematicUrls[0].count}`);
    
    // Check description formats
    const bulletPointCheck = await sql`
      SELECT COUNT(*) as with_bullets
      FROM opportunities 
      WHERE source = 'manual_extraction' 
      AND description LIKE '%•%'
    `;
    
    console.log(`📋 OPPORTUNITIES WITH BULLET POINTS: ${bulletPointCheck[0].with_bullets}`);
    
    // Check short descriptions
    const shortDescriptions = await sql`
      SELECT COUNT(*) as short_count
      FROM opportunities 
      WHERE source = 'manual_extraction' 
      AND LENGTH(description) < 100
    `;
    
    console.log(`📝 SHORT DESCRIPTIONS REMAINING: ${shortDescriptions[0].short_count}`);
    
    console.log('\n🎉 VALIDATION COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error in validation:', error);
  }
}

finalValidationCheck();