const fs = require('fs');
const path = require('path');
const csv = require('csv-parse');
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

let extractedOpportunities = [];

// Clean extracted opportunities from bad data
async function cleanDatabase() {
    console.log('🧹 Cleaning database of garbage data...');
    
    // Delete applications first to avoid foreign key constraints
    await sql`DELETE FROM applications WHERE opportunity_id IN (
        SELECT id FROM opportunities WHERE 
        title LIKE '%increase their knowledge%' OR 
        title LIKE '%Many other colleges%' OR 
        title LIKE 'Dates: %' OR
        title LIKE '%experience what college courses%' OR
        length(title) < 10 OR
        description LIKE '% - Academic opportunity'
    )`;
    
    const deleteResult = await sql`DELETE FROM opportunities WHERE 
        title LIKE '%increase their knowledge%' OR 
        title LIKE '%Many other colleges%' OR 
        title LIKE 'Dates: %' OR
        title LIKE '%experience what college courses%' OR
        length(title) < 10 OR
        description LIKE '% - Academic opportunity'
    `;
    
    console.log(`✅ Cleaned ${deleteResult.length} garbage entries`);
    return deleteResult.length;
}

// Parse Summer Enrichment Program format
async function parseSummerEnrichmentCsv(filePath) {
    console.log(`📊 Parsing Summer Enrichment CSV: ${path.basename(filePath)}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
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
                    records.push(record);
                }
            });
            
            parser.on('end', function() {
                console.log(`✅ Found ${records.length} records`);
                
                records.forEach((record) => {
                    const programName = record['Program Name'];
                    const focus = record['Focus'];
                    const state = record['State '] || record['State'];
                    const fee = record['Fee'];
                    const stipend = record['Stipend'];
                    const eligibility = record['Eligibility'];
                    const deadline = record['Application Deadline'];
                    
                    if (programName && programName.length > 5 && focus && focus.length > 10) {
                        const opportunity = {
                            title: programName.trim(),
                            description: focus.trim(),
                            type: 'internship',
                            location: state?.trim() || 'Various',
                            url: `https://www.google.com/search?q=${encodeURIComponent(programName + ' application')}`,
                            deadline: deadline?.trim() || 'Check website',
                            requirements: [eligibility?.trim() || 'Check requirements'],
                            source: `Summer Enrichment Program`,
                            tags: [],
                            salary: stipend && stipend !== 'no' ? stipend : null,
                            amount: fee && fee !== 'no' ? fee : null
                        };
                        
                        extractedOpportunities.push(opportunity);
                    }
                });
                
                resolve(records.length);
            });
            
            parser.write(content);
            parser.end();
        });
    } catch (error) {
        console.error(`❌ Error parsing file: ${error.message}`);
        return 0;
    }
}

// Parse Free Summer Programs format
async function parseFreeSummerProgramsCsv(filePath) {
    console.log(`📊 Parsing Free Summer Programs CSV: ${path.basename(filePath)}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Skip files with malformed structure
        if (content.includes('Program Overview') && content.includes('Details')) {
            // This is a structured format file
            const lines = content.split('\n');
            let count = 0;
            
            for (let i = 2; i < lines.length; i++) { // Skip header rows
                const line = lines[i].trim();
                if (!line || line.length < 20) continue;
                
                // Parse the structured line format
                const parts = line.split(/\s{2,}|\t/); // Split on multiple spaces or tabs
                if (parts.length >= 3) {
                    const programName = parts[0]?.replace(/"/g, '').trim();
                    const gradeLevel = parts[2]?.replace(/"/g, '').trim();
                    const eligibility = parts[3]?.replace(/"/g, '').trim();
                    const notes = parts[4]?.replace(/"/g, '').trim();
                    
                    if (programName && programName.length > 5 && !programName.includes('Program Overview')) {
                        const opportunity = {
                            title: programName,
                            description: `${programName} - Program for ${gradeLevel}. ${notes || 'Check website for details.'}`,
                            type: 'internship',
                            location: 'Various',
                            url: `https://www.google.com/search?q=${encodeURIComponent(programName + ' summer program application')}`,
                            deadline: 'Check website',
                            requirements: [eligibility || gradeLevel || 'Check requirements'],
                            source: `Free Summer Programs - ${path.basename(filePath).split('_')[3]?.split('.')[0] || 'Program'}`,
                            tags: []
                        };
                        
                        extractedOpportunities.push(opportunity);
                        count++;
                    }
                }
            }
            
            console.log(`✅ Extracted ${count} opportunities`);
            return count;
        }
    } catch (error) {
        console.error(`❌ Error parsing file: ${error.message}`);
    }
    
    return 0;
}

