const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Client } = require('pg');

// Database connection with connection pooling
let client;
let stats = {
  totalProcessed: 0,
  successfulInserts: 0,
  duplicatesSkipped: 0,
  errorsEncountered: 0,
  brokenUrls: 0
};

async function initDatabase() {
  client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });
  await client.connect();
}

function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('No URL') || url.includes('N/A') || url.includes('TBD')) return false;
  if (url.includes('google.com/search') || url.includes('scholarships.com')) return false;
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function determineType(title, description, categories) {
  const text = `${title} ${description} ${categories}`.toLowerCase();
  
  if (text.includes('internship')) return 'internship';
  if (text.includes('scholarship')) return 'scholarship';
  if (text.includes('competition') || text.includes('contest')) return 'competition';
  if (text.includes('grant')) return 'grant';
  if (text.includes('volunteer')) return 'volunteer';
  if (text.includes('research')) return 'research';
  
  return 'program';
}

function extractCategories(row) {
  const categories = [];
  
  if (row.Subject) categories.push(row.Subject);
  if (row['Area of interest']) categories.push(row['Area of interest']);
  if (row.Categories) categories.push(row.Categories);
  
  const text = `${row.Name || row.Internship || row.Competition || ''} ${row.Description || row.Details || ''}`.toLowerCase();
  
  if (text.includes('stem') || text.includes('science')) categories.push('STEM');
  if (text.includes('computer') || text.includes('coding')) categories.push('Computer Science');
  if (text.includes('medical') || text.includes('health')) categories.push('Medicine');
  if (text.includes('art') || text.includes('creative')) categories.push('Arts');
  if (text.includes('business') || text.includes('entrepreneur')) categories.push('Business');
  
  return [...new Set(categories.filter(Boolean))];
}

async function processHighSchoolCompetitions() {
  console.log('Processing: High School Competitions CSV');
  
  const filePath = './attached_assets/free highschool programs + competitions - competitions_1752128215563.csv';
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true });
  
  for (const row of records) {
    try {
      const title = cleanText(row.Name || '');
      const description = cleanText(row.Details || '');
      const url = row.URL || '';
      const location = cleanText(row.State || 'All States');
      const subject = cleanText(row.Subject || '');
      
      if (!title || !isValidUrl(url)) {
        stats.brokenUrls++;
        continue;
      }
      
      // Check for duplicates
      const duplicateCheck = await client.query(
        'SELECT id FROM opportunities WHERE LOWER(title) = LOWER($1)',
        [title]
      );
      
      if (duplicateCheck.rows.length > 0) {
        stats.duplicatesSkipped++;
        continue;
      }
      
      await client.query(`
        INSERT INTO opportunities (
          title, description, type, location, url, organization, 
          source, categories, requirements
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        title,
        description || `High school ${subject} competition`,
        'competition',
        location,
        url,
        'Competition Organization',
        'High School Competitions Import',
        [subject].filter(Boolean),
        ['High school students']
      ]);
      
      stats.successfulInserts++;
      stats.totalProcessed++;
      
    } catch (error) {
      console.error(`Error processing competition:`, error.message);
      stats.errorsEncountered++;
    }
  }
  
  console.log(`✓ Competitions processed: ${records.length} records`);
}

async function processStemInternships() {
  console.log('Processing: STEM Summer Internships CSV');
  
  const filePath = './attached_assets/STEM Programs_Internships - Summer Internships_1752128215565.csv';
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true });
  
  for (const row of records) {
    try {
      const title = cleanText(row.Internship || '');
      const ageGrade = cleanText(row['Age/Grade'] || '');
      const stipend = cleanText(row.Stipend || '');
      const length = cleanText(row['Length/Dates'] || '');
      const location = cleanText(row.Location || '');
      const url = row.Website || '';
      const requirements = cleanText(row['Other Requirements'] || '');
      
      if (!title || !isValidUrl(url)) {
        stats.brokenUrls++;
        continue;
      }
      
      // Check for duplicates
      const duplicateCheck = await client.query(
        'SELECT id FROM opportunities WHERE LOWER(title) = LOWER($1)',
        [title]
      );
      
      if (duplicateCheck.rows.length > 0) {
        stats.duplicatesSkipped++;
        continue;
      }
      
      const description = `STEM summer internship program. ${stipend ? 'Stipend: ' + stipend + '. ' : ''}${length ? 'Duration: ' + length + '.' : ''}`;
      
      await client.query(`
        INSERT INTO opportunities (
          title, description, type, location, url, organization, 
          source, categories, requirements, deadline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        title,
        description,
        'internship',
        location || 'Various locations',
        url,
        'STEM Organization',
        'STEM Internships Import',
        ['STEM', 'Internships'],
        [ageGrade, requirements].filter(Boolean),
        length || 'Summer program'
      ]);
      
      stats.successfulInserts++;
      stats.totalProcessed++;
      
    } catch (error) {
      console.error(`Error processing internship:`, error.message);
      stats.errorsEncountered++;
    }
  }
  
  console.log(`✓ STEM internships processed: ${records.length} records`);
}

