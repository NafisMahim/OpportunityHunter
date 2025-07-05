import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { InsertOpportunity } from '@shared/schema';

puppeteer.use(StealthPlugin());

const getBrowserConfig = () => ({
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor'
  ]
});

export interface Scraper {
  name: string;
  scrape(userProfile?: any): Promise<InsertOpportunity[]>;
}

class GrantsGovScraper implements Scraper {
  name = 'Grants.gov';

  async scrape(userProfile?: any): Promise<InsertOpportunity[]> {
    const browser = await puppeteer.launch(getBrowserConfig());

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto('https://www.grants.gov/web/grants/search-grants.html', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await page.waitForSelector('#searchForm', { timeout: 10000 });

      // Add search terms
      if (userProfile?.skills && userProfile.skills.length > 0) {
        const searchTerms = userProfile.skills.slice(0, 3).join(' OR ');
        await page.type('#searchTerms', searchTerms);
      } else {
        await page.type('#searchTerms', 'technology innovation research');
      }

      await page.click('#searchButton');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.waitForSelector('.grant-results-item', { timeout: 10000 });

      const grants = await page.evaluate(() => {
        const grantElements = document.querySelectorAll('.grant-results-item');
        const results: any[] = [];

        grantElements.forEach((element, index) => {
          if (index >= 20) return;

          const titleElement = element.querySelector('.grant-title a');
          const agencyElement = element.querySelector('.agency-name');
          const descriptionElement = element.querySelector('.grant-description');
          const deadlineElement = element.querySelector('.close-date');
          const awardElement = element.querySelector('.award-amount');

          if (titleElement) {
            results.push({
              title: titleElement.textContent?.trim() || '',
              url: titleElement.getAttribute('href') || '',
              organization: agencyElement?.textContent?.trim() || '',
              description: descriptionElement?.textContent?.trim() || '',
              deadline: deadlineElement?.textContent?.trim() || '',
              amount: awardElement?.textContent?.trim() || ''
            });
          }
        });

        return results;
      });

      const opportunities: InsertOpportunity[] = grants.map((grant) => ({
        title: grant.title,
        description: grant.description || 'Grant opportunity from Grants.gov',
        type: 'grant',
        location: 'Remote',
        salary: null,
        amount: grant.amount || null,
        prize: null,
        organization: grant.organization,
        source: 'Grants.gov',
        deadline: grant.deadline || null,
        url: grant.url.startsWith('http') ? grant.url : `https://www.grants.gov${grant.url}`,
        relevancyScore: this.calculateRelevancyScore(grant, userProfile),
        requirements: this.extractRequirements(grant.description),
        tags: this.extractTags(grant.title, grant.description)
      }));

      console.log(`Scraped ${opportunities.length} grants from Grants.gov`);
      return opportunities;

    } catch (error) {
      console.error('Error scraping Grants.gov:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  private calculateRelevancyScore(grant: any, userProfile?: any): number {
    let score = 50;
    if (userProfile?.skills) {
      const grantText = `${grant.title} ${grant.description}`.toLowerCase();
      const matchingSkills = userProfile.skills.filter((skill: string) =>
        grantText.includes(skill.toLowerCase())
      );
      score += matchingSkills.length * 10;
    }
    return Math.min(score, 100);
  }

  private extractRequirements(description: string): string[] {
    const requirements: string[] = [];
    const text = description.toLowerCase();
    if (text.includes('research')) requirements.push('Research experience');
    if (text.includes('phd')) requirements.push('PhD required');
    return requirements;
  }

  private extractTags(title: string, description: string): string[] {
    const tags: string[] = ['grant'];
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('technology')) tags.push('technology');
    if (text.includes('ai')) tags.push('AI');
    return tags;
  }
}

class AngelListScraper implements Scraper {
  name = 'AngelList';

  async scrape(userProfile?: any): Promise<InsertOpportunity[]> {
    const browser = await puppeteer.launch(getBrowserConfig());

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto('https://angel.co/jobs', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.waitForSelector('[data-test="StartupResult"], .job-listing, .startup-item', { timeout: 15000 });

      const jobs = await page.evaluate(() => {
        const jobSelectors = [
          '[data-test="StartupResult"]',
          '.job-listing',
          '.startup-item',
          '.company-item',
          '[class*="job"]'
        ];

        let jobElements: NodeListOf<Element> | null = null;
        
        for (const selector of jobSelectors) {
          jobElements = document.querySelectorAll(selector);
          if (jobElements.length > 0) break;
        }

        if (!jobElements) return [];

        const results: any[] = [];
        jobElements.forEach((element, index) => {
          if (index >= 15) return;

          const titleElement = element.querySelector('h2 a, h3 a, .title a, [class*="title"]');
          const companyElement = element.querySelector('.company-name, [class*="company"]');
          const descElement = element.querySelector('.description, .job-description, p');
          const salaryElement = element.querySelector('.salary, [class*="salary"]');

          if (titleElement?.textContent?.trim()) {
            results.push({
              title: titleElement.textContent.trim(),
              url: titleElement.getAttribute('href') || '',
              organization: companyElement?.textContent?.trim() || 'Startup',
              description: descElement?.textContent?.trim() || 'Exciting startup opportunity',
              salary: salaryElement?.textContent?.trim() || null
            });
          }
        });

        return results;
      });

      const opportunities: InsertOpportunity[] = jobs.map((job) => ({
        title: job.title,
        description: job.description,
        type: job.title.toLowerCase().includes('intern') ? 'internship' : 'job',
        location: 'Remote/SF Bay Area',
        salary: job.salary,
        amount: null,
        prize: null,
        organization: job.organization,
        source: 'AngelList',
        deadline: null,
        url: job.url.startsWith('http') ? job.url : `https://angel.co${job.url}`,
        relevancyScore: this.calculateRelevancyScore(job, userProfile),
        requirements: this.extractRequirements(job.description),
        tags: this.extractTags(job.title, job.description)
      }));

      console.log(`Scraped ${opportunities.length} jobs from AngelList`);
      return opportunities;

    } catch (error) {
      console.error('Error scraping AngelList:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  private calculateRelevancyScore(job: any, userProfile?: any): number {
    let score = 60;
    if (userProfile?.skills) {
      const jobText = `${job.title} ${job.description}`.toLowerCase();
      const matchingSkills = userProfile.skills.filter((skill: string) =>
        jobText.includes(skill.toLowerCase())
      );
      score += matchingSkills.length * 8;
    }
    return Math.min(score, 100);
  }

  private extractRequirements(description: string): string[] {
    const requirements: string[] = [];
    const text = description.toLowerCase();
    if (text.includes('react')) requirements.push('React');
    if (text.includes('node')) requirements.push('Node.js');
    return requirements;
  }

  private extractTags(title: string, description: string): string[] {
    const tags: string[] = ['startup'];
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('frontend')) tags.push('frontend');
    if (text.includes('backend')) tags.push('backend');
    return tags;
  }
}

class FastwebScraper implements Scraper {
  name = 'Fastweb';

