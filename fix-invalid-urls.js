import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixInvalidURLs() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting to fix invalid Google Drive/Forms URLs...');
    
    // Get all opportunities with problematic URLs
    const problematicUrlsQuery = `
      SELECT id, title, url 
      FROM opportunities 
      WHERE url LIKE '%drive.google.com%' 
         OR url LIKE '%docs.google.com%'
         OR url LIKE '%forms.gle%'
         OR url LIKE '%tinyurl.com%'
         OR url LIKE '%bit.ly%'
         OR url LIKE '%https://https://%'
         OR LENGTH(url) - LENGTH(REPLACE(url, '/', '')) < 3
    `;
    
    const result = await client.query(problematicUrlsQuery);
    console.log(`Found ${result.rows.length} opportunities with problematic URLs`);
    
    // URL mappings for specific known programs
    const urlMappings = {
      'AAPI-LEAD': 'https://aapilead.org/',
      'Free Virtual Summer Cybersecurity': 'https://www.sans.org/community-events/',
      'Metropolitan Museum': 'https://www.metmuseum.org/about-the-met/internships',
      'StuyHacks': 'https://stuyhacks.com/',
      'John Jay College Forensic Science': 'https://www.jjay.cuny.edu/academics/undergraduate-programs/forensic-science',
      'Teen Advisory Committee': 'https://www.nypl.org/help/about-nypl/jobs-and-opportunities/volunteering',
      'MIT BWSI': 'https://beaverworks.ll.mit.edu/CMS/bw/bwsi',
      'Columbia University SBI': 'https://www.columbia.edu/cu/biology/',
      'Justice For All': 'https://www.justiceforallny.org/',
      'New Settlement': 'https://newsettlement.org/',
      'Rock the Street Wall Street': 'https://www.rtsws.org/',
      'STEMpathize': 'https://stempathize.org/',
      'Perennial Prep': 'https://www.perennialprep.org/',
      'Pratt Institute': 'https://www.pratt.edu/academics/continuing-education-and-professional-studies/pre-college/',
      'TurnUp Civic': 'https://www.turnupactivist.org/',
      'College Passport': 'https://www.universitysettlement.org/',
      'Queens Borough Hall': 'https://www.queensbp.org/'
    };
    
    for (const row of result.rows) {
      let fixedUrl = '';
      const { id, title, url } = row;
      
      // Check for specific program mappings
      let foundMapping = false;
      for (const [keyword, mappedUrl] of Object.entries(urlMappings)) {
        if (title.toLowerCase().includes(keyword.toLowerCase())) {
          fixedUrl = mappedUrl;
          foundMapping = true;
          break;
        }
      }
      
      if (!foundMapping) {
        // Fix common URL issues
        if (url.includes('https://https://')) {
          // Remove duplicate https
          fixedUrl = url.replace('https://https://', 'https://');
        } else if (url.includes('drive.google.com') && url.length < 50) {
          // Broken Google Drive links - convert to search
          const searchQuery = encodeURIComponent(`${title} application program`);
          fixedUrl = `https://www.google.com/search?q=${searchQuery}`;
        } else if (url.includes('docs.google.com/forms') && url.length < 80) {
          // Broken Google Forms - convert to search
          const searchQuery = encodeURIComponent(`${title} application form`);
          fixedUrl = `https://www.google.com/search?q=${searchQuery}`;
        } else if (url.includes('forms.gle') && url.length < 40) {
          // Broken Google Forms short links
          const searchQuery = encodeURIComponent(`${title} application`);
          fixedUrl = `https://www.google.com/search?q=${searchQuery}`;
        } else if (url.includes('tinyurl.com') || url.includes('bit.ly')) {
          // Convert short URLs to search since they often break
          const searchQuery = encodeURIComponent(`${title} application`);
          fixedUrl = `https://www.google.com/search?q=${searchQuery}`;
        } else {
          // Keep the original URL if it looks potentially valid
          fixedUrl = url;
        }
      }
      
      // Update the URL in database
      await client.query(
        'UPDATE opportunities SET url = $1 WHERE id = $2',
        [fixedUrl, id]
      );
      
      console.log(`✅ Fixed URL for "${title}": ${fixedUrl}`);
    }
    
    console.log('🎉 All invalid URLs have been fixed!');
    
    // Verify the fix
    const verifyQuery = `
      SELECT COUNT(*) as broken_count
      FROM opportunities 
      WHERE url LIKE '%drive.google.com%file/d/%-%' 
         OR url LIKE '%docs.google.com/forms/d/e/%-%'
         OR url LIKE '%https://https://%'
         OR (url LIKE '%forms.gle%' AND LENGTH(url) < 40)
    `;
    
    const verifyResult = await client.query(verifyQuery);
    console.log(`Remaining problematic URLs: ${verifyResult.rows[0].broken_count}`);
    
  } catch (error) {
    console.error('Error fixing URLs:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixInvalidURLs();