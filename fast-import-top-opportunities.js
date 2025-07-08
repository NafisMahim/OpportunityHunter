// FAST IMPORT: Import top 500 highest quality opportunities immediately
import fs from 'fs';

async function fastImportTopOpportunities() {
  console.log('⚡ FAST IMPORT: Loading top quality opportunities...');
  
  const data = JSON.parse(fs.readFileSync('rebuild-comprehensive-opportunities.json', 'utf8'));
  console.log(`📊 Processing ${data.length} total opportunities`);
  
  // Advanced scoring system for quality opportunities
  const scoredOpportunities = data
    .map(opp => {
      let score = 0;
      const title = opp.title?.toLowerCase() || '';
      const description = opp.description?.toLowerCase() || '';
      const combined = title + ' ' + description;
      
      // High-value keywords (boost score significantly)
      const highValueKeywords = [
        'university', 'college', 'scholarship', 'fellowship', 'internship',
        'columbia', 'harvard', 'yale', 'princeton', 'mit', 'cornell', 'nyu',
        'paid', 'stipend', 'funding', 'research', 'stem', 'science',
        'summer program', 'leadership', 'competition', 'institute', 'academy'
      ];
      
      // Medium-value keywords
      const mediumValueKeywords = [
        'program', 'course', 'workshop', 'training', 'career', 'volunteer',
        'museum', 'hospital', 'center', 'foundation', 'nonprofit'
      ];
      
      // Calculate score
      highValueKeywords.forEach(keyword => {
        if (combined.includes(keyword)) score += 10;
      });
      
      mediumValueKeywords.forEach(keyword => {
        if (combined.includes(keyword)) score += 5;
      });
      
      // Bonus for specific program types
      if (combined.includes('summer')) score += 3;
      if (combined.includes('free')) score += 2;
      if (combined.includes('deadline')) score += 2;
      if (combined.includes('application')) score += 2;
      
      // Penalty for fragments or poor quality
      if (title.length < 20) score -= 5;
      if (title.startsWith('for ') || title.startsWith('in ') || title.startsWith('and ')) score -= 10;
      if (combined.includes('section') || combined.includes('deadline are')) score -= 15;
      
      return { ...opp, qualityScore: score };
    })
    .filter(opp => opp.qualityScore > 5) // Only high-scoring opportunities
    .sort((a, b) => b.qualityScore - a.qualityScore) // Sort by score
    .slice(0, 500) // Take top 500
    .map(opp => ({
      title: opp.title.trim(),
      organization: opp.organization || 'Educational Institution',
      type: opp.type || 'internship',
      description: opp.description?.trim() || `${opp.title} - Comprehensive opportunity from Stuyvesant Student Opportunity Bulletin.`,
      source: 'Stuyvesant Student Opportunity Bulletin - Top Quality Extraction',
      location: opp.location || 'New York, NY',
      link: opp.link || '',
      deadline: opp.deadline || 'Rolling',
      cost: opp.cost || 'Contact for details',
      requirements: Array.isArray(opp.requirements) ? opp.requirements : [],
      tags: Array.isArray(opp.tags) ? opp.tags.filter(tag => tag && tag.length > 2) : []
    }));
  
  console.log(`✅ Selected top ${scoredOpportunities.length} highest quality opportunities`);
  
  // Fast parallel import
  const batchSize = 10;
  let totalImported = 0;
  let totalFailed = 0;
  
  for (let i = 0; i < scoredOpportunities.length; i += batchSize) {
    const batch = scoredOpportunities.slice(i, i + batchSize);
    
    const promises = batch.map(async (opportunity) => {
      try {
        const response = await fetch('http://localhost:5000/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opportunity),
        });
        return response.ok ? 'success' : 'failed';
      } catch {
        return 'failed';
      }
    });
    
    const results = await Promise.all(promises);
    const succeeded = results.filter(r => r === 'success').length;
    const failed = results.filter(r => r === 'failed').length;
    
    totalImported += succeeded;
    totalFailed += failed;
    
    if ((i + batchSize) % 50 === 0) {
      console.log(`⚡ Fast import progress: ${totalImported} imported, ${totalFailed} failed`);
    }
  }
  
  console.log(`⚡ FAST IMPORT COMPLETE!`);
  console.log(`📈 Successfully imported: ${totalImported} top quality opportunities`);
  console.log(`⚠️ Failed to import: ${totalFailed} opportunities`);
  console.log(`🎊 MAJOR DATABASE EXPANSION: +${totalImported} opportunities`);
}

fastImportTopOpportunities().catch(console.error);