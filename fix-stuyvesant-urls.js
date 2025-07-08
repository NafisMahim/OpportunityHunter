import axios from 'axios';
import fs from 'fs';
import path from 'path';

// List of the 12 CSV files we want to process
const csvFiles = [
  'SOB-1-September-8_-2023_1751999306918.csv',
  'SOB-2L-September-15_-2023-_1751999306921.csv',
  'SOB-3L-September-22_-2023-_1__1751999306921.csv',
  'SOB-4L-September-29_-2023_1751999306921.csv',
  'SOB-5L-October-6_-2023_1751999306922.csv',
  'SOB-6L-October-13-2023_1751999306922.csv',
  'SOB-7L-October-20_-2023_1751999306922.csv',
  'SOB-8L-October-27_-2023-_2__1751999306922.csv',
  'SOB-9L-November-3_-2023_1751999306922.csv',
  'SOB-13L-December-1_-2023-_2__1751999306922.csv',
  'SOB-14L-December-8_-2023_1751999306922.csv',
  'SOB-15L-December-15_-2023_1751999306922.csv'
];

function parseStuyvesantContent(content, fileName) {
  const opportunities = [];
  const lines = content.split('\n');
  
  let currentOpp = null;
  let collectingDescription = false;
  let currentSection = 'General Opportunities';
  
  for (let i = 0; i < lines.length; i++) {
    const cleanLine = lines[i].replace(/"/g, '').trim();
    
    if (!cleanLine) continue;
    
    // Detect section headers
    if (cleanLine.includes('EVENTS OF INTEREST') || cleanLine.includes('ACADEMIC PROGRAMS') ||
        cleanLine.includes('BUSINESS & JOBS') || cleanLine.includes('COMMUNITY SERVICE') ||
        cleanLine.includes('COLLEGE PREP') || cleanLine.includes('LEADERSHIP, GOVERNMENT') ||
        cleanLine.includes('MUSEUMS & ART') || cleanLine.includes('PARKS/NATURE') ||
        cleanLine.includes('STEM OPPORTUNITIES') || cleanLine.includes('THEATER, WRITING, MUSIC') ||
        cleanLine.includes('CONTESTS & COMPETITIONS') || cleanLine.includes('SCHOLARSHIPS') ||
        cleanLine.includes('OPPORTUNITY LISTS')) {
      currentSection = cleanLine;
      continue;
    }
    
    // Look for "New:" OR "Deadline Approaching:" to start new opportunity
    if (cleanLine.startsWith('New:') || cleanLine.startsWith('Deadline Approaching:')) {
      // Save previous opportunity
      if (currentOpp && currentOpp.title && currentOpp.title.length > 3) {
        opportunities.push(currentOpp);
      }
      
      // Extract title
      let title = cleanLine.replace(/^(New:|Deadline Approaching:)\s*/, '').trim();
      
      // Start new opportunity
      currentOpp = {
        title: title,
        description: '',
        eligible: '',
        dates: '',
        location: '',
        cost: '',
        deadline: '',
        links: []
      };
      collectingDescription = true;
      continue;
    }
    
    // Parse structured fields for current opportunity
    if (currentOpp) {
      if (cleanLine.startsWith('Eligible:')) {
        currentOpp.eligible = cleanLine.replace('Eligible:', '').trim();
        collectingDescription = false;
      } else if (cleanLine.startsWith('Dates:') || cleanLine.startsWith('Date:')) {
        currentOpp.dates = cleanLine.replace(/^(Dates?:)/, '').trim();
        collectingDescription = false;
      } else if (cleanLine.startsWith('Location:')) {
        currentOpp.location = cleanLine.replace('Location:', '').trim();
        collectingDescription = false;
      } else if (cleanLine.startsWith('Cost:') || cleanLine.startsWith('Costs:')) {
        currentOpp.cost = cleanLine.replace(/^(Costs?:)/, '').trim();
        collectingDescription = false;
      } else if (cleanLine.startsWith('Application Deadline:') || cleanLine.startsWith('Application Deadlines:')) {
        currentOpp.deadline = cleanLine.replace(/^Application Deadlines?:/, '').trim();
        collectingDescription = false;
      } else if (cleanLine.startsWith('Links:') || cleanLine.startsWith('Link:')) {
        const linkText = cleanLine.replace(/^Links?:/, '').trim();
        if (linkText) {
          currentOpp.links.push(linkText);
        }
        collectingDescription = false;
      } else if (cleanLine.startsWith('http')) {
        // Standalone URL
        currentOpp.links.push(cleanLine);
        collectingDescription = false;
      } else if (!collectingDescription && cleanLine.includes('://')) {
        // Handle URLs that might be embedded in other text
        const urlMatch = cleanLine.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch && currentOpp.links) {
          currentOpp.links.push(urlMatch[1]);
        }
      } else if (collectingDescription && cleanLine.length > 15 && 
                !cleanLine.includes('Questions, suggestions') && 
                !cleanLine.includes('CATEGORY TABLE') &&
                !cleanLine.includes('TomorrowToday') &&
                !cleanLine.includes('Stuyvesant Student Opportunity Bulletin')) {
        // Add to description if we're still collecting content
        if (currentOpp.description) {
          currentOpp.description += ' ' + cleanLine;
        } else {
          currentOpp.description = cleanLine;
        }
      }
    }
  }
  
  // Don't forget the last opportunity
  if (currentOpp && currentOpp.title && currentOpp.title.length > 3) {
    opportunities.push(currentOpp);
  }
  
  return opportunities;
}

