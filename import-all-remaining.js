// IMPORT ALL REMAINING: Import every single opportunity from the 13,228 extracted
import fs from 'fs';

async function importAllRemainingOpportunities() {
  console.log('🔥 IMPORTING ALL REMAINING OPPORTUNITIES...');
  
  const data = JSON.parse(fs.readFileSync('rebuild-comprehensive-opportunities.json', 'utf8'));
  console.log(`📊 Processing ALL ${data.length} opportunities`);
  
  // Basic cleaning but import EVERYTHING
  const allOpportunities = data
    .filter(opp => {
      const title = opp.title?.trim() || '';
      // Only filter out completely empty or meaningless entries
      return title.length > 5 && !title.match(/^[^a-zA-Z]*$/);
    })
    .map((opp, index) => {
      let title = opp.title?.trim() || `Opportunity ${index + 1}`;
      let description = opp.description?.trim() || `Comprehensive opportunity extracted from Stuyvesant Student Opportunity Bulletin.`;
      
      // Basic title cleanup
      title = title.replace(/\s+/g, ' ').trim();
      if (title.length > 200) title = title.substring(0, 200).trim();
      
      // Basic description cleanup  
      description = description.replace(/\s+/g, ' ').trim();
      if (description.length > 500) description = description.substring(0, 500).trim();
      if (!description.match(/[.!?]$/)) description += '.';
      
      return {
        title: title,
        organization: opp.organization || 'Educational Institution',
        type: opp.type || 'internship',
        description: description,
        source: 'Stuyvesant Student Opportunity Bulletin - Complete Extraction',
        location: opp.location || 'New York, NY',
        link: opp.link || '',
        deadline: opp.deadline || 'Rolling',
        cost: opp.cost || 'Contact for details',
        requirements: Array.isArray(opp.requirements) ? opp.requirements : [],
        tags: Array.isArray(opp.tags) ? opp.tags : []
      };
    });
  
  console.log(`✅ Prepared ${allOpportunities.length} opportunities for import`);
  
  // High-speed bulk import with aggressive batching
  const batchSize = 100;
  let totalImported = 0;
  let totalFailed = 0;
  
  for (let i = 0; i < allOpportunities.length; i += batchSize) {
    const batch = allOpportunities.slice(i, i + batchSize);
    const batchNum = Math.floor(i/batchSize) + 1;
    const totalBatches = Math.ceil(allOpportunities.length/batchSize);
    
    console.log(`🚀 BATCH ${batchNum}/${totalBatches}: Processing ${batch.length} opportunities...`);
    
    // Parallel batch processing for maximum speed
    const batchPromises = batch.map(async (opportunity) => {
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
    
    const results = await Promise.all(batchPromises);
    const succeeded = results.filter(r => r === 'success').length;
    const failed = results.filter(r => r === 'failed').length;
    
    totalImported += succeeded;
    totalFailed += failed;
    
    console.log(`✅ BATCH ${batchNum} COMPLETE: ${succeeded} imported, ${failed} failed (TOTAL: ${totalImported} imported)`);
    
    // Progress updates every 10 batches
    if (batchNum % 10 === 0) {
      console.log(`🔥 MASSIVE PROGRESS: ${totalImported} opportunities imported so far!`);
    }
  }
  
  console.log(`🎊 ALL OPPORTUNITIES IMPORT COMPLETE!`);
  console.log(`📈 Successfully imported: ${totalImported} opportunities`);
  console.log(`⚠️ Failed to import: ${totalFailed} opportunities`);
  console.log(`🚀 TOTAL DATABASE SIZE: 636 + ${totalImported} = ${636 + totalImported} opportunities!`);
  console.log(`🎯 TARGET ACHIEVED: Imported ${totalImported} out of ${allOpportunities.length} prepared opportunities`);
}

importAllRemainingOpportunities().catch(console.error);