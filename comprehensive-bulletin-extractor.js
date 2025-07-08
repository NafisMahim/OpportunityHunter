import fs from 'fs';
import path from 'path';

// Comprehensive Stuyvesant Bulletin Extraction System
class ComprehensiveBulletinExtractor {
  constructor() {
    this.categories = [
      'EVENTS OF INTEREST TO STUDENTS',
      'ACADEMIC PROGRAMS', 
      'BUSINESS & JOBS',
      'COMMUNITY SERVICE',
      'COLLEGE PREP',
      'LEADERSHIP, GOVERNMENT, LAW, ADVOCACY, INTERNATIONAL',
      'MUSEUMS & ART & PHOTOGRAPHY',
      'PARKS/NATURE',
      'STEM OPPORTUNITIES',
      'ENGINEERING / MATH / COMPUTER SCIENCE',
      'MEDICAL / LIFE SCIENCES',
      'THEATER, WRITING, MUSIC, PERFORMING ARTS, VIDEO',
      'CONTESTS & COMPETITIONS',
      'OPPORTUNITY LISTS AND RESOURCES',
      'SCHOLARSHIPS'
    ];
    
    this.opportunities = [];
    this.processedTitles = new Set(); // Prevent duplicates
  }

  async extractFromAllBulletins() {
    console.log('🎯 COMPREHENSIVE EXTRACTION: Processing ALL Stuyvesant Student Opportunity Bulletins...');
    
    const bulletinFiles = [
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-19L-January-17-2025-Please-note-that-in-this-Long-versio-1751961013740_1751961013741.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-20L-January-24-2025-Please-note-that-in-this-Long-versio-1751961036276_1751961036276.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-21L-January-31-2025-Please-note-that-in-this-Long-versio-1751961050867_1751961050868.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-22L-February-7-2025-Please-note-that-in-this-Long-versio-1751961061309_1751961061310.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-23L-February-14-2025-Please-note-that-in-this-Long-versi-1751961071094_1751961071095.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-24L-February-28-2025-Please-note-that-in-this-Long-versi-1751961079851_1751961079852.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-25L-March-7-2025-Please-note-that-in-this-Long-version-o-1751961096261_1751961096262.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-26L-March-14-2025-Please-note-that-in-this-Long-version--1751961108255_1751961108257.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-27L-March-21-2025-Please-note-that-in-this-Long-version--1751961127019_1751961127020.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-28L-March-28-2025-Please-note-that-in-this-Long-version--1751961137668_1751961137669.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-29L-April-4-2025-Please-note-that-in-this-Long-version-o-1751961145602_1751961145603.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-30L-April-11-2025-Please-note-that-in-this-Long-version--1751961153485_1751961153486.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-31L-April-25-2025-Please-note-that-in-this-Long-version--1751961161225_1751961161226.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-32L-May-2-2025-Please-note-that-in-this-Long-version-of--1751961168871_1751961168872.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-33L-May-9-2025-Please-note-that-in-this-Long-version-of--1751961176895_1751961176896.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-34L-May-16-2025-Please-note-that-in-this-Long-version-of-1751961186756_1751961186756.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-35L-May-23-2025-Please-note-that-in-this-Long-version-of-1751961198610_1751961198611.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-36L-May-30-2025-Please-note-that-in-this-Long-version-of-1751961208292_1751961208293.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-37S-June-6-2025-Please-note-that-in-this-Short-version-o-1751961216312_1751961216313.txt',
      'attached_assets/Pasted-Stuyvesant-Student-Opportunity-Bulletin-38L-June-13-2025-Please-note-that-in-this-Long-version-o-1751961225344_1751961225345.txt'
    ];

    for (const filePath of bulletinFiles) {
      if (fs.existsSync(filePath)) {
        console.log(`\n📖 Processing: ${path.basename(filePath)}`);
        await this.extractFromSingleBulletin(filePath);
      } else {
        console.log(`⚠️ File not found: ${filePath}`);
      }
    }

    console.log(`\n🎯 EXTRACTION COMPLETE: Found ${this.opportunities.length} total opportunities`);
    return this.opportunities;
  }

  async extractFromSingleBulletin(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentCategory = '';
    let currentOpportunity = null;
    let opportunityCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect category headers
      if (this.isCategoryHeader(line)) {
        currentCategory = this.normalizeCategoryName(line);
        console.log(`  📂 Found category: ${currentCategory}`);
        continue;
      }

      // Skip header content and table of contents
      if (this.isHeaderContent(line) || currentCategory === '') {
        continue;
      }

      // Detect opportunity titles (programs, events, etc.)
      if (this.isOpportunityTitle(line)) {
        // Save previous opportunity if exists
        if (currentOpportunity) {
          this.saveOpportunity(currentOpportunity, currentCategory);
          opportunityCount++;
        }

        // Start new opportunity
        currentOpportunity = {
          title: this.cleanTitle(line),
          description: '',
          deadline: '',
          organization: '',
          location: 'New York',
          source: 'Stuyvesant Student Opportunity Bulletin'
        };
      }
      // Collect description content
      else if (currentOpportunity && this.isDescriptionLine(line)) {
        if (currentOpportunity.description) {
          currentOpportunity.description += ' ' + line;
        } else {
          currentOpportunity.description = line;
        }
        
        // Extract deadline if found in description
        const deadline = this.extractDeadline(line);
        if (deadline && !currentOpportunity.deadline) {
          currentOpportunity.deadline = deadline;
        }
        
        // Extract organization if found
        const org = this.extractOrganization(line);
        if (org && !currentOpportunity.organization) {
          currentOpportunity.organization = org;
        }
      }
    }

    // Save final opportunity
    if (currentOpportunity) {
      this.saveOpportunity(currentOpportunity, currentCategory);
      opportunityCount++;
    }

