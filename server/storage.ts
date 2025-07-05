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
    
    // Initialize with basic user profile only
    this.initializeBasicUser();
  }

  private initializeBasicUser() {
    // Create basic user profile for demo
    const user: User = {
      id: this.currentUserId++,
      name: "User",
      email: "user@example.com",
      location: null,
      experienceLevel: null,
      skills: null,
      preferences: null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
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
      location: insertUser.location || null,
      experienceLevel: insertUser.experienceLevel || null,
      skills: insertUser.skills || null,
      preferences: insertUser.preferences || null,
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
      location: insertOpportunity.location || null,
      salary: insertOpportunity.salary || null,
      amount: insertOpportunity.amount || null,
      prize: insertOpportunity.prize || null,
      organization: insertOpportunity.organization || null,
      deadline: insertOpportunity.deadline || null,
      url: insertOpportunity.url || null,
      relevancyScore: insertOpportunity.relevancyScore || null,
      requirements: insertOpportunity.requirements || null,
      tags: insertOpportunity.tags || null,
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
      userId: insertApplication.userId || null,
      opportunityId: insertApplication.opportunityId || null,
      autoApplied: insertApplication.autoApplied || null,
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
      userId: insertActivity.userId || null,
      createdAt: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }
}

export const storage = new MemStorage();
