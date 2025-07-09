const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { opportunities } = require('./shared/schema.ts');

// Healthcare & Medical Internship Opportunities
const healthcareOpportunities = [
  {
    title: "Children's Hospital Colorado - Summer Child Health Research Internship",
    description: "9-week paid internship ($4,400 stipend) for rising high school seniors (18+) who are Colorado residents. Research with pediatric faculty in stem cell biology, neuroscience, nutrition, and hematology with oral/poster presentations.",
    company: "Children's Hospital Colorado",
    location: "Aurora, CO",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.childrenscolorado.org/",
    deadline: "Spring 2025",
    requirements: "Rising high school seniors (18+), Colorado residents",
    cost: "Paid $4,400 stipend",
    isRemote: false
  },
  {
    title: "Johns Hopkins Medicine - Summer Internship Program (SIP)",
    description: "Summer biomedical research program with faculty mentorship and poster presentations. Specialties include computational medicine, gynecology/obstetrics, and clinical trials.",
    company: "Johns Hopkins Medicine",
    location: "Baltimore, MD",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.hopkinsmedicine.org/som/pathway/sip",
    deadline: "February 1, 2025",
    requirements: "Undergraduates (some programs accept rising seniors)",
    cost: "Stipend provided",
    isRemote: false
  },
  {
    title: "Children's Hospital LA - High School Internship Program (HIP)",
    description: "Hands-on experience in pediatric healthcare setting with patient interaction and administrative tasks. Direct hospital environment exposure for high school students.",
    company: "Children's Hospital Los Angeles",
    location: "Los Angeles, CA",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.chla.org/",
    deadline: "Spring applications",
    requirements: "High school students",
    cost: "Unpaid internship",
    isRemote: false
  },
  {
    title: "Rady Children's Hospital San Diego - Summer Medical Academy",
    description: "Medical training program for grades 9-12, ages 15-19. Hands-on practice, expert lectures, and healthcare career exploration in pediatric setting.",
    company: "Rady Children's Hospital San Diego",
    location: "San Diego, CA",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.rchsd.org/",
    deadline: "March 15, April 15, May 15 (varies by cohort)",
    requirements: "Grades 9-12, ages 15-19",
    cost: "Program fee applies",
    isRemote: false
  },
  {
    title: "Stanford Medical Youth Science Program (SMYSP)",
    description: "5-week program for first-generation, low-income high school juniors. Medical research and healthcare career exploration at Stanford University.",
    company: "Stanford University School of Medicine",
    location: "Stanford, CA",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://med.stanford.edu/smysp.html",
    deadline: "Spring 2025",
    requirements: "First-generation, low-income high school juniors",
    cost: "Free program",
    isRemote: false
  },
  {
    title: "UCSF Summer Student Research Program",
    description: "6-week internship with $3,000 stipend for students with financial need. Research experience at University of California San Francisco medical programs.",
    company: "UC San Francisco",
    location: "San Francisco, CA",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://graduate.ucsf.edu/",
    deadline: "Spring 2025",
    requirements: "Students with financial need",
    cost: "Paid $3,000 stipend",
    isRemote: false
  },
  {
    title: "Kaiser Permanente KP LAUNCH",
    description: "Program for ages 15-18, entering grades 11-12 from underrepresented backgrounds in healthcare. Clinician mentorship and real-world healthcare projects.",
    company: "Kaiser Permanente",
    location: "Multiple locations",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://healthy.kaiserpermanente.org/",
    deadline: "June 23 - July 25, 2025",
    requirements: "Ages 15-18, grades 11-12, underrepresented backgrounds",
    cost: "Free program",
    isRemote: false
  },
  {
    title: "Cedars-Sinai Medical Center INSPIRE",
    description: "Summer research program with research fundamentals, data analysis, and networking workshops. Experience at prestigious Los Angeles medical center.",
    company: "Cedars-Sinai Medical Center",
    location: "Los Angeles, CA",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.cedars-sinai.org/",
    deadline: "Spring 2025",
    requirements: "High school students",
    cost: "Unpaid internship",
    isRemote: false
  },
  {
    title: "Harvard Medical School - Project Success",
    description: "Paid internships from June 30 - August 15, 2025 for Boston/Cambridge area juniors/seniors from underrepresented backgrounds. Research labs and biotech company visits.",
    company: "Harvard Medical School",
    location: "Boston, MA",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://hms.harvard.edu/",
    deadline: "February 7, 2025",
    requirements: "Boston/Cambridge juniors/seniors, underrepresented backgrounds",
    cost: "Paid internship",
    isRemote: false
  },
  {
    title: "Penn Medicine Summer Program",
    description: "Simulated first-year medical courses with CPR/suturing training, surgical knot-tying, spinal taps, IV practice, surgery observation, and anatomy/microbiology/pathology labs.",
    company: "University of Pennsylvania Medicine",
    location: "Philadelphia, PA",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.pennmedicine.org/",
    deadline: "Spring 2025",
    requirements: "High school students",
    cost: "Program fee applies",
    isRemote: false
  },
  {
    title: "Massachusetts General Hospital - Youth Scholars Program",
    description: "Program for underrepresented backgrounds in sciences including medical research, healthcare professional shadowing, and career workshops.",
    company: "Massachusetts General Hospital",
    location: "Boston, MA",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.massgeneral.org/",
    deadline: "Spring applications",
    requirements: "Underrepresented backgrounds in sciences",
    cost: "Free program",
    isRemote: false
  },
  {
    title: "Mayo Clinic Career Immersion Program (Minnesota)",
    description: "June 22-26, 2025 program for rising juniors/seniors who are Minnesota residents with 2.5+ GPA. Exposure to 50+ health sciences professions beyond doctor/nurse.",
    company: "Mayo Clinic",
    location: "Rochester, MN",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://college.mayo.edu/academics/health-sciences-education/career-immersion-program-minnesota/",
    deadline: "January 2025 applications",
    requirements: "Rising juniors/seniors, Minnesota residents, 2.5+ GPA",
    cost: "Free program",
    isRemote: false
  },
  {
    title: "Mayo Clinic CARES (Arizona)",
    description: "Healthcare career exposure and professional networking program in Phoenix, Arizona. Focus on diverse healthcare professions and career pathways.",
    company: "Mayo Clinic",
    location: "Phoenix, AZ",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://college.mayo.edu/academics/diversity-and-inclusion/programs/mayo-clinic-cares/",
    deadline: "Spring 2025",
    requirements: "High school students",
    cost: "Free program",
    isRemote: false
  },
  {
    title: "Mayo Clinic High School Volunteers",
    description: "Year-round volunteer program with 3 sessions (14+ years old). Minimum 2-hour shifts with regular schedule commitment in various hospital departments.",
    company: "Mayo Clinic",
    location: "Rochester, MN",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.mayoclinic.org/about-mayo-clinic/volunteers/minnesota/how-to-apply/high-school-volunteers",
    deadline: "November, April, July applications",
    requirements: "14+ years old, regular schedule commitment",
    cost: "Volunteer position",
    isRemote: false
  },
  {
    title: "UCLA Health Volunteen Summer Program",
    description: "Experience in various hospital departments with patient interaction and hospital operations. Comprehensive healthcare environment understanding.",
    company: "UCLA Health",
    location: "Los Angeles, CA",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.uclahealth.org/",
    deadline: "Spring applications",
    requirements: "High school students",
    cost: "Volunteer position",
    isRemote: false
  },
  {
    title: "Wake Forest Baptist Medical Center Summer Program",
    description: "Week-long summer program covering internal medicine, cardiology, surgery, patient interviewing, blood pressure measurement, and ultrasounds.",
    company: "Wake Forest Baptist Medical Center",
    location: "Winston-Salem, NC",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.wakehealth.edu/",
    deadline: "Spring 2025",
    requirements: "High school students",
    cost: "$3,400 program fee",
    isRemote: false
  },
  {
    title: "Medical Immersion Summer Academy (MISA) - Oakland",
    description: "5-day hands-on skills program including EKG, suturing, CPR, splinting, medical research introduction, and simulation lab training.",
    company: "MISA",
    location: "Oakland, CA",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://misaprogram.com/",
    deadline: "Summer 2025",
    requirements: "High school students",
    cost: "Program fee applies",
    isRemote: false
  },
  {
    title: "Camp Cardiac and Camp Neuro",
    description: "1-week summer day camps in 30+ cities nationwide focusing on heart/brain health and medical career introduction. Ages 15-18 years with scholarships available.",
    company: "Camp Cardiac/Camp Neuro",
    location: "30+ cities nationwide",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.campcardiac.com/",
    deadline: "Summer sessions",
    requirements: "Ages 15-18 years",
    cost: "$675 (scholarships available)",
    isRemote: false
  },
  {
    title: "NIH/NHLBI Summer Internship",
    description: "Research internship for 17+ year old top high school students. Work with award-winning scientists at National Institutes of Health in biomedical research.",
    company: "National Institutes of Health",
    location: "Bethesda, MD",
    type: "internship",
    category: "Healthcare",
    applicationUrl: "https://www.nhlbi.nih.gov/",
    deadline: "Spring 2025",
    requirements: "17+ years old, top high school students",
    cost: "Paid internship",
    isRemote: false
  }
];

async function addHealthcareOpportunities() {
  try {
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log('Adding healthcare and medical opportunities...');
    
    for (const opportunity of healthcareOpportunities) {
      try {
        await db.insert(opportunities).values(opportunity).onConflictDoNothing();
        console.log(`✓ Added: ${opportunity.title}`);
      } catch (error) {
        console.log(`⚠ Skipped duplicate: ${opportunity.title}`);
      }
    }

    console.log(`\n✅ Successfully processed ${healthcareOpportunities.length} healthcare opportunities`);
    await sql.end();
  } catch (error) {
    console.error('Error adding healthcare opportunities:', error);
  }
}

addHealthcareOpportunities();