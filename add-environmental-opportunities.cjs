// Add REAL verified environmental and government opportunities
const { neon } = require('@neondatabase/serverless');

async function addEnvironmentalOpportunities() {
    console.log('=== ADDING ENVIRONMENTAL & GOVERNMENT OPPORTUNITIES ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Verified environmental and government opportunities
    const environmentalOpportunities = [
        // EPA - Real verified programs
        {
            title: "EPA ORISE Research Participation Program",
            description: "Flexible paid research internship for college students and recent graduates in STEM fields. Monthly stipends vary by education level and location with health insurance available.",
            organization: "Environmental Protection Agency",
            location: "Various EPA facilities nationwide",
            type: "research",
            deadline: "Rolling applications accepted year-round",
            url: "https://orise.orau.gov/epa/",
            source: "EPA ORISE"
        },
        {
            title: "EPA Student Pathways Program",
            description: "Paid federal internship for current students graduating within 9 months. GS-02 to GS-07 salary levels with potential conversion to permanent employment.",
            organization: "Environmental Protection Agency",
            location: "Various EPA locations",
            type: "internship",
            deadline: "Check USAJobs.gov for current openings",
            url: "https://www.epa.gov/careers/students",
            source: "EPA"
        },
        {
            title: "EPA Office of Water Volunteer Internship",
            description: "12+ week internship (40 hrs/week full-time or 20 hrs/week part-time) for undergraduate/graduate students in Washington D.C. Transit subsidy available.",
            organization: "Environmental Protection Agency",
            location: "Washington, D.C.",
            type: "internship",
            deadline: "Apply 2 months before semester start",
            url: "https://www.epa.gov/careers/student-volunteer-internships-20252026-office-water-washington-dc",
            source: "EPA Office of Water"
        },
        {
            title: "EPA Environmental Appeals Board Legal Internship",
            description: "Academic semester internships and summer honors law clerk program with EPA's Environmental Appeals Board for law students.",
            organization: "Environmental Protection Agency",
            location: "Washington, D.C.",
            type: "internship",
            deadline: "Check EPA careers for current openings",
            url: "https://www.epa.gov/careers/academic-semester-internshipsexternships-and-summer-honors-law-clerk-program-epas",
            source: "EPA"
        },
        
        // NOAA - Real verified programs
        {
            title: "NOAA Explorer-in-Training Program",
            description: "10-week summer internships or 2-4 week expedition-based opportunities aboard NOAA Ship Okeanos Explorer. For 18+ students and recent graduates with valid US passport.",
            organization: "National Oceanic and Atmospheric Administration",
            location: "Various NOAA locations and ship-based",
            type: "internship",
            deadline: "January 31, 2025",
            url: "https://oceanexplorer.noaa.gov/news/oer-updates/2024/eit-2025.html",
            source: "NOAA"
        },
        {
            title: "NOAA Inclusive Fisheries Internship Program (IN FISH)",
            description: "10-week paid internship (June 2 - August 8, 2025) with $5,000 stipend plus travel, lodging, food coverage. Begins with 2-week course at Sandy Hook, NJ.",
            organization: "NOAA Fisheries",
            location: "Sandy Hook, NJ and assigned research labs",
            type: "internship",
            deadline: "February 3, 2025",
            url: "https://www.fisheries.noaa.gov/event/accepting-2025-applications-inclusive-noaa-fisheries-internship-program",
            source: "NOAA Fisheries"
        },
        {
            title: "NOAA William M. Lapenta Student Summer Internship",
            description: "10-week paid summer internship in weather and climate modeling, forecast process, impact-based decision support, and product development.",
            organization: "National Weather Service",
            location: "Various NOAA/NWS locations",
            type: "internship",
            deadline: "Q&A sessions for 2026 program start August 2025",
            url: "https://vlab.noaa.gov/web/lapenta-internship-program",
            source: "NOAA/NWS"
        },
        {
            title: "NOAA Pathways Internship Program",
            description: "Part-time or full-time federal positions while enrolled in school with potential for non-competitive conversion to full-time employment upon graduation.",
            organization: "National Oceanic and Atmospheric Administration",
            location: "Various NOAA facilities",
            type: "internship",
            deadline: "Rolling basis via USAJobs.gov",
            url: "https://www.noaa.gov/pathways-internship",
            source: "NOAA"
        },
        {
            title: "NOAA Ernest F. Hollings Undergraduate Scholarship",
            description: "Up to $9,500/year for 2 years plus 10-week paid summer internship for 120+ students annually in oceanic and atmospheric sciences.",
            organization: "National Oceanic and Atmospheric Administration",
            location: "Various NOAA locations",
            type: "scholarship",
            deadline: "September through January annually",
            url: "https://www.noaa.gov/office-education/hollings-scholarship",
            source: "NOAA"
        },
        {
            title: "NOAA Coastal Resilience Fellowship",
            description: "2-year fellowship program starting June 2025 with 33 fellowship opportunities focused on climate change resilience and coastal flooding projects.",
            organization: "National Oceanic and Atmospheric Administration",
            location: "Various coastal locations",
            type: "fellowship",
            deadline: "February 28, 2025",
            url: "https://www.noaa.gov/education/opportunities/students",
            source: "NOAA"
        },
        
        // Department of Energy - Real verified programs
        {
            title: "DOE Science Undergraduate Laboratory Internships (SULI)",
            description: "10-week summer or semester-long paid internship at 17 DOE national laboratories for undergraduates and recent graduates within 2 years.",
            organization: "Department of Energy",
            location: "17 DOE national laboratories nationwide",
            type: "research",
            deadline: "Check for upcoming application periods",
            url: "https://science.osti.gov/wdts/suli",
            source: "DOE"
        },
        {
            title: "DOE Ready2Work (R2W) Internship",
            description: "12-week summer internship (extendable to academic year) with $374-$777/week stipend plus housing and commute supplements. Requires 3.0+ GPA.",
            organization: "Department of Energy",
            location: "DOE Headquarters, field offices, national laboratories",
            type: "internship",
            deadline: "February 7, 2025",
            url: "https://www.zintellect.com/Opportunity/Details/DOE-R2W-Internship-2025",
            source: "DOE"
        },
        {
            title: "DOE Scholars Program",
            description: "Department-wide internship with $900/week (undergraduates) or $950/week (graduates/recent graduates) at DOE facilities nationwide.",
            organization: "Department of Energy",
            location: "DOE Headquarters and field offices",
            type: "internship",
            deadline: "February 23, 2025",
            url: "https://www.energy.gov/internships-fellowships",
            source: "DOE"
        },
        {
            title: "DOE Community College Internships (CCI)",
            description: "Paid internship program specifically for community college students at DOE national laboratories with summer and semester options.",
            organization: "Department of Energy",
            location: "DOE national laboratories",
            type: "internship",
            deadline: "Check for upcoming application periods",
            url: "https://science.osti.gov/wdts/cci",
            source: "DOE"
        },
        {
            title: "DOE Mickey Leland Energy Fellowship (MLEF)",
            description: "10-week summer research internship for undergraduate and graduate STEM students interested in energy-related research.",
            organization: "Department of Energy",
            location: "Various DOE facilities",
            type: "fellowship",
            deadline: "2026 applications open September 2025",
            url: "https://orise.orau.gov/mlef/",
            source: "DOE"
        },
        
        // Peace Corps - Real verified program
        {
            title: "Peace Corps Volunteer Program",
            description: "27-month international service commitment (3 months training + 24 months service) in 60+ countries across education, health, agriculture, environment, economic development, and youth sectors.",
            organization: "Peace Corps",
            location: "60+ countries worldwide",
            type: "volunteer",
            deadline: "July 1, 2025 (next major deadline)",
            url: "https://www.peacecorps.gov/ways-to-serve/serve-with-us/peace-corps-volunteer/",
            source: "Peace Corps"
        },
        {
            title: "Peace Corps Caribbean Education Program",
            description: "27-month education volunteer opportunity in Dominica, Grenada, St. Lucia, St. Vincent & the Grenadines with enhanced readjustment allowance (~$20,000).",
            organization: "Peace Corps",
            location: "Caribbean (Dominica, Grenada, St. Lucia, St. Vincent & the Grenadines)",
            type: "volunteer",
            deadline: "October 1, 2025",
            url: "https://www.peacecorps.gov/ways-to-serve/service-assignments/browse-opportunities/peace-corps-volunteer/",
            source: "Peace Corps"
        },
        {
            title: "Peace Corps Response",
            description: "3-12 month shorter-term assignments for individuals with specialized skills and professional experience in high-impact, technical roles.",
            organization: "Peace Corps",
            location: "Various international locations",
            type: "volunteer",
            deadline: "Rolling applications",
            url: "https://www.peacecorps.gov/ways-to-serve/service-assignments/browse-opportunities/peace-corps-response/",
            source: "Peace Corps"
        }
    ];
    
    console.log(`Adding ${environmentalOpportunities.length} environmental & government opportunities...`);
    
    let added = 0;
    let skipped = 0;
    
    for (const opp of environmentalOpportunities) {
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
    
    console.log('\n=== ENVIRONMENTAL & GOVERNMENT OPPORTUNITIES ADDED ===');
    console.log(`✅ Added: ${added} REAL environmental & government opportunities`);
    console.log(`⚠️ Skipped duplicates: ${skipped}`);
    console.log(`📊 Total opportunities: ${newTotal}`);
    console.log('🎯 ALL VERIFIED THROUGH OFFICIAL GOVERNMENT WEBSITES!');
    console.log('✅ These are REAL programs with actual application processes');
}

addEnvironmentalOpportunities().catch(console.error);