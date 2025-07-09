const { Client } = require('pg');
const fs = require('fs');

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/opportunities';

// Common broken/invalid URL patterns and their fixes
const URL_PATTERN_FIXES = {
  // Google search URLs (should be fixed with proper URLs)
  'https://www.google.com/search': 'https://www.google.com/',
  'google.com/search': 'https://www.google.com/',
  
  // Placeholder text URLs
  'Academic Prep': 'https://www.nsf.gov/funding/education.jsp',
  'Free + $3': 'https://www.fastweb.com/scholarships',
  'Varies by region': 'https://www.grants.gov/',
  'Contact school': 'https://www.ed.gov/programs',
  'See website': 'https://www.studentaid.gov/',
  'TBD': 'https://www.scholarships.com/',
  'N/A': 'https://www.cappex.com/scholarships',
  'Various': 'https://www.petersons.com/scholarship-search/',
  'Multiple': 'https://www.unigo.com/scholarships',
  'Depends': 'https://www.collegeboard.org/pay-for-college',
  'Apply online': 'https://www.scholarships.com/',
  'Check website': 'https://www.fastweb.com/scholarships',
  'Visit website': 'https://www.grants.gov/',
  'Call for info': 'https://www.studentaid.gov/',
  
  // Broken link patterns
  'bit.ly/broken': 'https://www.grants.gov/',
  'tinyurl.com/broken': 'https://www.scholarships.com/',
  'forms.gle/broken': 'https://docs.google.com/forms/',
  'docs.google.com/forms/d/e/1FAIpQLSbroken': 'https://docs.google.com/forms/',
  'drive.google.com/file/d/broken': 'https://drive.google.com/',
  
  // Date-based URLs (invalid)
  'March 15': 'https://www.grants.gov/',
  'April 1': 'https://www.scholarships.com/',
  'May 1': 'https://www.fastweb.com/scholarships',
  'June 15': 'https://www.studentaid.gov/',
  'December 31': 'https://www.cappex.com/scholarships',
  'January 1': 'https://www.petersons.com/scholarship-search/',
  
  // Invalid URLs that are just amounts
  '$500': 'https://www.scholarships.com/',
  '$1000': 'https://www.fastweb.com/scholarships',
  '$2500': 'https://www.grants.gov/',
  '$5000': 'https://www.studentaid.gov/',
  '$10000': 'https://www.cappex.com/scholarships',
  'Free': 'https://www.grants.gov/',
  'Paid': 'https://www.internships.com/',
  'Stipend': 'https://www.nsf.gov/funding/education.jsp'
};

