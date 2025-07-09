const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Manual URL fixes for known organizations/programs
const URL_FIXES = {
  "¡OYE! Group's 'Come to the Corner' programs": "https://oyegroup.org/programs",
  "826 NYC: Write After School": "https://826nyc.org/programs",
  "A Better Chance (ABC)": "https://abetterchance.org/students",
  "ACE Mentor Program": "https://acementor.org/students",
  "Adler Youth Program": "https://www.stellaadler.com/outreach/youth-programs",
  "All Star Code Summer Institute": "https://www.allstarcode.org/programs",
  "All Stars Project: Talent Show Network": "https://allstars.org/programs/talent-show-network",
  "All Stars: Development School for Youth": "https://allstars.org/programs/development-school",
  "Apex for Youth": "https://apexforyouth.org/programs",
  "Apollo Theater Academy High School Internships": "https://www.apollotheater.org/education/apollo-theater-academy",
  "Applied Research Innovations in Science and Engineering (ARISE)": "https://engineering.nyu.edu/academics/programs/k12-stem-education/arise",
  "ArtsConnection: Teen Reviewers and Critics Program (TRaC)": "https://artsconnection.org/programs/teen-reviewers-critics-program",
  "BAM Spring Dance Insider": "https://www.bam.org/education",
  "Baruch College STEP Academy": "https://www.baruch.cuny.edu/step",
  "Battery Park City Parks Programs": "https://bpca.ny.gov/parks/",
  "Beginning with Children Legacy Network": "https://legacynetworkprograms.org",
  "Bike New York": "https://www.bike.nyc/education",
  "Bossgirls Summer Program": "https://bossgirls.org/summer-program",
  "Breakthrough New York": "https://www.breakthroughnewyork.org",
  "Bridge to Enter Advanced Mathematics (BEAM)": "https://www.beammath.org",
  "Bronx River Art Center: Teen Project Studio": "https://bronxriverart.org/teen-programs",
  "Bronx Youth Photo League": "https://www.bronxyouthphotoleague.org",
  "Brooklyn District Attorney's Office Internship": "https://www.brooklynda.org/careers/internships",
  "Brooklyn Interns for Arts & Culture (BIAC)": "https://www.brooklynartscouncil.org/programs/biac",
  "Brooklyn Museum Teen Internships": "https://www.brooklynmuseum.org/education/teen_programs",
  "Brooklyn Public Library - Teen Techies": "https://www.bpl.org/programs/teens",
  "Carleton Liberal Arts Experience (CLAE)": "https://www.carleton.edu/summer/clae",
  "CAT Youth Theatre": "https://catyouththeatre.org",
  "Children's Library Discovery Center (CLDC)": "https://www.cldc.org/programs",
  "CityParks Foundation": "https://cityparksfoundation.org/programs",
  "CoLab by CultureHub": "https://www.culturehub.org/colab",
  "College Now Summer Programs @ CUNY": "https://www.cuny.edu/academics/programs/notable-programs/college-now",
  "Concerts in Motion Youth Series Concerts": "https://concertsinmotion.org/youth-programs",
  "Cooper Hewitt Design Hive": "https://www.cooperhewitt.org/education/teens-families/design-hive",
  "CrEST @ NYU": "https://engineering.nyu.edu/academics/programs/k12-stem-education/crest",
  "CUE Teen Collective (CTC)": "https://www.cue.org/teen-programs",
  "Culture Connected": "https://www.cultureconnected.org",
  "Cyber Security for Computer Science (CS4CS)": "https://cs4cs.org",
  "DCTV Youth Media Programs": "https://www.dctvny.org/education/youth-programs",
  "Delta Prep": "https://www.deltaprep.org",
  "Digital Wellbeing Summer Workshop Series @ Wellesley": "https://www.wellesley.edu/digitalwellbeing",
  "Dorot Volunteer & Internship Programs": "https://www.dorotusa.org/volunteer-opportunities/internships",
  "DREAMChasers": "https://www.dreamchasers.org",
  "DreamYard: Free Art for Teens": "https://www.dreamyard.com/programs",
  "East Harlem Tutorial Program (EHTP)": "https://www.ehtp.org",
  "Edgies Teen Center & College Prep Program": "https://www.edgiesteencenter.org",
  "Explainer Program @ NYBG": "https://www.nybg.org/education/teen-programs",
  "ExploraVision": "https://www.exploravision.org",
  "Eyebeam Digital Day Camp": "https://www.eyebeam.org/education/youth-programs",
  "Family Camping with NYC Parks": "https://www.nycgovparks.org/programs/rangers/camping",
  "FIRST TAKE High School Journalism Workshop": "https://www.firsttake.org",
  "Free After-School & Summer Programs (via DiscoverDYCD)": "https://www.nyc.gov/site/dycd/services/after-school-programs.page",
  "Freedom & Citizenship": "https://www.freedomandcitizenship.org",
  "Fresh Air Fund Summer Camps": "https://www.freshair.org/summer-camps",
  "Garden Kitchen Labs with NYC Parks": "https://www.nycgovparks.org/programs/gardening",
  "GenCyber: Computer Science for Cyber Security": "https://www.gen-cyber.com",
  "Ghetto Film School NYC Fellows Program": "https://ghettofilm.org/programs/gfs-fellows",
  "Girls Who Code: Summer Immersion & Pathways": "https://girlswhocode.com/programs",
  "Girls Write Now": "https://www.girlswritenow.org",
  "GO Project": "https://www.goproject.org",
  "Good Shepherd Services After-School and Summer Camps": "https://goodshepherds.org/programs",
  "Harlem Educational Activities Fund (HEAF)": "https://heaf.org",
  "Harlem Grown": "https://www.harlemgrown.org/programs",
  "Henry Street Settlement Expanded Horizons": "https://www.henrystreet.org/programs/youth-education",
  "HIRES: High School Remote Sensing & Earth Science Program": "https://www.ccny.cuny.edu/hires",
  "HK Maker Lab @ Columbia University": "https://www.engineering.columbia.edu/outreach/hk-maker-lab",
  "Hood Code": "https://www.hoodcode.org",
  "Teachoo: Learn Math": "https://www.teachoo.com",
  "Stanford Medical Youth Science Program": "https://med.stanford.edu/education/programs/smysp.html",
  "MIT Research Science Institute": "https://www.cee.org/research-science-institute",
  "NASA High School Aerospace Scholars": "https://www.nasa.gov/audience/forstudents/9-12/features/nasa-high-school-aerospace-scholars.html",
  "Google Computer Science Summer Institute": "https://buildyourfuture.withgoogle.com/programs/computer-science-summer-institute",
  "Microsoft High School Internship Program": "https://careers.microsoft.com/students/us/en/job/1588785/High-School-Internship-Program",
  "Columbia Journalism School High School Program": "https://journalism.columbia.edu/high-school-journalism-institute",
  "Harvard Secondary School Program": "https://www.harvard.edu/on-campus/visit-harvard/harvard-summer-programs",
  "Yale Young Global Scholars": "https://globalscholars.yale.edu",
  "Princeton Summer Journalism Program": "https://www.princeton.edu/meet-princeton/summer-journalism-program",
  "Brandeis University Precollege Programs": "https://www.brandeis.edu/summer/high-school-programs",
  "UC San Diego Summer Programs": "https://jacobsschool.ucsd.edu/student-life/pre-college-programs",
  "Carleton College Liberal Arts Experience (CLAE)": "https://www.carleton.edu/summer/clae",
  "Cornell University Summer Programs": "https://www.cornell.edu/academics/pre-college.cfm",
  "Boston University Summer Challenge Program": "https://www.bu.edu/summer/high-school-programs",
  "Carleton College Liberal Arts Experience": "https://www.carleton.edu/summer/clae",
  "Academic Study Associates/Summerfuel": "https://www.asaprograms.com",
  "Education Unlimited": "https://www.educationunlimited.com",
  "Summer Discovery": "https://www.summerdiscovery.com",
  "MD Anderson High School Summer Program": "https://www.mdanderson.org/education-training/degrees-programs/summer-programs.html",
  "Baylor High School Summer Science Research Program": "https://www.baylor.edu/summer_science_research_program",
  "Mickey Leland Kibbutzim Internship": "https://www.us-israel.org/page/mickey-leland-hunger-fellows-program",
  "Asian American Journalists Association J Camp": "https://www.aaja.org/programs",
  "British American Foundation of Texas Junior Achievers Award": "https://www.baftx.org/awards",
  "National Hispanic Youth Initiative Program": "https://www.nshss.org/scholarships",
  "West Point Summer Leaders Seminar": "https://www.westpoint.edu/admissions/visit-west-point/summer-leaders-seminar",
  "Bank of America Student Leaders Internship": "https://about.bankofamerica.com/en/making-an-impact/student-leaders",
  "Duke University Talent Identification Program Field Studies": "https://tip.duke.edu/programs",
  "Junior Statesman Foundation Summer Programs": "https://www.jsa.org/summer-programs",
  "Close Up Summer High School Program": "https://www.closeup.org/programs/summer-programs"
};

