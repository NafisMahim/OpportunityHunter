// COMPLETE IMPORT: Import remaining opportunities in manageable chunks
import fs from 'fs';

async function getCurrentOpportunityCount() {
  try {
    const response = await fetch('http://localhost:5000/api/opportunities');
    const opportunities = await response.json();
    return opportunities.length;
  } catch {
    return 0;
  }
}

async function completeImportChunked() {
  console.log('🔥 COMPLETING IMPORT OF ALL REMAINING OPPORTUNITIES...');
  
  const currentCount = await getCurrentOpportunityCount();
  console.log(`📊 Current database size: ${currentCount} opportunities`);
  
  const data = JSON.parse(fs.readFileSync('rebuild-comprehensive-opportunities.json', 'utf8'));
  console.log(`📊 Total extracted: ${data.length} opportunities`);
  console.log(`📊 Need to import: ${data.length - currentCount} more opportunities`);
  
  // Start from where we left off
  const startIndex = Math.max(0, currentCount - 636); // Account for original 636
  const remainingOpportunities = data.slice(startIndex).map((opp, index) => {
    let title = opp.title?.trim() || `Opportunity ${startIndex + index + 1}`;
    let description = opp.description?.trim() || `Comprehensive opportunity extracted from Stuyvesant Student Opportunity Bulletin.`;
    
    // Basic cleanup
    title = title.replace(/\s+/g, ' ').trim();
    if (title.length > 150) title = title.substring(0, 150).trim();
    
    description = description.replace(/\s+/g, ' ').trim();
    if (description.length > 400) description = description.substring(0, 400).trim();
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
  
  console.log(`✅ Processing ${remainingOpportunities.length} remaining opportunities`);
  
  // High-speed import with smaller batches for reliability
  const batchSize = 50;
  let totalImported = 0;
  let totalFailed = 0;
  
  for (let i = 0; i < remainingOpportunities.length; i += batchSize) {
    const batch = remainingOpportunities.slice(i, i + batchSize);
    const batchNum = Math.floor(i/batchSize) + 1;
    const totalBatches = Math.ceil(remainingOpportunities.length/batchSize);
    
    console.log(`🚀 CHUNK ${batchNum}/${totalBatches}: Processing ${batch.length} opportunities...`);
    
    // Sequential processing for stability
    for (const opportunity of batch) {
      try {
        const response = await fetch('http://localhost:5000/api/opportunities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opportunity),
        });
        
        if (response.ok) {
          totalImported++;
        } else {
          totalFailed++;
        }
      } catch {
        totalFailed++;
      }
      
      // Small delay to prevent server overload
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    console.log(`✅ CHUNK ${batchNum} COMPLETE: ${totalImported} total imported, ${totalFailed} total failed`);
    
    // Progress updates
    if (batchNum % 20 === 0) {
      const newTotal = currentCount + totalImported;
      console.log(`🔥 MASSIVE PROGRESS: ${newTotal} total opportunities in database!`);
    }
    
    // Break if we've imported enough
    if (totalImported > 5000) {
      console.log('🎯 SUBSTANTIAL IMPORT ACHIEVED - Taking break to prevent overload');
      break;
    }
  }
  
  const finalTotal = currentCount + totalImported;
  console.log(`🎊 CHUNK IMPORT COMPLETE!`);
  console.log(`📈 Newly imported: ${totalImported} opportunities`);
  console.log(`⚠️ Failed: ${totalFailed} opportunities`);
  console.log(`🚀 TOTAL DATABASE SIZE: ${finalTotal} opportunities!`);
  console.log(`🎯 PROGRESS: ${finalTotal} out of ${data.length} target opportunities`);
}

completeImportChunked().catch(console.error);