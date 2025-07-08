const fs = require('fs');
const path = require('path');

class NewStuyvesantBulletinParser {
  constructor() {
    this.opportunities = [];
  }

  parseCSVContent(content, fileName) {
    console.log(`\n🔍 Parsing ${fileName}...`);
    
    // Clean the content and split into lines
    const lines = content.split('\n').map(line => line.replace(/"/g, '').trim()).filter(line => line.length > 0);
    
    let currentOpportunity = null;
    let inOpportunitySection = false;
    let collectingDescription = false;
    let descriptionBuffer = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for "New:" markers to start an opportunity
      if (line.startsWith('New:') || line.includes('New:')) {
        if (currentOpportunity) {
          this.finalizeOpportunity(currentOpportunity, fileName);
        }
        
        currentOpportunity = {
          title: '',
          description: '',
          eligible: '',
          date: '',
          location: '',
          cost: '',
          deadline: '',
          link: ''
        };
        
        // Extract title from "New:" line
        const newMatch = line.match(/New:\s*(.+)/);
        if (newMatch) {
          currentOpportunity.title = newMatch[1].trim();
        }
        
        inOpportunitySection = true;
        collectingDescription = true;
        descriptionBuffer = [];
        continue;
      }
      
      if (!inOpportunitySection || !currentOpportunity) continue;
      
      // Look for field markers
      if (line.startsWith('Eligible:')) {
        if (collectingDescription && descriptionBuffer.length > 0) {
          currentOpportunity.description = descriptionBuffer.join(' ').trim();
          collectingDescription = false;
        }
        currentOpportunity.eligible = line.replace('Eligible:', '').trim();
        continue;
      }
      
      if (line.startsWith('Date:') || line.startsWith('Dates:')) {
        currentOpportunity.date = line.replace(/Dates?:/, '').trim();
        continue;
      }
      
      if (line.startsWith('Location:')) {
        currentOpportunity.location = line.replace('Location:', '').trim();
        continue;
      }
      
      if (line.startsWith('Cost:')) {
        currentOpportunity.cost = line.replace('Cost:', '').trim();
        continue;
      }
      
      if (line.startsWith('Application Deadline:') || line.startsWith('Application deadline:') || line.startsWith('Deadline:')) {
        currentOpportunity.deadline = line.replace(/Application [Dd]eadline:|Deadline:/, '').trim();
        continue;
      }
      
      if (line.startsWith('Link:') || line.includes('http')) {
        // Extract URL
        const urlMatch = line.match(/(https?:\/\/[^\s,]+)/);
        if (urlMatch) {
          currentOpportunity.link = urlMatch[1];
        }
        
        // This usually marks the end of an opportunity
        this.finalizeOpportunity(currentOpportunity, fileName);
        currentOpportunity = null;
        inOpportunitySection = false;
        continue;
      }
      
      // If we're collecting description and haven't hit another field marker
      if (collectingDescription && line.length > 0 && 
          !line.startsWith('Eligible:') && 
          !line.startsWith('Date:') && 
          !line.startsWith('Location:') && 
          !line.startsWith('Cost:') && 
          !line.startsWith('Application') && 
          !line.startsWith('Link:')) {
        descriptionBuffer.push(line);
      }
    }
    
    // Finalize the last opportunity if exists
    if (currentOpportunity) {
      this.finalizeOpportunity(currentOpportunity, fileName);
    }
  }
  
  finalizeOpportunity(opportunity, fileName) {
    // Clean up the opportunity data
    if (opportunity.title && opportunity.title.length > 3) {
      // Set default link if none provided
      if (!opportunity.link || opportunity.link.trim() === '') {
        opportunity.link = `https://www.google.com/search?q=${encodeURIComponent(opportunity.title)}`;
      }
      
      // Set default values
      if (!opportunity.location) opportunity.location = 'See details';
      if (!opportunity.cost) opportunity.cost = 'See details';
      if (!opportunity.deadline) opportunity.deadline = 'See details';
      if (!opportunity.eligible) opportunity.eligible = 'High school students';
      if (!opportunity.date) opportunity.date = 'See details';
      
      // Extract bulletin number from filename for tracking
      const bulletinMatch = fileName.match(/SOB[\s-]*(\d+[LS]?)/i);
      const bulletinNumber = bulletinMatch ? bulletinMatch[1] : 'Unknown';
      
      opportunity.source = `Stuyvesant Bulletin #${bulletinNumber}`;
      opportunity.fileName = fileName;
      
      this.opportunities.push(opportunity);
      console.log(`✓ Found: ${opportunity.title}`);
    }
  }
  
  async parseAllFiles() {
    const attachedDir = './attached_assets';
    const csvFiles = fs.readdirSync(attachedDir).filter(file => 
      file.includes('SOB') && file.endsWith('.csv')
    );
    
    console.log(`📚 Found ${csvFiles.length} new Stuyvesant bulletin files to parse:`);
    csvFiles.forEach(file => console.log(`  - ${file}`));
    
    for (const fileName of csvFiles) {
      try {
        const filePath = path.join(attachedDir, fileName);
        const content = fs.readFileSync(filePath, 'utf-8');
        this.parseCSVContent(content, fileName);
      } catch (error) {
        console.error(`❌ Error parsing ${fileName}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Total opportunities extracted: ${this.opportunities.length}`);
    
    // Save to JSON file
    fs.writeFileSync('./extracted_new_stuyvesant_opportunities.json', 
      JSON.stringify(this.opportunities, null, 2));
    
    console.log(`💾 Saved all opportunities to: extracted_new_stuyvesant_opportunities.json`);
    
    return this.opportunities;
  }
}

// Run the parser
async function main() {
  const parser = new NewStuyvesantBulletinParser();
  await parser.parseAllFiles();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = NewStuyvesantBulletinParser;