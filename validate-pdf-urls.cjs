const axios = require('axios');

// Check URL validity for PDF extracted opportunities
async function validatePDFURLs() {
  try {
    const opportunities = [
      { id: 2168, title: "The Lillehei Heart Institute Summer Research Scholars Program", url: "https://www.lhi.umn.edu/education/summer-research-scholars-program" },
      { id: 2167, title: "City of Hope Cancer Center Eugene and Ruth Roberts Summer Academy", url: "https://www.cityofhope.org/education/summer-academy" },
      { id: 2166, title: "University of Texas MD Anderson Cancer Center High School Summer Program", url: "https://www.mdanderson.org/education-training/student-education/summer-research-program.html" },
      { id: 2165, title: "Memorial Sloan Kettering Cancer Center Human Oncology & Pathogenesis Program", url: "https://www.mskcc.org/education-training/high-school/human-oncology-pathogenesis-program" },
      { id: 2164, title: "Roswell Park High School Summer Research Program", url: "https://www.roswellpark.edu/education/high-school-summer-research-program" },
      { id: 2163, title: "Hutton Junior Fisheries Biology Program", url: "https://fish.uw.edu/students/undergraduate-program/hutton-junior-fisheries-biology-program/" },
      { id: 2162, title: "Stanford Genomics Research Internship Program", url: "https://med.stanford.edu/genetics/education/high-school-programs.html" },
      { id: 2161, title: "Stanford Medical Youth Science Program", url: "https://med.stanford.edu/mysp.html" },
      { id: 2160, title: "Johns Hopkins Internship in Brain Science", url: "https://www.hopkinsmedicine.org/neurology_neurosurgery/education/internship-brain-science" },
      { id: 2159, title: "OHSU Knight Cancer Institute Ted R. Lilley CURE Program", url: "https://www.ohsu.edu/knight-cancer-institute/cure-program" }
    ];

    console.log('🔍 Validating PDF extracted opportunity URLs...\n');
    
    let validCount = 0;
    let brokenCount = 0;
    const brokenURLs = [];
    
    for (const opp of opportunities) {
      try {
        const response = await axios.head(opp.url, { 
          timeout: 10000,
          maxRedirects: 5,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.status >= 200 && response.status < 400) {
          console.log(`✅ VALID: ${opp.title}`);
          console.log(`   URL: ${opp.url}\n`);
          validCount++;
        } else {
          console.log(`❌ BROKEN (${response.status}): ${opp.title}`);
          console.log(`   URL: ${opp.url}\n`);
          brokenURLs.push(opp);
          brokenCount++;
        }
        
        // Small delay to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ ERROR: ${opp.title}`);
        console.log(`   URL: ${opp.url}`);
        console.log(`   Error: ${error.message}\n`);
        brokenURLs.push(opp);
        brokenCount++;
      }
    }
    
    console.log('\n📊 PDF URL VALIDATION SUMMARY:');
    console.log(`✅ Valid URLs: ${validCount}`);
    console.log(`❌ Broken URLs: ${brokenCount}`);
    console.log(`📁 Total checked: ${opportunities.length}`);
    
    if (brokenURLs.length > 0) {
      console.log('\n🔧 BROKEN URLs NEED FIXING:');
      brokenURLs.forEach(opp => {
        console.log(`- ID ${opp.id}: ${opp.title}`);
        console.log(`  URL: ${opp.url}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fatal error during URL validation:', error.message);
  }
}

validatePDFURLs();