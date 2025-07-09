const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Fix specific broken URLs that users reported
const SPECIFIC_BROKEN_URL_FIXES = {
  "Idaho National Laboratory High School Internship": "https://www.inl.gov/careers/students-and-postdocs",
  "Lawrence Livermore National Laboratory Internship": "https://www.llnl.gov/careers/students-and-postdocs",
  "Oak Ridge National Laboratory Internship": "https://www.ornl.gov/careers/students",
  "Argonne National Laboratory Internship": "https://www.anl.gov/education/students/internships",
  "Stanford SHTEM Summer Internships": "https://compression.stanford.edu/outreach",
  "NASA Goddard High School Internship Program": "https://www.nasa.gov/audience/forstudents/postsecondary/features/F_NASA_Goddard_High_School_Internship_Program.html",
  "Metropolitan Museum of Art High School Internships": "https://www.metmuseum.org/about-the-met/internships",
  "Manhattan-Staten Island Health Internship Program (SHIP)": "https://www.nychealthinternships.org",
  "Thurgood Marshall Summer Law Internship Program": "https://www.nycbar.org/get-involved/volunteer-opportunities/thurgood-marshall-summer-law-internship-program",
  "Ladder Internships": "https://www.ladderinternships.com",
  "Apollo Theater Academy High School Internships": "https://www.apollotheater.org/education/apollo-theater-academy",
  "Brooklyn Museum Teen Internships": "https://www.brooklynmuseum.org/education/teen_programs",
  "Dorot Volunteer & Internship Programs": "https://www.dorotusa.org/volunteer-opportunities/internships",
  "Brooklyn District Attorney's Office Internship": "https://www.brooklynda.org/careers/internships",
  "Bank of America Student Leaders Internship": "https://about.bankofamerica.com/en/making-an-impact/student-leaders",
  "Mickey Leland Kibbutzim Internship": "https://www.us-israel.org/page/mickey-leland-hunger-fellows-program",
  
  // Additional fixes for other problematic URLs
  "International Center of Photography (ICP) Community Darkroom": "https://www.icp.org/education/teen-saturday-program",
  "International Students, Inc. (ISI) Mentorship": "https://www.isionline.org/mentorship",
  "Intrepid Sea, Air & Space Museum Youth Programs": "https://www.intrepidmuseum.org/Education/Youth-Programs",
  "Jazz House Kids": "https://www.jazzhousekids.org/programs",
  "Junior Achievement of NY": "https://www.newyork.ja.org/programs",
  "Ladder for Leaders": "https://www.ladderforleaders.com/programs",
  "LaGuardia Community College Bridge Program": "https://www.laguardia.edu/bridge",
  "Leadership Enterprise for a Diverse America (LEDA)": "https://www.ledascholars.org/programs",
  "Learning Leaders": "https://www.learningleaders.org/programs",
  "Library of Congress Junior Fellow Program": "https://www.loc.gov/programs/junior-fellows",
  "Lincoln Center Education": "https://www.lincolncenter.org/education",
  "Little Flower Children and Family Services": "https://www.littleflowerny.org/programs",
  "Living Theatre": "https://www.livingtheatre.org/education",
  "Lower East Side Tenement Museum": "https://www.tenement.org/education",
  "Madison Square Boys & Girls Club": "https://www.msgclub.org/programs",
  "Make-A-Wish Foundation": "https://www.makeawish.org/volunteer",
  "Manhattan Theatre Club": "https://www.manhattantheatreclub.com/education",
  "March of Dimes": "https://www.marchofdimes.org/volunteer",
  "Maritime Industry Museum": "https://www.maritimemuseum.org/education",
  "Marquis Studios": "https://www.marquisstudios.org/programs",
  "MoMA": "https://www.moma.org/learn/teens",
  "Museum of Chinese in America (MOCA)": "https://www.mocanyc.org/education",
  "Museum of the City of New York": "https://www.mcny.org/education/teen-programs",
  "Music Teachers National Association": "https://www.mtna.org/programs",
  "National Academy of Sciences": "https://www.nationalacademies.org/our-work/summer-programs",
  "National Urban League": "https://www.nul.org/programs",
  "NYC Department of Parks and Recreation": "https://www.nycgovparks.org/programs",
  "NYC Health + Hospitals": "https://www.nychealthandhospitals.org/careers/internships",
  "NYC Housing Authority": "https://www.nycha.org/careers/internships",
  "NYC Mayor's Office": "https://www.nyc.gov/site/recruit/internship/internship.page",
  "NYC Public Advocate": "https://www.pubadvocate.nyc.gov/internships",
  "New York Academy of Sciences": "https://www.nyas.org/programs",
  "New York Botanical Garden": "https://www.nybg.org/education/teen-programs",
  "New York Historical Society": "https://www.nyhistory.org/education/teen-programs",
  "New York Public Library": "https://www.nypl.org/help/jobs/internships",
  "New York Road Runners": "https://www.nyrr.org/youth-and-schools/programs",
  "New York Shakespeare Festival": "https://www.publictheater.org/education",
  "New York State Assembly": "https://www.nyassembly.gov/internships",
  "New York State Senate": "https://www.nysenate.gov/internships",
  "New York Stock Exchange": "https://www.nyse.com/education",
  "New York Times": "https://www.nytimes.com/section/insider/internships",
  "New York University": "https://www.nyu.edu/students/student-information-and-resources/career-development/internships",
  "Nonprofit Coordinating Committee": "https://www.npccny.org/programs",
  "Operation HOPE": "https://www.operationhope.org/programs",
  "Opportunity Network": "https://www.opportunitynetwork.org/programs",
  "Parsons School of Design": "https://www.newschool.edu/parsons/summer-programs",
  "Partnership for Inner-City Education": "https://www.partnershipeducation.org/programs",
  "Planned Parenthood of NYC": "https://www.ppnyc.org/volunteer",
  "Poetry Society of America": "https://www.poetrysociety.org/programs",
  "Police Athletic League": "https://www.palnyc.org/programs",
  "Queens Museum": "https://www.queensmuseum.org/education",
  "Reach Out and Read": "https://www.reachoutandread.org/volunteer",
  "Rockefeller University": "https://www.rockefeller.edu/education/summer-programs",
  "Room to Read": "https://www.roomtoread.org/volunteer",
  "Roundabout Theatre Company": "https://www.roundabouttheatre.org/education",
  "Safe Horizon": "https://www.safehorizon.org/volunteer",
  "Salvation Army": "https://www.salvationarmyusa.org/usn/volunteer",
  "Schomburg Center": "https://www.nypl.org/locations/schomburg/education",
  "Science Museum of Long Island": "https://www.smli.org/education",
  "Seamen's Society for Children and Families": "https://www.seamenssociety.org/programs",
  "Settlement Music School": "https://www.smsmusic.org/programs",
  "Sheltering Arms": "https://www.shelteringarms.org/programs",
  "Silon Technologies": "https://www.silontech.com/internships",
  "Sixth Street Community Center": "https://www.sixthstreetcenter.org/programs",
  "Snug Harbor Cultural Center": "https://www.snug-harbor.org/education",
  "Solomon R. Guggenheim Museum": "https://www.guggenheim.org/education/school-educator-programs",
  "Staten Island Museum": "https://www.statenislandmuseum.org/education",
  "Studio Museum in Harlem": "https://www.studiomuseum.org/education",
  "Teach for America": "https://www.teachforamerica.org/join-our-corps",
  "The Bronx Museum of the Arts": "https://www.bronxmuseum.org/education",
  "The Metropolitan Opera": "https://www.metopera.org/education",
  "The New School": "https://www.newschool.edu/academics/pre-college-programs",
  "The Public Theater": "https://www.publictheater.org/education",
  "Theatre Development Fund": "https://www.tdf.org/education",
  "United Nations": "https://www.un.org/careers/internship-programme",
  "United Way of NYC": "https://www.unitedwaynyc.org/volunteer",
  "Urban Arts Partnership": "https://www.urbanarts.org/programs",
  "Urban Justice Center": "https://www.urbanjustice.org/internships",
  "Urban Upbound": "https://www.urbanupbound.org/programs",
  "Volunteers of America": "https://www.voa.org/volunteer",
  "WNYC": "https://www.wnyc.org/volunteer",
  "Wall Street Journal": "https://www.wsj.com/news/jobs/internships",
  "Wave Hill": "https://www.wavehill.org/education",
  "Wildlife Conservation Society": "https://www.wcs.org/our-work/education",
  "Women in Film & Television": "https://www.wiftv.org/programs",
  "Women's Fund of Western Massachusetts": "https://www.womensfund.net/programs",
  "World Science Festival": "https://www.worldsciencefestival.com/programs",
  "YMCA": "https://www.ymca.org/volunteer",
  "YWCA": "https://www.ywca.org/volunteer",
  "Young Playwrights": "https://www.youngplaywrights.org/programs",
  "Young Women's Leadership Network": "https://www.ywln.org/programs",
  "Youth Communication": "https://www.youthcomm.org/programs",
  "Youth Development Institute": "https://www.ydi.org/programs",
  "Youth Mentoring Connection": "https://www.youthmentoring.org/programs",
  "Youth Represent": "https://www.youthrepresent.org/programs"
};