  async scrape(userProfile?: any): Promise<InsertOpportunity[]> {
    const browser = await puppeteer.launch(getBrowserConfig());

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto('https://www.fastweb.com/college-scholarships/articles', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      await page.waitForSelector('.scholarship-item, .article-item, [class*="scholarship"]', { timeout: 15000 });

      const scholarships = await page.evaluate(() => {
        const scholarshipSelectors = [
          '.scholarship-item',
          '.article-item',
          '[class*="scholarship"]',
          '.card',
          '.listing-item'
        ];

        let scholarshipElements: NodeListOf<Element> | null = null;
        
        for (const selector of scholarshipSelectors) {
          scholarshipElements = document.querySelectorAll(selector);
          if (scholarshipElements.length > 0) break;
        }

        if (!scholarshipElements) return [];

        const results: any[] = [];
        scholarshipElements.forEach((element, index) => {
          if (index >= 15) return;

          const titleElement = element.querySelector('h2 a, h3 a, .title a, a');
          const descElement = element.querySelector('.description, .excerpt, p');
          const amountElement = element.querySelector('.amount, [class*="amount"]');
          const deadlineElement = element.querySelector('.deadline, [class*="deadline"]');

          if (titleElement?.textContent?.trim()) {
            const title = titleElement.textContent.trim();
            const description = descElement?.textContent?.trim() || 'Scholarship opportunity';
            
            if (title.toLowerCase().includes('scholarship') || 
                description.toLowerCase().includes('scholarship')) {
              results.push({
                title,
                description,
                url: titleElement.getAttribute('href') || '',
                amount: amountElement?.textContent?.trim() || null,
                deadline: deadlineElement?.textContent?.trim() || null
              });
            }
          }
        });

        return results;
      });

      const opportunities: InsertOpportunity[] = scholarships.map((scholarship) => ({
        title: scholarship.title,
        description: scholarship.description,
        type: 'scholarship',
        location: 'Remote',
        salary: null,
        amount: scholarship.amount,
        prize: null,
        organization: 'Various Organizations',
        source: 'Fastweb',
        deadline: scholarship.deadline,
        url: scholarship.url.startsWith('http') ? scholarship.url : `https://www.fastweb.com${scholarship.url}`,
        relevancyScore: this.calculateRelevancyScore(scholarship, userProfile),
        requirements: this.extractRequirements(scholarship.description),
        tags: this.extractTags(scholarship.title, scholarship.description)
      }));

      console.log(`Scraped ${opportunities.length} scholarships from Fastweb`);
      return opportunities;

    } catch (error) {
      console.error('Error scraping Fastweb:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  private calculateRelevancyScore(scholarship: any, userProfile?: any): number {
    let score = 40;
    if (userProfile?.skills) {
      const scholarshipText = `${scholarship.title} ${scholarship.description}`.toLowerCase();
      const matchingSkills = userProfile.skills.filter((skill: string) =>
        scholarshipText.includes(skill.toLowerCase())
      );
      score += matchingSkills.length * 10;
    }
    return Math.min(score, 100);
  }

  private extractRequirements(description: string): string[] {
    const requirements: string[] = [];
    const text = description.toLowerCase();
    if (text.includes('gpa')) requirements.push('Minimum GPA required');
    if (text.includes('undergraduate')) requirements.push('Undergraduate student');
    return requirements;
  }

  private extractTags(title: string, description: string): string[] {
    const tags: string[] = ['scholarship'];
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('stem')) tags.push('STEM');
    if (text.includes('women')) tags.push('women');
    return tags;
  }
}

export class ScrapingService {
  private scrapers: Scraper[] = [
    new GrantsGovScraper(),
    new AngelListScraper(),
    new FastwebScraper(),
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
        // Continue with other scrapers instead of failing completely
      }
    }
    
    // If scraping fails due to technical issues, log the problem
    if (allOpportunities.length === 0) {
      console.log('No opportunities scraped. Check browser configuration and network connectivity.');
    }
    
    return allOpportunities;
  }

  async scrapeFromSource(sourceName: string, userProfile?: any): Promise<InsertOpportunity[]> {
    const scraper = this.scrapers.find(s => s.name.toLowerCase() === sourceName.toLowerCase());
    if (!scraper) {
      throw new Error(`Scraper for source "${sourceName}" not found`);
    }
    
    return await scraper.scrape(userProfile);
  }
}

export const scrapingService = new ScrapingService();