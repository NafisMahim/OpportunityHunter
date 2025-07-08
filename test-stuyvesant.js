import { dataImporter } from './server/data-importer.js';
import * as fs from 'fs/promises';

// Test a single file parsing
async function testStuyvesantParsing() {
  try {
    const content = await fs.readFile('./attached_assets/SOB-27L-March-21_-2025-_2__1751990902670.csv', 'utf-8');
    console.log('🧪 TESTING: Single SOB file parsing');
    console.log(`File size: ${content.length} characters`);
    
    // Create a test importer instance  
    const importer = new (await import('./server/data-importer.js')).DataImporter();
    const opportunities = importer.parseStuyvesantContent(content, 'SOB-27L-March-21_-2025-_2__1751990902670.csv');
    
    console.log(`\n🎯 EXTRACTED ${opportunities.length} opportunities from test file`);
    
    // Show first few opportunities
    opportunities.slice(0, 3).forEach((opp, i) => {
      console.log(`\n📋 OPPORTUNITY ${i + 1}:`);
      console.log(`Title: ${opp.title}`);
      console.log(`Description: ${opp.description.substring(0, 200)}...`);
      console.log(`URL: ${opp.url}`);
      console.log(`Source: ${opp.source}`);
    });
    
    return opportunities.length;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return 0;
  }
}

testStuyvesant();