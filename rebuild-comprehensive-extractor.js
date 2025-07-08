// REBUILD: Advanced extraction to get ALL complete opportunities from bulletin text files
import fs from 'fs';
import path from 'path';

class RebuildComprehensiveExtractor {
  constructor() {
    this.opportunities = [];
    this.currentOpportunity = null;
    this.categories = new Set();
  }

  async extractAllFromBulletins() {
    console.log('🔧 REBUILD EXTRACTOR: Processing all bulletin text files...');
    
    const bulletinFiles = [
      'Pasted-Stuyvesant-Student-Opportunity-Bulletin-35L-May-23-2025-Please-note-that-in-this-Long-version-of-1751961198610_1751961198611.txt',
      'Pasted-Stuyvesant-Student-Opportunity-Bulletin-36L-May-30-2025-Please-note-that-in-this-Long-version-of-1751961208292_1751961208293.txt',
      'Pasted-Stuyvesant-Student-Opportunity-Bulletin-37S-June-6-2025-Please-note-that-in-this-Short-version-o-1751961216312_1751961216313.txt',
      'Pasted-Stuyvesant-Student-Opportunity-Bulletin-38L-June-13-2025-Please-note-that-in-this-Long-version-o-1751961225344_1751961225345.txt'
    ];

    for (const fileName of bulletinFiles) {
      const filePath = path.join('attached_assets', fileName);
      if (fs.existsSync(filePath)) {
        console.log(`📄 Processing: ${fileName}`);
        await this.extractFromSingleBulletin(filePath);
      }
    }

    // Process more bulletin files that we have
    const allFiles = fs.readdirSync('attached_assets');
    const moreBulletinFiles = allFiles.filter(file => 
      file.includes('Stuyvesant-Student-Opportunity-Bulletin') && 
      file.endsWith('.txt') && 
      !bulletinFiles.includes(file)
    );

    for (const fileName of moreBulletinFiles) {
      const filePath = path.join('attached_assets', fileName);
      console.log(`📄 Processing additional: ${fileName}`);
      await this.extractFromSingleBulletin(filePath);
    }

    console.log(`🎯 EXTRACTION COMPLETE: Found ${this.opportunities.length} opportunities`);
    console.log(`📂 Categories discovered: ${Array.from(this.categories).join(', ')}`);
    
    // Save to JSON file
    fs.writeFileSync('rebuild-comprehensive-opportunities.json', JSON.stringify(this.opportunities, null, 2));
    console.log(`💾 Saved to rebuild-comprehensive-opportunities.json`);
    
    return this.opportunities;
  }

  async extractFromSingleBulletin(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentCategory = '';
    let collectingOpportunity = false;
    let opportunityBuffer = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip header/footer content
      if (this.isHeaderFooterContent(line)) continue;
      
      // Check for category headers
      if (this.isCategoryHeader(line)) {
        // Save any accumulated opportunity
        if (opportunityBuffer.length > 0) {
          this.processOpportunityBuffer(opportunityBuffer, currentCategory);
          opportunityBuffer = [];
        }
        
        currentCategory = this.normalizeCategoryName(line);
        this.categories.add(currentCategory);
        collectingOpportunity = false;
        continue;
      }
      
      // Check for opportunity start indicators
      if (this.isOpportunityStart(line)) {
        // Save previous opportunity if exists
        if (opportunityBuffer.length > 0) {
          this.processOpportunityBuffer(opportunityBuffer, currentCategory);
        }
        
        opportunityBuffer = [line];
        collectingOpportunity = true;
        continue;
      }
      
      // If we're collecting an opportunity, add to buffer
      if (collectingOpportunity && this.isOpportunityContent(line)) {
        opportunityBuffer.push(line);
        
        // Check if this line indicates end of opportunity
        if (this.isOpportunityEnd(line)) {
          this.processOpportunityBuffer(opportunityBuffer, currentCategory);
          opportunityBuffer = [];
          collectingOpportunity = false;
        }
      }
    }
    
