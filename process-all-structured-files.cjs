const fs = require('fs');
const path = require('path');
const csv = require('csv-parse');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

let extractedOpportunities = [];

// Enhanced parser for CSV files with proper structure detection
async function parseStructuredCsv(filePath) {
    console.log(`📊 Processing: ${path.basename(filePath)}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.trim()) return 0;
        
        const records = [];
        
        return new Promise((resolve) => {
            const parser = csv.parse({
                columns: true,
                skip_empty_lines: true,
                relax_column_count: true
            });
            
            parser.on('readable', function() {
                let record;
                while (record = parser.read()) {
                    if (record && typeof record === 'object') {
                        records.push(record);
                    }
                }
            });
            
            parser.on('error', function() {
                resolve(0);
            });
            
            parser.on('end', function() {
                let count = 0;
                const headers = Object.keys(records[0] || {});
                
                records.forEach((record) => {
                    // Smart detection of opportunity structure
                    let title = null;
                    let description = null;
                    let url = null;
                    let deadline = null;
                    let location = null;
                    let eligibility = null;
                    let cost = null;
                    
                    // Find title field
                    const titleFields = ['title', 'program name', 'program', 'name', 'opportunity', 'internship'];
                    for (const field of titleFields) {
                        const key = headers.find(h => h.toLowerCase().includes(field));
                        if (key && record[key] && record[key].trim() && record[key].trim().length > 3) {
                            title = record[key].trim();
                            break;
                        }
                    }
                    
                    // Find description field
                    const descFields = ['description', 'focus', 'details', 'summary', 'about'];
                    for (const field of descFields) {
                        const key = headers.find(h => h.toLowerCase().includes(field));
                        if (key && record[key] && record[key].trim() && record[key].trim().length > 10) {
                            description = record[key].trim();
                            break;
                        }
                    }
                    
                    // Find URL field
                    const urlFields = ['url', 'link', 'website', 'apply', 'application'];
                    for (const field of urlFields) {
                        const key = headers.find(h => h.toLowerCase().includes(field));
                        if (key && record[key] && record[key].includes('http')) {
                            url = record[key].trim();
                            break;
                        }
                    }
                    
                    // Find other fields
                    location = findFieldValue(record, headers, ['location', 'state', 'city', 'where']) || 'Various';
                    deadline = findFieldValue(record, headers, ['deadline', 'due date', 'application deadline']) || 'Check website';
                    eligibility = findFieldValue(record, headers, ['eligibility', 'requirements', 'qualification']) || 'Check requirements';
                    cost = findFieldValue(record, headers, ['cost', 'fee', 'stipend', 'salary']);
                    
                    // Only create opportunity if we have meaningful title and description
                    if (title && title.length > 5 && description && description.length > 10) {
                        // Skip obviously invalid entries
                        if (title.includes('increase their knowledge') || 
                            title.includes('Many other colleges') ||
                            title.includes('experience what college') ||
                            title.startsWith('Dates:') ||
                            description.includes('Academic opportunity')) {
                            return;
                        }
                        
                        const opportunity = {
                            title: title,
                            description: description,
                            type: determineType(title, description),
                            location: location,
                            url: url || `https://www.google.com/search?q=${encodeURIComponent(title + ' application')}`,
                            deadline: deadline,
                            requirements: [eligibility],
                            source: `Structured CSV: ${path.basename(filePath)}`,
                            tags: [],
                            salary: cost && cost.includes('$') && !cost.toLowerCase().includes('fee') ? cost : null,
                            amount: cost && (cost.toLowerCase().includes('fee') || cost.toLowerCase().includes('cost')) ? cost : null
                        };
                        
                        extractedOpportunities.push(opportunity);
                        count++;
                    }
                });
                
                console.log(`   ✅ Extracted ${count} valid opportunities`);
                resolve(count);
            });
            
            parser.write(content);
            parser.end();
        });
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return 0;
    }
}

