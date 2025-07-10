const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

let stats = {
  totalProcessed: 0,
  successfulInserts: 0,
  duplicatesSkipped: 0,
  errorsEncountered: 0,
  filesProcessed: 0
};

// Get all CSV files
function getAllCsvFiles() {
  const attachedAssetsDir = './attached_assets';
  const allFiles = fs.readdirSync(attachedAssetsDir);
  return allFiles.filter(file => file.endsWith('.csv')).map(file => path.join(attachedAssetsDir, file));
}

function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('No URL') || url.includes('N/A') || url.includes('TBD') || url.includes('google.com/search')) return false;
  if (url.includes('scholarships.com') || url.includes('varies') || url.includes('See website')) return false;
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000);
}

function determineType(title, description, categories) {
  const text = `${title} ${description} ${categories}`.toLowerCase();
  
  if (text.includes('internship') || text.includes('intern ')) return 'internship';
  if (text.includes('scholarship') || text.includes('financial aid')) return 'scholarship';
  if (text.includes('competition') || text.includes('contest') || text.includes('challenge')) return 'competition';
  if (text.includes('grant') || text.includes('funding')) return 'grant';
  if (text.includes('volunteer') || text.includes('community service')) return 'volunteer';
  if (text.includes('research') || text.includes('lab ')) return 'research';
  if (text.includes('program') || text.includes('course')) return 'program';
  
  return 'program';
}

function extractCategories(row) {
  const categories = [];
  
  // Check various category columns
  if (row.Subject) categories.push(row.Subject);
  if (row['Area of interest']) categories.push(row['Area of interest']);
  if (row.Category) categories.push(row.Category);
  if (row.Categories) categories.push(row.Categories);
  if (row.Field) categories.push(row.Field);
  if (row.Type) categories.push(row.Type);
  
  // Infer categories from content
  const text = `${row.Name || row.title || row.Program || row.Opportunity || ''} ${row.Description || row.Details || ''}`.toLowerCase();
  
  if (text.includes('stem') || text.includes('science') || text.includes('math') || text.includes('engineering')) {
    categories.push('STEM');
  }
  if (text.includes('computer') || text.includes('coding') || text.includes('programming') || text.includes('software')) {
    categories.push('Computer Science');
  }
  if (text.includes('medical') || text.includes('health') || text.includes('biology') || text.includes('medicine')) {
    categories.push('Medicine/Health');
  }
  
  return [...new Set(categories.filter(Boolean))];
}

function extractRequirements(row) {
  const requirements = [];
  
  if (row.Eligibility) requirements.push(row.Eligibility);
  if (row.Requirements) requirements.push(row.Requirements);
  if (row['Age/Grade']) requirements.push(row['Age/Grade']);
  if (row.Grade) requirements.push(`Grade ${row.Grade}`);
  if (row.Age) requirements.push(`Age ${row.Age}`);
  if (row.GPA) requirements.push(`GPA: ${row.GPA}`);
  if (row['Other Requirements']) requirements.push(row['Other Requirements']);
  
  return requirements.filter(Boolean);
}

async function processCsvFile(filePath) {
  console.log(`Processing: ${path.basename(filePath)}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, { 
      columns: true, 
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true 
    });
    
    let processedCount = 0;
    
    for (const row of records) {
      try {
        // Extract data with multiple possible column names
        const title = cleanText(
          row.Name || row.title || row.Program || row.Opportunity || 
          row.Competition || row.Internship || row['Program Name'] || ''
        );
        
        const description = cleanText(
          row.Description || row.Details || row.Summary || row.desc || 
          row['Program Description'] || ''
        );
        
        const url = (
          row.URL || row.url || row.Website || row.Link || row.website || 
          row['Application URL'] || row['Program URL'] || ''
        ).trim();
        
        const location = cleanText(
          row.Location || row.State || row.City || row.Country || 
          row.Region || 'Various locations'
        );
        
        const deadline = cleanText(
          row.Deadline || row['Application deadline'] || row['Due date'] || 
          row.Dates || row['Application Deadline (if any)'] || ''
        );
        
        const organization = cleanText(
          row.Organization || row.Sponsor || row.Host || row.Institution || 
          row.Company || ''
        );
        
        // Skip if essential data is missing
        if (!title || title.length < 3) continue;
        if (!isValidUrl(url)) continue;
        
        const categories = extractCategories(row);
        const requirements = extractRequirements(row);
        const type = determineType(title, description, categories.join(' '));
        
        // Check for duplicates
        const duplicateCheck = await client.query(
          'SELECT id FROM opportunities WHERE LOWER(title) = LOWER($1)',
          [title]
        );
        
        if (duplicateCheck.rows.length > 0) {
          stats.duplicatesSkipped++;
          continue;
        }
        
        // Build description if missing
        let finalDescription = description;
        if (!finalDescription || finalDescription.length < 10) {
          finalDescription = `${type} opportunity${organization ? ' from ' + organization : ''}. ${categories.length ? 'Focus areas: ' + categories.join(', ') + '.' : ''} Visit the website for complete details.`;
        }
        
        // Insert opportunity
        await client.query(`
          INSERT INTO opportunities (
            title, description, type, location, deadline, url, 
            organization, source, categories, requirements
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          title,
          finalDescription,
          type,
          location,
          deadline || 'See website for details',
          url,
          organization || 'See website',
          `Complete Import: ${path.basename(filePath)}`,
          categories,
          requirements
        ]);
        
        stats.successfulInserts++;
        stats.totalProcessed++;
        processedCount++;
        
        // Progress logging
        if (stats.totalProcessed % 50 === 0) {
          console.log(`  → ${stats.totalProcessed} total processed...`);
        }
        
      } catch (error) {
        stats.errorsEncountered++;
      }
    }
    
    stats.filesProcessed++;
    console.log(`✓ ${path.basename(filePath)}: ${processedCount}/${records.length} imported`);
    
  } catch (error) {
    console.error(`File error ${filePath}:`, error.message);
    stats.errorsEncountered++;
  }
}

async function processAllRemainingFiles() {
  try {
    await client.connect();
    console.log('🚀 Processing ALL remaining CSV files...\n');
    
    const allCsvFiles = getAllCsvFiles();
    console.log(`Found ${allCsvFiles.length} CSV files total\n`);
    
    // Process all files
    for (const file of allCsvFiles) {
      await processCsvFile(file);
    }
    
    // Final statistics
    console.log('\n🎉 COMPLETE IMPORT FINISHED!');
    console.log('================================');
    console.log(`Files Processed: ${stats.filesProcessed}`);
    console.log(`Total Records Processed: ${stats.totalProcessed}`);
    console.log(`Successful Inserts: ${stats.successfulInserts}`);
    console.log(`Duplicates Skipped: ${stats.duplicatesSkipped}`);
    console.log(`Errors Encountered: ${stats.errorsEncountered}`);
    
    // Get final database count
    const countResult = await client.query('SELECT COUNT(*) FROM opportunities');
    console.log(`\n🎯 FINAL DATABASE COUNT: ${countResult.rows[0].count} TOTAL OPPORTUNITIES`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await client.end();
  }
}

processAllRemainingFiles().catch(console.error);