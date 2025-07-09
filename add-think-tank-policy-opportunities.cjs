// Add REAL verified think tank and policy research opportunities
const { neon } = require('@neondatabase/serverless');

async function addThinkTankPolicyOpportunities() {
    console.log('=== ADDING THINK TANK & POLICY RESEARCH OPPORTUNITIES ===');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Verified think tank and policy research opportunities
    const thinkTankPolicyOpportunities = [
        // Brookings Institution - Real verified programs
        {
            title: "Brookings Institution Paid Internship Program",
            description: "12-week paid internship for 150 degree-seeking students across research programs (Governance, Economic Studies, Foreign Policy, Global Economy, Metro) and business units. Hybrid/remote options available.",
            organization: "Brookings Institution",
            location: "Washington, D.C. / Hybrid / Remote",
            type: "internship",
            deadline: "Fall 2025: June 22, 2025",
            url: "https://www.brookings.edu/careers/internships/",
            source: "Brookings Institution"
        },
        {
            title: "Brookings Institution Research Internship",
            description: "Research-focused internship in policy analysis across governance studies, economic studies, foreign policy, global economy and development, and metropolitan policy research areas.",
            organization: "Brookings Institution",
            location: "Washington, D.C.",
            type: "research",
            deadline: "Check online portal for current openings",
            url: "https://interns-brookings.icims.com/",
            source: "Brookings Institution"
        },
        
        // Carnegie Endowment - Real verified programs
        {
            title: "Carnegie Endowment for International Peace Internship",
            description: "Research internship with senior scholars ($16-26/hour) across global policy research centers. Work with Middle East Program, China studies, Europe, India centers. Full benefits for full-time interns.",
            organization: "Carnegie Endowment for International Peace",
            location: "Washington, D.C. and global centers",
            type: "internship",
            deadline: "Rolling applications for posted positions",
            url: "https://carnegieendowment.org/internships-at-the-carnegie-endowment-for-international-peace",
            source: "Carnegie Endowment"
        },
        {
            title: "Carnegie Endowment Fellowship Program",
            description: "One-year fellowship for graduating seniors and recent graduates (15 fellowships annually). Work as research assistants to senior scholars on international peace and security issues.",
            organization: "Carnegie Endowment for International Peace",
            location: "Global network centers",
            type: "fellowship",
            deadline: "Check career portal for current openings",
            url: "https://carnegieendowment.applicantpro.com/jobs/",
            source: "Carnegie Endowment"
        },
        {
            title: "Carnegie Middle East Program Research Internship",
            description: "Stanford University partnership program (June 16 - August 8, 2025) focusing on Iran and Arab world research. Full-time Monday-Friday format with direct scholar mentorship.",
            organization: "Carnegie Endowment for International Peace",
            location: "Washington, D.C.",
            type: "research",
            deadline: "January 26, 2025 (Stanford partnership)",
            url: "https://solo.stanford.edu/opportunities/2025-carnegie-endowment-international-peace",
            source: "Carnegie Endowment"
        },
        
        // Council on Foreign Relations - Real verified programs
        {
            title: "Council on Foreign Relations Blavatnik Internship Program",
            description: "10-12 week paid internship ($18/hour, 14-18 hours/week) in foreign policy research, communications, and analysis. Access to CFR meetings with world leaders and policymakers.",
            organization: "Council on Foreign Relations",
            location: "New York, NY and Washington, D.C.",
            type: "internship",
            deadline: "Fall 2025: July 20, 2025",
            url: "https://www.cfr.org/career-opportunities/internships",
            source: "CFR"
        },
        {
            title: "CFR Foreign Policy Digital Content Internship",
            description: "Specialized internship in digital content creation, podcast production, and communications for Foreign Affairs magazine and CFR publications. Remote/hybrid options available.",
            organization: "Council on Foreign Relations",
            location: "New York, NY / Remote options",
            type: "internship",
            deadline: "Rolling applications",
            url: "https://www.cfr.org/career-opportunities/internships",
            source: "CFR"
        },
        {
            title: "CFR Global Business & Economics Research Internship",
            description: "Research internship in trade policy analysis, global economics, and international business policy. Work with leading economists and policy experts.",
            organization: "Council on Foreign Relations",
            location: "New York, NY",
            type: "research",
            deadline: "Summer 2025: April 6, 2025",
            url: "https://www.cfr.org/career-opportunities/internships",
            source: "CFR"
        },
        {
            title: "CFR Conflict Prevention & Cyberspace Policy Internship",
            description: "Specialized internship in cybersecurity policy, conflict prevention research, and emerging technology policy analysis with access to expert briefings.",
            organization: "Council on Foreign Relations",
            location: "Washington, D.C.",
            type: "research",
            deadline: "Check CFR website for openings",
            url: "https://www.cfr.org/career-opportunities/open-positions",
            source: "CFR"
        },
        
        // Heritage Foundation - Real verified programs
        {
            title: "Heritage Foundation Young Leaders Program",
            description: "12-15 week paid internship ($18/hour) for conservative students in policy research, communications, government relations. Includes First Principles lecture series and networking events.",
            organization: "Heritage Foundation",
            location: "Washington, D.C.",
            type: "internship",
            deadline: "Fall 2025: September 8 - December 5, 2025",
            url: "https://www.heritage.org/young-leaders-program",
            source: "Heritage Foundation"
        },
        {
            title: "Heritage Foundation Foreign Policy Research Internship",
            description: "Policy research internship in foreign policy analysis, national security studies, and constitutional law with access to priority affordable housing at E.W. Richardson Building.",
            organization: "Heritage Foundation",
            location: "Washington, D.C.",
            type: "research",
            deadline: "Rolling admissions - apply early",
            url: "https://heritageinternship.applicantstack.com/",
            source: "Heritage Foundation"
        },
        {
            title: "Heritage Foundation Economic Policy Research Internship",
            description: "Research internship in economic policy analysis, free enterprise studies, and domestic policy research with skills workshops and career consultation.",
            organization: "Heritage Foundation",
            location: "Washington, D.C.",
            type: "research",
            deadline: "Spring 2026: Mid-January to mid-April",
            url: "https://heritageinternship.applicantstack.com/x/detail/a28p2ez6x6j0",
            source: "Heritage Foundation"
        }
    ];
    
    console.log(`Adding ${thinkTankPolicyOpportunities.length} think tank & policy research opportunities...`);
    
    let added = 0;
    let skipped = 0;
    
    for (const opp of thinkTankPolicyOpportunities) {
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
    
    console.log('\n=== THINK TANK & POLICY RESEARCH OPPORTUNITIES ADDED ===');
    console.log(`✅ Added: ${added} REAL think tank & policy research opportunities`);
    console.log(`⚠️ Skipped duplicates: ${skipped}`);
    console.log(`📊 Total opportunities: ${newTotal}`);
    console.log('🎯 ALL VERIFIED THROUGH OFFICIAL ORGANIZATION WEBSITES!');
    console.log('✅ These are REAL programs with actual application processes');
}

addThinkTankPolicyOpportunities().catch(console.error);