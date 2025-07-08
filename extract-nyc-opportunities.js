import fs from 'fs/promises';
import path from 'path';

// Simple opportunity extraction for one file to test
async function extractFromSingleFile() {
  const filePath = 'attached_assets/SOB 37S June 6, 2025_1751960330430.pdf';
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const opportunities = [];
    let currentOpportunity = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and headers
      if (!line || line.length < 10) continue;
      
      // Look for opportunity titles - patterns we see in the PDFs
      if (isOpportunityTitle(line)) {
        // Save previous opportunity if exists
        if (currentOpportunity && currentOpportunity.title) {
          opportunities.push(completeOpportunity(currentOpportunity));
        }
        
        // Start new opportunity
        currentOpportunity = {
          title: cleanTitle(line),
          organization: extractOrganization(line),
          type: determineType(line),
          source: 'Stuyvesant Student Opportunity Bulletin',
          location: 'New York City',
          relevancyScore: 85
        };
      } else if (currentOpportunity && isDescriptionLine(line)) {
        // Add to description
        const desc = currentOpportunity.description || '';
        currentOpportunity.description = desc ? `${desc} ${line}` : line;
      } else if (currentOpportunity && isDeadlineLine(line)) {
        currentOpportunity.deadline = extractDeadline(line);
      }
    }
    
    // Add the last opportunity
    if (currentOpportunity && currentOpportunity.title) {
      opportunities.push(completeOpportunity(currentOpportunity));
    }
    
    console.log(`Found ${opportunities.length} opportunities:`);
    opportunities.forEach((opp, index) => {
      console.log(`${index + 1}. ${opp.title} (${opp.type})`);
    });
    
    // Save to file for inspection
    await fs.writeFile('nyc-extracted-sample.json', JSON.stringify(opportunities, null, 2));
    console.log('Opportunities saved to nyc-extracted-sample.json');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

function isOpportunityTitle(line) {
  // Look for the specific patterns we see in the Stuyvesant bulletins
  return (
    line.startsWith('New: Event Approaching:') ||
    line.startsWith('Event Approaching:') ||
    line.startsWith('New:') ||
    line.startsWith('Updated:') ||
    line.includes('Program') && (line.includes('New:') || line.includes('Summer') || line.includes('STEM')) ||
    line.includes('Internship') ||
    line.includes('Fellowship') ||
    line.includes('Academy') ||
    line.includes('Institute') ||
    line.includes('Competition') ||
    line.includes('Contest') ||
    line.includes('Scholarship') ||
    line.includes('Grant') ||
    line.includes('Workshop') ||
    line.includes('Course') ||
    line.match(/^[A-Za-z\s&\(\)\-\.,':]+(?:Program|Institute|Internship|Fellowship|Competition|Contest|Fair|Workshop|Course|Academy|Center|Museum|Lab|Project|Initiative|Opportunity|Experience|Challenge|Award|Scholarship|Grant|Pass|Event)$/) ||
    // Match standalone program names
    (line.length > 15 && line.length < 100 && 
     !line.includes('Eligible:') && 
     !line.includes('Date:') && 
     !line.includes('Location:') && 
     !line.includes('Cost:') && 
     !line.includes('Link:') &&
     !line.includes('Application Deadline:') &&
     !line.startsWith('"') &&
     line.match(/^[A-Z]/))
  );
}

function isDescriptionLine(line) {
  return line.length > 20 && 
         !line.match(/^[A-Z]{2,}/) && 
         !line.includes('deadline') &&
         !line.includes('DEADLINE') &&
         !isOpportunityTitle(line);
}

function isDeadlineLine(line) {
  return line.toLowerCase().includes('deadline') || 
         line.toLowerCase().includes('due') ||
         line.match(/\d{1,2}\/\d{1,2}/) ||
         line.includes('January') || line.includes('February') || line.includes('March') ||
         line.includes('April') || line.includes('May') || line.includes('June');
}

function cleanTitle(title) {
  return title
    .replace(/^New:\s*/, '')
    .replace(/^Updated:\s*/, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^[•\-\*]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractOrganization(line) {
  // Look for organization names in the title
  const orgPatterns = [
    /at\s+([A-Z][A-Za-z\s&]+)/,
    /by\s+([A-Z][A-Za-z\s&]+)/,
    /([A-Z][A-Za-z\s&]+)\s+(?:Program|Institute|Center|Museum|Academy|Foundation)/,
    /(NYC|New York|Columbia|NYU|CUNY|Hunter|Brooklyn|Queens|Manhattan|Bronx)/
  ];
  
  for (const pattern of orgPatterns) {
    const match = line.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return 'New York Organization';
}

function determineType(title) {
  const lower = title.toLowerCase();
  
  if (lower.includes('internship') || lower.includes('intern')) return 'internship';
  if (lower.includes('job') || lower.includes('employment') || lower.includes('paid')) return 'job';
  if (lower.includes('scholarship') || lower.includes('award') && lower.includes('$')) return 'scholarship';
  if (lower.includes('grant') || lower.includes('funding')) return 'grant';
  if (lower.includes('competition') || lower.includes('contest') || lower.includes('challenge')) return 'competition';
  
  // Default based on common NYC program types
  if (lower.includes('summer') || lower.includes('program') || lower.includes('academy')) return 'internship';
  
  return 'internship';
}

function extractDeadline(line) {
  const deadlineMatch = line.match(/(?:deadline|due).*?(\w+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?)/i);
  if (deadlineMatch) {
    return deadlineMatch[1];
  }
  
  const dateMatch = line.match(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/);
  if (dateMatch) {
    return dateMatch[0];
  }
  
  return 'Check bulletin for details';
}

function completeOpportunity(partial) {
  return {
    title: partial.title || 'NYC Opportunity',
    description: partial.description || `${partial.title} - A valuable opportunity for high school students in New York City to gain experience, develop skills, and explore career paths.`,
    organization: partial.organization || 'NYC Organization',
    type: partial.type || 'internship',
    source: partial.source || 'Stuyvesant Student Opportunity Bulletin',
    url: '#',
    deadline: partial.deadline || 'Varies',
    requirements: ['High school students', 'NYC area preferred', 'Application required'],
    tags: generateTags(partial.title || '', partial.type || 'internship'),
    relevancyScore: partial.relevancyScore || 85,
    amount: null,
    location: partial.location || 'New York City',
    salary: null
  };
}

function generateTags(title, type) {
  const tags = [type];
  const lower = title.toLowerCase();
  
  if (lower.includes('stem') || lower.includes('science') || lower.includes('engineering')) tags.push('STEM');
  if (lower.includes('art') || lower.includes('museum') || lower.includes('theater')) tags.push('Arts');
  if (lower.includes('leadership') || lower.includes('government')) tags.push('Leadership');
  if (lower.includes('summer')) tags.push('Summer');
  if (lower.includes('virtual') || lower.includes('online')) tags.push('Virtual');
  if (lower.includes('nyc') || lower.includes('new york')) tags.push('NYC');
  
  return tags;
}

extractFromSingleFile();