// Direct import using API calls
const comprehensiveOpportunities = [
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
  }
];

async function importViaAPI() {
  console.log('🎯 Importing comprehensive opportunities via API...');
  
  for (const opportunity of comprehensiveOpportunities) {
    try {
      const response = await fetch('http://localhost:5000/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(opportunity),
      });
      
      if (response.ok) {
        console.log(`✓ Successfully imported: ${opportunity.title}`);
      } else {
        console.log(`⚠️ Failed to import: ${opportunity.title}`);
      }
    } catch (error) {
      console.log(`❌ Error importing ${opportunity.title}:`, error.message);
    }
  }
  
  console.log('🎯 Comprehensive import completed!');
}

importViaAPI().catch(console.error);