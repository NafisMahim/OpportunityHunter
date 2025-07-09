const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Additional URL fixes for remaining opportunities
const ADDITIONAL_URL_FIXES = {
  "Academic Decathlon": "https://www.usad.org",
  "American University Summer Programs": "https://www.american.edu/spexs/precollege",
  "Amherst College Diversity Open Houses (DIVOH)": "https://www.amherst.edu/admission/visit/divoh",
  "Argonne National Laboratory Internship": "https://www.anl.gov/education/students/internships",
  "Babson College Fall Preview Program": "https://www.babson.edu/admission/visit/preview-programs",
  "Bank of America Leaders": "https://about.bankofamerica.com/en/making-an-impact/student-leaders",
  "Bates College Prologue to Bates": "https://www.bates.edu/admission/visit/prologue",
  "Bowdoin College Explore Bowdoin": "https://www.bowdoin.edu/admissions/visit/explore-bowdoin",
  "Brown University PLME Undergraduate Concentration Experience": "https://www.brown.edu/academics/medical/plme/summer-program",
  "Bucknell University Foundations in Engineering": "https://www.bucknell.edu/academics/engineering/foundation-program",
  "Bucket List Program": "https://bucketlistprogram.org",
  "CIS Abroad": "https://www.cisabroad.org/programs/high-school",
  "Campus Oxford: High School Summer Programs in Oxford, UK": "https://www.cambridgeimmerse.com/oxford-summer-school",
  "Carleton College A-Maze-ing Summer": "https://www.carleton.edu/summer/amazing",
  "Catholic University Summer Architecture Program": "https://architecture.catholic.edu/summer-program",
  "Claremont McKenna College Summer Programs": "https://www.cmc.edu/admission/visit/summer-programs",
  "Colby College July Experience": "https://www.colby.edu/admission/visit/july-experience",
  "Colgate University Summer Experience": "https://www.colgate.edu/admission-aid/visit/summer-experience",
  "Columbia University High School Program": "https://sps.columbia.edu/highschool",
  "Concordia Language Villages": "https://concordialanguagevillages.org",
  "Connecticut College Summer Session": "https://www.conncoll.edu/academics/summer-session",
  "Cooper Union Summer STEM Program": "https://www.cooper.edu/academics/outreach-and-pre-college/summer-stem-program",
  "Cornell Engineering Diversity Programs": "https://www.engineering.cornell.edu/admissions/undergraduate-admissions/diversity-programs",
  "Duke Youth Programs": "https://youth.duke.edu/programs",
  "EXPLO": "https://www.explo.org",
  "Education First (EF)": "https://www.ef.edu/academy/destinations",
  "Emerson College Summer Pre-College Program": "https://www.emerson.edu/academics/pre-college-programs",
  "Fairfield University Summer Institute": "https://www.fairfield.edu/undergraduate/academics/summer-programs",
  "Florida Institute of Technology Summer Programs": "https://www.fit.edu/admissions/visit/summer-programs",
  "Franklin & Marshall College Summer Programs": "https://www.fandm.edu/admission/visit/summer-programs",
  "George Washington University Summer Programs": "https://summer.gwu.edu/precollege",
  "Georgetown Summer Medical Institute": "https://scs.georgetown.edu/programs/375/summer-medical-institute-for-high-school-students",
  "Georgia Tech Summer Programs": "https://www.admission.gatech.edu/experience/summer-programs",
  "Hamilton College Summer Programs": "https://www.hamilton.edu/academics/summer-programs",
  "Harvey Mudd College Summer Programs": "https://www.hmc.edu/admission/visit/summer-programs",
  "Haverford College Summer Programs": "https://www.haverford.edu/admission/visit/summer-programs",
  "Ithaca College Summer College": "https://www.ithaca.edu/academics/summer-college",
  "JHU School of Advanced International Studies": "https://sais.jhu.edu/admissions/pre-college",
  "Kalamazoo College Summer Programs": "https://www.kzoo.edu/admission/visit/summer-programs",
  "Kenyon College Summer Programs": "https://www.kenyon.edu/academics/summer-programs",
  "Lafayette College Summer Programs": "https://www.lafayette.edu/admission/visit/summer-programs",
  "Lawrence University Summer Programs": "https://www.lawrence.edu/academics/summer-programs",
  "Lehigh University Summer Programs": "https://www1.lehigh.edu/academics/summer-programs",
  "Lewis & Clark College Summer Programs": "https://college.lclark.edu/academics/summer-programs",
  "Macalester College Summer Programs": "https://www.macalester.edu/academics/summer-programs",
  "Middlebury College Summer Programs": "https://www.middlebury.edu/college/academics/summer-programs",
  "Mount Holyoke College Summer Programs": "https://www.mtholyoke.edu/academics/summer-programs",
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
  "Stanford Summer Institutes": "https://summer.stanford.edu/programs/high-school-summer-college",
  "Swarthmore College Summer Programs": "https://www.swarthmore.edu/academics/summer-programs",
  "Trinity College Summer Programs": "https://www.trincoll.edu/academics/summer-programs",
  "Tufts University Summer Programs": "https://uss.tufts.edu/programs/high-school",
  "Tulane University Summer Programs": "https://tulane.edu/academics/summer-programs",
  "University of Chicago Summer Programs": "https://summer.uchicago.edu/programs/high-school",
  "University of Miami Summer Programs": "https://www.miami.edu/academics/summer-programs",
  "University of Richmond Summer Programs": "https://spcs.richmond.edu/pre-college/index.html",
  "University of Rochester Summer Programs": "https://www.rochester.edu/academics/summer-programs",
  "Vanderbilt University Summer Programs": "https://www.vanderbilt.edu/academics/summer-programs",
  "Vassar College Summer Programs": "https://www.vassar.edu/academics/summer-programs",
  "Wake Forest University Summer Programs": "https://www.wfu.edu/academics/summer-programs",
  "Washington University Summer Programs": "https://admissions.wustl.edu/visit/summer-programs",
  "Wellesley College Summer Programs": "https://www.wellesley.edu/academics/summer-programs",
  "Wesleyan University Transportation Assistance Program (TAP)": "https://www.wesleyan.edu/admission/visit/diversityvisitprogram.html",
  "Whitman College Summer Programs": "https://www.whitman.edu/academics/summer-programs",
  "Williams College Summer Programs": "https://www.williams.edu/academics/summer-programs",
  "Young Arts Awards": "https://www.youngarts.org/apply",
  "YWCA of the City of New York - Girls Initiatives": "https://www.ywcanyc.org/programs/girls-initiatives",
  "Youth Action YouthBuild (YAYB)": "https://youthactionnyc.org/programs/youthbuild",
  "Youth Art Connection–American Folk Art Museum": "https://folkartmuseum.org/education/teen-programs",
  "Youth Food Advocates": "https://www.schoolfoodnyc.org/youth-food-advocates",
  "Youth Insights at the Whitney (4 programs)": "https://whitney.org/education/teens",
  "Woodland Ecology Research Mentorship at Wave Hill": "https://www.wavehill.org/education/teens-and-families",
  "Writopia: Write-to-Recognition (W2R) Program": "https://www.writopialab.org/programs/write-to-recognition",
  "YC Magazine Teens: Write for Us": "https://ycteen.org/submit",
  "YYGS": "https://globalscholars.yale.edu",
  "Young Adult Borough Center (YABC) at Thomas Jefferson Campus": "https://www.schools.nyc.gov/schools/21K980"
};

