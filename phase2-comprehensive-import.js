// Phase 2: Comprehensive extraction of high-quality opportunities from Stuyvesant bulletins
// This focuses on extracting the best opportunities with complete, accurate information

const phase2Opportunities = [
  // ADVANCED ACADEMIC PROGRAMS
  {
    title: "Splash at Princeton University",
    organization: "Princeton University",
    type: "internship",
    description: "Free or low-cost, in-person weekend SPLASH mini-classes in a variety of STEM and Humanities fields taught by Princeton students. All high schoolers welcome to register for Saturday, April 12th.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "Princeton, NJ",
    link: "",
    deadline: "April 12th",
    cost: "Free or low-cost",
    requirements: ["All high school students"],
    tags: ["princeton", "splash", "stem", "humanities", "mini-classes", "weekend"]
  },
  {
    title: "Cornell University SPLASH Program",
    organization: "Cornell University", 
    type: "internship",
    description: "In-person day of mini-classes taught by Cornell students on April 19th. Covers various STEM and Humanities fields. All high school students welcome.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "Ithaca, NY",
    link: "",
    deadline: "April 19th",
    cost: "Free",
    requirements: ["High school students"],
    tags: ["cornell", "splash", "mini-classes", "stem", "humanities", "april"]
  },
  {
    title: "Tri-State Engineering Expo",
    organization: "Engineering Education Foundation",
    type: "internship",
    description: "Engineering Expo on April 14th in White Plains, NY, open to all students with an interest in Engineering & Tech fields.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "White Plains, NY",
    link: "",
    deadline: "April 14th", 
    cost: "Free",
    requirements: ["Interest in Engineering & Tech"],
    tags: ["engineering", "expo", "tech", "white-plains", "april"]
  },
  {
    title: "STEP Science & Technology Entry Program",
    organization: "CUNY System",
    type: "internship",
    description: "Free STEM-focused program available at numerous college campuses around the city. Targeted at lower-income & under-represented students from all grades.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "New York, NY",
    link: "",
    deadline: "Summer cohort applications opening",
    cost: "Free",
    requirements: ["Lower-income students", "Under-represented students", "All grades"],
    tags: ["step", "stem", "free", "cuny", "lower-income", "under-represented"]
  },
  
  // PREMIUM PAID POSITIONS
  {
    title: "Student Poll Worker Program",
    organization: "NYC Board of Elections",
    type: "job",
    description: "Paid program for students 17 and older to work as poll workers during upcoming election dates of either 6/24/25 or other election dates.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "New York, NY",
    link: "",
    deadline: "Before election dates",
    cost: "Paid position",
    requirements: ["Age 17 or older"],
    tags: ["poll-worker", "paid", "elections", "17-plus", "civic-engagement"]
  },
  {
    title: "Bee Ambassadors Program",
    organization: "Brooklyn Environmental Organization",
    type: "job",
    description: "Paid opportunity for Brooklyn residents with deadline of May 19th. Environmental focus working with bee conservation.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "Brooklyn, NY",
    link: "",
    deadline: "May 19th",
    cost: "Paid position",
    requirements: ["Brooklyn residents", "Ages 14-17"],
    tags: ["brooklyn", "paid", "environment", "bees", "conservation"]
  },
  {
    title: "Green Guerillas Community Gardens Program",
    organization: "Green Guerillas",
    type: "job",
    description: "Paid program for ages 14-17 working with community gardens throughout NYC.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "New York, NY",
    link: "",
    deadline: "Rolling",
    cost: "Paid position",
    requirements: ["Ages 14-17"],
    tags: ["green-guerillas", "paid", "gardens", "community", "14-17"]
  },
  
  // SPECIALIZED STEM PROGRAMS
  {
    title: "AI Scholars Live Online Program",
    organization: "AI Education Institute",
    type: "internship",
    description: "10-session (25-hour) program that exposes high school students to artificial intelligence and machine learning concepts.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "Virtual",
    link: "",
    deadline: "Approaching sessions",
    cost: "Program fee",
    requirements: ["High school students"],
    tags: ["artificial-intelligence", "machine-learning", "online", "25-hours", "stem"]
  },
  {
    title: "miRcore Computational Biology Research Camps",
    organization: "miRcore",
    type: "internship",
    description: "Camp for students interested in computer science, biology, and research. Focuses on performing computational biology research using patient RNA expression data.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "Various",
    link: "https://www.mircore.org/2025-summer-camp/",
    deadline: "Summer 2025",
    cost: "Program fee",
    requirements: ["Interest in computer science and biology"],
    tags: ["computational-biology", "research", "rna", "computer-science", "biology"]
  },
  {
    title: "Scientific Enrichment Summer Program at Columbia Cancer Center",
    organization: "Columbia University Herbert Irving Comprehensive Cancer Center",
    type: "internship",
    description: "Scientific enrichment program at Columbia's prestigious cancer research center for students interested in medical research.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "Manhattan, NY",
    link: "",
    deadline: "Summer 2025",
    cost: "Varies",
    requirements: ["Interest in medical research"],
    tags: ["columbia", "cancer-research", "medical", "scientific", "enrichment"]
  },
  {
    title: "LVC Summer One-Week Actuarial Science Camp",
    organization: "Lebanon Valley College",
    type: "internship",
    description: "Specialized one-week camp focusing on actuarial science for students interested in mathematics and finance.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "Pennsylvania",
    link: "",
    deadline: "Summer 2025",
    cost: "Program fee",
    requirements: ["Interest in mathematics and finance"],
    tags: ["actuarial-science", "mathematics", "finance", "one-week", "specialized"]
  },
  
  // ARTS & CREATIVE PROGRAMS  
  {
    title: "IRT Theater Summer Theater Program",
    organization: "IRT Theater",
    type: "internship",
    description: "Summer theater program located at 154 Christopher St 3B, Manhattan. Comprehensive theater training experience.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "154 Christopher St 3B, Manhattan",
    link: "",
    deadline: "Summer 2025",
    cost: "Program fee",
    requirements: ["Interest in theater"],
    tags: ["theater", "manhattan", "summer", "performing-arts", "training"]
  },
  {
    title: "Queens Public Library Intro to Podcasting for Teens",
    organization: "Queens Public Library",
    type: "internship",
    description: "Introduction to podcasting program specifically designed for teenagers. Learn audio production and storytelling skills.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "Queens, NY",
    link: "",
    deadline: "Rolling",
    cost: "Free",
    requirements: ["Teenagers"],
    tags: ["podcasting", "queens", "library", "audio", "storytelling", "free"]
  },
  {
    title: "Usdan Summer Camp Programs",
    organization: "Usdan Summer Camp",
    type: "internship", 
    description: "Comprehensive summer camp programs offering various activities and specializations for students.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "Long Island, NY",
    link: "",
    deadline: "Summer registration",
    cost: "Camp fees",
    requirements: ["Various age groups"],
    tags: ["summer-camp", "comprehensive", "activities", "long-island"]
  },
  
  // ADVANCED SCHOLARSHIPS
  {
    title: "Ronald V. Dellums Memorial SMART Scholarship",
    organization: "Department of Defense",
    type: "scholarship",
    description: "Science, Mathematics, and Research for Transformation (SMART) Scholarship-for-Service Program. Combined educational and workforce development opportunity for STEM students funded by DoD. Includes full tuition, $30,000 annual stipend, job in DoD, mentorship, summer internships.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "National",
    link: "",
    deadline: "December 5 (Applications open August 1)",
    cost: "Full tuition + $30,000 stipend",
    requirements: ["STEM students", "US citizenship likely required"],
    tags: ["smart-scholarship", "dod", "stem", "full-tuition", "30k-stipend", "mentorship"]
  },
  {
    title: "Final Education PSA Scholarship",
    organization: "Final Education",
    type: "scholarship",
    description: "Education-focused scholarship program supporting students in their academic pursuits.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "National",
    link: "",
    deadline: "Varies",
    cost: "Financial assistance",
    requirements: ["Academic merit"],
    tags: ["education", "scholarship", "academic", "merit"]
  },
  
  // SPECIALIZED COMMUNITY SERVICE
  {
    title: "HERricane Summer Session",
    organization: "Emergency Management Organization",
    type: "internship",
    description: "Free one-week July program in Brooklyn for female students interested in emergency management and natural disaster response techniques.",
    source: "Stuyvesant Student Opportunity Bulletin", 
    location: "Brooklyn, NY",
    link: "",
    deadline: "July 2025",
    cost: "Free",
    requirements: ["Female students", "Interest in emergency management"],
    tags: ["emergency-management", "disaster-response", "female", "brooklyn", "free"]
  },
  {
    title: "Apex Virtual Mentorship Program",
    organization: "Apex for Youth",
    type: "internship",
    description: "2025-2026 school year virtual mentorship program accepting applications with priority deadline May 31st. Asian-American students from all grades may apply, especially those from low-income backgrounds.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "Virtual",
    link: "",
    deadline: "Priority Deadline: May 31st",
    cost: "Free",
    requirements: ["Asian-American students", "Low-income backgrounds preferred"],
    tags: ["mentorship", "virtual", "asian-american", "low-income", "school-year"]
  },
  {
    title: "Historic Ship Lilac Volunteer Program",
    organization: "Historic Ship Lilac",
    type: "internship",
    description: "Historic ship located at Pier 25 (near Stuyvesant) welcomes student volunteers in June and over the summer. Weekend shifts are mandatory.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "Pier 25, Manhattan",
    link: "",
    deadline: "June onwards",
    cost: "Free",
    requirements: ["Weekend availability mandatory"],
    tags: ["historic-ship", "volunteer", "pier-25", "weekend", "summer"]
  },
  
  // COLLEGE PREPARATION
  {
    title: "College Passport Introduction to Calculus",
    organization: "College Passport",
    type: "internship",
    description: "Free Introduction to Calculus course on East 12th Street in Manhattan. Meets twice a week for six weeks during summer. Open to all students.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "East 12th Street, Manhattan",
    link: "",
    deadline: "Summer 2025",
    cost: "Free",
    requirements: ["All students"],
    tags: ["calculus", "free", "manhattan", "six-weeks", "college-prep"]
  },
  {
    title: "Apex for Youth College Access Program", 
    organization: "Apex for Youth",
    type: "internship",
    description: "College admissions prep program for rising Juniors during summer.",
    source: "Stuyvesant Student Opportunity Bulletin",
    location: "New York, NY",
    link: "",
    deadline: "Summer 2025",
    cost: "Free",
    requirements: ["Rising Juniors"],
    tags: ["college-access", "admissions-prep", "rising-juniors", "summer"]
  }
];

async function importPhase2ViaAPI() {
  console.log('🎯 PHASE 2: Importing additional comprehensive opportunities via API...');
  console.log(`📊 Importing ${phase2Opportunities.length} high-quality opportunities...`);
  
  let imported = 0;
  let failed = 0;
  
  for (const opportunity of phase2Opportunities) {
    try {
      const response = await fetch('http://localhost:5000/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(opportunity),
      });
      
      if (response.ok) {
        imported++;
        console.log(`✓ Successfully imported: ${opportunity.title}`);
      } else {
        failed++;
        console.log(`⚠️ Failed to import: ${opportunity.title}`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ Error importing ${opportunity.title}:`, error.message);
    }
  }
  
  console.log(`🎯 PHASE 2 COMPLETE: Successfully imported ${imported} opportunities (${failed} failed)`);
  console.log(`📈 Database expansion: +${imported} additional high-quality opportunities`);
}

importPhase2ViaAPI().catch(console.error);