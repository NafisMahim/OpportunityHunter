const fs = require('fs');

// Remove broken opportunities from database and create verified list
async function removeBrokenOpportunities() {
    console.log('=== REMOVING BROKEN OPPORTUNITIES ===');
    
    // List of broken URLs identified during verification
    const brokenURLs = [
        'https://nationalzoo.si.edu/conservation/wyse',
        'https://www.fordham.edu/academics/programs/project-true/',
        'https://www.westmorelandsanctuary.org/',
        'https://www.maeoe.org/green-schools',
        'https://usgbc-ca.org/programs/green-schools/',
        'https://www.ncaa.org/sports/2021/2/10/recruiting-calendars-faq.aspx',
        'https://www.ncsasports.org/recruiting/how-to-get-recruited/scholarship-facts',
        'https://www.playnaia.org/',
        'https://www.njcaa.org/',
        'https://bold.org/scholarships/by-type/athletic/',
        'https://www.ncsasports.org/ncaa-eligibility-center/recruiting-rules/recruiting-calendar',
        'https://www.maxpreps.com/',
        'https://www.teamusa.org/',
        'https://www.mlb.com/youth-academies',
        'https://www.imgacademy.com/',
        'https://www.womenssportsfoundation.org/',
        'https://www.oberlin.edu/conservatory/cooper-international-competition',
        'https://www.spotlightarts.org/',
        'https://www.marineband.marines.mil/',
        'http://glennmiller.org/',
        'https://www.sphinxmusic.org/',
        'https://www.zingerviolin.com/',
        'https://www.nfmc-music.org/',
        'https://www.ascapfoundation.org/',
        'https://www.childrenscolorado.org/',
        'https://www.hopkinsmedicine.org/som/pathway/sip',
        'https://www.chla.org/',
        'https://www.rchsd.org/',
        'https://med.stanford.edu/smysp.html',
        'https://graduate.ucsf.edu/',
        'https://healthy.kaiserpermanente.org/',
        'https://www.cedars-sinai.org/',
        'https://hms.harvard.edu/',
        'https://www.pennmedicine.org/',
        'https://www.massgeneral.org/',
        'https://college.mayo.edu/academics/health-sciences-education/career-immersion-program-minnesota/',
        'https://college.mayo.edu/academics/diversity-and-inclusion/programs/mayo-clinic-cares/',
        'https://www.mayoclinic.org/about-mayo-clinic/volunteers/minnesota/how-to-apply/high-school-volunteers',
        'https://www.uclahealth.org/',
        'https://www.wakehealth.edu/',
        'https://misaprogram.com/',
        'https://www.campcardiac.com/',
        'https://www.nhlbi.nih.gov/',
        'https://www.volunteerhq.org/high-school-volunteer-abroad/',
        'https://www.projects-abroad.org/trip-format/high-school-specials/',
        'https://www.volunteeringsolutions.com/high-school-volunteer-abroad-programs',
        'https://globalvolunteers.org/high-school-volunteer-abroad-programs/',
        'https://www.gooverseas.com/high-school-abroad/volunteer-abroad',
        'https://www.goabroad.com/articles/highschool-study-abroad/teenage-volunteer-summer-programs-abroad',
        'https://www.volunteerworld.com/en/volunteer-abroad/high-school-volunteering',
        'https://www.volunteerforever.com/article_post/teen-high-school-volunteer-abroad-programs-under-18-mission-tr/',
        'https://blog.fundmytravel.com/2025/01/28/cheap-volunteer-abroad-programs-for-high-school-students/',
        'https://youth.europa.eu/go-abroad/volunteering/opportunities_en',
        'https://www.volunteerhq.org/blog/teen-volunteer-abroad-programs/',
        'https://www.gooverseas.com/blog/summer-volunteer-programs',
        'https://www.loopabroad.com/'
    ];
    
    // Create verified opportunities list with working URLs only
    const workingOpportunities = [
        {
            "title": "Environmental Studies Summer Youth Institute (ESSYI)",
            "description": "2-week college-level program offering interdisciplinary approach to environmental problem-solving. Rising juniors/seniors can earn 1 credit (4 semester hours).",
            "organization": "Hobart and William Smith Colleges",
            "location": "Geneva, NY",
            "type": "internship",
            "source": "Web Research 2025",
            "deadline": "Rolling basis",
            "url": "http://essyi.hws.edu/",
            "relevancyScore": 95,
            "requirements": ["Rising juniors/seniors, 50-student limit"],
            "tags": ["Environmental Science"],
            "categories": ["Environmental Science"],
            "isRemote": false
        },
        {
            "title": "Brown Environmental Leadership Lab (BELL)",
            "description": "Environmental studies + social responsibility + leadership program with locations in Providence RI, Key Largo FL, Mammoth Lakes CA, and Anchorage AK. Focus on location-specific environmental challenges.",
            "organization": "Brown University",
            "location": "Multiple locations",
            "type": "internship",
            "source": "Web Research 2025",
            "deadline": "Spring 2025",
            "url": "https://www.brown.edu/academics/pre-college/bell/",
            "relevancyScore": 95,
            "requirements": ["High school students"],
            "tags": ["Environmental Science"],
            "categories": ["Environmental Science"],
            "isRemote": false
        },
        {
            "title": "Stanford Young Investigators - Sustainability",
            "description": "Research lab experience with graduate student mentors at Stanford Doerr School of Sustainability. Includes weekly talks, lab tours, and field trips.",
            "organization": "Stanford University",
            "location": "Bay Area, CA",
            "type": "internship",
            "source": "Web Research 2025",
            "deadline": "March 15, 2025",
            "url": "https://sustainability.stanford.edu/admissions-education/k-12-outreach/young-investigators",
            "relevancyScore": 95,
            "requirements": ["Within 25 miles of Stanford campus"],
            "tags": ["Environmental Science"],
            "categories": ["Environmental Science"],
            "isRemote": false
        },
        {
            "title": "NSLC Environmental Science & Sustainability",
            "description": "Eco-conscious leadership development through experiential simulations, guest speakers, and field trips. Projects include advocacy campaigns, green home design, and renewable energy building.",
            "organization": "National Student Leadership Conference",
            "location": "Multiple campuses",
            "type": "internship",
            "source": "Web Research 2025",
            "deadline": "May 1, 2025",
            "url": "https://www.nslcleaders.org/youth-leadership-programs/environmental-science-sustainability/",
            "relevancyScore": 95,
            "requirements": ["High school students"],
            "tags": ["Environmental Science"],
            "categories": ["Environmental Science"],
            "isRemote": false
        },
        {
            "title": "Washington University Environmental Studies Institute",
            "description": "2-week program for rising juniors/seniors focusing on environmental problem-solving and sustainability principles through hands-on projects and interactive lectures.",
            "organization": "Washington University in St. Louis",
            "location": "St. Louis, MO",
            "type": "internship",
            "source": "Web Research 2025",
            "deadline": "Spring 2025",
            "url": "https://precollege.wustl.edu/environmental-studies-institute-summary",
            "relevancyScore": 95,
            "requirements": ["Rising juniors/seniors"],
            "tags": ["Environmental Science"],
            "categories": ["Environmental Science"],
            "isRemote": false
        },
        {
            "title": "Sewanee Environmental Institute (SEI)",
            "description": "Environmental program utilizing 13,000-acre forest and working farm. Rising sophomores, juniors, and seniors can access funded internships and scholarships.",
            "organization": "University of the South",
            "location": "Sewanee, TN",
            "type": "internship",
            "source": "Web Research 2025",
            "deadline": "May 1, 2025",
            "url": "https://new.sewanee.edu/academics/summer-in-sewanee/high-school-students/pre-college-field-studies-experience/",
            "relevancyScore": 95,
            "requirements": ["Rising sophomores, juniors, seniors"],
            "tags": ["Environmental Science"],
            "categories": ["Environmental Science"],
            "isRemote": false
        },
        {
            "title": "Ladder Environmental Startup Internships",
            "description": "Remote, flexible scheduling internships with environmental startups focusing on carbon footprint reduction and resource restoration. Work with high-growth companies and present to leadership.",
            "organization": "Ladder Internships",
            "location": "Remote",
            "type": "internship",
            "source": "Web Research 2025",
            "deadline": "Year-round applications",
            "url": "https://ladderinternships.com/",
            "relevancyScore": 95,
            "requirements": ["High school students worldwide"],
            "tags": ["Environmental Science"],
            "categories": ["Environmental Science"],
            "isRemote": true
        },
        {
            "title": "YoungArts Program - Music Performance",
            "description": "National competition for high school students/seniors aged 15-18 (grades 10-12). Talent-based selection across various arts including music performance. Must be U.S. citizen or permanent resident.",
            "organization": "National YoungArts Foundation",
            "location": "Miami, FL / National",
            "type": "scholarship",
            "source": "Web Research 2025",
            "deadline": "October 2025",
            "url": "https://www.youngarts.org/",
            "relevancyScore": 95,
            "requirements": ["Ages 15-18, grades 10-12, U.S. citizen or permanent resident"],
            "tags": ["Music"],
            "categories": ["Music"],
            "isRemote": false
        },
        {
            "title": "Davidson Fellowship - Music",
            "description": "Awards of $50,000, $25,000, and $10,000 for students under 18 who demonstrate noteworthy achievements through significant piece of work in music composition or performance.",
            "organization": "Davidson Institute",
            "location": "National",
            "type": "scholarship",
            "source": "Web Research 2025",
            "deadline": "Fall 2025 application opens",
            "url": "https://www.davidsongifted.org/fellowships/",
            "relevancyScore": 95,
            "requirements": ["Under 18 years old, significant musical achievement"],
            "tags": ["Music"],
            "categories": ["Music"],
            "isRemote": true
        },
        {
            "title": "Curtis Institute Full-Ride Scholarships",
            "description": "Curtis provides full-ride tuition scholarships for ALL students, even without demonstrated financial need. Those with financial need may receive additional living expense scholarships. 4% acceptance rate.",
            "organization": "Curtis Institute of Music",
            "location": "Philadelphia, PA",
            "type": "scholarship",
            "source": "Web Research 2025",
            "deadline": "December 2025",
            "url": "https://www.curtis.edu/",
            "relevancyScore": 95,
            "requirements": ["Exceptional musical talent, highly selective (4% acceptance)"],
            "tags": ["Music"],
            "categories": ["Music"],
            "isRemote": false
        },
        {
            "title": "Juilliard School Merit Scholarships",
            "description": "Most institutional scholarships require both merit and demonstrated financial need. 7-11% acceptance rate. May require CSS Profile for financial aid consideration.",
            "organization": "The Juilliard School",
            "location": "New York, NY",
            "type": "scholarship",
            "source": "Web Research 2025",
            "deadline": "December 1, 2025",
            "url": "https://www.juilliard.edu/",
            "relevancyScore": 95,
            "requirements": ["Exceptional musical ability, financial need consideration"],
            "tags": ["Music"],
            "categories": ["Music"],
            "isRemote": false
        },
        {
            "title": "Berklee Presidential Scholarship",
            "description": "Covers tuition, on-campus housing, and required laptop. Must show highest musical merit and financial need. Berklee awards over $115 million annually in scholarships.",
            "organization": "Berklee College of Music",
            "location": "Boston, MA",
            "type": "scholarship",
            "source": "Web Research 2025",
            "deadline": "Automatic consideration with application",
            "url": "https://www.berklee.edu/scholarships",
            "relevancyScore": 95,
            "requirements": ["Highest musical merit and financial need"],
            "tags": ["Music"],
            "categories": ["Music"],
            "isRemote": false
        },
        {
            "title": "San Francisco Conservatory Merit Scholarships",
            "description": "99% of students receive merit-based scholarships determined by audition, departmental needs, academic transcripts, and recommendation letters. Highly generous aid program.",
            "organization": "San Francisco Conservatory of Music",
            "location": "San Francisco, CA",
            "type": "scholarship",
            "source": "Web Research 2025",
            "deadline": "Audition-based deadlines",
            "url": "https://sfcm.edu/",
            "relevancyScore": 95,
            "requirements": ["Strong audition performance, academic achievement"],
            "tags": ["Music"],
            "categories": ["Music"],
            "isRemote": false
        },
        {
            "title": "New England Conservatory Scholarships",
            "description": "43% acceptance rate conservatory offering various merit and need-based scholarships. Strong reputation in classical and contemporary music education.",
            "organization": "New England Conservatory",
            "location": "Boston, MA",
            "type": "scholarship",
            "source": "Web Research 2025",
            "deadline": "December 1, 2025",
            "url": "https://necmusic.edu/",
            "relevancyScore": 95,
            "requirements": ["Strong musical ability and academic performance"],
            "tags": ["Music"],
            "categories": ["Music"],
            "isRemote": false
        }
    ];
    
    // Send removal request to API to clean up broken URLs
    console.log('📧 Sending request to remove broken opportunities...');
    const removeResponse = await fetch('http://localhost:5000/api/opportunities/remove-broken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ brokenURLs })
    });
    
    if (removeResponse.ok) {
        const removeResult = await removeResponse.json();
        console.log(`✅ Removed ${removeResult.removed} broken opportunities`);
    }
    
    // Save verified opportunities
    fs.writeFileSync('./verified-working-opportunities.json', JSON.stringify(workingOpportunities, null, 2));
    console.log(`✅ Saved ${workingOpportunities.length} verified working opportunities`);
    
    // Import the verified opportunities
    console.log('📥 Importing verified opportunities...');
    const importResponse = await fetch('http://localhost:5000/api/opportunities/import', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ opportunities: workingOpportunities })
    });
    
    if (importResponse.ok) {
        const importResult = await importResponse.json();
        console.log(`✅ Successfully imported ${importResult.imported} verified opportunities`);
        console.log(`📈 Total opportunities in database: ${importResult.total}`);
    }
}

removeBrokenOpportunities().catch(console.error);