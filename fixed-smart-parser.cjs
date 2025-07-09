const fs = require('fs');
const path = require('path');
const csv = require('csv-parse');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

let validOpportunities = [];

// Smart parser that only extracts real program opportunities
async function parseRealOpportunities(filePath) {
    console.log(`🔍 Analyzing: ${path.basename(filePath)}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.trim()) return 0;
        
        // Special handling for Free Summer Programs format
        if (content.includes('Program Overview') && content.includes('Details')) {
            return parseFreeSummerFormat(content, filePath);
        }
        
        // Standard CSV format
        return parseStandardCsv(content, filePath);
        
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return 0;
    }
}

// Parse Free Summer Programs special format
function parseFreeSummerFormat(content, filePath) {
    const lines = content.split('\n');
    let count = 0;
    
    for (let i = 2; i < lines.length; i++) { // Skip header rows
        const line = lines[i].trim();
        
        // Skip empty lines, footer notes, URLs, and explanatory text
        if (!line || 
            line.length < 30 || 
            line.startsWith('http') ||
            line.startsWith('[') ||
            line.includes('Grade levels are given') ||
            line.includes('Unless otherwise noted') ||
            line.includes('will list these target') ||
            line.includes('just implies permanent') ||
            line === '""' ||
            line === '"') {
            continue;
        }
        
        // Parse structured line with quotes
        const cleanLine = line.replace(/^"|"$/g, '');
        const parts = cleanLine.split(/\s{3,}|\t/); // Split on 3+ spaces or tabs
        
        if (parts.length >= 2) {
            const programName = parts[0]?.trim();
            const gradeLevel = parts.length > 2 ? parts[2]?.trim() : '';
            
            // Only extract if it looks like a real program name
            if (programName && 
                programName.length > 10 &&
                !programName.includes('Program Overview') &&
                (programName.includes('University') || 
                 programName.includes('Institute') || 
                 programName.includes('Laboratory') ||
                 programName.includes('Academy') ||
                 programName.includes('Program') ||
                 programName.includes('National') ||
                 programName.includes('MIT') ||
                 programName.includes('NASA'))) {
                
                const opportunity = {
                    title: programName.replace(/---/g, '-').trim(),
                    description: `${programName.replace(/---/g, '-')} - STEM program for ${gradeLevel || 'high school students'}. Check website for complete details and application requirements.`,
                    type: 'internship',
                    location: 'Various',
                    url: `https://www.google.com/search?q=${encodeURIComponent(programName.replace(/---/g, '-') + ' summer program application')}`,
                    deadline: 'Check website',
                    requirements: [gradeLevel || 'Check requirements'],
                    source: `Free Summer Programs - STEM/Math`,
                    tags: ['STEM', 'Mathematics']
                };
                
                validOpportunities.push(opportunity);
                count++;
            }
        }
    }
    
    console.log(`   ✅ Extracted ${count} real programs`);
    return count;
}

// Parse standard CSV format
async function parseStandardCsv(content, filePath) {
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
                // Find title/program name
                let title = null;
                const titleFields = ['title', 'program name', 'program', 'name'];
                
                for (const field of titleFields) {
                    const key = headers.find(h => h.toLowerCase().includes(field));
                    if (key && record[key] && record[key].trim() && record[key].trim().length > 5) {
                        title = record[key].trim();
                        break;
                    }
                }
                
                // Find description
                let description = null;
                const descFields = ['description', 'focus', 'details', 'summary'];
                for (const field of descFields) {
                    const key = headers.find(h => h.toLowerCase().includes(field));
                    if (key && record[key] && record[key].trim() && record[key].trim().length > 15) {
                        description = record[key].trim();
                        break;
                    }
                }
                
                // Only extract if we have a real program with meaningful title and description
                if (title && description && 
                    title.length > 5 && 
                    description.length > 15 &&
                    !title.includes('increase their knowledge') &&
                    !title.includes('Many other colleges') &&
                    !title.includes('experience what college') &&
                    !title.startsWith('[') &&
                    !title.includes('Grade levels are') &&
                    !description.includes('Academic opportunity')) {
                    
                    // Find other fields
                    const location = findFieldValue(record, headers, ['location', 'state']) || 'Various';
                    const deadline = findFieldValue(record, headers, ['deadline', 'due date']) || 'Check website';
                    const eligibility = findFieldValue(record, headers, ['eligibility', 'requirements']) || 'Check requirements';
                    const url = findUrlField(record, headers) || `https://www.google.com/search?q=${encodeURIComponent(title + ' application')}`;
                    
                    const opportunity = {
                        title: title,
                        description: description,
                        type: determineType(title, description),
                        location: location,
                        url: url,
                        deadline: deadline,
                        requirements: [eligibility],
                        source: `Valid CSV: ${path.basename(filePath)}`,
                        tags: []
                    };
                    
                    validOpportunities.push(opportunity);
                    count++;
                }
            });
            
            console.log(`   ✅ Extracted ${count} valid programs`);
            resolve(count);
        });
        
        parser.write(content);
        parser.end();
    });
}

