const fs = require('fs');

// Manual extraction of ALL opportunities from PDF files with correct URLs
// This will process EVERY opportunity from the provided PDF files

const opportunities = [];

// BUSINESS PROGRAMS - from Free Summer Programs - Business.pdf
const businessPrograms = [
  {
    title: "Penn State Business Opportunities Summer Session (BOSS)",
    description: "Business Opportunities Summer Session for high school students interested in business careers and entrepreneurship. Program includes workshops, networking, and hands-on business projects.",
    eligibility: "Current 11th grade students with Green Card status",
    cost: "Free",
    location: "Penn State University, Pennsylvania",
    category: "Business",
    subject: "Business Administration",
    dates: "Summer",
    url: "https://pennstatebehrend.psu.edu/school-of-business/outreach/boss"
  },
  {
    title: "University of Texas at Austin McCombs School of Business Programs",
    description: "Summer business programs at UT Austin's prestigious McCombs School of Business, focusing on entrepreneurship, finance, and business fundamentals for Texas high school students.",
    eligibility: "Current 11th grade students, Texas high school students preferred",
    cost: "Free",
    location: "University of Texas at Austin",
    category: "Business",
    subject: "Business",
    dates: "Summer",
    url: "https://www.mccombs.utexas.edu/undergraduate/prospective-students/outreach"
  },
  {
    title: "Indiana University MEET Kelly",
    description: "Multi-cultural business leadership program at Indiana University's Kelley School of Business, designed for underrepresented students interested in business careers.",
    eligibility: "Current 11th grade students from underrepresented groups",
    cost: "Free",
    location: "Indiana University Kelley School of Business",
    category: "Business",
    subject: "Business Leadership",
    dates: "Summer",
    url: "https://kelley.iu.edu/programs/undergraduate/diversity-inclusion/meet-kelley/"
  },
  {
    title: "TCU Supply Chain Business Technology Camp",
    description: "Intensive supply chain management and business technology program at Texas Christian University for Fort Worth area students.",
    eligibility: "Current 10th-11th grade students from Fort Worth Area",
    cost: "Free",
    location: "Texas Christian University",
    category: "Business",
    subject: "Supply Chain Management",
    dates: "Summer",
    url: "https://neeley.tcu.edu/academic-departments/supply-and-value-chain-management/"
  },
  {
    title: "Bank of America Student Leaders",
    description: "Paid leadership development program connecting students with local nonprofits for meaningful community service, culminating in a leadership summit in Washington, D.C.",
    eligibility: "Current 11th-12th grade students with Green Card status",
    cost: "Paid stipend",
    location: "Multiple cities nationwide",
    category: "Business",
    subject: "Leadership Development",
    dates: "Summer",
    url: "https://about.bankofamerica.com/en/making-an-impact/student-leaders"
  },
  {
    title: "Indiana University Women's Leadership Institute",
    description: "Leadership development program specifically for young women, focusing on building confidence, leadership skills, and career preparation in business.",
    eligibility: "Current 10th-11th grade students, women (transportation and housing not included)",
    cost: "Free",
    location: "Indiana University",
    category: "Business",
    subject: "Women's Leadership",
    dates: "Summer",
    url: "https://kelley.iu.edu/programs/undergraduate/diversity-inclusion/womens-leadership/"
  }
];

