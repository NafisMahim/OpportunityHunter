const fs = require('fs');
const csv = require('csv-parse');
const cheerio = require('cheerio');

// Initialize opportunity storage
let allOpportunities = [];
let processedCount = 0;

// File paths to process
const filesToProcess = [
    'attached_assets/Complete-Fly-In-Programs-List_1752038357455.pdf',
    'attached_assets/High School Student Opportunities (50 Programs)_1752038357460.pdf',
    'attached_assets/High_School_Summer_Programs_1752038357460.pdf',
    'attached_assets/Summer Enrichment Program - Sheet1_1752038357460.csv',
    'attached_assets/Summer-Programs-and-Opportunities_1752038357460.pdf',
    'attached_assets/SummerPrograms-IvyPlanners_1752038357460.pdf'
];

// URL cleaning function
function cleanUrl(url) {
    if (!url) return null;
    
    url = url.trim();
    
    // Remove common prefixes
    url = url.replace(/^(Visit:|Website:|URL:|Link:|Apply:)\s*/i, '');
    
    // Add protocol if missing
    if (url.match(/^www\./)) {
        url = 'https://' + url;
    } else if (url.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) && !url.match(/^https?:\/\//)) {
        url = 'https://' + url;
    }
    
    // Clean up common issues
    url = url.replace(/\s+/g, '');
    url = url.replace(/['"]/g, '');
    
    return url.match(/^https?:\/\//) ? url : null;
}

// CSV processing function
async function processCsvFile(filePath) {
    console.log(`Processing CSV: ${filePath}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const records = [];
        
        return new Promise((resolve, reject) => {
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
            
            parser.on('error', function(err) {
                console.error(`CSV parsing error for ${filePath}:`, err);
                resolve([]);
            });
            
            parser.on('end', function() {
                console.log(`Found ${records.length} CSV records in ${filePath}`);
                
                records.forEach((record, index) => {
                    try {
                        // Extract basic information
                        const programName = record['Program Name'] || record.Title || record.Name || Object.values(record)[0] || `Program ${index + 1}`;
                        const description = record.Description || record.Details || record.Focus || Object.values(record)[1] || '';
                        const eligibility = record.Eligibility || record.Requirements || record.Education || '';
                        const deadline = record['Application Deadline'] || record.Deadline || record.Dates || '';
                        const location = record.Location || record.State || record.Where || '';
                        const cost = record.Fee || record.Cost || record.Price || '';
                        const category = record.Category || record.Focus || record.Subject || record.Field || 'Academic Program';
                        
                        // Try to find URL in any field
                        let applicationUrl = null;
                        for (const [key, value] of Object.entries(record)) {
                            if (value && typeof value === 'string' && (value.includes('http') || value.includes('www.'))) {
                                applicationUrl = cleanUrl(value);
                                if (applicationUrl) break;
                            }
                        }
                        
                        if (programName && programName.trim()) {
                            const opportunity = {
                                title: programName.trim(),
                                description: description || `${programName} - Academic program for high school students`,
                                category: category || 'Academic Program',
                                location: location || 'Various',
                                applicationUrl: applicationUrl || 'https://www.google.com/search?q=' + encodeURIComponent(programName + ' application'),
                                deadline: deadline || 'Check program website',
                                eligibility: eligibility || 'High school students',
                                cost: cost || 'Contact program',
                                source: `CSV: ${filePath.split('/').pop()}`
                            };
                            
                            allOpportunities.push(opportunity);
                            processedCount++;
                        }
                    } catch (error) {
                        console.error(`Error processing CSV record ${index}:`, error);
                    }
                });
                
                resolve(records);
            });
            
            parser.write(content);
            parser.end();
        });
    } catch (error) {
        console.error(`Error reading CSV file ${filePath}:`, error);
        return [];
    }
}

// PDF text processing function
function processPdfText(content, fileName) {
    console.log(`Processing PDF text: ${fileName}`);
    
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let currentOpportunity = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip page numbers, headers, footers
        if (line.match(/^\d+$/) || line.match(/^Page \d+/) || line.length < 3) {
            continue;
        }
        
        // Detect program names (typically followed by bullet points or descriptions)
        if (isLikelyProgramName(line)) {
            // Save previous opportunity
            if (currentOpportunity && currentOpportunity.title) {
                allOpportunities.push(currentOpportunity);
                processedCount++;
            }
            
            // Start new opportunity
            currentOpportunity = {
                title: line.trim(),
                description: '',
                category: 'Academic Program',
                location: 'Various',
                applicationUrl: null,
                deadline: 'Check program website',
                eligibility: 'High school students',
                cost: 'Contact program',
                source: `PDF: ${fileName}`
            };
        }
        // Detect URLs
        else if (line.includes('http') || line.includes('www.')) {
            const url = extractUrlFromLine(line);
            if (url && currentOpportunity && !currentOpportunity.applicationUrl) {
                currentOpportunity.applicationUrl = cleanUrl(url);
            }
        }
        // Add to description
        else if (currentOpportunity && line.length > 10) {
            if (currentOpportunity.description) {
                currentOpportunity.description += ' ' + line;
            } else {
                currentOpportunity.description = line;
            }
        }
    }
    
    // Don't forget the last opportunity
    if (currentOpportunity && currentOpportunity.title) {
        allOpportunities.push(currentOpportunity);
        processedCount++;
    }
}

// Helper function to detect program names
function isLikelyProgramName(line) {
    // Check for common patterns
    if (line.match(/^[A-Z][a-zA-Z\s&'-]+$/)) return true;
    if (line.includes('University') || line.includes('College') || line.includes('Institute')) return true;
    if (line.includes('Program') || line.includes('Camp') || line.includes('Academy')) return true;
    if (line.includes('Summer') && line.length < 100) return true;
    if (line.match(/^●\s*(.+)$/)) return true;
    if (line.match(/^\d+\.\s*(.+)$/)) return true;
    
    return false;
}

// Extract URL from a line of text
function extractUrlFromLine(line) {
    const urlMatch = line.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/);
    return urlMatch ? urlMatch[0] : null;
}

// Process specific files based on their type
async function processFile(filePath) {
    console.log(`\n=== Processing: ${filePath} ===`);
    
    try {
        if (filePath.endsWith('.csv')) {
            await processCsvFile(filePath);
        } else if (filePath.endsWith('.pdf')) {
            const content = fs.readFileSync(filePath, 'utf8');
            processPdfText(content, filePath.split('/').pop());
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

// Main execution function
async function extractAllOpportunities() {
    console.log('=== COMPREHENSIVE 8-FILE OPPORTUNITY EXTRACTION ===\n');
    
    for (const filePath of filesToProcess) {
        if (fs.existsSync(filePath)) {
            await processFile(filePath);
        } else {
            console.log(`File not found: ${filePath}`);
        }
    }
    
    // Remove duplicates based on title similarity
    console.log(`\n=== Removing duplicates from ${allOpportunities.length} opportunities ===`);
    const uniqueOpportunities = [];
    
    for (const opportunity of allOpportunities) {
        const isDuplicate = uniqueOpportunities.some(existing => 
            existing.title.toLowerCase() === opportunity.title.toLowerCase() ||
            (existing.title.toLowerCase().includes(opportunity.title.toLowerCase()) && 
             opportunity.title.length < existing.title.length)
        );
        
        if (!isDuplicate) {
            uniqueOpportunities.push(opportunity);
        }
    }
    
    console.log(`\n=== EXTRACTION COMPLETE ===`);
    console.log(`Total opportunities processed: ${processedCount}`);
    console.log(`Unique opportunities after deduplication: ${uniqueOpportunities.length}`);
    
    // Save to JSON file
    fs.writeFileSync('comprehensive-8-file-opportunities.json', JSON.stringify(uniqueOpportunities, null, 2));
    console.log('Saved to: comprehensive-8-file-opportunities.json');
    
    // Show sample
    console.log('\n=== SAMPLE OPPORTUNITIES ===');
    uniqueOpportunities.slice(0, 5).forEach((opp, index) => {
        console.log(`${index + 1}. ${opp.title}`);
        console.log(`   Category: ${opp.category}`);
        console.log(`   URL: ${opp.applicationUrl}`);
        console.log(`   Source: ${opp.source}\n`);
    });
    
    return uniqueOpportunities;
}

// Run the extraction
if (require.main === module) {
    extractAllOpportunities().catch(console.error);
}

module.exports = { extractAllOpportunities };