// Helper function to find field values
function findFieldValue(record, headers, fieldNames) {
    for (const fieldName of fieldNames) {
        const key = headers.find(h => h.toLowerCase().includes(fieldName));
        if (key && record[key] && record[key].trim()) {
            return record[key].trim();
        }
    }
    return null;
}

// Determine opportunity type based on content
function determineType(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('scholarship')) return 'scholarship';
    if (text.includes('competition') || text.includes('contest') || text.includes('challenge')) return 'competition';
    if (text.includes('grant') || text.includes('funding')) return 'grant';
    if (text.includes('research') || text.includes('internship') || text.includes('summer') || text.includes('program')) return 'internship';
    
    return 'internship'; // default
}

// Import opportunities to database with duplicate checking
async function smartImport() {
    console.log(`\n🔄 Smart importing ${extractedOpportunities.length} opportunities...`);
    
    // Get existing opportunities for comparison
    const existing = await sql`SELECT title FROM opportunities`;
    const existingTitles = new Set(existing.map(row => row.title.toLowerCase().trim()));
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const opp of extractedOpportunities) {
        const titleKey = opp.title.toLowerCase().trim();
        
        // Skip if duplicate
        if (existingTitles.has(titleKey)) {
            skipped++;
            continue;
        }
        
        try {
            await sql`
                INSERT INTO opportunities (
                    title, description, type, location, url, deadline,
                    requirements, source, tags, salary, amount
                ) VALUES (
                    ${opp.title}, ${opp.description}, ${opp.type}, ${opp.location},
                    ${opp.url}, ${opp.deadline}, ${opp.requirements}, ${opp.source},
                    ${opp.tags}, ${opp.salary}, ${opp.amount}
                )
            `;
            
            imported++;
            existingTitles.add(titleKey);
            
            if (imported % 100 === 0) {
                console.log(`   📈 Progress: ${imported} imported, ${skipped} duplicates`);
            }
            
        } catch (error) {
            console.error(`   ❌ Error importing "${opp.title}": ${error.message}`);
            errors++;
        }
    }
    
    return { imported, skipped, errors };
}

// Main processing function
async function processAllStructuredFiles() {
    console.log('🚀 PROCESSING ALL STRUCTURED FILES 🚀\n');
    
    const attachedDir = 'attached_assets';
    const csvFiles = fs.readdirSync(attachedDir)
        .filter(f => f.endsWith('.csv'))
        .filter(f => !f.includes('SOB')); // Skip SOB files that had garbage data
    
    console.log(`📁 Found ${csvFiles.length} CSV files to process\n`);
    
    let totalProcessed = 0;
    
    // Process in batches to avoid memory issues
    const batchSize = 20;
    for (let i = 0; i < csvFiles.length; i += batchSize) {
        const batch = csvFiles.slice(i, i + batchSize);
        
        console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(csvFiles.length/batchSize)}`);
        
        for (const fileName of batch) {
            const filePath = path.join(attachedDir, fileName);
            
            try {
                const count = await parseStructuredCsv(filePath);
                totalProcessed += count;
            } catch (error) {
                console.error(`❌ Failed to process ${fileName}: ${error.message}`);
            }
        }
        
        console.log(`   🎯 Batch complete: ${extractedOpportunities.length} total extracted`);
        
        // Import this batch to database
        if (extractedOpportunities.length > 0) {
            const { imported, skipped, errors } = await smartImport();
            console.log(`   ✅ Batch imported: +${imported} new, ${skipped} duplicates, ${errors} errors`);
            
            // Clear for next batch
            extractedOpportunities = [];
        }
    }
    
    // Final database count
    const finalCount = await sql`SELECT COUNT(*) as count FROM opportunities`;
    
    console.log(`\n🎉 ALL STRUCTURED FILES PROCESSED! 🎉`);
    console.log(`📊 Total database size: ${finalCount[0].count} opportunities`);
    
    return finalCount[0].count;
}

if (require.main === module) {
    processAllStructuredFiles().catch(console.error);
}

module.exports = { processAllStructuredFiles };