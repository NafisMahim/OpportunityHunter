// AGGRESSIVE CLEANUP: Remove ALL garbage entries and keep only legitimate opportunities
async function aggressiveCleanup() {
  console.log('🧹 AGGRESSIVE CLEANUP: Removing ALL garbage entries...');
  
  // Get all current opportunities
  const response = await fetch('http://localhost:5000/api/opportunities');
  const opportunities = await response.json();
  
  console.log(`📊 Found ${opportunities.length} opportunities to analyze`);
  
  // Very strict filtering for legitimate opportunities only
  const legitimateOpportunities = opportunities.filter(opp => {
    const title = opp.title?.trim() || '';
    const description = opp.description?.trim() || '';
    
    // Must have proper title structure (not fragments)
    if (title.length < 15) return false;
    
    // Remove obvious fragments and garbage
    const badPatterns = [
      /^(and|or|the|in|for|over|under|with|by|from|to|of|at|on|as|is|are|was|were|will|have|has|had|would|could|should|may|might|can|must|shall|do|does|did|be|been|being|a|an)\s/i,
      /^(manhattan|brooklyn|queens|bronx|program|course|session|week|month|year|day|time|during|after|before)\s/i,
      /^(interns|students|participants|applicants|candidates|people|individuals|teens|youth|kids|children)\s/i,
      /^(dates|deadline|application|eligibility|requirements|cost|location|link|contact|information|details)\s/i,
      /housing/i,
      /insecurity/i,
      /barrier/i,
      /address/i,
      /further/i,
      /course/i,
      /session/i,
      /\d{4}/,  // Years
      /june|july|august|september|october|november|december|january|february|march|april|may/i,
      /http/i,
      /www\./i,
      /\.com/i,
      /\.org/i,
      /\.edu/i,
      /deadline/i,
      /application/i,
      /eligib/i,
      /000 in/i,
    ];
    
    if (badPatterns.some(pattern => pattern.test(title))) return false;
    
    // Must contain institutional indicators for legitimacy
    const institutionIndicators = [
      /university/i,
      /college/i,
      /institute/i,
      /academy/i,
      /school/i,
      /foundation/i,
      /center/i,
      /museum/i,
      /hospital/i,
      /program/i,
      /scholarship/i,
      /fellowship/i,
      /internship/i,
      /competition/i,
      /award/i,
      /grant/i,
      /camp/i,
      /workshop/i,
      /course/i,
      /training/i,
      /research/i,
      /laboratory/i,
      /clinic/i,
      /department/i,
      /organization/i,
      /society/i,
      /association/i,
      /corporation/i,
      /company/i,
      /business/i,
      /nonprofit/i,
      /government/i,
      /ministry/i,
      /office/i,
      /bureau/i,
      /agency/i
    ];
    
    const hasInstitution = institutionIndicators.some(indicator => 
      title.includes(indicator.source.slice(1, -2)) || description.includes(indicator.source.slice(1, -2))
    );
    
    // Must have legitimate program words
    const programWords = [
      'program', 'scholarship', 'fellowship', 'internship', 'competition', 
      'award', 'grant', 'camp', 'workshop', 'course', 'training', 'research',
      'study', 'opportunity', 'position', 'job', 'career', 'summer', 'winter',
      'spring', 'fall', 'academic', 'educational', 'professional', 'medical',
      'science', 'technology', 'engineering', 'mathematics', 'arts', 'business',
      'leadership', 'volunteer', 'service', 'community', 'project', 'initiative'
    ];
    
    const hasProgram = programWords.some(word => 
      title.toLowerCase().includes(word) || description.toLowerCase().includes(word)
    );
    
    // Final validation: must have proper noun structure
    const properNouns = [
      'Columbia', 'Harvard', 'Yale', 'Princeton', 'MIT', 'Stanford', 'Cornell',
      'NYU', 'CUNY', 'SUNY', 'NASA', 'Google', 'Microsoft', 'Apple', 'Amazon',
      'Facebook', 'Meta', 'IBM', 'Intel', 'Cisco', 'Oracle', 'Adobe', 'Tesla',
      'SpaceX', 'Boeing', 'Lockheed', 'Raytheon', 'Johnson', 'Pfizer', 'Merck',
      'Goldman', 'Morgan', 'Chase', 'Bank', 'Wells', 'Citigroup', 'American',
      'National', 'International', 'Global', 'World', 'United', 'Federal',
      'State', 'City', 'New York', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx'
    ];
    
    const hasProperNoun = properNouns.some(noun => 
      title.includes(noun) || description.includes(noun)
    );
    
    // Only keep if it meets multiple criteria
    return (hasInstitution || hasProgram || hasProperNoun) && 
           title.length >= 20 && 
           description.length >= 50;
  });
  
  console.log(`✅ LEGITIMATE OPPORTUNITIES: ${legitimateOpportunities.length} out of ${opportunities.length}`);
  console.log(`🗑️ TO DELETE: ${opportunities.length - legitimateOpportunities.length} garbage entries`);
  
  // Get IDs of opportunities to delete
  const legitimateIds = new Set(legitimateOpportunities.map(opp => opp.id));
  const toDelete = opportunities.filter(opp => !legitimateIds.has(opp.id)).map(opp => opp.id);
  
  console.log(`🗑️ Deleting ${toDelete.length} garbage opportunities...`);
  
  // Delete garbage entries
  let deleted = 0;
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
    deleted += batchDeleted;
    
    console.log(`🗑️ Batch ${Math.floor(i/batchSize) + 1}: ${batchDeleted} deleted (Total: ${deleted})`);
  }
  
  // Get final count
  const finalResponse = await fetch('http://localhost:5000/api/opportunities');
  const finalOpportunities = await finalResponse.json();
  
  console.log(`🎯 AGGRESSIVE CLEANUP COMPLETE!`);
  console.log(`🗑️ Deleted: ${deleted} garbage entries`);
  console.log(`✅ Remaining: ${finalOpportunities.length} legitimate opportunities`);
  
  // Show sample of remaining opportunities
  console.log(`📋 Sample legitimate opportunities:`);
  finalOpportunities.slice(0, 10).forEach((opp, i) => {
    console.log(`${i+1}. ${opp.title} (${opp.organization})`);
  });
}

aggressiveCleanup().catch(console.error);