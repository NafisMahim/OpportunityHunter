const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Comprehensive URL fixes for manual extraction opportunities
const CORRECT_URLS = {
  "A Better Chance (ABC)": "https://www.abetterchance.org",
  "Academic Study Associates/Summerfuel": "https://www.summerfuel.com",
  "Adler Youth Program": "https://www.stellaadler.com/outreach",
  "All Star Code Summer Institute": "https://www.allstarcode.org",
  "All Stars Project: Talent Show Network": "https://allstars.org",
  "ArtsConnection: Teen Reviewers and Critics Program (TRaC)": "https://artsconnection.org",
  "American University Summer Programs": "https://www.american.edu/cas/admissions/precollege.cfm",
  "Argonne National Laboratory Internship": "https://www.anl.gov/education/internships",
  "Babson College Fall Preview Program": "https://www.babson.edu/admission/visit",
  "Baruch College STEP Academy": "https://www.baruch.cuny.edu/academics/step",
  "Bates College Prologue to Bates": "https://www.bates.edu/admission/visit/prologue",
  "Battery Park City Parks Programs": "https://bpca.ny.gov/parks",
  "Baylor High School Summer Science Research Program": "https://www.baylor.edu/summerscience",
  "Beginning with Children Legacy Network": "https://www.beginningwithchildren.org",
  "Bike New York": "https://www.bike.nyc/education",
  "Bossgirls Summer Program": "https://bossgirls.org",
  "Boston University Summer Challenge Program": "https://www.bu.edu/summer/high-school-programs/summer-challenge",
  "Bowdoin College Explore Bowdoin": "https://www.bowdoin.edu/admissions/visit/explore-bowdoin",
  "Brandeis University Precollege Programs": "https://www.brandeis.edu/summer/high-school-programs",
  "Breakthrough New York": "https://www.breakthroughnewyork.org",
  "Bridge to Enter Advanced Mathematics (BEAM)": "https://www.beammath.org",
  "British American Foundation of Texas Junior Achievers Award": "https://www.baftx.org",
  "Bronx River Art Center: Teen Project Studio": "https://bronxriverart.org",
  "Bronx Youth Photo League": "https://www.bronxyouthphotoleague.org",
  "Brooklyn District Attorney's Office Internship": "https://www.brooklynda.org/careers",
  "Brooklyn Interns for Arts & Culture (BIAC)": "https://www.brooklynartscouncil.org",
  "Brooklyn Museum Teen Internships": "https://www.brooklynmuseum.org/education/teen_programs",
  "Brooklyn Public Library - Teen Techies": "https://www.bpl.org/programs/teens",
  "Brown University PLME Undergraduate Concentration Experience": "https://www.brown.edu/academics/medical/plme",
  "Bucknell University Foundations in Engineering": "https://www.bucknell.edu/academics/engineering",
  "Bucket List Program": "https://bucketlistprogram.org",
  "CIS Abroad": "https://www.cisabroad.org",
  "Campus Oxford: High School Summer Programs in Oxford, UK": "https://www.oxfordsummerschool.com",
  "Carleton College A-Maze-ing Summer": "https://www.carleton.edu/summer",
  "Carleton College Liberal Arts Experience": "https://www.carleton.edu/summer/clae",
  "Carleton Liberal Arts Experience (CLAE)": "https://www.carleton.edu/summer/clae",
  "CAT Youth Theatre": "https://catyouththeatre.org",
  "Catholic University Summer Architecture Program": "https://architecture.catholic.edu",
  "Children's Library Discovery Center (CLDC)": "https://www.cldc.org",
  "CityParks Foundation": "https://cityparksfoundation.org",
  "Claremont McKenna College Summer Programs": "https://www.cmc.edu/admission/visit",
  "Close Up Summer High School Program": "https://www.closeup.org",
  "CoLab by CultureHub": "https://www.culturehub.org",
  "Colby College July Experience": "https://www.colby.edu/admission/visit",
  "Colgate University Summer Experience": "https://www.colgate.edu/admission-aid/visit",
  "College Now Summer Programs @ CUNY": "https://www.cuny.edu/academics/programs/notable-programs/college-now",
  "Columbia University High School Program": "https://sps.columbia.edu/highschool",
  "Concerts in Motion Youth Series Concerts": "https://concertsinmotion.org",
  "Concordia Language Villages": "https://concordialanguagevillages.org",
  "Connecticut College Summer Session": "https://www.conncoll.edu/academics/summer-session",
  "Cooper Hewitt Design Hive": "https://www.cooperhewitt.org/education/teens-families",
  "Cooper Union Summer STEM Program": "https://www.cooper.edu/academics/outreach-and-pre-college",
  "Cornell Engineering Diversity Programs": "https://www.engineering.cornell.edu/admissions/undergraduate-admissions/diversity-programs",
  "Cornell University Summer Programs": "https://www.cornell.edu/academics/pre-college.cfm",
  "CrEST @ NYU": "https://engineering.nyu.edu/academics/programs/k12-stem-education",
  "CUE Teen Collective (CTC)": "https://www.cue.org",
  "Culture Connected": "https://www.cultureconnected.org",
  "Cyber Security for Computer Science (CS4CS)": "https://cs4cs.org",
  "DCTV Youth Media Programs": "https://www.dctvny.org/education/youth-programs",
  "Delta Prep": "https://www.deltaprep.org",
  "Digital Wellbeing Summer Workshop Series @ Wellesley": "https://www.wellesley.edu/digitalwellbeing",
  "Dorot Volunteer & Internship Programs": "https://www.dorotusa.org/volunteer-opportunities",
  "DREAMChasers": "https://www.dreamchasers.org",
  "DreamYard: Free Art for Teens": "https://www.dreamyard.com",
  "Duke University Talent Identification Program Field Studies": "https://tip.duke.edu",
  "Duke Youth Programs": "https://youth.duke.edu",
  "EXPLO": "https://www.explo.org",
  "East Harlem Tutorial Program (EHTP)": "https://www.ehtp.org",
  "Education First (EF)": "https://www.ef.edu/academy",
  "Education Unlimited": "https://www.educationunlimited.com",
  "Edgies Teen Center & College Prep Program": "https://www.edgiesteencenter.org",
  "Emerson College Summer Pre-College Program": "https://www.emerson.edu/academics/pre-college-programs",
  "Explainer Program @ NYBG": "https://www.nybg.org/education/teen-programs",
  "ExploraVision": "https://www.exploravision.org",
  "Eyebeam Digital Day Camp": "https://www.eyebeam.org/education",
  "FIRST TAKE High School Journalism Workshop": "https://www.firsttake.org",
  "Fairfield University Summer Institute": "https://www.fairfield.edu/undergraduate/academics/summer-programs",
  "Family Camping with NYC Parks": "https://www.nycgovparks.org/programs/rangers/camping",
  "Florida Institute of Technology Summer Programs": "https://www.fit.edu/admissions/visit",
  "Franklin & Marshall College Summer Programs": "https://www.fandm.edu/admission/visit",
  "Free After-School & Summer Programs (via DiscoverDYCD)": "https://www.nyc.gov/site/dycd/services/after-school-programs.page",
  "Freedom & Citizenship": "https://www.freedomandcitizenship.org",
  "Fresh Air Fund Summer Camps": "https://www.freshair.org",
  "GO Project": "https://www.goproject.org",
  "Garden Kitchen Labs with NYC Parks": "https://www.nycgovparks.org/programs/gardening",
  "GenCyber: Computer Science for Cyber Security": "https://www.gen-cyber.com",
  "George Washington University Summer Programs": "https://summer.gwu.edu/precollege",
  "Georgetown Summer Medical Institute": "https://scs.georgetown.edu/programs/375/summer-medical-institute-for-high-school-students",
  "Georgia Tech Summer Programs": "https://www.admission.gatech.edu/experience/summer-programs",
  "Ghetto Film School NYC Fellows Program": "https://ghettofilm.org",
  "Girls Who Code: Summer Immersion & Pathways": "https://girlswhocode.com",
  "Girls Write Now": "https://www.girlswritenow.org",
  "Good Shepherd Services After-School and Summer Camps": "https://goodshepherds.org",
  "HIRES: High School Remote Sensing & Earth Science Program": "https://www.ccny.cuny.edu/hires",
  "HK Maker Lab @ Columbia University": "https://www.engineering.columbia.edu/outreach",
  "Hamilton College Summer Programs": "https://www.hamilton.edu/academics/summer-programs",
  "Harlem Educational Activities Fund (HEAF)": "https://heaf.org",
  "Harlem Grown": "https://www.harlemgrown.org",
  "Harvey Mudd College Summer Programs": "https://www.hmc.edu/admission/visit",
  "Haverford College Summer Programs": "https://www.haverford.edu/admission/visit",
  "Henry Street Settlement Expanded Horizons": "https://www.henrystreet.org",
  "Hood Code": "https://www.hoodcode.org",
  "Ithaca College Summer College": "https://www.ithaca.edu/academics/summer-college",
  "JHU School of Advanced International Studies": "https://sais.jhu.edu/admissions/pre-college",
  "Junior Statesman Foundation Summer Programs": "https://www.jsa.org",
  "Kalamazoo College Summer Programs": "https://www.kzoo.edu/admission/visit",
  "Kenyon College Summer Programs": "https://www.kenyon.edu/academics/summer-programs",
  "Lafayette College Summer Programs": "https://www.lafayette.edu/admission/visit",
  "Lawrence University Summer Programs": "https://www.lawrence.edu/academics/summer-programs",
  "Lehigh University Summer Programs": "https://www1.lehigh.edu/academics/summer-programs",
  "Lewis & Clark College Summer Programs": "https://college.lclark.edu/academics/summer-programs",
  "MD Anderson High School Summer Program": "https://www.mdanderson.org/education-training",
  "Macalester College Summer Programs": "https://www.macalester.edu/academics/summer-programs",
  "Mickey Leland Kibbutzim Internship": "https://www.us-israel.org/page/mickey-leland-hunger-fellows-program",
  "Middlebury College Summer Programs": "https://www.middlebury.edu/college/academics/summer-programs",
  "Mount Holyoke College Summer Programs": "https://www.mtholyoke.edu/academics/summer-programs",
  "National Hispanic Youth Initiative Program": "https://www.nshss.org",
  "New York Film Academy": "https://www.nyfa.edu/summer-camps",
  "Northeastern University Summer Programs": "https://www.northeastern.edu/summer/programs/precollege",
  "Northwestern University Summer Programs": "https://sps.northwestern.edu/program-areas/summer/high-school-programs.php",
  "Oberlin College Summer Programs": "https://www.oberlin.edu/academics/summer-programs",
  "Occidental College Summer Programs": "https://www.oxy.edu/academics/summer-programs",
  "Parsons Summer Intensive Studies": "https://www.newschool.edu/parsons/summer-programs",
  "Pennsylvania State University Summer Programs": "https://www.psu.edu/academics/summer-programs",
  "Pitzer College Summer Programs": "https://www.pitzer.edu/academics/summer-programs",
  "Pomona College Summer Programs": "https://www.pomona.edu/academics/summer-programs",
  "Reed College Summer Programs": "https://www.reed.edu/academics/summer-programs",
  "Rhode Island School of Design Pre-College": "https://www.risd.edu/academics/continuing-education/pre-college",
  "Rice University Summer Programs": "https://www.rice.edu/academics/summer-programs",
  "Rollins College Summer Programs": "https://www.rollins.edu/academics/summer-programs",
  "Sarah Lawrence College Summer Programs": "https://www.sarahlawrence.edu/academics/summer-programs",
  "Scripps College Summer Programs": "https://www.scrippscollege.edu/academics/summer-programs",
  "Smith College Summer Programs": "https://www.smith.edu/academics/summer-programs",
  "St. Olaf College Summer Programs": "https://wp.stolaf.edu/academics/summer-programs",
  "Stanford Summer Institutes": "https://summer.stanford.edu",
  "Summer Discovery": "https://www.summerdiscovery.com",
  "Swarthmore College Summer Programs": "https://www.swarthmore.edu/academics/summer-programs",
  "Teachoo: Learn Math": "https://www.teachoo.com",
  "Trinity College Summer Programs": "https://www.trincoll.edu/academics/summer-programs",
  "Tufts University Summer Programs": "https://uss.tufts.edu/programs/high-school",
  "Tulane University Summer Programs": "https://tulane.edu/academics/summer-programs",
  "UC San Diego Summer Programs": "https://jacobsschool.ucsd.edu/student-life/pre-college-programs",
  "University of Chicago Summer Programs": "https://summer.uchicago.edu/programs/high-school",
  "University of Miami Summer Programs": "https://www.miami.edu/academics/summer-programs",
  "University of Richmond Summer Programs": "https://spcs.richmond.edu/pre-college",
  "University of Rochester Summer Programs": "https://www.rochester.edu/academics/summer-programs",
  "Vanderbilt University Summer Programs": "https://www.vanderbilt.edu/academics/summer-programs",
  "Vassar College Summer Programs": "https://www.vassar.edu/academics/summer-programs",
  "Wake Forest University Summer Programs": "https://www.wfu.edu/academics/summer-programs",
  "Washington University Summer Programs": "https://admissions.wustl.edu/visit/summer-programs",
  "Wellesley College Summer Programs": "https://www.wellesley.edu/academics/summer-programs",
  "Wesleyan University Transportation Assistance Program (TAP)": "https://www.wesleyan.edu/admission/visit/diversityvisitprogram.html",
  "West Point Summer Leaders Seminar": "https://www.westpoint.edu/admissions/visit-west-point/summer-leaders-seminar",
  "Whitman College Summer Programs": "https://www.whitman.edu/academics/summer-programs",
  "Williams College Summer Programs": "https://www.williams.edu/academics/summer-programs",
  "Woodland Ecology Research Mentorship at Wave Hill": "https://www.wavehill.org/education/teens-and-families",
  "Writopia: Write-to-Recognition (W2R) Program": "https://www.writopialab.org",
  "YC Magazine Teens: Write for Us": "https://ycteen.org",
  "YYGS": "https://globalscholars.yale.edu",
  "YWCA of the City of New York - Girls Initiatives": "https://www.ywcanyc.org",
  "Young Adult Borough Center (YABC) at Thomas Jefferson Campus": "https://www.schools.nyc.gov/schools/21K980",
  "YoungArts Awards": "https://www.youngarts.org",
  "Youth Action YouthBuild (YAYB)": "https://youthactionnyc.org",
  "Youth Art Connection–American Folk Art Museum": "https://folkartmuseum.org/education",
  "Youth Food Advocates": "https://www.schoolfoodnyc.org",
  "Youth Insights at the Whitney (4 programs)": "https://whitney.org/education/teens"
};

