import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixBrokenURLs() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting to fix broken URLs...');
    
    // Get all opportunities with broken URLs
    const brokenUrlsQuery = `
      SELECT id, title, url 
      FROM opportunities 
      WHERE url IS NULL 
         OR url = '' 
         OR url = '#' 
         OR url = ','
         OR LENGTH(url) < 10 
         OR url NOT LIKE 'http%'
         OR url LIKE '%Link here%'
         OR url LIKE '%information_slides%'
         OR url LIKE '%bit.ly%'
         OR url LIKE '%apply.%'
         OR url NOT LIKE '%.%'
    `;
    
    const result = await client.query(brokenUrlsQuery);
    console.log(`Found ${result.rows.length} opportunities with broken URLs`);
    
    for (const row of result.rows) {
      let fixedUrl = '';
      const { id, title, url } = row;
      
      // Try to fix based on patterns
      if (!url || url === '' || url === '#' || url === ',') {
        // Generate Google search URL for the opportunity
        const searchQuery = encodeURIComponent(`${title} application`);
        fixedUrl = `https://www.google.com/search?q=${searchQuery}`;
      } else if (url.includes('momath.org')) {
        fixedUrl = `https://www.${url}`;
      } else if (url.includes('bit.ly/')) {
        fixedUrl = `https://${url}`;
      } else if (url.includes('apply.brooklynda.org')) {
        fixedUrl = `https://${url}`;
      } else if (url.includes('www.GlobalScholar.org')) {
        fixedUrl = `https://${url}`;
      } else if (url.includes('cooperhewitt.org')) {
        fixedUrl = 'https://www.cooperhewitt.org/teen-programs/';
      } else if (url === 'Link here' || url.includes('information_slides')) {
        // Generate Google search URL
        const searchQuery = encodeURIComponent(`${title} application`);
        fixedUrl = `https://www.google.com/search?q=${searchQuery}`;
      } else if (url === 'teen night') {
        const searchQuery = encodeURIComponent(`${title} application`);
        fixedUrl = `https://www.google.com/search?q=${searchQuery}`;
      } else if (!url.includes('http') && url.includes('.')) {
        // Add https:// prefix
        fixedUrl = `https://${url}`;
      } else {
        // Fallback to Google search
        const searchQuery = encodeURIComponent(`${title} application`);
        fixedUrl = `https://www.google.com/search?q=${searchQuery}`;
      }
      
      // Update the URL in database
      await client.query(
        'UPDATE opportunities SET url = $1 WHERE id = $2',
        [fixedUrl, id]
      );
      
      console.log(`✅ Fixed URL for "${title}": ${fixedUrl}`);
    }
    
    console.log('🎉 All broken URLs have been fixed!');
    
    // Verify the fix
    const verifyQuery = `
      SELECT COUNT(*) as broken_count
      FROM opportunities 
      WHERE url IS NULL 
         OR url = '' 
         OR url = '#' 
         OR LENGTH(url) < 10 
         OR url NOT LIKE 'http%'
    `;
    
    const verifyResult = await client.query(verifyQuery);
    console.log(`Remaining broken URLs: ${verifyResult.rows[0].broken_count}`);
    
  } catch (error) {
    console.error('Error fixing URLs:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixBrokenURLs();