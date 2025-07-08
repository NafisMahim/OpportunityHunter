import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { storage } from './storage';
import type { InsertOpportunity } from '../shared/schema';

interface CSVOpportunity {
  Title: string;
  Link: string;
  Description: string;
  Deadline?: string;
  Cost?: string;
  Location?: string;
  'Major/Subject'?: string;
  Eligibility?: string;
}

export class DataImporter {
  async importFromCSV(filePath: string): Promise<void> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }) as CSVOpportunity[];

      let importCount = 0;

      for (const record of records) {
        if (!record.Title || !record.Link) continue;

        const opportunity: InsertOpportunity = {
          type: this.determineOpportunityType(record.Title, record.Description, record['Major/Subject']),
          title: record.Title.substring(0, 200),
          description: record.Description?.substring(0, 1000) || 'No description available',
          source: 'Curated Database',
          organization: this.extractOrganization(record.Title),
          location: record.Location || 'Various',
          url: record.Link,
          relevancyScore: 90, // High relevancy for curated data
          requirements: this.parseRequirements(record.Eligibility),
          tags: this.generateTags(record.Title, record['Major/Subject'], record.Description),
          salary: null,
          deadline: record.Deadline || null,
          amount: record.Cost && record.Cost !== 'Free' ? record.Cost : null,
          prize: null
        };

        try {
          await storage.createOpportunity(opportunity);
          importCount++;
          console.log(`✓ Imported: ${opportunity.title}`);
        } catch (error) {
          console.error(`Failed to import ${record.Title}:`, error);
        }
      }

      console.log(`Successfully imported ${importCount} opportunities from ${filePath}`);
    } catch (error) {
      console.error(`Error importing CSV file ${filePath}:`, error);
    }
  }

  private determineOpportunityType(title: string, description: string, subject?: string): 'job' | 'internship' | 'grant' | 'scholarship' | 'competition' {
    const text = (title + ' ' + description + ' ' + (subject || '')).toLowerCase();
    
    if (text.includes('scholarship') || text.includes('merit') || text.includes('financial aid')) {
      return 'scholarship';
    }
    if (text.includes('internship') || text.includes('summer program') || text.includes('research program')) {
      return 'internship';
    }
    if (text.includes('competition') || text.includes('contest') || text.includes('challenge')) {
      return 'competition';
    }
    if (text.includes('grant') || text.includes('funding')) {
      return 'grant';
    }
    if (text.includes('job') || text.includes('work') || text.includes('employment')) {
      return 'job';
    }
    
    // Default to internship for most programs
    return 'internship';
  }

  private extractOrganization(title: string): string {
    // Extract organization from program titles
    const parts = title.split(',')[0].split('-')[0].split('|')[0].trim();
    
    // Common patterns
    if (parts.includes('Stanford')) return 'Stanford University';
    if (parts.includes('Yale')) return 'Yale University';
    if (parts.includes('MIT')) return 'Massachusetts Institute of Technology';
    if (parts.includes('Bank of America')) return 'Bank of America';
    if (parts.includes('Google')) return 'Google';
    if (parts.includes('Arizona State')) return 'Arizona State University';
    
    return parts || 'Various Organizations';
  }

  private parseRequirements(eligibility?: string): string[] {
    if (!eligibility) return ['High school student'];
    
    const requirements: string[] = [];
    const text = eligibility.toLowerCase();
    
    if (text.includes('high school')) requirements.push('High school student');
    if (text.includes('junior') && text.includes('senior')) requirements.push('High school juniors and seniors');
    else if (text.includes('junior')) requirements.push('High school junior');
    else if (text.includes('senior')) requirements.push('High school senior');
    
    if (text.includes('us')) requirements.push('US citizenship/residency');
    if (text.includes('international')) requirements.push('International students eligible');
    if (text.includes('women') || text.includes('female')) requirements.push('Female students');
    if (text.includes('stem')) requirements.push('STEM interest');
    
    return requirements.length > 0 ? requirements : ['High school student'];
  }

  private generateTags(title: string, subject?: string, description?: string): string[] {
    const tags: string[] = ['high-school'];
    const text = (title + ' ' + (subject || '') + ' ' + (description || '')).toLowerCase();
    
    // Subject-based tags
    if (text.includes('stem') || text.includes('science') || text.includes('engineering')) tags.push('stem');
    if (text.includes('medicine') || text.includes('medical') || text.includes('health')) tags.push('medicine');
    if (text.includes('computer') || text.includes('coding') || text.includes('programming')) tags.push('technology');
    if (text.includes('leadership')) tags.push('leadership');
    if (text.includes('research')) tags.push('research');
    if (text.includes('art') || text.includes('music') || text.includes('creative')) tags.push('arts');
    if (text.includes('business') || text.includes('entrepreneur')) tags.push('business');
    if (text.includes('writing') || text.includes('journalism')) tags.push('writing');
    
    // Program type tags
    if (text.includes('summer')) tags.push('summer-program');
    if (text.includes('online') || text.includes('virtual')) tags.push('online');
    if (text.includes('paid') || text.includes('stipend')) tags.push('paid');
    if (text.includes('free')) tags.push('free');
    
    return tags;
  }

  async importCollegeFlyIns(): Promise<void> {
    // This would parse the PDF data for college fly-in programs
    const flyInPrograms = [
      {
        title: 'Amherst College - A2A Program',
        description: 'Diversity fly-in program for first-generation, low-income, and minority students to experience Amherst College campus life.',
        url: 'https://www.amherst.edu/admission/diversity/a2a',
        deadline: 'August 14, 2025',
        organization: 'Amherst College',
        requirements: ['FGLI students', 'Minority students', 'Academic writing sample recommended']
      },
      {
        title: 'Stanford Institutes of Medicine Summer Research Program',
        description: '8-week high school research internship in immunology, cancer biology, and bioengineering.',
        url: 'https://simr.stanford.edu/',
        deadline: 'February 22, 2025',
        organization: 'Stanford University',
        requirements: ['High school juniors and seniors', 'STEM interest', 'Research experience preferred']
      },
      {
        title: 'Yale Young Global Scholars',
        description: 'Interdisciplinary academic program with residential summer sessions in global affairs, STEM innovation, and sustainable development.',
        url: 'https://globalscholars.yale.edu/',
        deadline: 'January 10, 2025',
        organization: 'Yale University',
        requirements: ['High school students', 'International students eligible', 'Academic excellence']
      }
    ];

    let importCount = 0;
    for (const program of flyInPrograms) {
      const opportunity: InsertOpportunity = {
        type: 'internship',
        title: program.title,
        description: program.description,
        source: 'College Fly-in Programs',
        organization: program.organization,
        location: 'Various',
        url: program.url,
        relevancyScore: 95,
        requirements: program.requirements,
        tags: ['college-prep', 'diversity', 'summer-program', 'prestigious'],
        salary: null,
        deadline: program.deadline,
        amount: null,
        prize: null
      };

      try {
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported fly-in: ${opportunity.title}`);
      } catch (error) {
        console.error(`Failed to import ${program.title}:`, error);
      }
    }

    console.log(`Successfully imported ${importCount} college fly-in programs`);
  }

  async importSummerPrograms(): Promise<void> {
    // Parse summer program data from PDFs
    const summerPrograms = [
      {
        title: 'Bank of America Student Leaders Program',
        description: 'An 8-week paid internship focused on community leadership development. Participants work with local nonprofits and attend a leadership summit.',
        url: 'https://about.bankofamerica.com/en/making-an-impact/student-leaders',
        deadline: 'January 28, 2025',
        cost: 'Free (paid internship)',
        organization: 'Bank of America',
        type: 'internship' as const
      },
      {
        title: 'Research Science Institute (RSI)',
        description: 'Six-week, fully funded STEM research program at MIT for high-achieving students.',
        url: 'https://www.cee.org/programs/research-science-institute',
        deadline: 'Various',
        cost: 'Free',
        organization: 'Massachusetts Institute of Technology',
        type: 'internship' as const
      },
      {
        title: 'Girls Who Code Summer Program',
        description: 'Two-week virtual coding bootcamp for 9th-11th grade girls and non-binary students.',
        url: 'https://girlswhocode.com/programs/summer-immersion-program',
        deadline: 'Various',
        cost: 'Free',
        organization: 'Girls Who Code',
        type: 'internship' as const
      }
    ];

    let importCount = 0;
    for (const program of summerPrograms) {
      const opportunity: InsertOpportunity = {
        type: program.type,
        title: program.title,
        description: program.description,
        source: 'Summer Programs Database',
        organization: program.organization,
        location: 'Various',
        url: program.url,
        relevancyScore: 92,
        requirements: ['High school student'],
        tags: ['summer-program', 'prestigious', 'competitive'],
        salary: program.cost.includes('paid') ? 'Stipend provided' : null,
        deadline: program.deadline,
        amount: program.cost !== 'Free' ? program.cost : null,
        prize: null
      };

      try {
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported summer program: ${opportunity.title}`);
      } catch (error) {
        console.error(`Failed to import ${program.title}:`, error);
      }
    }

    console.log(`Successfully imported ${importCount} summer programs`);
  }

  async importAllData(): Promise<void> {
    console.log('Starting comprehensive data import...');
    
    try {
      // Import from CSV files
      await this.importFromCSV('attached_assets/Verified_High_School_Programs_2025_1751951028309.csv');
      await this.importFromCSV('attached_assets/High_School_Opportunities_1751951028308.csv');
      
      // Import curated programs
      await this.importCollegeFlyIns();
      await this.importSummerPrograms();
      
      console.log('✅ All data import completed successfully!');
    } catch (error) {
      console.error('❌ Error during data import:', error);
    }
  }
}

export const dataImporter = new DataImporter();