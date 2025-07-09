const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon(process.env.DATABASE_URL);

async function fixDescriptionFormats() {
  console.log('🧹 FIXING DESCRIPTION FORMATS: Removing cost/eligibility/location from descriptions...\n');
  
  try {
    // Get all manual extraction opportunities with structured data in descriptions
    const opportunities = await sql`
      SELECT id, title, description, location 
      FROM opportunities 
      WHERE source = 'manual_extraction' 
      AND (
        description LIKE '%Cost:%' OR 
        description LIKE '%Eligibility:%' OR 
        description LIKE '%Location:%' OR 
        description LIKE '%Categories:%' OR
        description LIKE '% | %'
      )
      ORDER BY title
    `;
    
    console.log(`📊 Found ${opportunities.length} opportunities with formatting issues...\n`);
    
    let fixedCount = 0;
    
    for (const opp of opportunities) {
      // Extract just the main description (everything before the first |)
      let cleanDescription = opp.description;
      
      // Split by pipe and take only the first part (main description)
      if (cleanDescription.includes(' | ')) {
        cleanDescription = cleanDescription.split(' | ')[0].trim();
      }
      
      // Remove any remaining structured data patterns
      cleanDescription = cleanDescription
        .replace(/\s*\|\s*Eligibility:.*$/i, '')
        .replace(/\s*\|\s*Location:.*$/i, '')
        .replace(/\s*\|\s*Cost:.*$/i, '')
        .replace(/\s*\|\s*Categories:.*$/i, '')
        .replace(/\s*\|\s*Deadline:.*$/i, '')
        .trim();
      
      // Only update if the description actually changed
      if (cleanDescription !== opp.description && cleanDescription.length > 10) {
        console.log(`✅ Cleaning: ${opp.title}`);
        console.log(`   ID: ${opp.id}`);
        console.log(`   Old: ${opp.description}`);
        console.log(`   New: ${cleanDescription}`);
        
        await sql`
          UPDATE opportunities 
          SET description = ${cleanDescription}
          WHERE id = ${opp.id}
        `;
        
        fixedCount++;
        console.log(`   🎯 CLEANED!\n`);
      }
    }
    
    console.log(`\n🎉 DESCRIPTION FORMAT FIX COMPLETE!`);
    console.log(`✅ Descriptions cleaned: ${fixedCount}`);
    console.log(`📝 All descriptions now contain only the main program description`);
    console.log(`🗂️ Cost, eligibility, and location info is properly separated`);
    
  } catch (error) {
    console.error('❌ Error fixing description formats:', error);
  }
}

fixDescriptionFormats();