const fs = require('fs');
const path = require('path');
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { opportunities } = require('./shared/schema');
const { eq } = require('drizzle-orm');

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

class ComprehensiveDataImporter {
  constructor() {
    this.importedCount = 0;
    this.duplicateCount = 0;
    this.totalProcessed = 0;
  }

  // Parse the Python/CS structured TXT files with proper CSV format
  parseStructuredTXT(content) {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = this.parseCSVLine(lines[0]);
    const opportunities = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length >= 8) { // Must have all required fields
        const opp = {
          title: values[0]?.trim() || '',
          description: values[1]?.trim() || '',
          eligibility: values[2]?.trim() || '',
          cost: values[3]?.trim() || '',
          location: values[4]?.trim() || '',
          categories: values[5]?.trim() || '',
          major: values[6]?.trim() || '',
          deadline: values[7]?.trim() || '',
          url: values[8]?.trim() || ''
        };
        
        if (opp.title && opp.url) {
          opportunities.push(opp);
        }
      }
    }
    
    return opportunities;
  }

  // Parse CSV line with proper quote handling
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result.map(field => field.replace(/^"|"$/g, '').trim());
  }

  // Parse Free Summer Programs CSV format
  parseFreeSummerPrograms(content) {
    const lines = content.split('\n').filter(line => line.trim() && !line.includes('Program Overview'));
    const opportunities = [];
    
    for (const line of lines) {
      if (line.includes('Link') && line.length > 50) {
        const fields = this.parseCSVLine(line);
        if (fields.length >= 3) {
          const title = fields[0]?.replace(/"/g, '').trim();
          if (title && title !== 'Program' && !title.includes('Grade Level')) {
            opportunities.push({
              title: title,
              description: this.extractDescription(fields),
              eligibility: this.extractEligibility(fields),
              cost: 'Free',
              location: this.extractLocation(fields),
              categories: this.extractCategories(fields),
              major: this.extractMajor(title),
              deadline: this.extractDeadline(fields),
              url: this.generatePlaceholderURL(title)
            });
          }
        }
      }
    }
    
    return opportunities;
  }

  // Parse Ocean Opportunities - extract lesson plans as educational opportunities
  parseOceanOpportunities(content) {
    const lines = content.split('\n');
    const opportunities = [];
    let currentTitle = '';
    let currentDescription = '';
    let currentSource = '';
    let currentGradeLevel = '';
    let currentURL = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line && !line.includes('"') && !line.includes('Source:') && !line.includes('Grade Level:') && !line.includes('Go to:') && !line.includes('Lesson Summary:')) {
        // This is likely a title
        if (currentTitle && currentURL) {
          // Save previous opportunity
          opportunities.push({
            title: currentTitle,
            description: currentDescription,
            eligibility: currentGradeLevel,
            cost: 'Free',
            location: 'Online/Educational Resource',
            categories: 'Educational Resource, Ocean Science',
            major: 'Marine Science, Ocean Studies, Environmental Science',
            deadline: 'Ongoing',
            url: currentURL
          });
        }
        currentTitle = line;
        currentDescription = '';
        currentSource = '';
        currentGradeLevel = '';
        currentURL = '';
      } else if (line.includes('Source:')) {
        currentSource = line.replace('Source:', '').trim();
      } else if (line.includes('Lesson Summary:')) {
        currentDescription = line.replace('Lesson Summary:', '').trim();
      } else if (line.includes('Grade Level:')) {
        currentGradeLevel = line.replace('Grade Level:', '').trim();
      } else if (line.includes('Go to:')) {
        currentURL = line.replace('Go to:', '').trim();
        if (currentURL.includes(' or ')) {
          currentURL = currentURL.split(' or ')[0].trim();
        }
      }
    }
    
    // Don't forget the last opportunity
    if (currentTitle && currentURL) {
      opportunities.push({
        title: currentTitle,
        description: currentDescription,
        eligibility: currentGradeLevel,
        cost: 'Free',
        location: 'Online/Educational Resource',
        categories: 'Educational Resource, Ocean Science',
        major: 'Marine Science, Ocean Studies, Environmental Science',
        deadline: 'Ongoing',
        url: currentURL
      });
    }
    
    return opportunities.filter(opp => opp.title && opp.url && opp.url.startsWith('http'));
  }

  extractDescription(fields) {
    // Look for descriptive text in fields
    for (const field of fields) {
      if (field && field.length > 20 && !field.includes('Link') && !field.includes('current')) {
        return field.trim();
      }
    }
    return 'Educational program or opportunity for high school students';
  }

  extractEligibility(fields) {
    for (const field of fields) {
      if (field && (field.includes('current') || field.includes('high school') || field.includes('student'))) {
        return field.trim();
      }
    }
    return 'High school students';
  }

  extractLocation(fields) {
    for (const field of fields) {
      if (field && (field.includes('University') || field.includes('College') || field.includes('Area') || field.includes('County'))) {
        return field.trim();
      }
    }
    return 'Various locations';
  }

  extractCategories(fields) {
    // Extract from context
    const text = fields.join(' ').toLowerCase();
    if (text.includes('research')) return 'Research Program';
    if (text.includes('business')) return 'Business Program';
    if (text.includes('cs') || text.includes('computer')) return 'Computer Science Program';
    if (text.includes('stem')) return 'STEM Program';
    return 'Academic Program';
  }

  extractMajor(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('business') || titleLower.includes('entrepreneur')) return 'Business, Entrepreneurship';
    if (titleLower.includes('computer') || titleLower.includes('cs') || titleLower.includes('coding')) return 'Computer Science';
    if (titleLower.includes('research') || titleLower.includes('science')) return 'Research, Science';
    if (titleLower.includes('engineering')) return 'Engineering';
    if (titleLower.includes('medicine') || titleLower.includes('medical')) return 'Medicine, Healthcare';
    if (titleLower.includes('math')) return 'Mathematics';
    return 'STEM, Academic Studies';
  }

  extractDeadline(fields) {
    for (const field of fields) {
      if (field && (field.includes('deadline') || field.includes('apply') || field.includes('summer'))) {
        return field.trim();
      }
    }
    return 'Check program website for dates';
  }

  generatePlaceholderURL(title) {
    // Generate search-friendly URLs for programs without direct links
    const searchTerm = encodeURIComponent(title.replace(/[^a-zA-Z0-9\s]/g, '').trim());
    return `https://www.google.com/search?q=${searchTerm}+program+application`;
  }

  async isDuplicate(title, url) {
    try {
      const existing = await db.select().from(opportunities)
        .where(eq(opportunities.title, title));
      return existing.length > 0;
    } catch (error) {
      console.error('Error checking for duplicate:', error);
      return false;
    }
  }

  async importOpportunity(oppData) {
    try {
      // Clean up the data
      const cleanData = {
        title: oppData.title?.substring(0, 500) || '',
        description: oppData.description?.substring(0, 2000) || '',
        eligibility: oppData.eligibility?.substring(0, 500) || '',
        cost: oppData.cost?.substring(0, 200) || '',
        location: oppData.location?.substring(0, 500) || '',
        organization: oppData.categories?.substring(0, 500) || '',
        type: this.determineType(oppData.categories),
        deadline: oppData.deadline?.substring(0, 500) || '',
        url: oppData.url?.substring(0, 1000) || ''
      };

      // Check for duplicates
      if (await this.isDuplicate(cleanData.title, cleanData.url)) {
        console.log(`Duplicate opportunity skipped: ${cleanData.title}`);
        this.duplicateCount++;
        return false;
      }

      // Insert into database
      await db.insert(opportunities).values(cleanData);
      console.log(`✓ Imported: ${cleanData.title}`);
      this.importedCount++;
      return true;
    } catch (error) {
      console.error(`Error importing opportunity "${oppData.title}":`, error);
      return false;
    }
  }

  determineType(categories) {
    if (!categories) return 'internship';
    const catLower = categories.toLowerCase();
    if (catLower.includes('scholarship')) return 'scholarship';
    if (catLower.includes('research')) return 'internship';
    if (catLower.includes('competition')) return 'competition';
    if (catLower.includes('program')) return 'internship';
    return 'internship';
  }

  async processFile(fileName) {
    const filePath = path.join('./attached_assets', fileName);
    console.log(`📄 Processing ${fileName}...`);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${fileName}`);
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    let opportunities = [];

    try {
      if (fileName.includes('Python-Data-Science') || fileName.includes('Computer-Science-Sum')) {
        opportunities = this.parseStructuredTXT(content);
      } else if (fileName.includes('Free-Summer-Programs')) {
        opportunities = this.parseFreeSummerPrograms(content);
      } else if (fileName.includes('OceanOpps')) {
        opportunities = this.parseOceanOpportunities(content);
      }

      console.log(`📋 Found ${opportunities.length} opportunities in ${fileName}`);
      
      // Import each opportunity
      for (const opp of opportunities) {
        await this.importOpportunity(opp);
        this.totalProcessed++;
      }

      console.log(`✅ Processed ${opportunities.length} opportunities from ${fileName}`);
      return opportunities;
    } catch (error) {
      console.error(`Error processing ${fileName}:`, error);
      return [];
    }
  }

  async importAllFiles() {
    const files = [
      'Pasted-Title-Description-Eligibility-Cost-Location-Categories-Subject-Major-Dates-Link-Python-Data-Science--1752030815257_1752030815258.txt',
      'Pasted-Title-Description-Eligibility-Cost-Location-Categories-Subject-Major-Dates-Link-Computer-Science-Sum-1752030829487_1752030829487.txt',
      'Free-Summer-Programs-Business_1752030833261.csv',
      'Free-Summer-Programs-CS_Robotics_1752030833266.csv',
      'Free-Summer-Programs-Nature_1752030833266.csv',
      'Free-Summer-Programs-Other_1752030833267.csv',
      'Free-Summer-Programs-Research_Medicine_1752030833267.csv',
      'Free-Summer-Programs-STEM_Math_1752030833267.csv',
      'OceanOpps_1752030833267.csv'
    ];

    console.log(`🚀 Starting comprehensive import of ${files.length} files...`);
    
    for (const fileName of files) {
      await this.processFile(fileName);
    }

    console.log(`🎯 Total processed: ${this.totalProcessed} opportunities from all files`);
    console.log(`🎉 Total imported: ${this.importedCount} new opportunities`);
    console.log(`🔄 Duplicates skipped: ${this.duplicateCount} opportunities`);
  }
}

async function main() {
  try {
    const importer = new ComprehensiveDataImporter();
    await importer.importAllFiles();
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}