// Helper functions
function findFieldValue(record, headers, fieldNames) {
    for (const fieldName of fieldNames) {
        const key = headers.find(h => h.toLowerCase().includes(fieldName));
        if (key && record[key] && record[key].trim()) {
            return record[key].trim();
        }
    }
    return null;
}

function findUrlField(record, headers) {
    const urlFields = ['url', 'link', 'website', 'apply'];
    for (const field of urlFields) {
        const key = headers.find(h => h.toLowerCase().includes(field));
        if (key && record[key] && record[key].includes('http')) {
            return record[key].trim();
        }
    }
    return null;
}

function determineType(title, description) {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('scholarship')) return 'scholarship';
    if (text.includes('competition') || text.includes('contest')) return 'competition';
    if (text.includes('grant')) return 'grant';
    return 'internship';
}

// Import only valid opportunities
async function importValidOpportunities() {
    console.log(`\n🔄 Importing ${validOpportunities.length} validated opportunities...`);
    
    const existing = await sql`SELECT title FROM opportunities`;
    const existingTitles = new Set(existing.map(row => row.title.toLowerCase().trim()));
    
    let imported = 0;
    let skipped = 0;
    
    for (const opp of validOpportunities) {
        const titleKey = opp.title.toLowerCase().trim();
        
        if (existingTitles.has(titleKey)) {
            skipped++;
            continue;
        }
        
        try {
            await sql`
                INSERT INTO opportunities (
                    title, description, type, location, url, deadline,
                    requirements, source, tags
                ) VALUES (
                    ${opp.title}, ${opp.description}, ${opp.type}, ${opp.location},
                    ${opp.url}, ${opp.deadline}, ${opp.requirements}, ${opp.source}, ${opp.tags}
                )
            `;
            
            imported++;
            existingTitles.add(titleKey);
            
        } catch (error) {
            console.error(`   ❌ Import error: ${error.message}`);
        }
    }
    
    return { imported, skipped };
}

// Main function to process only good files
async function processOnlyValidFiles() {
    console.log('🎯 PROCESSING ONLY VALID OPPORTUNITY FILES 🎯\n');
    
    const attachedDir = 'attached_assets';
    
    // Carefully selected files that contain real structured opportunities
    const validFiles = [
        'Summer Enrichment Program - Sheet1_1752038357460.csv',
        'high_school_opportunities_50_complete_1752027571745.csv',
        'high_school_opportunities_50_complete_1752027067129.csv',
        'Free-Summer-Programs-STEM_Math_1752030539693.csv',
        'Free-Summer-Programs-CS_Robotics_1752030539692.csv',
        'Free-Summer-Programs-Research_Medicine_1752030539693.csv',
        'Free-Summer-Programs-Business_1752030539692.csv',
        'Free-Summer-Programs-Nature_1752030539692.csv',
        'Free-Summer-Programs-Other_1752030539693.csv'
    ];
    
    console.log(`📁 Processing ${validFiles.length} carefully selected files\n`);
    
    for (const fileName of validFiles) {
        const filePath = path.join(attachedDir, fileName);
        
        if (fs.existsSync(filePath)) {
            await parseRealOpportunities(filePath);
        } else {
            console.log(`⚠️ File not found: ${fileName}`);
        }
    }
    
    console.log(`\n🎯 EXTRACTION COMPLETE!`);
    console.log(`📊 Total valid opportunities found: ${validOpportunities.length}`);
    
    const { imported, skipped } = await importValidOpportunities();
    
    const finalCount = await sql`SELECT COUNT(*) as count FROM opportunities`;
    
    console.log(`\n✅ IMPORT COMPLETE!`);
    console.log(`📥 Successfully imported: ${imported} new opportunities`);
    console.log(`⏭️ Skipped duplicates: ${skipped} opportunities`);
    console.log(`📊 Total database size: ${finalCount[0].count} opportunities`);
    
    return finalCount[0].count;
}

if (require.main === module) {
    processOnlyValidFiles().catch(console.error);
}

module.exports = { processOnlyValidFiles };