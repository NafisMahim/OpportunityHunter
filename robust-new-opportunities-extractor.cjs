const fs = require('fs');
const csv = require('csv-parse');

// Initialize opportunity storage
let allOpportunities = [];
let processedCount = 0;

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

// Process the Summer Enrichment Program CSV 
async function processSummerEnrichmentCsv() {
    console.log('Processing Summer Enrichment Program CSV...');
    
    try {
        const content = fs.readFileSync('attached_assets/Summer Enrichment Program - Sheet1_1752038357460.csv', 'utf8');
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
                console.error('CSV parsing error:', err);
                resolve([]);
            });
            
            parser.on('end', function() {
                console.log(`Found ${records.length} CSV records`);
                
                records.forEach((record, index) => {
                    try {
                        const programName = record['Program Name'];
                        const description = record.Description || record.Focus || '';
                        const state = record.State || '';
                        const fee = record.Fee || '';
                        const stipend = record.Stipend || '';
                        const education = record.Education || '';
                        const eligibility = record.Eligibility || '';
                        const deadline = record['Application Deadline'] || '';
                        
                        if (programName && programName.trim() && programName !== 'Program Name') {
                            const opportunity = {
                                title: programName.trim(),
                                description: description || `${programName} - Summer health professions and research program`,
                                category: 'Research & Health Sciences',
                                location: state || 'Various',
                                applicationUrl: `https://www.google.com/search?q=${encodeURIComponent(programName + ' application')}`,
                                deadline: deadline || 'Check program website',
                                eligibility: eligibility || 'Undergraduate students',
                                cost: fee === 'no' ? 'Free' : (fee || 'Contact program'),
                                stipend: stipend || 'Not specified',
                                source: 'Summer Enrichment Program CSV'
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
        console.error('Error reading CSV file:', error);
        return [];
    }
}

// Manually add known opportunities from PDF content we've seen
function addManualPdfOpportunities() {
    console.log('Adding manually extracted PDF opportunities...');
    
    // From High School Summer Programs PDF content we read earlier
    const pdfOpportunities = [
        {
            title: "American University Pre-College Program",
            description: "Take advantage of the opportunity to learn professional skills from American University's expert faculty! Use Washington, DC as your classroom and laboratory for experiential learning courses in communication, international studies, and politics.",
            category: "Academic Program",
            location: "Washington, DC",
            applicationUrl: "https://www.american.edu/spexs/summer-programs/",
            deadline: "Check program website",
            eligibility: "Grades 9-12",
            cost: "Contact program",
            source: "High School Summer Programs PDF"
        },
        {
            title: "Babson College Summer Study",
            description: "Residential program for rising high school juniors and seniors that gives you real-world experience while building your business knowledge and entrepreneurial skills.",
            category: "Business & Entrepreneurship",
            location: "Wellesley, MA",
            applicationUrl: "https://www.babson.edu/academics/undergraduate-school/pre-college-programs/",
            deadline: "Check program website",
            eligibility: "Grades 10-11",
            cost: "Contact program",
            source: "High School Summer Programs PDF"
        },
        {
            title: "Boston University Summer Programs",
            description: "Portfolio of exciting and challenging summer high school programs. Each program offers the opportunity to explore new subjects and college life while making friends with fellow students from 50 states and 87 countries.",
            category: "Academic Program",
            location: "Boston, MA",
            applicationUrl: "https://www.bu.edu/summer/high-school-programs/",
            deadline: "Check program website",
            eligibility: "Grades 9-12",
            cost: "Contact program",
            source: "High School Summer Programs PDF"
        },
        {
            title: "Brown University Pre-College Programs",
            description: "Experience college, prepare for academic success, and make new friends from around the world. Multiple sessions 1-7 weeks in length, and more than 300 courses to choose from – on campus, online, and abroad.",
            category: "Academic Program",
            location: "Providence, RI",
            applicationUrl: "https://precollege.brown.edu/",
            deadline: "Check program website",
            eligibility: "Grades 9-12",
            cost: "Contact program",
            source: "High School Summer Programs PDF"
        },
        {
            title: "UCLA Summer Programs",
            description: "UCLA opens its door to high school students and invites you to come and study in a welcoming environment that appreciates diversity and global perspectives.",
            category: "Academic Program",
            location: "Los Angeles, CA",
            applicationUrl: "https://www.summer.ucla.edu/",
            deadline: "Check program website",
            eligibility: "Grades 9-12",
            cost: "Contact program",
            source: "High School Summer Programs PDF"
        },
        {
            title: "UCLA Game Lab Summer Institute",
            description: "Introduces high school students to game-making as a form of artistic practice, teaching techniques and tools to develop analog and digital games that reflect their own creative voice and vision.",
            category: "Technology & Gaming",
            location: "Los Angeles, CA",
            applicationUrl: "https://games.ucla.edu/programs/summer-institute/",
            deadline: "Check program website",
            eligibility: "Grades 9-12",
            cost: "Contact program",
            source: "High School Summer Programs PDF"
        },
        {
            title: "Carnegie Mellon University Pre-College",
            description: "Summer Pre-College programs show you what life at Carnegie Mellon is all about - from the classroom to weekends. Meet people from all over the world, be inspired by world-renowned faculty.",
            category: "Academic Program",
            location: "Pittsburgh, PA",
            applicationUrl: "https://www.cmu.edu/enrollment/pre-college/",
            deadline: "Check program website",
            eligibility: "Grades 10-11",
            cost: "Contact program",
            source: "High School Summer Programs PDF"
        },
        {
            title: "Columbia University Summer High School Program",
            description: "Take intensive courses especially designed for outstanding high school students, attend Columbia University classes with undergraduate students, or live and study in Barcelona or Jordan.",
            category: "Academic Program",
            location: "New York, NY",
            applicationUrl: "https://www.ce.columbia.edu/high-school",
            deadline: "Check program website",
            eligibility: "Grades 9-12",
            cost: "Contact program",
            source: "High School Summer Programs PDF"
        },
        {
            title: "Cornell University Summer College",
            description: "Award-winning Summer College Programs offer talented high school students the opportunity to study at Cornell for three or six weeks, earn college credits, explore careers and majors.",
            category: "Academic Program",
            location: "Ithaca, NY",
            applicationUrl: "https://www.sce.cornell.edu/precollege/",
            deadline: "Check program website",
            eligibility: "Grades 10-12",
            cost: "Contact program",
            source: "High School Summer Programs PDF"
        },
        {
            title: "Harvard University Summer Programs",
            description: "Summer programs designed to prepare you for that all-important next step—both academically and socially—paving the way for a successful college experience in Boston.",
            category: "Academic Program",
            location: "Cambridge, MA",
            applicationUrl: "https://www.summer.harvard.edu/high-school-programs",
            deadline: "Check program website",
            eligibility: "Ages 15-18",
            cost: "Contact program",
            source: "High School Summer Programs PDF"
        },
        {
            title: "Johns Hopkins Center for Talented Youth",
            description: "CTY's summer programs offer bright students the opportunity to engage in challenging academic work in the company of peers who share their exceptional abilities and love of learning.",
            category: "Academic Program",
            location: "Various",
            applicationUrl: "https://cty.jhu.edu/programs/summer/",
            deadline: "Check program website",
            eligibility: "Grades 9-12",
            cost: "Contact program",
            source: "High School Summer Programs PDF"
        }
    ];
    
    // From Summer Programs and Opportunities PDF
    const summerProgramsOpportunities = [
        {
            title: "MIT Summer Programs",
            description: "General Summer Programs for high school students offering exciting opportunities in science, technology, engineering, and mathematics.",
            category: "STEM",
            location: "Cambridge, MA",
            applicationUrl: "http://esp.mit.edu/learn/index.html",
            deadline: "Check program website",
            eligibility: "High school students",
            cost: "Contact program",
            source: "Summer Programs and Opportunities PDF"
        },
        {
            title: "Stanford University Summer College",
            description: "Summer College program offering intensive academic opportunities and research experiences at one of the world's leading universities.",
            category: "Academic Program",
            location: "Stanford, CA",
            applicationUrl: "https://summerinstitutes.spcs.stanford.edu/",
            deadline: "Check program website",
            eligibility: "High school students",
            cost: "Contact program",
            source: "Summer Programs and Opportunities PDF"
        },
        {
            title: "Research Science Institute (RSI)",
            description: "Six-week, cost-free program designed to kick-start careers in science, mathematics, engineering, and technology research.",
            category: "Research",
            location: "Cambridge, MA",
            applicationUrl: "http://www.cee.org/programs/rsi",
            deadline: "Check program website",
            eligibility: "High school students",
            cost: "Free",
            source: "Summer Programs and Opportunities PDF"
        },
        {
            title: "NASA High School Aerospace Scholars",
            description: "Interactive online learning experience highlighted by a six-day internship where students interact with engineers at NASA Johnson Space Center.",
            category: "STEM",
            location: "Houston, TX",
            applicationUrl: "http://aerospacescholars.jsc.nasa.gov/abouthas.htm",
            deadline: "Check program website",
            eligibility: "High school juniors (age 16+)",
            cost: "Free",
            source: "Ivy Planners PDF"
        },
        {
            title: "Telluride Association Summer Program (TASP)",
            description: "Six-week educational experience for high school juniors offering challenges and rewards rarely encountered in secondary school or college (all expenses paid).",
            category: "Leadership",
            location: "Various",
            applicationUrl: "http://www.tellurideassociation.org/programs/high_school_students/tasp/",
            deadline: "Check program website",
            eligibility: "High school juniors",
            cost: "Free",
            source: "Ivy Planners PDF"
        },
        {
            title: "Bank of America Student Leaders",
            description: "Eight-week paid internship at a nonprofit organization plus a week-long Student Leadership Summit in Washington, DC (all expenses paid).",
            category: "Leadership",
            location: "Various",
            applicationUrl: "http://www.bankofamerica.com/neistudentleaders",
            deadline: "Check program website",
            eligibility: "High school students",
            cost: "Free + Paid internship",
            source: "Ivy Planners PDF"
        }
    ];
    
    // Add all manual opportunities
    allOpportunities.push(...pdfOpportunities);
    allOpportunities.push(...summerProgramsOpportunities);
    processedCount += pdfOpportunities.length + summerProgramsOpportunities.length;
    
    console.log(`Added ${pdfOpportunities.length + summerProgramsOpportunities.length} manual PDF opportunities`);
}

// Main execution function
async function extractRobustOpportunities() {
    console.log('=== ROBUST NEW OPPORTUNITIES EXTRACTION ===\n');
    
    // Process CSV file
    await processSummerEnrichmentCsv();
    
    // Add manual PDF opportunities
    addManualPdfOpportunities();
    
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
    fs.writeFileSync('robust-new-opportunities.json', JSON.stringify(uniqueOpportunities, null, 2));
    console.log('Saved to: robust-new-opportunities.json');
    
    // Show sample
    console.log('\n=== SAMPLE OPPORTUNITIES ===');
    uniqueOpportunities.slice(0, 10).forEach((opp, index) => {
        console.log(`${index + 1}. ${opp.title}`);
        console.log(`   Category: ${opp.category}`);
        console.log(`   Location: ${opp.location}`);
        console.log(`   Cost: ${opp.cost}`);
        console.log(`   Source: ${opp.source}\n`);
    });
    
    return uniqueOpportunities;
}

// Run the extraction
if (require.main === module) {
    extractRobustOpportunities().catch(console.error);
}

module.exports = { extractRobustOpportunities };