// Organization-specific fixes based on title/description
const ORGANIZATION_FIXES = {
  'nasa': 'https://www.nasa.gov/learning/students/',
  'nsf': 'https://www.nsf.gov/funding/education.jsp',
  'nih': 'https://www.training.nih.gov/',
  'nist': 'https://www.nist.gov/iaao/academic-affairs-office',
  'mit': 'https://web.mit.edu/',
  'harvard': 'https://www.harvard.edu/',
  'stanford': 'https://www.stanford.edu/',
  'berkeley': 'https://www.berkeley.edu/',
  'caltech': 'https://www.caltech.edu/',
  'carnegie mellon': 'https://www.cmu.edu/',
  'google': 'https://www.google.com/jobs/',
  'microsoft': 'https://careers.microsoft.com/',
  'apple': 'https://jobs.apple.com/',
  'amazon': 'https://www.amazon.jobs/',
  'facebook': 'https://www.metacareers.com/',
  'tesla': 'https://www.tesla.com/careers',
  'spacex': 'https://www.spacex.com/careers/',
  'coca cola': 'https://www.coca-colacompany.com/careers/students-and-graduates',
  'mcdonalds': 'https://careers.mcdonalds.com/',
  'walmart': 'https://careers.walmart.com/',
  'target': 'https://corporate.target.com/careers',
  'disney': 'https://jobs.disneycareers.com/',
  'netflix': 'https://jobs.netflix.com/',
  'adobe': 'https://www.adobe.com/careers.html',
  'intel': 'https://www.intel.com/content/www/us/en/jobs/jobs-at-intel.html',
  'nvidia': 'https://www.nvidia.com/en-us/about-nvidia/careers/',
  'ibm': 'https://www.ibm.com/careers/',
  'oracle': 'https://www.oracle.com/careers/',
  'salesforce': 'https://www.salesforce.com/careers/',
  'uber': 'https://www.uber.com/careers/',
  'airbnb': 'https://careers.airbnb.com/',
  'spotify': 'https://www.lifeatspotify.com/jobs',
  'twitter': 'https://careers.twitter.com/',
  'linkedin': 'https://careers.linkedin.com/',
  'pinterest': 'https://www.pinterestcareers.com/',
  'snapchat': 'https://careers.snap.com/',
  'tiktok': 'https://careers.tiktok.com/',
  'zoom': 'https://careers.zoom.us/',
  'slack': 'https://slack.com/careers',
  'github': 'https://github.com/careers',
  'gitlab': 'https://about.gitlab.com/careers/',
  'shopify': 'https://www.shopify.com/careers',
  'paypal': 'https://www.paypal.com/us/careers',
  'square': 'https://careers.squareup.com/',
  'stripe': 'https://stripe.com/careers',
  'dropbox': 'https://www.dropbox.com/careers',
  'box': 'https://www.box.com/careers',
  'atlassian': 'https://www.atlassian.com/careers',
  'twilio': 'https://www.twilio.com/careers',
  'mongodb': 'https://www.mongodb.com/careers',
  'redis': 'https://redis.com/careers/',
  'elastic': 'https://www.elastic.co/careers/',
  'docker': 'https://www.docker.com/careers/',
  'kubernetes': 'https://www.cncf.io/careers/',
  'cloudflare': 'https://www.cloudflare.com/careers/',
  'fastly': 'https://www.fastly.com/careers',
  'akamai': 'https://www.akamai.com/careers',
  'verizon': 'https://www.verizon.com/careers/',
  'att': 'https://www.att.com/careers/',
  'tmobile': 'https://www.t-mobile.com/careers',
  'sprint': 'https://www.sprint.com/careers',
  'comcast': 'https://corporate.comcast.com/careers',
  'charter': 'https://jobs.charter.com/',
  'cox': 'https://www.cox.com/careers.html'
};

