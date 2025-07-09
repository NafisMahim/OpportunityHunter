const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { opportunities } = require('./shared/schema.ts');

// Athletics & Sports Scholarship Opportunities
const athleticsOpportunities = [
  {
    title: "NCAA Division I Athletic Scholarships",
    description: "Revolutionary 2025-26 changes eliminate scholarship caps, allowing schools to offer up to $20.5 million in revenue sharing directly to student-athletes. All sports become equivalency sports with expanded opportunities.",
    company: "NCAA",
    location: "Nationwide",
    type: "scholarship",
    category: "Athletics",
    applicationUrl: "https://www.ncaa.org/sports/2021/2/10/recruiting-calendars-faq.aspx",
    deadline: "Varies by sport and recruitment cycle",
    requirements: "NCAA eligibility standards, strong academic performance",
    cost: "Full or partial tuition coverage",
    isRemote: false
  },
  {
    title: "NCAA Division II Athletic Scholarships",
    description: "Over $2.7 billion distributed annually in D1 and D2 scholarships. New 2025-26 changes create more scholarship opportunities with flexible award amounts based on athlete value and team budget.",
    company: "NCAA",
    location: "Nationwide",
    type: "scholarship",
    category: "Athletics",
    applicationUrl: "https://www.ncsasports.org/recruiting/how-to-get-recruited/scholarship-facts",
    deadline: "Year-round recruiting calendar",
    requirements: "NCAA eligibility, athletic ability, academic standards",
    cost: "Partial to full scholarships available",
    isRemote: false
  },
  {
    title: "NAIA Athletic Scholarships",
    description: "National Association of Intercollegiate Athletics offers athletic scholarships with often more flexible eligibility requirements than NCAA. Sometimes provides more funding than D1 programs.",
    company: "NAIA",
    location: "Nationwide",
    type: "scholarship",
    category: "Athletics",
    applicationUrl: "https://www.playnaia.org/",
    deadline: "Year-round applications",
    requirements: "NAIA eligibility standards",
    cost: "Varies by sport and school",
    isRemote: false
  },
  {
    title: "NJCAA Athletic Scholarships",
    description: "National Junior College Athletic Association scholarships for 2-year college athletics. Often serves as pathway to 4-year university athletics and scholarships.",
    company: "NJCAA",
    location: "Nationwide",
    type: "scholarship",
    category: "Athletics",
    applicationUrl: "https://www.njcaa.org/",
    deadline: "Ongoing recruitment",
    requirements: "High school graduation or equivalent",
    cost: "Full or partial aid available",
    isRemote: false
  },
  {
    title: "Bold.org Athletic Scholarships Collection",
    description: "Top 172 athletic scholarships available through Bold.org platform covering various sports and achievement levels. Includes sport-specific and general athletic achievement awards.",
    company: "Bold.org",
    location: "Online/Nationwide",
    type: "scholarship",
    category: "Athletics",
    applicationUrl: "https://bold.org/scholarships/by-type/athletic/",
    deadline: "Various deadlines throughout year",
    requirements: "Athletic participation, varies by scholarship",
    cost: "Awards from $500 to $10,000+",
    isRemote: true
  },
  {
    title: "NCAA Recruiting Exposure Camps",
    description: "Summer camps and showcases during NCAA evaluation periods (March 1 - April 2, 2025) where coaches can observe and recruit high school athletes. Key for scholarship consideration.",
    company: "Various NCAA Schools",
    location: "Nationwide",
    type: "competition",
    category: "Athletics",
    applicationUrl: "https://www.ncsasports.org/ncaa-eligibility-center/recruiting-rules/recruiting-calendar",
    deadline: "March 1 - April 2, 2025 evaluation period",
    requirements: "High school athlete status",
    cost: "Varies by camp ($200-$1000+)",
    isRemote: false
  },
  {
    title: "High School All-American Recognition Programs",
    description: "Elite recognition programs for top high school athletes that increase scholarship visibility and recruiting opportunities. Includes sport-specific All-American teams.",
    company: "Various Athletic Organizations",
    location: "Nationwide",
    type: "competition",
    category: "Athletics",
    applicationUrl: "https://www.maxpreps.com/",
    deadline: "Season-specific deadlines",
    requirements: "Elite athletic performance",
    cost: "Free nominations",
    isRemote: false
  },
  {
    title: "State Athletic Association Scholarships",
    description: "Many state high school athletic associations offer scholarships for academic and athletic achievement. State-specific opportunities with lower competition than national programs.",
    company: "State Athletic Associations",
    location: "State-specific",
    type: "scholarship",
    category: "Athletics",
    applicationUrl: "https://www.nfhs.org/",
    deadline: "Spring applications typically",
    requirements: "State residency, athletic participation",
    cost: "$500 to $5,000 typical awards",
    isRemote: false
  },
  {
    title: "Olympic Development Programs (ODP)",
    description: "Elite training programs for promising young athletes in Olympic sports. Provides pathway to national teams and university recruitment for sports like soccer, swimming, track.",
    company: "US Olympic & Paralympic Committee",
    location: "Regional training centers",
    type: "internship",
    category: "Athletics",
    applicationUrl: "https://www.teamusa.org/",
    deadline: "Sport-specific tryout periods",
    requirements: "Elite performance in Olympic sport",
    cost: "Program fees vary",
    isRemote: false
  },
  {
    title: "Professional Sports Youth Academies",
    description: "MLB, NBA, NFL, and MLS youth development programs offering elite training, education support, and pathway to professional careers. Some offer full scholarships.",
    company: "Professional Sports Leagues",
    location: "Major metropolitan areas",
    type: "internship",
    category: "Athletics",
    applicationUrl: "https://www.mlb.com/youth-academies",
    deadline: "Year-round evaluations",
    requirements: "Elite athletic ability",
    cost: "Often scholarship-funded",
    isRemote: false
  },
  {
    title: "IMG Academy Athletic Scholarships",
    description: "Premier athletic boarding school offering need-based and merit scholarships for elite young athletes. Combines top-level training with college preparatory academics.",
    company: "IMG Academy",
    location: "Bradenton, FL",
    type: "scholarship",
    category: "Athletics",
    applicationUrl: "https://www.imgacademy.com/",
    deadline: "Rolling admissions",
    requirements: "Elite athletic ability, academic standards",
    cost: "Partial to full scholarships available",
    isRemote: false
  },
  {
    title: "Women's Sports Foundation Scholarships",
    description: "Multiple scholarship programs specifically for female athletes including the Travel & Training Fund and various sport-specific awards promoting women's athletics.",
    company: "Women's Sports Foundation",
    location: "Nationwide",
    type: "scholarship",
    category: "Athletics",
    applicationUrl: "https://www.womenssportsfoundation.org/",
    deadline: "Various deadlines",
    requirements: "Female athletes",
    cost: "$1,000 to $10,000 awards",
    isRemote: false
  }
];

async function addAthleticsOpportunities() {
  try {
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log('Adding athletics and sports opportunities...');
    
    for (const opportunity of athleticsOpportunities) {
      try {
        await db.insert(opportunities).values(opportunity).onConflictDoNothing();
        console.log(`✓ Added: ${opportunity.title}`);
      } catch (error) {
        console.log(`⚠ Skipped duplicate: ${opportunity.title}`);
      }
    }

    console.log(`\n✅ Successfully processed ${athleticsOpportunities.length} athletics opportunities`);
    await sql.end();
  } catch (error) {
    console.error('Error adding athletics opportunities:', error);
  }
}

addAthleticsOpportunities();