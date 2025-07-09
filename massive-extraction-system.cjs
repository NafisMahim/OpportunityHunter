const fs = require('fs');
const path = require('path');
const csv = require('csv-parse');

// Initialize massive opportunity storage
let allOpportunities = [];
let processedCount = 0;
let fileCount = 0;
let errorCount = 0;

// URL cleaning function
function cleanUrl(url) {
    if (!url) return null;
    
    url = url.trim();
    
    // Remove common prefixes
    url = url.replace(/^(Visit:|Website:|URL:|Link:|Apply:|See:|More:|Info:|Details:)\s*/i, '');
    
    // Add protocol if missing
    if (url.match(/^www\./)) {
        url = 'https://' + url;
    } else if (url.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) && !url.match(/^https?:\/\//)) {
        url = 'https://' + url;
    }
    
    // Clean up common issues
    url = url.replace(/\s+/g, '');
    url = url.replace(/['"]/g, '');
    url = url.replace(/\)$/, ''); // Remove trailing parenthesis
    
    return url.match(/^https?:\/\//) ? url : null;
}

// Extract URLs from any text
function extractUrlsFromText(text) {
    if (!text) return [];
    
    const urlRegex = /(https?:\/\/[^\s\)]+|www\.[^\s\)]+)/gi;
    const matches = text.match(urlRegex) || [];
    return matches.map(cleanUrl).filter(Boolean);
}

// Enhanced CSV processing for ANY CSV structure
async function processCsvFile(filePath) {
    console.log(`\n📊 Processing CSV: ${path.basename(filePath)}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.trim()) {
            console.log('❌ Empty file');
            return [];
        }
        
        const records = [];
        
        return new Promise((resolve, reject) => {
            const parser = csv.parse({
                columns: true,
                skip_empty_lines: true,
                relax_column_count: true,
                delimiter: ',',
                quote: '"',
                escape: '"'
            });
            
            parser.on('readable', function() {
                let record;
                while (record = parser.read()) {
                    if (record && typeof record === 'object') {
                        records.push(record);
                    }
                }
            });
            
            parser.on('error', function(err) {
                console.error(`❌ CSV parsing error: ${err.message}`);
                resolve([]);
            });
            
            parser.on('end', function() {
                console.log(`✅ Found ${records.length} CSV records`);
                
                records.forEach((record, index) => {
                    try {
                        const allValues = Object.values(record).filter(v => v && v.trim());
                        const allKeys = Object.keys(record);
                        
                        // Find potential title (first meaningful field)
                        let title = null;
                        const titleFields = ['title', 'name', 'program', 'opportunity', 'program name', 'description'];
                        
                        for (const field of titleFields) {
                            const key = allKeys.find(k => k.toLowerCase().includes(field));
                            if (key && record[key] && record[key].trim()) {
                                title = record[key].trim();
                                break;
                            }
                        }
                        
                        // If no title field found, use first non-empty value
                        if (!title && allValues.length > 0) {
                            title = allValues[0].slice(0, 200); // Limit length
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
                        const allText = Object.values(record).join(' ');
                        const urls = extractUrlsFromText(allText);
                        if (urls.length > 0) {
                            applicationUrl = urls[0];
                        }
                        
                        // Find other fields
                        const location = findFieldValue(record, ['location', 'state', 'where', 'city']) || 'Various';
                        const deadline = findFieldValue(record, ['deadline', 'due', 'date', 'when']) || 'Check website';
                        const eligibility = findFieldValue(record, ['eligibility', 'requirements', 'who', 'qualification']) || 'Check requirements';
                        const cost = findFieldValue(record, ['cost', 'fee', 'price', 'tuition']) || 'Contact program';
                        
                        const opportunity = {
                            title: title,
                            description: description.slice(0, 1000), // Limit description length
                            category: 'Academic Program',
                            location: location,
                            applicationUrl: applicationUrl || `https://www.google.com/search?q=${encodeURIComponent(title + ' application')}`,
                            deadline: deadline,
                            eligibility: eligibility,
                            cost: cost,
                            source: `CSV: ${path.basename(filePath)}`
                        };
                        
                        allOpportunities.push(opportunity);
                        processedCount++;
                        
                    } catch (error) {
                        console.error(`❌ Error processing record ${index}:`, error.message);
                        errorCount++;
                    }
                });
                
                resolve(records);
            });
            
            parser.write(content);
            parser.end();
        });
    } catch (error) {
        console.error(`❌ Error reading CSV file: ${error.message}`);
        errorCount++;
        return [];
    }
}

