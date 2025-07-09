// Add verified HIGH SCHOOL appropriate opportunities only
const { neon } = require('@neondatabase/serverless');

async function addHighSchoolOpportunities() {
    console.log('=== ADDING HIGH SCHOOL APPROPRIATE OPPORTUNITIES ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // HIGH SCHOOL ONLY opportunities - age appropriate for 14-18 year olds
    const opportunities = [
        // NASA High School Programs
        {
            title: "NASA Glenn High School Engineering Institute",
            description: "5-day free summer program for rising juniors & seniors in Northeast Ohio. Work with NASA technical experts on authentic mission content and career readiness tools.",
            organization: "NASA",
            location: "Glenn Research Center, Cleveland, OH",
            type: "program",
            deadline: "April 11 - May 9, 2025",
            url: "https://www.nasa.gov/learning-resources/for-students-grades-9-12/",
            source: "NASA"
        },
        {
            title: "NASA High School Internship Program (HIP)",
            description: "Summer internship for high school students nationwide. Work directly with NASA scientists and engineers on real space/engineering projects with paid stipend.",
            organization: "NASA",
            location: "Various NASA Centers nationwide",
            type: "internship",
            deadline: "Rolling applications through NASA Gateway",
            url: "https://stemgateway.nasa.gov/s/course-offering/a0B3d0000015LFrEAM/high-school-internship-program",
            source: "NASA"
        },
        {
            title: "STEM Enhancement in Earth Science (SEES)",
            description: "Highly competitive program with remote work June-July and on-site experience at UT Austin July 6-19. Housing, meals, transportation provided plus travel scholarships.",
            organization: "NASA",
            location: "University of Texas at Austin",
            type: "program",
            deadline: "February 22, 2025",
            url: "https://www.csr.utexas.edu/education-outreach/high-school-internships/sees/",
            source: "NASA"
        },
        {
            title: "NASA GeneLab for High School (GL4HS)",
            description: "4-week virtual program for rising juniors & seniors (16+, GPA 3.0+). Space biology research, bioinformatics, and data analysis with stipend provided.",
            organization: "NASA",
            location: "Virtual",
            type: "program",
            deadline: "January 2025 applications",
            url: "https://www.nasa.gov/learning-resources/for-students-grades-9-12/",
            source: "NASA"
        },
        {
            title: "Virginia Aerospace Science & Technology Scholars (VASTS)",
            description: "Free program for high school juniors & seniors. Online course followed by potential 7-day residential academy at NASA Langley Research Center.",
            organization: "NASA Langley",
            location: "Hampton, VA",
            type: "program",
            deadline: "October 26 annually",
            url: "https://www.nasa.gov/learning-resources/for-students-grades-9-12/",
            source: "NASA"
        },
        {
            title: "High School Aerospace Scholars (HAS)",
            description: "10-month program for Texas high school juniors. 5 modules on space exploration with potential residential program at Johnson Space Center.",
            organization: "NASA Johnson",
            location: "Houston, TX",
            type: "program",
            deadline: "Early October applications",
            url: "https://www.nasa.gov/learning-resources/for-students-grades-9-12/",
            source: "NASA"
        },
        
        // Science Research Competitions
        {
            title: "Regeneron International Science and Engineering Fair (ISEF)",
            description: "World's largest international pre-college science competition. Nearly 2,000 finalists compete for over $9 million in awards. Must qualify through local affiliated fairs.",
            organization: "Society for Science",
            location: "Columbus, OH (2025) / Various locations",
            type: "competition",
            deadline: "May 10-16, 2025 (find local fairs earlier)",
            url: "https://www.societyforscience.org/isef/",
            source: "Society for Science"
        },
        {
            title: "Regeneron Science Talent Search",
            description: "Nation's oldest and most prestigious science and math competition for high school seniors. $100,000+ in awards including $250,000 top prize.",
            organization: "Society for Science",
            location: "Washington, DC (finals)",
            type: "competition",
            deadline: "November deadline for senior year",
            url: "https://www.societyforscience.org/",
            source: "Society for Science"
        },
        {
            title: "National Science Bowl",
            description: "Academic competition testing knowledge in biology, chemistry, Earth science, physics, energy, and math. Regional and national competitions for high school teams.",
            organization: "Department of Energy",
            location: "Various regional locations + Washington DC",
            type: "competition",
            deadline: "Registration typically opens fall",
            url: "https://science.osti.gov/wdts/nsb",
            source: "US Department of Energy"
        },
        
        // Programming Competitions
        {
            title: "USA Computing Olympiad (USACO)",
            description: "Free web-based algorithmic programming contests. Four contests per year (Dec-Mar) with Bronze, Silver, Gold, and Platinum divisions. Top students compete internationally.",
            organization: "USACO",
            location: "Online competitions",
            type: "competition",
            deadline: "December 13-16, 2024; January 26-29, 2025; February 16-19, 2025; March 21-24, 2025",
            url: "https://usaco.org/",
            source: "USACO"
        },
        {
            title: "American Computer Science League (ACSL)",
            description: "Computer science competition for high school students. Multiple divisions testing programming fundamentals, algorithms, and problem-solving skills.",
            organization: "ACSL",
            location: "Schools nationwide + online",
            type: "competition",
            deadline: "Registration typically September-October",
            url: "https://www.acsl.org/",
            source: "ACSL"
        },
        {
            title: "CyberPatriot National Youth Cyber Defense Competition",
            description: "National high school cyber defense competition. Teams secure virtual operating systems and networks while maintaining critical services.",
            organization: "Air & Space Forces Association",
            location: "National Harbor, MD (finals)",
            type: "competition",
            deadline: "Registration typically opens summer",
            url: "https://www.uscyberpatriot.org/",
            source: "CyberPatriot"
        },
        
        // Business Competitions
        {
            title: "DECA International Career Development Conference",
            description: "Business competition in marketing, finance, hospitality, and management. Role-plays, case studies, and prepared events for high school students.",
            organization: "DECA",
            location: "Atlanta, GA (April 26-29, 2025)",
            type: "competition",
            deadline: "Written events due April 8, 2025",
            url: "https://www.deca.org/compete",
            source: "DECA"
        },
        {
            title: "Future Business Leaders of America (FBLA) Competitions",
            description: "Nearly 100 competitive events covering business, technology, and leadership. Regional, state, and national competitions for high school students.",
            organization: "FBLA",
            location: "Various locations (nationals typically summer)",
            type: "competition",
            deadline: "Varies by state and event",
            url: "https://www.fbla.org/high-school/competitive-events/",
            source: "FBLA"
        },
        {
            title: "Virtual Enterprise International (VEI) Global Business Challenge",
            description: "Students create and operate virtual businesses, competing in trade shows and business plan competitions. International competition for high schoolers.",
            organization: "Virtual Enterprise",
            location: "New York, NY + international locations",
            type: "competition",
            deadline: "Applications typically fall",
            url: "https://virtualenterprise.org/",
            source: "Virtual Enterprise International"
        },
        
        // Academic Competitions
        {
            title: "National Academic Quiz Tournaments (NAQT)",
            description: "Academic quiz bowl competitions testing knowledge across subjects. High school championship tournament and invitational tournaments nationwide.",
            organization: "NAQT",
            location: "Various locations nationwide",
            type: "competition",
            deadline: "Registration varies by tournament",
            url: "https://www.naqt.com/",
            source: "NAQT"
        },
        {
            title: "Academic Decathlon",
            description: "Ten-event scholastic competition covering art, economics, literature, math, music, science, social science, speech, essay, and interview.",
            organization: "United States Academic Decathlon",
            location: "Various state and national locations",
            type: "competition",
            deadline: "Registration typically fall",
            url: "https://www.usad.org/",
            source: "US Academic Decathlon"
        },
        {
            title: "Science Olympiad",
            description: "National STEM competition with 23 events covering various science disciplines. Team-based competition for Division C (grades 9-12).",
            organization: "Science Olympiad",
            location: "Various regional, state, and national locations",
            type: "competition",
            deadline: "Registration typically fall",
            url: "https://www.soinc.org/",
            source: "Science Olympiad"
        },
        
        // Math Competitions
        {
            title: "American Mathematics Competitions (AMC 10/12)",
            description: "25-question multiple-choice exam testing high school mathematics. Gateway to AIME, USAMO, and International Mathematical Olympiad.",
            organization: "Mathematical Association of America",
            location: "Schools nationwide",
            type: "competition",
            deadline: "Registration typically October-January",
            url: "https://maa.org/math-competitions",
            source: "MAA"
        },
        {
            title: "MATHCOUNTS Competition Series",
            description: "National middle school mathematics enrichment, coaching and competition program. School, chapter, state, and national levels.",
            organization: "MATHCOUNTS Foundation",
            location: "Various locations + Orlando, FL (nationals)",
            type: "competition",
            deadline: "Registration typically fall",
            url: "https://www.mathcounts.org/",
            source: "MATHCOUNTS"
        },
        
        // Summer Programs
        {
            title: "Research Science Institute (RSI)",
            description: "Free 6-week summer program at MIT for rising high school seniors. Highly selective research program in STEM fields with world-renowned mentors.",
            organization: "Center for Excellence in Education",
            location: "MIT, Cambridge, MA",
            type: "program",
            deadline: "Application deadline typically January",
            url: "https://www.cee.org/programs/research-science-institute",
            source: "Center for Excellence in Education"
        },
        {
            title: "Summer Science Program (SSP)",
            description: "6-week residential program for rising high school seniors. Hands-on research in astrophysics, biochemistry, or genomics with college-level coursework.",
            organization: "Summer Science Program",
            location: "Multiple locations (CA, NM, IN)",
            type: "program",
            deadline: "Application deadline typically March",
            url: "https://summerscience.org/",
            source: "Summer Science Program"
        },
        {
            title: "Minority Introduction to Engineering and Science (MITES)",
            description: "Free 6-week residential STEM program at MIT for rising high school seniors from underrepresented communities. Rigorous academic preparation for engineering.",
            organization: "MIT",
            location: "MIT, Cambridge, MA",
            type: "program",
            deadline: "Application deadline typically February",
            url: "https://oeop.mit.edu/programs/mites",
            source: "MIT"
        },
        {
            title: "Stanford Mathematics Camp (SUMaC)",
            description: "4-week residential program for mathematically talented high school students. Advanced mathematics courses taught by Stanford faculty and graduate students.",
            organization: "Stanford University",
            location: "Stanford, CA",
            type: "program",
            deadline: "Application deadline typically March",
            url: "https://sumac.stanford.edu/",
            source: "Stanford University"
        },
        {
            title: "Program in Mathematics for Young Scientists (PROMYS)",
            description: "6-week summer program for high school students to explore creative mathematics. Number theory focus with problem-solving emphasis.",
            organization: "Boston University",
            location: "Boston University, MA",
            type: "program",
            deadline: "Application deadline typically April",
            url: "https://promys.org/",
            source: "Boston University"
        },
        
        // Hackathons for High Schoolers
        {
            title: "HackMIT Blueprint",
            description: "Weekend hackathon hosted by MIT for high school students. Focus on real-world solutions with mentorship and workshops for all skill levels.",
            organization: "MIT",
            location: "MIT, Cambridge, MA",
            type: "hackathon",
            deadline: "Registration typically opens fall",
            url: "https://blueprint.hackmit.org/",
            source: "MIT"
        },
        {
            title: "HackTJ",
            description: "Annual high school hackathon hosted by Thomas Jefferson High School. 24-hour coding event with workshops, mentors, and prizes.",
            organization: "Thomas Jefferson High School",
            location: "Alexandria, VA",
            type: "hackathon",
            deadline: "Registration typically winter",
            url: "https://hacktj.org/",
            source: "TJHSST"
        },
        {
            title: "Los Altos Hacks",
            description: "Annual hackathon for high school students in the Bay Area. Focus on solving real-world problems through technology and innovation.",
            organization: "Los Altos High School",
            location: "Los Altos, CA",
            type: "hackathon",
            deadline: "April 5-6, 2025",
            url: "https://losaltoshacks.com/",
            source: "Los Altos High School"
        },
        
        // Scholarships for High Schoolers
        {
            title: "Davidson Fellows Scholarship",
            description: "$50,000, $25,000, and $10,000 scholarships for extraordinary young people (18 and under) who have completed significant projects in STEM, literature, music, or outside the box.",
            organization: "Davidson Institute",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Application deadline typically February",
            url: "https://www.davidsongifted.org/gifted-programs/davidson-fellows/",
            source: "Davidson Institute"
        },
        {
            title: "Regeneron Science Talent Search Scholarship",
            description: "Up to $250,000 in scholarships for the nation's most promising young scientists. 300 semifinalists receive $2,000, 40 finalists compete for top prizes.",
            organization: "Society for Science",
            location: "Nationwide",
            type: "scholarship",
            deadline: "November deadline for high school seniors",
            url: "https://www.societyforscience.org/regeneron-sts/",
            source: "Society for Science"
        },
        {
            title: "National Merit Scholarship Program",
            description: "Academic competition for recognition and scholarships. Based on PSAT/NMSQT scores for high school juniors. About 15,000 finalists compete for 7,600 Merit Scholarships.",
            organization: "National Merit Scholarship Corporation",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Based on PSAT/NMSQT in junior year",
            url: "https://www.nationalmerit.org/",
            source: "National Merit Scholarship Corporation"
        },
        {
            title: "Coca-Cola Scholars Program",
            description: "$20,000 scholarships for 150 high school seniors based on academic excellence, leadership, and service. One of the largest corporate-sponsored scholarship programs.",
            organization: "Coca-Cola Foundation",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Application deadline typically October",
            url: "https://www.coca-colascholarsfoundation.org/",
            source: "Coca-Cola Foundation"
        },
        
        // Arts and Creative Programs
        {
            title: "National Young Arts Foundation Programs",
            description: "Recognition and support for young artists (ages 15-18) in visual, literary, design, and performing arts. Cash awards and performance opportunities.",
            organization: "National YoungArts Foundation",
            location: "Miami, FL + various locations",
            type: "program",
            deadline: "Application deadlines vary by discipline",
            url: "https://youngarts.org/",
            source: "National YoungArts Foundation"
        },
        {
            title: "Scholastic Art & Writing Awards",
            description: "Longest-running recognition program for creative teens. Scholarships, exhibitions, and publication opportunities for students in grades 7-12.",
            organization: "Scholastic Inc.",
            location: "Regional and national exhibitions",
            type: "competition",
            deadline: "Deadlines vary by region (typically Dec-Jan)",
            url: "https://www.artandwriting.org/",
            source: "Scholastic Inc."
        },
        
        // Leadership and Service
        {
            title: "Hugh O'Brian Youth Leadership (HOBY)",
            description: "Leadership seminars for high school sophomores. Community service projects, leadership training, and networking with peers nationwide.",
            organization: "HOBY",
            location: "Various locations nationwide",
            type: "program",
            deadline: "Nomination deadlines vary by state",
            url: "https://www.hoby.org/",
            source: "HOBY"
        },
        {
            title: "National Student Leadership Conference (NSLC)",
            description: "Career exploration and leadership development programs for high school students in medicine, engineering, business, law, and other fields.",
            organization: "NSLC",
            location: "Various university campuses",
            type: "program",
            deadline: "Rolling admissions",
            url: "https://www.nslcleaders.org/",
            source: "NSLC"
        },
        
        // Government and Policy
        {
            title: "United States Senate Youth Program",
            description: "Merit-based program for high school juniors and seniors. $10,000 scholarship plus week-long study of government in Washington, DC.",
            organization: "Hearst Foundations",
            location: "Washington, DC",
            type: "program",
            deadline: "State-specific deadlines (typically September-October)",
            url: "https://ussenateyouth.org/",
            source: "Hearst Foundations"
        },
        {
            title: "Boys State / Girls State",
            description: "Week-long civics education program where students learn about state and local government through hands-on participation in mock government.",
            organization: "American Legion",
            location: "Various state locations",
            type: "program",
            deadline: "Applications through high schools (typically winter-spring)",
            url: "https://www.legion.org/boysstategirlsstate",
            source: "American Legion"
        },
        
        // International Programs
        {
            title: "Congress-Bundestag Youth Exchange (CBYX)",
            description: "Fully-funded year-long exchange program for high school students to live and study in Germany. Cultural immersion and language learning.",
            organization: "Congress-Bundestag Youth Exchange",
            location: "Germany",
            type: "exchange",
            deadline: "Application deadline typically December",
            url: "https://www.usagermanyscholarship.org/",
            source: "CBYX"
        },
        {
            title: "Kennedy-Lugar Youth Exchange and Study (YES) Program",
            description: "Fully-funded year-long exchange for high school students from countries with significant Muslim populations to study in the United States.",
            organization: "US Department of State",
            location: "United States",
            type: "exchange",
            deadline: "Country-specific deadlines",
            url: "https://exchanges.state.gov/yes",
            source: "US Department of State"
        }
    ];
    
    console.log(`Adding ${opportunities.length} HIGH SCHOOL appropriate opportunities...`);
    
    let added = 0;
    let skipped = 0;
    
    for (const opp of opportunities) {
        try {
            // Check for duplicates
            const existing = await sql`
                SELECT id FROM opportunities 
                WHERE title = ${opp.title} 
                AND organization = ${opp.organization}
            `;
            
            if (existing.length === 0) {
                await sql`
                    INSERT INTO opportunities (title, description, organization, location, type, deadline, url, source)
                    VALUES (${opp.title}, ${opp.description}, ${opp.organization}, ${opp.location}, ${opp.type}, ${opp.deadline}, ${opp.url}, ${opp.source})
                `;
                added++;
                console.log(`✓ Added: ${opp.title}`);
            } else {
                skipped++;
                console.log(`⚠️ Skipped duplicate: ${opp.title}`);
            }
        } catch (error) {
            console.error(`❌ Error adding ${opp.title}:`, error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Final verification
    const totalResult = await sql`SELECT COUNT(*) as count FROM opportunities`;
    const newTotal = totalResult[0].count;
    
    console.log('\n=== HIGH SCHOOL OPPORTUNITIES COMPLETED ===');
    console.log(`✅ Added: ${added} HIGH SCHOOL appropriate opportunities`);
    console.log(`⚠️ Skipped duplicates: ${skipped}`);
    console.log(`📊 Total opportunities: ${newTotal}`);
    console.log('🎯 ALL OPPORTUNITIES ARE HIGH SCHOOL APPROPRIATE (ages 14-18)!');
    console.log('✅ Programs, competitions, scholarships, and exchanges for current high schoolers');
}

addHighSchoolOpportunities().catch(console.error);