const axios = require('axios');

// Validate ALL PDF Manual Extraction opportunities
async function validateAllPDFURLs() {
  try {
    console.log('🔍 Validating ALL PDF Manual Extraction URLs...\n');
    
    const opportunities = [
      { id: 2114, title: "Penn State Business Opportunities Summer Session (BOSS)", url: "https://business.psu.edu/undergraduate/academics/experiential-learning/boss" },
      { id: 2115, title: "University of Texas at Austin McCombs School of Business Programs", url: "https://www.mccombs.utexas.edu/high-school" },
      { id: 2116, title: "Indiana University MEET Kelly", url: "https://kelley.iu.edu/programs/undergrad/academics/kelly-direct-admit/meet-kelly/index.cshtml" },
      { id: 2117, title: "TCU Supply Chain Business Technology Camp", url: "https://neeley.tcu.edu/academic-departments/supply-chain-management/high-school-programs/" },
      { id: 2118, title: "Bank of America Student Leaders", url: "https://about.bankofamerica.com/en/making-an-impact/student-leaders" },
      { id: 2119, title: "Indiana University Women's Leadership Institute", url: "https://kelley.iu.edu/programs/undergrad/academics/experiential-learning/women-leadership-institute/index.cshtml" },
      { id: 2120, title: "Girls Who Code Summer Immersion Program", url: "https://girlswhocode.com/programs/summer-immersion-program" },
      { id: 2121, title: "NYU Cyber Security Program", url: "https://engineering.nyu.edu/academics/programs/cybersecurity-ms/bridge/summer-program" },
      { id: 2122, title: "Meta Summer Academy", url: "https://www.metacareers.com/students/" },
      { id: 2123, title: "Carnegie Mellon University AI Scholars", url: "https://www.cmu.edu/pre-college/academic-programs/ai-scholars.html" },
      { id: 2124, title: "Carnegie Mellon University CS Scholars", url: "https://www.cmu.edu/pre-college/academic-programs/computer-science.html" },
      { id: 2125, title: "Carnegie Mellon University Experience Designing Games", url: "https://www.cmu.edu/pre-college/academic-programs/game-design.html" },
      { id: 2126, title: "Stanford Center for AI in Medicine and Imaging Research Internship", url: "https://aimi.stanford.edu/education/high-school-internship" },
      { id: 2127, title: "SMASH Academy", url: "https://www.smash.org/academy/" },
      { id: 2128, title: "Oak Ridge National Laboratory NextGen Pathway to Computing", url: "https://www.ornl.gov/education/nextgen" },
      { id: 2129, title: "Sandia National Laboratories High School Internship", url: "https://www.sandia.gov/careers/students-postdocs/internships/high-school/" },
      { id: 2130, title: "Quest Student Research Institute", url: "https://questresearch.org/programs/high-school/" },
      { id: 2131, title: "Berkeley Climate Ambassadors", url: "https://climate.berkeley.edu/climate-ambassadors" },
      { id: 2132, title: "Tuskegee University Forestry and Natural Resources Summer Program", url: "https://www.tuskegee.edu/programs-courses/colleges-schools/caens/academic-departments/forestry-natural-resources/summer-program" },
      { id: 2133, title: "Tuskegee University AgDiscovery Program", url: "https://www.tuskegee.edu/programs-courses/colleges-schools/caens/academic-departments/agriculture-food-nutritional-sciences/agdiscovery" },
      { id: 2134, title: "North Carolina School of Science and Mathematics Summer Ventures", url: "https://www.ncssm.edu/summer-ventures" },
      { id: 2135, title: "EarthWatch Girls in Science", url: "https://earthwatch.org/teen-expeditions/girls-in-science" },
      { id: 2136, title: "Student Conservation Association National Conservation Crews", url: "https://www.thesca.org/conservation-corps/crew-programs/national-conservation-crews" },
      { id: 2137, title: "Washington University in St. Louis Olin Fleischer Scholars Program", url: "https://olin.wustl.edu/EN-US/academic-programs/specialized-masters/masters-science-finance/fleischer-scholars" },
      { id: 2138, title: "Pomona College Academy for Youth Success", url: "https://www.pomona.edu/administration/pre-college-programs/academy-youth-success" },
      { id: 2139, title: "University of New Hampshire Upward Bound Program", url: "https://www.unh.edu/upward-bound" },
      { id: 2140, title: "Husson's Early College Access Program", url: "https://www.husson.edu/academics/early-college-access-program" },
      { id: 2141, title: "USC Bovard Scholars", url: "https://bovardscholars.usc.edu/" },
      { id: 2142, title: "Drexel's College Access Academy", url: "https://drexel.edu/westphal/academics/undergraduate/pre-college/college-access-academy/" },
      { id: 2143, title: "Telluride Association Summer Seminar (TASS)", url: "https://www.tellurideassociation.org/our-programs/high-school-students/telluride-association-summer-seminar/" },
      { id: 2144, title: "Princeton Summer Journalism Program", url: "https://www.princeton.edu/meet-princeton/pre-college/journalism" },
      { id: 2145, title: "USC Annenberg Youth Academy for Media and Civic Engagement", url: "https://annenberg.usc.edu/youth-academy" },
      { id: 2146, title: "Asian American Journalists Association JCamp", url: "https://www.aaja.org/jcamp" },
      { id: 2147, title: "NYU High School Law Institute", url: "https://www.law.nyu.edu/academics/pre-college" },
      { id: 2148, title: "University of Notre Dame Leadership Seminars", url: "https://precollege.nd.edu/leadership-seminars/" },
      { id: 2149, title: "Sadie Nash's Leadership Summer Institute", url: "https://www.sadienash.org/leadership-institute" },
      { id: 2150, title: "North Carolina School of Science and Mathematics Teamship", url: "https://www.ncssm.edu/teamship" },
      { id: 2151, title: "Chicano Latino Youth Leadership Project High School Program", url: "https://www.clyp.org/high-school-program" },
      { id: 2152, title: "NYU Collegiate Seminar Program", url: "https://www.nyu.edu/students/student-information-and-resources/registration-records-and-graduation/forms-policies-procedures/high-school-programs.html" },
      { id: 2153, title: "U.S. Department of Energy's Introductory College Level Experience in Microbiology (iCLEM)", url: "https://education.lbl.gov/internships/high-school-programs/" },
      { id: 2154, title: "Indiana University Future Scientist Program", url: "https://medicine.iu.edu/departments/biochemistry/education/outreach/future-scientist" },
      { id: 2155, title: "Indiana University Summer Research Program at the Simon Cancer Center", url: "https://cancer.iu.edu/research-trials/shared-resources/research-training/summer-internship/" },
      { id: 2156, title: "UIUC High School Summer STEMM Research Program", url: "https://grad.illinois.edu/diversity/bridge/summer-research" },
      { id: 2157, title: "Fred Hutch Cancer Center Summer High School Internship Program", url: "https://www.fredhutch.org/en/education-training/undergraduate-students/high-school-programs.html" },
      { id: 2158, title: "Seattle Children's Hospital Research Training", url: "https://www.seattlechildrens.org/research/education-and-training/high-school-programs/" },
      { id: 2159, title: "Mayo Clinic SPARK Research Mentorship Program", url: "https://college.mayo.edu/academics/explore-health-care-careers/diversity-programs/spark/" },
      { id: 2160, title: "OHSU Knight Cancer Institute Ted R. Lilley CURE Program", url: "https://www.ohsu.edu/knight-cancer-institute/ted-r-lilley-cure-program" },
      { id: 2161, title: "Johns Hopkins Internship in Brain Science", url: "https://www.hopkinsmedicine.org/neurology-neurosurgery/research/jhu-nimh/jhibs" },
      { id: 2162, title: "Stanford Medical Youth Science Program", url: "https://med.stanford.edu/odme/high-school-students/smysp.html" },
      { id: 2163, title: "Stanford Genomics Research Internship Program", url: "https://med.stanford.edu/genetics/education/high-school-internship.html" },
      { id: 2164, title: "Hutton Junior Fisheries Biology Program", url: "https://hutton.fisheries.org/" },
      { id: 2165, title: "Roswell Park High School Summer Research Program", url: "https://www.roswellpark.org/education/k-12-undergrad/high-school-summer-research-program" },
      { id: 2166, title: "Memorial Sloan Kettering Cancer Center Human Oncology & Pathogenesis Program", url: "https://www.mskcc.org/education-training/summer-student" },
      { id: 2167, title: "University of Texas MD Anderson Cancer Center High School Summer Program", url: "https://www.mdanderson.org/education-training/research-training/early-career-pathway-programs/summer-research-programs/programs/high-school-summer-program.html" },
      { id: 2168, title: "City of Hope Cancer Center Eugene and Ruth Roberts Summer Academy", url: "https://www.imgs-coh.edu/summer-student-academy" },
      { id: 2169, title: "The Lillehei Heart Institute Summer Research Scholars Program", url: "https://med.umn.edu/lhi/educational-programs/summer-research-scholars-program" }
    ];
    
    let validCount = 0;
    let brokenCount = 0;
    const brokenURLs = [];
    
    console.log(`Found ${opportunities.length} PDF opportunities to validate...\n`);
    
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
          validCount++;
        } else {
          console.log(`❌ BROKEN (${response.status}): ${opp.title}`);
          console.log(`   URL: ${opp.url}`);
          brokenURLs.push(opp);
          brokenCount++;
        }
        
      } catch (error) {
        console.log(`❌ ERROR: ${opp.title}`);
        console.log(`   URL: ${opp.url}`);
        console.log(`   Error: ${error.response?.status || error.message}`);
        brokenURLs.push(opp);
        brokenCount++;
      }
      
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 COMPLETE PDF URL VALIDATION RESULTS:');
    console.log(`✅ Working URLs: ${validCount}`);
    console.log(`❌ Broken URLs: ${brokenCount}`);
    console.log(`📁 Total checked: ${opportunities.length}`);
    
    if (brokenURLs.length > 0) {
      console.log('\n🚨 BROKEN URLs REQUIRING IMMEDIATE FIXES:');
      brokenURLs.forEach((opp, index) => {
        console.log(`${index + 1}. ID ${opp.id}: ${opp.title}`);
        console.log(`   URL: ${opp.url}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fatal error during validation:', error.message);
  }
}

validateAllPDFURLs();