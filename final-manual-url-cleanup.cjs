const { neon } = require('@neondatabase/serverless');

// Database connection
const sql = neon(process.env.DATABASE_URL);

// Final cleanup for all remaining manual extraction URLs
async function finalManualURLCleanup() {
  console.log('🔧 FINAL CLEANUP OF ALL REMAINING MANUAL EXTRACTION URLs...\n');
  
  try {
    // Get all manual extraction opportunities that still have problematic URLs
    const opportunities = await sql`
      SELECT id, title, url, organization 
      FROM opportunities 
      WHERE source = 'manual_extraction'
      ORDER BY title
    `;
    
    console.log(`📊 Found ${opportunities.length} manual extraction opportunities\n`);
    
    let fixedCount = 0;
    const problemURLs = [];
    
    for (const opp of opportunities) {
      let needsFix = false;
      let newUrl = opp.url;
      
      // Common URL issues to fix
      if (opp.url.includes('/programs/teen') || opp.url.includes('/education/teen')) {
        // These paths often don't exist, simplify to main education page
        newUrl = opp.url.split('/programs/teen')[0] + '/education';
        needsFix = true;
      } else if (opp.url.includes('/admissions/visit/') && opp.url.includes('-programs')) {
        // College admission visit pages often change, use main admission page
        newUrl = opp.url.split('/visit/')[0];
        needsFix = true;
      } else if (opp.url.includes('/academics/summer-programs')) {
        // Summer program pages often change, use main academics page
        newUrl = opp.url.split('/summer-programs')[0];
        needsFix = true;
      } else if (opp.url.includes('high-school-programs')) {
        // High school program specific pages often don't exist
        newUrl = opp.url.split('/high-school-programs')[0];
        needsFix = true;
      } else if (opp.url.includes('pre-college') && opp.url.includes('/programs/')) {
        // Pre-college program sub-pages often don't exist
        newUrl = opp.url.split('/programs/')[0];
        needsFix = true;
      }
      
      // Apply specific fixes for known broken patterns
      if (opp.title.includes('Youth') && opp.url.includes('.org/programs')) {
        newUrl = opp.url.replace('/programs', '');
        needsFix = true;
      }
      
      if (opp.title.includes('Summer') && opp.url.includes('summer-programs')) {
        newUrl = opp.url.replace('/summer-programs', '/summer');
        needsFix = true;
      }
      
      // Organization-specific fixes
      if (opp.title.includes('NYC') && opp.url.includes('.org/programs')) {
        newUrl = opp.url.replace('/programs', '');
        needsFix = true;
      }
      
      if (needsFix && newUrl !== opp.url) {
        console.log(`✅ Fixing: ${opp.title}`);
        console.log(`   Old URL: ${opp.url}`);
        console.log(`   New URL: ${newUrl}\n`);
        
        await sql`
          UPDATE opportunities 
          SET url = ${newUrl}
          WHERE id = ${opp.id}
        `;
        
        fixedCount++;
      } else {
        // Check if URL seems potentially problematic
        if (opp.url.includes('/teen-programs') || 
            opp.url.includes('/youth-programs') ||
            opp.url.includes('/high-school-programs') ||
            opp.url.includes('/summer-programs') ||
            opp.url.includes('/pre-college-programs')) {
          problemURLs.push({title: opp.title, url: opp.url});
        }
      }
    }
    
    console.log(`\n🎉 FINAL URL CLEANUP COMPLETE!`);
    console.log(`✅ Fixed URLs: ${fixedCount}`);
    console.log(`⚠️  Potentially problematic URLs: ${problemURLs.length}`);
    
    if (problemURLs.length > 0) {
      console.log(`\n⚠️  URLS THAT MAY STILL BE PROBLEMATIC:`);
      problemURLs.slice(0, 20).forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   URL: ${item.url}\n`);
      });
      
      if (problemURLs.length > 20) {
        console.log(`... and ${problemURLs.length - 20} more`);
      }
    }
    
    // Apply generic domain-level fixes for remaining opportunities
    console.log(`\n🔧 APPLYING GENERIC DOMAIN-LEVEL FIXES...`);
    
    let genericFixes = 0;
    
    // Fix specific organizations with known working domains
    const genericDomainFixes = [
      { pattern: 'apollo', domain: 'apollotheater.org' },
      { pattern: 'brooklyn', domain: 'brooklynmuseum.org' },
      { pattern: 'whitney', domain: 'whitney.org' },
      { pattern: 'harlem', domain: 'heaf.org' },
      { pattern: 'fresh air', domain: 'freshair.org' },
      { pattern: 'eyebeam', domain: 'eyebeam.org' },
      { pattern: 'cooper hewitt', domain: 'cooperhewitt.org' }
    ];
    
    for (const fix of genericDomainFixes) {
      const pattern = fix.pattern.toLowerCase();
      const result = await sql`
        UPDATE opportunities 
        SET url = ${'https://www.' + fix.domain}
        WHERE source = 'manual_extraction' 
        AND LOWER(title) LIKE ${'%' + pattern + '%'}
        AND (url LIKE '%/programs%' OR url LIKE '%/education%' OR url LIKE '%/teen%')
      `;
      if (result.count > 0) {
        console.log(`✅ Applied generic fix for ${pattern}: ${result.count} opportunities`);
        genericFixes += result.count;
      }
    }
    
    console.log(`\n📊 FINAL SUMMARY:`);
    console.log(`✅ Pattern-based fixes: ${fixedCount}`);
    console.log(`✅ Generic domain fixes: ${genericFixes}`);
    console.log(`✅ Total fixes applied: ${fixedCount + genericFixes}`);
    
    // Final count
    const totalManual = await sql`SELECT COUNT(*) as count FROM opportunities WHERE source = 'manual_extraction'`;
    console.log(`📊 Total manual extraction opportunities: ${totalManual[0].count}`);
    
  } catch (error) {
    console.error('❌ Error in final cleanup:', error);
  }
}

finalManualURLCleanup();