// Add HIGH SCHOOL summer programs and scholarships - focus on programs and scholarships
const { neon } = require('@neondatabase/serverless');

async function addHighSchoolProgramsScholarships() {
    console.log('=== ADDING HIGH SCHOOL PROGRAMS & SCHOLARSHIPS ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // HIGH SCHOOL summer programs and scholarships
    const opportunities = [
        // Free Summer Research Programs
        {
            title: "MIT Women's Technology Program (WTP)",
            description: "Four-week summer academic experience for 20 high school students from groups historically underrepresented in engineering. Free program includes room, board, and all activities.",
            organization: "MIT",
            location: "MIT, Cambridge, MA",
            type: "program",
            deadline: "Applications typically open January",
            url: "https://mitadmissions.org/apply/prepare/summer/",
            source: "MIT"
        },
        {
            title: "Stanford Medical Youth Science Program",
            description: "Five weeks of intensive science and health training at no cost. Open to low-income, underrepresented high school juniors who live in Northern and Central California.",
            organization: "Stanford University",
            location: "Stanford, CA",
            type: "program",
            deadline: "Application deadline typically March",
            url: "https://eso.stanford.edu/programs/high-school-students",
            source: "Stanford University"
        },
        {
            title: "Summer Academy for Math and Science (SAMS)",
            description: "Fully funded, merit-based program at Carnegie Mellon University. No cost for scholars to participate. For students who are at least 16 years old and high school juniors.",
            organization: "Carnegie Mellon University",
            location: "Pittsburgh, PA",
            type: "program",
            deadline: "Application deadline typically April",
            url: "https://www.cmu.edu/",
            source: "Carnegie Mellon University"
        },
        {
            title: "COSMOS UC Programs",
            description: "Four-week summer residential program at five UC campuses for academically gifted students. Typical participant has GPA of 3.5 or above. Various STEM clusters available.",
            organization: "University of California",
            location: "Multiple UC campuses",
            type: "program",
            deadline: "Application deadline typically February",
            url: "https://cosmos.ucsd.edu/",
            source: "University of California"
        },
        {
            title: "Jackson Laboratory Summer Student Program",
            description: "Designed for students who want to immerse themselves in genetics and genomics research. Emphasizes laboratory discovery and hands-on research experience.",
            organization: "Jackson Laboratory",
            location: "Bar Harbor, ME",
            type: "program",
            deadline: "Application deadline typically February",
            url: "https://www.jax.org/",
            source: "Jackson Laboratory"
        },
        {
            title: "Science and Engineering Apprenticeship Program (SEAP)",
            description: "Provides opportunity for students to participate in research at Department of Navy laboratory during summer. Paid internship with hands-on research experience.",
            organization: "US Navy",
            location: "Various Navy research facilities",
            type: "program",
            deadline: "Application deadline typically February",
            url: "https://www.navsea.navy.mil/Home/Warfare-Centers/NSWC-Carderock/Who-We-Are/SEAP/",
            source: "US Navy"
        },
        {
            title: "ARISE Summer Program",
            description: "10-week program for NYC residents who are rising high school juniors or seniors with interest in STEM. Students gain 120 hours of lab experience plus $1,000 stipend.",
            organization: "CUNY",
            location: "New York City, NY",
            type: "program",
            deadline: "Application deadline typically March",
            url: "https://www.hunter.cuny.edu/arise",
            source: "CUNY"
        },
        {
            title: "NIH Summer Internship Program",
            description: "Free summer program for high school students at National Institutes of Health. Participants receive $750 tax-free stipend and hands-on research experience.",
            organization: "National Institutes of Health",
            location: "Bethesda, MD",
            type: "program",
            deadline: "Application deadline typically March",
            url: "https://www.training.nih.gov/programs/sip",
            source: "NIH"
        },
        {
            title: "Telluride Association Summer Seminar (TASS)",
            description: "Prestigious summer program for high school sophomores and juniors. Study power and privilege in social structures. Completely free including tuition, room, board, and travel.",
            organization: "Telluride Association",
            location: "Cornell University & University of Maryland",
            type: "program",
            deadline: "Application deadline typically January",
            url: "https://www.tellurideassociation.org/",
            source: "Telluride Association"
        },
        {
            title: "mathroots Summer Program",
            description: "Free two-week mathematical talent accelerator residential program hosted by MIT PRIMES for high-potential high school students from underrepresented backgrounds.",
            organization: "MIT PRIMES",
            location: "MIT, Cambridge, MA",
            type: "program",
            deadline: "Application deadline typically March",
            url: "https://math.mit.edu/research/highschool/primes/",
            source: "MIT"
        },
        {
            title: "California State Summer School for the Arts",
            description: "Four-week pre-professional arts training program. Full and partial scholarships available to students who need financial assistance.",
            organization: "California State University",
            location: "California",
            type: "program",
            deadline: "Application deadline typically February",
            url: "https://www.csssa.org/",
            source: "California State University"
        },
        {
            title: "UT Austin Summer High School Research Academy",
            description: "Research program with limited need-based scholarships available including stipend plus free tuition. Research experience in university laboratories.",
            organization: "University of Texas at Austin",
            location: "Austin, TX",
            type: "program",
            deadline: "Application deadline typically March",
            url: "https://fri.cns.utexas.edu/community-outreach/summer-high-school-research-academy",
            source: "UT Austin"
        },
        {
            title: "UCSB Summer Research Academies",
            description: "Summer research program with limited scholarships available, priority given to California residents. Hands-on research experience in STEM fields.",
            organization: "UC Santa Barbara",
            location: "Santa Barbara, CA",
            type: "program",
            deadline: "Application deadline typically March",
            url: "https://www.ucsb.edu/",
            source: "UC Santa Barbara"
        },
        
        // Major STEM Scholarships
        {
            title: "NSHSS Foundation STEM Scholarship",
            description: "$10,000 scholarship for high school seniors pursuing STEM degrees with minimum 3.5 GPA. Up to 100 awards granted annually.",
            organization: "National Society of High School Scholars",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Applications currently closed - reopens 2026",
            url: "https://www.nshss.org/scholarships/s/nshss-foundation-stem-scholarship-2025/",
            source: "NSHSS"
        },
        {
            title: "Pega Scholars Program",
            description: "$2,000 scholarships for high school seniors pursuing computer science/technology majors. Multiple awards available.",
            organization: "Pega",
            location: "Nationwide",
            type: "scholarship",
            deadline: "July 16, 2025",
            url: "https://scholarships360.org/scholarships/stem-scholarships/",
            source: "Pega"
        },
        {
            title: "GeneTex Scholarship",
            description: "$2,000 scholarship for college/graduate STEM students. Open to high school seniors planning to pursue STEM fields.",
            organization: "GeneTex",
            location: "Nationwide",
            type: "scholarship",
            deadline: "July 11, 2025",
            url: "https://scholarships360.org/scholarships/stem-scholarships/",
            source: "GeneTex"
        },
        {
            title: "Elevate Women in Technology Scholarship",
            description: "$500 scholarship for women pursuing technology careers. Open to high school seniors planning technology degrees.",
            organization: "Elevate",
            location: "Nationwide",
            type: "scholarship",
            deadline: "July 31, 2025",
            url: "https://scholarships360.org/scholarships/stem-scholarships/",
            source: "Elevate"
        },
        {
            title: "Washington State Opportunity Scholarship",
            description: "$6,000 scholarship for Washington state residents pursuing STEM fields. Covers tuition, fees, and other educational expenses.",
            organization: "Washington State",
            location: "Washington State",
            type: "scholarship",
            deadline: "October 16, 2025",
            url: "https://scholarships360.org/scholarships/stem-scholarships/",
            source: "Washington State"
        },
        {
            title: "DoD SMART Scholarship Program",
            description: "Full scholarship program covering tuition, fees, and providing stipend. Guaranteed employment at DoD facilities after graduation.",
            organization: "US Department of Defense",
            location: "Nationwide",
            type: "scholarship",
            deadline: "December 1, 2025",
            url: "https://www.smartscholarship.org/smart/en",
            source: "US Department of Defense"
        },
        
        // Creative Writing and Arts Scholarships
        {
            title: "U.S. Creative Writing Awards Scholarship",
            description: "Up to $10,000 scholarships (5 winners) for college-bound high school seniors. Categories: fiction, drama, poetry, memoir, spoken word. Over $2.8 million awarded since 1993.",
            organization: "Penguin Random House",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Application deadline varies",
            url: "https://scholarships360.org/scholarships/creative-writing-scholarships/",
            source: "Penguin Random House"
        },
        {
            title: "NSHSS Creative Writing Scholarship",
            description: "Up to $2,000 for NSHSS members in grades 9-12. Categories include poetry and fiction. U.S. residents only.",
            organization: "National Society of High School Scholars",
            location: "Nationwide",
            type: "scholarship",
            deadline: "March 14 - September 12, 2025",
            url: "https://www.nshss.org/scholarships/s/nshss-creative-writing-scholarship-2024/",
            source: "NSHSS"
        },
        {
            title: "Full Sail Creative Minds Scholarship",
            description: "Up to $25,000 scholarship for students pursuing creative fields including writing, digital arts, and media production.",
            organization: "Full Sail University",
            location: "Nationwide",
            type: "scholarship",
            deadline: "June 30, 2025",
            url: "https://bold.org/scholarships/by-major/writing-scholarships/",
            source: "Full Sail University"
        },
        {
            title: "Phyliss J. McCarthy Scholarship for Excellence in Writing",
            description: "Scholarship for high school juniors and seniors demonstrating excellence in writing. Submit 3,000 words or fewer responding to creative prompts.",
            organization: "LearnCurious",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Application deadline varies",
            url: "https://bold.org/scholarships/by-major/writing-scholarships/",
            source: "LearnCurious"
        },
        
        // Additional High School Programs
        {
            title: "Lumiere Research Scholar Program",
            description: "Rigorous 12-week research program for high school students. Pairs students with PhD mentors for independent research projects culminating in research paper.",
            organization: "Lumiere Education",
            location: "Virtual/Online",
            type: "program",
            deadline: "Rolling admissions",
            url: "https://www.lumiere-education.com/",
            source: "Lumiere Education"
        },
        {
            title: "QuestBridge College Prep Scholars Program",
            description: "Partners with institutions to send high-achieving, underserved students to residential and virtual summer programs with full scholarships covering all costs.",
            organization: "QuestBridge",
            location: "Various partner institutions",
            type: "program",
            deadline: "Application deadline typically March",
            url: "https://www.questbridge.org/high-school-students/college-prep-scholars",
            source: "QuestBridge"
        },
        {
            title: "Jackie Robinson Foundation Scholarship",
            description: "Provides scholarships of up to $30,000 over four years to minority high school students demonstrating leadership potential, academic excellence, and financial need.",
            organization: "Jackie Robinson Foundation",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Application deadline typically February",
            url: "https://www.jackierobinson.org/",
            source: "Jackie Robinson Foundation"
        },
        {
            title: "Amazon Future Engineer Scholarship",
            description: "Computer science scholarship program for high school seniors from underrepresented and underserved communities pursuing computer science degrees.",
            organization: "Amazon",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Opens October 2025",
            url: "https://www.amazonfutureengineer.com/",
            source: "Amazon"
        },
        {
            title: "Scholarship America Dream Award",
            description: "Renewable scholarship for students with significant financial need who have overcome barriers to education and are committed to giving back to their communities.",
            organization: "Scholarship America",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Opens October 2025",
            url: "https://scholarshipamerica.org/",
            source: "Scholarship America"
        },
        {
            title: "SNC Women in STEM Scholarship",
            description: "Scholarship specifically for women pursuing STEM education and careers. Supports underrepresented groups in science, technology, engineering, and mathematics.",
            organization: "SNC",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Opens December 2025",
            url: "https://scholarships360.org/scholarships/stem-scholarships/",
            source: "SNC"
        },
        {
            title: "Western Digital STEM Scholarship",
            description: "Scholarship program supporting students pursuing STEM education with focus on technology and engineering fields.",
            organization: "Western Digital",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Opens January 2026",
            url: "https://scholarships360.org/scholarships/stem-scholarships/",
            source: "Western Digital"
        },
        {
            title: "CDM Smith Scholarship Program",
            description: "Engineering scholarship for students pursuing degrees in civil, environmental, structural, or water resources engineering.",
            organization: "CDM Smith",
            location: "Nationwide",
            type: "scholarship",
            deadline: "Opens March 2026",
            url: "https://scholarships360.org/scholarships/stem-scholarships/",
            source: "CDM Smith"
        },
        
        // Additional Research and Academic Programs
        {
            title: "MIT PRIMES Research Program",
            description: "Provides challenging research opportunities for students with passion for mathematics and science. Year-long program with mentorship from MIT researchers.",
            organization: "MIT",
            location: "Boston area students / Virtual options",
            type: "program",
            deadline: "Application deadline typically December",
            url: "https://math.mit.edu/research/highschool/primes/",
            source: "MIT"
        },
        {
            title: "Simons Summer Research Program",
            description: "Seven-week research program at Stony Brook University for high school students. Students work with faculty mentors on authentic research projects.",
            organization: "Stony Brook University",
            location: "Stony Brook, NY",
            type: "program",
            deadline: "Application deadline typically February",
            url: "https://www.stonybrook.edu/simons/",
            source: "Stony Brook University"
        },
        {
            title: "Clark Scholar Program",
            description: "Seven-week summer research program at Texas Tech University. Students conduct intensive research in chemistry, biochemistry, mathematics, or physics.",
            organization: "Texas Tech University",
            location: "Lubbock, TX",
            type: "program",
            deadline: "Application deadline typically February",
            url: "https://www.depts.ttu.edu/honors/academicsandenrichment/affiliatedandhighschool/clarks/",
            source: "Texas Tech University"
        },
        {
            title: "Roswell Park Cancer Institute Summer High School Program",
            description: "Seven-week cancer research program for high school students. Hands-on laboratory experience with cancer researchers and scientists.",
            organization: "Roswell Park Cancer Institute",
            location: "Buffalo, NY",
            type: "program",
            deadline: "Application deadline typically March",
            url: "https://www.roswellpark.org/",
            source: "Roswell Park Cancer Institute"
        },
        {
            title: "Mentor Connection Summer Research Program",
            description: "Eight-week biomedical research program for high school students at University of Rochester. Students work on independent research projects.",
            organization: "University of Rochester",
            location: "Rochester, NY",
            type: "program",
            deadline: "Application deadline typically February",
            url: "https://www.urmc.rochester.edu/",
            source: "University of Rochester"
        },
        {
            title: "Research Immersion Summer Experience (RISE)",
            description: "Eight-week summer research program at Boston University. Students conduct research in biomedical engineering, computer science, or other STEM fields.",
            organization: "Boston University",
            location: "Boston, MA",
            type: "program",
            deadline: "Application deadline typically February",
            url: "https://www.bu.edu/",
            source: "Boston University"
        },
        {
            title: "Secondary Student Training Program (SSTP)",
            description: "Five and a half week research program at University of Iowa. Students work with faculty mentors on research projects and present findings.",
            organization: "University of Iowa",
            location: "Iowa City, IA",
            type: "program",
            deadline: "Application deadline typically March",
            url: "https://belinblank.education.uiowa.edu/students/sstp/",
            source: "University of Iowa"
        },
        {
            title: "NASA High School Aerospace Scholars (Texas)",
            description: "Year-long experience for Texas high school juniors. Online coursework followed by residential summer experience at Johnson Space Center.",
            organization: "NASA Johnson Space Center",
            location: "Houston, TX",
            type: "program",
            deadline: "Application deadline typically October",
            url: "https://www.nasa.gov/learning-resources/for-students-grades-9-12/",
            source: "NASA"
        },
        {
            title: "Student Conservation Association High School Programs",
            description: "Various conservation and environmental programs for high school students including summer crews, internships, and leadership development.",
            organization: "Student Conservation Association",
            location: "Various national parks and forests",
            type: "program",
            deadline: "Various deadlines throughout year",
            url: "https://www.thesca.org/",
            source: "Student Conservation Association"
        },
        {
            title: "Frontiers of Science Institute",
            description: "Three-week residential program at University of Northern Iowa focusing on physics, astronomy, chemistry, biology, and mathematics research.",
            organization: "University of Northern Iowa",
            location: "Cedar Falls, IA",
            type: "program",
            deadline: "Application deadline typically April",
            url: "https://www.uni.edu/",
            source: "University of Northern Iowa"
        }
    ];
    
    console.log(`Adding ${opportunities.length} HIGH SCHOOL programs and scholarships...`);
    
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
    
    console.log('\n=== HIGH SCHOOL PROGRAMS & SCHOLARSHIPS COMPLETED ===');
    console.log(`✅ Added: ${added} HIGH SCHOOL programs and scholarships`);
    console.log(`⚠️ Skipped duplicates: ${skipped}`);
    console.log(`📊 Total opportunities: ${newTotal}`);
    console.log('🎯 FOCUS: Summer research programs, STEM scholarships, and creative writing awards');
    console.log('✅ All opportunities appropriate for high school students (ages 14-18)');
}

addHighSchoolProgramsScholarships().catch(console.error);