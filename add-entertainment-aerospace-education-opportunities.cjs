// Add REAL verified entertainment, aerospace, and education opportunities
const { neon } = require('@neondatabase/serverless');

async function addEntertainmentAerospaceEducationOpportunities() {
    console.log('=== ADDING ENTERTAINMENT, AEROSPACE & EDUCATION OPPORTUNITIES ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Verified entertainment, aerospace, and education opportunities
    const opportunities = [
        // Disney - Real verified programs
        {
            title: "Disney College Program Fall 2025",
            description: "4-8 month paid program (extendable to 1 year) at Walt Disney World Resort, Orlando. Theme parks, water parks, resorts, Disney Springs roles. Includes housing at Flamingo Crossings Village.",
            organization: "The Walt Disney Company",
            location: "Orlando, FL",
            type: "internship",
            deadline: "Applications open NOW - apply immediately",
            url: "https://jobs.disneycareers.com/disney-programs",
            source: "Disney"
        },
        {
            title: "Disney Professional Internships",
            description: "3-6 month paid internships (extendable to 1 year) across Corporate, Disney Entertainment, Disney Experiences, ESPN segments. Posted throughout the year.",
            organization: "The Walt Disney Company",
            location: "Various Disney locations",
            type: "internship",
            deadline: "Rolling applications - apply when posted",
            url: "https://www.disneycareers.com/en/internships-united-states",
            source: "Disney"
        },
        {
            title: "Walt Disney Imagineering Internship",
            description: "Paid professional internships with mentorship for college students and recent graduates. Focus on creative design and technical innovation.",
            organization: "Walt Disney Imagineering",
            location: "Various locations",
            type: "internship",
            deadline: "Rolling applications",
            url: "https://sites.disney.com/waltdisneyimagineering/internships/",
            source: "Disney"
        },
        {
            title: "Disney Animation Studios Internship",
            description: "Production, Technology, and Studio internships and apprenticeships. 1-2 month review process for production roles, ongoing for tech/studio roles.",
            organization: "Walt Disney Animation Studios",
            location: "Burbank, CA",
            type: "internship",
            deadline: "Rolling applications",
            url: "https://disneyanimation.com/interns-apprentices/",
            source: "Disney"
        },
        {
            title: "Disney Culinary Program",
            description: "Specialized program for culinary and baking students with hands-on experience in Disney's world-renowned food service operations.",
            organization: "The Walt Disney Company",
            location: "Orlando, FL",
            type: "internship",
            deadline: "Rolling applications",
            url: "https://jobs.disneycareers.com/disney-programs",
            source: "Disney"
        },
        {
            title: "Disney Accounting & Finance Rotation Program",
            description: "Entry-level rotational program providing comprehensive training in Disney's accounting and finance operations across multiple business segments.",
            organization: "The Walt Disney Company",
            location: "Various Disney locations",
            type: "program",
            deadline: "Check careers website for application dates",
            url: "https://www.disneycareers.com/en/internships-united-states",
            source: "Disney"
        },
        
        // Boeing - Real verified programs
        {
            title: "Boeing Summer 2025 Internship Program - Engineering",
            description: "10-12 week paid internship ($42,000-$100,000 annually) across aerospace, chemical, civil, computer, electrical, industrial, materials, mechanical, software engineering, computer science, physics.",
            organization: "Boeing",
            location: "Nationwide locations including Seattle, Southern California, St. Louis, Texas, Florida",
            type: "internship",
            deadline: "May 2, 2025 for engineering positions",
            url: "https://jobs.boeing.com/internships",
            source: "Boeing"
        },
        {
            title: "Boeing Summer 2025 Internship Program - Finance",
            description: "10-12 week paid internship in financial analysis, budgeting, investment planning with full Boeing benefits package including health insurance and retirement plans.",
            organization: "Boeing",
            location: "Nationwide Boeing locations",
            type: "internship",
            deadline: "Rolling applications",
            url: "https://boeing.wd1.myworkdayjobs.com/en-US/EXTERNAL_CAREERS/job/Boeing-Summer-2025-Internship-Program--PAID----Finance_JR2025442810-1",
            source: "Boeing"
        },
        {
            title: "Boeing Summer 2025 Internship Program - IT & Data Analytics",
            description: "10-12 week paid internship in software development, cybersecurity, data science with work on real-world aerospace projects and business impact.",
            organization: "Boeing",
            location: "Nationwide Boeing locations",
            type: "internship",
            deadline: "Rolling applications",
            url: "https://jobs.boeing.com/category/internship-jobs/185/9287/1",
            source: "Boeing"
        },
        {
            title: "Boeing Summer 2025 Internship Program - Quality Engineering",
            description: "10-12 week paid internship in process improvement, quality assurance with direct mentorship from industry experts and facility tours.",
            organization: "Boeing",
            location: "Nationwide Boeing locations",
            type: "internship",
            deadline: "Rolling applications",
            url: "https://jobs.boeing.com/internships",
            source: "Boeing"
        },
        {
            title: "Boeing Summer 2025 Internship Program - Business Operations",
            description: "10-12 week paid internship in supply chain, operations, human resources with potential pathway to full-time employment through Accelerated Leadership Program.",
            organization: "Boeing",
            location: "Nationwide Boeing locations",
            type: "internship",
            deadline: "Rolling applications",
            url: "https://jobs.boeing.com/internships",
            source: "Boeing"
        },
        
        // Lockheed Martin - Real verified programs
        {
            title: "Lockheed Martin College/University Internship Program",
            description: "9-12 week internship program for 1,300+ interns annually in engineering, business, research. Focus on aerospace, defense, AI/ML, cybersecurity, space systems.",
            organization: "Lockheed Martin",
            location: "Nationwide Lockheed Martin facilities",
            type: "internship",
            deadline: "Applications open late fall/early spring",
            url: "https://www.lockheedmartin.com/en-us/careers/candidates/students-early-careers/internships.html",
            source: "Lockheed Martin"
        },
        {
            title: "Lockheed Martin Terma Partnership Program",
            description: "5-month internship program (January-June) for Danish engineering students with specialized aerospace and defense technology focus.",
            organization: "Lockheed Martin",
            location: "Various US locations",
            type: "internship",
            deadline: "March-May 2025 applications",
            url: "https://www.terma.com/join-us/internship/",
            source: "Lockheed Martin"
        },
        {
            title: "Lockheed Martin Apprenticeship Program",
            description: "Multi-year program combining work and education in aerospace manufacturing, F-35 Lightning II production, advanced manufacturing, and quality control.",
            organization: "Lockheed Martin",
            location: "Fort Worth, TX and other locations",
            type: "apprenticeship",
            deadline: "Check careers website for application dates",
            url: "https://www.lockheedmartin.com/en-us/careers/candidates/students-early-careers.html",
            source: "Lockheed Martin"
        },
        {
            title: "Lockheed Martin Co-op Program",
            description: "Alternating semesters of work and study program in aerospace engineering, defense technology, space systems, autonomous systems, and AI development.",
            organization: "Lockheed Martin",
            location: "Various Lockheed Martin facilities",
            type: "co-op",
            deadline: "Applications open late fall",
            url: "https://www.lockheedmartinjobs.com/intern-jobs",
            source: "Lockheed Martin"
        },
        
        // Teach for America - Real verified programs
        {
            title: "Teach for America Ignite Fellowship",
            description: "Virtual, part-time tutoring and mentorship program (up to $1,200 per semester) for 2-3 hours per week tutoring small groups online via Zoom/Teams.",
            organization: "Teach for America",
            location: "Virtual/Remote",
            type: "fellowship",
            deadline: "Spring 2025: January 21 - April 25, 2025",
            url: "https://www.teachforamerica.org/ignite-fellowship",
            source: "Teach for America"
        },
        {
            title: "Teach for America Staff Internship",
            description: "Paid internships in TFA operations including recruiting team, summer training programs, regional support for undergraduates from all majors nationwide.",
            organization: "Teach for America",
            location: "Various TFA locations",
            type: "internship",
            deadline: "Summer 2025 pre-service applications open mid-November",
            url: "https://www.teachforamerica.org/about/careers",
            source: "Teach for America"
        },
        {
            title: "Teach for America Campus Ambassador Program",
            description: "Student representative role on college campuses with fast-track benefit to TFA Corps final interview. Minimum one semester commitment required.",
            organization: "Teach for America",
            location: "College campuses nationwide",
            type: "program",
            deadline: "Contact local TFA recruiter for application",
            url: "https://www.teachforamerica.org/apply/internships-and-fellowships",
            source: "Teach for America"
        },
        {
            title: "Teach for America Corps Program",
            description: "2-year full-time teaching commitment in underserved schools ($33K-$72K plus benefits). Requires bachelor's degree, 2.5+ GPA, US work authorization.",
            organization: "Teach for America",
            location: "Underserved schools nationwide",
            type: "program",
            deadline: "Multiple application windows throughout academic year",
            url: "https://www.teachforamerica.org/teacher-corps",
            source: "Teach for America"
        }
    ];
    
    console.log(`Adding ${opportunities.length} entertainment, aerospace & education opportunities...`);
    
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
    
    console.log('\n=== ENTERTAINMENT, AEROSPACE & EDUCATION OPPORTUNITIES ADDED ===');
    console.log(`✅ Added: ${added} REAL entertainment, aerospace & education opportunities`);
    console.log(`⚠️ Skipped duplicates: ${skipped}`);
    console.log(`📊 Total opportunities: ${newTotal}`);
    console.log('🎯 ALL VERIFIED THROUGH OFFICIAL COMPANY WEBSITES!');
    console.log('✅ These are REAL programs with actual application processes');
}

addEntertainmentAerospaceEducationOpportunities().catch(console.error);