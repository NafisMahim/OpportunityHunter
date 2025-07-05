import { 
  users, 
  opportunities, 
  applications, 
  activities,
  type User, 
  type InsertUser,
  type Opportunity,
  type InsertOpportunity,
  type Application,
  type InsertApplication,
  type Activity,
  type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Opportunities
  getOpportunities(): Promise<Opportunity[]>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  searchOpportunities(query: string, filters?: {
    type?: string;
    source?: string;
    location?: string;
  }): Promise<Opportunity[]>;
  
  // Applications
  getApplications(userId: number): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  
  // Activities
  getActivities(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private opportunities: Map<number, Opportunity>;
  private applications: Map<number, Application>;
  private activities: Map<number, Activity>;
  private currentUserId: number;
  private currentOpportunityId: number;
  private currentApplicationId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.opportunities = new Map();
    this.applications = new Map();
    this.activities = new Map();
    this.currentUserId = 1;
    this.currentOpportunityId = 1;
    this.currentApplicationId = 1;
    this.currentActivityId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: this.currentUserId++,
      name: "Alex Chen",
      email: "alex.chen@email.com",
      location: "San Francisco, CA",
      experienceLevel: "Mid-Level (3-5 years)",
      skills: ["React", "TypeScript", "Node.js", "Python", "Machine Learning", "Data Science"],
      preferences: ["jobs", "internships"],
      createdAt: new Date(),
    };
    this.users.set(sampleUser.id, sampleUser);

    // Create sample opportunities
    const sampleOpportunities: Opportunity[] = [
      {
        id: this.currentOpportunityId++,
        title: "Senior Full-Stack Developer",
        description: "Join our cutting-edge fintech startup building the next generation of decentralized payment solutions. We're looking for a senior developer with expertise in React, Node.js, and blockchain technologies.",
        type: "job",
        location: "San Francisco, CA",
        salary: "$120k - $180k",
        amount: null,
        prize: null,
        organization: "TechFlow Inc.",
        source: "AngelList",
        deadline: "Dec 15, 2024",
        url: "https://angel.co/company/techflow/jobs",
        relevancyScore: 95,
        requirements: ["React", "Node.js", "5+ years experience"],
        tags: ["fintech", "blockchain", "remote"],
        createdAt: new Date(),
      },
      {
        id: this.currentOpportunityId++,
        title: "NSF AI Innovation Research Grant",
        description: "National Science Foundation seeks proposals for innovative artificial intelligence research projects focusing on ethical AI development and applications in healthcare and education sectors.",
        type: "grant",
        location: "Remote",
        salary: null,
        amount: "Up to $500,000",
        prize: null,
        organization: "National Science Foundation",
        source: "Grants.gov",
        deadline: "Jan 30, 2025",
        url: "https://grants.gov/view-opportunity.html?oppId=350427",
        relevancyScore: 78,
        requirements: ["PhD in CS/AI", "Research experience"],
        tags: ["AI", "research", "healthcare"],
        createdAt: new Date(),
      },
      {
        id: this.currentOpportunityId++,
        title: "ML Engineering Intern - Summer 2025",
        description: "Join Google's AI research team for a 12-week summer internship focused on developing next-generation machine learning models for natural language processing and computer vision applications.",
        type: "internship",
        location: "Mountain View, CA",
        salary: "$8,500/month",
        amount: null,
        prize: null,
        organization: "Google",
        source: "Google Careers",
        deadline: "Feb 1, 2025",
        url: "https://careers.google.com/jobs/results",
        relevancyScore: 92,
        requirements: ["CS student", "ML experience", "Python"],
        tags: ["ML", "internship", "AI"],
        createdAt: new Date(),
      },
      {
        id: this.currentOpportunityId++,
        title: "Tech Women Leaders Scholarship",
        description: "Supporting women pursuing advanced degrees in computer science, engineering, or related technology fields. Awards up to $10,000 for academic excellence and leadership potential.",
        type: "scholarship",
        location: "Remote",
        salary: null,
        amount: "Up to $10,000",
        prize: null,
        organization: "Women in Tech Foundation",
        source: "Fastweb",
        deadline: "Mar 15, 2025",
        url: "https://fastweb.com/scholarships",
        relevancyScore: 65,
        requirements: ["Female", "CS/Engineering student", "3.5+ GPA"],
        tags: ["scholarship", "women", "STEM"],
        createdAt: new Date(),
      },
      {
        id: this.currentOpportunityId++,
        title: "Global AI Innovation Challenge",
        description: "International competition seeking innovative AI solutions for climate change mitigation. Winners receive funding and mentorship to develop their solutions into scalable products.",
        type: "competition",
        location: "Global (Remote)",
        salary: null,
        amount: null,
        prize: "$50,000 Grand Prize",
        organization: "Climate Innovation Hub",
        source: "Innovation Hub",
        deadline: "Apr 1, 2025",
        url: "https://climateinnovation.org/challenge",
        relevancyScore: 89,
        requirements: ["AI/ML expertise", "Climate focus", "Team or individual"],
        tags: ["competition", "AI", "climate"],
        createdAt: new Date(),
      },
      {
        id: this.currentOpportunityId++,
        title: "Data Scientist - Healthcare AI",
        description: "Join our mission to revolutionize healthcare through AI. We're seeking a data scientist to develop predictive models for early disease detection and personalized treatment recommendations.",
        type: "job",
        location: "Boston, MA",
        salary: "$95k - $140k",
        amount: null,
        prize: null,
        organization: "HealthAI Solutions",
        source: "HealthTech Jobs",
        deadline: "Jan 10, 2025",
        url: "https://healthtech.jobs/data-scientist",
        relevancyScore: 74,
        requirements: ["Data Science", "Healthcare exp", "Python/R"],
        tags: ["healthcare", "AI", "data science"],
        createdAt: new Date(),
      },
    ];

    sampleOpportunities.forEach(opp => {
      this.opportunities.set(opp.id, opp);
    });

    // Create sample activities
    const sampleActivities: Activity[] = [
      {
        id: this.currentActivityId++,
        userId: 1,
        message: "Successfully scraped 15 new opportunities from Grants.gov",
        type: "scrape",
        createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      },
      {
        id: this.currentActivityId++,
        userId: 1,
        message: "Auto-applied to \"ML Engineering Intern\" at Google",
        type: "apply",
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        id: this.currentActivityId++,
        userId: 1,
        message: "Skipped application due to CAPTCHA requirement",
        type: "error",
        createdAt: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
      },
      {
        id: this.currentActivityId++,
        userId: 1,
        message: "Found 8 new matching opportunities from AngelList",
        type: "scrape",
        createdAt: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
      },
    ];

    sampleActivities.forEach(activity => {
      this.activities.set(activity.id, activity);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getOpportunities(): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.currentOpportunityId++;
    const opportunity: Opportunity = { 
      ...insertOpportunity, 
      id,
      createdAt: new Date()
    };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  async searchOpportunities(query: string, filters?: {
    type?: string;
    source?: string;
    location?: string;
  }): Promise<Opportunity[]> {
    let results = Array.from(this.opportunities.values());

    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(opp => 
        opp.title.toLowerCase().includes(lowerQuery) ||
        opp.description.toLowerCase().includes(lowerQuery) ||
        opp.organization?.toLowerCase().includes(lowerQuery) ||
        opp.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    if (filters?.type && filters.type !== 'all') {
      results = results.filter(opp => opp.type === filters.type);
    }

    if (filters?.source && filters.source !== 'all') {
      results = results.filter(opp => opp.source === filters.source);
    }

    if (filters?.location) {
      results = results.filter(opp => 
        opp.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    return results.sort((a, b) => (b.relevancyScore || 0) - (a.relevancyScore || 0));
  }

  async getApplications(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.userId === userId);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const application: Application = { 
      ...insertApplication, 
      id,
      appliedAt: new Date()
    };
    this.applications.set(id, application);
    return application;
  }

  async getActivities(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { 
      ...insertActivity, 
      id,
      createdAt: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