// Helper function to find field values
function findFieldValue(record, fieldNames) {
    for (const fieldName of fieldNames) {
        const key = Object.keys(record).find(k => k.toLowerCase().includes(fieldName));
        if (key && record[key] && record[key].trim()) {
            return record[key].trim();
        }
    }
    return null;
}

// Process text files (TXT)
function processTxtFile(filePath) {
    console.log(`\n📄 Processing TXT: ${path.basename(filePath)}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content.trim()) {
            console.log('❌ Empty file');
            return;
        }
        
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        let currentOpportunity = null;
        let opportunityCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip short lines, numbers, headers
            if (line.length < 10 || line.match(/^\d+$/) || line.match(/^(Title|Description|Link|URL|Website)/i)) {
                continue;
            }
            
            // Detect new opportunities (lines that look like titles)
            if (isLikelyTitle(line)) {
                // Save previous opportunity
                if (currentOpportunity && currentOpportunity.title) {
                    allOpportunities.push(currentOpportunity);
                    processedCount++;
                    opportunityCount++;
                }
                
                // Start new opportunity
                currentOpportunity = {
                    title: line,
                    description: '',
                    category: 'Academic Program',
                    location: 'Various',
                    applicationUrl: null,
                    deadline: 'Check website',
                    eligibility: 'Check requirements',
                    cost: 'Contact program',
                    source: `TXT: ${path.basename(filePath)}`
                };
            }
            // Look for URLs
            else if (line.includes('http') || line.includes('www.')) {
                const urls = extractUrlsFromText(line);
                if (urls.length > 0 && currentOpportunity && !currentOpportunity.applicationUrl) {
                    currentOpportunity.applicationUrl = urls[0];
                }
            }
            // Add to description if we have a current opportunity
            else if (currentOpportunity && line.length > 20) {
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
            opportunityCount++;
        }
        
        console.log(`✅ Extracted ${opportunityCount} opportunities`);
        
    } catch (error) {
        console.error(`❌ Error processing TXT file: ${error.message}`);
        errorCount++;
    }
}

// Helper to detect likely titles
function isLikelyTitle(line) {
    // Check for patterns that indicate titles
    if (line.length < 10 || line.length > 200) return false;
    if (line.includes('University') || line.includes('College') || line.includes('Institute')) return true;
    if (line.includes('Program') || line.includes('Fellowship') || line.includes('Scholarship')) return true;
    if (line.includes('Summer') || line.includes('Research') || line.includes('Internship')) return true;
    if (line.match(/^[A-Z]/)) return true; // Starts with capital
    if (line.includes(':') && line.indexOf(':') < line.length * 0.7) return true; // Title: description format
    
    return false;
}

// Process PDF files (text-readable ones)
function processPdfFile(filePath) {
    console.log(`\n📋 Processing PDF: ${path.basename(filePath)}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check if it's readable text (not binary)
        if (content.includes('%PDF') || content.includes('endobj') || content.length < 100) {
            console.log('❌ Binary PDF - skipping');
            return;
        }
        
        // Process as text
        processPdfText(content, path.basename(filePath));
        
    } catch (error) {
        console.error(`❌ Error processing PDF: ${error.message}`);
        errorCount++;
    }
}

