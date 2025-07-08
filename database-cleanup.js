// DATABASE CLEANUP: Analyze and fix/remove invalid opportunities
import fs from 'fs';

async function analyzeAndCleanDatabase() {
  console.log('🧹 DATABASE CLEANUP: Analyzing all opportunities...');
  
  // Get all current opportunities
  const response = await fetch('http://localhost:5000/api/opportunities');
  const opportunities = await response.json();
  
  console.log(`📊 Found ${opportunities.length} opportunities to analyze`);
  
  const issues = {
    invalidTitles: [],
    invalidDescriptions: [],
    emptyLinks: [],
    fragmentEntries: [],
    duplicates: [],
    toDelete: []
  };
  
  // Analyze each opportunity for quality issues
  opportunities.forEach((opp, index) => {
    const title = opp.title?.trim() || '';
    const description = opp.description?.trim() || '';
    
    // Check for invalid titles
    if (title.length < 10 || 
        title.startsWith('And ') || 
        title.startsWith('For ') ||
        title.startsWith('In ') ||
        title.startsWith('The ') ||
        title.includes('deadline') ||
        title.includes('application') ||
        title.match(/^[A-Z]{2,}\s*$/) ||
        title.includes('http') ||
        title.match(/^\d+/) ||
        title.includes('000 in') ||
        title.includes('Link https') ||
        title === 'Academic Program' ||
        title === 'Week program' ||
        title === 'Month program' ||
        title === 'Day program' ||
        title === 'Scholarship' ||
        title === 'COMMUNITY SERVICE' ||
        title === 'CUNY College') {
      issues.invalidTitles.push({id: opp.id, title, description});
      issues.toDelete.push(opp.id);
    }
    
    // Check for invalid descriptions
    else if (description.length < 20 ||
             description.includes('High-quality opportunity for students. Details available upon application.') ||
             description.includes('http') ||
             description.match(/^[A-Z\s]+$/) ||
             description.includes('deadline are') ||
             description.includes('section below')) {
      issues.invalidDescriptions.push({id: opp.id, title, description});
      issues.toDelete.push(opp.id);
    }
    
    // Check for fragment entries
    else if (title.length < 20 && 
             !title.match(/(university|college|program|scholarship|internship|fellowship|institute|academy|camp|workshop|competition)/i)) {
      issues.fragmentEntries.push({id: opp.id, title, description});
      issues.toDelete.push(opp.id);
    }
  });
  
  // Remove duplicates from toDelete array
  issues.toDelete = [...new Set(issues.toDelete)];
  
  console.log(`🔍 ANALYSIS COMPLETE:`);
  console.log(`❌ Invalid titles: ${issues.invalidTitles.length}`);
  console.log(`❌ Invalid descriptions: ${issues.invalidDescriptions.length}`);
  console.log(`❌ Fragment entries: ${issues.fragmentEntries.length}`);
  console.log(`🗑️ Total to delete: ${issues.toDelete.length}`);
  console.log(`✅ Will keep: ${opportunities.length - issues.toDelete.length} quality opportunities`);
  
  // Save analysis results
  fs.writeFileSync('cleanup-analysis.json', JSON.stringify(issues, null, 2));
  console.log('💾 Analysis saved to cleanup-analysis.json');
  
  return issues;
}

async function deleteInvalidOpportunities() {
  console.log('🗑️ DELETING INVALID OPPORTUNITIES...');
  
  const analysis = JSON.parse(fs.readFileSync('cleanup-analysis.json', 'utf8'));
  const toDelete = analysis.toDelete;
  
  console.log(`🗑️ Deleting ${toDelete.length} invalid opportunities...`);
  
  let deleted = 0;
  let failed = 0;
  
  // Delete in batches
  const batchSize = 50;
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);
    
    const deletePromises = batch.map(async (id) => {
      try {
        const response = await fetch(`http://localhost:5000/api/opportunities/${id}`, {
          method: 'DELETE'
        });
        return response.ok ? 'success' : 'failed';
      } catch {
        return 'failed';
      }
    });
    
    const results = await Promise.all(deletePromises);
    const batchDeleted = results.filter(r => r === 'success').length;
    const batchFailed = results.filter(r => r === 'failed').length;
    
    deleted += batchDeleted;
    failed += batchFailed;
    
    console.log(`🗑️ Batch ${Math.floor(i/batchSize) + 1}: ${batchDeleted} deleted, ${batchFailed} failed`);
  }
  
  console.log(`🗑️ DELETION COMPLETE: ${deleted} deleted, ${failed} failed`);
  
  // Get final count
  const finalResponse = await fetch('http://localhost:5000/api/opportunities');
  const finalOpportunities = await finalResponse.json();
  console.log(`✅ CLEANED DATABASE: ${finalOpportunities.length} quality opportunities remaining`);
}

// Run analysis first
analyzeAndCleanDatabase()
  .then(() => {
    console.log('📋 Analysis complete. Run deletion next...');
    return deleteInvalidOpportunities();
  })
  .catch(console.error);