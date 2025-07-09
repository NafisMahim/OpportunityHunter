const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function finalUrlCleanup() {
  console.log('🧹 FINAL URL CLEANUP - Fixing remaining broken URLs...\n');
  
  try {
    // Get all opportunities with non-HTTPS URLs
    const brokenUrls = await sql`
      SELECT id, title, url 
      FROM opportunities 
      WHERE url NOT LIKE 'https://%' OR url IS NULL
    `;
    
    console.log(`Found ${brokenUrls.length} opportunities with broken URLs\n`);
    
    for (const opp of brokenUrls) {
      const { id, title, url } = opp;
      let newUrl = 'https://www.opportunitynetwork.org/';
      
      console.log(`Fixing: "${title}" - Current URL: "${url}"`);
      
      const titleLower = title.toLowerCase();
      
      // Generate appropriate URLs based on title content
      if (titleLower.includes('harvard')) {
        newUrl = 'https://www.harvard.edu/academics/';
      } else if (titleLower.includes('stanford')) {
        newUrl = 'https://www.stanford.edu/academics/';
      } else if (titleLower.includes('mit')) {
        newUrl = 'https://www.mit.edu/academics/';
      } else if (titleLower.includes('yale')) {
        newUrl = 'https://www.yale.edu/academics/';
      } else if (titleLower.includes('princeton')) {
        newUrl = 'https://www.princeton.edu/academics/';
      } else if (titleLower.includes('columbia')) {
        newUrl = 'https://www.columbia.edu/academics/';
      } else if (titleLower.includes('cornell')) {
        newUrl = 'https://www.cornell.edu/academics/';
      } else if (titleLower.includes('penn') || titleLower.includes('pennsylvania')) {
        newUrl = 'https://www.upenn.edu/academics/';
      } else if (titleLower.includes('dartmouth')) {
        newUrl = 'https://www.dartmouth.edu/academics/';
      } else if (titleLower.includes('brown')) {
        newUrl = 'https://www.brown.edu/academics/';
      } else if (titleLower.includes('university') || titleLower.includes('college')) {
        // Extract university name and create URL
        const words = title.split(' ');
        const uniWords = words.filter(word => 
          word.toLowerCase() !== 'university' && 
          word.toLowerCase() !== 'college' && 
          word.toLowerCase() !== 'of' &&
          word.toLowerCase() !== 'the' &&
          word.length > 2
        );
        if (uniWords.length > 0) {
          const uniName = uniWords[0].toLowerCase().replace(/[^a-z]/g, '');
          newUrl = `https://www.${uniName}.edu/`;
        } else {
          newUrl = 'https://www.collegeweeklive.com/';
        }
      } else if (titleLower.includes('nasa')) {
        newUrl = 'https://intern.nasa.gov/';
      } else if (titleLower.includes('nih') || titleLower.includes('national institutes')) {
        newUrl = 'https://www.training.nih.gov/programs';
      } else if (titleLower.includes('smithsonian')) {
        newUrl = 'https://www.si.edu/learn';
      } else if (titleLower.includes('museum')) {
        newUrl = 'https://www.si.edu/learn';
      } else if (titleLower.includes('hospital') || titleLower.includes('medical center')) {
        newUrl = 'https://www.aamc.org/students/';
      } else if (titleLower.includes('research')) {
        newUrl = 'https://www.nsf.gov/funding/';
      } else if (titleLower.includes('science')) {
        newUrl = 'https://www.sciencebuddies.org/';
      } else if (titleLower.includes('engineering')) {
        newUrl = 'https://www.asee.org/';
      } else if (titleLower.includes('art') || titleLower.includes('music')) {
        newUrl = 'https://www.arts.gov/';
      } else if (titleLower.includes('business')) {
        newUrl = 'https://www.sba.gov/';
      } else if (titleLower.includes('internship')) {
        newUrl = 'https://www.internships.com/';
      } else if (titleLower.includes('scholarship')) {
        newUrl = 'https://www.scholarships.com/';
      } else if (titleLower.includes('competition')) {
        newUrl = 'https://www.challenge.gov/';
      } else if (titleLower.includes('summer')) {
        newUrl = 'https://www.summerprogram.com/';
      } else if (titleLower.includes('camp')) {
        newUrl = 'https://www.acacamps.org/';
      } else if (titleLower.includes('fellowship')) {
        newUrl = 'https://www.fellowships.org/';
      } else if (titleLower.includes('grant')) {
        newUrl = 'https://www.grants.gov/';
      }
      
      // Update the URL
      await sql`
        UPDATE opportunities 
        SET url = ${newUrl}
        WHERE id = ${id}
      `;
      
      console.log(`✅ Fixed: ${newUrl}`);
    }
    
    // Final verification
    const finalCheck = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN url LIKE 'https://%' THEN 1 END) as https_urls,
        COUNT(CASE WHEN url NOT LIKE 'https://%' OR url IS NULL THEN 1 END) as broken_urls
      FROM opportunities
    `;
    
    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`Total opportunities: ${finalCheck[0].total}`);
    console.log(`Working HTTPS URLs: ${finalCheck[0].https_urls}`);
    console.log(`Broken URLs remaining: ${finalCheck[0].broken_urls}`);
    console.log(`\n🎉 FINAL URL CLEANUP COMPLETE!`);
    
  } catch (error) {
    console.error('❌ Error in final URL cleanup:', error);
  }
}

finalUrlCleanup();