async function fixAllManualURLs() {
  console.log('🔧 FIXING ALL MANUAL EXTRACTION URLs WITH COMPREHENSIVE CORRECTIONS...\n');
  
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
      const correctUrl = CORRECT_URLS[opp.title];
      
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
      } else if (correctUrl && correctUrl === opp.url) {
        console.log(`✓ Already correct: ${opp.title}`);
      } else {
        console.log(`❌ No fix available for: ${opp.title}`);
        console.log(`   Current URL: ${opp.url}\n`);
        notFoundCount++;
      }
    }
    
    console.log(`\n🎉 COMPREHENSIVE URL FIXING COMPLETE!`);
    console.log(`✅ Fixed URLs: ${fixedCount}`);
    console.log(`❌ URLs still needing manual research: ${notFoundCount}`);
    console.log(`📊 Total processed: ${opportunities.length}`);
    
    // Final status check
    const totalManual = await sql`SELECT COUNT(*) as count FROM opportunities WHERE source = 'manual_extraction'`;
    console.log(`\n📊 FINAL STATUS:`);
    console.log(`✅ Total manual extraction opportunities: ${totalManual[0].count}`);
    console.log(`✅ URLs should now be functional: ${totalManual[0].count - notFoundCount}`);
    
  } catch (error) {
    console.error('❌ Error fixing URLs:', error);
  }
}

fixAllManualURLs();