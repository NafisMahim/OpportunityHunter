const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// High-value opportunities from attached files
const RAPID_OPPORTUNITIES = [
  // From Pre-college CSV
  {
    title: 'Harvard Summer Program',
    description: 'Pre-college program at Harvard University offering college-level courses for high school students. Students live on campus and experience Harvard academic life.',
    type: 'program',
    location: 'Cambridge, MA',
    url: 'https://www.summer.harvard.edu/',
    organization: 'Harvard University',
    source: 'Master List Pre-college',
    categories: ['Academic', 'College Prep'],
    requirements: ['Grades 11-12', 'Ages 15+'],
    deadline: 'May 14th deadline',
    salary: '$4,500'
  },
  {
    title: 'Brown University Pre-College Program',
    description: 'Six-week immersive summer program where students earn college credits and experience Brown student life. Over 30 academic areas available.',
    type: 'program',
    location: 'Providence, RI',
    url: 'https://precollege.brown.edu/',
    organization: 'Brown University',
    source: 'Master List Pre-college',
    categories: ['Academic', 'College Prep'],
    requirements: ['Grades 7-12'],
    deadline: 'May 7th deadline',
    salary: '$900+'
  },
  {
    title: 'Northwestern University College Preparation Program',
    description: 'Program designed to give high school students a comprehensive preview of university life through challenging academic coursework and campus experience.',
    type: 'program',
    location: 'Evanston, IL',
    url: 'https://sps.northwestern.edu/college-preparation/',
    organization: 'Northwestern University',
    source: 'Master List Pre-college',
    categories: ['Academic', 'College Prep'],
    requirements: ['Grades 11-12', '3.0 GPA'],
    deadline: 'May 1st deadline',
    salary: '$4,852'
  },
  {
    title: 'Johns Hopkins Center for Talented Youth',
    description: 'Accelerated academic programs for academically talented students, offering challenging coursework in various subjects at an advanced pace.',
    type: 'program',
    location: 'Multiple locations',
    url: 'https://cty.jhu.edu/',
    organization: 'Johns Hopkins University',
    source: 'Master List Pre-college',
    categories: ['Academic', 'Gifted Education'],
    requirements: ['Academically talented students'],
    deadline: 'April 13th deadline',
    salary: '$1,250+'
  },
  {
    title: 'UCLA Summer Session',
    description: 'Pre-college institutes offering college-level courses and campus experience at UCLA. Students can explore various academic disciplines.',
    type: 'program',
    location: 'Los Angeles, CA',
    url: 'https://summer.ucla.edu/PrecollegeInstitutes',
    organization: 'UCLA',
    source: 'Master List Pre-college',
    categories: ['Academic', 'College Prep'],
    requirements: ['High school students'],
    deadline: 'May 1st deadline',
    salary: '$350+'
  },
  // From Volunteering CSV
  {
    title: 'Points of Light Volunteer Network',
    description: 'Global nonprofit dedicated to volunteer service. Connects volunteers with meaningful opportunities and provides resources for community engagement.',
    type: 'volunteer',
    location: 'Nationwide',
    url: 'https://www.pointsoflight.org/',
    organization: 'Points of Light',
    source: 'Master List Volunteering',
    categories: ['Community Service', 'Volunteer'],
    requirements: ['All ages welcome'],
    deadline: 'Open applications'
  },
  {
    title: 'Learn to Be Virtual Tutoring',
    description: 'Virtual tutoring platform where students can volunteer to tutor other students online. Flexible scheduling and meaningful impact on education.',
    type: 'volunteer',
    location: 'Virtual',
    url: 'https://www.learntobe.org/',
    organization: 'Learn to Be',
    source: 'Master List Volunteering',
    categories: ['Education', 'Tutoring'],
    requirements: ['Parental signature for under 18'],
    deadline: 'Open applications'
  },
  {
    title: 'Translators Without Borders',
    description: 'International humanitarian organization providing language services. Volunteers help translate critical information for crisis-affected populations.',
    type: 'volunteer',
    location: 'Remote',
    url: 'https://translatorswithoutborders.org/volunteer/',
    organization: 'Translators Without Borders',
    source: 'Master List Volunteering',
    categories: ['Translation', 'Humanitarian'],
    requirements: ['Ages 18+', 'Fluent in multiple languages'],
    deadline: 'Open applications'
  },
  {
    title: 'Smithsonian Digital Volunteers Program',
    description: 'Help digitize and transcribe historical documents, making Smithsonian collections more accessible to researchers and the public worldwide.',
    type: 'volunteer',
    location: 'Virtual',
    url: 'https://transcription.si.edu/',
    organization: 'Smithsonian Institution',
    source: 'Master List Volunteering',
    categories: ['History', 'Digital Archives'],
    requirements: ['All ages'],
    deadline: 'Open applications'
  },
  {
    title: 'Crisis Text Line Volunteer',
    description: 'Provide crisis intervention and emotional support to people in crisis via text message. Extensive training provided for this meaningful volunteer role.',
    type: 'volunteer',
    location: 'Remote',
    url: 'https://www.crisistextline.org/become-a-volunteer/',
    organization: 'Crisis Text Line',
    source: 'Master List Volunteering',
    categories: ['Mental Health', 'Crisis Support'],
    requirements: ['Ages 18+'],
    deadline: 'Open applications'
  },
  // From Online Courses CSV
  {
    title: 'edX Computer Science Courses',
    description: 'Free online computer science courses from top universities including MIT, Harvard, and others. Comprehensive curriculum covering programming, algorithms, and more.',
    type: 'program',
    location: 'Online',
    url: 'https://www.edx.org/course/subject/computer-science',
    organization: 'edX',
    source: 'Master List Online Courses',
    categories: ['Computer Science', 'Online Learning'],
    requirements: ['Self-motivated learners'],
    deadline: 'Self-paced enrollment'
  },
  {
    title: 'Khan Academy Computing',
    description: 'Free comprehensive computing curriculum covering programming fundamentals, computer science principles, and practical applications.',
    type: 'program',
    location: 'Online',
    url: 'https://www.khanacidemy.org/computing',
    organization: 'Khan Academy',
    source: 'Master List Online Courses',
    categories: ['Computer Science', 'Programming'],
    requirements: ['All skill levels'],
    deadline: 'Open enrollment'
  },
  {
    title: 'Coursera Computer Science',
    description: 'University-level computer science courses from leading institutions. Includes specializations in machine learning, algorithms, and software development.',
    type: 'program',
    location: 'Online',
    url: 'https://www.coursera.org/browse/computer-science',
    organization: 'Coursera',
    source: 'Master List Online Courses',
    categories: ['Computer Science', 'University Courses'],
    requirements: ['High school students and above'],
    deadline: 'Flexible enrollment'
  }
];

