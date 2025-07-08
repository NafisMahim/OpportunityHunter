import fs from 'fs';
import path from 'path';

async function extractScholarships() {
  console.log('🚀 MASSIVE SCHOLARSHIP EXTRACTION: Parsing HTML and text files...');
  
  try {
    const scholarships = new Set();
    
    // File paths
    const files = [
      'attached_assets/Available Scholarships for High School Students - Google Drive_1751958894115.html',
      'attached_assets/Pasted--DOCTYPE-html-saved-from-url-0092-https-docs-google-com-spreadsheets-d-1QHFusWlsG0ltQ7wY9S-1751959030516_1751959030521.txt'
    ];
    
    for (const filePath of files) {
      console.log(`\n📄 Processing: ${filePath}`);
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(`File size: ${content.length} characters`);
      
      // Extract scholarship names using better patterns
      const patterns = [
        // Look for proper scholarship names (capitalized words with scholarship-related terms)
        /([A-Z][A-Za-z\s&\(\)\-\.,']+(?:Scholarship|Foundation|Award|Grant|Program|Fellowship))/gi,
        // Look for scholar/scholars variations
        /([A-Z][A-Za-z\s&\(\)\-\.,']+Scholar(?:ship|s)?)/gi,
        // Look for foundation names
        /([A-Z][A-Za-z\s&\(\)\-\.,']+Foundation)/gi,
        // Look for award names
        /([A-Z][A-Za-z\s&\(\)\-\.,']+Award)/gi,
        // Look for grants
        /([A-Z][A-Za-z\s&\(\)\-\.,']+Grant)/gi,
        // Look for programs
        /([A-Z][A-Za-z\s&\(\)\-\.,']+Program)/gi
      ];
      
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const cleaned = match.trim()
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/\s+/g, ' ');
            
            // Filter out invalid entries
            if (cleaned.length > 8 && 
                cleaned.length < 100 && 
                !cleaned.includes('http') && 
                !cleaned.includes('www') && 
                !cleaned.includes('application') &&
                !cleaned.includes('deadline') &&
                !cleaned.includes('eligibility') &&
                !cleaned.includes('requirements') &&
                !cleaned.toLowerCase().includes('essay') &&
                !cleaned.toLowerCase().includes('submit') &&
                !cleaned.toLowerCase().includes('must be') &&
                !cleaned.toLowerCase().includes('should be') &&
                !cleaned.toLowerCase().includes('you deserve') &&
                !cleaned.toLowerCase().includes('high school') &&
                !cleaned.toLowerCase().includes('college') &&
                !cleaned.toLowerCase().includes('university') &&
                !cleaned.toLowerCase().includes('students') &&
                !cleaned.toLowerCase().includes('recipient') &&
                !cleaned.toLowerCase().includes('winner') &&
                !cleaned.toLowerCase().includes('candidate') &&
                !cleaned.toLowerCase().includes('applicant') &&
                !cleaned.toLowerCase().includes('gpa') &&
                !cleaned.toLowerCase().includes('transcript') &&
                !cleaned.toLowerCase().includes('grade') &&
                !cleaned.toLowerCase().includes('year') &&
                !cleaned.toLowerCase().includes('senior') &&
                !cleaned.toLowerCase().includes('junior') &&
                !cleaned.toLowerCase().includes('freshman') &&
                !cleaned.toLowerCase().includes('sophomore') &&
                !cleaned.toLowerCase().includes('resident') &&
                !cleaned.toLowerCase().includes('citizen') &&
                !cleaned.toLowerCase().includes('eligible') &&
                !cleaned.toLowerCase().includes('qualify') &&
                !cleaned.toLowerCase().includes('apply') &&
                !cleaned.toLowerCase().includes('$') &&
                !cleaned.toLowerCase().includes('award') &&
                !cleaned.toLowerCase().includes('money') &&
                !cleaned.toLowerCase().includes('funding') &&
                !cleaned.toLowerCase().includes('financial') &&
                !cleaned.toLowerCase().includes('need') &&
                !cleaned.toLowerCase().includes('income') &&
                !cleaned.toLowerCase().includes('family') &&
                !cleaned.toLowerCase().includes('parent') &&
                !cleaned.toLowerCase().includes('guardian') &&
                !cleaned.toLowerCase().includes('demographic') &&
                !cleaned.toLowerCase().includes('minority') &&
                !cleaned.toLowerCase().includes('underrepresented') &&
                !cleaned.toLowerCase().includes('diverse') &&
                !cleaned.toLowerCase().includes('diversity') &&
                !cleaned.toLowerCase().includes('background') &&
                !cleaned.toLowerCase().includes('experience') &&
                !cleaned.toLowerCase().includes('community') &&
                !cleaned.toLowerCase().includes('leadership') &&
                !cleaned.toLowerCase().includes('volunteer') &&
                !cleaned.toLowerCase().includes('service') &&
                !cleaned.toLowerCase().includes('extracurricular') &&
                !cleaned.toLowerCase().includes('activity') &&
                !cleaned.toLowerCase().includes('participate') &&
                !cleaned.toLowerCase().includes('involvement') &&
                !cleaned.toLowerCase().includes('demonstrate') &&
                !cleaned.toLowerCase().includes('show') &&
                !cleaned.toLowerCase().includes('prove') &&
                !cleaned.toLowerCase().includes('evidence') &&
                !cleaned.match(/^\d/) &&
                !cleaned.match(/^[a-z]/) &&
                cleaned.match(/^[A-Z]/) &&
                cleaned.split(' ').length >= 2 &&
                cleaned.split(' ').length <= 8) {
              scholarships.add(cleaned);
            }
          });
        }
      }
      
      // Also look for table data with scholarship information
      const tablePattern = /<td[^>]*>([^<]*(?:scholarship|foundation|award|grant|program|fellowship)[^<]*)<\/td>/gi;
      let tableMatch;
      while ((tableMatch = tablePattern.exec(content)) !== null) {
        const text = tableMatch[1].trim()
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ');
        
        if (text.length > 8 && text.length < 100 && text.match(/^[A-Z]/)) {
          scholarships.add(text);
        }
      }
    }
    
    // Clean up and create final list
    const scholarshipList = Array.from(scholarships)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .sort();
    
    console.log(`\n🎯 FOUND ${scholarshipList.length} UNIQUE SCHOLARSHIPS:`);
    
    // Display first 50 scholarships
    const displayList = scholarshipList.slice(0, 50);
    displayList.forEach((scholarship, index) => {
      console.log(`${index + 1}. ${scholarship}`);
    });
    
    if (scholarshipList.length > 50) {
      console.log(`... and ${scholarshipList.length - 50} more scholarships`);
    }
    
    // Save to file
    const outputPath = 'extracted-scholarships.json';
    fs.writeFileSync(outputPath, JSON.stringify(scholarshipList, null, 2));
    console.log(`\n💾 Saved ${scholarshipList.length} scholarships to ${outputPath}`);
    
    return scholarshipList;
    
  } catch (error) {
    console.error('❌ Error during extraction:', error);
    return [];
  }
}

// Run the extraction
extractScholarships();