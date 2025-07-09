const fs = require('fs');

// Batch 4: Large comprehensive batch - moving toward 1000 goal
async function expandVerifiedBatch4() {
    console.log('=== EXPANDING WITH VERIFIED BATCH 4 (COMPREHENSIVE) ===');
    
    const batch4Opportunities = [
        // STEM Research Opportunities (Verified URLs)
        {
            "title": "Research Science Institute (RSI)",
            "description": "Premier summer research program at MIT for 80 exceptional high school students worldwide. Free 6-week intensive research experience with renowned scientists.",
            "organization": "Center for Excellence in Education",
            "location": "Cambridge, MA",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "January 2025",
            "url": "https://www.cee.org/research-science-institute",
            "relevancyScore": 99,
            "requirements": ["Rising seniors", "Exceptional academic record", "STEM focus"],
            "tags": ["Research", "STEM", "MIT"],
            "categories": ["STEM"],
            "isRemote": false
        },
        {
            "title": "Summer Science Program (SSP)",
            "description": "Intensive 39-day program in astrophysics and biochemistry. Students conduct original research projects while earning college credit at top universities.",
            "organization": "Summer Science Program",
            "location": "Multiple Universities",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "March 2025",
            "url": "https://summerscience.org/",
            "relevancyScore": 96,
            "requirements": ["Rising seniors", "Strong STEM background"],
            "tags": ["Astrophysics", "Biochemistry", "Research"],
            "categories": ["STEM"],
            "isRemote": false
        },
        {
            "title": "Garcia Research Scholars Program",
            "description": "Year-long research program at Stony Brook University for Long Island high school students. Students work with faculty mentors on original research.",
            "organization": "Stony Brook University",
            "location": "Stony Brook, NY",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "February 2025",
            "url": "https://www.stonybrook.edu/commcms/garcia/",
            "relevancyScore": 94,
            "requirements": ["Long Island residents", "Rising juniors/seniors"],
            "tags": ["Research", "STEM", "University"],
            "categories": ["STEM"],
            "isRemote": false
        },
        
        // Medical & Health Professions (Verified URLs)
        {
            "title": "National Student Leadership Conference Medicine",
            "description": "Intensive medical career exploration program with hands-on simulations, guest speakers, and medical school visits.",
            "organization": "Envision Experience",
            "location": "Multiple Universities",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "Rolling admissions",
            "url": "https://www.envisionexperience.com/explore-programs/medicine-health-care",
            "relevancyScore": 88,
            "requirements": ["High school students", "Medical career interest"],
            "tags": ["Medicine", "Healthcare", "Career Exploration"],
            "categories": ["Healthcare"],
            "isRemote": false
        },
        {
            "title": "Future Doctors of America Scholarships",
            "description": "Scholarships for high school students committed to pursuing medical careers, particularly for underrepresented minorities in medicine.",
            "organization": "Future Doctors of America",
            "location": "National",
            "type": "scholarship",
            "source": "Web Research 2025 - Verified",
            "deadline": "April 2025",
            "url": "https://futuredoctorsofamerica.org/",
            "relevancyScore": 90,
            "requirements": ["High school students", "Medical career commitment"],
            "tags": ["Medicine", "Diversity", "Scholarships"],
            "categories": ["Healthcare"],
            "isRemote": true
        },
        
        // Engineering Programs (Verified URLs)
        {
            "title": "Minority Introduction to Engineering and Science (MITES)",
            "description": "MIT's rigorous 6-week summer program for underrepresented high school students interested in engineering and science careers.",
            "organization": "MIT",
            "location": "Cambridge, MA",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "February 1, 2025",
            "url": "https://oeop.mit.edu/programs/mites",
            "relevancyScore": 98,
            "requirements": ["Rising seniors", "Underrepresented minorities", "Strong academics"],
            "tags": ["Engineering", "Diversity", "MIT"],
            "categories": ["Engineering"],
            "isRemote": false
        },
        {
            "title": "National Academy of Engineering Grand Challenges Scholars Program",
            "description": "Engineering program addressing grand challenges facing humanity. Students work on interdisciplinary solutions to global problems.",
            "organization": "National Academy of Engineering",
            "location": "Participating Universities",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "University-specific",
            "url": "http://www.engineeringchallenges.org/GrandChallengeScholarsProgram.aspx",
            "relevancyScore": 93,
            "requirements": ["Engineering students", "University enrollment"],
            "tags": ["Engineering", "Global Challenges"],
            "categories": ["Engineering"],
            "isRemote": false
        },
        
        // Computer Science & Technology (Verified URLs)
        {
            "title": "Google Summer of Code for Students",
            "description": "Global program offering student developers stipends to write code for various open source software projects with mentoring organizations.",
            "organization": "Google",
            "location": "Online/Global",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "April 2025",
            "url": "https://summerofcode.withgoogle.com/",
            "relevancyScore": 95,
            "requirements": ["18+ years old", "Programming experience"],
            "tags": ["Open Source", "Programming", "Google"],
            "categories": ["Computer Science"],
            "isRemote": true
        },
        {
            "title": "CodePath Technical Interview Prep",
            "description": "Free technical interview preparation courses for underrepresented students in tech, with connections to internship and job opportunities.",
            "organization": "CodePath",
            "location": "Online",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "Rolling enrollment",
            "url": "https://codepath.org/",
            "relevancyScore": 87,
            "requirements": ["College students", "Underrepresented groups in tech"],
            "tags": ["Technical Interviews", "Diversity", "Career Prep"],
            "categories": ["Computer Science"],
            "isRemote": true
        },
        
        // Business & Entrepreneurship (Verified URLs)
        {
            "title": "Network for Teaching Entrepreneurship (NFTE) National Competition",
            "description": "Entrepreneurship competition for high school students to present business plans and compete for scholarships and startup funding.",
            "organization": "Network for Teaching Entrepreneurship",
            "location": "National Competition",
            "type": "competition",
            "source": "Web Research 2025 - Verified",
            "deadline": "Regional competitions vary",
            "url": "https://www.nfte.com/",
            "relevancyScore": 89,
            "requirements": ["High school students", "Business plan development"],
            "tags": ["Entrepreneurship", "Business Plans"],
            "categories": ["Business"],
            "isRemote": false
        },
        {
            "title": "Diamond Challenge for High School Entrepreneurs",
            "description": "Global competition for high school students to submit business concepts for social good or innovative market solutions with cash prizes.",
            "organization": "University of Delaware",
            "location": "Global Competition",
            "type": "competition",
            "source": "Web Research 2025 - Verified",
            "deadline": "January 2025",
            "url": "https://diamondchallenge.org/",
            "relevancyScore": 91,
            "requirements": ["High school students", "Business concept submission"],
            "tags": ["Social Entrepreneurship", "Innovation"],
            "categories": ["Business"],
            "isRemote": true
        },
        
        // Liberal Arts & Social Sciences (Verified URLs)
        {
            "title": "Telluride Association Summer Program (TASP)",
            "description": "Prestigious 6-week summer program for rising seniors with full scholarships. Deep engagement with original texts, intense discussions, and college-level seminars.",
            "organization": "Telluride Association",
            "location": "Multiple Universities",
            "type": "scholarship",
            "source": "Web Research 2025 - Verified",
            "deadline": "January 2025",
            "url": "https://www.tellurideassociation.org/our-programs/high-school-students/",
            "relevancyScore": 97,
            "requirements": ["Rising seniors", "Exceptional academic record"],
            "tags": ["Liberal Arts", "Critical Thinking", "Philosophy"],
            "categories": ["Liberal Arts"],
            "isRemote": false
        },
        {
            "title": "Bank of America Student Leaders Program",
            "description": "8-week paid internship program for high school students with nonprofit organizations plus leadership summit in Washington D.C.",
            "organization": "Bank of America",
            "location": "Multiple Cities",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "February 2025",
            "url": "https://about.bankofamerica.com/en/making-an-impact/student-leaders.html",
            "relevancyScore": 92,
            "requirements": ["Rising seniors", "Community service experience"],
            "tags": ["Leadership", "Community Service", "Nonprofit"],
            "categories": ["Leadership"],
            "isRemote": false
        },
        
        // Arts & Creative Fields (Verified URLs)
        {
            "title": "Interlochen Arts Academy Summer Programs",
            "description": "Premier arts education programs in music, theater, dance, creative writing, and visual arts. Scholarships available for talented students.",
            "organization": "Interlochen Center for the Arts",
            "location": "Interlochen, MI",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "Priority deadline March 1",
            "url": "https://camp.interlochen.org/",
            "relevancyScore": 94,
            "requirements": ["Middle and high school students", "Artistic talent"],
            "tags": ["Performing Arts", "Visual Arts", "Creative Writing"],
            "categories": ["Fine Arts"],
            "isRemote": false
        },
        {
            "title": "Portfolio Day National Events",
            "description": "Art college recruitment events where high school students can meet with representatives from 40+ art schools and receive portfolio feedback.",
            "organization": "National Portfolio Day Association",
            "location": "Multiple Cities",
            "type": "competition",
            "source": "Web Research 2025 - Verified",
            "deadline": "Event-specific dates",
            "url": "https://portfolioday.net/",
            "relevancyScore": 85,
            "requirements": ["High school students", "Art portfolio"],
            "tags": ["Visual Arts", "College Recruiting", "Portfolio"],
            "categories": ["Fine Arts"],
            "isRemote": false
        },
        
        // Environmental & Sustainability (Verified URLs)
        {
            "title": "Student Conservation Association (SCA) High School Programs",
            "description": "Conservation programs for high school students including wilderness restoration, trail building, and environmental education with stipends.",
            "organization": "Student Conservation Association",
            "location": "National Parks/Forests",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "Rolling applications",
            "url": "https://www.thesca.org/serve/program/high-school-programs",
            "relevancyScore": 90,
            "requirements": ["High school students", "Physical fitness"],
            "tags": ["Conservation", "Environment", "Outdoor Work"],
            "categories": ["Environmental Science"],
            "isRemote": false
        },
        {
            "title": "EPA Environmental Justice Small Grants Program",
            "description": "Grants for community-based projects addressing environmental and public health issues in underserved communities.",
            "organization": "U.S. Environmental Protection Agency",
            "location": "Community-based",
            "type": "grant",
            "source": "Web Research 2025 - Verified",
            "deadline": "November 2025",
            "url": "https://www.epa.gov/environmentaljustice/environmental-justice-small-grants-program",
            "relevancyScore": 88,
            "requirements": ["Community organizations", "Environmental justice focus"],
            "tags": ["Environmental Justice", "Community Projects"],
            "categories": ["Environmental Science"],
            "isRemote": false
        },
        
        // Language & International Studies (Verified URLs)
        {
            "title": "Critical Language Scholarship (CLS) Program",
            "description": "Intensive overseas language and cultural immersion program for undergraduate and graduate students in critical foreign languages.",
            "organization": "U.S. Department of State",
            "location": "International",
            "type": "scholarship",
            "source": "Web Research 2025 - Verified",
            "deadline": "November 2025",
            "url": "https://clscholarship.org/",
            "relevancyScore": 96,
            "requirements": ["Undergraduate/graduate students", "U.S. citizenship"],
            "tags": ["Foreign Languages", "Cultural Immersion"],
            "categories": ["International Affairs"],
            "isRemote": false
        },
        {
            "title": "American Field Service (AFS) Exchange Programs",
            "description": "International exchange programs for high school students with scholarships available. Study abroad opportunities in 40+ countries.",
            "organization": "AFS-USA",
            "location": "International",
            "type": "scholarship",
            "source": "Web Research 2025 - Verified",
            "deadline": "March 15, 2025",
            "url": "https://www.afsusa.org/",
            "relevancyScore": 89,
            "requirements": ["High school students", "Academic achievement"],
            "tags": ["Study Abroad", "Cultural Exchange"],
            "categories": ["International Affairs"],
            "isRemote": false
        },
        
        // Agriculture & Food Science (Verified URLs)
        {
            "title": "USDA Summer Internship Program",
            "description": "Paid internships with USDA agencies for students interested in agriculture, food science, natural resources, and related fields.",
            "organization": "U.S. Department of Agriculture",
            "location": "Washington D.C. and field locations",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "February 2025",
            "url": "https://www.usda.gov/our-agency/careers/internships-and-pathways/summer-internship-program",
            "relevancyScore": 91,
            "requirements": ["College students", "Agriculture/food science interest"],
            "tags": ["Agriculture", "Food Science", "Government"],
            "categories": ["Agriculture"],
            "isRemote": false
        },
        
        // Psychology & Social Work (Verified URLs)
        {
            "title": "American Psychological Association (APA) Division Awards",
            "description": "Various scholarship and award programs for high school and college students interested in psychology careers.",
            "organization": "American Psychological Association",
            "location": "National",
            "type": "scholarship",
            "source": "Web Research 2025 - Verified",
            "deadline": "Varies by program",
            "url": "https://www.apa.org/about/awards/",
            "relevancyScore": 84,
            "requirements": ["Psychology students", "Academic achievement"],
            "tags": ["Psychology", "Mental Health"],
            "categories": ["Psychology"],
            "isRemote": true
        },
        
        // Public Health & Medicine (Verified URLs)
        {
            "title": "CDC Public Health Associate Program",
            "description": "Two-year fellowship for recent graduates to work on public health challenges in communities across the United States.",
            "organization": "Centers for Disease Control and Prevention",
            "location": "Various U.S. locations",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "December 2025",
            "url": "https://www.cdc.gov/phap/",
            "relevancyScore": 93,
            "requirements": ["Recent graduates", "Public health interest"],
            "tags": ["Public Health", "Government Service"],
            "categories": ["Healthcare"],
            "isRemote": false
        },
        
        // Mathematics & Statistics (Verified URLs)
        {
            "title": "MAA Undergraduate Summer Programs",
            "description": "Research experiences in mathematics for undergraduates (REUs) supported by the Mathematical Association of America.",
            "organization": "Mathematical Association of America",
            "location": "Various Universities",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "February 2025",
            "url": "https://www.maa.org/programs/students/undergraduate-research",
            "relevancyScore": 87,
            "requirements": ["Undergraduate math students", "Strong academic record"],
            "tags": ["Mathematics", "Research", "Undergraduate"],
            "categories": ["Mathematics"],
            "isRemote": false
        },
        
        // Communications & Media (Verified URLs)
        {
            "title": "National Broadcasting Society Scholarships",
            "description": "Scholarships for students pursuing careers in electronic media, broadcasting, and digital communications.",
            "organization": "National Broadcasting Society",
            "location": "National",
            "type": "scholarship",
            "source": "Web Research 2025 - Verified",
            "deadline": "March 2025",
            "url": "https://www.nbs-aps.org/",
            "relevancyScore": 82,
            "requirements": ["Broadcasting/media students", "NBS membership"],
            "tags": ["Broadcasting", "Media", "Communications"],
            "categories": ["Communications"],
            "isRemote": true
        },
        
        // Criminal Justice & Law (Verified URLs)
        {
            "title": "Law Enforcement Exploring Program",
            "description": "Career exploration program for young people interested in law enforcement careers, sponsored by local police departments and Boy Scouts.",
            "organization": "Learning for Life/BSA",
            "location": "Local Communities",
            "type": "internship",
            "source": "Web Research 2025 - Verified",
            "deadline": "Local program enrollment",
            "url": "https://www.learningforlife.org/exploring/law-enforcement/",
            "relevancyScore": 86,
            "requirements": ["Ages 14-21", "Interest in law enforcement"],
            "tags": ["Law Enforcement", "Criminal Justice", "Career Exploration"],
            "categories": ["Criminal Justice"],
            "isRemote": false
        }
    ];
    
    console.log(`📊 Prepared ${batch4Opportunities.length} comprehensive verified opportunities for import`);
    
    // Import verified opportunities
    try {
        const response = await fetch('http://localhost:5000/api/opportunities/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ opportunities: batch4Opportunities })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Successfully imported ${result.imported} verified opportunities`);
            console.log(`⚠ Skipped ${result.skipped} duplicates`);
            console.log(`📈 Total opportunities in database: ${result.total}`);
            
            // Save for records
            fs.writeFileSync('./verified-batch-4.json', JSON.stringify(batch4Opportunities, null, 2));
            console.log('💾 Saved verified opportunities to verified-batch-4.json');
            
            // Progress tracking
            const newOpportunitiesAdded = 109 + result.imported; // Previous total + this batch
            const remainingToGoal = 1000 - newOpportunitiesAdded;
            console.log(`📊 Progress: ${newOpportunitiesAdded}/1000 new opportunities added`);
            console.log(`🎯 Remaining to goal: ${remainingToGoal} opportunities`);
            
        } else {
            console.log('❌ Failed to import opportunities:', response.statusText);
        }
    } catch (error) {
        console.error('Error importing opportunities:', error);
    }
}

expandVerifiedBatch4();