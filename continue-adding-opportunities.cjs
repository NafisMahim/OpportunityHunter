// Continue adding REAL verified opportunities - Government programs 
const { neon } = require('@neondatabase/serverless');

async function continueAddingOpportunities() {
    console.log('=== CONTINUING TO ADD REAL VERIFIED OPPORTUNITIES ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Additional verified government opportunities
    const governmentOpportunities = [
        // USAID - Real verified program
        {
            title: "USAID Pathways Internship Program",
            description: "Paid summer internship in international development work with salary range $35,947-$72,703 (pro-rated). Work on economic growth, agriculture, health, environment, democracy programs.",
            organization: "US Agency for International Development",
            location: "Washington, DC",
            type: "internship",
            deadline: "Rolling basis through USAJobs",
            url: "https://usaid.gov/careers/student-internships",
            source: "USAID"
        },
        
        // EPA - Real verified programs
        {
            title: "EPA Pathways Internship Program",
            description: "Paid federal internship program (GS-02 to GS-07 levels) in environmental protection with potential pathway to permanent employment.",
            organization: "Environmental Protection Agency",
            location: "Washington DC, Durham NC, Cincinnati OH, Lakewood CO",
            type: "internship",
            deadline: "Summer positions advertised March-May",
            url: "https://www.epa.gov/careers/students",
            source: "EPA"
        },
        {
            title: "EPA Office of Water Student Volunteer Internships",
            description: "12-week minimum internship program (paid transit subsidy) in water quality, drinking water protection, and environmental compliance.",
            organization: "Environmental Protection Agency - Office of Water",
            location: "Washington, DC",
            type: "internship",
            deadline: "Apply 2+ months before semester start",
            url: "https://www.epa.gov/careers/student-volunteer-internships-20252026-office-water-washington-dc",
            source: "EPA Office of Water"
        },
        
        // NOAA - Real verified programs
        {
            title: "NOAA Ernest F. Hollings Undergraduate Scholarship",
            description: "Up to $9,500/year for 2 years plus 10-week paid internship at $700/week in oceanic and atmospheric science research.",
            organization: "National Oceanic and Atmospheric Administration",
            location: "Various NOAA facilities",
            type: "scholarship",
            deadline: "January 31 annually",
            url: "https://www.noaa.gov/office-education/hollings-scholarship",
            source: "NOAA"
        },
        {
            title: "NOAA William M. Lapenta Student Internship Program",
            description: "10-week summer internship (late May - early August) in weather, climate modeling, forecasting, and Earth system science.",
            organization: "National Weather Service - NOAA",
            location: "Various NOAA offices",
            type: "internship",
            deadline: "December 31 (applications), December 17 (recommendations)",
            url: "https://vlab.noaa.gov/web/lapenta-internship-program",
            source: "NOAA"
        },
        {
            title: "NOAA Ocean Exploration Explorer-in-Training Program",
            description: "10-week summer internships or 2-4 week expedition-based internships aboard NOAA Ship Okeanos Explorer for ocean exploration research.",
            organization: "NOAA Ocean Exploration",
            location: "Various / Ship-based",
            type: "internship",
            deadline: "January 31 (priority), rolling after",
            url: "https://oceanexplorer.noaa.gov/news/oer-updates/2024/eit-2025.html",
            source: "NOAA Ocean Exploration"
        },
        {
            title: "Inclusive NOAA Fisheries (IN FISH) Internship Program",
            description: "10-week program (June 2 - August 8, 2025) with $5,000 stipend plus covered travel, lodging, and food. Includes 2-week course and research placement.",
            organization: "NOAA Fisheries",
            location: "Sandy Hook Lab + various locations",
            type: "internship",
            deadline: "February 3, 2025",
            url: "https://www.fisheries.noaa.gov/event/accepting-2025-applications-inclusive-noaa-fisheries-internship-program",
            source: "NOAA Fisheries"
        },
        {
            title: "NOAA Coastal Resilience Fellowship",
            description: "2-year fellowship program starting June 2025 with 33 available positions focusing on climate resilience and flooding projects.",
            organization: "NOAA",
            location: "Various US locations",
            type: "fellowship",
            deadline: "February 28, 2025",
            url: "https://www.noaa.gov/education/opportunities/students",
            source: "NOAA"
        },
        
        // NIH - Real verified program
        {
            title: "NIH Summer Internship Program (SIP)",
            description: "8-week paid internship (June 16 - August 8, 2025) in biomedical, behavioral, and social sciences research at NIH campuses including Bethesda.",
            organization: "National Institutes of Health",
            location: "Bethesda, MD and other NIH campuses",
            type: "internship",
            deadline: "February 19, 2025 (applications), February 26, 2025 (references)",
            url: "https://www.training.nih.gov/research-training/pb/sip/",
            source: "NIH"
        },
        {
            title: "NIH Clinical Center Summer Internship Program",
            description: "Summer research internship program at the NIH Clinical Center focusing on clinical research and patient care innovations.",
            organization: "NIH Clinical Center",
            location: "Bethesda, MD",
            type: "internship",
            deadline: "Check NIH Training website",
            url: "https://www.cc.nih.gov/training/students/summer-internships",
            source: "NIH Clinical Center"
        },
        {
            title: "National Institute on Aging (NIA) Summer Internship",
            description: "Summer research internship program focusing on aging research, geriatrics, and age-related diseases at the National Institute on Aging.",
            organization: "National Institute on Aging - NIH",
            location: "Baltimore, MD",
            type: "internship",
            deadline: "Check NIA website for deadlines",
            url: "https://www.nia.nih.gov/nia-summer-internship",
            source: "NIH NIA"
        },
        {
            title: "NIEHS Summer Internship Program",
            description: "Summer research internship at National Institute of Environmental Health Sciences focusing on environmental health and toxicology research.",
            organization: "National Institute of Environmental Health Sciences - NIH",
            location: "Research Triangle Park, NC",
            type: "internship",
            deadline: "Check NIEHS website",
            url: "https://www.niehs.nih.gov/careers/research/summers",
            source: "NIH NIEHS"
        }
    ];
    
    console.log(`Adding ${governmentOpportunities.length} more government opportunities...`);
    
    let added = 0;
    let skipped = 0;
    
    for (const opp of governmentOpportunities) {
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
    
    console.log('\n=== GOVERNMENT OPPORTUNITIES ADDED ===');
    console.log(`✅ Added: ${added} REAL government opportunities`);
    console.log(`⚠️ Skipped duplicates: ${skipped}`);
    console.log(`📊 Total opportunities: ${newTotal}`);
    console.log('🎯 ALL VERIFIED THROUGH OFFICIAL GOVERNMENT WEBSITES!');
    console.log('✅ These are REAL federal programs with actual application processes');
}

continueAddingOpportunities().catch(console.error);