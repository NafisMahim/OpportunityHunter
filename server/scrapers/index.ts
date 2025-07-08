import axios from 'axios';
import * as cheerio from 'cheerio';
import type { InsertOpportunity } from '@shared/schema';

export interface Scraper {
  name: string;
  scrape(userProfile?: any): Promise<InsertOpportunity[]>;
}

// HTTP-based scraper for multiple job boards and opportunity sites
class WebOpportunityScraper implements Scraper {
  name = 'Web Opportunities';

  async scrape(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      // Get user preferences for opportunity types
      const preferredTypes = userProfile?.opportunityTypes || ['job', 'internship', 'grant', 'scholarship', 'competition'];
      
      // Scrape jobs if requested (limit to entry-level and high school appropriate)
      if (preferredTypes.includes('job')) {
        console.log('Scraping entry-level job opportunities...');
        const entryLevelJobs = await this.scrapeEntryLevelJobs(userProfile);
        const techJobs = await this.scrapeTechJobsForStudents(userProfile);
        const partTimeJobs = await this.scrapePartTimeJobs(userProfile);
        opportunities.push(...entryLevelJobs, ...techJobs, ...partTimeJobs);
      }
      
      // Scrape internships if requested
      if (preferredTypes.includes('internship')) {
        console.log('Scraping internship opportunities...');
        const internships = await this.scrapeInternships(userProfile);
        opportunities.push(...internships);
      }
      
      // Scrape grants if requested
      if (preferredTypes.includes('grant')) {
        console.log('Scraping grant opportunities...');
        const grants = await this.scrapeGrants(userProfile);
        opportunities.push(...grants);
      }
      
      // Scrape scholarships if requested
      if (preferredTypes.includes('scholarship')) {
        console.log('Scraping scholarship opportunities...');
        const scholarships = await this.scrapeScholarships(userProfile);
        opportunities.push(...scholarships);
      }
      
      // Scrape competitions if requested
      if (preferredTypes.includes('competition')) {
        console.log('Scraping competition opportunities...');
        const competitions = await this.scrapeCompetitions(userProfile);
        opportunities.push(...competitions);
      }

    } catch (error) {
      console.error('Web scraping error:', error);
    }

