// MASS IMPORT: Process ALL 6,845+ opportunities from comprehensive extraction
import fs from 'fs';

async function massImportAllOpportunities() {
  console.log('🚀 MASS IMPORT: Loading ALL comprehensive opportunities...');
  
  // Load the comprehensive extraction results
  const data = JSON.parse(fs.readFileSync('comprehensive-bulletin-opportunities.json', 'utf8'));
  console.log(`📊 Found ${data.length} opportunities to process`);
  
  // Filter and clean opportunities to remove fragments and improve quality
  const cleanedOpportunities = data
    .filter(opp => {
      // Remove obvious fragments and low-quality entries
      const title = opp.title?.trim() || '';
      const description = opp.description?.trim() || '';
      
      // Skip very short titles (likely fragments)
      if (title.length < 10) return false;
      
      // Skip titles that are clearly sentence fragments
      if (title.startsWith('and ') || title.startsWith('or ') || title.startsWith('the ')) return false;
      if (title.endsWith(' and') || title.endsWith(' or') || title.endsWith(' the')) return false;
      
      // Skip titles that don't contain key opportunity words
      const opportunityWords = ['program', 'scholarship', 'internship', 'camp', 'course', 'workshop', 'competition', 'fellowship', 'institute', 'academy', 'center', 'college', 'university', 'school', 'opportunity', 'project', 'research', 'summer', 'career', 'job', 'volunteer', 'service', 'arts', 'science', 'technology', 'engineering', 'math', 'stem', 'medical', 'health', 'business', 'leadership', 'mentorship', 'training', 'education'];
      const hasOpportunityWord = opportunityWords.some(word => 
        title.toLowerCase().includes(word) || description.toLowerCase().includes(word)
      );
      if (!hasOpportunityWord) return false;
      
      return true;
    })
    .map(opp => {
      // Clean and enhance the opportunity data
      let title = opp.title.trim();
      let description = opp.description?.trim() || 'High-quality opportunity extracted from Stuyvesant Student Opportunity Bulletin.';
      
      // Capitalize first letter of title
      title = title.charAt(0).toUpperCase() + title.slice(1);
      
      // Ensure description ends with period
      if (description && !description.endsWith('.') && !description.endsWith('!') && !description.endsWith('?')) {
        description += '.';
      }
      
      // Enhance organization names
      let organization = opp.organization || 'Educational Institution';
      if (organization === 'Educational Institution' && title.includes('Columbia')) {
        organization = 'Columbia University';
      } else if (organization === 'Educational Institution' && title.includes('Harvard')) {
        organization = 'Harvard University';
      } else if (organization === 'Educational Institution' && title.includes('MIT')) {
        organization = 'MIT';
      } else if (organization === 'Educational Institution' && title.includes('Yale')) {
        organization = 'Yale University';
      } else if (organization === 'Educational Institution' && title.includes('Princeton')) {
        organization = 'Princeton University';
      } else if (organization === 'Educational Institution' && title.includes('Cornell')) {
        organization = 'Cornell University';
      } else if (organization === 'Educational Institution' && title.includes('NYU')) {
        organization = 'New York University';
      } else if (organization === 'Educational Institution' && title.includes('CUNY')) {
        organization = 'CUNY System';
      }
      
      return {
        title: title,
        organization: organization,
        type: opp.type || 'internship',
        description: description,
        source: 'Stuyvesant Student Opportunity Bulletin',
        location: opp.location || 'New York, NY',
        link: opp.link || '',
        deadline: opp.deadline || 'Rolling',
        cost: opp.cost || 'Contact for details',
        requirements: Array.isArray(opp.requirements) ? opp.requirements : [],
        tags: Array.isArray(opp.tags) ? opp.tags : []
      };
    });
  
  console.log(`✅ Cleaned and filtered: ${cleanedOpportunities.length} high-quality opportunities`);
  
  // Import in batches to avoid overwhelming the server
  const batchSize = 50;
  let totalImported = 0;
  let totalFailed = 0;
  
  for (let i = 0; i < cleanedOpportunities.length; i += batchSize) {
    const batch = cleanedOpportunities.slice(i, i + batchSize);
    console.log(`🔄 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(cleanedOpportunities.length/batchSize)} (${batch.length} opportunities)...`);
    
    const batchPromises = batch.map(async (opportunity) => {
      try {
        const response = await fetch('http://localhost:5000/api/opportunities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(opportunity),
        });
        
        if (response.ok) {
          totalImported++;
          return { success: true, title: opportunity.title };
        } else {
          totalFailed++;
          return { success: false, title: opportunity.title, error: 'API error' };
        }
      } catch (error) {
        totalFailed++;
        return { success: false, title: opportunity.title, error: error.message };
      }
    });
    
    const results = await Promise.all(batchPromises);
    const batchImported = results.filter(r => r.success).length;
    const batchFailed = results.filter(r => !r.success).length;
    
    console.log(`✅ Batch completed: ${batchImported} imported, ${batchFailed} failed`);
    
    // Small delay between batches to avoid overwhelming the server
    if (i + batchSize < cleanedOpportunities.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`🎯 MASS IMPORT COMPLETE!`);
  console.log(`📈 Successfully imported: ${totalImported} opportunities`);
  console.log(`⚠️ Failed to import: ${totalFailed} opportunities`);
  console.log(`🎊 TOTAL DATABASE EXPANSION: +${totalImported} opportunities`);
}

massImportAllOpportunities().catch(console.error);