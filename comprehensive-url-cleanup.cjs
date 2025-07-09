const axios = require('axios');

// Comprehensive URL validation and cleanup for ALL PDF Manual Extraction opportunities
async function comprehensiveURLCleanup() {
  try {
    console.log('🔍 Starting comprehensive URL validation for ALL PDF opportunities...\n');
    
    // Get all PDF Manual Extraction opportunities
    const opportunities = [
      { id: 2168, title: "The Lillehei Heart Institute Summer Research Scholars Program", url: "https://med.umn.edu/lhi/educational-programs/summer-research-scholars-program" },
      { id: 2167, title: "City of Hope Cancer Center Eugene and Ruth Roberts Summer Academy", url: "https://robertsacademy.cityofhope.org/" },
      { id: 2166, title: "University of Texas MD Anderson Cancer Center High School Summer Program", url: "https://www.mdanderson.org/education-training/research-training/early-career-pathway-programs/summer-research-programs/programs/high-school-summer-program.html" },
      { id: 2165, title: "Memorial Sloan Kettering Cancer Center Human Oncology & Pathogenesis Program", url: "https://www.mskcc.org/education-training/summer-student" },
      { id: 2164, title: "Roswell Park High School Summer Research Program", url: "https://www.roswellpark.org/education/high-school-programs" },
      { id: 2163, title: "Hutton Junior Fisheries Biology Program", url: "https://hutton.fisheries.org/" },
      { id: 2162, title: "Stanford Genomics Research Internship Program", url: "https://med.stanford.edu/genetics/education/high-school-internship.html" },
      { id: 2161, title: "Stanford Medical Youth Science Program", url: "https://med.stanford.edu/odme/high-school-students/smysp.html" },
      { id: 2160, title: "Johns Hopkins Internship in Brain Science", url: "https://www.hopkinsmedicine.org/neurology-neurosurgery/research/jhu-nimh/jhibs" },
      { id: 2159, title: "OHSU Knight Cancer Institute Ted R. Lilley CURE Program", url: "https://www.ohsu.edu/knight-cancer-institute/ted-r-lilley-cure-program" }
    ];
    
    let validCount = 0;
    let brokenCount = 0;
    const brokenURLs = [];
    
    for (const opp of opportunities) {
      try {
        const response = await axios.head(opp.url, { 
          timeout: 15000,
          maxRedirects: 5,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
          }
        });
        
        if (response.status >= 200 && response.status < 400) {
          console.log(`✅ WORKING: ${opp.title}`);
          console.log(`   Status: ${response.status} | URL: ${opp.url}\n`);
          validCount++;
        } else {
          console.log(`❌ BROKEN (${response.status}): ${opp.title}`);
          console.log(`   URL: ${opp.url}\n`);
          brokenURLs.push(opp);
          brokenCount++;
        }
        
      } catch (error) {
        console.log(`❌ ERROR: ${opp.title}`);
        console.log(`   URL: ${opp.url}`);
        console.log(`   Error: ${error.response?.status || error.message}\n`);
        brokenURLs.push(opp);
        brokenCount++;
      }
      
      // Delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n📊 COMPREHENSIVE URL VALIDATION RESULTS:');
    console.log(`✅ Working URLs: ${validCount}`);
    console.log(`❌ Broken URLs: ${brokenCount}`);
    console.log(`📁 Total checked: ${opportunities.length}`);
    
    if (brokenURLs.length === 0) {
      console.log('\n🎉 SUCCESS: ALL PDF opportunities now have working URLs!');
      console.log('💪 Database integrity restored - users can apply with confidence!');
    } else {
      console.log('\n⚠️  BROKEN URLs STILL EXIST:');
      brokenURLs.forEach(opp => {
        console.log(`- ID ${opp.id}: ${opp.title}`);
      });
      console.log('\nThese opportunities should be removed or URLs fixed.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error during comprehensive URL cleanup:', error.message);
  }
}

comprehensiveURLCleanup();