// COMPUTER SCIENCE & ROBOTICS PROGRAMS - from Free Summer Programs - CS_Robotics.pdf
const csRoboticsPrograms = [
  {
    title: "Girls Who Code Summer Immersion Program",
    description: "Free 7-week summer immersion program exposing high school girls to computer science through hands-on programming, tech company visits, and mentorship.",
    eligibility: "Current 9th-11th grade students who identify as girls or non-binary",
    cost: "Free",
    location: "Multiple locations nationwide",
    category: "Computer Science",
    subject: "Computer Science",
    dates: "Summer (7 weeks)",
    url: "https://girlswhocode.com/programs/summer-immersion-program"
  },
  {
    title: "NYU Cyber Security Program",
    description: "Cybersecurity program for NYC high school students covering ethical hacking, digital forensics, network security, and cybersecurity careers.",
    eligibility: "Current 8th-11th grade students who are NYC residents",
    cost: "Free",
    location: "New York University",
    category: "Computer Science",
    subject: "Cybersecurity",
    dates: "Summer",
    url: "https://engineering.nyu.edu/academics/programs/k12-stem-education/summer-programs"
  },
  {
    title: "Meta Summer Academy",
    description: "Technology and computer science program hosted by Meta for students in underserved communities, focusing on coding and tech careers.",
    eligibility: "Current 10th grade students from East Palo Alto, Belle Haven, Redwood City, North Fair Oaks",
    cost: "Free",
    location: "Meta Campus, California",
    category: "Computer Science",
    subject: "Computer Science",
    dates: "Summer",
    url: "https://about.fb.com/news/2022/06/expanding-computer-science-education-programs/"
  },
  {
    title: "Carnegie Mellon University AI Scholars",
    description: "Artificial Intelligence research and learning program for financially disadvantaged students, exploring machine learning, robotics, and AI applications.",
    eligibility: "Current 11th grade students (US citizen/GC/DACA), financially disadvantaged students",
    cost: "Free",
    location: "Carnegie Mellon University, Pittsburgh",
    category: "Computer Science",
    subject: "Artificial Intelligence",
    dates: "Summer",
    url: "https://www.cs.cmu.edu/academics/outreach"
  },
  {
    title: "Carnegie Mellon University CS Scholars",
    description: "Computer Science immersion program for underrepresented students to explore CS careers, programming fundamentals, and college preparation.",
    eligibility: "Current 10th grade students (US citizen/GC/DACA), financially disadvantaged students",
    cost: "Free",
    location: "Carnegie Mellon University, Pittsburgh",
    category: "Computer Science",
    subject: "Computer Science",
    dates: "Summer",
    url: "https://www.cs.cmu.edu/academics/outreach"
  },
  {
    title: "Carnegie Mellon University Experience Designing Games",
    description: "Game design and development program focusing on creative coding, interactive media, and game development fundamentals.",
    eligibility: "Current 10th-11th grade students (US citizen/GC/DACA), commuter program",
    cost: "Free",
    location: "Carnegie Mellon University, Pittsburgh",
    category: "Computer Science",
    subject: "Game Development",
    dates: "Summer",
    url: "https://www.etc.cmu.edu/academics/outreach/"
  },
  {
    title: "Stanford Center for AI in Medicine and Imaging Research Internship",
    description: "Research internship in artificial intelligence applications in medical imaging, healthcare technology, and biomedical informatics.",
    eligibility: "Current 9th-12th grade students, Age 14+, California residents",
    cost: "Free",
    location: "Stanford University, California",
    category: "Computer Science",
    subject: "AI in Medicine",
    dates: "Summer",
    url: "https://aimi.stanford.edu/education-and-training"
  },
  {
    title: "SMASH Academy",
    description: "Five-week STEM intensive program with computer science focus for underrepresented students, including college preparation and career exploration.",
    eligibility: "Current 10th-11th grade students who attend public school or private school via scholarship",
    cost: "Free",
    location: "Multiple university campuses",
    category: "Computer Science",
    subject: "STEM/Computer Science",
    dates: "Summer (5 weeks)",
    url: "https://smash.org/students/smash-academy/"
  },
  {
    title: "Oak Ridge National Laboratory NextGen Pathway to Computing",
    description: "Computing and computational science internship at a premier national laboratory, focusing on high-performance computing and scientific programming.",
    eligibility: "Current 10th-12th grade students (US citizen/GC), Anderson/Blount/Knox/Loudon/Roane counties, Age 16+",
    cost: "Paid stipend",
    location: "Oak Ridge National Laboratory, Tennessee",
    category: "Computer Science",
    subject: "Computational Science",
    dates: "Summer",
    url: "https://www.ornl.gov/content/next-generation-stem-internship-program"
  },
  {
    title: "Sandia National Laboratories High School Internship",
    description: "High school internship program at Sandia National Labs focusing on computer science, cybersecurity, and engineering applications.",
    eligibility: "Current 11th-12th grade students (US citizen), Age 16+",
    cost: "Paid stipend",
    location: "Sandia National Laboratories",
    category: "Computer Science",
    subject: "Computer Science/Engineering",
    dates: "Summer",
    url: "https://www.sandia.gov/careers/students-and-postdocs/internships/"
  },
  {
    title: "Quest Student Research Institute",
    description: "Independent research program in computer science, engineering, and technology fields with mentorship from industry professionals.",
    eligibility: "Current 9th-12th grade students (application fee waivers available)",
    cost: "Application fee (waivers available)",
    location: "Multiple locations",
    category: "Computer Science",
    subject: "Technology Research",
    dates: "Summer",
    url: "https://www.questforresearch.org/"
  }
];

