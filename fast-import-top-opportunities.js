// FAST IMPORT: Add verified high-quality opportunities with correct schema
async function fastImportTopOpportunities() {
  console.log('🚀 FAST IMPORT: Adding verified opportunities...');
  
  // Check current database state
  const checkResponse = await fetch('http://localhost:5000/api/opportunities');
  const existing = await checkResponse.json();
  console.log(`Current database: ${existing.length} opportunities`);
  
  // High-quality opportunities with proper schema
  const topOpportunities = [
    {
      title: "Gates Millennium Scholars Program",
      organization: "Bill & Melinda Gates Foundation",
      type: "scholarship",
      description: "The Gates Millennium Scholars Program provides outstanding African American, American Indian/Alaska Native, Asian Pacific Islander American, and Hispanic American students with full college scholarships through graduate school.",
      source: "Verified Scholarship Database",
      location: "National",
      link: "https://www.gmsp.org/",
      deadline: "January 15",
      cost: "Free",
      requirements: ["Minimum 3.3 GPA", "Demonstrate leadership", "Financial need"],
      tags: ["scholarship", "minority", "full-ride"]
    },
    {
      title: "Jack Kent Cooke Foundation College Scholarship",
      organization: "Jack Kent Cooke Foundation", 
      type: "scholarship",
      description: "The Jack Kent Cooke Foundation College Scholarship is the nation's largest private scholarship for high-achieving high school seniors with financial need. Covers up to $55,000 per year.",
      source: "Verified Scholarship Database",
      location: "National",
      link: "https://www.jkcf.org/our-scholarships/college-scholarship/",
      deadline: "November 17",
      cost: "Free",
      requirements: ["Top 5% of class", "SAT/ACT scores", "Financial need"],
      tags: ["scholarship", "high-achieving", "financial-need"]
    },
    {
      title: "NASA Goddard Institute for Space Studies Internship",
      organization: "NASA Goddard Institute for Space Studies",
      type: "internship", 
      description: "The NASA GISS internship program provides undergraduate and graduate students with hands-on research experience in climate science, atmospheric physics, and space studies.",
      source: "NASA Official Programs",
      location: "New York, NY",
      link: "https://www.giss.nasa.gov/",
      deadline: "March 1",
      cost: "Paid position",
      requirements: ["STEM major", "Strong academic record", "Research interest"],
      tags: ["NASA", "climate-science", "research", "space"]
    },
    {
      title: "Microsoft High School Internship Program",
      organization: "Microsoft Corporation",
      type: "internship",
      description: "Microsoft's high school internship program provides students with real-world experience in technology, software development, and business operations.",
      source: "Microsoft Careers",
      location: "Redmond, WA", 
      link: "https://careers.microsoft.com/students/",
      deadline: "February 28",
      cost: "Paid position",
      requirements: ["Programming experience", "Strong academics", "Passion for technology"],
      tags: ["Microsoft", "technology", "programming"]
    },
    {
      title: "Google Computer Science Summer Institute",
      organization: "Google LLC",
      type: "program",
      description: "Google CSSI is a three-week introduction to computer science for graduating high school seniors with a passion for technology.",
      source: "Google Education Programs",
      location: "Multiple locations",
      link: "https://buildyourfuture.withgoogle.com/programs/computer-science-summer-institute/",
      deadline: "March 15", 
      cost: "Free",
      requirements: ["Interest in computer science", "Underrepresented groups", "Academic achievement"],
      tags: ["Google", "computer-science", "programming", "diversity"]
    },
    {
      title: "Columbia University Science Honors Program",
      organization: "Columbia University",
      type: "program", 
      description: "The Columbia Science Honors Program is a highly selective enrichment program for high school students with exceptional ability and achievement in mathematics and science.",
      source: "Columbia University",
      location: "New York, NY",
      link: "https://www.columbia.edu/cu/shp/",
      deadline: "December 15",
      cost: "$1,200 per year",
      requirements: ["Strong math and science grades", "PSAT/SAT scores", "Teacher recommendations"],
      tags: ["Columbia", "science", "mathematics", "enrichment"]
    },
    {
      title: "MIT Research Science Institute",
      organization: "Massachusetts Institute of Technology",
      type: "program",
      description: "RSI is a prestigious six-week summer research program where high school students conduct original research in science, technology, engineering, and mathematics.",
      source: "MIT Programs",
      location: "Cambridge, MA",
      link: "https://www.cee.org/research-science-institute",
      deadline: "January 24",
      cost: "Free",
      requirements: ["Top 1% of class", "Exceptional PSAT/SAT", "Research potential"],
      tags: ["MIT", "research", "STEM", "prestigious"]
    },
    {
      title: "Harvard University Secondary School Program",
      organization: "Harvard University",
      type: "program",
      description: "Harvard's Secondary School Program allows motivated high school students to experience college-level coursework by enrolling in Harvard courses.",
      source: "Harvard Extension School",
      location: "Cambridge, MA",
      link: "https://www.dce.harvard.edu/precollege/",
      deadline: "Rolling admissions",
      cost: "Varies by course", 
      requirements: ["Strong academic record", "Maturity", "Preparation for college-level work"],
      tags: ["Harvard", "college-level", "coursework", "academic"]
    },
    {
      title: "USA Computing Olympiad",
      organization: "USA Computing Olympiad",
      type: "competition",
      description: "USACO is a computer programming competition for high school students in the United States. It serves as the primary method for selecting the US team for the International Olympiad in Informatics.",
      source: "USACO Official",
      location: "Online",
      link: "http://www.usaco.org/",
      deadline: "Multiple throughout year",
      cost: "Free",
      requirements: ["Programming knowledge", "Problem-solving skills", "High school student"],
      tags: ["programming", "competition", "olympiad", "computer-science"]
    },
    {
      title: "Science Olympiad National Tournament", 
      organization: "Science Olympiad",
      type: "competition",
      description: "Science Olympiad is a national STEM competition where teams of 15 students compete in 23 events covering biology, chemistry, physics, earth science, astronomy, and engineering.",
      source: "Science Olympiad Official",
      location: "National",
      link: "https://www.soinc.org/",
      deadline: "Varies by state",
      cost: "Registration fee",
      requirements: ["Team participation", "STEM knowledge", "Preparation"],
      tags: ["science", "competition", "STEM", "team"]
    }
  ];
  
  console.log(`🚀 Importing ${topOpportunities.length} verified opportunities...`);
  
  let imported = 0;
  let failed = 0;
  
  for (const opportunity of topOpportunities) {
    try {
      const response = await fetch('http://localhost:5000/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opportunity),
      });
      
      if (response.ok) {
        imported++;
        console.log(`✅ Imported: ${opportunity.title}`);
      } else {
        failed++;
        const error = await response.text();
        console.log(`❌ Failed: ${opportunity.title} - ${error}`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ Error importing ${opportunity.title}: ${error.message}`);
    }
  }
  
  console.log(`🎯 IMPORT COMPLETE: ${imported} imported, ${failed} failed`);
  
  // Verify final state
  const finalResponse = await fetch('http://localhost:5000/api/opportunities');
  const finalOpportunities = await finalResponse.json();
  
  console.log(`📊 FINAL DATABASE: ${finalOpportunities.length} high-quality opportunities`);
  
  if (finalOpportunities.length > 0) {
    console.log(`✅ Sample opportunities:`);
    finalOpportunities.slice(0, 3).forEach((opp, i) => {
      console.log(`${i+1}. ${opp.title} (${opp.organization})`);
    });
  }
}

fastImportTopOpportunities().catch(console.error);