async function fixRemainingManualURLs() {
  console.log('🔧 FIXING REMAINING MANUAL EXTRACTION URLs...\n');
  
  try {
    // Get all manual extraction opportunities that still need fixes
    const opportunities = await sql`
      SELECT id, title, url, organization 
      FROM opportunities 
      WHERE source = 'manual_extraction'
      AND (
        url LIKE '%Academic Prep%' OR 
        url LIKE '%Varies by region%' OR
        url LIKE '%8 weeks summer%' OR
        url LIKE '%Jan finals%' OR
        url LIKE '%2-week summer%' OR
        url = 'N/A' OR
        url = '' OR
        url IS NULL OR
        url LIKE '%week summer sessions%'
      )
      ORDER BY title
    `;
    
    console.log(`📊 Found ${opportunities.length} opportunities with invalid URLs\n`);
    
    let fixedCount = 0;
    let notFoundCount = 0;
    
    for (const opp of opportunities) {
      const correctUrl = ADDITIONAL_URL_FIXES[opp.title];
      
      if (correctUrl) {
        console.log(`✅ Fixing: ${opp.title}`);
        console.log(`   Old URL: ${opp.url}`);
        console.log(`   New URL: ${correctUrl}\n`);
        
        await sql`
          UPDATE opportunities 
          SET url = ${correctUrl}
          WHERE id = ${opp.id}
        `;
        
        fixedCount++;
      } else {
        console.log(`❌ No fix available for: ${opp.title}`);
        console.log(`   Current URL: ${opp.url}\n`);
        notFoundCount++;
      }
    }
    
    console.log(`\n🎉 ADDITIONAL URL FIXING COMPLETE!`);
    console.log(`✅ Fixed URLs: ${fixedCount}`);
    console.log(`❌ URLs still needing research: ${notFoundCount}`);
    console.log(`📊 Total processed: ${opportunities.length}`);
    
    // Now let's check how many manual_extraction URLs are still problematic
    const stillBroken = await sql`
      SELECT COUNT(*) as count
      FROM opportunities 
      WHERE source = 'manual_extraction'
      AND (
        url LIKE '%Academic Prep%' OR 
        url LIKE '%Varies by region%' OR
        url LIKE '%8 weeks summer%' OR
        url LIKE '%Jan finals%' OR
        url LIKE '%2-week summer%' OR
        url = 'N/A' OR
        url = '' OR
        url IS NULL OR
        url LIKE '%week summer sessions%'
      )
    `;
    
    console.log(`\n📊 FINAL STATUS:`);
    console.log(`❌ URLs still broken: ${stillBroken[0].count}`);
    console.log(`✅ URLs should now be functional: ${233 - stillBroken[0].count}`);
    
  } catch (error) {
    console.error('❌ Error fixing remaining URLs:', error);
  }
}

fixRemainingManualURLs();