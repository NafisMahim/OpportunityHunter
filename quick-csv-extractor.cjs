const fs = require('fs');
const path = require('path');
const csv = require('csv-parse');

// Quick extraction to focus on largest CSV files first
let allOpportunities = [];

async function quickProcessCsv(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.trim()) return 0;
        
        const records = [];
        
        return new Promise((resolve) => {
            const parser = csv.parse({
                columns: true,
                skip_empty_lines: true,
                relax_column_count: true,
                delimiter: ','
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
                records.forEach((record) => {
                    const allValues = Object.values(record).filter(v => v && v.trim());
                    const allKeys = Object.keys(record);
                    
                    // Find title
                    let title = null;
                    const titleFields = ['title', 'name', 'program', 'opportunity', 'program name', 'description'];
                    
                    for (const field of titleFields) {
                        const key = allKeys.find(k => k.toLowerCase().includes(field));
                        if (key && record[key] && record[key].trim()) {
                            title = record[key].trim();
                            break;
                        }
                    }
                    
                    if (!title && allValues.length > 0) {
                        title = allValues[0].slice(0, 200);
                    }
                    
                    if (!title || title.length < 3) return;
                    
                    // Find description
                    let description = '';
                    const descFields = ['description', 'details', 'summary', 'about', 'focus'];
                    for (const field of descFields) {
                        const key = allKeys.find(k => k.toLowerCase().includes(field));
                        if (key && record[key] && record[key].trim()) {
                            description = record[key].trim();
                            break;
                        }
                    }
                    
                    if (!description) {
                        description = allValues.slice(1, 3).join(' ') || `${title} - Academic opportunity`;
                    }
                    
                    // Find URL
                    let applicationUrl = null;
                    const urlFields = ['url', 'link', 'website', 'apply', 'application'];
                    for (const field of urlFields) {
                        const key = allKeys.find(k => k.toLowerCase().includes(field));
                        if (key && record[key] && record[key].trim()) {
                            let url = record[key].trim();
                            if (url.includes('http') || url.includes('www.')) {
                                applicationUrl = url;
                                break;
                            }
                        }
                    }
                    
                    if (!applicationUrl) {
                        applicationUrl = `https://www.google.com/search?q=${encodeURIComponent(title + ' application')}`;
                    }
                    
                    const opportunity = {
                        title: title,
                        description: description.slice(0, 1000),
                        type: 'internship',
                        location: 'Various',
                        url: applicationUrl,
                        deadline: 'Check website',
                        requirements: ['Check requirements'],
                        source: `CSV: ${path.basename(filePath)}`,
                        tags: []
                    };
                    
                    allOpportunities.push(opportunity);
                });
                
                resolve(records.length);
            });
            
            parser.write(content);
            parser.end();
        });
    } catch (error) {
        return 0;
    }
}

async function processTopCsvFiles() {
    console.log('🚀 QUICK CSV EXTRACTION - Processing largest files first\n');
    
    const attachedDir = 'attached_assets';
    const csvFiles = fs.readdirSync(attachedDir).filter(f => f.endsWith('.csv'));
    
    // Get file sizes and sort by size
    const filesSized = csvFiles.map(file => {
        const filePath = path.join(attachedDir, file);
        const stats = fs.statSync(filePath);
        return { file, path: filePath, size: stats.size };
    }).sort((a, b) => b.size - a.size);
    
    console.log(`📊 Processing ${filesSized.length} CSV files by size:\n`);
    
    // Process largest 50 files first
    const topFiles = filesSized.slice(0, 50);
    
    for (let i = 0; i < topFiles.length; i++) {
        const { file, path: filePath } = topFiles[i];
        console.log(`[${i+1}/50] Processing: ${file}`);
        
        const count = await quickProcessCsv(filePath);
        console.log(`   ✅ Extracted ${count} records (Total: ${allOpportunities.length})`);
        
        if ((i + 1) % 10 === 0) {
            console.log(`\n🔥 MILESTONE: ${allOpportunities.length} opportunities extracted!\n`);
        }
    }
    
    console.log(`\n🎉 EXTRACTION COMPLETE!`);
    console.log(`📊 Total opportunities: ${allOpportunities.length}`);
    
    // Save results
    fs.writeFileSync('quick-extracted-opportunities.json', JSON.stringify(allOpportunities, null, 2));
    console.log(`💾 Saved to: quick-extracted-opportunities.json`);
    
    return allOpportunities;
}

if (require.main === module) {
    processTopCsvFiles().catch(console.error);
}

module.exports = { processTopCsvFiles };