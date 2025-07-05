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
      // Scrape HackerNews Who's Hiring thread
      console.log('Scraping Hacker News opportunities...');
      const hnJobs = await this.scrapeHackerNewsJobs(userProfile);
      opportunities.push(...hnJobs);

      // Scrape RemoteOK
      console.log('Scraping RemoteOK opportunities...');
      const remoteJobs = await this.scrapeRemoteOK(userProfile);
      opportunities.push(...remoteJobs);

      // Scrape GitHub Jobs alternative sites
      console.log('Scraping job boards...');
      const jobBoardJobs = await this.scrapeJobBoards(userProfile);
      opportunities.push(...jobBoardJobs);

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