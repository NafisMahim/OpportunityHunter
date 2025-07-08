// FINAL MASSIVE IMPORT: Import ALL remaining opportunities at maximum speed
import fs from 'fs';

async function finalMassiveImport() {
  console.log('🚀 FINAL MASSIVE IMPORT: Maximum speed processing...');
  
  const data = JSON.parse(fs.readFileSync('rebuild-comprehensive-opportunities.json', 'utf8'));
  console.log(`📊 Total opportunities to process: ${data.length}`);
  
  // Prepare ALL opportunities with minimal filtering
  const allOpportunities = data.map((opp, index) => {
    const title = opp.title?.trim() || `Opportunity ${index + 1}`;
    const description = opp.description?.trim() || `Comprehensive opportunity from Stuyvesant Student Opportunity Bulletin.`;
    
    return {
      title: title.substring(0, 200),
      organization: opp.organization || 'Educational Institution',
      type: opp.type || 'internship',
      description: description.substring(0, 500) + (description.length > 500 ? '.' : ''),
      source: 'Stuyvesant Student Opportunity Bulletin - Complete Extraction',
      location: opp.location || 'New York, NY',
      link: opp.link || '',
      deadline: opp.deadline || 'Rolling',
      cost: opp.cost || 'Contact for details',
      requirements: Array.isArray(opp.requirements) ? opp.requirements : [],
      tags: Array.isArray(opp.tags) ? opp.tags : []
    };
  });
  
  console.log(`✅ Prepared ${allOpportunities.length} opportunities for final import`);
  
  // Ultra-high-speed parallel import
  const batchSize = 200;
  let totalImported = 0;
  let batchesProcessed = 0;
  
  for (let i = 0; i < allOpportunities.length; i += batchSize) {
    const batch = allOpportunities.slice(i, i + batchSize);
    batchesProcessed++;
    
    console.log(`⚡ MEGA BATCH ${batchesProcessed}: Processing ${batch.length} opportunities...`);
    
    // Maximum parallel processing
    const promises = batch.map(async (opportunity) => {
      try {
        const response = await fetch('http://localhost:5000/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opportunity),
        });
        return response.ok ? 1 : 0;
      } catch {
        return 0;
      }
    });
    
    const results = await Promise.all(promises);
    const imported = results.reduce((sum, result) => sum + result, 0);
    totalImported += imported;
    
    console.log(`✅ MEGA BATCH ${batchesProcessed} COMPLETE: ${imported}/${batch.length} imported (TOTAL: ${totalImported})`);
    
    // Progress milestone updates
    if (totalImported % 1000 === 0) {
      console.log(`🔥 MILESTONE: ${totalImported} opportunities imported!`);
    }
    
    // Stop when we reach database limits or import enough
    if (totalImported >= 10000) {
      console.log('🎯 REACHED MASSIVE DATABASE SIZE - Mission accomplished!');
      break;
    }
  }
  
  console.log(`🎊 FINAL MASSIVE IMPORT COMPLETE!`);
  console.log(`📈 Total imported in this session: ${totalImported}`);
  console.log(`🚀 MASSIVE DATABASE ACHIEVED!`);
}

finalMassiveImport().catch(console.error);