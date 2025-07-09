const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { opportunities } = require('./shared/schema.ts');

// Music Performance & Conservatory Opportunities
const musicOpportunities = [
  {
    title: "YoungArts Program - Music Performance",
    description: "National competition for high school students/seniors aged 15-18 (grades 10-12). Talent-based selection across various arts including music performance. Must be U.S. citizen or permanent resident.",
    company: "National YoungArts Foundation",
    location: "Miami, FL / National",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://www.youngarts.org/",
    deadline: "October 2025",
    requirements: "Ages 15-18, grades 10-12, U.S. citizen or permanent resident",
    cost: "Cash awards and scholarships",
    isRemote: false
  },
  {
    title: "Davidson Fellowship - Music",
    description: "Awards of $50,000, $25,000, and $10,000 for students under 18 who demonstrate noteworthy achievements through significant piece of work in music composition or performance.",
    company: "Davidson Institute",
    location: "National",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://www.davidsongifted.org/fellowships/",
    deadline: "Fall 2025 application opens",
    requirements: "Under 18 years old, significant musical achievement",
    cost: "Awards up to $50,000",
    isRemote: true
  },
  {
    title: "Cooper International Competition",
    description: "Alternating years for violinists and pianists. Prizes up to $20,000 plus tuition scholarships to Oberlin Conservatory for top finalists. Prestigious international competition.",
    company: "Oberlin Conservatory",
    location: "Oberlin, OH",
    type: "competition",
    category: "Music",
    applicationUrl: "https://www.oberlin.edu/conservatory/cooper-international-competition",
    deadline: "April 2025",
    requirements: "Advanced violin or piano performance",
    cost: "Prizes up to $20,000 + tuition scholarships",
    isRemote: false
  },
  {
    title: "Spotlight Arts Program",
    description: "Southern California high school program for students of ALL skill levels. More than a competition - scholarship and arts training program. $100,000 in cash scholarships awarded annually.",
    company: "Spotlight Arts",
    location: "Southern California",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://www.spotlightarts.org/",
    deadline: "June 2025 applications open",
    requirements: "Southern California high school students, all skill levels",
    cost: "Up to $100,000 in scholarships annually",
    isRemote: false
  },
  {
    title: "Marine Band Concerto Competition",
    description: "Competition for high school seniors with cash prizes. Winner receives $2,500 scholarship, second place $1,000, third place $500. Opportunity to perform with Marine Chamber Orchestra.",
    company: "U.S. Marine Band",
    location: "Washington, DC",
    type: "competition",
    category: "Music",
    applicationUrl: "https://www.marineband.marines.mil/",
    deadline: "Spring 2025",
    requirements: "High school seniors",
    cost: "Cash prizes: $2,500, $1,000, $500",
    isRemote: false
  },
  {
    title: "Glenn Miller Award",
    description: "For graduating high school seniors or first-year college students. Upload performance videos to YouTube, compete in Clarinda, Iowa. First prize $3,000, second $2,000, third $1,000.",
    company: "Glenn Miller Birthplace Society",
    location: "Clarinda, IA",
    type: "competition",
    category: "Music",
    applicationUrl: "http://glennmiller.org/",
    deadline: "May 15, 2025",
    requirements: "Graduating high school seniors or first-year college students",
    cost: "Prizes: $3,000, $2,000, $1,000",
    isRemote: false
  },
  {
    title: "Sphinx Competition",
    description: "Open to Black or Latino U.S. residents who play violin, viola, cello, or double bass. Cash scholarships, summer program scholarships, and college/conservatory scholarships.",
    company: "Sphinx Organization",
    location: "Detroit, MI",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://www.sphinxmusic.org/",
    deadline: "October 2025",
    requirements: "Black or Latino U.S. residents, string instruments",
    cost: "Multiple scholarship awards",
    isRemote: false
  },
  {
    title: "Mark Zinger Memorial Violin Scholarship",
    description: "For violinists ages 17-23 pursuing undergraduate degree in music at accredited U.S. institutions. Memorial scholarship supporting young violin talent.",
    company: "Mark Zinger Memorial Foundation",
    location: "National",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://www.zingerviolin.com/",
    deadline: "January 2025",
    requirements: "Ages 17-23, violinists, pursuing undergraduate music degree",
    cost: "Scholarship award varies",
    isRemote: true
  },
  {
    title: "Curtis Institute Full-Ride Scholarships",
    description: "Curtis provides full-ride tuition scholarships for ALL students, even without demonstrated financial need. Those with financial need may receive additional living expense scholarships. 4% acceptance rate.",
    company: "Curtis Institute of Music",
    location: "Philadelphia, PA",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://www.curtis.edu/",
    deadline: "December 2025",
    requirements: "Exceptional musical talent, highly selective (4% acceptance)",
    cost: "Full tuition for all students",
    isRemote: false
  },
  {
    title: "Juilliard School Merit Scholarships",
    description: "Most institutional scholarships require both merit and demonstrated financial need. 7-11% acceptance rate. May require CSS Profile for financial aid consideration.",
    company: "The Juilliard School",
    location: "New York, NY",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://www.juilliard.edu/",
    deadline: "December 1, 2025",
    requirements: "Exceptional musical ability, financial need consideration",
    cost: "Varies based on merit and need",
    isRemote: false
  },
  {
    title: "Berklee Presidential Scholarship",
    description: "Covers tuition, on-campus housing, and required laptop. Must show highest musical merit and financial need. Berklee awards over $115 million annually in scholarships.",
    company: "Berklee College of Music",
    location: "Boston, MA",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://www.berklee.edu/scholarships",
    deadline: "Automatic consideration with application",
    requirements: "Highest musical merit and financial need",
    cost: "Full tuition + housing + laptop",
    isRemote: false
  },
  {
    title: "San Francisco Conservatory Merit Scholarships",
    description: "99% of students receive merit-based scholarships determined by audition, departmental needs, academic transcripts, and recommendation letters. Highly generous aid program.",
    company: "San Francisco Conservatory of Music",
    location: "San Francisco, CA",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://sfcm.edu/",
    deadline: "Audition-based deadlines",
    requirements: "Strong audition performance, academic achievement",
    cost: "Merit scholarships for 99% of students",
    isRemote: false
  },
  {
    title: "New England Conservatory Scholarships",
    description: "43% acceptance rate conservatory offering various merit and need-based scholarships. Strong reputation in classical and contemporary music education.",
    company: "New England Conservatory",
    location: "Boston, MA",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://necmusic.edu/",
    deadline: "December 1, 2025",
    requirements: "Strong musical ability and academic performance",
    cost: "Various scholarship amounts",
    isRemote: false
  },
  {
    title: "National Federation of Music Clubs Scholarships",
    description: "Various scholarships for college music majors and high school students in instrumental, vocal, music therapy, and music education. Multiple program deadlines.",
    company: "National Federation of Music Clubs",
    location: "National",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://www.nfmc-music.org/",
    deadline: "Varies by program",
    requirements: "Music students, varies by specific scholarship",
    cost: "Multiple award amounts",
    isRemote: true
  },
  {
    title: "ASCAP Foundation Music Scholarships",
    description: "Several scholarships in film/TV/video game composing, classical composing, and songwriting. Supporting various areas of music composition and performance.",
    company: "ASCAP Foundation",
    location: "National",
    type: "scholarship",
    category: "Music",
    applicationUrl: "https://www.ascapfoundation.org/",
    deadline: "Varies by program",
    requirements: "Music composition and performance focus",
    cost: "Various award amounts",
    isRemote: true
  }
];

async function addMusicOpportunities() {
  try {
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log('Adding music performance and conservatory opportunities...');
    
    for (const opportunity of musicOpportunities) {
      try {
        await db.insert(opportunities).values(opportunity).onConflictDoNothing();
        console.log(`✓ Added: ${opportunity.title}`);
      } catch (error) {
        console.log(`⚠ Skipped duplicate: ${opportunity.title}`);
      }
    }

    console.log(`\n✅ Successfully processed ${musicOpportunities.length} music opportunities`);
    await sql.end();
  } catch (error) {
    console.error('Error adding music opportunities:', error);
  }
}

addMusicOpportunities();