// NATURE & ENVIRONMENTAL PROGRAMS - from Free Summer Programs - Nature.pdf
const naturePrograms = [
  {
    title: "Berkeley Climate Ambassadors",
    description: "Environmental science and climate change program focusing on sustainability, climate action, and environmental policy advocacy.",
    eligibility: "Current 9th-11th grade students",
    cost: "Free",
    location: "UC Berkeley, California",
    category: "Environmental Science",
    subject: "Climate Science",
    dates: "Summer",
    url: "https://nature.berkeley.edu/academics/outreach"
  },
  {
    title: "Tuskegee University Forestry and Natural Resources Summer Program",
    description: "Intensive program in forestry, natural resources management, environmental conservation, and sustainable land use practices.",
    eligibility: "Current 8th-11th grade students (housing included, transportation not included)",
    cost: "Free",
    location: "Tuskegee University, Alabama",
    category: "Environmental Science",
    subject: "Forestry/Natural Resources",
    dates: "Summer",
    url: "https://www.tuskegee.edu/academics/colleges/caens/academic-departments/agricultural-and-environmental-sciences"
  },
  {
    title: "Tuskegee University AgDiscovery Program",
    description: "Agricultural sciences and environmental studies program with hands-on farming, sustainability practices, and agricultural technology.",
    eligibility: "Current 8th-11th grade students (housing included, transportation not included)",
    cost: "Free",
    location: "Tuskegee University, Alabama",
    category: "Environmental Science",
    subject: "Agricultural Sciences",
    dates: "Summer",
    url: "https://www.tuskegee.edu/academics/colleges/caens"
  },
  {
    title: "North Carolina School of Science and Mathematics Summer Ventures",
    description: "Intensive STEM program with environmental science tracks, including field research, laboratory work, and environmental data analysis.",
    eligibility: "Current 10th-11th grade students, North Carolina students (housing and meals included)",
    cost: "Free",
    location: "NC School of Science and Mathematics",
    category: "Environmental Science",
    subject: "Environmental Science",
    dates: "Summer",
    url: "https://www.ncssm.edu/summer-ventures"
  },
  {
    title: "EarthWatch Girls in Science",
    description: "Environmental research expedition program for girls and non-binary students, featuring hands-on field science and conservation research.",
    eligibility: "Current 10th-11th grade students (girls/non-binary), California students or Rex Putnam High School attendees",
    cost: "Free",
    location: "Field locations in California",
    category: "Environmental Science",
    subject: "Field Research",
    dates: "Summer",
    url: "https://earthwatch.org/education/student-programs"
  },
  {
    title: "Student Conservation Association National Conservation Crews",
    description: "Conservation service program with hands-on environmental work in national parks, forests, and conservation areas across the country.",
    eligibility: "Age 15-19 (varies by program)",
    cost: "Free",
    location: "National parks and conservation areas nationwide",
    category: "Environmental Science",
    subject: "Conservation",
    dates: "Summer",
    url: "https://www.thesca.org/serve/programs/high-school-programs"
  }
];

console.log('\n=== PDF EXTRACTION SUMMARY ===');
console.log(`Business Programs: ${businessPrograms.length}`);
console.log(`CS/Robotics Programs: ${csRoboticsPrograms.length}`);  
console.log(`Nature Programs: ${naturePrograms.length}`);

const allExtractedPrograms = [
  ...businessPrograms,
  ...csRoboticsPrograms,
  ...naturePrograms
];

console.log(`\nTOTAL EXTRACTED FROM PDFs: ${allExtractedPrograms.length}`);

// Save extracted programs
fs.writeFileSync('extracted-pdf-opportunities.json', JSON.stringify(allExtractedPrograms, null, 2));
console.log('PDF opportunities saved to extracted-pdf-opportunities.json');

module.exports = { allExtractedPrograms };