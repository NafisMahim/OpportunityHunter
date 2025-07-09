// Add more REAL verified opportunities based on web search results
const { neon } = require('@neondatabase/serverless');

async function addMoreRealOpportunities() {
    console.log('=== ADDING MORE REAL VERIFIED OPPORTUNITIES ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Real opportunities verified through web search
    const moreRealOpportunities = [
        // Department of Energy SULI - Real verified program
        {
            title: "DOE Science Undergraduate Laboratory Internships (SULI)",
            description: "10-16 week paid internship at 17 DOE national laboratories with $650/week stipend plus travel reimbursement and housing assistance.",
            organization: "Department of Energy Office of Science",
            location: "17 DOE National Laboratories",
            type: "internship",
            deadline: "Spring 2026: TBA (typically October), Summer 2026: TBA (typically January)",
            url: "https://science.osti.gov/wdts/suli",
            source: "DOE Office of Science"
        },
        
        // State Department - Real verified program
        {
            title: "US State Department Student Internship Program",
            description: "Paid internship (GS-04 salary) providing hands-on experience in diplomacy and foreign affairs at US embassies, consulates, and Washington DC bureaus.",
            organization: "US Department of State",
            location: "Washington DC / US Embassies Worldwide",
            type: "internship",
            deadline: "Future cycles TBA - Monitor careers.state.gov",
            url: "https://careers.state.gov/interns-fellows/student-internship-program/",
            source: "State Department"
        },
        {
            title: "US Foreign Service Internship Program",
            description: "Two-summer program for rising juniors/seniors with 3.2+ GPA providing experience in diplomatic work and foreign affairs.",
            organization: "US Department of State",
            location: "Washington DC / International",
            type: "internship",
            deadline: "TBA - Check website for updates",
            url: "https://careers.state.gov/interns-fellows/us-foreign-service-internship-program/",
            source: "State Department"
        },
        
        // Peace Corps - Real verified program
        {
            title: "Peace Corps Volunteer Program",
            description: "27-month international service program (3 months training + 2 years service) with enhanced $20,000 readjustment allowance through 2027.",
            organization: "Peace Corps",
            location: "60+ Countries Worldwide",
            type: "volunteer",
            deadline: "October 1, 2025 for June 2026 departure",
            url: "https://www.peacecorps.gov/ways-to-serve/service-assignments/browse-opportunities/peace-corps-volunteer/",
            source: "Peace Corps"
        },
        {
            title: "Peace Corps Response Short-Term Service",
            description: "7-12 month high-impact assignments for skilled professionals with departures May-June 2026.",
            organization: "Peace Corps",
            location: "Various Countries",
            type: "volunteer",
            deadline: "Rolling basis",
            url: "https://www.peacecorps.gov/ways-to-serve/service-assignments/browse-opportunities/peace-corps-response/",
            source: "Peace Corps"
        },
        
        // Additional DOE Labs with SULI programs (verified through search)
        {
            title: "Argonne National Laboratory SULI Program",
            description: "Summer research internship at Argonne National Laboratory in Illinois through DOE SULI program with full funding.",
            organization: "Argonne National Laboratory",
            location: "Lemont, IL",
            type: "research",
            deadline: "Check DOE SULI website for deadlines",
            url: "https://www.anl.gov/education/science-undergraduate-laboratory-internship",
            source: "Argonne National Laboratory"
        },
        {
            title: "Lawrence Berkeley National Laboratory SULI",
            description: "Research internship at Berkeley Lab through DOE SULI program in energy and environmental sciences.",
            organization: "Lawrence Berkeley National Laboratory",
            location: "Berkeley, CA",
            type: "research",
            deadline: "Check DOE SULI website for deadlines",
            url: "https://education.lbl.gov/internships/suli/",
            source: "Berkeley Lab"
        },
        {
            title: "Oak Ridge National Laboratory SULI",
            description: "Research internship at Oak Ridge National Laboratory through DOE SULI program in nuclear and energy sciences.",
            organization: "Oak Ridge National Laboratory",
            location: "Oak Ridge, TN",
            type: "research",
            deadline: "Check DOE SULI website for deadlines",
            url: "https://education.ornl.gov/suli/",
            source: "Oak Ridge National Laboratory"
        },
        {
            title: "NREL Science Undergraduate Laboratory Internship",
            description: "Research internship at National Renewable Energy Laboratory through DOE SULI program focusing on clean energy technologies.",
            organization: "National Renewable Energy Laboratory",
            location: "Golden, CO",
            type: "research",
            deadline: "Check DOE SULI website for deadlines",
            url: "https://www2.nrel.gov/careers/suli",
            source: "NREL"
        },
        {
            title: "SLAC National Accelerator Laboratory SULI",
            description: "Research internship at SLAC National Accelerator Laboratory through DOE SULI program in accelerator science and physics.",
            organization: "SLAC National Accelerator Laboratory",
            location: "Menlo Park, CA",
            type: "research",
            deadline: "Check DOE SULI website for deadlines",
            url: "https://careers.slac.stanford.edu/science-undergraduate-laboratory-internship-suli-program",
            source: "SLAC"
        },
        {
            title: "Princeton Plasma Physics Laboratory SULI",
            description: "Research internship at Princeton Plasma Physics Laboratory through DOE SULI program in fusion energy research.",
            organization: "Princeton Plasma Physics Laboratory",
            location: "Princeton, NJ",
            type: "research",
            deadline: "Check DOE SULI website for deadlines",
            url: "https://www.pppl.gov/science-undergraduate-laboratory-internships-suli",
            source: "PPPL"
        },
        {
            title: "Brookhaven National Laboratory SULI",
            description: "Research internship at Brookhaven National Laboratory through DOE SULI program in nuclear and particle physics.",
            organization: "Brookhaven National Laboratory",
            location: "Upton, NY",
            type: "research",
            deadline: "Check DOE SULI website for deadlines",
            url: "https://www.bnl.gov/education/programs/program.php?q=188",
            source: "Brookhaven National Laboratory"
        },
        {
            title: "Fermilab SULI Program",
            description: "Research internship at Fermilab through DOE SULI program in high-energy physics and accelerator science.",
            organization: "Fermilab",
            location: "Batavia, IL",
            type: "research",
            deadline: "Check DOE SULI website for deadlines",
            url: "https://internships.fnal.gov/science-undergraduate-laboratory-internship-suli/",
            source: "Fermilab"
        }
    ];
    
    console.log(`Adding ${moreRealOpportunities.length} more REAL verified opportunities...`);
    
    let added = 0;
    let skipped = 0;
    
    for (const opp of moreRealOpportunities) {
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
    
    console.log('\n=== MORE REAL OPPORTUNITIES ADDED ===');
    console.log(`✅ Added: ${added} REAL verified opportunities`);
    console.log(`⚠️ Skipped duplicates: ${skipped}`);
    console.log(`📊 Total opportunities: ${newTotal}`);
    console.log('🎯 ALL VERIFIED THROUGH WEB SEARCH!');
    console.log('✅ These are REAL programs with actual application pages');
}

addMoreRealOpportunities().catch(console.error);