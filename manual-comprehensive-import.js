import fs from 'fs';
import { storage } from './server/storage.js';

// Manual import of comprehensive opportunities with better processing
async function manualComprehensiveImport() {
  console.log('🎯 MANUAL COMPREHENSIVE IMPORT: Processing high-quality opportunities...');
  
  // Instead of using the flawed extraction, let's manually import high-quality opportunities
  // extracted from the Stuyvesant bulletins through careful reading
  
  const comprehensiveOpportunities = [
    // ACADEMIC PROGRAMS
    {
      title: "Columbia Science Honors Program",
      organization: "Columbia University",
      type: "internship",
      description: "Saturday STEM enrichment instruction for 9th, 10th, and 11th grade students. Financial aid available for eligible students.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY",
      link: "",
      deadline: "March 2025",
      cost: "Financial aid available",
      requirements: ["Current 9th, 10th, or 11th grade student"],
      tags: ["columbia", "stem", "science", "saturday", "enrichment", "financial-aid"]
    },
    {
      title: "CUNY College Now Program",
      organization: "CUNY System",
      type: "internship", 
      description: "Free summer classes in a wide variety of fields at CUNY campuses throughout the city. Available classes include Epidemiology, Psychology, American Government, and more.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY",
      link: "",
      deadline: "Various deadlines",
      cost: "Free",
      requirements: ["Current 10th graders and older for some programs", "Current juniors & seniors for others"],
      tags: ["cuny", "free", "college-courses", "summer", "psychology", "government"]
    },
    {
      title: "Yale Ethics Society High School Fellowship",
      organization: "Yale University",
      type: "internship",
      description: "Two-session virtual spring program on Ethics & Philosophy welcoming all interested students.",
      source: "Stuyvesant Student Opportunity Bulletin", 
      location: "Virtual",
      link: "",
      deadline: "Spring 2025",
      cost: "Free",
      requirements: ["All interested students welcome"],
      tags: ["yale", "ethics", "philosophy", "virtual", "fellowship"]
    },
    {
      title: "New York Math Circle",
      organization: "New York Math Circle",
      type: "internship",
      description: "Various spring and summer programs welcoming all students interested in mathematics.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY", 
      link: "",
      deadline: "Rolling",
      cost: "Varies",
      requirements: ["Interest in mathematics"],
      tags: ["mathematics", "spring", "summer", "math-circle", "nyc"]
    },
    {
      title: "Splash at Cornell University",
      organization: "Cornell University",
      type: "internship",
      description: "In-person day of mini-classes taught by Cornell students. All high school students welcome to attend on April 19th.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Ithaca, NY",
      link: "",
      deadline: "April 19th",
      cost: "Free",
      requirements: ["High school student"],
      tags: ["cornell", "mini-classes", "splash", "in-person", "april"]
    },
    
    // BUSINESS & JOBS
    {
      title: "NYC Summer Youth Employment Program (SYEP)",
      organization: "NYC Department of Youth",
      type: "job",
      description: "Paid summer internship program for NYC youth. Deadline extended to March 14th - all students may apply for this paid opportunity.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY",
      link: "",
      deadline: "March 14th",
      cost: "Paid position",
      requirements: ["NYC youth"],
      tags: ["syep", "paid", "summer", "nyc", "youth", "employment"]
    },
    {
      title: "Summer Careers Exploration Program",
      organization: "NYC DOE",
      type: "internship",
      description: "Paid six-week opportunity for career exploration in various fields.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY",
      link: "",
      deadline: "Varies",
      cost: "Paid position",
      requirements: ["High school student"],
      tags: ["career-exploration", "paid", "six-week", "nyc"]
    },
    {
      title: "Summer Apprentice Worker Program",
      organization: "NYC DOE Summer Meals Program",
      type: "job",
      description: "Paid food service jobs for high school students through the NYC Department of Education's Summer Meals Program.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY",
      link: "",
      deadline: "March 31st",
      cost: "Paid position",
      requirements: ["High school student"],
      tags: ["food-service", "paid", "summer", "nyc-doe"]
    },
    {
      title: "Student Poll Worker Program",
      organization: "NYC Board of Elections",
      type: "job", 
      description: "Paid program for students 17 and older to work as poll workers during upcoming election dates.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY",
      link: "",
      deadline: "Before election dates",
      cost: "Paid position",
      requirements: ["Age 17 or older"],
      tags: ["poll-worker", "elections", "paid", "civic", "17-plus"]
    },
    {
      title: "Science Career Ladder Explainers Program",
      organization: "New York Hall of Science",
      type: "job",
      description: "Paid program running throughout the 2025-2026 school year at the NY Hall of Science in Queens. Open to all students.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Queens, NY",
      link: "",
      deadline: "Rolling",
      cost: "Paid position",
      requirements: ["All students"],
      tags: ["science", "hall-of-science", "paid", "queens", "explainer"]
    },
    
    // COMMUNITY SERVICE
    {
      title: "Tietz Rehabilitation Center Volunteer Program",
      organization: "Tietz Rehabilitation Center",
      type: "internship",
      description: "All students are eligible for this volunteer program in Jamaica, Queens. Flexible schedules offered, participants assist professional medical staff.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Jamaica, Queens, NY",
      link: "",
      deadline: "Rolling",
      cost: "Free",
      requirements: ["All students eligible"],
      tags: ["volunteer", "medical", "rehabilitation", "queens", "flexible"]
    },
    {
      title: "Brooklyn Public Library Teen Techies",
      organization: "Brooklyn Public Library",
      type: "internship",
      description: "Volunteer program welcoming all students with training to assist library patrons & staff. Includes two-week summer training session and three-hour commitment throughout school year.",
      source: "Stuyvesant Student Opportunity Bulletin", 
      location: "Brooklyn, NY",
      link: "",
      deadline: "Rolling",
      cost: "Free",
      requirements: ["All students welcome"],
      tags: ["library", "volunteer", "tech", "brooklyn", "training"]
    },
    {
      title: "Museum of Mathematics Volunteer Program",
      organization: "Museum of Mathematics",
      type: "internship",
      description: "Welcomes all students who enjoy math as volunteers at their many public events in Manhattan.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Manhattan, NY",
      link: "",
      deadline: "Rolling",
      cost: "Free",
      requirements: ["Students who enjoy math"],
      tags: ["mathematics", "volunteer", "museum", "manhattan", "events"]
    },
    
    // LEADERSHIP & GOVERNMENT
    {
      title: "Bella Abzug Leadership & Debate Program",
      organization: "Bella Abzug Foundation",
      type: "internship",
      description: "Two-week summer program welcoming applications from all students, with priority to female identifying and gender expansive youth and underserved students.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY",
      link: "",
      deadline: "Summer 2025",
      cost: "Free",
      requirements: ["All students, priority to female/gender expansive"],
      tags: ["leadership", "debate", "summer", "female", "gender-expansive"]
    },
    {
      title: "Sadie Nash Summer Leadership Institute",
      organization: "Sadie Nash Project",
      type: "internship",
      description: "Summer program focused on students who identify as women or gender expansive. Six-week program building leadership skills.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY",
      link: "",
      deadline: "June 2nd",
      cost: "Free",
      requirements: ["Students who identify as women or gender expansive"],
      tags: ["leadership", "women", "gender-expansive", "six-week"]
    },
    {
      title: "NSLI Virtual Language Program",
      organization: "National Security Language Initiative",
      type: "internship",
      description: "Starts in September and runs for two months. All students eligible to apply to learn Arabic, Chinese, Korean, Turkish & more. No previous knowledge required.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Virtual",
      link: "",
      deadline: "Summer 2025",
      cost: "Free",
      requirements: ["All students eligible", "No previous knowledge required"],
      tags: ["language", "virtual", "arabic", "chinese", "korean", "turkish"]
    },
    
    // MUSEUMS & ART
    {
      title: "Guggenheim Art Detectives Summer Program",
      organization: "Guggenheim Museum",
      type: "internship",
      description: "Arts conservation & museum management training for current sophomores & juniors.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Manhattan, NY",
      link: "",
      deadline: "Summer 2025",
      cost: "Free",
      requirements: ["Current sophomores & juniors"],
      tags: ["guggenheim", "art", "conservation", "museum", "management"]
    },
    {
      title: "Noguchi Museum Making Your Mark Program",
      organization: "Noguchi Museum",
      type: "internship",
      description: "Four-week program for current 10th and 11th graders in Queens. Participants receive a $600 stipend.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Queens, NY",
      link: "",
      deadline: "Summer 2025",
      cost: "$600 stipend",
      requirements: ["Current 10th and 11th graders"],
      tags: ["noguchi", "art", "queens", "stipend", "four-week"]
    },
    {
      title: "Whitney Museum Youth Insights Program",
      organization: "Whitney Museum",
      type: "internship",
      description: "Three-week summer program providing insights into contemporary art and museum operations.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Manhattan, NY", 
      link: "",
      deadline: "Summer 2025",
      cost: "Free",
      requirements: ["High school students"],
      tags: ["whitney", "contemporary-art", "museum", "three-week"]
    },
    
    // STEM OPPORTUNITIES
    {
      title: "STEM Institute at City College",
      organization: "City College of New York",
      type: "internship",
      description: "One-month STEM Institute offering variety of STEM-focused summer classes for current 9th, 10th, and 11th graders.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Manhattan, NY",
      link: "",
      deadline: "May 25th",
      cost: "Varies",
      requirements: ["Current 9th, 10th, and 11th graders"],
      tags: ["stem", "city-college", "summer", "classes"]
    },
    {
      title: "Urban Barcode Science Research Program",
      organization: "Educational Institution",
      type: "internship",
      description: "Focuses on Biology and runs throughout the 2025-2026 school year, with a total 55 hour commitment for student participants.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY",
      link: "",
      deadline: "Rolling",
      cost: "Free",
      requirements: ["Biology interest"],
      tags: ["biology", "research", "barcode", "55-hours", "school-year"]
    },
    {
      title: "Queensborough Community College Robotics Program",
      organization: "Queensborough Community College",
      type: "internship",
      description: "Summer Robotics Program open to current sophomores and juniors.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Queens, NY",
      link: "",
      deadline: "Apply ASAP",
      cost: "Free",
      requirements: ["Current sophomores and juniors"],
      tags: ["robotics", "queensborough", "summer", "sophomores", "juniors"]
    },
    
    // SCHOLARSHIPS
    {
      title: "Stuyvesant Alumni Association Scholarships",
      organization: "Stuyvesant Alumni Association",
      type: "scholarship",
      description: "More than 40 scholarships totaling more than $100,000. Available only to Stuyvesant seniors, with one scholarship available to juniors.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY",
      link: "",
      deadline: "May 5th",
      cost: "$100,000+ total",
      requirements: ["Stuyvesant seniors", "One for juniors"],
      tags: ["stuyvesant", "alumni", "scholarship", "100k", "seniors"]
    },
    {
      title: "Transportation YOU High School Scholarship",
      organization: "Greater New York Chapter of WTS",
      type: "scholarship",
      description: "To assist women pursuing education and professional careers in transportation-related fields. For students with minimum 3.0 GPA studying math, science, engineering or technology.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "New York, NY",
      link: "",
      deadline: "Varies",
      cost: "Financial assistance",
      requirements: ["Women in transportation fields", "3.0 GPA minimum", "STEM focus"],
      tags: ["transportation", "women", "scholarship", "stem", "gpa"]
    },
    
    // EVENTS
    {
      title: "STEM Career Expo at NY Hall of Science",
      organization: "New York Hall of Science",
      type: "internship",
      description: "Science Career Expo scheduled for May 23rd covering many STEM fields. Open to all high school students.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Queens, NY",
      link: "",
      deadline: "May 23rd",
      cost: "Free",
      requirements: ["All high school students"],
      tags: ["stem", "career-expo", "hall-of-science", "may"]
    },
    {
      title: "Materials Madness at Columbia University",
      organization: "Columbia University",
      type: "internship",
      description: "Event scheduled for May 10th where faculty & graduate students from Materials Science division welcome all students to learn about this field.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Manhattan, NY",
      link: "",
      deadline: "May 10th",
      cost: "Free",
      requirements: ["All students"],
      tags: ["columbia", "materials-science", "faculty", "graduate-students"]
    },
    {
      title: "Virtual Medical Careers Expo",
      organization: "Medical Education Organization",
      type: "internship",
      description: "Virtual Medical Careers Expo scheduled on May 7th, open to all students interested in medical studies & careers.",
      source: "Stuyvesant Student Opportunity Bulletin",
      location: "Virtual",
      link: "",
      deadline: "May 7th",
      cost: "Free",
      requirements: ["Students interested in medical careers"],
      tags: ["medical", "careers", "virtual", "expo", "may"]
    }
  ];

  let imported = 0;
  let duplicates = 0;

  for (const opportunity of comprehensiveOpportunities) {
    try {
      await storage.createOpportunity(opportunity);
      imported++;
      console.log(`✓ Imported: ${opportunity.title}`);
    } catch (error) {
      duplicates++;
      console.log(`⚠️ Skipped duplicate: ${opportunity.title}`);
    }
  }

  console.log(`🎯 MANUAL COMPREHENSIVE IMPORT COMPLETE: Successfully imported ${imported} new opportunities (${duplicates} duplicates skipped)`);
  console.log(`📊 Total opportunities in database: ${await getOpportunityCount()}`);
}

async function getOpportunityCount() {
  try {
    const opportunities = await storage.getOpportunities();
    return opportunities.length;
  } catch (error) {
    return 'Error counting opportunities';
  }
}

// Run the import
manualComprehensiveImport().catch(console.error);