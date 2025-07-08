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
      // Import from ORIGINAL batch CSV files
      await this.importFromCSV('attached_assets/Verified_High_School_Programs_2025_1751951028309.csv');
      await this.importFromCSV('attached_assets/High_School_Opportunities_1751951028308.csv');
      
      // Import from ORIGINAL PDF files  
      await this.importFromCollegeFlyInsPDF();
      await this.importFromSummerProgramsPDF(); 
      await this.importFromSTEMProgramsPDF();
      await this.importFromArtsProgramsPDF();
      await this.importFromSeniorProgramsPDF();
      await this.importFromSophomoreProgramsPDF();
      await this.importFromInternationalProgramsPDF();
      
      // Import curated programs (legacy)
      await this.importCollegeFlyIns();
      await this.importSummerPrograms();
      
      // Import NEW BATCH 2 - ALL FILES
      await this.importFromCTEEInternships();
      await this.importFromCTEESummerPrograms(); 
      await this.importFromCTEEYearlyPrograms();
      await this.importFromExpansionPDF();
      await this.importFromBatch2CSV();
      await this.importFromBatch3CSV();
      await this.importFromBatch4CSV();
      await this.importFromBatch5CSV();
      await this.importFromBatch6CSV();
      await this.importFromBatch7CSV();
      
      console.log('✅ ALL data import completed successfully - BOTH BATCHES!');
    } catch (error) {
      console.error('❌ Error during data import:', error);
    }
  }
  async importFromCollegeFlyInsPDF(): Promise<void> {
    console.log('📄 Importing from College Fly-ins PDF...');
    // Extract data from 2025 College Fly-in Programs PDF
    const flyInPrograms = [
      {
        title: "Amherst College - A2A Program",
        organization: "Amherst College", 
        type: "scholarship" as const,
        description: "First-generation, low-income, and minority student fly-in program with academic writing sample requirement.",
        source: "College Fly-ins 2025",
        link: "https://www.amherst.edu/admission/diversity/a2a",
        deadline: "August 14, 2025",
        requirements: ["Academic writing sample", "1 letter of recommendation"],
        tags: ["diversity", "FGLI", "minorities", "fly-in"]
      },
      {
        title: "Amherst College - EONS Program", 
        organization: "Amherst College",
        type: "scholarship" as const,
        description: "Indigenous students fly-in program with academic writing sample requirement.",
        source: "College Fly-ins 2025",
        link: "https://www.amherst.edu/admission/diversity/EONS",
        deadline: "August 14, 2025", 
        requirements: ["Academic writing sample", "1 letter of recommendation"],
        tags: ["indigenous", "diversity", "fly-in"]
      },
      {
        title: "Babson College - Access Babson",
        organization: "Babson College",
        type: "scholarship" as const,
        description: "FGLI and minority student fly-in program, October 1-2 session.",
        source: "College Fly-ins 2025",
        link: "https://www.babson.edu/undergraduate/admission/visit-and-engage/access-babson/",
        deadline: "August 4, 2025",
        requirements: ["2 letters of recommendation"],
        tags: ["FGLI", "minorities", "business", "fly-in"]
      },
      {
        title: "Barnard College - Barnard Bound",
        organization: "Barnard College", 
        type: "scholarship" as const,
        description: "FGLI, minority, and women fly-in program with multiple session dates.",
        source: "College Fly-ins 2025",
        link: "https://barnard.edu/admissions/commitment-to-access",
        deadline: "September 18, 2025",
        requirements: ["1 letter of recommendation"],
        tags: ["FGLI", "minorities", "women", "fly-in"]
      },
      {
        title: "Bates College - Prologue to Bates",
        organization: "Bates College",
        type: "scholarship" as const, 
        description: "FGLI and minority student fly-in program with optional letter of recommendation.",
        source: "College Fly-ins 2025",
        link: "https://www.bates.edu/admission/prologue/",
        deadline: "August 11, 2025",
        requirements: ["Optional letter of recommendation"],
        tags: ["FGLI", "minorities", "fly-in"]
      },
      {
        title: "Bowdoin College - Explore Bowdoin",
        organization: "Bowdoin College",
        type: "scholarship" as const,
        description: "FGLI and minority student fly-in program with multiple September/October sessions.",
        source: "College Fly-ins 2025", 
        link: "https://www.bowdoin.edu/admissions/visit/explore-bowdoin/index.html",
        deadline: "August 9, 2025",
        requirements: ["1 letter of recommendation"],
        tags: ["FGLI", "minorities", "fly-in"]
      },
      {
        title: "Brandeis University - SEED Program",
        organization: "Brandeis University",
        type: "scholarship" as const,
        description: "FGLI and minority student fly-in program, October 20-21 session.",
        source: "College Fly-ins 2025",
        link: "https://www.brandeis.edu/admissions/seed/", 
        deadline: "September 8, 2025",
        requirements: ["2 letters of recommendation"],
        tags: ["FGLI", "minorities", "fly-in"]
      },
      {
        title: "Bryn Mawr College - Lantern Scholars",
        organization: "Bryn Mawr College",
        type: "scholarship" as const,
        description: "FGLI, minority, and women fly-in program, September 30 - October 2.",
        source: "College Fly-ins 2025",
        link: "https://www.brynmawr.edu/admissions-aid/visit-bryn-mawr/fly-programs",
        deadline: "July 15, 2025",
        requirements: ["1 letter of recommendation"],
        tags: ["FGLI", "minorities", "women", "fly-in"]
      },
      {
        title: "Bucknell University - Journey to Bucknell",
        organization: "Bucknell University", 
        type: "scholarship" as const,
        description: "FGLI and minority student fly-in program requiring parent/guardian accompaniment.",
        source: "College Fly-ins 2025",
        link: "https://www.bucknell.edu/meet-bucknell/plan-visit/camps-conferences-visit-programs/journey-bucknell",
        deadline: "October 4, 2025",
        requirements: ["3 letters of recommendation", "Parent/guardian accompaniment"],
        tags: ["FGLI", "minorities", "fly-in"]
      },
      {
        title: "CalTech Up Close",
        organization: "California Institute of Technology",
        type: "scholarship" as const,
        description: "FGLI, minority, and STEM student fly-in program. Decisions released in September.",
        source: "College Fly-ins 2025",
        link: "https://www.admissions.caltech.edu/visit/visit-campus/fall-fly-in-program-caltech-up-close", 
        deadline: "August 6, 2025",
        requirements: ["2 letters of recommendation"],
        tags: ["FGLI", "minorities", "STEM", "fly-in"]
      },
      {
        title: "CalTech Summer Preview: Women in STEM",
        organization: "California Institute of Technology",
        type: "internship" as const,
        description: "Women/non-binary students in STEM, August 2-4 program for juniors and seniors.",
        source: "College Fly-ins 2025",
        link: "https://www.admissions.caltech.edu/visit/visit-campus/summer-preview-women-stem",
        deadline: "June 20, 2025", 
        requirements: ["Women/non-binary", "Juniors/Seniors", "STEM interest"],
        tags: ["women", "non-binary", "STEM", "summer"]
      },
      {
        title: "Carleton College - TOC Program",
        organization: "Carleton College",
        type: "scholarship" as const,
        description: "FGLI and minority student fly-in program, October 8-10. Optional resume submission.",
        source: "College Fly-ins 2025",
        link: "https://www.carleton.edu/admissions/visit/toc/",
        deadline: "July 21, 2025",
        requirements: ["3 letters of recommendation", "Optional resume"],
        tags: ["FGLI", "minorities", "fly-in"]
      },
      {
        title: "Carnegie Mellon - Celebration of Diversity",
        organization: "Carnegie Mellon University",
        type: "scholarship" as const,
        description: "FGLI and minority student virtual diversity celebration with multiple event dates.",
        source: "College Fly-ins 2025", 
        link: "https://www.cmu.edu/admission/visit/online-visit/celebration-of-diversity-series",
        deadline: "Various dates",
        requirements: ["None specified"],
        tags: ["FGLI", "minorities", "virtual", "diversity"]
      },
      {
        title: "Case Western Reserve - Diversity Overnight",
        organization: "Case Western Reserve University",
        type: "scholarship" as const,
        description: "FGLI and minority student fly-in program, November 12-13. Additional forms required.",
        source: "College Fly-ins 2025",
        link: "https://case.edu/admission/diversity-overnight",
        deadline: "October 2, 2025",
        requirements: ["2 letters of recommendation", "Additional forms"],
        tags: ["FGLI", "minorities", "fly-in"]
      },
      {
        title: "Claremont McKenna - Fall Preview",
        organization: "Claremont McKenna College",
        type: "scholarship" as const,
        description: "FGLI and minority student fall preview program, October 8-10.",
        source: "College Fly-ins 2025",
        link: "https://www.cmc.edu/admission/visit/diversityflyin",
        deadline: "August 21, 2025",
        requirements: ["Strong academic excellence"],
        tags: ["FGLI", "minorities", "fly-in"]
      },
      {
        title: "Colgate University - Colgate in Focus",
        organization: "Colgate University",
        type: "scholarship" as const,
        description: "FGLI and minority student fly-in program, October 1-2. Priority for summer webinar attendees.",
        source: "College Fly-ins 2025",
        link: "https://www.colgate.edu/admission-aid/visit/colgate-focus",
        deadline: "August 1, 2025",
        requirements: ["Summer webinar attendance preferred"],
        tags: ["FGLI", "minorities", "fly-in"]
      },
      {
        title: "College of the Atlantic - Fall Fly-In",
        organization: "College of the Atlantic",
        type: "scholarship" as const,
        description: "FGLI and minority student fly-in program, September 28 - October 1.",
        source: "College Fly-ins 2025",
        link: "https://www.coa.edu/admissions/admission-events/fall-fly-in/",
        deadline: "July 15, 2025",
        requirements: ["2 letters of recommendation"],
        tags: ["FGLI", "minorities", "environmental", "fly-in"]
      },
      {
        title: "College of Holy Cross - Perspectives",
        organization: "College of Holy Cross", 
        type: "scholarship" as const,
        description: "FGLI and minority student fly-in program, November 4-6. Travel grants available.",
        source: "College Fly-ins 2025",
        link: "https://www.holycross.edu/perspectives-overnight-program",
        deadline: "October 1, 2025",
        requirements: ["2 letters of recommendation", "Parent/guardian/mentor attendance"],
        tags: ["FGLI", "minorities", "travel-grants", "fly-in"]
      },
      {
        title: "Colorado College - ECC Program",
        organization: "Colorado College",
        type: "scholarship" as const,
        description: "Diverse student fly-in program with rolling admissions starting in October.",
        source: "College Fly-ins 2025",
        link: "https://www.coloradocollege.edu/flyin/",
        deadline: "September 1, 2025", 
        requirements: ["Rolling basis decisions"],
        tags: ["diversity", "fly-in", "rolling-admissions"]
      }
    ];

    let importCount = 0;
    for (const program of flyInPrograms) {
      try {
        const opportunity: InsertOpportunity = {
          title: program.title,
          description: program.description,
          organization: program.organization,
          type: program.type,
          source: program.source,
          url: program.link,
          deadline: program.deadline,
          requirements: program.requirements,
          tags: program.tags,
          relevancyScore: 85,
          amount: null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported fly-in: ${program.title}`);
      } catch (error) {
        console.log(`Duplicate fly-in skipped: ${program.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} college fly-in programs from PDF`);
  }

  async importFromSummerProgramsPDF(): Promise<void> {
    console.log('📄 Importing from Summer Programs PDF...');
    
    const summerPrograms = [
      {
        title: "Yale Young Global Scholars (YYGS)",
        organization: "Yale University",
        type: "internship" as const,
        description: "Two-week globally diverse academic summer program with collaborative curriculum in STEM, social sciences, humanities, or cross-disciplinary tracks.",
        source: "Summer Programs PDF",
        link: "https://globalscholars.yale.edu/",
        deadline: "January 10, 2025",
        cost: "$75 application fee",
        requirements: ["Academic excellence"],
        tags: ["global", "academic", "STEM", "humanities", "international"]
      },
      {
        title: "Polygence Research Mentorship",
        organization: "Polygence",
        type: "internship" as const, 
        description: "Research mentorship program where students earn college credit, write research papers, gain mentorship, and present at conferences.",
        source: "Summer Programs PDF",
        link: "https://www.polygence.org/",
        deadline: "January 15, 2025",
        requirements: ["Research interest"],
        tags: ["research", "mentorship", "college-credit", "conference"]
      },
      {
        title: "Summer Institute for the Gifted",
        organization: "SIG",
        type: "internship" as const,
        description: "Academic enrichment programs for gifted, academically talented, creative, and high potential students in grades K-12.",
        source: "Summer Programs PDF", 
        link: "https://www.sig.org/",
        deadline: "February 1, 2025",
        cost: "Tuition varies",
        requirements: ["95th percentile testing scores", "Alternative eligibility options available"],
        tags: ["gifted", "academic", "enrichment", "K-12"]
      },
      {
        title: "Brown Pre-College Program",
        organization: "Brown University",
        type: "internship" as const,
        description: "High school students explore college challenges and opportunities with challenging academics and enriching social activities without formal grades.",
        source: "Summer Programs PDF",
        link: "https://precollege.brown.edu/",
        deadline: "Early: January 14, Regular: May 20, 2025",
        cost: "Application fee plus tuition",
        requirements: ["Application fee", "Personal statement", "Transcript", "Optional supplemental essay"],
        tags: ["pre-college", "academics", "college-prep", "ivy-league"]
      },
      {
        title: "UN Association Summer Institute in Global Leadership", 
        organization: "United Nations Association of Greater Boston",
        type: "internship" as const,
        description: "Week-long Model UN programs for global students to work together and address global issues. In-person and virtual options.",
        source: "Summer Programs PDF",
        link: "https://www.unagb.org/",
        deadline: "March 1 and May 1, 2025",
        requirements: ["Global affairs interest"],
        tags: ["model-UN", "global-leadership", "international", "virtual-option"]
      },
      {
        title: "Duke Pre-College Programs",
        organization: "Duke University",
        type: "internship" as const,
        description: "Rigorous learning experiences for academically motivated middle and high school students with cutting-edge topics and Duke resources.",
        source: "Summer Programs PDF",
        link: "https://precollege.duke.edu/",
        deadline: "Opens in January 2025",
        requirements: ["Academic motivation", "6th-12th grade"],
        tags: ["pre-college", "rigorous", "academics", "duke"]
      },
      {
        title: "James Madison University Youth Programs",
        organization: "James Madison University",
        type: "internship" as const,
        description: "Youth development programs and academic enrichment opportunities.",
        source: "Summer Programs PDF", 
        link: "https://www.jmu.edu/",
        deadline: "Opens in January 2025",
        requirements: ["Youth eligibility"],
        tags: ["youth-development", "academic", "enrichment"]
      },
      {
        title: "Cornell Summer Sessions",
        organization: "Cornell University",
        type: "internship" as const,
        description: "College study experience with Cornell faculty where high school sophomores, juniors, and seniors can earn college credit.",
        source: "Summer Programs PDF",
        link: "https://www.sce.cornell.edu/ss/",
        deadline: "Opens in late January 2025",
        cost: "Varies by program",
        requirements: ["Sophomore, junior, or senior in high school"],
        tags: ["college-credit", "cornell", "academic", "ivy-league"]
      },
      {
        title: "Northwestern Civic Leadership Institute",
        organization: "Northwestern University", 
        type: "internship" as const,
        description: "Students explore social and political issues through service-learning, community leader exchanges, and academic study. Financial aid available.",
        source: "Summer Programs PDF",
        link: "https://www.northwestern.edu/",
        deadline: "Opens in January 2025",
        cost: "Tuition with financial aid available",
        requirements: ["Leadership interest", "Civic engagement"],
        tags: ["civic-leadership", "service-learning", "political", "financial-aid"]
      },
      {
        title: "Emory Summer College For High School Students",
        organization: "Emory University",
        type: "internship" as const,
        description: "Academic program for current 10th and 11th graders providing a glimpse of academic and residential life at a top-ranked university.",
        source: "Summer Programs PDF",
        link: "https://precollege.emory.edu/",
        deadline: "Opens in January 2025",
        cost: "Application fee plus tuition", 
        requirements: ["Current 10th or 11th grade", "Application fee", "Transcript"],
        tags: ["pre-college", "academic", "residential", "emory"]
      },
      {
        title: "Girls with Impact Entrepreneurship Academy",
        organization: "Girls with Impact",
        type: "internship" as const,
        description: "Mini-MBA program for girls ages 12-18, equipping them with entrepreneurship skills, confidence and business knowledge. 10 weeks with 1:1 coaching.",
        source: "Summer Programs PDF", 
        link: "https://girlswithimpact.org/",
        deadline: "Rolling admissions",
        cost: "$895 with aid available",
        requirements: ["Girls ages 12-18"],
        tags: ["entrepreneurship", "girls", "business", "MBA", "coaching"]
      }
    ];

    let importCount = 0;
    for (const program of summerPrograms) {
      try {
        const opportunity: InsertOpportunity = {
          title: program.title,
          description: program.description,
          organization: program.organization,
          type: program.type,
          source: program.source,
          url: program.link,
          deadline: program.deadline,
          requirements: program.requirements,
          tags: program.tags,
          relevancyScore: 85,
          amount: program.cost || null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported summer program: ${program.title}`);
      } catch (error) {
        console.log(`Duplicate summer program skipped: ${program.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} summer programs from PDF`);
  }

  async importFromSTEMProgramsPDF(): Promise<void> {
    console.log('📄 Importing from STEM Programs PDF...');
    
    const stemPrograms = [
      {
        title: "MIT MOSTEC (Online Science, Technology, and Engineering Community)",
        organization: "MIT", 
        type: "internship" as const,
        description: "Transformative experience for rising high school seniors in science and engineering, building community of friends and mentors globally.",
        source: "STEM Programs PDF",
        link: "https://oeop.mit.edu/programs/mostec",
        deadline: "February 1, 2025",
        cost: "Free",
        requirements: ["Rising high school seniors"],
        tags: ["MIT", "STEM", "engineering", "community", "free"]
      },
      {
        title: "Future Engineers Competition",
        organization: "Future Engineers",
        type: "competition" as const,
        description: "Four different engineering competitions. Winning teams receive monetary prizes.",
        source: "STEM Programs PDF",
        link: "https://www.futureengineers.org/",
        deadline: "January 25, 2025", 
        cost: "Free to enter",
        requirements: ["Engineering interest"],
        tags: ["engineering", "competition", "prizes", "STEM"]
      },
      {
        title: "NIH Summer Internships for Biomedical Research",
        organization: "National Institutes of Health",
        type: "internship" as const,
        description: "High School SIP provides opportunity to work at NIH with leading scientists in biomedical research. Earn stipend based on education completed.",
        source: "STEM Programs PDF",
        link: "https://www.training.nih.gov/programs/hs-sip",
        deadline: "February 1, 2025",
        cost: "Earn stipend",
        requirements: ["Must be 17 by June 15", "Resume", "Cover letter", "2 references", "Coursework/grades"],
        tags: ["NIH", "biomedical", "research", "stipend", "internship"]
      },
      {
        title: "Aspiring Scientists Summer Internship Program (ASSIP)",
        organization: "ASSIP",
        type: "internship" as const,
        description: "8-week full-time internship with hands-on experience using cutting-edge equipment, scientific writing, and STEM career exploration.",
        source: "STEM Programs PDF",
        link: "https://www.assip.org/",
        deadline: "February 6, 2025",
        cost: "Free with $25 app fee (may be waived)",
        requirements: ["Scientific interest", "Application fee"],
        tags: ["internship", "research", "scientific-writing", "equipment", "STEM-careers"]
      },
      {
        title: "Summer Ventures in Science and Mathematics",
        organization: "North Carolina State",
        type: "internship" as const,
        description: "No-cost, state-funded program for academically talented North Carolina students aspiring to STEM careers.",
        source: "STEM Programs PDF", 
        link: "https://www.ncsu.edu/summer-ventures/",
        deadline: "March 10, 2025",
        cost: "Free",
        requirements: ["North Carolina students", "Letters of recommendation", "Transcript"],
        tags: ["North-Carolina", "STEM", "state-funded", "free", "academics"]
      },
      {
        title: "Summer STEM Institute (SSI)",
        organization: "Summer STEM Institute",
        type: "internship" as const,
        description: "Six-week virtual international program with data science bootcamp, Masterclass lectures, weekend challenges, and mentored research project.",
        source: "STEM Programs PDF",
        link: "https://www.summersteminstitute.org/",
        deadline: "Early: January 16, Regular: April 17, 2025",
        requirements: ["Academic talent", "High motivation"],
        tags: ["virtual", "international", "data-science", "research", "mentorship"]
      },
      {
        title: "Apple Worldwide Developers Conference",
        organization: "Apple",
        type: "internship" as const,
        description: "Immerse in 200+ in-depth sessions for innovative app development. Connect with 1,000+ Apple engineers. Video collections posted daily.",
        source: "STEM Programs PDF",
        link: "https://developer.apple.com/wwdc/",
        deadline: "Keynote: June 7, 2025",
        cost: "Free",
        requirements: ["App development interest"],
        tags: ["Apple", "app-development", "engineering", "technology", "innovation"]
      },
      {
        title: "NIST Summer High School Internship Program",
        organization: "National Institute of Technology", 
        type: "internship" as const,
        description: "8-week NIST-wide summer intern program for students finishing junior or senior year interested in scientific research.",
        source: "STEM Programs PDF",
        link: "https://www.nist.gov/",
        deadline: "Opens soon",
        cost: "Volunteer position",
        requirements: ["Junior/senior year completed", "Personal statement", "Letters of recommendation", "Resume", "Transcript", "Parent waiver"],
        tags: ["NIST", "research", "internship", "scientific", "government"]
      },
      {
        title: "Google Code Jam",
        organization: "Google",
        type: "competition" as const,
        description: "Global coding competition where programmers of all levels solve algorithmic puzzles to earn a spot at World Finals. Winner receives $15k.",
        source: "STEM Programs PDF",
        link: "https://codingcompetitions.withgoogle.com/codejam",
        deadline: "Opens soon",
        cost: "Free to compete",
        requirements: ["Programming skills"],
        tags: ["Google", "coding", "competition", "algorithms", "prize-money"]
      },
      {
        title: "IDEA Math Summer Program",
        organization: "IDEA Math",
        type: "internship" as const,
        description: "In-depth mathematical enrichment in algebra, combinatorics, geometry, and number theory. Students learn by discovering theorems and techniques.",
        source: "STEM Programs PDF",
        link: "https://ideamath.org/",
        deadline: "Opens soon",
        requirements: ["Mathematical interest"],
        tags: ["mathematics", "enrichment", "algebra", "geometry", "discovery-learning"]
      },
      {
        title: "NASA Summer Internships",
        organization: "NASA",
        type: "internship" as const,
        description: "10-week internships in Imaging Gravity Waves, Deep Learning for Climate Change, AR/VR for Science, Precipitation Research. Virtual and in-person options.",
        source: "STEM Programs PDF",
        link: "https://www.nasa.gov/learning/students/",
        deadline: "Register by July 15, 2025",
        requirements: ["11th and 12th grade"],
        tags: ["NASA", "space", "climate", "AR-VR", "gravity-waves", "internship"]
      },
      {
        title: "Camp Euclid Mathematics Research",
        organization: "Camp Euclid",
        type: "internship" as const,
        description: "6-week mathematics research program tackling unsolved problems. 4 hours/week seminars plus 6+ hours of thinking and collaboration. Grant program available.",
        source: "STEM Programs PDF",
        link: "https://www.campeuclid.org/",
        deadline: "Third Saturday before camp begins",
        cost: "$1400 with grant program for financial need",
        requirements: ["Mathematical research interest"],
        tags: ["mathematics", "research", "unsolved-problems", "collaboration", "grants"]
      },
      {
        title: "TechPrep by Facebook",
        organization: "Facebook/Meta",
        type: "internship" as const,
        description: "Collection of fun resources and videos to spur interest in computer programming and motivate people from all backgrounds to pursue tech careers.",
        source: "STEM Programs PDF",
        link: "https://techprep.fb.com/",
        deadline: "Self-paced",
        cost: "Free",
        requirements: ["Programming interest"],
        tags: ["Facebook", "programming", "tech-careers", "diversity", "self-paced"]
      },
      {
        title: "Art of Problem Solving",
        organization: "AoPS",
        type: "internship" as const,
        description: "Interactive online mathematics courses for outstanding students grades 5-12, learning from leaders in advanced mathematics.",
        source: "STEM Programs PDF", 
        link: "https://artofproblemsolving.com/",
        deadline: "Rolling enrollment",
        cost: "Course fees apply",
        requirements: ["Grades 5-12", "Advanced math interest"],
        tags: ["mathematics", "online", "problem-solving", "advanced", "grades-5-12"]
      }
    ];

    let importCount = 0;
    for (const program of stemPrograms) {
      try {
        const opportunity: InsertOpportunity = {
          title: program.title,
          description: program.description,
          organization: program.organization,
          type: program.type,
          source: program.source,
          url: program.link,
          deadline: program.deadline,
          requirements: program.requirements,
          tags: program.tags,
          relevancyScore: 85,
          amount: program.cost || null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported STEM program: ${program.title}`);
      } catch (error) {
        console.log(`Duplicate STEM program skipped: ${program.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} STEM programs from PDF`);
  }

  async importFromArtsProgramsPDF(): Promise<void> {
    console.log('📄 Importing from Arts Programs PDF...');
    
    const artsPrograms = [
      {
        title: "Interlochen Arts Summer Camps",
        organization: "Interlochen Center for the Arts",
        type: "internship" as const,
        description: "Diverse summer programming in seven arts disciplines: creative writing, dance, film and new media, interdisciplinary arts, music, theatre, and visual arts. Need-based and merit scholarships available.",
        source: "Arts Programs PDF",
        link: "https://www.interlochen.org/camp",
        deadline: "January 15, 2025",
        cost: "Scholarships available",
        requirements: ["Some programs require audition or portfolio"],
        tags: ["arts", "creative-writing", "dance", "film", "music", "theatre", "visual-arts", "scholarships"]
      },
      {
        title: "University of Iowa Young Writers' Studio Online",
        organization: "University of Iowa",
        type: "internship" as const,
        description: "2-week Summer Residential Program (online) for deep immersion in creative writing art and craft. Sessions in June and July.",
        source: "Arts Programs PDF",
        link: "https://writersworkshop.uiowa.edu/writers-studio",
        deadline: "January 24, 2025",
        requirements: ["Writing sample", "Letter of recommendation", "Transcript", "Statement of purpose"],
        tags: ["creative-writing", "online", "Iowa", "literary", "residential"]
      },
      {
        title: "California State Summer School for the Arts (CSSSA)",
        organization: "CalArts",
        type: "internship" as const,
        description: "Prestigious month-long program for high school students hoping to pursue arts professionally. Rigorous program in writing, drawing, or performance art.",
        source: "Arts Programs PDF",
        link: "https://csssa.org/",
        deadline: "February 28, 2025",
        requirements: ["Professional arts aspirations"],
        tags: ["CalArts", "professional", "prestigious", "writing", "drawing", "performance"]
      },
      {
        title: "California College of the Arts Pre-College Program",
        organization: "California College of the Arts",
        type: "internship" as const,
        description: "Studio-focused, college-level courses for creative thinkers. Open to all experience levels. Earn 3 college credits and create portfolio-ready pieces.",
        source: "Arts Programs PDF",
        link: "https://www.cca.edu/pre-college/",
        deadline: "Opens mid-January 2025",
        cost: "Tuition plus 3 college credits",
        requirements: ["Open to all experience levels", "Located in San Francisco"],
        tags: ["pre-college", "studio", "college-credits", "portfolio", "San-Francisco"]
      },
      {
        title: "Otis Summer of Art Program",
        organization: "Otis College of Art and Design",
        type: "internship" as const,
        description: "Intensive 4-week pre-college program for students 15 and older at top art and design college. Welcome to serious artists and those with limited training.",
        source: "Arts Programs PDF",
        link: "https://www.otis.edu/continuing-education/pre-college-programs",
        deadline: "Opens late January 2025",
        requirements: ["Age 15 or older", "Art interest"],
        tags: ["pre-college", "art-design", "intensive", "Otis", "all-levels"]
      },
      {
        title: "Berklee Summer Programs",
        organization: "Berklee College of Music", 
        type: "internship" as const,
        description: "On-campus or online programs in music production, songwriting, film scoring, music business, dance, theater, guitar, voice, piano. Earn college credit.",
        source: "Arts Programs PDF",
        link: "https://www.berklee.edu/summer",
        deadline: "Rolling admissions",
        cost: "Registration fee plus tuition",
        requirements: ["High school student during program duration"],
        tags: ["music", "production", "songwriting", "film-scoring", "business", "dance", "college-credit"]
      },
      {
        title: "Academy of Art Pre-College Experience",
        organization: "Academy of Art University",
        type: "internship" as const,
        description: "Pre-college program on San Francisco campus or online year-round. Earn up to $4,000 toward college degree. First-come, first-served basis.",
        source: "Arts Programs PDF",
        link: "https://www.academyart.edu/pre-college/",
        deadline: "Rolling admissions",
        cost: "Earn up to $4,000 toward degree",
        requirements: ["High school student", "Early application recommended"],
        tags: ["pre-college", "San-Francisco", "online", "college-credit", "art-design"]
      },
      {
        title: "Write the World Literary Competitions",
        organization: "Write the World",
        type: "competition" as const,
        description: "Monthly writing competitions in poetry, fantasy, sports journalism, flash fiction. Encourages deeper writing exploration and sharing with global readers.",
        source: "Arts Programs PDF",
        link: "https://writetheworld.com/",
        deadline: "Monthly competitions",
        cost: "Free entry with cash prizes",
        requirements: ["Writing interest"],
        tags: ["writing", "poetry", "journalism", "fiction", "monthly", "prizes", "global"]
      },
      {
        title: "Polyphony Lit Summer Scholars Program",
        organization: "Polyphony Lit",
        type: "internship" as const,
        description: "8-week online program for rising 9th-12th graders to gain advanced knowledge of literary editing and prepare for senior editing roles.",
        source: "Arts Programs PDF",
        link: "https://www.polyphonyhs.com/",
        deadline: "Will announce soon",
        cost: "$350",
        requirements: ["Rising 9th-12th grade"],
        tags: ["literary", "editing", "online", "8-week", "magazine"]
      },
      {
        title: "Digital Media Academy",
        organization: "Digital Media Academy",
        type: "internship" as const,
        description: "Various virtual media courses with different tuition options.",
        source: "Arts Programs PDF",
        link: "https://www.digitalmediaacademy.org/",
        deadline: "Rolling admissions",
        cost: "Tuition varies",
        requirements: ["Media interest"],
        tags: ["digital-media", "virtual", "technology", "media-courses"]
      },
      {
        title: "MPulse Performing Arts Institutes",
        organization: "University of Michigan SMTD",
        type: "internship" as const,
        description: "Residential summer programs for 200+ pre-college students in music performance, theatre, music technology, dance, and musical theatre. May require audition.",
        source: "Arts Programs PDF",
        link: "https://smtd.umich.edu/departments/music/mpulse/",
        deadline: "Varies by program",
        cost: "Tuition varies",
        requirements: ["Varies by program", "In-person audition may be required"],
        tags: ["performing-arts", "music", "theatre", "dance", "residential", "Michigan", "audition"]
      },
      {
        title: "Ringling Pre-college Program",
        organization: "Ringling College of Art and Design",
        type: "internship" as const,
        description: "Online or on-campus art and design classes. 4 core classes required.",
        source: "Arts Programs PDF",
        link: "https://www.ringling.edu/pre-college",
        deadline: "Rolling admissions",
        cost: "On Campus: $6,500, Online: $3,995",
        requirements: ["4 core classes required"],
        tags: ["art-design", "online", "on-campus", "Ringling", "core-classes"]
      },
      {
        title: "Putney School Summer Arts Program",
        organization: "The Putney School",
        type: "internship" as const,
        description: "Space and opportunity to focus on artistic practice and education. Join community of young artists and arts educators in collaborative environment.",
        source: "Arts Programs PDF",
        link: "https://www.putneyschool.org/summer",
        deadline: "Rolling admissions", 
        cost: "Tuition varies",
        requirements: ["Artistic interest"],
        tags: ["arts-education", "community", "collaborative", "artistic-practice", "Vermont"]
      }
    ];

    let importCount = 0;
    for (const program of artsPrograms) {
      try {
        const opportunity: InsertOpportunity = {
          title: program.title,
          description: program.description,
          organization: program.organization,
          type: program.type,
          source: program.source,
          url: program.link,
          deadline: program.deadline,
          requirements: program.requirements,
          tags: program.tags,
          relevancyScore: 85,
          amount: program.cost || null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported arts program: ${program.title}`);
      } catch (error) {
        console.log(`Duplicate arts program skipped: ${program.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} arts programs from PDF`);
  }

  async importFromSeniorProgramsPDF(): Promise<void> {
    console.log('📄 Importing from Senior Programs PDF...');
    
    const seniorPrograms = [
      {
        title: "Arizona State Media Innovation Camp",
        organization: "Arizona State University",
        type: "internship" as const,
        description: "Free art and music/writing program at ASU Cronkite School focusing on digital media innovation.",
        source: "Senior Programs PDF",
        link: "https://cronkite.asu.edu/community/high-school-programs/camps/",
        deadline: "April 8, 2025",
        cost: "Free",
        requirements: ["Open to all"],
        tags: ["Arizona", "media", "innovation", "digital", "free", "writing", "art"]
      },
      {
        title: "Arizona State Summer Journalism Institute",
        organization: "Arizona State University",
        type: "internship" as const,
        description: "Free writing/journalism program for high school students at ASU.",
        source: "Senior Programs PDF",
        link: "https://cronkite.asu.edu/outreach/summer-journalism-institute",
        deadline: "April 8, 2025",
        cost: "Free",
        requirements: ["Open to all"],
        tags: ["Arizona", "journalism", "writing", "free", "ASU"]
      },
      {
        title: "Stanford Mathematics Camp",
        organization: "Stanford University",
        type: "internship" as const,
        description: "Online mathematics program for international students with financial aid available.",
        source: "Senior Programs PDF",
        link: "https://sumac.spcs.stanford.edu/sumac-about",
        deadline: "March 15, 2025",
        cost: "$3,250 with financial aid available",
        requirements: ["Open to all", "International eligible"],
        tags: ["Stanford", "mathematics", "online", "international", "financial-aid"]
      },
      {
        title: "ISSYP Physics Program",
        organization: "Perimeter Institute",
        type: "internship" as const,
        description: "Online physics program for international students focusing on advanced physics concepts.",
        source: "Senior Programs PDF",
        link: "https://perimeterinstitute.ca/issyp",
        deadline: "March 31, 2025",
        cost: "250 CAD",
        requirements: ["Open to all", "International eligible"],
        tags: ["physics", "online", "international", "Canada", "Perimeter"]
      },
      {
        title: "JCamp Media Program",
        organization: "Asian American Journalists Association",
        type: "internship" as const,
        description: "Writing/Media program in LA with diversity commitment, completely free.",
        source: "Senior Programs PDF",
        link: "https://www.aaja.org/programs-and-initiatives/jcamp/",
        deadline: "March 31, 2025",
        cost: "Free",
        requirements: ["Diversity commitment"],
        tags: ["media", "writing", "journalism", "diversity", "Los-Angeles", "free", "AAJA"]
      },
      {
        title: "MDI Biological Laboratory Fellowship",
        organization: "MDI Biological Laboratory",
        type: "internship" as const,
        description: "Free STEM research fellowship in Maine focusing on biological sciences.",
        source: "Senior Programs PDF",
        link: "https://mdibl.org/education/student-fellowships/high-school-summer-fellowship-applications/",
        deadline: "January 10, 2025",
        cost: "Free",
        requirements: ["Open to all"],
        tags: ["biology", "research", "STEM", "Maine", "fellowship", "free"]
      },
      {
        title: "NIH High School Summer Internship Program",
        organization: "National Institutes of Health",
        type: "internship" as const,
        description: "Medicine, STEM, and research internship program with multiple locations. Free and paid options available.",
        source: "Senior Programs PDF",
        link: "https://www.training.nih.gov/programs/hs-sip",
        deadline: "February 1, 2025",
        cost: "Free and paid options",
        requirements: ["Open to all"],
        tags: ["NIH", "medicine", "STEM", "research", "internship", "government"]
      }
    ];

    let importCount = 0;
    for (const program of seniorPrograms) {
      try {
        const opportunity: InsertOpportunity = {
          title: program.title,
          description: program.description,
          organization: program.organization,
          type: program.type,
          source: program.source,
          url: program.link,
          deadline: program.deadline,
          requirements: program.requirements,
          tags: program.tags,
          relevancyScore: 85,
          amount: program.cost || null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported senior program: ${program.title}`);
      } catch (error) {
        console.log(`Duplicate senior program skipped: ${program.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} senior programs from PDF`);
  }

  async importFromSophomoreProgramsPDF(): Promise<void> {
    console.log('📄 Importing from Sophomore Programs PDF...');
    
    const sophomorePrograms = [
      {
        title: "University of Illinois STEM Research",
        organization: "University of Illinois",
        type: "internship" as const,
        description: "Online STEM research program for high school students with paid opportunities.",
        source: "Sophomore Programs PDF",
        link: "https://wyse.engineering.illinois.edu/hs-summer-stem-research-programs/",
        deadline: "Varies",
        cost: "Paid program",
        requirements: ["Open to all"],
        tags: ["Illinois", "STEM", "research", "online", "paid", "engineering"]
      },
      {
        title: "University of Notre Dame Summer Scholars Online",
        organization: "University of Notre Dame",
        type: "internship" as const,
        description: "Online college classes for international eligible students. $1,900 tuition.",
        source: "Sophomore Programs PDF",
        link: "https://precollege.nd.edu/summer-scholars-online/eligibility-application-requirements/",
        deadline: "February 21, 2025",
        cost: "$1,900",
        requirements: ["Open to all", "International eligible"],
        tags: ["Notre-Dame", "college-classes", "online", "international", "pre-college"]
      }
    ];

    let importCount = 0;
    for (const program of sophomorePrograms) {
      try {
        const opportunity: InsertOpportunity = {
          title: program.title,
          description: program.description,
          organization: program.organization,
          type: program.type,
          source: program.source,
          url: program.link,
          deadline: program.deadline,
          requirements: program.requirements,
          tags: program.tags,
          relevancyScore: 85,
          amount: program.cost || null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported sophomore program: ${program.title}`);
      } catch (error) {
        console.log(`Duplicate sophomore program skipped: ${program.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} sophomore programs from PDF`);
  }

  async importFromInternationalProgramsPDF(): Promise<void> {
    console.log('📄 Importing from International Programs PDF...');
    
    const internationalPrograms = [
      {
        title: "University of Toronto Youth International English Program",
        organization: "University of Toronto",
        type: "internship" as const,
        description: "English learning program for people who want to engage with global community. Free with account creation required.",
        source: "International Programs PDF",
        link: "https://internationalprograms.utoronto.ca/international-summer-programs/youth-iep/courses/",
        deadline: "Create account to check",
        cost: "Free",
        requirements: ["English learners", "Global community engagement"],
        tags: ["Toronto", "English", "international", "free", "global-community"]
      },
      {
        title: "University of Toronto Global Citizenship Challenge",
        organization: "University of Toronto", 
        type: "internship" as const,
        description: "Online global community program focusing on global citizenship education.",
        source: "International Programs PDF",
        link: "https://internationalprograms.utoronto.ca/online-learning/gcc/apply/",
        deadline: "Varies",
        cost: "480 CAD",
        requirements: ["Open to all"],
        tags: ["Toronto", "global-citizenship", "online", "community", "Canada"]
      },
      {
        title: "University of Toronto Perspectives on Global Business",
        organization: "University of Toronto",
        type: "internship" as const,
        description: "Online business program focusing on global business perspectives and practices.",
        source: "International Programs PDF",
        link: "https://internationalprograms.utoronto.ca/online-learning/perspectives-global-business/",
        deadline: "Varies",
        cost: "690-720 CAD",
        requirements: ["Open to all"],
        tags: ["Toronto", "business", "global", "online", "perspectives"]
      },
      {
        title: "University of Toronto Perspectives on Global Health",
        organization: "University of Toronto",
        type: "internship" as const,
        description: "Online global health program exploring international health challenges and solutions.",
        source: "International Programs PDF",
        link: "https://internationalprograms.utoronto.ca/online-learning/perspectives-global-health/",
        deadline: "Varies",
        cost: "690-720 CAD",
        requirements: ["Open to all"],
        tags: ["Toronto", "global-health", "health", "online", "international"]
      },
      {
        title: "University of Toronto Summer Drama",
        organization: "University of Toronto",
        type: "internship" as const,
        description: "Theatre program in Canada focusing on dramatic arts and performance.",
        source: "International Programs PDF",
        link: "https://summerdrama.utoronto.ca/",
        deadline: "April 30, 2025",
        cost: "5400 CAD",
        requirements: ["Open to all"],
        tags: ["Toronto", "theatre", "drama", "performance", "Canada", "arts"]
      }
    ];

    let importCount = 0;
    for (const program of internationalPrograms) {
      try {
        const opportunity: InsertOpportunity = {
          title: program.title,
          description: program.description,
          organization: program.organization,
          type: program.type,
          source: program.source,
          url: program.link,
          deadline: program.deadline,
          requirements: program.requirements,
          tags: program.tags,
          relevancyScore: 85,
          amount: program.cost || null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported international program: ${program.title}`);
      } catch (error) {
        console.log(`Duplicate international program skipped: ${program.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} international programs from PDF`);
  }
  async importFromCTEEInternships(): Promise<void> {
    console.log('📄 Importing from CTEE Internships CSV...');
    
    const internships = [
      {
        title: "Bank of America Student Leaders",
        organization: "Bank of America",
        type: "internship" as const,
        description: "Bank of America sponsors 300 high school students in communities across the US to complete paid internships at local nonprofit organizations (not all are business related though)",
        source: "CTEE Internships",
        link: "https://about.bankofamerica.com/en/making-an-impact/student-leaders#fbid=JmKqY_KQjLO",
        deadline: "Applications open Fall of 2022",
        requirements: ["Current Juniors or Seniors in high school", "reside in eligible location"],
        tags: ["paid", "nonprofit", "community", "leadership"]
      },
      {
        title: "Pentacle High School Internship Program",
        organization: "Pentacle",
        type: "internship" as const,
        description: "Interns are paired with a participating small business (for-profit or nonprofit entities) that share their interests and goals. Interns have the opportunity to build their hard skill sets, learn from their peers, and meet industry leaders at weekly professional development seminars.",
        source: "CTEE Internships",
        link: "https://www.pentacle.org/education-and-outreach/career_development/high-school-internship-program-interns/",
        deadline: "Yet to be announced",
        requirements: ["Accepting applications"],
        tags: ["small-business", "professional-development", "skills", "industry-leaders"]
      },
      {
        title: "On the Money Magazine Internship",
        organization: "On the Money",
        type: "internship" as const,
        description: "On the Money Magazine (OTM) is a by-teens for-teens publication. Each semester, high school interns from across the city of Chicago come together to research and publish articles relating to finance and entrepreneurship. This internship will take place in association with DePaul University.",
        source: "CTEE Internships",
        link: "https://www.onthemoneymagazine.org/opportunities",
        deadline: "September-December 2022",
        requirements: ["Chicago area students", "Interest in writing"],
        tags: ["finance", "entrepreneurship", "writing", "publishing", "chicago"]
      },
      {
        title: "Microfinance for Tanzania",
        organization: "InternHQ",
        type: "internship" as const,
        description: "On this virtual internship in microfinance you'll assist local community banks that provide financial services to disadvantaged communities. Help to evaluate the bank's performance, check financial data and assist locals to prepare business plans and get access to education or insurance.",
        source: "CTEE Internships", 
        link: "https://www.internhq.com/remote-internships/accounting-and-finance/microfinance-from-tanzania/",
        deadline: "Can start year-round",
        requirements: ["Interest in finance", "Virtual work capability"],
        tags: ["microfinance", "virtual", "international", "business-plans", "community-banking"]
      },
      {
        title: "Jimerson Birr High School Summer Internship",
        organization: "Jimerson Birr",
        type: "internship" as const,
        description: "The High School Summer Internship Program allows you to experience a career in a dynamic firm that promotes your professional growth, and offers a unique opportunity to help you prepare to enter your first year of college with real-world experience added to your skillset. From day one, you are given real, substantive work and are an important part of our team.",
        source: "CTEE Internships",
        link: "https://www.jimersonfirm.com/about-us/careers/school-internships/",
        deadline: "Summer 2023",
        requirements: ["High school students", "Interest in law/business"],
        tags: ["law-firm", "professional-growth", "real-world-experience", "substantive-work"]
      }
    ];

    let importCount = 0;
    for (const internship of internships) {
      try {
        const opportunity: InsertOpportunity = {
          title: internship.title,
          description: internship.description,
          organization: internship.organization,
          type: internship.type,
          source: internship.source,
          url: internship.link,
          deadline: internship.deadline,
          requirements: internship.requirements,
          tags: internship.tags,
          relevancyScore: 85,
          amount: null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported CTEE internship: ${internship.title}`);
      } catch (error) {
        console.log(`Duplicate CTEE internship skipped: ${internship.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} CTEE internships`);
  }

  async importFromCTEESummerPrograms(): Promise<void> {
    console.log('📄 Importing from CTEE Summer Programs CSV (first 20)...');
    
    const summerPrograms = [
      {
        title: "World Scholars Academy Business Courses",
        organization: "World Scholars Academy",
        type: "internship" as const,
        description: "World Scholars Academy offers elite summer business courses for ages 12-18 designed and taught by world-leading professional scholars. Discover your future career path and accelerate your success with personalized college guidance and high-level instruction in economics & business.",
        source: "CTEE Summer Programs",
        link: "https://www.worldscholarsacademy.com/business-courses?utm_source=teenlife",
        deadline: "June, July, August (Two weeks)",
        requirements: ["Ages 12-18"],
        tags: ["business", "economics", "online", "college-guidance", "elite"]
      },
      {
        title: "University of Maryland: Terp Young Scholars (TYS)",
        organization: "University of Maryland",
        type: "internship" as const,
        description: "In Terp Young Scholars, high school students prepare for college through rigorous academics and dynamic instruction. Learn to navigate the University of Maryland college experience and get a jump on college by earning three university credits.",
        source: "CTEE Summer Programs",
        link: "https://oes.umd.edu/pre-college-programs/terp-young-scholars",
        deadline: "July (Three weeks)",
        requirements: ["Rising freshmen, sophomores, juniors, and seniors"],
        tags: ["college-prep", "university-credits", "rigorous", "academics"]
      },
      {
        title: "Brown University Pre-College Programs",
        organization: "Brown University",
        type: "internship" as const,
        description: "Come to Brown to get a feel for what college life is like – the responsibility, the freedom, and the new friendships. Leave enriched by an unforgettable educational experience, prepared for your next steps.",
        source: "CTEE Summer Programs",
        link: "https://precollege.brown.edu/?utm_source=teenlife",
        deadline: "June, July, August (One Week to Six Weeks)",
        requirements: ["Rising freshmen, sophomores, juniors, and seniors"],
        tags: ["brown", "college-life", "educational", "residential", "ivy-league"]
      },
      {
        title: "Summer Discovery: UCLA",
        organization: "Summer Discovery",
        type: "internship" as const,
        description: "UCLA offers students the perfect campus on which to learn while enjoying the sun, surf, and sand. Choose from over 40 different classes in a wide range of subjects. Enrichment classes, STEM, Business Academies, Leadership, Sports Management & E-Sports, STEM, or Arts.",
        source: "CTEE Summer Programs",
        link: "https://www.summerdiscovery.com/ucla?utm_source=teenlife",
        deadline: "June, July, August (Two to Six Weeks)",
        requirements: ["Rising freshmen, sophomores, juniors, and seniors (15-18)"],
        tags: ["UCLA", "STEM", "business", "leadership", "sports-management", "arts"]
      },
      {
        title: "Summer Discovery: University of Michigan",
        organization: "Summer Discovery",
        type: "internship" as const,
        description: "Located in the classic college town of Ann Arbor, students can spend their summer at the 'Public Ivy' known as the University of Michigan. Choose from over 40 different classes in a wide range of subjects.",
        source: "CTEE Summer Programs",
        link: "https://www.summerdiscovery.com/university-of-michigan",
        deadline: "June, July (Two to Five Weeks)",
        requirements: ["Ages 14-18"],
        tags: ["michigan", "public-ivy", "ann-arbor", "variety", "classes"]
      },
      {
        title: "BBAY: Berkeley Business Academy for Youth",
        organization: "UC Berkeley Haas",
        type: "internship" as const,
        description: "Located at UC Berkeley, BBAY lets you experience the powerful combination of great ideas and great business sense by developing a business idea and creating your team's business plan–all in just two weeks.",
        source: "CTEE Summer Programs",
        link: "https://haas.berkeley.edu/business-academy/high-school-entrepreneurship/",
        deadline: "July through August (2 weeks)",
        requirements: ["Ages 14-18", "Rolling basis applications"],
        tags: ["berkeley", "business-plan", "entrepreneurship", "teamwork", "UC"]
      },
      {
        title: "Launch X Young Entrepreneurship Program",
        organization: "LaunchX",
        type: "internship" as const,
        description: "With classes at MIT, Northwestern, U Michigan, and UPenn, Launch X is a perfect place to learn business and entrepreneurship. Bringing together top aspiring high school entrepreneurs from around the world each summer, LaunchX can help you through the process of launching an actual startup.",
        source: "CTEE Summer Programs",
        link: "https://launchx.com/",
        deadline: "Around 4-weeks",
        requirements: ["Ages 14-18", "Early Decision December 15, Regular Decision February 1"],
        tags: ["MIT", "startup", "entrepreneurship", "northwestern", "UPenn"]
      },
      {
        title: "Leadership in the Business World (LBW) - Wharton",
        organization: "Wharton School",
        type: "internship" as const,
        description: "Designed to provide students with a glimpse of Wharton's undergraduate curriculum, LBW offers opportunities to learn about leadership in 21st century organizations through a dynamic and rigorous mix of classes with Wharton professors and business leaders, real-time business simulations, and team-building activities.",
        source: "CTEE Summer Programs",
        link: "https://globalyouth.wharton.upenn.edu/programs-courses/leadership-in-the-business-world/",
        deadline: "June to August (1 month long)",
        requirements: ["Grade 11 or 12", "3.5 unweighted GPA or higher", "Demonstrated leadership"],
        tags: ["wharton", "leadership", "business-simulations", "team-building", "prestigious"]
      },
      {
        title: "Economics For Leaders - EFL",
        organization: "Foundation for Teaching Economics",
        type: "internship" as const,
        description: "The goal of EFL is to give promising students the skills to be more effective leaders and to teach them how to employ economic analysis when considering difficult public policy choices. Learn these intuitions from different professors, lessons, and even the students!",
        source: "CTEE Summer Programs",
        link: "https://www.fte.org/students/economics-for-leaders-program/",
        deadline: "Loads of different sessions spanning entire summer (1 week long)",
        requirements: ["High school students"],
        tags: ["economics", "leadership", "public-policy", "analysis", "professors"]
      },
      {
        title: "Teach Me Wall Street: Budget & Beyond",
        organization: "Teach Me Wall Street",
        type: "internship" as const,
        description: "Teach Me Wall Street Virtual Summer Camp for Teens, Grades 9-12. Our Wall Street Learning Pathway covers 4 areas Wall Street 101, Investing & Trading, Personal Finance (Budgeting & Beyond), Fintech, Bitcoin and Cryptocurrency. Instruction is live and interactive.",
        source: "CTEE Summer Programs",
        link: "https://www.teachmewallstreet.com/budgeting-basics-summer-camp?utm_source=teenlife",
        deadline: "5 day Boot camp runs twice daily at 10am EST and 1pm EST",
        requirements: ["Grades 9-12"],
        tags: ["wall-street", "investing", "personal-finance", "cryptocurrency", "virtual"]
      },
      {
        title: "Wake Forest University: Online Immersion Program",
        organization: "Wake Forest University",
        type: "internship" as const,
        description: "Wake Forest University's (WFU) Online Immersion Program offers flexible online courses in Medicine, Sports Medicine, Business, Psychology, Cancer Medicine, Women's Medicine and Bioscience for high school students.",
        source: "CTEE Summer Programs",
        link: "https://wfuonline.precollegeprograms.org/?utm_source=website&utm_campaign=affiliate&utm_term=teenlifesummerlisting2022&utm_source=teenlife",
        deadline: "June, July, August (Two to Four Weeks)",
        requirements: ["High school students"],
        tags: ["wake-forest", "medicine", "psychology", "bioscience", "online"]
      },
      {
        title: "NYU Precollege",
        organization: "New York University",
        type: "internship" as const,
        description: "NYU Precollege offers high school students the opportunity to earn college credits and experience life as an NYU student. Through this immersive six-week summer program, students can choose from courses in more than 30 academic areas.",
        source: "CTEE Summer Programs",
        link: "https://www.nyu.edu/admissions/high-school-programs/precollege.html?utm_source=teenlife",
        deadline: "July (Six Weeks)",
        requirements: ["11th, 12th grade"],
        tags: ["NYU", "college-credits", "immersive", "30-areas", "residential"]
      },
      {
        title: "UMass Amherst Summer Pre-College Programs",
        organization: "University of Massachusetts Amherst",
        type: "internship" as const,
        description: "Learn about Summer 2022 Pre-College opportunities at UMass Amherst. Our residential and online pre-college programs are designed to give you a preview of the UMass student experience, including college-level academics and being part of a learning community.",
        source: "CTEE Summer Programs",
        link: "https://www.umass.edu/uww/programs/pre-college?utm_source=teenlife",
        deadline: "June, July (One to Six Weeks)",
        requirements: ["High school students"],
        tags: ["UMass", "residential", "learning-community", "college-level", "preview"]
      },
      {
        title: "Fusion Academy Summer Programs",
        organization: "Fusion Academy",
        type: "internship" as const,
        description: "Take Learning to a New Level this Summer at Fusion Academy. This year, students will be heading into summer needing additional academic, social, and emotional support. Our personalized programs can help bridge the gap between this school year and the next.",
        source: "CTEE Summer Programs",
        link: "https://www.fusionacademy.com/summer-programs/?utm_source=referral&utm_medium=local&utm_campaign=teenlife&piCId=80038&utm_source=teenlife",
        deadline: "June, July, August",
        requirements: ["High school students needing academic support"],
        tags: ["personalized", "academic-support", "social-emotional", "bridge-gap", "individualized"]
      },
      {
        title: "Cryptocurrency Summer Boot Camp",
        organization: "Teach Me Wall Street",
        type: "internship" as const,
        description: "Teach Me Wall Street Virtual Summer Camp for Teens, Grades 9-12. Explore cutting edge technologies that are changing the financial world and its products and services. JOBS OF THE FUTURE - Learn how you can prepare for careers in fintech.",
        source: "CTEE Summer Programs",
        link: "https://www.teachmewallstreet.com/Fintech-bitcoin-cryptocurrency?utm_source=teenlife",
        deadline: "June, July, August (One Week)",
        requirements: ["Grades 9-12"],
        tags: ["cryptocurrency", "fintech", "cutting-edge", "future-jobs", "virtual"]
      },
      {
        title: "Campus Oxford: High School Summer Programs",
        organization: "Campus Oxford",
        type: "internship" as const,
        description: "Campus Oxford's Advanced Study Program in The United Kingdom is a fantastic opportunity for high school students to gain knowledge and explore a new culture. This program allows students to experience life in an historic Oxford college.",
        source: "CTEE Summer Programs",
        link: "https://campusoxford.com/summer-programme-2022/summer-programme-2022/?utm_source=teenlife",
        deadline: "June, July (Two to Six Weeks)",
        requirements: ["9th, 10th, 11th, 12th grade"],
        tags: ["oxford", "UK", "cultural-exploration", "historic", "international"]
      },
      {
        title: "Boston Leadership Institute: Finance",
        organization: "Boston Leadership Institute",
        type: "internship" as const,
        description: "Jump into the world of finance and get a sneak peek into what financial analysts do on a day-to-day basis with the Boston Leadership Institute. Students will be exposed to the mathematical concepts and techniques used in finance and how to apply them to financial markets such as the stock market.",
        source: "CTEE Summer Programs",
        link: "https://www.bostonleadershipinstitute.com/finance/?utm_source=teenlife",
        deadline: "July (Three Weeks)",
        requirements: ["8th, 9th, 10th, 11th, 12th grade"],
        tags: ["finance", "financial-analysis", "mathematical-concepts", "stock-market", "boston"]
      },
      {
        title: "Georgetown University Economics Policy Academy",
        organization: "Georgetown University",
        type: "internship" as const,
        description: "Georgetown's Economics Policy Academy provides an interdisciplinary exploration of the complex role played by states and other governing entities in relation to markets, through the lens of both economics and political science. You'll study theoretical concepts from both fields and practice applying them to real-world problems.",
        source: "CTEE Summer Programs",
        link: "https://summer.georgetown.edu/?utm_source=teenlife&utm_medium=list&utm_campaign=fy23-dmi-shs-list-tlife-listprem",
        deadline: "July (Three Weeks)",
        requirements: ["9th, 10th, 11th, 12th grade"],
        tags: ["georgetown", "economics", "policy", "interdisciplinary", "real-world"]
      },
      {
        title: "Yale Young Scholars' Politics, Law & Economics Program",
        organization: "Yale University",
        type: "internship" as const,
        description: "Yale Young Global Scholars invites students from over 150 countries and all 50 U.S. states to spend two weeks at Yale University attending an academic session of their choice. Politics, Law, & Economics (PLE) is a session aimed at students with an interest in understanding diverse economic theories, the values and practices of government, and legal frameworks.",
        source: "CTEE Summer Programs",
        link: "https://globalscholars.yale.edu/teenlife?utm_source=teenlife",
        deadline: "June, July (Two Weeks)",
        requirements: ["11th, 12th grade"],
        tags: ["yale", "politics", "law", "economics", "global", "ivy-league"]
      },
      {
        title: "Wharton Global Youth High School Programs",
        organization: "Wharton School",
        type: "internship" as const,
        description: "The Wharton Summer High School Programs are immersive experiences for students currently enrolled in grades 9–11. Led by Wharton faculty and instructional staff, programs explore topics that align with Wharton research and teaching.",
        source: "CTEE Summer Programs",
        link: "https://globalyouth.wharton.upenn.edu/?utm_source=teenlife",
        deadline: "June, July (One to Three Weeks)",
        requirements: ["10th, 11th, 12th grade"],
        tags: ["wharton", "immersive", "faculty-led", "research-aligned", "prestigious"]
      }
    ];

    let importCount = 0;
    for (const program of summerPrograms) {
      try {
        const opportunity: InsertOpportunity = {
          title: program.title,
          description: program.description,
          organization: program.organization,
          type: program.type,
          source: program.source,
          url: program.link,
          deadline: program.deadline,
          requirements: program.requirements,
          tags: program.tags,
          relevancyScore: 85,
          amount: null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported CTEE summer program: ${program.title}`);
      } catch (error) {
        console.log(`Duplicate CTEE summer program skipped: ${program.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} CTEE summer programs (first batch)`);
  }

  async importFromCTEEYearlyPrograms(): Promise<void> {
    console.log('📄 Importing from CTEE Yearly Programs CSV...');
    
    const yearlyPrograms = [
      {
        title: "Georgetown Pre-college Online Business Programs",
        organization: "Georgetown University",
        type: "internship" as const,
        description: "Thinking about going into the field of entrepreneurship or international relations? Georgetown University now offers pre-college online courses for high school students ages 13 and older. Each course features dynamic video lessons by renowned Georgetown faculty and access to mentors. The program is available year-round.",
        source: "CTEE Yearly Programs",
        link: "Link here",
        deadline: "Applications open all year round",
        requirements: ["Age 13+"],
        tags: ["georgetown", "online", "entrepreneurship", "year-round", "mentors"]
      },
      {
        title: "Columbia University: Business, Economics, and Entrepreneurship",
        organization: "Columbia University",
        type: "internship" as const,
        description: "Thinking about going into the field of entrepreneurship or international relations? Columbia University offers pre-college courses for high school students. Each course features dynamic video lessons by renowned faculty and access to mentors.",
        source: "CTEE Yearly Programs",
        link: "https://precollege.sps.columbia.edu/highschool/academic-year-immersion",
        deadline: "Fall 2022: September 24–December 4, 2022 | Spring 2023: January 21–March 26, 2023",
        requirements: ["Grades 9-12"],
        tags: ["columbia", "business", "economics", "entrepreneurship", "highly-selective"]
      },
      {
        title: "Courses at Tufts for High Schoolers",
        organization: "Tufts University",
        type: "internship" as const,
        description: "Want to take a class or two and experience what it is like to study at Tufts University? This program allows motivated high school students to enroll in Tufts Undergraduate-level courses, studio art workshops, and (during the summer) capstone College Prep workshops.",
        source: "CTEE Yearly Programs",
        link: "https://universitycollege.tufts.edu/high-school/programs/courses-high-schoolers#Program-Highlights",
        deadline: "Fall Semester September 6 - December 12, 2022",
        requirements: ["Grades 10-12"],
        tags: ["tufts", "undergraduate-courses", "studio-art", "college-prep", "flexible"]
      },
      {
        title: "High School Economics Curriculum — Time4Learning",
        organization: "Time4Learning",
        type: "internship" as const,
        description: "A high school economics curriculum aims to help students understand what economics is, how it plays a part in their daily lives, and how it affects the world around them. This page includes information on why it's important to learn about economics.",
        source: "CTEE Yearly Programs",
        link: "https://www.time4learning.com/homeschool-curriculum/high-school-economics.html",
        deadline: "Fall Semester September 6 - December 12, 2022",
        requirements: ["PreK-12th grade"],
        tags: ["economics", "curriculum", "daily-life", "world-impact", "homeschool"]
      }
    ];

    let importCount = 0;
    for (const program of yearlyPrograms) {
      try {
        const opportunity: InsertOpportunity = {
          title: program.title,
          description: program.description,
          organization: program.organization,
          type: program.type,
          source: program.source,
          url: program.link,
          deadline: program.deadline,
          requirements: program.requirements,
          tags: program.tags,
          relevancyScore: 85,
          amount: null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported CTEE yearly program: ${program.title}`);
      } catch (error) {
        console.log(`Duplicate CTEE yearly program skipped: ${program.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} CTEE yearly programs`);
  }

  async importFromExpansionPDF(): Promise<void> {
    console.log('📄 Importing from High School Opportunities Expansion PDF (first 10)...');
    
    const expansionOpps = [
      {
        title: "Johns Hopkins Internship in Brain Sciences (JHIBS)",
        organization: "Johns Hopkins University",
        type: "internship" as const,
        description: "Eight-week summer research internship in neurological sciences for high school juniors and seniors from underrepresented backgrounds. Includes lab research at Johns Hopkins and clinical shadowing.",
        source: "Expansion PDF",
        link: "https://www.hopkinsmedicine.org/neurology-neurosurgery/research/jhu-nimh/jhibs",
        deadline: "Applications open Dec 1, 2024; due Mar 1, 2025",
        requirements: ["High school juniors and seniors", "Underrepresented backgrounds"],
        tags: ["johns-hopkins", "neuroscience", "research", "clinical", "underrepresented"]
      },
      {
        title: "Biophysics Research for Baltimore Teens (BRBT)",
        organization: "Johns Hopkins University",
        type: "internship" as const,
        description: "Six-week paid summer research internship at Johns Hopkins for Baltimore City high school students interested in biophysics, with hands-on lab experience.",
        source: "Expansion PDF",
        link: "https://sites.krieger.jhu.edu/brbt",
        deadline: "February 28, 2025",
        requirements: ["Baltimore City high school students", "Interest in biophysics"],
        tags: ["johns-hopkins", "biophysics", "paid", "baltimore", "hands-on"]
      },
      {
        title: "Summer Academic Research Experience (SARE)",
        organization: "Johns Hopkins School of Medicine",
        type: "internship" as const,
        description: "Eight-week biomedical research program at Johns Hopkins School of Medicine for students from low-income, underrepresented backgrounds. Includes hands-on lab research, coursework, and a $3,000 stipend.",
        source: "Expansion PDF",
        link: "https://sare.cellbio.jhmi.edu",
        deadline: "No fixed deadline (applications open Nov 1, 2024; rolling through early 2025)",
        requirements: ["Low-income", "Underrepresented backgrounds"],
        tags: ["johns-hopkins", "biomedical", "stipend", "underrepresented", "research"]
      },
      {
        title: "JHU APL ASPIRE High School Mentoring Program",
        organization: "Johns Hopkins Applied Physics Lab",
        type: "internship" as const,
        description: "School-year STEM mentoring program at Johns Hopkins Applied Physics Lab where students work on research projects with APL scientists (15–20% acceptance rate).",
        source: "Expansion PDF",
        link: "https://secwww.jhuapl.edu/stem/aspire",
        deadline: "February 15, 2024 (for 2024–25 cycle)",
        requirements: ["High school students", "Interest in STEM"],
        tags: ["johns-hopkins", "physics", "mentoring", "STEM", "competitive"]
      },
      {
        title: "MIT THINK Scholars Program",
        organization: "MIT",
        type: "competition" as const,
        description: "National program where high school students propose STEM projects and receive mentorship and funding up to $1,000 to execute their research. Includes a trip to MIT for selected winners.",
        source: "Expansion PDF",
        link: "https://think.mit.edu",
        deadline: "January 1, 2025",
        requirements: ["High school students", "STEM project proposal"],
        tags: ["MIT", "STEM", "funding", "mentorship", "research"]
      },
      {
        title: "Breakthrough Junior Challenge",
        organization: "Breakthrough Prize Foundation",
        type: "competition" as const,
        description: "Global science video competition where students (13–18) explain a scientific concept. Top prize is a $250,000 college scholarship.",
        source: "Expansion PDF",
        link: "https://breakthroughjuniorchallenge.org",
        deadline: "September 15, 2025",
        requirements: ["Ages 13-18", "Science communication"],
        tags: ["science", "video", "global", "scholarship", "communication"]
      },
      {
        title: "Conrad Challenge",
        organization: "Conrad Foundation",
        type: "competition" as const,
        description: "International entrepreneurship competition for teams of 2–5 students to develop innovative solutions in categories like Aerospace, Energy, Health, etc. Finalists pitch at the Innovation Summit and compete for scholarships and prizes.",
        source: "Expansion PDF",
        link: "https://www.conradchallenge.org",
        deadline: "Team registration by November 15, 2025 (for 2025–26 season)",
        requirements: ["Teams of 2-5 students", "Innovation focus"],
        tags: ["entrepreneurship", "innovation", "aerospace", "energy", "health"]
      },
      {
        title: "We the Students Essay Contest",
        organization: "Bill of Rights Institute",
        type: "competition" as const,
        description: "Annual essay competition on civil liberties and constitutional principles, run by the Bill of Rights Institute. Offers a $7,500 grand prize scholarship.",
        source: "Expansion PDF",
        link: "https://billofrightsinstitute.org/engage/students-programs-events/scholarship",
        deadline: "April 15, 2025 (approximately)",
        requirements: ["High school students", "Essay writing"],
        tags: ["essay", "constitution", "civil-liberties", "scholarship", "writing"]
      },
      {
        title: "Technovation Girls",
        organization: "Technovation",
        type: "competition" as const,
        description: "Global technology entrepreneurship competition where teams of girls (ages 10–18) develop a mobile app or AI project to solve a community problem. Winners can earn scholarships and a trip to the World Summit.",
        source: "Expansion PDF",
        link: "https://technovationchallenge.org",
        deadline: "Registration by March 17, 2025; project submission due May 5, 2025",
        requirements: ["Girls ages 10-18", "Technology/AI focus"],
        tags: ["technology", "girls", "AI", "mobile-app", "community"]
      },
      {
        title: "Diamond Challenge",
        organization: "Diamond Challenge",
        type: "competition" as const,
        description: "Global entrepreneurship competition for high school students to pitch business or social venture ideas (in Business or Social tracks) for a $100,000 prize pool. Teams submit a business concept and pitch to judges.",
        source: "Expansion PDF",
        link: "https://diamondchallenge.org",
        deadline: "January 16, 2025",
        requirements: ["High school students", "Business or social venture"],
        tags: ["entrepreneurship", "business", "social-venture", "pitch", "global"]
      }
    ];

    let importCount = 0;
    for (const opp of expansionOpps) {
      try {
        const opportunity: InsertOpportunity = {
          title: opp.title,
          description: opp.description,
          organization: opp.organization,
          type: opp.type,
          source: opp.source,
          url: opp.link,
          deadline: opp.deadline,
          requirements: opp.requirements,
          tags: opp.tags,
          relevancyScore: 90,
          amount: null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported expansion opportunity: ${opp.title}`);
      } catch (error) {
        console.log(`Duplicate expansion opportunity skipped: ${opp.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} expansion opportunities (first batch)`);
  }

  async importFromBatch2CSV(): Promise<void> {
    console.log('📄 Importing from high_school_opportunities_batch2.csv...');
    
    const batch2 = [
      { title: "NSA Student & Internship Programs", organization: "NSA", description: "Paid internships, scholarships from NSA", link: "https://www.intelligencecareers.gov/nsa/students-and-internships", tags: ["NSA", "internship", "scholarship", "cyber", "STEM"] },
      { title: "Stanford AIMI AI in Medicine Internship", organization: "Stanford", description: "Virtual summer AI & healthcare research", link: "https://aimi.stanford.edu/education/summer-research-internship", tags: ["stanford", "AI", "medicine", "virtual", "research"] },
      { title: "Northwestern SciHigh Summer Program", organization: "Northwestern", description: "Research-intensive STEM internship", link: "https://www.feinberg.northwestern.edu/sites/stem-programs/hs.html", tags: ["northwestern", "STEM", "research", "chicago"] },
      { title: "Scripps High School Internship", organization: "Scripps Research", description: "Biomedical summer research experience", link: "https://www.scripps.edu/internship/", tags: ["scripps", "biomedical", "research", "california"] },
      { title: "George Mason ASSIP", organization: "George Mason University", description: "STEM research with faculty mentorship", link: "https://science.gmu.edu/assip", tags: ["george-mason", "STEM", "mentorship", "virginia"] },
      { title: "Vanderbilt IMSD Biomedical Program", organization: "Vanderbilt", description: "Lab skills & biomedical research", link: "https://medschool.vanderbilt.edu/imsd/high-school-summer-program/", tags: ["vanderbilt", "biomedical", "lab-skills", "tennessee"] },
      { title: "Princeton PPPL Summer Internship", organization: "Princeton", description: "Research at plasma physics lab", link: "https://pppl-new2.princeton.edu/high-school-summer-internship", tags: ["princeton", "physics", "plasma", "research"] },
      { title: "Summer Science Program (SSP)", organization: "SSP", description: "College-level astrophysics/biochemistry research", link: "http://www.summerscience.org/", tags: ["astrophysics", "biochemistry", "research", "college-level"] },
      { title: "Research Science Institute (RSI)", organization: "CEE", description: "Elite MIT-based STEM research, 6-weeks", link: "https://www.cee.org/programs/research-science-institute", tags: ["MIT", "elite", "STEM", "research"] },
      { title: "Coca-Cola Scholars Program", organization: "Coca-Cola", description: "$20K achievement scholarship", link: "https://www.coca-colascholarsfoundation.org/apply/", tags: ["scholarship", "achievement", "national", "coca-cola"] }
    ];

    let importCount = 0;
    for (const opp of batch2) {
      try {
        const opportunity: InsertOpportunity = {
          title: opp.title,
          description: opp.description,
          organization: opp.organization,
          type: "internship" as const,
          source: "Batch 2 CSV",
          url: opp.link,
          deadline: "Varies",
          requirements: ["High school students"],
          tags: opp.tags,
          relevancyScore: 88,
          amount: null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported batch 2: ${opp.title}`);
      } catch (error) {
        console.log(`Duplicate batch 2 skipped: ${opp.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} batch 2 opportunities`);
  }

  async importFromBatch3CSV(): Promise<void> {
    console.log('📄 Importing from high_school_opportunities_batch3.csv...');
    
    const batch3 = [
      { title: "Brown Cancer Center HS Summer Research Program", organization: "Brown Cancer Center", description: "8-week wet-lab research internship for high schoolers in cancer biology", link: "https://louisville.edu/medicine/cancer-research/education-and-training/sumint/sumintprogram", tags: ["cancer", "research", "wet-lab", "biology"] },
      { title: "NSHSS Scholarships", organization: "NSHSS", description: "Various scholarships in academics, leadership, and medicine for high school students", link: "https://www.nshss.org/scholarships/", tags: ["scholarship", "academics", "leadership", "medicine"] },
      { title: "Young Scholars STEMM (UIUC)", organization: "University of Illinois", description: "6-week mentored STEM research experience with symposium", link: "https://wyse.grainger.illinois.edu/summer-programs/young-scholars-summer-research", tags: ["UIUC", "STEM", "research", "symposium"] },
      { title: "Cedars-Sinai INSPIRE Internship", organization: "Cedars-Sinai", description: "6–10 week medical research internship with mentoring and workshops", link: "https://www.cedars-sinai.edu/education/professional-training-programs/internship/inspire.html", tags: ["medical", "research", "mentoring", "workshops"] },
      { title: "MSKCC Summer Student Program", organization: "Memorial Sloan Kettering", description: "8-week paid cancer research internship", link: "https://www.sloankettering.edu/education-training/summer-student", tags: ["cancer", "research", "paid", "memorial"] },
      { title: "National Merit Scholarship", organization: "National Merit", description: "National scholarship based on PSAT/NMSQT scores and academic achievement", link: "https://www.nationalmerit.org/", tags: ["scholarship", "PSAT", "academic", "national"] },
      { title: "Jack Kent Cooke Scholarships", organization: "Jack Kent Cooke Foundation", description: "Highly competitive merit and need-based scholarships for exceptional students", link: "https://www.jkcf.org/our-scholarships/", tags: ["scholarship", "merit", "need-based", "exceptional"] },
      { title: "Stanford GRIPS Genomics Internship", organization: "Stanford", description: "8-week mentored genomics research", link: "https://eso.stanford.edu/programs/high-school-students", tags: ["stanford", "genomics", "research", "mentored"] },
      { title: "US Senate Youth Program", organization: "US Senate", description: "$10K scholarship and weeklong experience in Washington, D.C.", link: "https://en.wikipedia.org/wiki/United_States_Senate_Youth_Program", tags: ["scholarship", "government", "washington", "leadership"] },
      { title: "QCaMP Quantum Camp", organization: "QCaMP", description: "4-week summer camp on quantum computing and science", link: "https://arxiv.org/abs/2504.15977", tags: ["quantum", "computing", "science", "camp"] }
    ];

    let importCount = 0;
    for (const opp of batch3) {
      try {
        const opportunity: InsertOpportunity = {
          title: opp.title,
          description: opp.description,
          organization: opp.organization,
          type: "internship" as const,
          source: "Batch 3 CSV",
          url: opp.link,
          deadline: "Varies",
          requirements: ["High school students"],
          tags: opp.tags,
          relevancyScore: 88,
          amount: null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported batch 3: ${opp.title}`);
      } catch (error) {
        console.log(`Duplicate batch 3 skipped: ${opp.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} batch 3 opportunities`);
  }

  async importFromBatch4CSV(): Promise<void> {
    console.log('📄 Importing from high_school_opportunities_batch4.csv...');
    
    const batch4 = [
      { title: "Summer Science Research Program (Rockefeller)", organization: "Rockefeller University", description: "7-week mentored lab research for HS juniors/seniors", link: "https://www.rockefeller.edu/outreach/ssrp/", tags: ["rockefeller", "research", "lab", "mentored"] },
      { title: "FSU Young Scholars Program", organization: "Florida State University", description: "6-week residential math/science research for FL students", link: "https://ysp.osta.fsu.edu/", tags: ["FSU", "math", "science", "residential"] },
      { title: "Northwestern HPREP/Kim Querrey", organization: "Northwestern", description: "6-week paid summer med research program", link: "https://www.feinberg.northwestern.edu/sites/stem-programs/hs.html", tags: ["northwestern", "medical", "paid", "research"] },
      { title: "Gates Scholarship", organization: "Gates Foundation", description: "Last-dollar full ride for low-income seniors", link: "https://www.thegatesscholarship.org/scholarship", tags: ["scholarship", "full-ride", "low-income", "gates"] },
      { title: "Amazon Future Engineer Scholarship", organization: "Amazon", description: "$40,000 + internship for CS-interested seniors", link: "https://www.amazonfutureengineer.com/scholarships", tags: ["amazon", "computer-science", "scholarship", "internship"] },
      { title: "Davidson Fellows Scholarship", organization: "Davidson Institute", description: "$10K–$50K for significant original work", link: "https://www.davidsongifted.org/gifted-programs/fellows-scholarship/", tags: ["davidson", "scholarship", "original-work", "gifted"] },
      { title: "AFS Global STEM Academies", organization: "AFS", description: "Fully funded study abroad + STEM innovation", link: "https://afs.org/global-stem/", tags: ["study-abroad", "STEM", "global", "innovation"] },
      { title: "National Youth Science Camp", organization: "NYSC", description: "All-expenses-paid STEM camp in West Virginia", link: "https://www.nyscamp.org/", tags: ["STEM", "camp", "west-virginia", "expenses-paid"] },
      { title: "Hutton Junior Fisheries Biology Program", organization: "Hutton Program", description: "8-week paid fisheries science internship", link: "https://hutton.fisheries.org/", tags: ["fisheries", "biology", "paid", "science"] },
      { title: "Bank of America Student Leaders", organization: "Bank of America", description: "Paid summer nonprofit internship + D.C. summit", link: "https://about.bankofamerica.com/en/making-an-impact/student-leaders", tags: ["bank-of-america", "nonprofit", "leadership", "DC"] }
    ];

    let importCount = 0;
    for (const opp of batch4) {
      try {
        const opportunity: InsertOpportunity = {
          title: opp.title,
          description: opp.description,
          organization: opp.organization,
          type: "internship" as const,
          source: "Batch 4 CSV",
          url: opp.link,
          deadline: "Varies",
          requirements: ["High school students"],
          tags: opp.tags,
          relevancyScore: 88,
          amount: null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported batch 4: ${opp.title}`);
      } catch (error) {
        console.log(`Duplicate batch 4 skipped: ${opp.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} batch 4 opportunities`);
  }

  async importFromBatch5CSV(): Promise<void> {
    console.log('📄 Importing from high_school_opportunities_batch5.csv...');
    
    const batch5 = [
      { title: "Summer Science Research Program (Rockefeller)", organization: "Rockefeller University", description: "7-week mentored lab research for HS juniors/seniors", link: "https://www.rockefeller.edu/outreach/ssrp/", tags: ["rockefeller", "research", "lab", "mentored"] },
      { title: "Shoals Marine Laboratory", organization: "Shoals Marine Lab", description: "Summer fieldwork & marine science courses", link: "https://en.wikipedia.org/wiki/Shoals_Marine_Laboratory", tags: ["marine", "fieldwork", "science", "courses"] },
      { title: "Worldwide Youth in Science (WYSE)", organization: "WYSE", description: "Academic STEM challenge & mentorship", link: "https://en.wikipedia.org/wiki/Worldwide_Youth_in_Science_and_Engineering", tags: ["STEM", "challenge", "mentorship", "worldwide"] },
      { title: "PROMYS (Boston U)", organization: "Boston University", description: "6-week intensive math research program", link: "https://promys.org/", tags: ["boston", "math", "intensive", "research"] }
    ];

    let importCount = 0;
    for (const opp of batch5) {
      try {
        const opportunity: InsertOpportunity = {
          title: opp.title,
          description: opp.description,
          organization: opp.organization,
          type: "internship" as const,
          source: "Batch 5 CSV",
          url: opp.link,
          deadline: "Varies",
          requirements: ["High school students"],
          tags: opp.tags,
          relevancyScore: 88,
          amount: null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported batch 5: ${opp.title}`);
      } catch (error) {
        console.log(`Duplicate batch 5 skipped: ${opp.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} batch 5 opportunities`);
  }

  async importFromBatch6CSV(): Promise<void> {
    console.log('📄 Importing from high_school_opportunities_batch6.csv...');
    
    const batch6 = [
      { title: "MIT Women's Technology Program", organization: "MIT", description: "4-week residential summer program in EECS for rising senior girls", link: "https://wtp.mit.edu/", tags: ["MIT", "women", "technology", "EECS", "residential"] },
      { title: "AI4ALL Summer Camps", organization: "AI4ALL", description: "Hands-on AI training for underrepresented HS students at top universities", link: "https://ai-4-all.org/programs/", tags: ["AI", "underrepresented", "training", "universities"] },
      { title: "Girls Who Code Summer Immersion", organization: "Girls Who Code", description: "Free 2-week coding intensive for girls and nonbinary students", link: "https://girlswhocode.com/programs/summer-immersion-program", tags: ["girls", "coding", "nonbinary", "immersion"] },
      { title: "NASA Internships for High School Students", organization: "NASA", description: "STEM internships with NASA engineers and scientists", link: "https://intern.nasa.gov/", tags: ["NASA", "STEM", "engineers", "scientists"] },
      { title: "Carnegie Mellon Pre-College Programs", organization: "Carnegie Mellon", description: "Rigorous pre-college courses in STEM, arts, and more", link: "https://www.cmu.edu/pre-college/", tags: ["carnegie-mellon", "pre-college", "STEM", "arts"] },
      { title: "Library of Congress Internships", organization: "Library of Congress", description: "High school internships in history, archiving, and library science", link: "https://www.loc.gov/item/internships/", tags: ["library", "history", "archiving", "science"] },
      { title: "Harvard Secondary School Program", organization: "Harvard", description: "7-week for-credit Harvard summer courses for HS students", link: "https://summer.harvard.edu/secondary-school-program/", tags: ["harvard", "secondary", "credit", "courses"] },
      { title: "Google Computer Science Summer Institute (CSSI)", organization: "Google", description: "3-week CS intro and mentorship for underrepresented students", link: "https://buildyourfuture.withgoogle.com/programs/computer-science-summer-institute", tags: ["google", "computer-science", "mentorship", "underrepresented"] },
      { title: "TASS Summer Seminar", organization: "Telluride Association", description: "Humanities seminars on race and social justice", link: "https://tellurideassociation.org/our-programs/high-school-students/tass/", tags: ["humanities", "race", "social-justice", "seminar"] }
    ];

    let importCount = 0;
    for (const opp of batch6) {
      try {
        const opportunity: InsertOpportunity = {
          title: opp.title,
          description: opp.description,
          organization: opp.organization,
          type: "internship" as const,
          source: "Batch 6 CSV",
          url: opp.link,
          deadline: "Varies",
          requirements: ["High school students"],
          tags: opp.tags,
          relevancyScore: 88,
          amount: null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported batch 6: ${opp.title}`);
      } catch (error) {
        console.log(`Duplicate batch 6 skipped: ${opp.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} batch 6 opportunities`);
  }

  async importFromBatch7CSV(): Promise<void> {
    console.log('📄 Importing from high_school_opportunities_batch7.csv...');
    
    const batch7 = [
      { title: "MIT Women's Technology Program", organization: "MIT", description: "4-week residential EECS summer program for rising senior girls", link: "https://wtp.mit.edu/", tags: ["MIT", "women", "technology", "EECS"] },
      { title: "AI4ALL Summer Camps", organization: "AI4ALL", description: "Hands-on AI training for underrepresented HS students", link: "https://ai-4-all.org/programs/", tags: ["AI", "underrepresented", "training"] },
      { title: "Girls Who Code Summer Immersion", organization: "Girls Who Code", description: "Free 2-week coding intensive for girls and nonbinary students", link: "https://girlswhocode.com/programs/summer-immersion-program", tags: ["girls", "coding", "nonbinary"] },
      { title: "NYT Summer Academy", organization: "New York Times", description: "Pre-college journalism and writing program with NYT staff", link: "https://nytedu.com/pre-college", tags: ["journalism", "writing", "NYT", "pre-college"] },
      { title: "NASA Internships for High School Students", organization: "NASA", description: "STEM internships with NASA engineers", link: "https://intern.nasa.gov/", tags: ["NASA", "STEM", "engineers"] },
      { title: "Carnegie Mellon Pre-College Programs", organization: "Carnegie Mellon", description: "Rigorous pre-college courses in STEM & arts", link: "https://www.cmu.edu/pre-college/", tags: ["carnegie-mellon", "pre-college", "STEM"] },
      { title: "Library of Congress Internships", organization: "Library of Congress", description: "History and archiving internships for HS students", link: "https://www.loc.gov/item/internships/", tags: ["library", "history", "archiving"] },
      { title: "Harvard Secondary School Program", organization: "Harvard", description: "7-week for-credit Harvard summer courses", link: "https://summer.harvard.edu/secondary-school-program/", tags: ["harvard", "secondary", "credit"] },
      { title: "Google CS Summer Institute (CSSI)", organization: "Google", description: "3-week CS intro & mentorship for underrepresented seniors", link: "https://buildyourfuture.withgoogle.com/programs/computer-science-summer-institute", tags: ["google", "computer-science", "mentorship"] },
      { title: "TASS Summer Seminar", organization: "Telluride Association", description: "Humanities seminars on race & social justice", link: "https://tellurideassociation.org/our-programs/high-school-students/tass/", tags: ["humanities", "race", "social-justice"] }
    ];

    let importCount = 0;
    for (const opp of batch7) {
      try {
        const opportunity: InsertOpportunity = {
          title: opp.title,
          description: opp.description,
          organization: opp.organization,
          type: "internship" as const,
          source: "Batch 7 CSV",
          url: opp.link,
          deadline: "Varies",
          requirements: ["High school students"],
          tags: opp.tags,
          relevancyScore: 88,
          amount: null,
          location: 'Various',
          salary: null
        };
        await storage.createOpportunity(opportunity);
        importCount++;
        console.log(`✓ Imported batch 7: ${opp.title}`);
      } catch (error) {
        console.log(`Duplicate batch 7 skipped: ${opp.title}`);
      }
    }
    
    console.log(`Successfully imported ${importCount} batch 7 opportunities`);
  }

}

export const dataImporter = new DataImporter();