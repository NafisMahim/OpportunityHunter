import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  location: text("location"),
  experienceLevel: text("experience_level"),
  skills: text("skills").array().default([]),
  preferences: text("preferences").array().default([]),
  opportunityTypes: text("opportunity_types").array().default(['job', 'internship', 'grant', 'scholarship', 'competition']),
  createdAt: timestamp("created_at").defaultNow(),
});

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // job, internship, grant, scholarship, competition
  location: text("location"),
  salary: text("salary"),
  amount: text("amount"),
  prize: text("prize"),
  organization: text("organization"),
  source: text("source").notNull(),
  deadline: text("deadline"),
  url: text("url"),
  relevancyScore: integer("relevancy_score").default(0),
  requirements: text("requirements").array().default([]),
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  opportunityId: integer("opportunity_id").references(() => opportunities.id),
  status: text("status").notNull(), // applied, skipped, failed
  autoApplied: boolean("auto_applied").default(false),
  appliedAt: timestamp("applied_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  type: text("type").notNull(), // scrape, apply, error
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
