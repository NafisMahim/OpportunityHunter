const { neon } = require('@neondatabase/serverless');
const axios = require('axios');

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Immediate fixes for specific broken URLs
const IMMEDIATE_FIXES = {
  "National Hispanic Youth Initiative Program": "https://www.lmm.org/page/nhy-initiative",
  "West Point Summer Leaders Seminar": "https://www.westpoint.edu/admissions/prospective-students/visit-west-point/summer-leaders-seminar",
  "NASA Goddard High School Internship Program": "https://www.nasa.gov/goddard/education/high-school-internship-program",
  "MIT Beaver Works": "https://beaverworks.ll.mit.edu/CMS/bw/bwsi",
  "MIT PRIMES": "https://math.mit.edu/research/highschool/primes/",
  "MITES & MOSTEC": "https://oeop.mit.edu/programs/mites",
  "NASA SEES": "https://www.csr.utexas.edu/education/sees/",
  "NASA SEES High School Summer Intern Program": "https://www.csr.utexas.edu/education/sees/",
  "Princeton SJP": "https://www.princeton.edu/meet-princeton/diversity-visits/summer-journalism-program/",
  "U.S. Senate Page": "https://www.senate.gov/reference/reference_index_subjects/Pages_vrd.htm",
  "Stanford SHTEM Summer Internships": "https://compression.stanford.edu/outreach/shtem-summer-internships",
  "CrEST @ NYU": "https://engineering.nyu.edu/academics/programs/k12-stem-education/crest",
  "Duke University Talent Identification Program Field Studies": "https://tip.duke.edu/field-studies",
  "Emory University Preview Program": "https://apply.emory.edu/discover/visit.html",
  "Johns Hopkins University HOME Program": "https://apply.jhu.edu/visit/diversity-programs/home-program/",
  "University of Pennsylvania PEEP": "https://www.admissions.upenn.edu/visit/overnight-programs",
  "Weill Cornell Medicine High School Programs (2 programs)": "https://weill.cornell.edu/education/high-school-and-undergraduate-programs",
  "HK Maker Lab @ Columbia University": "https://www.engineering.columbia.edu/outreach/hk-maker-lab",
  "NYU Visionary Studio Workshop": "https://steinhardt.nyu.edu/programs/media-culture-communication/undergraduate",
  "Horizons NYC": "https://horizonsnyc.org",
  "Ghetto Film School NYC Fellows Program": "https://ghettofilm.org",
  "PowerPlay NYC: SuperSTARS Leadership Academy": "https://powerplaynyc.org",
  "NYC FIRST STEM Centers and Robotics Programs": "https://www.nycfirst.org",
  "STEM Kids NYC Teen Science Cafe": "https://www.stemkidsnyc.org",
  "Urban Word NYC Youth Programs": "https://urbanwordnyc.org",
  "YWCA of the City of New York - Girls Initiatives": "https://www.ywcanyc.org",
  "YYGS": "https://globalscholars.yale.edu",
  "Youth Action YouthBuild (YAYB)": "https://youthactionnyc.org",
  "Youth Food Advocates": "https://www.schoolfoodnyc.org",
  "Writopia: Write-to-Recognition (W2R) Program": "https://www.writopia.com",
  "YC Magazine Teens: Write for Us": "https://www.ycmagazine.org"
};

async function verifyAllManualURLs() {
  console.log('🚨 EMERGENCY: VERIFYING AND FIXING ALL MANUAL EXTRACTION URLs...\n');
  
  try {
    // First apply immediate fixes
    console.log('🔧 Applying immediate fixes for known broken URLs...\n');
    
    for (const [title, newUrl] of Object.entries(IMMEDIATE_FIXES)) {
      console.log(`🔧 Immediate fix: ${title}`);
      console.log(`   New URL: ${newUrl}`);
      
      const result = await sql`
        UPDATE opportunities 
        SET url = ${newUrl}
        WHERE title = ${title} AND source = 'manual_extraction'
      `;
      
      if (result.count > 0) {
        console.log(`   ✅ Fixed successfully\n`);
      } else {
        console.log(`   ⚠️ No matching record found\n`);
      }
    }
    
    // Get all manual extraction opportunities
    const opportunities = await sql`
      SELECT id, title, url 
      FROM opportunities 
      WHERE source = 'manual_extraction'
      ORDER BY title
    `;
    
    console.log(`📊 Found ${opportunities.length} manual extraction opportunities to verify\n`);
    
    const brokenURLs = [];
    const workingURLs = [];
    let checkedCount = 0;
    
    // Test each URL
    for (const opp of opportunities) {
      checkedCount++;
      
      try {
        // Skip obvious placeholder URLs
        if (opp.url.includes('example.com') || 
            opp.url.includes('placeholder') || 
            opp.url.includes('$') ||
            opp.url.includes('test.') ||
            opp.url.length < 10) {
          brokenURLs.push({ ...opp, error: 'Placeholder URL' });
          console.log(`❌ Broken (placeholder): ${opp.title} - ${opp.url}`);
          continue;
        }
        
        // Test the URL with a quick HEAD request
        const response = await axios.head(opp.url, {
          timeout: 3000,
          validateStatus: function (status) {
            return status >= 200 && status < 400;
          },
          maxRedirects: 3
        });
        
        workingURLs.push(opp);
        console.log(`✅ Working: ${opp.title}`);
        
      } catch (error) {
        let errorType = 'Unknown error';
        
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          errorType = 'Domain not found/refused';
        } else if (error.code === 'ETIMEDOUT') {
          errorType = 'Timeout';
        } else if (error.response && error.response.status >= 400) {
          errorType = `HTTP ${error.response.status}`;
        }
        
        brokenURLs.push({ ...opp, error: errorType });
        console.log(`❌ Broken: ${opp.title} - ${errorType} - ${opp.url}`);
      }
      
      // Progress indicator
      if (checkedCount % 20 === 0) {
        console.log(`📊 Checked ${checkedCount}/${opportunities.length} URLs...\n`);
        // Small delay to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`\n🎯 VERIFICATION COMPLETE:`);
    console.log(`✅ Working URLs: ${workingURLs.length}`);
    console.log(`❌ Broken URLs: ${brokenURLs.length}`);
    console.log(`📊 Total checked: ${checkedCount}`);
    
    if (brokenURLs.length > 0) {
      console.log(`\n💥 BROKEN URLs THAT NEED IMMEDIATE FIXING:`);
      brokenURLs.forEach(opp => {
        console.log(`   ID ${opp.id}: ${opp.title} - ${opp.error}`);
        console.log(`   URL: ${opp.url}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error verifying URLs:', error);
  }
}

verifyAllManualURLs();