// Process PDF text content
function processPdfText(content, fileName) {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let currentOpportunity = null;
    let opportunityCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Skip headers, footers, page numbers
        if (line.match(/^\d+$/) || line.match(/^Page \d+/) || line.length < 5) {
            continue;
        }
        
        // Detect program names
        if (isLikelyTitle(line)) {
            // Save previous opportunity
            if (currentOpportunity && currentOpportunity.title) {
                allOpportunities.push(currentOpportunity);
                processedCount++;
                opportunityCount++;
            }
            
            // Start new opportunity
            currentOpportunity = {
                title: line,
                description: '',
                category: 'Academic Program',
                location: 'Various',
                applicationUrl: null,
                deadline: 'Check website',
                eligibility: 'Check requirements',
                cost: 'Contact program',
                source: `PDF: ${fileName}`
            };
        }
        // Look for URLs
        else if (line.includes('http') || line.includes('www.')) {
            const urls = extractUrlsFromText(line);
            if (urls.length > 0 && currentOpportunity && !currentOpportunity.applicationUrl) {
                currentOpportunity.applicationUrl = urls[0];
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
        opportunityCount++;
    }
    
    console.log(`✅ Extracted ${opportunityCount} opportunities`);
}

// Get all files to process
function getAllFiles() {
    const attachedDir = 'attached_assets';
    if (!fs.existsSync(attachedDir)) {
        console.error('❌ attached_assets directory not found!');
        return [];
    }
    
    const allFiles = fs.readdirSync(attachedDir);
    const targetFiles = allFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.csv', '.pdf', '.txt'].includes(ext);
    });
    
    console.log(`🎯 Found ${targetFiles.length} files to process:`);
    console.log(`   📊 CSV files: ${targetFiles.filter(f => f.endsWith('.csv')).length}`);
    console.log(`   📋 PDF files: ${targetFiles.filter(f => f.endsWith('.pdf')).length}`);
    console.log(`   📄 TXT files: ${targetFiles.filter(f => f.endsWith('.txt')).length}`);
    
    return targetFiles.map(file => path.join(attachedDir, file));
}

// Main massive extraction function
async function runMassiveExtraction() {
    console.log('🚀 STARTING MASSIVE OPPORTUNITY EXTRACTION 🚀\n');
    console.log('💪 Processing EVERY SINGLE file to extract HUNDREDS of opportunities!\n');
    
    const files = getAllFiles();
    
    if (files.length === 0) {
        console.error('❌ No files found to process!');
        return;
    }
    
    for (const filePath of files) {
        fileCount++;
        const ext = path.extname(filePath).toLowerCase();
        
        console.log(`\n[${fileCount}/${files.length}] Processing: ${path.basename(filePath)}`);
        
        try {
            if (ext === '.csv') {
                await processCsvFile(filePath);
            } else if (ext === '.txt') {
                processTxtFile(filePath);
            } else if (ext === '.pdf') {
                processPdfFile(filePath);
            }
        } catch (error) {
            console.error(`❌ Error processing ${filePath}:`, error.message);
            errorCount++;
        }
        
        // Progress update
        if (fileCount % 10 === 0) {
            console.log(`\n🔥 PROGRESS UPDATE: Processed ${fileCount}/${files.length} files`);
            console.log(`💯 Extracted ${allOpportunities.length} opportunities so far!\n`);
        }
    }
    
    // Remove duplicates
    console.log(`\n🔄 Removing duplicates from ${allOpportunities.length} opportunities...`);
    const uniqueOpportunities = [];
    
    for (const opportunity of allOpportunities) {
        const isDuplicate = uniqueOpportunities.some(existing => {
            const titleSimilar = existing.title.toLowerCase() === opportunity.title.toLowerCase() ||
                               existing.title.toLowerCase().includes(opportunity.title.toLowerCase()) ||
                               opportunity.title.toLowerCase().includes(existing.title.toLowerCase());
            return titleSimilar;
        });
        
        if (!isDuplicate && opportunity.title && opportunity.title.length > 3) {
            uniqueOpportunities.push(opportunity);
        }
    }
    
    console.log(`\n🎉 MASSIVE EXTRACTION COMPLETE! 🎉`);
    console.log(`📊 Files processed: ${fileCount}`);
    console.log(`⚡ Total opportunities extracted: ${processedCount}`);
    console.log(`🎯 Unique opportunities: ${uniqueOpportunities.length}`);
    console.log(`❌ Errors encountered: ${errorCount}`);
    
    // Save to file
    fs.writeFileSync('massive-opportunities-extraction.json', JSON.stringify(uniqueOpportunities, null, 2));
    console.log(`💾 Saved to: massive-opportunities-extraction.json`);
    
    // Show sample
    console.log('\n🌟 SAMPLE OF EXTRACTED OPPORTUNITIES:');
    uniqueOpportunities.slice(0, 15).forEach((opp, index) => {
        console.log(`${index + 1}. ${opp.title.slice(0, 80)}${opp.title.length > 80 ? '...' : ''}`);
        console.log(`   📍 ${opp.location} | 📚 ${opp.source}`);
    });
    
    return uniqueOpportunities;
}

// Run the massive extraction
if (require.main === module) {
    runMassiveExtraction().catch(console.error);
}

module.exports = { runMassiveExtraction };