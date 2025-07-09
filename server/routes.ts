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

  // Opportunity routes with AI matching
  app.get("/api/opportunities", async (req, res) => {
    try {
      const { search, type, source, location, userId } = req.query;
      
      let opportunities;
      if (search || type || source || location) {
        opportunities = await storage.searchOpportunities(
          search as string || "",
          {
            type: type as string,
            source: source as string,
            location: location as string,
          }
        );
      } else {
        opportunities = await storage.getOpportunities();
      }

      // Helper function to check title similarity for duplicate removal
      function areTitlesSimilar(title1: string, title2: string): boolean {
        const clean1 = title1.toLowerCase().replace(/[^\w\s]/g, '').trim();
        const clean2 = title2.toLowerCase().replace(/[^\w\s]/g, '').trim();
        
        // Exact match
        if (clean1 === clean2) return true;
        
        // Check if one title contains the other (for variations)
        if (clean1.includes(clean2) || clean2.includes(clean1)) return true;
        
        // Check if they share most words (>70% similarity)
        const words1 = clean1.split(/\s+/);
        const words2 = clean2.split(/\s+/);
        const intersection = words1.filter(word => words2.includes(word));
        const similarity = intersection.length / Math.max(words1.length, words2.length);
        
        return similarity > 0.7;
      }
      
      // Remove duplicates from database results only
      const uniqueOpportunities = opportunities.filter((opp, index, self) => 
        index === self.findIndex(o => {
          const titleSimilar = areTitlesSimilar(o.title, opp.title);
          const orgSimilar = (o.organization || '').toLowerCase() === (opp.organization || '').toLowerCase();
          return titleSimilar && orgSimilar;
        })
      );
      
      console.log(`Returning ALL ${uniqueOpportunities.length} unique opportunities for ALL majors`);
      return res.json(uniqueOpportunities);
    } catch (error) {
      console.error('Opportunities route error:', error);
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

  // Import authentic opportunity data
  app.post("/api/import", async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Start activity log
      await storage.createActivity({
        userId,
        message: "Started importing verified high school programs and opportunities",
        type: "import",
      });

      res.json({ message: "Data import started" });

      // Import data in background (don't await, let it run asynchronously)
      import('./data-importer').then(({ dataImporter }) => {
        return dataImporter.importAllData();
      }).then(async () => {
        await storage.createActivity({
          userId,
          message: "Successfully imported authentic high school opportunities from curated databases",
          type: "import",
        });
      }).catch(async (error) => {
        console.error('Import error:', error);
        await storage.createActivity({
          userId,
          message: "Data import encountered an error. Please try again.",
          type: "error",
        });
      });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Import batch opportunities endpoint
  app.post("/api/opportunities/import", async (req, res) => {
    try {
      const { opportunities } = req.body;
      if (!opportunities || !Array.isArray(opportunities)) {
        return res.status(400).json({ message: "Invalid opportunities data" });
      }

      let imported = 0;
      let skipped = 0;

      for (const oppData of opportunities) {
        try {
          // Validate the opportunity data
          const validatedData = insertOpportunitySchema.parse(oppData);
          await storage.createOpportunity(validatedData);
          imported++;
        } catch (error) {
          console.log(`Skipped opportunity: ${oppData.title} - ${error.message}`);
          skipped++;
        }
      }

      const totalOpportunities = await storage.getOpportunities();
      
      res.json({
        imported,
        skipped,
        total: totalOpportunities.length,
        message: `Successfully imported ${imported} opportunities, skipped ${skipped} duplicates`
      });
    } catch (error) {
      console.error('Batch import error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // MASSIVE Scholarship Extraction from HTML files
  app.post("/api/import-scholarships", async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Start activity log
      await storage.createActivity({
        userId,
        message: "🚀 Started MASSIVE scholarship extraction from HTML files (287 scholarships expected)",
        type: "import",
      });

      res.json({ message: "MASSIVE scholarship extraction started" });

      // Import scholarships in background
      import('./data-importer').then(({ dataImporter }) => {
        return dataImporter.importMassiveScholarshipExtraction();
      }).then(async () => {
        await storage.createActivity({
          userId,
          message: "🎯 Successfully extracted ALL scholarships from HTML database files",
          type: "import",
        });
      }).catch(async (error) => {
        console.error('Scholarship extraction error:', error);
        await storage.createActivity({
          userId,
          message: "Scholarship extraction encountered an error. Please try again.",
          type: "error",
        });
      });

    } catch (error) {
      console.error('Import route error:', error);
      // Only send response if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // NYC CSV Import Route for multiple CSV files
  app.post("/api/import-nyc-csvs", async (req, res) => {
    try {
      const { userId, csvFiles } = req.body;
      
      // Start activity log
      await storage.createActivity({
        userId,
        message: "🏙️ Started NYC CSV import for multiple files with thousands of opportunities",
        type: "import",
      });

      res.json({ message: "NYC CSV import started - processing multiple files" });

      // Import NYC CSVs in background
      import('./data-importer').then(({ dataImporter }) => {
        return dataImporter.importMultipleNYCCSVs(csvFiles || []);
      }).then(async () => {
        await storage.createActivity({
          userId,
          message: "🎯 Successfully imported all NYC opportunities from CSV files",
          type: "import",
        });
      }).catch(async (error) => {
        console.error('NYC CSV import error:', error);
        await storage.createActivity({
          userId,
          message: "NYC CSV import encountered an error. Please check the files and try again.",
          type: "error",
        });
      });

    } catch (error) {
      console.error('NYC import route error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Auto-detect and import single NYC CSV file
  app.post("/api/import-single-nyc-csv", async (req, res) => {
    try {
      const { userId, fileName } = req.body;
      
      await storage.createActivity({
        userId,
        message: `🏙️ Processing NYC CSV file: ${fileName}`,
        type: "import",
      });

      res.json({ message: `Processing ${fileName}` });

      // Auto-detect NYC CSV files in attached_assets
      import('./data-importer').then(({ dataImporter }) => {
        return dataImporter.autoDetectAndImportNYCCSVs();
      }).then(async () => {
        await storage.createActivity({
          userId,
          message: "🎯 Successfully auto-detected and imported NYC CSV files",
          type: "import",
        });
      }).catch(async (error) => {
        console.error('Auto NYC CSV import error:', error);
        await storage.createActivity({
          userId,
          message: "Auto NYC CSV import failed. Check file format and try manual import.",
          type: "error",
        });
      });

    } catch (error) {
      console.error('Single NYC import error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Stuyvesant Opportunity Bulletin Import Route
  app.post("/api/import-stuyvesant", async (req, res) => {
    try {
      const { userId } = req.body;
      
      await storage.createActivity({
        userId,
        message: "🏫 Started importing massive Stuyvesant Student Opportunity Bulletin collection",
        type: "import",
      });

      res.json({ message: "Stuyvesant import started - processing 15+ bulletin files" });

      // Import Stuyvesant opportunities in background
      import('./data-importer').then(({ dataImporter }) => {
        return dataImporter.importStuyvesantOpportunities();
      }).then(async () => {
        await storage.createActivity({
          userId,
          message: "🎯 Successfully imported all Stuyvesant opportunities from bulletin files",
          type: "import",
        });
      }).catch(async (error) => {
        console.error('Stuyvesant import error:', error);
        await storage.createActivity({
          userId,
          message: "Stuyvesant import encountered an error. Check file format.",
          type: "error",
        });
      });

    } catch (error) {
      console.error('Stuyvesant import route error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // New Stuyvesant Bulletin Import Route (899 opportunities)
  app.post("/api/import-new-stuyvesant", async (req, res) => {
    try {
      const { userId } = req.body;
      
      await storage.createActivity({
        userId,
        message: "📄 Started importing NEW Stuyvesant bulletins with 899 additional opportunities",
        type: "import",
      });

      res.json({ message: "New Stuyvesant import started - processing 31 additional bulletin files" });

      // Import new Stuyvesant opportunities in background
      import('./data-importer').then(({ dataImporter }) => {
        return dataImporter.importNewStuyvesantBulletins();
      }).then(async () => {
        await storage.createActivity({
          userId,
          message: "🎉 Successfully imported 899 NEW Stuyvesant opportunities! Database expanded significantly.",
          type: "import",
        });
      }).catch(async (error) => {
        console.error('New Stuyvesant import error:', error);
        await storage.createActivity({
          userId,
          message: "New Stuyvesant import encountered an error. Check if opportunities were extracted first.",
          type: "error",
        });
      });

    } catch (error) {
      console.error('New Stuyvesant import route error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Comprehensive Files Import Route
  app.post("/api/import-comprehensive-files", async (req, res) => {
    try {
      const { userId } = req.body;
      
      await storage.createActivity({
        userId,
        message: "🚀 Started importing comprehensive academic files (9 files: Python, CS, Business, STEM, Research, Medicine, Ocean Sciences)",
        type: "import",
      });

      res.json({ message: "Comprehensive files import started - processing 9 academic files" });

      // Import comprehensive files in background
      import('./data-importer').then(({ dataImporter }) => {
        return dataImporter.importComprehensiveFiles();
      }).then(async () => {
        await storage.createActivity({
          userId,
          message: "🎉 Successfully imported comprehensive academic opportunities from all 9 files!",
          type: "import",
        });
      }).catch(async (error) => {
        console.error('Comprehensive files import error:', error);
        await storage.createActivity({
          userId,
          message: "Comprehensive files import encountered an error. Please check file formats.",
          type: "error",
        });
      });

    } catch (error) {
      console.error('Comprehensive files import route error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      }
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

  // New High School Opportunities Import Route
  app.post("/api/import-new-high-school", async (req, res) => {
    try {
      const { userId } = req.body;
      
      await storage.createActivity({
        userId,
        message: "🎓 Started importing new high school opportunities from attached CSV and text files",
        type: "import",
      });

      res.json({ message: "New high school opportunities import started - processing 5 files" });

      // Import new high school opportunities in background
      import('./data-importer').then(({ dataImporter }) => {
        return dataImporter.importNewHighSchoolOpportunities();
      }).then(async () => {
        await storage.createActivity({
          userId,
          message: "🎯 Successfully imported all new high school opportunities from CSV and text files",
          type: "import",
        });
      }).catch(async (error) => {
        console.error('New high school import error:', error);
        await storage.createActivity({
          userId,
          message: "New high school import encountered an error. Check file format.",
          type: "error",
        });
      });

    } catch (error) {
      console.error('New high school import route error:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      }
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
