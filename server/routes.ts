import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scrapingService } from "./scrapers";
import { insertUserSchema, insertOpportunitySchema, insertApplicationSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Opportunity routes
  app.get("/api/opportunities", async (req, res) => {
    try {
      const { search, type, source, location } = req.query;
      
      if (search || type || source || location) {
        const opportunities = await storage.searchOpportunities(
          search as string || "",
          {
            type: type as string,
            source: source as string,
            location: location as string,
          }
        );
        return res.json(opportunities);
      }
      
      const opportunities = await storage.getOpportunities();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.getOpportunity(id);
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    try {
      const opportunityData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(opportunityData);
      res.status(201).json(opportunity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid opportunity data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Application routes
  app.get("/api/users/:userId/applications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const applications = await storage.getApplications(userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const applicationData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(applicationData);
      
      // Create activity for application
      await storage.createActivity({
        userId: applicationData.userId!,
        message: `Applied to opportunity ${applicationData.opportunityId}`,
        type: "apply",
      });
      
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activity routes
  app.get("/api/users/:userId/activities", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const activities = await storage.getActivities(userId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Real scraping route
  app.post("/api/scrape", async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Get user profile for personalized scraping
      const user = await storage.getUser(userId);
      
      // Start activity log
      await storage.createActivity({
        userId,
        message: "Started scraping opportunities from multiple sources",
        type: "scrape",
      });

      res.json({ message: "Scraping started" });

      // Perform scraping in background
      scrapingService.scrapeAll(user).then(async (opportunities) => {
        // Save all scraped opportunities
        let savedCount = 0;
        for (const opportunity of opportunities) {
          try {
            await storage.createOpportunity(opportunity);
            savedCount++;
          } catch (error) {
            console.error('Error saving opportunity:', error);
          }
        }

        // Create success activity
        await storage.createActivity({
          userId,
          message: `Successfully scraped and saved ${savedCount} new opportunities`,
          type: "scrape",
        });
      }).catch(async (error) => {
        console.error('Scraping error:', error);
        await storage.createActivity({
          userId,
          message: "Error occurred during scraping. Some sources may be unavailable.",
          type: "error",
        });
      });

    } catch (error) {
      console.error('Scrape route error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Auto-apply route
  app.post("/api/auto-apply", async (req, res) => {
    try {
      const { userId, opportunityId } = req.body;
      
      // Simulate auto-apply
      const application = await storage.createApplication({
        userId,
        opportunityId,
        status: "applied",
        autoApplied: true,
      });

      await storage.createActivity({
        userId,
        message: `Auto-applied to opportunity ${opportunityId}`,
        type: "apply",
      });

      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Scrape from specific source
  app.post("/api/scrape/:source", async (req, res) => {
    try {
      const { source } = req.params;
      const { userId } = req.body;
      
      const user = await storage.getUser(userId);
      
      await storage.createActivity({
        userId,
        message: `Started scraping from ${source}`,
        type: "scrape",
      });

      res.json({ message: `Scraping started from ${source}` });

      // Perform scraping from specific source in background
      scrapingService.scrapeFromSource(source, user).then(async (opportunities) => {
        let savedCount = 0;
        for (const opportunity of opportunities) {
          try {
            await storage.createOpportunity(opportunity);
            savedCount++;
          } catch (error) {
            console.error('Error saving opportunity:', error);
          }
        }

        await storage.createActivity({
          userId,
          message: `Found ${savedCount} opportunities from ${source}`,
          type: "scrape",
        });
      }).catch(async (error) => {
        console.error(`Error scraping ${source}:`, error);
        await storage.createActivity({
          userId,
          message: `Failed to scrape from ${source}. Source may be temporarily unavailable.`,
          type: "error",
        });
      });

    } catch (error) {
      console.error('Source scrape error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Export route
  app.get("/api/users/:userId/export", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { format } = req.query;
      
      const opportunities = await storage.getOpportunities();
      const applications = await storage.getApplications(userId);
      
      const exportData = {
        opportunities,
        applications,
        exportedAt: new Date().toISOString(),
      };

      if (format === 'csv') {
        // Convert to CSV format
        const csvData = opportunities.map(opp => ({
          title: opp.title,
          type: opp.type,
          organization: opp.organization,
          location: opp.location,
          deadline: opp.deadline,
          relevancyScore: opp.relevancyScore,
        }));
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="opportunities.csv"');
        res.send(csvData);
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="opportunities.json"');
        res.json(exportData);
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