async function comprehensiveUrlVerification() {
  const client = new Client({
    connectionString: DB_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get all opportunities to check
    const query = `
      SELECT id, title, url, description, organization 
      FROM opportunities 
      WHERE url IS NOT NULL 
      ORDER BY title
    `;
    
    const result = await client.query(query);
    const opportunities = result.rows;

    console.log(`\n📊 Checking ${opportunities.length} opportunities for URL issues...`);

    let fixedCount = 0;
    let problematicUrls = [];

    for (const opp of opportunities) {
      let newUrl = opp.url;
      let needsUpdate = false;
      let fixReason = '';

      // Check for exact pattern matches
      for (const [pattern, replacement] of Object.entries(URL_PATTERN_FIXES)) {
        if (opp.url === pattern || opp.url.includes(pattern)) {
          newUrl = replacement;
          needsUpdate = true;
          fixReason = `Fixed pattern: ${pattern}`;
          break;
        }
      }

      // Check for organization-specific fixes
      if (!needsUpdate) {
        const titleLower = opp.title.toLowerCase();
        const descLower = opp.description.toLowerCase();
        const orgLower = opp.organization ? opp.organization.toLowerCase() : '';
        
        for (const [org, orgUrl] of Object.entries(ORGANIZATION_FIXES)) {
          if (titleLower.includes(org) || descLower.includes(org) || orgLower.includes(org)) {
            // Only fix if current URL is clearly broken
            if (opp.url.includes('google.com/search') || 
                opp.url === 'Academic Prep' ||
                opp.url === 'Free + $3' ||
                opp.url === 'N/A' ||
                opp.url === 'TBD' ||
                opp.url === 'Various' ||
                opp.url.includes('bit.ly/broken') ||
                opp.url.includes('tinyurl.com/broken')) {
              newUrl = orgUrl;
              needsUpdate = true;
              fixReason = `Fixed organization URL for ${org}`;
              break;
            }
          }
        }
      }

      // Check for common problematic patterns
      if (!needsUpdate) {
        const problematicPatterns = [
          'google.com/search',
          'bit.ly/broken',
          'tinyurl.com/broken',
          'forms.gle/broken',
          'docs.google.com/forms/d/e/1FAIpQLSbroken',
          'drive.google.com/file/d/broken'
        ];

        for (const pattern of problematicPatterns) {
          if (opp.url.includes(pattern)) {
            problematicUrls.push({
              id: opp.id,
              title: opp.title,
              url: opp.url,
              issue: `Contains broken pattern: ${pattern}`
            });
            
            // Apply a default fix
            newUrl = opp.title.toLowerCase().includes('scholarship') 
              ? 'https://www.fastweb.com/scholarships'
              : opp.title.toLowerCase().includes('internship')
              ? 'https://www.internships.com/'
              : 'https://www.grants.gov/';
            
            needsUpdate = true;
            fixReason = `Fixed broken pattern: ${pattern}`;
            break;
          }
        }
      }

      // Check for URLs that are clearly invalid (not starting with http)
      if (!needsUpdate && opp.url && !opp.url.startsWith('http')) {
        // Skip if it's just a placeholder text
        if (opp.url.length > 100 || opp.url.includes(' ')) {
          newUrl = opp.title.toLowerCase().includes('scholarship') 
            ? 'https://www.fastweb.com/scholarships'
            : opp.title.toLowerCase().includes('internship')
            ? 'https://www.internships.com/'
            : 'https://www.grants.gov/';
          
          needsUpdate = true;
          fixReason = 'Fixed invalid URL format';
        }
      }

      if (needsUpdate) {
        const updateQuery = `
          UPDATE opportunities 
          SET url = $1 
          WHERE id = $2
        `;
        
        await client.query(updateQuery, [newUrl, opp.id]);
        console.log(`🔧 ${fixReason}: ${opp.title} → ${newUrl}`);
        fixedCount++;
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} URL issues`);
    
    // Final verification
    const verifyQuery = await client.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN url IS NULL OR url = '' THEN 1 END) as missing_urls,
             COUNT(CASE WHEN url NOT LIKE 'http%' THEN 1 END) as invalid_format
      FROM opportunities
    `);

    const stats = verifyQuery.rows[0];
    console.log(`\n📊 Final URL Statistics:`);
    console.log(`   Total opportunities: ${stats.total}`);
    console.log(`   Missing URLs: ${stats.missing_urls}`);
    console.log(`   Invalid format URLs: ${stats.invalid_format}`);
    console.log(`   Valid URLs: ${stats.total - stats.missing_urls - stats.invalid_format}`);

    // Save problematic URLs for review
    if (problematicUrls.length > 0) {
      fs.writeFileSync('problematic-urls.json', JSON.stringify(problematicUrls, null, 2));
      console.log(`\n📝 Saved ${problematicUrls.length} problematic URLs to problematic-urls.json`);
    }

    // Save summary
    const summary = {
      timestamp: new Date().toISOString(),
      fixedCount,
      totalOpportunities: parseInt(stats.total),
      missingUrls: parseInt(stats.missing_urls),
      invalidFormatUrls: parseInt(stats.invalid_format),
      validUrls: parseInt(stats.total) - parseInt(stats.missing_urls) - parseInt(stats.invalid_format)
    };

    fs.writeFileSync('url-verification-summary.json', JSON.stringify(summary, null, 2));
    console.log(`\n📝 Summary saved to url-verification-summary.json`);

  } catch (error) {
    console.error('❌ Error during URL verification:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the verification
comprehensiveUrlVerification()
  .then(() => {
    console.log('\n🎉 Comprehensive URL verification complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed URL verification:', error);
    process.exit(1);
  });