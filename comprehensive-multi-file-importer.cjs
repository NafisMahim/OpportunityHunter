const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Client } = require('pg');

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

// Track processing statistics
let stats = {
  totalProcessed: 0,
  successfulInserts: 0,
  duplicatesSkipped: 0,
  errorsEncountered: 0,
  filesProcessed: 0,
  brokenUrls: 0
};

// List of priority files to process first
const PRIORITY_FILES = [
  'free highschool programs + competitions - competitions_1752128215563.csv',
  'Master List of Extracurriculars.xlsx - Competition_1752128215563.csv',
  'STEM Programs_Internships - Summer Internships_1752128215565.csv',
  'STEM Programs_Internships - Summer Programs_1752128215565.csv',
  'STEM Programs_Internships - Other Programs_1752128215565.csv',
  'Master List of Extracurriculars.xlsx - Internship & Research _1752128215564.csv',
  'Master List of Extracurriculars.xlsx - Pre-college_1752128215564.csv',
  'Master List of Extracurriculars.xlsx - Online courses_1752128215564.csv',
  'Master List of Extracurriculars.xlsx - Volunteering_1752128215564.csv',
  'School Made Easy Opportunities  - STEM Opportunities_1752128215565.csv',
  'School Made Easy Opportunities  - Medical Opportunities_1752128215565.csv',
  'School Made Easy Opportunities  - Creative Arts Opportunities_1752128215565.csv',
  'School Made Easy Opportunities  - Voluneer Opportunities_1752128215565.csv'
];

// Helper function to validate URLs
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('No URL') || url.includes('no url') || url.includes('N/A') || url.includes('TBD')) return false;
  if (url.includes('google.com/search') || url.includes('scholarships.com')) return false;
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

// Helper function to clean text
function cleanText(text) {
  if (!text) return '';
  return text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

// Helper function to determine opportunity type
function determineType(title, description, categories) {
  const text = `${title} ${description} ${categories}`.toLowerCase();
  
  if (text.includes('internship') || text.includes('intern ')) return 'internship';
  if (text.includes('scholarship') || text.includes('financial aid')) return 'scholarship';
  if (text.includes('competition') || text.includes('contest') || text.includes('challenge')) return 'competition';
  if (text.includes('grant') || text.includes('funding')) return 'grant';
  if (text.includes('volunteer') || text.includes('community service')) return 'volunteer';
  if (text.includes('research') || text.includes('lab ')) return 'research';
  if (text.includes('program') || text.includes('course')) return 'program';
  
  return 'program'; // default
}

// Helper function to extract categories
function extractCategories(row) {
  const categories = [];
  
  // Check Subject/Area columns
  if (row.Subject) categories.push(row.Subject);
  if (row['Area of interest']) categories.push(row['Area of interest']);
  if (row.Categories) categories.push(row.Categories);
  if (row.Category) categories.push(row.Category);
  
  // Infer from title/description
  const text = `${row.Name || row.Internship || row.Competition || row.title || ''} ${row.Description || row.Details || ''}`.toLowerCase();
  
  if (text.includes('stem') || text.includes('science') || text.includes('math') || text.includes('engineering')) {
    categories.push('STEM');
  }
  if (text.includes('computer') || text.includes('coding') || text.includes('programming')) {
    categories.push('Computer Science');
  }
  if (text.includes('medical') || text.includes('health') || text.includes('biology')) {
    categories.push('Medicine/Health');
  }
  if (text.includes('art') || text.includes('creative') || text.includes('design')) {
    categories.push('Arts');
  }
  if (text.includes('business') || text.includes('entrepreneur') || text.includes('finance')) {
    categories.push('Business');
  }
  
  return [...new Set(categories.filter(Boolean))];
}

// Process CSV files with different formats
async function processCsvFile(filePath) {
  console.log(`Processing CSV: ${path.basename(filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, { 
      columns: true, 
      skip_empty_lines: true,
      relax_column_count: true 
    });
    
    for (const row of records) {
      try {
        // Extract data with multiple possible column names
        const title = cleanText(row.Name || row.Internship || row.Competition || row.title || row.Program || '');
        const description = cleanText(row.Details || row.Description || row.desc || '');
        const url = row.URL || row.url || row.Website || row.Link || '';
        const location = cleanText(row.Location || row.State || '');
        const deadline = cleanText(row['Application deadline'] || row.Deadline || row.Dates || '');
        const organization = cleanText(row.Organization || row.Sponsor || '');
        const eligibility = cleanText(row.Eligibility || row['Age/Grade'] || row.Requirements || '');
        
        if (!title || title.length < 3) continue;
        if (!isValidUrl(url)) {
          stats.brokenUrls++;
          continue;
        }
        
        const categories = extractCategories(row);
        const type = determineType(title, description, categories.join(' '));
        
        // Check for duplicates
        const duplicateCheck = await client.query(
          'SELECT id FROM opportunities WHERE LOWER(title) = LOWER($1) AND url = $2',
          [title, url]
        );
        
        if (duplicateCheck.rows.length > 0) {
          stats.duplicatesSkipped++;
          continue;
        }
        
        // Insert opportunity
        await client.query(`
          INSERT INTO opportunities (
            title, description, type, location, deadline, url, 
            organization, source, categories, requirements
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          title,
          description || `${type} opportunity from ${organization || 'verified source'}`,
          type,
          location || 'Various locations',
          deadline || 'See website for details',
          url,
          organization || 'See website',
          `CSV Import: ${path.basename(filePath)}`,
          categories,
          eligibility ? [eligibility] : []
        ]);
        
        stats.successfulInserts++;
        stats.totalProcessed++;
        
        if (stats.totalProcessed % 50 === 0) {
          console.log(`Processed ${stats.totalProcessed} opportunities...`);
        }
        
      } catch (error) {
        console.error(`Error processing row in ${path.basename(filePath)}:`, error.message);
        stats.errorsEncountered++;
      }
    }
    
    stats.filesProcessed++;
    console.log(`✓ Completed ${path.basename(filePath)}: ${records.length} records processed`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    stats.errorsEncountered++;
  }
}

