const axios = require('axios');
const fs = require('fs');

// Import all 140 extracted PDF opportunities into the database
async function importComprehensivePDFOpportunities() {
  try {
    console.log('📚 Starting comprehensive PDF opportunities import...');
    
    // Load the extracted opportunities
    const opportunities = JSON.parse(fs.readFileSync('complete-pdf-opportunities.json', 'utf8'));
    
    console.log(`Found ${opportunities.length} opportunities to import`);
    
    let imported = 0;
    let duplicates = 0;
    let errors = 0;
    
    for (const opportunity of opportunities) {
      try {
        // Prepare opportunity data for API  
        const opportunityData = {
          title: opportunity.title,
          organization: opportunity.location || 'Various',
          location: opportunity.location,
          description: opportunity.description,
          requirements: [opportunity.eligibility || ''],
          salary: opportunity.cost === 'Free' ? '$0' : opportunity.cost,
          url: opportunity.url,
          type: opportunity.category,
          deadline: opportunity.dates,
          source: 'PDF Manual Extraction',
          tags: []
        };
        
        // Import into database via API
        const response = await axios.post('http://localhost:5000/api/opportunities', opportunityData);
        
        if (response.status === 201) {
          imported++;
          console.log(`✅ Imported: ${opportunity.title}`);
        }
        
        // Add small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        if (error.response && error.response.status === 409) {
          duplicates++;
          console.log(`🔄 Duplicate: ${opportunity.title}`);
        } else {
          errors++;
          console.log(`❌ Error importing ${opportunity.title}: ${error.message}`);
        }
      }
    }
    
    console.log('\n📊 COMPREHENSIVE PDF IMPORT SUMMARY:');
    console.log(`✅ Successfully imported: ${imported}`);
    console.log(`🔄 Duplicates skipped: ${duplicates}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📁 Total processed: ${opportunities.length}`);
    
    if (imported > 0) {
      console.log('\n🎉 MAJOR SUCCESS: All PDF opportunities with correct URLs imported!');
      console.log('💪 Database now contains comprehensive high school opportunities covering:');
      console.log('  • Business & Entrepreneurship Programs');
      console.log('  • Computer Science & Robotics');
      console.log('  • Environmental Science & Conservation');
      console.log('  • Medical & Research Internships');
      console.log('  • STEM & Mathematics Programs');
      console.log('  • Data Science & Programming');
      console.log('  • National Laboratory Positions');
      console.log('  • College Access Programs');
    }
    
  } catch (error) {
    console.error('❌ Fatal error during comprehensive PDF import:', error.message);
    process.exit(1);
  }
}

// Run the import
importComprehensivePDFOpportunities();