async function processExtracurricularCompetitions() {
  console.log('Processing: Master List Competitions CSV');
  
  const filePath = './attached_assets/Master List of Extracurriculars.xlsx - Competition_1752128215563.csv';
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true });
  
  for (const row of records) {
    try {
      const title = cleanText(row.Competition || '');
      const organization = cleanText(row.Organization || '');
      const url = row.url || '';
      const deadline = cleanText(row['Application deadline'] || '');
      const eligibility = cleanText(row.Eligibility || '');
      const area = cleanText(row['Area of interest'] || '');
      
      if (!title || !isValidUrl(url)) {
        stats.brokenUrls++;
        continue;
      }
      
      // Check for duplicates
      const duplicateCheck = await client.query(
        'SELECT id FROM opportunities WHERE LOWER(title) = LOWER($1)',
        [title]
      );
      
      if (duplicateCheck.rows.length > 0) {
        stats.duplicatesSkipped++;
        continue;
      }
      
      await client.query(`
        INSERT INTO opportunities (
          title, description, type, location, url, organization, 
          source, categories, requirements, deadline
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        title,
        `Academic competition organized by ${organization}. ${area ? 'Focus area: ' + area : ''}`,
        'competition',
        'Various locations',
        url,
        organization || 'Competition Organization',
        'Master List Competitions Import',
        [area].filter(Boolean),
        [eligibility].filter(Boolean),
        deadline || 'See website'
      ]);
      
      stats.successfulInserts++;
      stats.totalProcessed++;
      
    } catch (error) {
      console.error(`Error processing extracurricular:`, error.message);
      stats.errorsEncountered++;
    }
  }
  
  console.log(`✓ Extracurricular competitions processed: ${records.length} records`);
}

async function main() {
  try {
    await initDatabase();
    console.log('Connected to database');
    
    await processHighSchoolCompetitions();
    await processStemInternships();
    await processExtracurricularCompetitions();
    
    console.log('\n=== IMPORT STATISTICS ===');
    console.log(`Total Processed: ${stats.totalProcessed}`);
    console.log(`Successful Inserts: ${stats.successfulInserts}`);
    console.log(`Duplicates Skipped: ${stats.duplicatesSkipped}`);
    console.log(`Broken URLs Skipped: ${stats.brokenUrls}`);
    console.log(`Errors: ${stats.errorsEncountered}`);
    
    // Get final database count
    const countResult = await client.query('SELECT COUNT(*) FROM opportunities');
    console.log(`\n🎉 DATABASE NOW CONTAINS: ${countResult.rows[0].count} TOTAL OPPORTUNITIES`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) await client.end();
  }
}

main().catch(console.error);