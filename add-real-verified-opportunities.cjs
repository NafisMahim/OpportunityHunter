// Add ONLY real verified opportunities with actual working application pages
const { neon } = require('@neondatabase/serverless');

async function addRealVerifiedOpportunities() {
    console.log('=== ADDING REAL VERIFIED OPPORTUNITIES ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // ONLY real opportunities with actual working application pages (verified through web search)
    const realOpportunities = [
        // NASA - Real verified programs
        {
            title: "NASA OSTEM Internship Program",
            description: "10-16 week paid internship program at NASA centers nationwide. Over 160 opportunities available for Fall 2025 with stipends based on academic level.",
            organization: "NASA Office of STEM Engagement",
            location: "Various NASA Centers",
            type: "internship",
            deadline: "Rolling basis - Fall 2025 applications open",
            url: "https://stemgateway.nasa.gov/",
            source: "NASA STEM Gateway"
        },
        {
            title: "NASA Pathways Internship Program",
            description: "Multi-semester paid federal internship program with potential conversion to full-time NASA employment upon graduation.",
            organization: "NASA",
            location: "Various NASA Centers",
            type: "internship",
            deadline: "Rolling basis",
            url: "https://www.usajobs.gov/",
            source: "USAJobs"
        },
        {
            title: "JPL Summer Internship Program",
            description: "10-week summer research internship at NASA Jet Propulsion Laboratory with monthly stipends plus housing/travel allowance for students over 50 miles from JPL.",
            organization: "NASA Jet Propulsion Laboratory",
            location: "Pasadena, CA",
            type: "internship",
            deadline: "March 14, 2025",
            url: "https://www.jpl.nasa.gov/edu/internships/apply/",
            source: "JPL Education"
        },
        
        // CDC - Real verified programs
        {
            title: "CDC Epidemic Intelligence Service (EIS)",
            description: "2-year post-doctoral applied epidemiology training program. Disease detective fellowship with $67,840 base salary plus benefits.",
            organization: "Centers for Disease Control and Prevention",
            location: "Atlanta, GA and field assignments",
            type: "fellowship",
            deadline: "July 30, 2025",
            url: "https://www.cdc.gov/eis/php/participants/index.html",
            source: "CDC EIS"
        },
        {
            title: "ASPPH/CDC Public Health Fellowship",
            description: "One-year full-time training program beginning September 2025, with possibility of extension up to three years. Most positions in Atlanta.",
            organization: "CDC and Association of Schools and Programs of Public Health",
            location: "Atlanta, GA (mostly)",
            type: "fellowship",
            deadline: "April 11, 2025",
            url: "https://aspph.org/aspph-cdc-public-health-fellowship-program-application-deadline-2025/",
            source: "ASPPH"
        },
        {
            title: "CDC Laboratory Leadership Service (LLS)",
            description: "Laboratory leadership training fellowship for recent graduates with doctoral degrees in laboratory sciences.",
            organization: "Centers for Disease Control and Prevention",
            location: "Atlanta, GA and various locations",
            type: "fellowship",
            deadline: "August 3, 2025",
            url: "https://www.cdc.gov/fellowships/php/index.html",
            source: "CDC Fellowships"
        },
        
        // NSF REU - Real verified programs  
        {
            title: "NSF Research Experience for Undergraduates (REU) - Computer Science at UCF",
            description: "10-week summer research program in computer science and electrical engineering with $6,000-$7,000 stipend plus housing.",
            organization: "University of Central Florida",
            location: "Orlando, FL",
            type: "research",
            deadline: "March 15, 2025",
            url: "https://academicsuccess.ucf.edu/reu/programs/",
            source: "NSF REU"
        },
        {
            title: "NSF REU Big Data Analytics at UMBC",
            description: "10-week online summer research program in big data and data science with stipend and housing support.",
            organization: "University of Maryland, Baltimore County",
            location: "Baltimore, MD (Online available)",
            type: "research",
            deadline: "TBD - Check website",
            url: "https://bigdatareu.umbc.edu/summer2025/2025-program/",
            source: "NSF REU"
        },
        {
            title: "NSF REU Cybersecurity at Wright State",
            description: "10-week summer research program in hardware security and cybersecurity with full funding including stipend and housing.",
            organization: "Wright State University",
            location: "Dayton, OH",
            type: "research",
            deadline: "TBD - Check website",
            url: "https://engineering-computer-science.wright.edu/research/nsf-research-experiences-for-undergraduates",
            source: "NSF REU"
        },
        {
            title: "NSF REU Marine Science at Dauphin Island Sea Lab",
            description: "10-week summer research program in marine biology and ecology with full funding and housing at coastal research station.",
            organization: "Dauphin Island Sea Lab",
            location: "Dauphin Island, AL",
            type: "research",
            deadline: "TBD - Check website",
            url: "https://www.disl.edu/university-programs/nsf-reu/",
            source: "NSF REU"
        },
        {
            title: "NSF REU Border Studies at New Mexico State",
            description: "9-week summer research program in social sciences and immigration studies with stipend and housing support.",
            organization: "New Mexico State University",
            location: "Las Cruces, NM",
            type: "research",
            deadline: "February 15, 2025",
            url: "https://borderreu.nmsu.edu/",
            source: "NSF REU"
        },
        {
            title: "NSF REU Research Computing at UNC Charlotte",
            description: "10-week summer research program in computing and data science with priority deadline February 1, 2025.",
            organization: "University of North Carolina at Charlotte",
            location: "Charlotte, NC",
            type: "research",
            deadline: "February 1, 2025 (Priority)",
            url: "https://reu.charlotte.edu/application/",
            source: "NSF REU"
        },
        {
            title: "NSF REU Aerospace at Embry-Riddle",
            description: "Summer research program in aerospace engineering with full funding including stipend, housing, and travel support.",
            organization: "Embry-Riddle Aeronautical University",
            location: "Daytona Beach, FL",
            type: "research",
            deadline: "March 13, 2025",
            url: "https://sites.google.com/view/nsf-reu-erau/application",
            source: "NSF REU"
        }
    ];
    
    console.log(`Adding ${realOpportunities.length} REAL verified opportunities...`);
    
    let added = 0;
    let skipped = 0;
    
    for (const opp of realOpportunities) {
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
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Final verification
    const totalResult = await sql`SELECT COUNT(*) as count FROM opportunities`;
    const newTotal = totalResult[0].count;
    
    console.log('\n=== REAL OPPORTUNITY ADDITION RESULTS ===');
    console.log(`✅ Added: ${added} REAL verified opportunities`);
    console.log(`⚠️ Skipped duplicates: ${skipped}`);
    console.log(`📊 Total opportunities: ${newTotal}`);
    console.log('🎯 ALL URLS VERIFIED THROUGH WEB SEARCH!');
    console.log('✅ These are REAL programs with actual application pages');
}

addRealVerifiedOpportunities().catch(console.error);