async function fixManualExtractionURLs() {
  console.log('🔧 FIXING MANUAL EXTRACTION URLs...\n');
  
  try {
    // Get all manual extraction opportunities
    const opportunities = await sql`
      SELECT id, title, url, organization 
      FROM opportunities 
      WHERE source = 'manual_extraction'
      ORDER BY title
    `;
    
    console.log(`📊 Found ${opportunities.length} manual extraction opportunities\n`);
    
    let fixedCount = 0;
    let notFoundCount = 0;
    
    for (const opp of opportunities) {
      const correctUrl = URL_FIXES[opp.title];
      
      if (correctUrl && correctUrl !== opp.url) {
        console.log(`✅ Fixing: ${opp.title}`);
        console.log(`   Old URL: ${opp.url}`);
        console.log(`   New URL: ${correctUrl}\n`);
        
        await sql`
          UPDATE opportunities 
          SET url = ${correctUrl}
          WHERE id = ${opp.id}
        `;
        
        fixedCount++;
      } else if (!correctUrl) {
        console.log(`❌ No fix available for: ${opp.title}`);
        console.log(`   Current URL: ${opp.url}\n`);
        notFoundCount++;
      }
    }
    
    console.log(`\n🎉 URL FIXING COMPLETE!`);
    console.log(`✅ Fixed URLs: ${fixedCount}`);
    console.log(`❌ URLs still needing manual research: ${notFoundCount}`);
    console.log(`📊 Total processed: ${opportunities.length}`);
    
  } catch (error) {
    console.error('❌ Error fixing URLs:', error);
  }
}

fixManualExtractionURLs();