    console.log(`  ✅ Extracted ${opportunityCount} opportunities from this bulletin`);
  }

  isCategoryHeader(line) {
    // Check for numbered category headers
    if (/^\d+\.\s*[A-Z]/.test(line)) return true;
    
    // Check for lettered subcategories
    if (/^[a-z]\.\s*[A-Z]/.test(line)) return true;
    
    // Check for all caps category names
    const upperLine = line.toUpperCase();
    return this.categories.some(cat => upperLine.includes(cat.toUpperCase()));
  }

  normalizeCategoryName(line) {
    const upperLine = line.toUpperCase();
    for (const category of this.categories) {
      if (upperLine.includes(category.toUpperCase())) {
        return category;
      }
    }
    return 'GENERAL';
  }

  isHeaderContent(line) {
    const skipPatterns = [
      /stuyvesant student opportunity bulletin/i,
      /please note that in this/i,
      /category table of contents/i,
      /download this entire pdf/i,
      /this weekly bulletin informs/i,
      /for ease of use/i,
      /please carefully note deadlines/i,
      /working papers:/i,
      /updated: the tomorrowtoday/i,
      /we encourage all students/i,
      /how should students use it/i,
      /^\d+\.\s*$/,
      /^[a-z]\.\s*$/,
      /^here are several programs/i,
      /^and here are several/i
    ];

    return skipPatterns.some(pattern => pattern.test(line));
  }

  isOpportunityTitle(line) {
    // Skip obvious non-titles
    if (line.length < 10) return false;
    if (this.isHeaderContent(line)) return false;
    if (/^https?:\/\//.test(line)) return false;
    if (/^\w+@\w+\.\w+/.test(line)) return false;
    
    // Look for program/opportunity indicators
    const titleIndicators = [
      // Program types
      /program/i, /internship/i, /fellowship/i, /scholarship/i, /competition/i,
      /institute/i, /academy/i, /center/i, /foundation/i, /initiative/i,
      /workshop/i, /seminar/i, /conference/i, /expo/i, /fair/i, /festival/i,
      
      // Organizations
      /university/i, /college/i, /museum/i, /library/i, /hospital/i,
      /nasa/i, /google/i, /microsoft/i, /columbia/i, /nyu/i, /cuny/i,
      /brooklyn/i, /queens/i, /manhattan/i, /bronx/i,
      
      // Action words
      /apply/i, /register/i, /submit/i, /deadline/i, /opportunity/i,
      /summer/i, /winter/i, /spring/i, /fall/i, /2025/i, /2026/i,
      
      // Common opportunity words
      /research/i, /volunteer/i, /career/i, /leadership/i, /science/i,
      /math/i, /engineering/i, /art/i, /writing/i, /music/i, /theater/i
    ];

    return titleIndicators.some(pattern => pattern.test(line));
  }

  isDescriptionLine(line) {
    // Skip obvious non-description content
    if (this.isHeaderContent(line)) return false;
    if (this.isCategoryHeader(line)) return false;
    if (/^https?:\/\//.test(line)) return false;
    
    // Accept most other content as potential description
    return line.length > 5;
  }

  cleanTitle(title) {
    return title
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/^[a-z]\.\s*/, '') // Remove lettering
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  extractDeadline(text) {
    const deadlinePatterns = [
      /deadline[:\s]+([^\.!?\n]+)/i,
      /due[:\s]+([^\.!?\n]+)/i,
      /apply by[:\s]+([^\.!?\n]+)/i,
      /applications due[:\s]+([^\.!?\n]+)/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}[^\w]/i,
      /\d{1,2}\/\d{1,2}\/\d{2,4}/,
      /\d{1,2}\/\d{1,2}/
    ];

    for (const pattern of deadlinePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    return '';
  }

  extractOrganization(text) {
    const orgPatterns = [
      /\b(University|College|Institute|Academy|Center|Foundation|Corporation|Company|Museum|Library|Hospital|School)\b[^\.!?\n]*/i,
      /\b(NASA|Google|Microsoft|Apple|Facebook|Amazon|Netflix|Tesla|SpaceX)\b/i,
      /\b(Columbia|NYU|CUNY|Hunter|Brooklyn|Queens|Manhattan|Bronx|Staten Island)\b[^\.!?\n]*/i,
      /\b(Stuyvesant|Stuy)\b[^\.!?\n]*/i
    ];

    for (const pattern of orgPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }
    return '';
  }

  saveOpportunity(opportunity, category) {
    // Clean and validate opportunity
    if (!opportunity.title || opportunity.title.length < 5) return;
    
    // Check for duplicates
    const normalizedTitle = this.normalizeTitle(opportunity.title);
    if (this.processedTitles.has(normalizedTitle)) return;
    
    this.processedTitles.add(normalizedTitle);
    
    // Complete the opportunity object
    const completeOpportunity = {
      title: opportunity.title,
      description: this.cleanDescription(opportunity.description),
      deadline: opportunity.deadline || 'Rolling',
      organization: opportunity.organization || this.extractOrganizationFromTitle(opportunity.title),
      location: opportunity.location,
      source: opportunity.source,
      type: this.determineType(opportunity.title, category),
      tags: this.generateTags(opportunity.title, category, opportunity.description),
      requirements: this.extractRequirements(opportunity.description),
      cost: this.extractCost(opportunity.description),
      link: '',
      category: category
    };

    this.opportunities.push(completeOpportunity);
    console.log(`    ✓ Saved: ${completeOpportunity.title}`);
  }

  normalizeTitle(title) {
    return title.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  cleanDescription(description) {
    if (!description) return 'High-quality opportunity for students. Details available upon application.';
    
    return description
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\.\,\!\?\:\;\-\(\)\[\]]/g, '')
      .trim()
      .substring(0, 500); // Limit length
  }

  extractOrganizationFromTitle(title) {
    const orgMatches = [
      /\b(University|College|Institute|Academy|Center|Foundation|Museum|Library|Hospital)\b/i,
      /\b(NASA|Google|Microsoft|Columbia|NYU|CUNY|Hunter|Brooklyn|Queens)\b/i
    ];

    for (const pattern of orgMatches) {
      const match = title.match(pattern);
      if (match) return match[0];
    }
    return 'Educational Institution';
  }

  determineType(title, category) {
    const titleLower = title.toLowerCase();
    const categoryLower = category.toLowerCase();

    if (titleLower.includes('scholarship') || categoryLower.includes('scholarship')) return 'scholarship';
    if (titleLower.includes('internship') || titleLower.includes('intern')) return 'internship';
    if (titleLower.includes('job') || titleLower.includes('employment') || categoryLower.includes('business')) return 'job';
    if (titleLower.includes('grant') || titleLower.includes('funding')) return 'grant';
    if (titleLower.includes('competition') || titleLower.includes('contest') || categoryLower.includes('competition')) return 'competition';
    
    return 'internship'; // Default for student opportunities
  }

  generateTags(title, category, description) {
    const tags = new Set();
    const text = `${title} ${category} ${description}`.toLowerCase();

    // Field-based tags
    const fieldTags = {
      'stem': ['science', 'technology', 'engineering', 'math', 'computer', 'programming', 'data', 'research'],
      'arts': ['art', 'music', 'theater', 'writing', 'creative', 'design', 'photography', 'film'],
      'business': ['business', 'entrepreneur', 'finance', 'marketing', 'management', 'startup'],
      'healthcare': ['medical', 'health', 'hospital', 'medicine', 'biology', 'nursing'],
      'education': ['teaching', 'tutor', 'education', 'academic', 'school', 'learning'],
      'government': ['government', 'policy', 'law', 'legal', 'political', 'civic', 'public'],
      'environment': ['environment', 'sustainability', 'green', 'climate', 'conservation'],
      'social': ['community', 'volunteer', 'service', 'social', 'nonprofit', 'helping']
    };

    for (const [field, keywords] of Object.entries(fieldTags)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.add(field);
      }
    }

    // Location tags
    if (text.includes('new york') || text.includes('nyc') || text.includes('manhattan') || 
        text.includes('brooklyn') || text.includes('queens') || text.includes('bronx')) {
      tags.add('new-york');
    }

    // Time tags
    if (text.includes('summer')) tags.add('summer');
    if (text.includes('remote')) tags.add('remote');
    if (text.includes('paid')) tags.add('paid');
    if (text.includes('high school')) tags.add('high-school');

    return Array.from(tags);
  }

  extractRequirements(description) {
    if (!description) return [];
    
    const requirements = [];
    const text = description.toLowerCase();
    
    if (text.includes('gpa')) requirements.push('Minimum GPA requirement');
    if (text.includes('essay')) requirements.push('Essay submission required');
    if (text.includes('transcript')) requirements.push('Official transcripts required');
    if (text.includes('recommendation')) requirements.push('Letters of recommendation required');
    if (text.includes('portfolio')) requirements.push('Portfolio submission required');
    if (text.includes('interview')) requirements.push('Interview required');
    if (text.includes('citizen')) requirements.push('U.S. citizenship required');
    
    return requirements;
  }

  extractCost(description) {
    if (!description) return 'Free';
    
    const text = description.toLowerCase();
    if (text.includes('free') || text.includes('no cost') || text.includes('paid')) return 'Free';
    if (text.includes('$')) {
      const costMatch = description.match(/\$[\d,]+/);
      if (costMatch) return costMatch[0];
    }
    return 'Contact for details';
  }
}

// Export for use
export default ComprehensiveBulletinExtractor;

// Run extraction if called directly
async function runExtraction() {
  const extractor = new ComprehensiveBulletinExtractor();
  const opportunities = await extractor.extractFromAllBulletins();
  
  // Save to JSON for review
  fs.writeFileSync('comprehensive-bulletin-opportunities.json', JSON.stringify(opportunities, null, 2));
  console.log(`\n🎯 SAVED ${opportunities.length} opportunities to comprehensive-bulletin-opportunities.json`);
}

runExtraction().catch(console.error);