async function fixStuyvesantURLs() {
  console.log('🔧 Fixing URLs for Stuyvesant opportunities...');
  
  try {
    // Get all opportunities from the API
    const response = await axios.get('http://localhost:5000/api/opportunities');
    const opportunities = response.data;
    
    console.log(`Found ${opportunities.length} total opportunities`);
    
    // Filter for Stuyvesant opportunities with null URLs
    const stuyvesantOpps = opportunities.filter(opp => 
      opp.source && opp.source.includes('Stuyvesant') && 
      (!opp.applicationUrl || opp.applicationUrl === 'null' || opp.applicationUrl === null)
    );
    
    console.log(`Found ${stuyvesantOpps.length} Stuyvesant opportunities with null URLs`);
    
    // Create a mapping of title to URL by parsing the CSV files
    const titleToUrl = {};
    
    for (const csvFile of csvFiles) {
      const filePath = path.join('attached_assets', csvFile);
      if (fs.existsSync(filePath)) {
        console.log(`📄 Processing ${csvFile}...`);
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsedOpps = parseStuyvesantContent(content, csvFile);
        
        for (const opp of parsedOpps) {
          if (opp.links && opp.links.length > 0) {
            titleToUrl[opp.title] = opp.links[0];
          }
        }
      }
    }
    
    console.log(`Extracted ${Object.keys(titleToUrl).length} title-to-URL mappings`);
    
    // Fix URLs for matching opportunities
    let fixedCount = 0;
    
    for (const opp of stuyvesantOpps) {
      const matchingUrl = titleToUrl[opp.title];
      
      if (matchingUrl) {
        try {
          // Update the opportunity via API
          await axios.patch(`http://localhost:5000/api/opportunities/${opp.id}`, {
            applicationUrl: matchingUrl
          });
          
          console.log(`✅ Fixed URL for: ${opp.title}`);
          fixedCount++;
        } catch (error) {
          console.log(`❌ Failed to fix URL for ${opp.title}: ${error.message}`);
        }
      } else {
        // Use Google search as fallback
        const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(opp.title)}`;
        try {
          await axios.patch(`http://localhost:5000/api/opportunities/${opp.id}`, {
            applicationUrl: googleUrl
          });
          
          console.log(`🔍 Added Google search URL for: ${opp.title}`);
          fixedCount++;
        } catch (error) {
          console.log(`❌ Failed to add Google URL for ${opp.title}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n📊 RESULTS:`);
    console.log(`✅ Fixed URLs: ${fixedCount}`);
    console.log(`🔍 Google search fallbacks: ${fixedCount - Object.keys(titleToUrl).length}`);
    console.log(`📈 Success Rate: ${((fixedCount / stuyvesantOpps.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Error fixing URLs:', error);
  }
}

fixStuyvesantURLs();