// Parse High School Opportunities 50 Complete format
async function parseHighSchoolOpportunitiesCsv(filePath) {
    console.log(`📊 Parsing High School Opportunities CSV: ${path.basename(filePath)}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
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
                    records.push(record);
                }
            });
            
            parser.on('end', function() {
                console.log(`✅ Found ${records.length} records`);
                
                records.forEach((record) => {
                    const title = record['Title'];
                    const description = record['Description'];
                    const deadline = record['Deadline'];
                    const link = record['Link'];
                    const category = record['Category'];
                    const cost = record['Cost'];
                    const location = record['Location'];
                    const subject = record['Major/Subject focus'];
                    const eligibility = record['Eligibility'];
                    
                    if (title && title.length > 5 && description && description.length > 10) {
                        // Clean URL
                        let cleanUrl = link;
                        if (!cleanUrl || !cleanUrl.includes('http')) {
                            cleanUrl = `https://www.google.com/search?q=${encodeURIComponent(title + ' application')}`;
                        }
                        
                        // Determine type based on category
                        let type = 'internship';
                        if (category?.toLowerCase().includes('scholarship')) type = 'scholarship';
                        else if (category?.toLowerCase().includes('competition')) type = 'competition';
                        else if (category?.toLowerCase().includes('research')) type = 'internship';
                        else if (category?.toLowerCase().includes('program')) type = 'internship';
                        
                        const opportunity = {
                            title: title.trim(),
                            description: description.trim(),
                            type: type,
                            location: location?.trim() || 'Various',
                            url: cleanUrl,
                            deadline: deadline?.trim() || 'Check website',
                            requirements: [eligibility?.trim() || 'Check requirements'],
                            source: `High School Complete Programs`,
                            tags: subject ? [subject.trim()] : [],
                            amount: cost && cost !== 'Free' ? cost : null
                        };
                        
                        extractedOpportunities.push(opportunity);
                    }
                });
                
                resolve(records.length);
            });
            
            parser.write(content);
            parser.end();
        });
    } catch (error) {
        console.error(`❌ Error parsing file: ${error.message}`);
        return 0;
    }
}

// Import opportunities to database
async function importOpportunities() {
    console.log(`\n🔄 Importing ${extractedOpportunities.length} opportunities to database...`);
    
    // Get existing titles to avoid duplicates
    const existing = await sql`SELECT title FROM opportunities`;
    const existingTitles = new Set(existing.map(row => row.title.toLowerCase().trim()));
    
    let imported = 0;
    let skipped = 0;
    
    for (const opp of extractedOpportunities) {
        const titleKey = opp.title.toLowerCase().trim();
        
        // Skip duplicates
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
                    ${opp.tags}, ${opp.salary || null}, ${opp.amount || null}
                )
            `;
            
            imported++;
            existingTitles.add(titleKey);
            
            if (imported % 50 === 0) {
                console.log(`✅ Progress: ${imported} imported, ${skipped} skipped`);
            }
            
        } catch (error) {
            console.error(`❌ Error importing "${opp.title}": ${error.message}`);
        }
    }
    
    return { imported, skipped };
}

// Main processing function
async function intelligentParsing() {
    console.log('🧠 INTELLIGENT OPPORTUNITY PARSER 🧠\n');
    console.log('📋 Parsing ONLY valid, structured opportunity data\n');
    
    // First clean existing garbage
    await cleanDatabase();
    
    const attachedDir = 'attached_assets';
    const priorityFiles = [
        'Summer Enrichment Program - Sheet1_1752038357460.csv',
        'high_school_opportunities_50_complete_1752027571745.csv',
        'Free-Summer-Programs-CS_Robotics_1752030539692.csv',
        'Free-Summer-Programs-Business_1752030539692.csv',
        'Free-Summer-Programs-STEM_Math_1752030539693.csv',
        'Free-Summer-Programs-Research_Medicine_1752030539693.csv',
        'Free-Summer-Programs-Nature_1752030539692.csv',
        'Free-Summer-Programs-Other_1752030539693.csv'
    ];
    
    let totalProcessed = 0;
    
    for (const fileName of priorityFiles) {
        const filePath = path.join(attachedDir, fileName);
        
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️ File not found: ${fileName}`);
            continue;
        }
        
        console.log(`\n[${totalProcessed + 1}/${priorityFiles.length}] Processing: ${fileName}`);
        
        try {
            let count = 0;
            
            if (fileName.includes('Summer Enrichment Program')) {
                count = await parseSummerEnrichmentCsv(filePath);
            } else if (fileName.includes('high_school_opportunities_50_complete')) {
                count = await parseHighSchoolOpportunitiesCsv(filePath);
            } else if (fileName.includes('Free-Summer-Programs')) {
                count = await parseFreeSummerProgramsCsv(filePath);
            }
            
            totalProcessed += count;
            console.log(`   ✅ Extracted ${count} valid opportunities`);
            
        } catch (error) {
            console.error(`❌ Error processing ${fileName}: ${error.message}`);
        }
    }
    
    console.log(`\n🎯 EXTRACTION COMPLETE!`);
    console.log(`📊 Total valid opportunities extracted: ${extractedOpportunities.length}`);
    
    // Import to database
    const { imported, skipped } = await importOpportunities();
    
    // Get final count
    const finalCount = await sql`SELECT COUNT(*) as count FROM opportunities`;
    
    console.log(`\n🎉 INTELLIGENT PARSING COMPLETE! 🎉`);
    console.log(`✅ Successfully imported: ${imported} opportunities`);
    console.log(`⏭️ Skipped duplicates: ${skipped} opportunities`);
    console.log(`📊 Total database size: ${finalCount[0].count} opportunities`);
    
    return finalCount[0].count;
}

if (require.main === module) {
    intelligentParsing().catch(console.error);
}

module.exports = { intelligentParsing };