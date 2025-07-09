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
import { db } from "./db";
import { eq, and, like, or, desc, sql } from "drizzle-orm";

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
  deleteOpportunity(id: number): Promise<boolean>;
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

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize basic user if not exists
    this.initializeBasicUser();
  }

  private async initializeBasicUser() {
    try {
      // Check if basic user exists
      const existingUser = await db.select().from(users).where(eq(users.id, 1));
      
      if (existingUser.length === 0) {
        // Create basic user profile for demo
        await db.insert(users).values({
          name: "User",
          email: "user@example.com",
          location: null,
          experienceLevel: null,
          skills: null,
          preferences: null,
        });
      }
    } catch (error) {
      console.error("Error initializing basic user:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getOpportunities(): Promise<Opportunity[]> {
    return await db.select().from(opportunities).orderBy(desc(opportunities.createdAt));
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity || undefined;
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    // Check for duplicates based on title and organization
    const existing = await db.select()
      .from(opportunities)
      .where(
        sql`LOWER(${opportunities.title}) = LOWER(${insertOpportunity.title}) 
        AND LOWER(${opportunities.organization}) = LOWER(${insertOpportunity.organization})`
      )
      .limit(1);
    
    if (existing.length > 0) {
      console.log(`Duplicate opportunity skipped: ${insertOpportunity.title}`);
      return existing[0];
    }
    
    const [opportunity] = await db
      .insert(opportunities)
      .values(insertOpportunity)
      .returning();
    return opportunity;
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    try {
      const result = await db.delete(opportunities).where(eq(opportunities.id, id));
      return true;
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      return false;
    }
  }

  async searchOpportunities(query: string, filters?: {
    type?: string;
    source?: string;
    location?: string;
  }): Promise<Opportunity[]> {
    let whereConditions = [];

    if (query) {
      const lowerQuery = `%${query.toLowerCase()}%`;
      whereConditions.push(
        or(
          like(opportunities.title, lowerQuery),
          like(opportunities.description, lowerQuery),
          like(opportunities.organization, lowerQuery)
        )
      );
    }

    if (filters?.type && filters.type !== 'all') {
      whereConditions.push(eq(opportunities.type, filters.type));
    }

    if (filters?.source && filters.source !== 'all') {
      whereConditions.push(eq(opportunities.source, filters.source));
    }

    if (filters?.location) {
      whereConditions.push(like(opportunities.location, `%${filters.location}%`));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    return await db
      .select()
      .from(opportunities)
      .where(whereClause)
      .orderBy(desc(opportunities.relevancyScore), desc(opportunities.createdAt));
  }

  async getApplications(userId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId));
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async getActivities(userId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }
}

export const storage = new DatabaseStorage();