    // Process any remaining opportunity
    if (opportunityBuffer.length > 0) {
      this.processOpportunityBuffer(opportunityBuffer, currentCategory);
    }
  }

  isHeaderFooterContent(line) {
    const headerFooterPatterns = [
      /stuyvesant student opportunity bulletin/i,
      /please note that in this/i,
      /long version of/i,
      /short version of/i,
      /table of contents/i,
      /page \d+ of \d+/i,
      /^\d+\/\d+\/\d+$/,
      /^Bulletin \d+/i
    ];
    
    return headerFooterPatterns.some(pattern => pattern.test(line));
  }

  isCategoryHeader(line) {
    const categoryPatterns = [
      /^[A-Z\s&]+:$/,
      /^[A-Z\s&]+\s*$/,
      /ACADEMICS/i,
      /BUSINESS/i,
      /COMMUNITY SERVICE/i,
      /LEADERSHIP/i,
      /MUSEUMS/i,
      /SCHOLARSHIPS/i,
      /STEM/i,
      /EVENTS/i,
      /JOBS/i
    ];
    
    return categoryPatterns.some(pattern => pattern.test(line)) && 
           line.length < 50 && 
           line.toUpperCase() === line;
  }

  normalizeCategoryName(line) {
    return line.replace(':', '').trim().toLowerCase().replace(/\s+/g, '_');
  }

  isOpportunityStart(line) {
    // Look for clear opportunity indicators
    const opportunityStarters = [
      /\b(program|scholarship|internship|camp|course|workshop|competition|fellowship|institute|academy)\b/i,
      /\b(university|college|school|center|foundation|organization)\b/i,
      /\b(summer|spring|fall|winter)\s+(program|course|opportunity)/i,
      /\b(paid|free|volunteer)\s+(position|opportunity|program)/i,
      /deadline/i,
      /application/i,
      /^[A-Z][a-zA-Z\s]+:/,  // Organization names followed by colon
      /\$\d+/,  // Dollar amounts (scholarships/stipends)
      /ages?\s+\d+/i,  // Age requirements
    ];
    
    return opportunityStarters.some(pattern => pattern.test(line)) &&
           line.length > 20 &&
           !this.isHeaderFooterContent(line);
  }

  isOpportunityContent(line) {
    // Skip obvious non-content
    if (line.length < 10) return false;
    if (this.isHeaderFooterContent(line)) return false;
    if (this.isCategoryHeader(line)) return false;
    
    return true;
  }

  isOpportunityEnd(line) {
    const endPatterns = [
      /deadline/i,
      /contact.*for.*info/i,
      /visit.*website/i,
      /application.*due/i,
      /\bapply\s+(by|before)/i,
      /cost.*\$/i,
      /tuition.*\$/i
    ];
    
    return endPatterns.some(pattern => pattern.test(line));
  }

  processOpportunityBuffer(buffer, category) {
    if (buffer.length < 2) return; // Skip very short entries
    
    const fullText = buffer.join(' ').trim();
    
    // Extract key information
    const opportunity = this.parseOpportunityText(fullText, category);
    
    if (opportunity && opportunity.title && opportunity.title.length > 10) {
      this.opportunities.push(opportunity);
    }
  }

  parseOpportunityText(text, category) {
    // Extract title (usually first meaningful phrase)
    let title = this.extractTitle(text);
    if (!title || title.length < 10) return null;
    
    // Extract organization
    const organization = this.extractOrganization(text);
    
    // Extract deadline
    const deadline = this.extractDeadline(text);
    
    // Extract cost information
    const cost = this.extractCost(text);
    
    // Extract requirements/eligibility
    const requirements = this.extractRequirements(text);
    
    // Determine type based on content
    const type = this.determineType(text, category);
    
    // Generate description
    const description = this.generateDescription(text, title);
    
    // Generate tags
    const tags = this.generateTags(text, category);
    
    return {
      title: this.cleanTitle(title),
      organization: organization,
      type: type,
      description: description,
      source: 'Stuyvesant Student Opportunity Bulletin',
      location: this.extractLocation(text),
      link: this.extractLink(text),
      deadline: deadline,
      cost: cost,
      requirements: requirements,
      tags: tags,
      category: category
    };
  }

  extractTitle(text) {
    // Look for organization names or program names
    const titlePatterns = [
      /([A-Z][a-zA-Z\s&]+(?:University|College|Institute|Academy|Center|Foundation|Program|Scholarship|Fellowship|Competition|Camp|Course|Workshop))/,
      /([A-Z][a-zA-Z\s&]+(?:Summer|Spring|Fall|Winter)\s+\w+)/,
      /([\w\s]+(?:Program|Scholarship|Fellowship|Competition|Internship|Course|Workshop|Camp|Institute))/i,
      /^([A-Z][^.!?]*?)(?:\.|:|\s-\s)/,
    ];
    
    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length > 10 && match[1].length < 100) {
        return match[1].trim();
      }
    }
    
    // Fallback: use first 50 characters
    const words = text.split(' ').slice(0, 8);
    return words.join(' ').substring(0, 80);
  }

  extractOrganization(text) {
    const orgPatterns = [
      /([A-Z][a-zA-Z\s]+(?:University|College|Institute|Academy|Center|Foundation|Museum|Library|Hospital|School))/,
      /(Columbia|Harvard|Yale|Princeton|MIT|Cornell|NYU|CUNY|Brooklyn|Queens|Manhattan)/i,
      /(Department of|Ministry of|Office of|Bureau of)\s+[\w\s]+/i,
    ];
    
    for (const pattern of orgPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'Educational Institution';
  }

  extractDeadline(text) {
    const deadlinePatterns = [
      /deadline:?\s*([^.!?]+)/i,
      /due:?\s*([^.!?]+)/i,
      /apply\s+by:?\s*([^.!?]+)/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d+/i,
      /\d+\/\d+\/\d+/,
      /(spring|summer|fall|winter)\s+\d{4}/i
    ];
    
    for (const pattern of deadlinePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'Rolling';
  }

  extractCost(text) {
    const costPatterns = [
      /\$[\d,]+/,
      /free/i,
      /no cost/i,
      /paid/i,
      /stipend/i,
      /tuition/i,
      /scholarship/i
    ];
    
    for (const pattern of costPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return 'Contact for details';
  }

  extractRequirements(text) {
    const reqPatterns = [
      /(?:ages?|grade|year)\s+(\d+[-\d\s,and]+)/i,
      /(\d+th|\d+st|\d+nd|\d+rd)\s+grade/i,
      /(sophomore|junior|senior|freshman)/i,
      /(undergraduate|graduate|high school)/i
    ];
    
    const requirements = [];
    for (const pattern of reqPatterns) {
      const match = text.match(pattern);
      if (match && match[0]) {
        requirements.push(match[0].trim());
      }
    }
    
    return requirements;
  }

  extractLocation(text) {
    const locationPatterns = [
      /(New York|Manhattan|Brooklyn|Queens|Bronx|Staten Island)/i,
      /(virtual|online)/i,
      /([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/,
      /(Columbia|Harvard|Yale|Princeton|MIT|Cornell)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'New York, NY';
  }

  extractLink(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/;
    const match = text.match(urlPattern);
    return match ? match[1] : '';
  }

  determineType(text, category) {
    if (/scholarship|grant|award/i.test(text)) return 'scholarship';
    if (/job|employment|worker|position|paid/i.test(text)) return 'job';
    if (/competition|contest|challenge/i.test(text)) return 'competition';
    if (/grant|funding|research/i.test(text)) return 'grant';
    return 'internship';
  }

  generateDescription(text, title) {
    // Create a meaningful description from the text
    let description = text.replace(title, '').trim();
    
    // Clean up the description
    description = description.replace(/\s+/g, ' ');
    description = description.substring(0, 300);
    
    if (description.length < 50) {
      description = `${title} - High-quality opportunity extracted from Stuyvesant Student Opportunity Bulletin with comprehensive details available.`;
    }
    
    // Ensure it ends with a period
    if (!description.endsWith('.') && !description.endsWith('!') && !description.endsWith('?')) {
      description += '.';
    }
    
    return description;
  }

  generateTags(text, category) {
    const tagWords = [
      'stem', 'science', 'technology', 'engineering', 'math', 'biology', 'chemistry', 'physics',
      'computer', 'programming', 'coding', 'ai', 'artificial', 'intelligence', 'machine', 'learning',
      'medical', 'health', 'hospital', 'research', 'laboratory', 'clinical',
      'arts', 'music', 'theater', 'dance', 'creative', 'design', 'visual',
      'business', 'finance', 'economics', 'marketing', 'entrepreneurship',
      'leadership', 'management', 'mentorship', 'volunteer', 'community', 'service',
      'summer', 'spring', 'fall', 'winter', 'camp', 'program', 'course',
      'free', 'paid', 'scholarship', 'internship', 'job', 'competition',
      'virtual', 'online', 'remote', 'in-person', 'nyc', 'manhattan', 'brooklyn', 'queens'
    ];
    
    const tags = [];
    const lowerText = text.toLowerCase();
    
    for (const word of tagWords) {
      if (lowerText.includes(word)) {
        tags.push(word);
      }
    }
    
    // Add category as tag
    if (category) {
      tags.push(category.replace('_', '-'));
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  cleanTitle(title) {
    // Clean up title
    title = title.replace(/[^\w\s\-&'(),]/g, ' ');
    title = title.replace(/\s+/g, ' ');
    title = title.trim();
    
    // Capitalize properly
    return title.charAt(0).toUpperCase() + title.slice(1);
  }
}

// Run the extraction
async function runRebuildExtraction() {
  const extractor = new RebuildComprehensiveExtractor();
  const opportunities = await extractor.extractAllFromBulletins();
  
  console.log(`🎊 REBUILD EXTRACTION COMPLETE: ${opportunities.length} opportunities extracted`);
  console.log('📋 Sample opportunities:');
  opportunities.slice(0, 5).forEach((opp, i) => {
    console.log(`${i+1}. ${opp.title} (${opp.organization})`);
  });
}

runRebuildExtraction().catch(console.error);