async function rapidBatchImport() {
  try {
    await client.connect();
    console.log('🚀 Rapid batch import starting...\n');
    
    let inserted = 0;
    let skipped = 0;
    
    for (const opp of RAPID_OPPORTUNITIES) {
      try {
        // Check for duplicates
        const duplicateCheck = await client.query(
          'SELECT id FROM opportunities WHERE LOWER(title) = LOWER($1)',
          [opp.title]
        );
        
        if (duplicateCheck.rows.length > 0) {
          skipped++;
          continue;
        }
        
        // Insert opportunity
        await client.query(`
          INSERT INTO opportunities (
            title, description, type, location, deadline, url, 
            organization, source, categories, requirements, salary
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          opp.title,
          opp.description,
          opp.type,
          opp.location,
          opp.deadline,
          opp.url,
          opp.organization,
          opp.source,
          opp.categories,
          opp.requirements,
          opp.salary || null
        ]);
        
        inserted++;
        console.log(`✓ ${opp.title}`);
        
      } catch (error) {
        console.error(`Error with ${opp.title}:`, error.message);
      }
    }
    
    // Final count
    const countResult = await client.query('SELECT COUNT(*) FROM opportunities');
    
    console.log('\n🎉 RAPID BATCH IMPORT COMPLETE!');
    console.log('================================');
    console.log(`Opportunities Inserted: ${inserted}`);
    console.log(`Duplicates Skipped: ${skipped}`);
    console.log(`Final Database Count: ${countResult.rows[0].count}`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await client.end();
  }
}

rapidBatchImport().catch(console.error);