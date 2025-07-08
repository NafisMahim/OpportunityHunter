import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class StuyvesantOpportunityParser {
  constructor() {
    this.opportunities = [];
    this.currentOpportunity = null;
    this.currentField = null;
    this.debugMode = false;
  }

  parseOpportunityText(text) {
    const lines = text.split('\n');
    const opportunities = [];
    let currentOpp = null;
    let currentSection = null;
    let collectingContent = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and headers
      if (!line || line.includes('Stuyvesant Student Opportunity Bulletin') || 
          line.includes('CATEGORY TABLE OF CONTENTS') ||
          line.includes('Please note that in this') ||
          line.includes('TomorrowToday')) {
        continue;
      }
      
      // Detect section headers
      if (line.includes('EVENTS OF INTEREST') || 
          line.includes('ACADEMIC PROGRAMS') ||
          line.includes('BUSINESS & JOBS') ||
          line.includes('COMMUNITY SERVICE') ||
          line.includes('COLLEGE PREP') ||
          line.includes('LEADERSHIP, GOVERNMENT') ||
          line.includes('MUSEUMS & ART') ||
          line.includes('PARKS/NATURE') ||
          line.includes('STEM OPPORTUNITIES') ||
          line.includes('THEATER, WRITING, MUSIC') ||
          line.includes('CONTESTS & COMPETITIONS') ||
          line.includes('SCHOLARSHIPS')) {
        currentSection = line;
        collectingContent = true;
        continue;
      }
      
      // Look for "New:" pattern to start new opportunity
      if (line.startsWith('New:') || line.includes('New:')) {
        if (currentOpp) {
          opportunities.push(currentOpp);
        }
        
        currentOpp = {
          title: line.replace(/^New:\s*/, '').trim(),
          description: line.replace(/^New:\s*/, '').trim(),
          eligible: '',
          date: '',
          location: '',
          cost: '',
          deadline: '',
          link: '',
          section: currentSection || 'General',
          source: 'Stuyvesant Student Opportunity Bulletin'
        };
        continue;
      }
      
      // Look for other field patterns
      if (currentOpp) {
        if (line.startsWith('Eligible:') || line.includes('Eligible:')) {
          currentOpp.eligible = line.replace(/^.*Eligible:\s*/, '').trim();
        } else if (line.startsWith('Date:') || line.includes('Date:')) {
          currentOpp.date = line.replace(/^.*Date:\s*/, '').trim();
        } else if (line.startsWith('Location:') || line.includes('Location:')) {
          currentOpp.location = line.replace(/^.*Location:\s*/, '').trim();
        } else if (line.startsWith('Cost:') || line.includes('Cost:')) {
          currentOpp.cost = line.replace(/^.*Cost:\s*/, '').trim();
        } else if (line.startsWith('Application deadline:') || line.includes('Application deadline:')) {
          currentOpp.deadline = line.replace(/^.*Application deadline:\s*/, '').trim();
        } else if (line.startsWith('Link:') || line.includes('Link:') || line.startsWith('http')) {
          let linkText = line.replace(/^.*Link:\s*/, '').trim();
          if (line.startsWith('http')) linkText = line.trim();
          currentOpp.link = linkText;
        }
        // If it's content without a field marker, add to description
        else if (collectingContent && line.length > 10 && !line.includes('Questions, suggestions')) {
          if (currentOpp.description !== currentOpp.title) {
            currentOpp.description += ' ' + line;
          } else {
            currentOpp.description = line;
          }
        }
      }
    }
    
    // Add the last opportunity
    if (currentOpp) {
      opportunities.push(currentOpp);
    }
    
    return opportunities;
  }

  async parseAllFiles() {
    const attachedAssetsDir = path.join(__dirname, 'attached_assets');
    const files = await fs.readdir(attachedAssetsDir);
    
    // Filter for SOB (Student Opportunity Bulletin) CSV files
    const sobFiles = files.filter(file => 
      file.toLowerCase().includes('sob-') && file.toLowerCase().endsWith('.csv')
    );
    
    console.log(`Found ${sobFiles.length} Stuyvesant Opportunity Bulletin files to parse:`);
    sobFiles.forEach(file => console.log(`  - ${file}`));
    
    let allOpportunities = [];
    
    for (const fileName of sobFiles) {
      const filePath = path.join(attachedAssetsDir, fileName);
      console.log(`\n📄 Processing: ${fileName}`);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const opportunities = this.parseOpportunityText(content);
        
        // Add metadata
        opportunities.forEach(opp => {
          opp.bulletinDate = this.extractDateFromFilename(fileName);
          opp.bulletinNumber = this.extractBulletinNumber(fileName);
        });
        
        console.log(`   ✓ Extracted ${opportunities.length} opportunities`);
        allOpportunities = allOpportunities.concat(opportunities);
        
        // Show sample opportunities
        if (opportunities.length > 0) {
          console.log(`   Sample: "${opportunities[0].title.substring(0, 60)}..."`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing ${fileName}:`, error.message);
      }
    }
    
    console.log(`\n🎯 TOTAL EXTRACTED: ${allOpportunities.length} opportunities from ${sobFiles.length} bulletins`);
    
    // Save to JSON file
    const outputPath = path.join(__dirname, 'extracted_stuyvesant_opportunities.json');
    await fs.writeFile(outputPath, JSON.stringify(allOpportunities, null, 2));
    console.log(`💾 Saved all opportunities to: ${outputPath}`);
    
    return allOpportunities;
  }
  
  extractDateFromFilename(filename) {
    const match = filename.match(/(\w+)-(\d+)-(\d{4})/);
    if (match) {
      return `${match[1]} ${match[2]}, ${match[3]}`;
    }
    return 'Date not specified';
  }
  
  extractBulletinNumber(filename) {
    const match = filename.match(/SOB-(\d+)/i);
    return match ? `#${match[1]}` : 'Unknown';
  }
}

// Run the parser
const parser = new StuyvesantOpportunityParser();
parser.parseAllFiles().then(opportunities => {
  console.log('\n🚀 PARSING COMPLETE!');
  console.log(`Total opportunities found: ${opportunities.length}`);
  
  // Show breakdown by section
  const sections = {};
  opportunities.forEach(opp => {
    if (!sections[opp.section]) sections[opp.section] = 0;
    sections[opp.section]++;
  });
  
  console.log('\n📊 Breakdown by section:');
  Object.entries(sections).forEach(([section, count]) => {
    console.log(`  ${section}: ${count} opportunities`);
  });
  
}).catch(error => {
  console.error('❌ Parser failed:', error);
});