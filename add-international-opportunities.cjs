const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { opportunities } = require('./shared/schema.ts');

// International & Volunteer Abroad Opportunities
const internationalOpportunities = [
  {
    title: "IVHQ High School Volunteer Abroad Programs",
    description: "Teen-specific volunteer programs in 17+ destinations including Bali, Costa Rica, Croatia, Guatemala, Peru, Portugal, Romania, Sri Lanka, Tanzania, Vietnam, Zanzibar. Starting from $20 per day including accommodation and meals.",
    company: "International Volunteer HQ",
    location: "17+ international destinations",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.volunteerhq.org/high-school-volunteer-abroad/",
    deadline: "Year-round applications",
    requirements: "Ages 15-18, pre-departure support",
    cost: "Starting $20 per day",
    isRemote: false
  },
  {
    title: "Projects Abroad High School Specials",
    description: "Teen volunteer programs in Galapagos, Nepal, Tanzania, Peru with escorted flights from Houston & New York. Gold standard for safety with structured group programs during summer and winter breaks.",
    company: "Projects Abroad",
    location: "Galapagos, Nepal, Tanzania, Peru",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.projects-abroad.org/trip-format/high-school-specials/",
    deadline: "Summer (June-August), Winter (December-January)",
    requirements: "Ages 15-18, structured group supervision",
    cost: "Starting around $2,100 for 2 weeks",
    isRemote: false
  },
  {
    title: "Volunteering Solutions International Programs",
    description: "25+ destinations across Asia, Africa, Europe, South America, Australia. 24/7 in-country support, host families, wide range of projects for students 17+.",
    company: "Volunteering Solutions",
    location: "25+ global destinations",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.volunteeringsolutions.com/high-school-volunteer-abroad-programs",
    deadline: "Year-round applications",
    requirements: "17+ years old",
    cost: "Starting from $1,050 for 2 weeks",
    isRemote: false
  },
  {
    title: "Global Volunteers Service-Learning Programs",
    description: "Service-learning focus in Cuba, Greece, Peru, Poland, Ecuador, St. Lucia, Appalachia, Blackfeet Reservation. Academic credit options with 130+ partner institutions since 1984.",
    company: "Global Volunteers",
    location: "Multiple international and domestic locations",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://globalvolunteers.org/high-school-volunteer-abroad-programs/",
    deadline: "Year-round availability",
    requirements: "High school students, safety-first approach",
    cost: "Varies by program",
    isRemote: false
  },
  {
    title: "Thailand Marine Conservation Program",
    description: "Sea turtle conservation and marine protection program in Thailand. Hands-on conservation work with marine ecosystems and wildlife protection.",
    company: "Various Program Providers",
    location: "Thailand",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.gooverseas.com/high-school-abroad/volunteer-abroad",
    deadline: "Year-round programs",
    requirements: "Ages 15-18, interest in marine conservation",
    cost: "Varies by provider",
    isRemote: false
  },
  {
    title: "Costa Rica Wildlife Conservation & Teaching",
    description: "Combined wildlife conservation and English teaching program in Costa Rica. Experience rainforest protection and educational outreach in local communities.",
    company: "Multiple Providers",
    location: "Costa Rica",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.goabroad.com/articles/highschool-study-abroad/teenage-volunteer-summer-programs-abroad",
    deadline: "Summer and year-round options",
    requirements: "High school students, no TEFL required",
    cost: "Varies by program length",
    isRemote: false
  },
  {
    title: "Nepal Community Development Program",
    description: "Community development projects in Nepal including construction, education support, and healthcare assistance. Cultural immersion with host family stays.",
    company: "Various Providers",
    location: "Nepal",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.volunteerworld.com/en/volunteer-abroad/high-school-volunteering",
    deadline: "Year-round applications",
    requirements: "Ages 15-18, cultural adaptability",
    cost: "Starting around $1,500 for 2 weeks",
    isRemote: false
  },
  {
    title: "Tanzania Healthcare & Education Program",
    description: "Healthcare assistance and education support in Tanzania. Work in clinics, schools, and community centers while experiencing East African culture.",
    company: "Multiple Program Providers",
    location: "Tanzania",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.volunteerforever.com/article_post/teen-high-school-volunteer-abroad-programs-under-18-mission-tr/",
    deadline: "Summer and gap year options",
    requirements: "Ages 15-18, health requirements",
    cost: "Program fees vary",
    isRemote: false
  },
  {
    title: "Peru Cultural Immersion & Community Service",
    description: "Cultural exchange and community development in Peru. Language learning, host family stays, and meaningful community projects in the Andes.",
    company: "Various Organizations",
    location: "Peru",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://blog.fundmytravel.com/2025/01/28/cheap-volunteer-abroad-programs-for-high-school-students/",
    deadline: "Year-round programs",
    requirements: "High school students, basic Spanish helpful",
    cost: "Budget-friendly options available",
    isRemote: false
  },
  {
    title: "European Youth Portal Volunteer Opportunities",
    description: "Official EU platform connecting young people with volunteer opportunities across Europe. Cultural exchange, environmental projects, and community service.",
    company: "European Union",
    location: "European Union countries",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://youth.europa.eu/go-abroad/volunteering/opportunities_en",
    deadline: "Ongoing opportunities",
    requirements: "EU eligibility or exchange programs",
    cost: "Often funded or low-cost",
    isRemote: false
  },
  {
    title: "Vietnam Teaching & Community Development",
    description: "English teaching and community development projects in Vietnam. Experience Southeast Asian culture while making educational impact.",
    company: "IVHQ and Partners",
    location: "Vietnam",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.volunteerhq.org/blog/teen-volunteer-abroad-programs/",
    deadline: "Year-round availability",
    requirements: "Ages 15-18, no teaching experience required",
    cost: "$20+ per day",
    isRemote: false
  },
  {
    title: "Bali Cultural Immersion Program",
    description: "Cultural immersion and community service in Bali, Indonesia. Temple restoration, English teaching, and traditional arts learning.",
    company: "Multiple Providers",
    location: "Bali, Indonesia",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.volunteerhq.org/high-school-volunteer-abroad/",
    deadline: "Year-round programs",
    requirements: "Ages 15-18, cultural sensitivity",
    cost: "Starting $20 per day",
    isRemote: false
  },
  {
    title: "Ghana Community Development & Education",
    description: "Community development and education support in Ghana. Teaching assistance, healthcare support, and women's empowerment programs.",
    company: "Various Organizations",
    location: "Ghana",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.gooverseas.com/blog/summer-volunteer-programs",
    deadline: "Summer and year-round options",
    requirements: "Ages 15-18, health vaccinations required",
    cost: "Varies by program duration",
    isRemote: false
  },
  {
    title: "Croatia Conservation & Community Work",
    description: "Environmental conservation and community projects in Croatia. Coastal cleanup, wildlife protection, and sustainable tourism development.",
    company: "Various Providers",
    location: "Croatia",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.volunteerhq.org/high-school-volunteer-abroad/",
    deadline: "Summer peak season",
    requirements: "Ages 15-18, EU travel documents",
    cost: "Mid-range pricing",
    isRemote: false
  },
  {
    title: "Loop Abroad Veterinary Programs",
    description: "Veterinary-focused international programs combining animal care with cultural immersion. Hands-on veterinary experience abroad.",
    company: "Loop Abroad",
    location: "Multiple international destinations",
    type: "internship",
    category: "International Programs",
    applicationUrl: "https://www.loopabroad.com/",
    deadline: "Summer programs",
    requirements: "Interest in veterinary medicine",
    cost: "$3,950 for 2 weeks",
    isRemote: false
  }
];

async function addInternationalOpportunities() {
  try {
    const sql = postgres(process.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log('Adding international and volunteer abroad opportunities...');
    
    for (const opportunity of internationalOpportunities) {
      try {
        await db.insert(opportunities).values(opportunity).onConflictDoNothing();
        console.log(`✓ Added: ${opportunity.title}`);
      } catch (error) {
        console.log(`⚠ Skipped duplicate: ${opportunity.title}`);
      }
    }

    console.log(`\n✅ Successfully processed ${internationalOpportunities.length} international opportunities`);
    await sql.end();
  } catch (error) {
    console.error('Error adding international opportunities:', error);
  }
}

addInternationalOpportunities();