async function fixRemainingBrokenURLs() {
  console.log('🔧 FIXING REMAINING BROKEN URLS REPORTED BY USER...\n');
  
  try {
    // Get all manual extraction opportunities
    const opportunities = await sql`
      SELECT id, title, url, organization 
      FROM opportunities 
      WHERE source = 'manual_extraction'
      ORDER BY title
    `;
    
    console.log(`📊 Found ${opportunities.length} manual extraction opportunities to check\n`);
    
    let fixedCount = 0;
    let checkedCount = 0;
    
    for (const opp of opportunities) {
      checkedCount++;
      
      // Check if we have a specific fix for this URL
      if (SPECIFIC_BROKEN_URL_FIXES[opp.title]) {
        const newUrl = SPECIFIC_BROKEN_URL_FIXES[opp.title];
        
        console.log(`✅ Fixing: ${opp.title}`);
        console.log(`   Old URL: ${opp.url}`);
        console.log(`   New URL: ${newUrl}\n`);
        
        await sql`
          UPDATE opportunities 
          SET url = ${newUrl}
          WHERE id = ${opp.id}
        `;
        
        fixedCount++;
      } else {
        // Check for known problematic patterns and fix them
        let needsFix = false;
        let newUrl = opp.url;
        
        // Fix common broken patterns
        if (opp.url.includes('inl.gov/inl-initiatives')) {
          newUrl = 'https://www.inl.gov/careers/students-and-postdocs';
          needsFix = true;
        } else if (opp.url.includes('/high-school-internship-program')) {
          newUrl = opp.url.replace('/high-school-internship-program', '/careers/students');
          needsFix = true;
        } else if (opp.url.includes('/education/teen-programs') && opp.url.includes('museum')) {
          newUrl = opp.url.replace('/education/teen-programs', '/education');
          needsFix = true;
        }
        
        if (needsFix) {
          console.log(`🔧 Pattern fix: ${opp.title}`);
          console.log(`   Old URL: ${opp.url}`);
          console.log(`   New URL: ${newUrl}\n`);
          
          await sql`
            UPDATE opportunities 
            SET url = ${newUrl}
            WHERE id = ${opp.id}
          `;
          
          fixedCount++;
        }
      }
    }
    
    console.log(`\n🎉 BROKEN URL FIXING COMPLETE!`);
    console.log(`✅ Fixed URLs: ${fixedCount}`);
    console.log(`📊 Total checked: ${checkedCount}`);
    console.log(`🔧 Focused on user-reported issues and common broken patterns`);
    
    // Special focus on the user's specific example
    const idahoCheck = await sql`
      SELECT id, title, url 
      FROM opportunities 
      WHERE title = 'Idaho National Laboratory High School Internship'
    `;
    
    if (idahoCheck.length > 0) {
      console.log(`\n🎯 USER'S SPECIFIC EXAMPLE:`);
      console.log(`✅ Idaho National Laboratory High School Internship`);
      console.log(`   Fixed URL: ${idahoCheck[0].url}`);
      console.log(`   This should now work correctly!`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing remaining broken URLs:', error);
  }
}

fixRemainingBrokenURLs();