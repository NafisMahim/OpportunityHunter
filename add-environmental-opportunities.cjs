const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { opportunities } = require('./shared/schema.ts');

// Environmental Science & Sustainability Opportunities
const environmentalOpportunities = [
  {
    title: "Washington Youth Summit on the Environment (WYSE)",
    description: "Intensive, hands-on residential program hosted by George Mason University & Smithsonian National Zoo focusing on current environmental issues, conservation, and sustainability. Highly competitive with 300 participants selected.",
    company: "George Mason University & Smithsonian National Zoo",
    location: "Washington, DC",
    type: "internship",
    category: "Environmental Science",
    applicationUrl: "https://nationalzoo.si.edu/conservation/wyse",
    deadline: "December 2025",
    requirements: "Strong academics, leadership experience, demonstrated environmental passion",
    cost: "Free",
    isRemote: false
  },
  {
    title: "Environmental Studies Summer Youth Institute (ESSYI)",
    description: "2-week college-level program offering interdisciplinary approach to environmental problem-solving. Rising juniors/seniors can earn 1 credit (4 semester hours).",
    company: "Hobart and William Smith Colleges",
    location: "Geneva, NY",
    type: "internship",
    category: "Environmental Science",
    applicationUrl: "http://essyi.hws.edu/",
    deadline: "Rolling basis",
    requirements: "Rising juniors/seniors, 50-student limit",
    cost: "Program fee applies",
    isRemote: false
  },
  {
    title: "Brown Environmental Leadership Lab (BELL)",
    description: "Environmental studies + social responsibility + leadership program with locations in Providence RI, Key Largo FL, Mammoth Lakes CA, and Anchorage AK. Focus on location-specific environmental challenges.",
    company: "Brown University",
    location: "Multiple locations",
    type: "internship",
    category: "Environmental Science",
    applicationUrl: "https://www.brown.edu/academics/pre-college/bell/",
    deadline: "Spring 2025",
    requirements: "High school students",
    cost: "Program fee applies",
    isRemote: false
  },
  {
    title: "Stanford Young Investigators - Sustainability",
    description: "Research lab experience with graduate student mentors at Stanford Doerr School of Sustainability. Includes weekly talks, lab tours, and field trips.",
    company: "Stanford University",
    location: "Bay Area, CA",
    type: "internship",
    category: "Environmental Science",
    applicationUrl: "https://sustainability.stanford.edu/admissions-education/k-12-outreach/young-investigators",
    deadline: "March 15, 2025",
    requirements: "Within 25 miles of Stanford campus",
    cost: "Free",
    isRemote: false
  },
  {
    title: "NSLC Environmental Science & Sustainability",
    description: "Eco-conscious leadership development through experiential simulations, guest speakers, and field trips. Projects include advocacy campaigns, green home design, and renewable energy building.",
    company: "National Student Leadership Conference",
    location: "Multiple campuses",
    type: "internship",
    category: "Environmental Science",
    applicationUrl: "https://www.nslcleaders.org/youth-leadership-programs/environmental-science-sustainability/",
    deadline: "May 1, 2025",
    requirements: "High school students",
    cost: "Monthly payment plans available",
    isRemote: false
  },
  {
    title: "Washington University Environmental Studies Institute",
    description: "2-week program for rising juniors/seniors focusing on environmental problem-solving and sustainability principles through hands-on projects and interactive lectures.",
    company: "Washington University in St. Louis",
    location: "St. Louis, MO",
    type: "internship",
    category: "Environmental Science",
    applicationUrl: "https://precollege.wustl.edu/environmental-studies-institute-summary",
    deadline: "Spring 2025",
    requirements: "Rising juniors/seniors",
    cost: "Program fee applies",
    isRemote: false
  },
  {
    title: "Sewanee Environmental Institute (SEI)",
    description: "Environmental program utilizing 13,000-acre forest and working farm. Rising sophomores, juniors, and seniors can access funded internships and scholarships.",
    company: "University of the South",
    location: "Sewanee, TN",
    type: "internship",
    category: "Environmental Science",
    applicationUrl: "https://new.sewanee.edu/academics/summer-in-sewanee/high-school-students/pre-college-field-studies-experience/",
    deadline: "May 1, 2025",
    requirements: "Rising sophomores, juniors, seniors",
    cost: "$1,700 per session (2025), partial scholarships available",
    isRemote: false
  },
  {
    title: "Project TRUE - Bronx Wildlife Research",
    description: "Paid internship for high school sophomores/juniors from the Bronx partnering with Fordham University and Wildlife Conservation Society. Includes wildlife research, social media curation, and Bronx Zoo experience.",
    company: "Fordham University & Wildlife Conservation Society",
    location: "Bronx, NY",
    type: "internship",
    category: "Environmental Science",
    applicationUrl: "https://www.fordham.edu/academics/programs/project-true/",
    deadline: "Spring 2025",
    requirements: "High school sophomores/juniors from the Bronx",
    cost: "Paid internship",
    isRemote: false
  },
  {
    title: "Ladder Environmental Startup Internships",
    description: "Remote, flexible scheduling internships with environmental startups focusing on carbon footprint reduction and resource restoration. Work with high-growth companies and present to leadership.",
    company: "Ladder Internships",
    location: "Remote",
    type: "internship",
    category: "Environmental Science",
    applicationUrl: "https://ladderinternships.com/",
    deadline: "Year-round applications",
    requirements: "High school students worldwide",
    cost: "Free",
    isRemote: true
  },
  {
    title: "Westmoreland Sanctuary Ecology Internship",
    description: "Hands-on ecology internship focusing on pond/forest ecology, invasive species, and animal anatomy. Activities include deer fence installation and water quality testing.",
    company: "Westmoreland Sanctuary",
    location: "Bedford Corners, NY",
    type: "internship",
    category: "Environmental Science",
    applicationUrl: "https://www.westmorelandsanctuary.org/",
    deadline: "Spring applications",
    requirements: "High school students",
    cost: "Free",
    isRemote: false
  },
  {
    title: "Maryland Green Schools Program Grants",
    description: "Funding opportunity for schools to become certified green schools. 654 schools already certified serving 430,000 PreK-12 students. Grants range from $250-$2,500.",
    company: "Maryland Association for Environmental & Outdoor Education",
    location: "Maryland",
    type: "grant",
    category: "Environmental Science",
    applicationUrl: "https://www.maeoe.org/green-schools",
    deadline: "Ongoing applications",
    requirements: "Maryland schools",
    cost: "Grant funding: $250-$2,500",
    isRemote: false
  },
  {
    title: "USGBC California Green Schools Micro-grants",
    description: "$2,000 micro-grants available for school sustainability projects. Includes sustainability workshops, hands-on kits, and teacher memberships.",
    company: "U.S. Green Building Council California",
    location: "California",
    type: "grant",
    category: "Environmental Science",
    applicationUrl: "https://usgbc-ca.org/programs/green-schools/",
    deadline: "October 15, 2025",
    requirements: "California schools and students",
    cost: "Grant funding: $2,000",
    isRemote: false
  }
];

async function addEnvironmentalOpportunities() {
  try {
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log('Adding environmental science opportunities...');
    
    for (const opportunity of environmentalOpportunities) {
      try {
        await db.insert(opportunities).values(opportunity).onConflictDoNothing();
        console.log(`✓ Added: ${opportunity.title}`);
      } catch (error) {
        console.log(`⚠ Skipped duplicate: ${opportunity.title}`);
      }
    }

    console.log(`\n✅ Successfully processed ${environmentalOpportunities.length} environmental opportunities`);
    await sql.end();
  } catch (error) {
    console.error('Error adding environmental opportunities:', error);
  }
}

addEnvironmentalOpportunities();