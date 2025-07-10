const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function importHighValuePrograms() {
  try {
    await client.connect();
    console.log('Processing high-value programs...');
    
    // High value programs from the free programs CSV
    const programs = [
      {
        title: 'MIT Lincoln Laboratory Summer Internship',
        description: 'Prestigious summer internship program at MIT Lincoln Laboratory where high school students work alongside leading researchers on cutting-edge technology projects in a variety of STEM fields.',
        type: 'internship',
        location: 'Lexington, MA',
        url: 'https://www.ll.mit.edu/outreach/summer-high-school-internship-program',
        organization: 'MIT Lincoln Laboratory',
        categories: ['STEM', 'Research'],
        requirements: ['High school students', 'Strong academic record'],
        deadline: 'See website for details'
      },
      {
        title: 'Stanford AIMI AI Internship',
        description: 'Artificial Intelligence internship program at Stanford University where students work on cutting-edge AI projects in healthcare and medical imaging with world-renowned researchers.',
        type: 'internship',
        location: 'Stanford, CA',
        url: 'https://aimi.stanford.edu/education/summer-research-internship',
        organization: 'Stanford University AIMI',
        categories: ['Computer Science', 'AI/ML'],
        requirements: ['High school students', 'Programming experience'],
        deadline: 'See website for details'
      },
      {
        title: 'Stanford GRIPS Genomics Research',
        description: 'Genomics Research Internship Program for Students (GRIPS) where high school students conduct hands-on genomics research at Stanford Medical School.',
        type: 'internship',
        location: 'Stanford, CA',
        url: 'https://med.stanford.edu/genecamp/process',
        organization: 'Stanford Medical School',
        categories: ['Medicine', 'Genomics'],
        requirements: ['High school students', 'Interest in genetics'],
        deadline: 'See website for details'
      },
      {
        title: 'Stanford PIPS Pediatrics Internship',
        description: 'Pediatrics Internship Program for Students where high school students shadow pediatric specialists and gain exposure to pediatric medicine.',
        type: 'internship',
        location: 'Stanford, CA',
        url: 'https://med.stanford.edu/pediatrics/education/pediatrics-internship-program.html',
        organization: 'Stanford Pediatrics',
        categories: ['Medicine', 'Pediatrics'],
        requirements: ['High school students', 'Interest in pediatric medicine'],
        deadline: 'See website for details'
      },
      {
        title: 'Stanford STaRS Reconstructive Surgery Internship',
        description: 'Surgery Training and Research for Students program where high school students explore plastic and reconstructive surgery through research and clinical observation.',
        type: 'internship',
        location: 'Stanford, CA',
        url: 'https://plasticsurgery.stanford.edu/research/stars/Apply.html',
        organization: 'Stanford Plastic Surgery',
        categories: ['Medicine', 'Surgery'],
        requirements: ['High school students', 'Interest in surgery'],
        deadline: 'See website for details'
      },
      {
        title: 'Los Alamos National Laboratory Internship',
        description: 'High school internship program at Los Alamos National Laboratory where students work on national security research projects in physics, chemistry, engineering, and computer science.',
        type: 'internship',
        location: 'Los Alamos, NM',
        url: 'https://www.lanl.gov/careers/career-options/student-internships/high-school/index.php',
        organization: 'Los Alamos National Laboratory',
        categories: ['STEM', 'National Security'],
        requirements: ['High school students', 'US citizenship'],
        deadline: 'See website for details'
      },
      {
        title: 'Fermilab TARGET Summer Internship',
        description: 'Teachers and Researchers Generating Enhanced Technology summer internship where high school students work on particle physics research projects at Fermilab.',
        type: 'internship',
        location: 'Batavia, IL',
        url: 'https://internships.fnal.gov/target/',
        organization: 'Fermilab',
        categories: ['Physics', 'Particle Physics'],
        requirements: ['High school students', 'Interest in physics'],
        deadline: 'See website for details'
      },
      {
        title: 'Oak Ridge SAGE Program',
        description: 'Science Accelerating Girls Engagement program at Oak Ridge National Laboratory providing STEM research experiences for high school girls.',
        type: 'program',
        location: 'Oak Ridge, TN',
        url: 'https://education.ornl.gov/sage-faqs/',
        organization: 'Oak Ridge National Laboratory',
        categories: ['STEM', 'Women in STEM'],
        requirements: ['High school girls', 'Interest in STEM research'],
        deadline: 'See website for details'
      },
      {
        title: 'Oak Ridge NGSI Internship',
        description: 'Next Generation STEM Internship program at Oak Ridge National Laboratory where students conduct research in energy, computing, and national security.',
        type: 'internship',
        location: 'Oak Ridge, TN',
        url: 'https://education.ornl.gov/ngsi/',
        organization: 'Oak Ridge National Laboratory',
        categories: ['STEM', 'Energy Research'],
        requirements: ['High school students', 'Strong STEM background'],
        deadline: 'See website for details'
      },
      {
        title: 'Google CSSI (Computer Science Summer Institute)',
        description: 'Intensive 4-week computer science program at Google designed to inspire high school students from underrepresented groups to pursue computer science.',
        type: 'program',
        location: 'Mountain View, CA',
        url: 'https://buildyourfuture.withgoogle.com/programs/computer-science-summer-institute',
        organization: 'Google',
        categories: ['Computer Science', 'Programming'],
        requirements: ['High school students', 'Underrepresented groups in CS'],
        deadline: 'See website for details'
      },
      {
        title: 'Naval SEAP (Science & Engineering Apprenticeship Program)',
        description: 'Prestigious 8-week paid apprenticeship program where students work with Navy scientists and engineers on real-world research projects at naval laboratories.',
        type: 'internship',
        location: 'Multiple US locations',
        url: 'https://www.navalsteminterns.us/seap/',
        organization: 'US Navy',
        categories: ['STEM', 'Engineering'],
        requirements: ['High school students', 'US citizenship'],
        deadline: 'See website for details',
        salary: 'Paid apprenticeship'
      },
      {
        title: 'MIT Women\'s Technology Program',
        description: 'Four-week residential summer program introducing young women to engineering and computer science through hands-on projects and industry exposure.',
        type: 'program',
        location: 'Cambridge, MA',
        url: 'https://web.mit.edu/wtp/',
        organization: 'MIT',
        categories: ['Engineering', 'Women in STEM'],
        requirements: ['High school women', 'Rising seniors'],
        deadline: 'See website for details'
      },
      {
        title: 'MIT Beaverworks Summer Institute',
        description: 'Intensive STEM program where students work on cutting-edge technology projects including autonomous vehicles, drones, and cybersecurity.',
        type: 'program',
        location: 'Cambridge, MA',
        url: 'https://beaverworks.ll.mit.edu/CMS/bw/Summer_Program_Application',
        organization: 'MIT Lincoln Laboratory',
        categories: ['STEM', 'Technology'],
        requirements: ['High school students', 'Strong math/science background'],
        deadline: 'See website for details'
      },
      {
        title: 'Harvard Project Success',
        description: 'Paid medical research internship for current 11th-12th graders from Boston/Cambridge area. Students conduct hands-on research, attend seminars, and develop research presentation skills.',
        type: 'internship',
        location: 'Boston, MA',
        url: 'https://dicp.hms.harvard.edu/dicp-programs/k-12/high-school-programs/project-success',
        organization: 'Harvard Medical School',
        categories: ['Medical Research', 'Research'],
        requirements: ['Grades 11-12', 'Boston/Cambridge residents'],
        deadline: 'See website for details',
        salary: 'Paid internship'
      },
      {
        title: 'Harvard Hinton Scholars AP Biology Program',
        description: 'Advanced biology program at Harvard Medical School for high-achieving high school students to explore cutting-edge biological research.',
        type: 'program',
        location: 'Boston, MA',
        url: 'https://dicp.hms.harvard.edu/dicp-programs/k-12/high-school-programs/ap-biology-hinton-scholars-program',
        organization: 'Harvard Medical School',
        categories: ['Biology', 'Medical Research'],
        requirements: ['High school students', 'Strong biology background'],
        deadline: 'See website for details'
      },
      {
        title: 'Memorial Sloan Kettering HOPP Program',
        description: 'High School Oncology Pipeline Program where students shadow oncologists, conduct cancer research, and learn about cancer treatment and research.',
        type: 'program',
        location: 'New York, NY',
        url: 'https://www.mskcc.org/education-training/high-school-college/hopp-summer-student',
        organization: 'Memorial Sloan Kettering Cancer Center',
        categories: ['Medical Research', 'Oncology'],
        requirements: ['High school students', 'Interest in cancer research'],
        deadline: 'See website for details'
      },
      {
        title: 'Rockefeller University Summer Neuroscience Program',
        description: 'Intensive neuroscience research program where high school students work in Rockefeller University labs studying brain function and neurodegenerative diseases.',
        type: 'program',
        location: 'New York, NY',
        url: 'https://www.rockefeller.edu/outreach/snp/',
        organization: 'The Rockefeller University',
        categories: ['Neuroscience', 'Research'],
        requirements: ['High school students', 'Interest in neuroscience'],
        deadline: 'See website for details'
      },
      {
        title: 'Bank of America Student Leaders Program',
        description: 'Prestigious 8-week paid leadership and nonprofit internship program where students work at local nonprofits and attend a leadership summit in Washington, DC.',
        type: 'internship',
        location: 'Multiple US cities',
        url: 'https://about.bankofamerica.com/en/making-an-impact/student-leaders',
        organization: 'Bank of America',
        categories: ['Leadership', 'Community Service'],
        requirements: ['High school students', 'Strong community involvement'],
        deadline: 'See website for details',
        salary: 'Paid internship'
      },
      {
        title: 'QuestBridge College Prep Scholars',
        description: 'Elite program providing high-achieving, low-income students with college preparation, scholarships, and mentorship opportunities from top universities.',
        type: 'program',
        location: 'Nationwide',
        url: 'https://www.questbridge.org/high-school-students/college-prep-scholars',
        organization: 'QuestBridge',
        categories: ['College Prep', 'Scholarships'],
        requirements: ['High-achieving, low-income students', 'Academic excellence'],
        deadline: 'See website for details'
      },
      {
        title: 'University of Waterloo Quantum School',
        description: 'International quantum computing and physics program for exceptional high school students interested in quantum mechanics and quantum information.',
        type: 'program',
        location: 'Waterloo, Canada',
        url: 'https://uwaterloo.ca/institute-for-quantum-computing/qsys',
        organization: 'University of Waterloo',
        categories: ['Physics', 'Quantum Computing'],
        requirements: ['High school students', 'Strong physics/math background'],
        deadline: 'See website for details'
      }
    ];
    
    let imported = 0;
    let duplicates = 0;
    
    for (const program of programs) {
      try {
        // Check for duplicates
        const duplicateCheck = await client.query(
          'SELECT id FROM opportunities WHERE LOWER(title) = LOWER($1)',
          [program.title]
        );
        
        if (duplicateCheck.rows.length > 0) {
          duplicates++;
          continue;
        }
        
        await client.query(`
          INSERT INTO opportunities (
            title, description, type, location, url, organization, 
            source, categories, requirements, deadline, salary
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          program.title,
          program.description,
          program.type,
          program.location,
          program.url,
          program.organization,
          'High-Value Programs Import',
          program.categories,
          program.requirements,
          program.deadline,
          program.salary || null
        ]);
        
        imported++;
        console.log(`✓ ${program.title}`);
        
      } catch (error) {
        console.error(`Error importing ${program.title}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Import completed: ${imported} new opportunities, ${duplicates} duplicates skipped`);
    
    // Get final count
    const countResult = await client.query('SELECT COUNT(*) FROM opportunities');
    console.log(`📊 Total database size: ${countResult.rows[0].count} opportunities`);
    
  } catch (error) {
    console.error('Import error:', error);
  } finally {
    await client.end();
  }
}

importHighValuePrograms();