// Process TXT files with structured content
async function processTxtFile(filePath) {
  console.log(`Processing TXT: ${path.basename(filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    
    let currentOpportunity = {};
    let opportunities = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Look for structured data patterns
      if (trimmed.startsWith('Title:') || trimmed.startsWith('Name:')) {
        if (currentOpportunity.title) {
          opportunities.push(currentOpportunity);
        }
        currentOpportunity = { title: trimmed.split(':').slice(1).join(':').trim() };
      } else if (trimmed.startsWith('Description:') || trimmed.startsWith('Details:')) {
        currentOpportunity.description = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.startsWith('URL:') || trimmed.startsWith('Link:')) {
        currentOpportunity.url = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.startsWith('Location:')) {
        currentOpportunity.location = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.startsWith('Deadline:') || trimmed.startsWith('Dates:')) {
        currentOpportunity.deadline = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.startsWith('Organization:')) {
        currentOpportunity.organization = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.startsWith('Eligibility:') || trimmed.startsWith('Requirements:')) {
        currentOpportunity.eligibility = trimmed.split(':').slice(1).join(':').trim();
      } else if (trimmed.startsWith('Categories:') || trimmed.startsWith('Subject:')) {
        currentOpportunity.categories = trimmed.split(':').slice(1).join(':').trim().split(',').map(c => c.trim());
      }
    }
    
    if (currentOpportunity.title) {
      opportunities.push(currentOpportunity);
    }
    
    // Process extracted opportunities
    for (const opp of opportunities) {
      try {
        if (!opp.title || !isValidUrl(opp.url)) {
          stats.brokenUrls++;
          continue;
        }
        
        // Check for duplicates
        const duplicateCheck = await client.query(
          'SELECT id FROM opportunities WHERE LOWER(title) = LOWER($1) AND url = $2',
          [opp.title, opp.url]
        );
        
        if (duplicateCheck.rows.length > 0) {
          stats.duplicatesSkipped++;
          continue;
        }
        
        const type = determineType(opp.title, opp.description || '', opp.categories?.join(' ') || '');
        
        await client.query(`
          INSERT INTO opportunities (
            title, description, type, location, deadline, url, 
            organization, source, categories, requirements
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          opp.title,
          opp.description || `${type} opportunity from verified source`,
          type,
          opp.location || 'Various locations',
          opp.deadline || 'See website for details',
          opp.url,
          opp.organization || 'See website',
          `TXT Import: ${path.basename(filePath)}`,
          opp.categories || [],
          opp.eligibility ? [opp.eligibility] : []
        ]);
        
        stats.successfulInserts++;
        stats.totalProcessed++;
        
      } catch (error) {
        console.error(`Error processing opportunity from ${path.basename(filePath)}:`, error.message);
        stats.errorsEncountered++;
      }
    }
    
    stats.filesProcessed++;
    console.log(`✓ Completed ${path.basename(filePath)}: ${opportunities.length} opportunities processed`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    stats.errorsEncountered++;
  }
}

// Main processing function
async function processAllFiles() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    const attachedAssetsDir = './attached_assets';
    const allFiles = fs.readdirSync(attachedAssetsDir);
    
    // Filter for CSV and TXT files
    const csvFiles = allFiles.filter(file => file.endsWith('.csv'));
    const txtFiles = allFiles.filter(file => file.endsWith('.txt') && !file.includes('HTML'));
    
    console.log(`Found ${csvFiles.length} CSV files and ${txtFiles.length} TXT files to process`);
    
    // Process priority files first
    const priorityFilesToProcess = PRIORITY_FILES.filter(file => csvFiles.includes(file));
    const remainingCsvFiles = csvFiles.filter(file => !PRIORITY_FILES.includes(file));
    
    console.log('\n=== Processing Priority Files ===');
    for (const file of priorityFilesToProcess) {
      await processCsvFile(path.join(attachedAssetsDir, file));
    }
    
    console.log('\n=== Processing Remaining CSV Files ===');
    for (const file of remainingCsvFiles) {
      await processCsvFile(path.join(attachedAssetsDir, file));
    }
    
    console.log('\n=== Processing TXT Files ===');
    for (const file of txtFiles) {
      await processTxtFile(path.join(attachedAssetsDir, file));
    }
    
    console.log('\n=== FINAL IMPORT STATISTICS ===');
    console.log(`Files Processed: ${stats.filesProcessed}`);
    console.log(`Total Records Processed: ${stats.totalProcessed}`);
    console.log(`Successful Inserts: ${stats.successfulInserts}`);
    console.log(`Duplicates Skipped: ${stats.duplicatesSkipped}`);
    console.log(`Broken URLs Skipped: ${stats.brokenUrls}`);
    console.log(`Errors Encountered: ${stats.errorsEncountered}`);
    
    // Get final database count
    const countResult = await client.query('SELECT COUNT(*) FROM opportunities');
    console.log(`\n🎉 DATABASE NOW CONTAINS: ${countResult.rows[0].count} TOTAL OPPORTUNITIES`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    await client.end();
  }
}

// Run the import
processAllFiles().catch(console.error);