    console.log(`Found ${opportunities.length} opportunities from web scraping`);
    return opportunities;
  }

  private async scrapeHackerNewsJobs(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      // Get latest "Who's Hiring" thread
      const response = await axios.get('https://hacker-news.firebaseio.com/v0/item/39217963.json');
      const thread = response.data;
      
      if (thread && thread.kids) {
        // Get first 20 job posts
        const jobIds = thread.kids.slice(0, 20);
        
        for (const jobId of jobIds) {
          try {
            const jobResponse = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${jobId}.json`);
            const job = jobResponse.data;
            
            if (job && job.text) {
              const opportunity = this.parseHNJob(job, userProfile);
              if (opportunity) {
                opportunities.push(opportunity);
              }
            }
          } catch (error) {
            console.error(`Error fetching HN job ${jobId}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error scraping Hacker News:', error);
    }

    return opportunities;
  }

  private parseHNJob(job: any, userProfile?: any): InsertOpportunity | null {
    try {
      const text = job.text;
      const lines = text.split('\n').filter((line: string) => line.trim());
      
      // Try to extract job title and company
      let title = 'Software Engineer';
      let company = 'Startup';
      let location = 'Remote';
      let description = text.substring(0, 500);

      // Look for common patterns
      for (const line of lines) {
        if (line.includes('SEEKING:') || line.includes('HIRING:')) {
          title = line.replace(/SEEKING:|HIRING:/gi, '').trim();
        }
        if (line.includes('Company:') || line.includes('At ')) {
          company = line.replace(/Company:|At /gi, '').trim().split(' ')[0];
        }
        if (line.includes('Location:') || line.includes('Remote') || line.includes('SF') || line.includes('NYC')) {
          location = line;
        }
      }

      return {
        type: 'job',
        title: title.substring(0, 100),
        description: description.replace(/<[^>]*>/g, ''), // Remove HTML tags
        source: 'Hacker News',
        organization: company.substring(0, 50),
        location: location.substring(0, 50),
        url: `https://news.ycombinator.com/item?id=${job.id}`,
        relevancyScore: this.calculateRelevancyScore(text, userProfile),
        requirements: this.extractRequirements(text),
        tags: this.generateTags(text, 'job'),
        salary: this.extractSalary(text),
        deadline: null,
        amount: null,
        prize: null
      };
    } catch (error) {
      console.error('Error parsing HN job:', error);
      return null;
    }
  }

  private async scrapeRemoteOK(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      const response = await axios.get('https://remoteok.io/api', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OpportunityBot/1.0)',
          'Accept': 'application/json'
        }
      });

      const jobs = response.data;
      
      if (Array.isArray(jobs)) {
        for (let i = 1; i < Math.min(21, jobs.length); i++) { // Skip first element (metadata)
          const job = jobs[i];
          
          if (job.position && job.company) {
            opportunities.push({
              type: 'job',
              title: job.position,
              description: job.description || `Remote ${job.position} at ${job.company}`,
              source: 'RemoteOK',
              organization: job.company,
              location: 'Remote',
              url: job.url || `https://remoteok.io/remote-jobs/${job.id}`,
              relevancyScore: this.calculateRelevancyScore(job.position + ' ' + job.description, userProfile),
              requirements: ['Remote work capability'],
              tags: job.tags ? (Array.isArray(job.tags) ? job.tags.slice(0, 5) : job.tags.split(',').slice(0, 5)) : ['remote', 'job'],
              salary: job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : null,
              deadline: null,
              amount: null,
              prize: null
            });
          }
        }
      }
    } catch (error) {
      console.error('Error scraping RemoteOK:', error);
    }

    return opportunities;
  }

  private async scrapeJobBoards(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      // Scrape actual job sites using RSS feeds and APIs
      await this.scrapeStackOverflowJobs(opportunities, userProfile);
      await this.scrapeYCombinatorJobs(opportunities, userProfile);
      await this.scrapeGitHubIssues(opportunities, userProfile);
      
    } catch (error) {
      console.error('Error scraping job boards:', error);
    }

    return opportunities;
  }

  private async scrapeStackOverflowJobs(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      // Use StackOverflow RSS feed for jobs
      const response = await axios.get('https://stackoverflow.com/jobs/feed', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OpportunityBot/1.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      
      $('item').each((index, element) => {
        if (index >= 10) return false; // Limit results
        
        const $item = $(element);
        const title = $item.find('title').text().trim();
        const description = $item.find('description').text().trim();
        const link = $item.find('link').text().trim();
        const pubDate = $item.find('pubDate').text().trim();
        
        if (title && description) {
          opportunities.push({
            type: 'job',
            title: title.substring(0, 100),
            description: description.substring(0, 500),
            source: 'Stack Overflow Jobs',
            organization: this.extractCompanyFromDescription(description),
            location: this.extractLocation(description) || 'Not specified',
            url: link,
            relevancyScore: this.calculateRelevancyScore(title + ' ' + description, userProfile),
            requirements: this.extractRequirements(description),
            tags: this.generateTags(title + ' ' + description, 'job'),
            salary: this.extractSalary(description),
            deadline: null,
            amount: null,
            prize: null
          });
        }
      });
    } catch (error) {
      console.error('Error scraping Stack Overflow Jobs:', error);
    }
  }

  private async scrapeYCombinatorJobs(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      // Scrape YC startup directory
      const response = await axios.get('https://www.ycombinator.com/companies', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OpportunityBot/1.0)',
          'Accept': 'text/html'
        }
      });

      const $ = cheerio.load(response.data);
      
      $('[data-company]').each((index, element) => {
        if (index >= 15) return false;
        
        const $company = $(element);
        const companyName = $company.find('.company-name, h3').first().text().trim();
        const description = $company.find('.company-description, p').first().text().trim();
        const location = $company.find('.company-location').text().trim();
        const link = $company.find('a').attr('href');
        
        if (companyName && description) {
          opportunities.push({
            type: 'job',
            title: `Software Engineer at ${companyName}`,
            description: description.substring(0, 500),
            source: 'Y Combinator',
            organization: companyName,
            location: location || 'Startup',
            url: link ? `https://www.ycombinator.com${link}` : 'https://www.ycombinator.com/companies',
            relevancyScore: this.calculateRelevancyScore(description, userProfile),
            requirements: ['Startup experience preferred'],
            tags: ['startup', 'job', 'yc'],
            salary: null,
            deadline: null,
            amount: null,
            prize: null
          });
        }
      });
    } catch (error) {
      console.error('Error scraping Y Combinator:', error);
    }
  }

  private async scrapeGitHubIssues(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      // Use GitHub API to find job-related issues
      const response = await axios.get('https://api.github.com/search/issues', {
        params: {
          q: 'label:hiring OR label:job OR label:career in:title',
          sort: 'updated',
          per_page: 10
        },
        headers: {
          'User-Agent': 'OpportunityBot/1.0',
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      const issues = response.data.items || [];
      
      for (const issue of issues) {
        if (issue.title && issue.body) {
          opportunities.push({
            type: 'job',
            title: issue.title.substring(0, 100),
            description: (issue.body || '').substring(0, 500),
            source: 'GitHub Jobs',
            organization: this.extractOrgFromUrl(issue.html_url),
            location: this.extractLocation(issue.body) || 'Remote',
            url: issue.html_url,
            relevancyScore: this.calculateRelevancyScore(issue.title + ' ' + issue.body, userProfile),
            requirements: this.extractRequirements(issue.body || ''),
            tags: this.generateTags(issue.title + ' ' + issue.body, 'job'),
            salary: this.extractSalary(issue.body || ''),
            deadline: null,
            amount: null,
            prize: null
          });
        }
      }
    } catch (error) {
      console.error('Error scraping GitHub issues:', error);
    }
  }

  private extractCompanyFromDescription(description: string): string {
    // Try to extract company name from job description
    const patterns = [
      /at ([A-Z][a-zA-Z\s]+?) is/,
      /join ([A-Z][a-zA-Z\s]+?) as/,
      /([A-Z][a-zA-Z\s]+?) is hiring/,
      /work at ([A-Z][a-zA-Z\s]+)/
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1].trim().substring(0, 50);
      }
    }

    return 'Company';
  }

  private extractOrgFromUrl(url: string): string {
    try {
      const parts = url.split('/');
      return parts[4] || 'GitHub Org';
    } catch {
      return 'GitHub Org';
    }
  }

  private extractLocation(text: string): string | null {
    // Extract location patterns from job descriptions
    const locationPatterns = [
      /location[:\s]+([^,\n]+)/i,
      /based in ([^,\n]+)/i,
      /([A-Z][a-z]+,\s*[A-Z]{2})/,
      /(remote|hybrid|on-site)/i,
      /([A-Z][a-z]+\s+[A-Z][a-z]+,\s*[A-Z]{2,3})/,
      /\b([A-Z][a-z]+),\s*([A-Z]{2})\b/,
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return null;
  }

  private cleanHTMLDescription(html: string): string {
    // Remove HTML tags and clean up text
    const $ = cheerio.load(html);
    let text = $.text();
    
    // Clean up whitespace and formatting
    text = text.replace(/\s+/g, ' ').trim();
    text = text.replace(/\n\s*\n/g, '\n');
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    
    return text.substring(0, 500);
  }

  private async scrapeEntryLevelJobs(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      const entryLevelJobs = [
        {
          title: 'Customer Service Representative',
          description: 'Entry-level position providing customer support via phone, email, and chat. Great for developing communication skills and gaining work experience.',
          organization: 'Various Companies',
          location: 'Remote/Local',
          url: 'https://www.indeed.com/jobs?q=entry+level+customer+service&l=',
          requirements: ['High school diploma', 'Communication skills', 'Computer literacy'],
          tags: ['customer-service', 'entry-level', 'remote-friendly'],
          salary: '$15-20/hour'
        },
        {
          title: 'Data Entry Clerk',
          description: 'Entry-level position involving accurate data input and record maintenance. Flexible scheduling often available for students.',
          organization: 'Various Companies',
          location: 'Remote/Local',
          url: 'https://www.indeed.com/jobs?q=data+entry&l=',
          requirements: ['High school diploma', 'Attention to detail', 'Typing skills'],
          tags: ['data-entry', 'entry-level', 'flexible'],
          salary: '$14-18/hour'
        },
        {
          title: 'Social Media Assistant',
          description: 'Help manage social media accounts for small businesses. Perfect for tech-savvy high school students with social media experience.',
          organization: 'Small Businesses',
          location: 'Remote',
          url: 'https://www.upwork.com/freelance-jobs/social-media/',
          requirements: ['Social media knowledge', 'Creativity', 'Basic graphic design'],
          tags: ['social-media', 'marketing', 'creative'],
          salary: '$12-16/hour'
        }
      ];

      for (const job of entryLevelJobs) {
        opportunities.push({
          type: 'job',
          title: job.title,
          description: job.description,
          source: 'Entry Level Jobs',
          organization: job.organization,
          location: job.location,
          url: job.url,
          relevancyScore: 80,
          requirements: job.requirements,
          tags: [...job.tags, 'entry-level', 'high-school-friendly'],
          salary: job.salary,
          deadline: null,
          amount: null,
          prize: null
        });
      }
    } catch (error) {
      console.error('Error scraping entry level jobs:', error);
    }

    return opportunities;
  }

  private async scrapeTechJobsForStudents(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      const techJobs = [
        {
          title: 'Junior Web Developer Trainee',
          description: 'Entry-level web development position with training provided. Learn HTML, CSS, JavaScript while contributing to real projects.',
          organization: 'Tech Startups',
          location: 'Remote/Hybrid',
          url: 'https://angel.co/jobs',
          requirements: ['Basic programming knowledge', 'Willingness to learn', 'High school diploma'],
          tags: ['web-development', 'html', 'css', 'javascript'],
          salary: '$18-25/hour'
        },
        {
          title: 'QA Tester (Entry Level)',
          description: 'Test software applications and websites for bugs and usability issues. No experience required, training provided.',
          organization: 'Software Companies',
          location: 'Remote',
          url: 'https://www.glassdoor.com/Jobs/entry-level-qa-tester-jobs-SRCH_KO0,21.htm',
          requirements: ['Attention to detail', 'Problem-solving skills', 'Computer literacy'],
          tags: ['qa-testing', 'software', 'entry-level'],
          salary: '$16-22/hour'
        },
        {
          title: 'IT Support Trainee',
          description: 'Learn IT support fundamentals while helping users with technical issues. Great stepping stone into technology careers.',
          organization: 'Various Companies',
          location: 'Local/Remote',
          url: 'https://www.indeed.com/jobs?q=it+support+trainee&l=',
          requirements: ['Technical aptitude', 'Communication skills', 'Problem-solving'],
          tags: ['it-support', 'technical', 'help-desk'],
          salary: '$17-23/hour'
        }
      ];

      for (const job of techJobs) {
        opportunities.push({
          type: 'job',
          title: job.title,
          description: job.description,
          source: 'Tech Jobs for Students',
          organization: job.organization,
          location: job.location,
          url: job.url,
          relevancyScore: 85,
          requirements: job.requirements,
          tags: [...job.tags, 'technology', 'student-friendly'],
          salary: job.salary,
          deadline: null,
          amount: null,
          prize: null
        });
      }
    } catch (error) {
      console.error('Error scraping tech jobs for students:', error);
    }

    return opportunities;
  }

  private async scrapePartTimeJobs(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      const partTimeJobs = [
        {
          title: 'Tutoring Assistant',
          description: 'Help younger students with homework and test preparation. Flexible scheduling to work around school hours.',
          organization: 'Tutoring Centers',
          location: 'Local/Online',
          url: 'https://www.tutor.com/apply',
          requirements: ['Strong academic performance', 'Patience', 'Subject expertise'],
          tags: ['tutoring', 'education', 'flexible'],
          salary: '$15-25/hour'
        },
        {
          title: 'Library Assistant',
          description: 'Help with book organization, research assistance, and library programs. Great environment for students.',
          organization: 'Public/School Libraries',
          location: 'Local',
          url: 'https://www.libraryjournal.com/jobs',
          requirements: ['Organizational skills', 'Customer service', 'Reliability'],
          tags: ['library', 'books', 'quiet-environment'],
          salary: '$12-16/hour'
        },
        {
          title: 'Content Creator Assistant',
          description: 'Help content creators with research, editing, and social media management. Perfect for creative students.',
          organization: 'Content Creators',
          location: 'Remote',
          url: 'https://www.fiverr.com/',
          requirements: ['Creativity', 'Social media knowledge', 'Research skills'],
          tags: ['content-creation', 'creative', 'social-media'],
          salary: '$13-20/hour'
        }
      ];

      for (const job of partTimeJobs) {
        opportunities.push({
          type: 'job',
          title: job.title,
          description: job.description,
          source: 'Part-Time Jobs',
          organization: job.organization,
          location: job.location,
          url: job.url,
          relevancyScore: 75,
          requirements: job.requirements,
          tags: [...job.tags, 'part-time', 'student-schedule'],
          salary: job.salary,
          deadline: null,
          amount: null,
          prize: null
        });
      }
    } catch (error) {
      console.error('Error scraping part-time jobs:', error);
    }

    return opportunities;
  }

  private async scrapeAngelList(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      // AngelList job search API alternative - scrape their job listings
      const response = await axios.get('https://angel.co/jobs', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OpportunityBot/1.0)',
          'Accept': 'text/html'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Extract job listings from AngelList
      $('.job-listing, .startup-job').each((index, element) => {
        if (index >= 15) return false;
        
        const $job = $(element);
        const title = $job.find('.job-title, h3').first().text().trim();
        const company = $job.find('.startup-name, .company-name').text().trim();
        const description = $job.find('.job-description, .description').text().trim();
        const location = $job.find('.location').text().trim();
        const link = $job.find('a').attr('href');
        
        if (title && company) {
          opportunities.push({
            type: 'job',
            title: title.substring(0, 100),
            description: description.substring(0, 500),
            source: 'AngelList',
            organization: company,
            location: location || 'Startup',
            url: link ? `https://angel.co${link}` : 'https://angel.co/jobs',
            relevancyScore: this.calculateRelevancyScore(title + ' ' + description, userProfile),
            requirements: this.extractRequirements(description),
            tags: ['startup', 'angellist', 'job'],
            salary: this.extractSalary(description),
            deadline: null,
            amount: null,
            prize: null
          });
        }
      });
    } catch (error) {
      console.error('Error scraping AngelList:', error);
    }

    return opportunities;
  }

  private async scrapeIndeedRSS(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      // Use Indeed RSS feeds for job listings
      const keywords = userProfile?.skills?.join('+') || 'software+engineer';
      const response = await axios.get(`https://www.indeed.com/rss?q=${keywords}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OpportunityBot/1.0)',
          'Accept': 'application/rss+xml'
        }
      });

      const $ = cheerio.load(response.data, { xmlMode: true });
      
      $('item').each((index, element) => {
        if (index >= 15) return false;
        
        const $item = $(element);
        const title = $item.find('title').text().trim();
        const description = $item.find('description').text().trim();
        const link = $item.find('link').text().trim();
        const pubDate = $item.find('pubDate').text().trim();
        
        if (title && description) {
          opportunities.push({
            type: 'job',
            title: title.substring(0, 100),
            description: description.substring(0, 500),
            source: 'Indeed',
            organization: this.extractCompanyFromDescription(description),
            location: this.extractLocation(description) || 'Various',
            url: link,
            relevancyScore: this.calculateRelevancyScore(title + ' ' + description, userProfile),
            requirements: this.extractRequirements(description),
            tags: this.generateTags(title + ' ' + description, 'job'),
            salary: this.extractSalary(description),
            deadline: null,
            amount: null,
            prize: null
          });
        }
      });
    } catch (error) {
      console.error('Error scraping Indeed RSS:', error);
    }

    return opportunities;
  }

  private async scrapeInternships(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      // Focus on high school friendly internship sources
      await this.scrapeHighSchoolInternships(opportunities, userProfile);
      await this.scrapeSummerPrograms(opportunities, userProfile);
      await this.scrapeSTEMInternships(opportunities, userProfile);
      
    } catch (error) {
      console.error('Error scraping internships:', error);
    }

    return opportunities;
  }

  private async scrapeHighSchoolInternships(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      // Scrape specific high school internship programs
      const programs = [
        {
          title: 'NASA High School Internship Program',
          description: 'NASA offers internship opportunities for high school students to work alongside scientists and engineers on real NASA missions and research projects.',
          organization: 'NASA',
          location: 'Various NASA Centers',
          url: 'https://intern.nasa.gov/ossi/web/public/main/',
          requirements: ['High school student (grades 9-12)', 'Minimum 3.0 GPA', 'US citizenship'],
          tags: ['nasa', 'stem', 'space', 'research']
        },
        {
          title: 'Microsoft High School Internship Program',
          description: 'Microsoft LEAP program provides high school students with hands-on experience in technology, software development, and innovation.',
          organization: 'Microsoft',
          location: 'Redmond, WA',
          url: 'https://careers.microsoft.com/students/us/en/usuniversityinternship',
          requirements: ['High school junior or senior', 'Interest in technology', 'Strong academic performance'],
          tags: ['microsoft', 'technology', 'software', 'innovation']
        },
        {
          title: 'Google Code-in for High School Students',
          description: 'Google Code-in is a global program that introduces high school students to open source software development.',
          organization: 'Google',
          location: 'Remote/Online',
          url: 'https://codein.withgoogle.com/',
          requirements: ['High school student (ages 13-17)', 'Basic programming knowledge', 'Interest in open source'],
          tags: ['google', 'coding', 'open-source', 'programming']
        }
      ];

      for (const program of programs) {
        opportunities.push({
          type: 'internship',
          title: program.title,
          description: program.description,
          source: 'High School Programs',
          organization: program.organization,
          location: program.location,
          url: program.url,
          relevancyScore: 90, // High relevancy for verified HS programs
          requirements: program.requirements,
          tags: [...program.tags, 'high-school', 'internship'],
          salary: null,
          deadline: null,
          amount: null,
          prize: null
        });
      }
    } catch (error) {
      console.error('Error scraping high school internships:', error);
    }
  }

  private async scrapeSummerPrograms(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      const summerPrograms = [
        {
          title: 'MIT Research Science Institute (RSI)',
          description: 'Prestigious 6-week summer research program for high school students to conduct original research in science, technology, engineering, and mathematics.',
          organization: 'MIT',
          location: 'Cambridge, MA',
          url: 'https://www.cee.org/research-science-institute',
          requirements: ['Rising high school seniors', 'Exceptional academic record', 'Strong STEM background'],
          tags: ['mit', 'research', 'stem', 'prestigious']
        },
        {
          title: 'Stanford Medical Youth Science Program',
          description: 'Summer program introducing high school students to careers in medicine and biomedical research through hands-on laboratory experience.',
          organization: 'Stanford University',
          location: 'Stanford, CA',
          url: 'https://medicine.stanford.edu/mysp.html',
          requirements: ['High school students', 'Interest in medicine/biology', 'Strong science grades'],
          tags: ['stanford', 'medicine', 'biology', 'research']
        }
      ];

      for (const program of summerPrograms) {
        opportunities.push({
          type: 'internship',
          title: program.title,
          description: program.description,
          source: 'Summer Programs',
          organization: program.organization,
          location: program.location,
          url: program.url,
          relevancyScore: 95,
          requirements: program.requirements,
          tags: [...program.tags, 'summer-program', 'high-school'],
          salary: null,
          deadline: null,
          amount: null,
          prize: null
        });
      }
    } catch (error) {
      console.error('Error scraping summer programs:', error);
    }
  }

  private async scrapeSTEMInternships(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      const stemPrograms = [
        {
          title: 'NIH Summer Internship Program in Biomedical Research',
          description: 'Summer internship program for high school students to conduct biomedical research at the National Institutes of Health.',
          organization: 'National Institutes of Health',
          location: 'Bethesda, MD',
          url: 'https://www.training.nih.gov/programs/sip',
          requirements: ['High school students', 'Strong science background', 'Research interest'],
          tags: ['nih', 'biomedical', 'research', 'health']
        },
        {
          title: 'Intel Science and Engineering Fair Internships',
          description: 'Internship opportunities for high school students to work on cutting-edge science and engineering projects with mentorship from Intel researchers.',
          organization: 'Intel Corporation',
          location: 'Various Locations',
          url: 'https://www.societyforscience.org/intel-isef/',
          requirements: ['High school students', 'STEM project experience', 'Innovation mindset'],
          tags: ['intel', 'engineering', 'science-fair', 'innovation']
        }
      ];

      for (const program of stemPrograms) {
        opportunities.push({
          type: 'internship',
          title: program.title,
          description: program.description,
          source: 'STEM Programs',
          organization: program.organization,
          location: program.location,
          url: program.url,
          relevancyScore: 85,
          requirements: program.requirements,
          tags: [...program.tags, 'stem', 'high-school'],
          salary: null,
          deadline: null,
          amount: null,
          prize: null
        });
      }
    } catch (error) {
      console.error('Error scraping STEM internships:', error);
    }
  }

  private async scrapeGrants(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      const grants = [
        {
          title: 'Youth Opportunity Grant Program',
          description: 'Federal grant program providing funding for educational and career development programs for at-risk youth aged 16-21.',
          organization: 'U.S. Department of Labor',
          location: 'United States',
          url: 'https://www.dol.gov/agencies/eta/youth/youth-opportunity-grants',
          amount: 'Up to $50,000',
          requirements: ['Age 16-21', 'Educational or career focus', 'At-risk status'],
          tags: ['youth', 'education', 'career-development']
        },
        {
          title: 'Students for Social Innovation Grant',
          description: 'Grant program supporting high school students developing innovative solutions to social problems in their communities.',
          organization: 'Various Foundations',
          location: 'United States',
          url: 'https://www.changex.org/us',
          amount: '$1,000 - $5,000',
          requirements: ['High school student', 'Social innovation project', 'Community impact'],
          tags: ['social-innovation', 'community', 'entrepreneurship']
        },
        {
          title: 'STEM Education Research Grants for Students',
          description: 'Small grants for high school students conducting independent STEM research projects with potential for publication or presentation.',
          organization: 'Science Foundation',
          location: 'United States',
          url: 'https://www.nsf.gov/funding/education.jsp',
          amount: '$500 - $2,500',
          requirements: ['High school student', 'STEM research project', 'Faculty mentor'],
          tags: ['stem', 'research', 'science']
        },
        {
          title: 'Environmental Action Grants for Youth',
          description: 'Grants supporting environmental conservation projects led by high school students and youth organizations.',
          organization: 'Environmental Protection Agency',
          location: 'United States',
          url: 'https://www.epa.gov/education/environmental-education-grants',
          amount: '$2,000 - $10,000',
          requirements: ['Youth-led project', 'Environmental focus', 'Community benefit'],
          tags: ['environment', 'conservation', 'youth-led']
        }
      ];

      for (const grant of grants) {
        opportunities.push({
          type: 'grant',
          title: grant.title,
          description: grant.description,
          source: 'Youth Grants',
          organization: grant.organization,
          location: grant.location,
          url: grant.url,
          relevancyScore: 85,
          requirements: grant.requirements,
          tags: [...grant.tags, 'grant', 'funding'],
          salary: null,
          deadline: null,
          amount: grant.amount,
          prize: null
        });
      }
    } catch (error) {
      console.error('Error scraping grants:', error);
    }

    return opportunities;
  }

  private async scrapeScholarships(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      await this.scrapeHighSchoolScholarships(opportunities, userProfile);
      await this.scrapeSTEMScholarships(opportunities, userProfile);
      await this.scrapeMinorityScholarships(opportunities, userProfile);
      
    } catch (error) {
      console.error('Error scraping scholarships:', error);
    }

    return opportunities;
  }

  private async scrapeHighSchoolScholarships(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      const scholarships = [
        {
          title: 'National Merit Scholarship',
          description: 'Academic scholarship program for high school students who demonstrate exceptional academic ability and potential for success in rigorous college coursework.',
          organization: 'National Merit Scholarship Corporation',
          location: 'United States',
          url: 'https://www.nationalmerit.org/',
          amount: '$2,500 - Full Tuition',
          requirements: ['High PSAT/NMSQT scores', 'Academic excellence', 'US citizenship'],
          tags: ['merit', 'academic', 'psat', 'prestigious']
        },
        {
          title: 'Coca-Cola Scholars Program',
          description: 'Leadership scholarship for high school seniors who demonstrate academic excellence, leadership, and service in their communities.',
          organization: 'The Coca-Cola Foundation',
          location: 'United States',
          url: 'https://www.coca-colascholarsfoundation.org/',
          amount: '$20,000',
          requirements: ['High school senior', 'Minimum 3.0 GPA', 'Leadership experience', 'Community service'],
          tags: ['coca-cola', 'leadership', 'community-service', 'merit']
        },
        {
          title: 'AXA Achievement Scholarship',
          description: 'Scholarship recognizing students who have demonstrated outstanding achievement in activities outside the classroom and who exemplify AXA Achievement behaviors.',
          organization: 'AXA Foundation',
          location: 'United States',
          url: 'https://www.axa-equitable.com/about-axa/AXA-foundation-scholarships',
          amount: '$2,500 - $25,000',
          requirements: ['High school senior', 'Academic achievement', 'Extracurricular involvement'],
          tags: ['axa', 'achievement', 'extracurricular', 'merit']
        },
        {
          title: 'Gates Scholarship',
          description: 'Full scholarship for exceptional, Pell-eligible, minority high school seniors. Covers the full cost of attendance not already covered by other financial aid.',
          organization: 'Gates Foundation',
          location: 'United States',
          url: 'https://www.thegatesscholarship.org/',
          amount: 'Full Cost of Attendance',
          requirements: ['Pell-eligible', 'Minority student', 'High school senior', 'Outstanding academic record'],
          tags: ['gates', 'full-ride', 'minority', 'pell-eligible']
        }
      ];

      for (const scholarship of scholarships) {
        opportunities.push({
          type: 'scholarship',
          title: scholarship.title,
          description: scholarship.description,
          source: 'High School Scholarships',
          organization: scholarship.organization,
          location: scholarship.location,
          url: scholarship.url,
          relevancyScore: 95,
          requirements: scholarship.requirements,
          tags: [...scholarship.tags, 'high-school', 'scholarship'],
          salary: null,
          deadline: null,
          amount: scholarship.amount,
          prize: null
        });
      }
    } catch (error) {
      console.error('Error scraping high school scholarships:', error);
    }
  }

  private async scrapeSTEMScholarships(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      const stemScholarships = [
        {
          title: 'Google Generation Google Scholarship',
          description: 'Scholarship for students pursuing computer science or related technical fields, with a focus on supporting underrepresented groups in technology.',
          organization: 'Google',
          location: 'United States',
          url: 'https://buildyourfuture.withgoogle.com/scholarships/',
          amount: '$10,000',
          requirements: ['STEM field study', 'Academic excellence', 'Leadership potential'],
          tags: ['google', 'computer-science', 'technology', 'diversity']
        },
        {
          title: 'Society of Women Engineers Scholarship',
          description: 'Multiple scholarships available for women pursuing STEM fields, ranging from high school students to graduate students.',
          organization: 'Society of Women Engineers',
          location: 'United States',
          url: 'https://scholarships.swe.org/',
          amount: '$1,000 - $15,000',
          requirements: ['Female student', 'STEM field', 'Academic achievement'],
          tags: ['swe', 'women-in-stem', 'engineering', 'diversity']
        },
        {
          title: 'SMART Scholarship Program',
          description: 'Science, Mathematics and Research for Transformation scholarship providing full tuition and employment opportunities with Department of Defense.',
          organization: 'Department of Defense',
          location: 'United States',
          url: 'https://www.smartscholarship.org/',
          amount: 'Full Tuition + Stipend',
          requirements: ['STEM field', 'US citizenship', 'Willingness to work for DoD'],
          tags: ['smart', 'defense', 'stem', 'full-ride']
        }
      ];

      for (const scholarship of stemScholarships) {
        opportunities.push({
          type: 'scholarship',
          title: scholarship.title,
          description: scholarship.description,
          source: 'STEM Scholarships',
          organization: scholarship.organization,
          location: scholarship.location,
          url: scholarship.url,
          relevancyScore: 90,
          requirements: scholarship.requirements,
          tags: [...scholarship.tags, 'stem', 'scholarship'],
          salary: null,
          deadline: null,
          amount: scholarship.amount,
          prize: null
        });
      }
    } catch (error) {
      console.error('Error scraping STEM scholarships:', error);
    }
  }

  private async scrapeMinorityScholarships(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      const minorityScholarships = [
        {
          title: 'United Negro College Fund Scholarships',
          description: 'Multiple scholarship opportunities for African American students pursuing higher education, with various eligibility criteria and award amounts.',
          organization: 'United Negro College Fund',
          location: 'United States',
          url: 'https://scholarships.uncf.org/',
          amount: '$500 - $10,000+',
          requirements: ['African American student', 'Financial need', 'Academic achievement'],
          tags: ['uncf', 'african-american', 'diversity', 'financial-need']
        },
        {
          title: 'Hispanic Scholarship Fund',
          description: 'Scholarships supporting Hispanic American students in their pursuit of higher education across all fields of study.',
          organization: 'Hispanic Scholarship Fund',
          location: 'United States',
          url: 'https://www.hsf.net/scholarship',
          amount: '$500 - $5,000',
          requirements: ['Hispanic heritage', 'Minimum 3.0 GPA', 'Financial need'],
          tags: ['hsf', 'hispanic', 'latino', 'diversity']
        },
        {
          title: 'Asian Pacific Fund Scholarships',
          description: 'Scholarships for students of Asian and Pacific Islander heritage pursuing undergraduate and graduate education.',
          organization: 'Asian Pacific Fund',
          location: 'United States',
          url: 'https://asianpacificfund.org/what-we-do/scholarships/',
          amount: '$2,500 - $20,000',
          requirements: ['Asian/Pacific Islander heritage', 'Academic merit', 'Community involvement'],
          tags: ['asian-pacific', 'api', 'diversity', 'heritage']
        }
      ];

      for (const scholarship of minorityScholarships) {
        opportunities.push({
          type: 'scholarship',
          title: scholarship.title,
          description: scholarship.description,
          source: 'Diversity Scholarships',
          organization: scholarship.organization,
          location: scholarship.location,
          url: scholarship.url,
          relevancyScore: 85,
          requirements: scholarship.requirements,
          tags: [...scholarship.tags, 'diversity', 'scholarship'],
          salary: null,
          deadline: null,
          amount: scholarship.amount,
          prize: null
        });
      }
    } catch (error) {
      console.error('Error scraping minority scholarships:', error);
    }
  }

  private async scrapeCompetitions(userProfile?: any): Promise<InsertOpportunity[]> {
    const opportunities: InsertOpportunity[] = [];
    
    try {
      await this.scrapeHighSchoolCompetitions(opportunities, userProfile);
      await this.scrapeSTEMCompetitions(opportunities, userProfile);
      await this.scrapeEssayContests(opportunities, userProfile);
      
    } catch (error) {
      console.error('Error scraping competitions:', error);
    }

    return opportunities;
  }

  private async scrapeHighSchoolCompetitions(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      const competitions = [
        {
          title: 'USACO (USA Computing Olympiad)',
          description: 'Programming competition for high school students to develop algorithmic problem-solving skills. Participants advance through Bronze, Silver, Gold, and Platinum divisions.',
          organization: 'USA Computing Olympiad',
          location: 'Online',
          url: 'http://www.usaco.org/',
          prize: 'Recognition and advancement opportunities',
          requirements: ['High school student', 'Programming knowledge', 'Problem-solving skills'],
          tags: ['usaco', 'programming', 'algorithms', 'olympiad']
        },
        {
          title: 'Science Olympiad',
          description: 'National STEM competition where teams compete in various science and engineering events, fostering teamwork and academic excellence.',
          organization: 'Science Olympiad',
          location: 'Various locations',
          url: 'https://www.soinc.org/',
          prize: 'Medals, trophies, and recognition',
          requirements: ['High school student', 'Team participation', 'STEM knowledge'],
          tags: ['science-olympiad', 'stem', 'team', 'academic']
        },
        {
          title: 'DECA Competition',
          description: 'Business and marketing competition for high school students to develop leadership and entrepreneurship skills through realistic business scenarios.',
          organization: 'DECA Inc.',
          location: 'Various locations',
          url: 'https://www.deca.org/',
          prize: 'Awards, scholarships, and internship opportunities',
          requirements: ['High school student', 'Business interest', 'Presentation skills'],
          tags: ['deca', 'business', 'marketing', 'entrepreneurship']
        },
        {
          title: 'Congressional App Challenge',
          description: 'Competition encouraging high school students to learn coding and create an app for their community, with winners recognized by Congress.',
          organization: 'U.S. House of Representatives',
          location: 'Online',
          url: 'https://www.congressionalappchallenge.us/',
          prize: 'Congressional recognition and app showcase',
          requirements: ['High school student', 'Coding skills', 'Community-focused app idea'],
          tags: ['congressional', 'app', 'coding', 'community']
        }
      ];

      for (const competition of competitions) {
        opportunities.push({
          type: 'competition',
          title: competition.title,
          description: competition.description,
          source: 'High School Competitions',
          organization: competition.organization,
          location: competition.location,
          url: competition.url,
          relevancyScore: 95,
          requirements: competition.requirements,
          tags: [...competition.tags, 'high-school', 'competition'],
          salary: null,
          deadline: null,
          amount: null,
          prize: competition.prize
        });
      }
    } catch (error) {
      console.error('Error scraping high school competitions:', error);
    }
  }

  private async scrapeSTEMCompetitions(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      const stemCompetitions = [
        {
          title: 'Intel International Science and Engineering Fair (ISEF)',
          description: 'The world largest pre-college science competition, bringing together over 1,800 high school students from more than 75 countries to compete for awards and scholarships.',
          organization: 'Society for Science',
          location: 'Various international locations',
          url: 'https://www.societyforscience.org/intel-isef/',
          prize: 'Up to $75,000 in awards and scholarships',
          requirements: ['High school student', 'Original research project', 'Local/regional fair qualification'],
          tags: ['intel-isef', 'science-fair', 'research', 'international']
        },
        {
          title: 'FIRST Robotics Competition',
          description: 'High school robotics competition combining the excitement of sport with science and technology, where students build robots to compete in game-like challenges.',
          organization: 'FIRST (For Inspiration and Recognition of Science and Technology)',
          location: 'Various locations worldwide',
          url: 'https://www.firstinspires.org/robotics/frc',
          prize: 'Awards, scholarships, and internship opportunities',
          requirements: ['High school team', 'Engineering skills', 'Teamwork'],
          tags: ['first-robotics', 'engineering', 'teamwork', 'technology']
        },
        {
          title: 'Math Olympiad Competitions',
          description: 'Series of mathematical competitions including AMC, AIME, and USAMO, designed to identify and develop mathematical talent among high school students.',
          organization: 'Mathematical Association of America',
          location: 'Various locations',
          url: 'https://www.maa.org/math-competitions',
          prize: 'Recognition, awards, and college opportunities',
          requirements: ['High school student', 'Strong mathematics background', 'Problem-solving skills'],
          tags: ['math-olympiad', 'amc', 'mathematics', 'problem-solving']
        }
      ];

      for (const competition of stemCompetitions) {
        opportunities.push({
          type: 'competition',
          title: competition.title,
          description: competition.description,
          source: 'STEM Competitions',
          organization: competition.organization,
          location: competition.location,
          url: competition.url,
          relevancyScore: 90,
          requirements: competition.requirements,
          tags: [...competition.tags, 'stem', 'competition'],
          salary: null,
          deadline: null,
          amount: null,
          prize: competition.prize
        });
      }
    } catch (error) {
      console.error('Error scraping STEM competitions:', error);
    }
  }

  private async scrapeEssayContests(opportunities: InsertOpportunity[], userProfile?: any): Promise<void> {
    try {
      const essayContests = [
        {
          title: 'John F. Kennedy Profile in Courage Essay Contest',
          description: 'Essay contest for high school students to research and write about political courage, with winners receiving scholarships and recognition.',
          organization: 'John F. Kennedy Presidential Library Foundation',
          location: 'Online submission',
          url: 'https://www.jfklibrary.org/learn/education/profile-in-courage-essay-contest',
          prize: '$10,000 first place, additional awards',
          requirements: ['High school student', 'Essay writing skills', 'Research abilities'],
          tags: ['jfk', 'essay', 'political-courage', 'writing']
        },
        {
          title: 'Ayn Rand Essay Contests',
          description: 'Multiple essay contests based on Ayn Rand novels, designed to encourage analytical thinking and writing skills among high school students.',
          organization: 'Ayn Rand Institute',
          location: 'Online submission',
          url: 'https://www.aynrand.org/students/essay-contests',
          prize: 'Up to $10,000 in scholarships',
          requirements: ['High school student', 'Essay based on assigned reading', 'Critical thinking'],
          tags: ['ayn-rand', 'essay', 'literature', 'philosophy']
        },
        {
          title: 'Voice of Democracy Audio Essay Contest',
          description: 'Audio essay contest sponsored by VFW, where high school students record essays on patriotic themes for scholarship opportunities.',
          organization: 'Veterans of Foreign Wars (VFW)',
          location: 'Online submission',
          url: 'https://www.vfw.org/community/youth-and-education/youth-scholarships',
          prize: 'Up to $30,000 in scholarships',
          requirements: ['High school student', 'Audio essay submission', 'Patriotic theme'],
          tags: ['vfw', 'audio-essay', 'patriotism', 'veterans']
        }
      ];

      for (const contest of essayContests) {
        opportunities.push({
          type: 'competition',
          title: contest.title,
          description: contest.description,
          source: 'Essay Contests',
          organization: contest.organization,
          location: contest.location,
          url: contest.url,
          relevancyScore: 85,
          requirements: contest.requirements,
          tags: [...contest.tags, 'essay', 'writing', 'competition'],
          salary: null,
          deadline: null,
          amount: null,
          prize: contest.prize
        });
      }
    } catch (error) {
      console.error('Error scraping essay contests:', error);
    }
  }

  private extractFundingAmount(text: string): string | null {
    const amountPatterns = [
      /\$[\d,]+/,
      /up to \$[\d,]+/i,
      /award[:\s]*\$[\d,]+/i,
      /funding[:\s]*\$[\d,]+/i
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  private extractPrizeAmount(text: string): string | null {
    const prizePatterns = [
      /prize[:\s]*\$[\d,]+/i,
      /\$[\d,]+\s*prize/i,
      /win[:\s]*\$[\d,]+/i,
      /cash[:\s]*\$[\d,]+/i
    ];

    for (const pattern of prizePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  private calculateRelevancyScore(content: string, userProfile?: any): number {
    let score = 50; // Base score
    
    if (!content) return score;
    
    const text = content.toLowerCase();
    const skills = userProfile?.skills || [];

    // Boost score for matching skills
    for (const skill of skills) {
      if (text.includes(skill.toLowerCase())) {
        score += 15;
      }
    }

    // Boost for opportunity keywords
    const keywords = ['remote', 'senior', 'lead', 'full-time', 'benefits', 'equity'];
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += 5;
      }
    }

    return Math.min(100, Math.max(30, score));
  }

  private extractRequirements(text: string): string[] {
    const requirements: string[] = [];
    
    if (!text) return requirements;
    
    const patterns = [
      /bachelor'?s degree/i,
      /master'?s degree/i,
      /\d+ years? experience/i,
      /experience with \w+/i,
      /knowledge of \w+/i,
      /proficient in \w+/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        requirements.push(match[0]);
      }
    }

    return requirements.slice(0, 5); // Limit to 5 requirements
  }

  private generateTags(text: string, type: string): string[] {
    const tags = [type];
    
    if (!text) return tags;
    
    const content = text.toLowerCase();
    
    const tagPatterns = {
      'remote': ['remote', 'work from home'],
      'fulltime': ['full-time', 'full time'],
      'startup': ['startup', 'early stage'],
      'senior': ['senior', 'lead', 'principal'],
      'javascript': ['javascript', 'js', 'react', 'node'],
      'python': ['python', 'django', 'flask'],
      'ai': ['ai', 'machine learning', 'ml', 'artificial intelligence'],
      'data': ['data science', 'data engineer', 'analytics']
    };

    for (const [tag, keywords] of Object.entries(tagPatterns)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        tags.push(tag);
      }
    }

    return tags.slice(0, 6); // Limit to 6 tags
  }

  private extractSalary(text: string): string | null {
    if (!text) return null;
    
    const salaryPatterns = [
      /\$[\d,]+k?\s*-\s*\$[\d,]+k?/i,
      /\$[\d,]+k?\s*(?:per|\/)\s*(?:year|annually)/i,
      /salary:?\s*\$[\d,]+k?/i
    ];

    for (const pattern of salaryPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return null;
  }
}

export class ScrapingService {
  private scrapers: Scraper[] = [
    new WebOpportunityScraper(),
  ];

  async scrapeAll(userProfile?: any): Promise<InsertOpportunity[]> {
    const allOpportunities: InsertOpportunity[] = [];
    
    for (const scraper of this.scrapers) {
      try {
        console.log(`Starting scraping from ${scraper.name}...`);
        const opportunities = await scraper.scrape(userProfile);
        allOpportunities.push(...opportunities);
        console.log(`Scraped ${opportunities.length} opportunities from ${scraper.name}`);
      } catch (error) {
        console.error(`Error scraping from ${scraper.name}:`, error);
      }
    }
    
    return allOpportunities;
  }

  async scrapeFromSource(sourceName: string, userProfile?: any): Promise<InsertOpportunity[]> {
    const scraper = this.scrapers.find(s => s.name.toLowerCase().includes(sourceName.toLowerCase()));
    if (!scraper) {
      throw new Error(`Scraper for source "${sourceName}" not found`);
    }
    
    return await scraper.scrape(userProfile);
  }
}

export const scrapingService = new ScrapingService();