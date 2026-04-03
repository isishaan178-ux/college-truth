import mongoose from 'mongoose'
import College from './models/College'
import Post from './models/Post'

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set')
}

interface CollegeSeed {
  name: string
  slug: string
  city: string
  state: string
  type: 'private' | 'government' | 'deemed' | 'autonomous'
  established: number
  description: string
}

interface PostSeed {
  collegeSlug: string
  category: string
  sentiment: string
  source: string
  content: string
  title: string
  author: string
}

const colleges: CollegeSeed[] = [
  {
    name: 'IIT Bombay',
    slug: 'iit-bombay',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'government',
    established: 1958,
    description: 'Indian Institute of Technology Bombay is a public technical university in Powai, Mumbai.',
  },
  {
    name: 'IIT Delhi',
    slug: 'iit-delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'government',
    established: 1961,
    description: 'Indian Institute of Technology Delhi is a public technical university located in Hauz Khas, New Delhi.',
  },
  {
    name: 'IIT Madras',
    slug: 'iit-madras',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'government',
    established: 1959,
    description: 'Indian Institute of Technology Madras is a public technical university in Chennai.',
  },
  {
    name: 'IIT Kanpur',
    slug: 'iit-kanpur',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    type: 'government',
    established: 1959,
    description: 'Indian Institute of Technology Kanpur is a public technical university in Kanpur, Uttar Pradesh.',
  },
  {
    name: 'IIT Kharagpur',
    slug: 'iit-kharagpur',
    city: 'Kharagpur',
    state: 'West Bengal',
    type: 'government',
    established: 1951,
    description: 'The first IIT established in India, located in Kharagpur, West Bengal.',
  },
  {
    name: 'BITS Pilani',
    slug: 'bits-pilani',
    city: 'Pilani',
    state: 'Rajasthan',
    type: 'deemed',
    established: 1964,
    description: 'Birla Institute of Technology and Science, Pilani is a private deemed university.',
  },
  {
    name: 'VIT Vellore',
    slug: 'vit-vellore',
    city: 'Vellore',
    state: 'Tamil Nadu',
    type: 'deemed',
    established: 1984,
    description: 'Vellore Institute of Technology is a private deemed university in Vellore.',
  },
  {
    name: 'SRM Institute of Science and Technology',
    slug: 'srm-chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'deemed',
    established: 1985,
    description: 'SRM Institute of Science and Technology (formerly SRM University) is located in Kattankulathur near Chennai.',
  },
  {
    name: 'Manipal Institute of Technology',
    slug: 'manipal',
    city: 'Manipal',
    state: 'Karnataka',
    type: 'deemed',
    established: 1957,
    description: 'Manipal Institute of Technology is a constituent college of Manipal Academy of Higher Education.',
  },
  {
    name: 'NIT Trichy',
    slug: 'nit-trichy',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    type: 'government',
    established: 1964,
    description: 'National Institute of Technology Tiruchirappalli, one of the top NITs in India.',
  },
  {
    name: 'NIT Warangal',
    slug: 'nit-warangal',
    city: 'Warangal',
    state: 'Telangana',
    type: 'government',
    established: 1959,
    description: 'National Institute of Technology Warangal is one of the first NITs of India.',
  },
  {
    name: 'Delhi Technological University',
    slug: 'dtu-delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'government',
    established: 1941,
    description: 'Delhi Technological University (formerly DCE) is a state university in Shahbad Daulatpur, Delhi.',
  },
  {
    name: 'Netaji Subhas University of Technology',
    slug: 'nsut-delhi',
    city: 'New Delhi',
    state: 'Delhi',
    type: 'government',
    established: 1983,
    description: 'NSUT (formerly NSIT) is a state university in Dwarka, New Delhi.',
  },
  {
    name: 'Christ University',
    slug: 'christ-university',
    city: 'Bangalore',
    state: 'Karnataka',
    type: 'deemed',
    established: 1969,
    description: 'Christ University is a deemed university in Bangalore known for strict discipline and good academics.',
  },
  {
    name: 'Amity University Noida',
    slug: 'amity-noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    type: 'private',
    established: 2005,
    description: 'Amity University Noida is a private university in Noida, part of the Amity Education Group.',
  },
  {
    name: 'Lovely Professional University',
    slug: 'lpu-punjab',
    city: 'Phagwara',
    state: 'Punjab',
    type: 'private',
    established: 2005,
    description: 'Lovely Professional University is a private university in Phagwara, Punjab. Largest single-campus university in India.',
  },
  {
    name: 'Chandigarh University',
    slug: 'chandigarh-university',
    city: 'Mohali',
    state: 'Punjab',
    type: 'private',
    established: 2012,
    description: 'Chandigarh University is a private university in Gharuan, Mohali, Punjab.',
  },
  {
    name: 'Symbiosis International University',
    slug: 'symbiosis-pune',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'deemed',
    established: 2002,
    description: 'Symbiosis International University is a deemed university in Pune known for management and law programs.',
  },
  {
    name: 'KIIT University',
    slug: 'kiit-bhubaneswar',
    city: 'Bhubaneswar',
    state: 'Odisha',
    type: 'deemed',
    established: 2004,
    description: 'Kalinga Institute of Industrial Technology is a deemed university in Bhubaneswar.',
  },
  {
    name: 'Thapar Institute of Engineering and Technology',
    slug: 'thapar-patiala',
    city: 'Patiala',
    state: 'Punjab',
    type: 'deemed',
    established: 1956,
    description: 'Thapar Institute of Engineering and Technology is a deemed university in Patiala, Punjab.',
  },
]

const posts: PostSeed[] = [
  // IIT Bombay
  { collegeSlug: 'iit-bombay', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'Placement season was incredible this year. Microsoft, Google, Goldman Sachs all came. Median package for CS was around 28 LPA. Even non-CS branches like Mechanical got decent offers from consulting firms. The placement cell is very well organized.', title: 'IIT Bombay Placements 2025', author: 'Anonymous IITB Student' },
  { collegeSlug: 'iit-bombay', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Hostel rooms are tiny, especially in H1-H10. The old hostels have cockroach problems and the mess food is below average. You literally get the same dal-rice combo 5 days a week. New hostels (H15, H16) are slightly better but still not great for the fees we pay.', title: 'Hostel reality at IITB', author: 'Anonymous' },
  { collegeSlug: 'iit-bombay', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'The campus life at IITB is unmatched. Mood Indigo is Asia\'s largest college cultural fest. TechFest is equally massive. There are 100+ clubs and you can pursue literally anything from robotics to theatre to quizzing. Powai lake campus is beautiful.', title: 'Campus life review', author: 'IITB 2023 Grad' },
  { collegeSlug: 'iit-bombay', category: 'MENTAL_HEALTH', sentiment: 'NEGATIVE', source: 'reddit', content: 'The academic pressure is insane. Relative grading means you are always competing with the smartest people in the country. Many students face depression and anxiety. The counselling center exists but is understaffed. Had friends who seriously struggled.', title: 'Mental health concerns', author: 'Anonymous' },
  { collegeSlug: 'iit-bombay', category: 'PROFESSORS', sentiment: 'POSITIVE', source: 'quora', content: 'Most CS and EE professors are world-class researchers. Prof. Ganesh Ramakrishnan, Prof. Suyash Awate - absolute legends. They push you hard but you learn a LOT. Some profs in other departments can be hit or miss though.', title: 'Faculty quality', author: 'CSE Alum' },
  { collegeSlug: 'iit-bombay', category: 'INFRASTRUCTURE', sentiment: 'POSITIVE', source: 'shiksha', content: 'Labs are well-equipped, library is massive with 24/7 access during exams. The new academic complex and computer center are excellent. Swimming pool, gymkhana grounds, basketball courts - sports infra is also solid.', title: 'Infrastructure review', author: 'Anonymous' },

  // IIT Delhi
  { collegeSlug: 'iit-delhi', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'IIT Delhi placements are consistently top-tier. This year the highest domestic package was 1.8 Cr from a quant firm. Average for CS was 32 LPA. Startups like Zepto, Cred also hire aggressively. Day 1 companies include all FAANG.', title: 'IITD Placement Stats', author: 'Anonymous' },
  { collegeSlug: 'iit-delhi', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'quora', content: 'Mess food is terrible. I got food poisoning twice in first semester. Jwalamukhi hostel mess is the worst. The non-veg options are barely edible. Most people end up ordering from outside which burns a hole in your pocket.', title: 'Hostel mess nightmare', author: 'IITD Student' },
  { collegeSlug: 'iit-delhi', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'reddit', content: 'Being in the heart of Delhi is a huge advantage. Hauz Khas Village is right next door. Rendezvous fest is amazing. The startup culture here is insane - so many students found companies during their time here. Board game nights, coding contests, hackathons every week.', title: 'Delhi campus vibes', author: 'Anonymous' },
  { collegeSlug: 'iit-delhi', category: 'RESTRICTIONS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Compared to other colleges, IIT Delhi is fairly liberal. No strict curfew timings, you can come and go as you please. But getting a guest pass for visitors can be a pain. The security at gates has gotten stricter post-COVID.', title: 'Rules and restrictions', author: 'Batch of 2024' },
  { collegeSlug: 'iit-delhi', category: 'PROFESSORS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Some professors in the Mechanical and Civil department are outdated in their teaching methods. Still reading from 30-year-old slides. The CS department is great but overloaded - getting a project guide is competitive.', title: 'Mixed faculty experience', author: 'Anonymous' },
  { collegeSlug: 'iit-delhi', category: 'INFRASTRUCTURE', sentiment: 'POSITIVE', source: 'shiksha', content: 'The new Bharti building and Dogra Hall renovation are excellent. LHC and SIT building have great lecture halls. The campus is compact but well-maintained. Central library is a great place to study. New sports complex is world-class.', title: 'Infra at IITD', author: 'Anonymous' },

  // IIT Madras
  { collegeSlug: 'iit-madras', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'IIT Madras consistently ranks #1 in NIRF. Placements reflect this - CS median was around 30 LPA. Even Data Science and AI roles are very strong here. The research park also creates internship and placement opportunities that other IITs dont have.', title: 'IITM Placements review', author: 'Anonymous' },
  { collegeSlug: 'iit-madras', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'The campus is literally inside a forest with deer roaming around. Saarang and Shaastra are legendary fests. The insti culture here is unique - strong department loyalty, amazing inter-hostel competitions. OAT nights under the stars are unforgettable.', title: 'Life inside IIT Madras campus', author: 'IITM Alum' },
  { collegeSlug: 'iit-madras', category: 'HOSTEL_MESS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Mess food is average South Indian fare. If you are from North India, you will struggle initially. Sambar rice gets repetitive. But the dosas at Gurunath and the midnight maggi at Chetta\'s shop make up for it. Hostel rooms are decent sized.', title: 'Food and hostel life', author: 'North Indian at IITM' },
  { collegeSlug: 'iit-madras', category: 'SPORTS', sentiment: 'POSITIVE', source: 'reddit', content: 'Sports culture at IITM is very strong. The inter-IIT sports meet preparations are taken seriously. Swimming pool, hockey ground, cricket ground, tennis courts - everything is available. Many students play sports daily after classes.', title: 'Sports at IITM', author: 'Anonymous' },
  { collegeSlug: 'iit-madras', category: 'MENTAL_HEALTH', sentiment: 'NEGATIVE', source: 'reddit', content: 'The isolation of the campus can get to you. Being inside a forest with no city life nearby means depression hits different here. The wellness center has improved but peer support is still lacking. Academic pressure combined with loneliness is a real issue.', title: 'Mental health at IITM', author: 'Anonymous' },
  { collegeSlug: 'iit-madras', category: 'RESTRICTIONS', sentiment: 'NEGATIVE', source: 'reddit', content: 'The campus is gated and far from the city. Getting in and out requires effort - auto rides are expensive. Female hostel has stricter timings compared to male hostels which many students find unfair. Admin can be bureaucratic.', title: 'Campus restrictions', author: 'Anonymous' },

  // IIT Kanpur
  { collegeSlug: 'iit-kanpur', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'quora', content: 'IIT Kanpur CS placements are at par with Bombay and Delhi. Quant companies love IITK students. Jane Street, Tower Research, Graviton all recruit. Non-CS branches also do well with consulting and core companies. PPOs from summer internships are common.', title: 'IITK Placements', author: 'IITK Grad 2024' },
  { collegeSlug: 'iit-kanpur', category: 'CAMPUS_LIFE', sentiment: 'NEGATIVE', source: 'reddit', content: 'Kanpur city has nothing to offer. The campus is like an island in the middle of nowhere. Antaragni fest is fun but daily life can be monotonous. You end up spending most of your time in your room or the academic area. Winters are brutal.', title: 'Boring campus life', author: 'Anonymous' },
  { collegeSlug: 'iit-kanpur', category: 'PROFESSORS', sentiment: 'POSITIVE', source: 'quora', content: 'The CS and Aerospace departments at IITK are phenomenal. Research output is amazing. Professors are approachable and genuinely care about teaching. The peer learning culture here is what makes IITK special.', title: 'IITK Professors', author: 'Anonymous' },
  { collegeSlug: 'iit-kanpur', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Mess food at Hall 1-5 is genuinely bad. The paneer dishes are more like rubber. Breakfast is just bread and butter most days. Hall 9 and newer halls have slightly better food. Night canteen MT section saves lives during exam time though.', title: 'Mess food struggles', author: 'Hall 3 Resident' },
  { collegeSlug: 'iit-kanpur', category: 'INFRASTRUCTURE', sentiment: 'NEUTRAL', source: 'shiksha', content: 'Airstrip on campus is cool but the older buildings need renovation. Library is excellent though. New computer center is good. Some departments still have outdated lab equipment. The campus roads are pothole-free which is nice compared to Kanpur city.', title: 'IITK Infrastructure', author: 'Anonymous' },

  // IIT Kharagpur
  { collegeSlug: 'iit-kharagpur', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'Biggest advantage of KGP is the sheer number of companies that visit. Being the largest IIT, we get 300+ companies. CDC is well organized. CS and EE placements are excellent. Even lesser-known branches get decent offers.', title: 'KGP Placement Season', author: 'Anonymous' },
  { collegeSlug: 'iit-kharagpur', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'KGP campus is HUGE - 2100 acres. Spring Fest is one of the best college fests in India. The hall culture and freshers\' welcome traditions are memorable. Technology Literary Society events are regular. Illumination during Diwali is a spectacle.', title: 'Life at KGP', author: 'KGPian' },
  { collegeSlug: 'iit-kharagpur', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'The halls are old and show their age. Patel Hall and Azad Hall have heritage value but living conditions are not great. Mess food is below average - the chicken curry is infamous for being terrible. New halls like LLR are much better.', title: 'Hostel reality at KGP', author: 'Anonymous' },
  { collegeSlug: 'iit-kharagpur', category: 'RESTRICTIONS', sentiment: 'NEGATIVE', source: 'reddit', content: 'KGP is in the middle of nowhere - Kharagpur town has almost nothing. You are stuck on campus 24/7. This can feel suffocating after a while. The nearest decent city is Kolkata which is 2+ hours away. Dating scene is basically non-existent.', title: 'Location problems at KGP', author: 'Anonymous' },
  { collegeSlug: 'iit-kharagpur', category: 'SPORTS', sentiment: 'POSITIVE', source: 'reddit', content: 'Sports infra at KGP is the best among all IITs. Olympic-size swimming pool, massive cricket ground, athletics track, multiple football fields. Inter-hall sports competitions are taken very seriously. Many national-level athletes come from KGP.', title: 'Sports at KGP', author: 'Anonymous' },

  // BITS Pilani
  { collegeSlug: 'bits-pilani', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'BITS placements have improved massively. CS median was around 22 LPA this year. Google, Microsoft, Amazon, DE Shaw all came. The PS (Practice School) system gives you real industry experience which helps a lot during interviews.', title: 'BITS Placement review', author: 'BITSian' },
  { collegeSlug: 'bits-pilani', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'BITS has the best campus culture among all Indian colleges. No attendance, no parents, pure freedom. OASIS is the best cultural fest - artists like AP Dhillon have performed. Clubs are student-run and incredibly active. The startup culture rivals IITs.', title: 'Freedom at BITS', author: 'BITS Alum' },
  { collegeSlug: 'bits-pilani', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Pilani campus is in the desert. Literally. The mess food is mediocre at best. Sky (canteen) food is overpriced. Hostel rooms are okay but the desert heat in summers is unbearable. Coolers barely work. You sweat through exams.', title: 'Desert hostel life', author: 'Anonymous' },
  { collegeSlug: 'bits-pilani', category: 'PROFESSORS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Faculty is a mixed bag at BITS. Some profs are excellent researchers but terrible teachers. The no-attendance policy means many students skip classes anyway. Self-study and peer learning is the real education here.', title: 'BITS Faculty review', author: 'Anonymous' },
  { collegeSlug: 'bits-pilani', category: 'RESTRICTIONS', sentiment: 'POSITIVE', source: 'quora', content: 'BITS is probably the most liberal college in India. No attendance requirement, no curfew, no dress code. You manage your own life. This freedom is both a blessing and a curse - some people thrive, others fall apart.', title: 'Freedom culture at BITS', author: 'BITSian 2023' },
  { collegeSlug: 'bits-pilani', category: 'INFRASTRUCTURE', sentiment: 'NEUTRAL', source: 'shiksha', content: 'The campus is well-maintained but showing its age in some areas. New academic block is great. Library is decent. Labs could use upgrades in some departments. The NAB auditorium is excellent for events. Wifi coverage has improved significantly.', title: 'BITS Infra', author: 'Anonymous' },

  // VIT Vellore
  { collegeSlug: 'vit-vellore', category: 'PLACEMENTS', sentiment: 'NEUTRAL', source: 'reddit', content: 'VIT placements are decent but inflated in marketing. Yes, Microsoft and Google come but seats are very few. Average for CS is around 8-10 LPA realistically. Mass recruiters like TCS, Infosys, Wipro take the bulk. If you are in top 10% you do well.', title: 'Real VIT placement truth', author: 'VIT 2024 Grad' },
  { collegeSlug: 'vit-vellore', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'VIT mess food is genuinely terrible. The sambar tastes like water. Non-veg days are a gamble - you might get food poisoning. Most students survive on Dominos and food delivery apps. Hostel rooms are cramped - 3 people in a tiny room.', title: 'VIT Mess horror stories', author: 'Anonymous' },
  { collegeSlug: 'vit-vellore', category: 'RESTRICTIONS', sentiment: 'NEGATIVE', source: 'quora', content: 'VIT is basically a school pretending to be a college. Strict attendance (75% mandatory), dress code for labs, girls hostel curfew at 6:30 PM, no going out on weekdays. They track your ID card swipes. It feels like prison sometimes.', title: 'VIT restrictions are insane', author: 'Frustrated VITian' },
  { collegeSlug: 'vit-vellore', category: 'PROFESSORS', sentiment: 'NEUTRAL', source: 'shiksha', content: 'Faculty quality varies a lot at VIT. SCOPE (CS) department has some good professors but also many who just read from PPTs. The FFCS system lets you choose your preferred faculty which is a big plus. Research output is improving.', title: 'VIT Faculty review', author: 'Anonymous' },
  { collegeSlug: 'vit-vellore', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'reddit', content: 'Riviera fest is actually pretty good. Lots of clubs and chapters - IEEE, ACM, coding clubs are active. The campus is huge and well-maintained. Anna Auditorium is impressive. If you get into good peer groups, the experience is enjoyable.', title: 'VIT Campus Life', author: 'Anonymous' },
  { collegeSlug: 'vit-vellore', category: 'INFRASTRUCTURE', sentiment: 'POSITIVE', source: 'shiksha', content: 'VIT infrastructure is genuinely top-notch. AC classrooms, well-equipped labs, huge library, good sports facilities. The campus looks like a corporate park. Technology Tower and SMV are impressive buildings. They invest heavily in infra.', title: 'VIT Infrastructure', author: 'Anonymous' },

  // SRM Chennai
  { collegeSlug: 'srm-chennai', category: 'PLACEMENTS', sentiment: 'NEUTRAL', source: 'reddit', content: 'SRM placements are average. Mass recruiters dominate. If you are in CS or ECE, you can get 6-8 LPA packages. The placement cell tries hard but the sheer number of students means competition is brutal. Top students crack 15-20 LPA at best.', title: 'SRM Placement reality', author: 'SRM Alum' },
  { collegeSlug: 'srm-chennai', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'quora', content: 'SRM mess food is awful. Cold rice, watery dal, and some unidentifiable curry is the daily menu. The hostels near the main campus are overcrowded. Water supply issues during summer. Most seniors move to PG outside campus.', title: 'SRM Hostel experience', author: 'Anonymous' },
  { collegeSlug: 'srm-chennai', category: 'PROFESSORS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Many professors at SRM are freshly hired PhD students with no teaching experience. They read from the textbook verbatim. A few senior professors in CS and Mechanical are good but you need luck to get them. Internal marks are sometimes used as power play.', title: 'SRM Faculty issues', author: 'Anonymous' },
  { collegeSlug: 'srm-chennai', category: 'CAMPUS_LIFE', sentiment: 'NEUTRAL', source: 'reddit', content: 'Milan and Aaruush fests are decent. Lots of clubs exist on paper but not all are active. The campus in Kattankulathur is far from Chennai city. Auto drivers charge insane rates. Making good friends is what makes SRM bearable.', title: 'SRM Campus Life', author: 'Anonymous' },
  { collegeSlug: 'srm-chennai', category: 'INFRASTRUCTURE', sentiment: 'POSITIVE', source: 'shiksha', content: 'SRM has invested heavily in infrastructure. The Tech Park, University Building, and new blocks are modern. Labs are well-equipped for most departments. Library is huge. The campus looks impressive which is why it attracts students.', title: 'SRM Infrastructure', author: 'Anonymous' },
  { collegeSlug: 'srm-chennai', category: 'RESTRICTIONS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Attendance is strictly monitored. Below 75% and you cannot sit for exams. Girls hostel timings are ridiculous - 6 PM curfew. Boys hostel is slightly more relaxed but still monitored. They confiscate bikes if you park wrong.', title: 'SRM Rules', author: 'Anonymous' },

  // Manipal
  { collegeSlug: 'manipal', category: 'PLACEMENTS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Manipal placements for CS are decent - average around 10-12 LPA. Companies like VMware, Cisco, Oracle visit regularly. But for non-CS branches, placements drop significantly. The Career Guidance Center has improved over the years but still needs work.', title: 'MIT Manipal Placements', author: 'Manipal Student' },
  { collegeSlug: 'manipal', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'Manipal is called a mini world for a reason. The campus town vibe is unmatched. TechTatva and Revels are amazing fests. The beach is 20 minutes away. Food joints like Dollops, Snack Shack, and ChickPet are legendary. Social life here is 10/10.', title: 'Manipal campus life is the best', author: 'MIT Alum' },
  { collegeSlug: 'manipal', category: 'HOSTEL_MESS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Hostel mess food is mediocre but the town restaurants save you. Manipal has incredible food options outside campus. Hostel rooms in Block 14-17 are good, older blocks are cramped. AC is extra charge which feels unfair given the humid climate.', title: 'Hostel and food at Manipal', author: 'Anonymous' },
  { collegeSlug: 'manipal', category: 'PROFESSORS', sentiment: 'NEUTRAL', source: 'shiksha', content: 'Faculty is average overall. Some excellent professors in CSE and ECE but many in other departments are just going through the motions. The best learning happens through clubs and self-study. Peer learning culture is strong though.', title: 'Manipal Faculty', author: 'Anonymous' },
  { collegeSlug: 'manipal', category: 'SPORTS', sentiment: 'POSITIVE', source: 'reddit', content: 'Marena (sports complex) at Manipal is incredible. World-class gym, Olympic swimming pool, badminton courts, basketball courts, cricket ground. Sports culture is very active. Inter-college tournaments are well organized.', title: 'Sports at Manipal', author: 'Anonymous' },
  { collegeSlug: 'manipal', category: 'MENTAL_HEALTH', sentiment: 'NEUTRAL', source: 'reddit', content: 'The relaxed vibe at Manipal helps with mental health compared to IITs. But the fees (20L+ for 4 years) create financial stress for many families. The student counseling center exists but is not widely used. Peer support is what helps most.', title: 'Mental health at Manipal', author: 'Anonymous' },

  // NIT Trichy
  { collegeSlug: 'nit-trichy', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'NIT Trichy has the best placements among all NITs. Microsoft, Google, Amazon, Goldman Sachs - all Day 1 companies. CS average was around 18-20 LPA. Even Mechanical and Civil students get placed through analytics and consulting roles.', title: 'NITT Placements are lit', author: 'NITT Student' },
  { collegeSlug: 'nit-trichy', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Trichy heat + bad mess food = survival mode. The mess serves the same South Indian food daily. North Indian students really struggle here. Hostel rooms are small and the Opal/Garnet hostels are far from academic blocks. Water scarcity during summer is real.', title: 'NIT Trichy hostel woes', author: 'Anonymous' },
  { collegeSlug: 'nit-trichy', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'Festember and Pragyan are among the best NIT fests. Spider (tech club) is nationally recognized. Coding culture is very strong - lots of competitive programmers. The community feeling at NITT is special. Delta Force robotics club is excellent.', title: 'NITT Campus Culture', author: 'NITT Alum' },
  { collegeSlug: 'nit-trichy', category: 'PROFESSORS', sentiment: 'POSITIVE', source: 'shiksha', content: 'NIT Trichy CS and EE departments have strong faculty. Many professors have PhDs from top universities. They are approachable and encourage research. The academic rigor here is what sets NITT apart from other NITs.', title: 'NITT Faculty', author: 'Anonymous' },
  { collegeSlug: 'nit-trichy', category: 'INFRASTRUCTURE', sentiment: 'NEUTRAL', source: 'reddit', content: 'The campus is undergoing renovation. New academic blocks are good but the older ones need work. Library is decent. Sports facilities have improved with the new indoor stadium. Wi-Fi coverage is still patchy in some hostels.', title: 'NITT Infra', author: 'Anonymous' },

  // NIT Warangal
  { collegeSlug: 'nit-warangal', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'NIT Warangal placements are solid - top 3 among NITs. CS average around 16-18 LPA. Companies like Microsoft, Amazon, Flipkart recruit heavily. The CDC does a good job coordinating. Non-CS branches also get decent offers from core companies.', title: 'NITW Placements', author: 'NITW Student' },
  { collegeSlug: 'nit-warangal', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'Technozion and SpringSpree are great fests. The student community is very tight-knit. Club culture (especially coding clubs like GDSC and ACM) is very active. The campus is green and beautiful during monsoon. Alumni network is strong.', title: 'Life at NIT Warangal', author: 'NITW Alum' },
  { collegeSlug: 'nit-warangal', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Warangal mess food is consistently bad. The quality drops further in second semester. Hostel rooms are basic - ceiling fans, shared bathrooms. The new mega hostel is better but still nothing fancy. Night canteen options are limited.', title: 'NITW Hostel life', author: 'Anonymous' },
  { collegeSlug: 'nit-warangal', category: 'PROFESSORS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Mixed bag. Some departments like CSE and ECE have excellent faculty while others have professors who barely put effort into teaching. Research opportunities are available if you approach the right professors.', title: 'NITW Faculty', author: 'Anonymous' },
  { collegeSlug: 'nit-warangal', category: 'RESTRICTIONS', sentiment: 'NEUTRAL', source: 'reddit', content: 'NIT Warangal is moderately strict. 75% attendance is mandatory. Hostel timings exist but are not always enforced strictly. The campus is in a somewhat remote location so options for going out are limited anyway.', title: 'NITW Rules', author: 'Anonymous' },

  // DTU Delhi
  { collegeSlug: 'dtu-delhi', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'DTU placements have improved massively. CS average crossed 20 LPA. Microsoft, Google, Goldman Sachs, Uber all come for campus recruitment. Being in Delhi gives a huge advantage for startup jobs and off-campus opportunities too.', title: 'DTU Placements', author: 'DTU Student' },
  { collegeSlug: 'dtu-delhi', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'DTU fest Engifest is one of the biggest college fests in North India. The college is in Delhi so social life is amazing. CP, Hauz Khas, Sarojini - everything is accessible. Student societies like IEEE, ACM, IOSD are very active.', title: 'DTU Life', author: 'Anonymous' },
  { collegeSlug: 'dtu-delhi', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'DTU hostels are horrible. Seriously. The rooms are tiny, bathrooms are unhygienic, and mess food will make you miss your home food badly. Most students prefer PGs or rented flats nearby which are expensive but at least livable.', title: 'DTU Hostel nightmare', author: 'DTU Hosteller' },
  { collegeSlug: 'dtu-delhi', category: 'PROFESSORS', sentiment: 'NEGATIVE', source: 'reddit', content: 'DTU professors in many departments are still living in the DCE era. Outdated teaching methods, boring lectures, some professors barely come to class. The CS department has a few gems but overall faculty quality needs serious improvement.', title: 'DTU Professors', author: 'Anonymous' },
  { collegeSlug: 'dtu-delhi', category: 'INFRASTRUCTURE', sentiment: 'NEUTRAL', source: 'shiksha', content: 'DTU campus is green and spacious. The old DCE buildings have heritage charm but need renovation. New blocks are decent. Library is good. Sports grounds are available. The metro connectivity (nearby DTU metro station) is a huge plus.', title: 'DTU Campus', author: 'Anonymous' },
  { collegeSlug: 'dtu-delhi', category: 'MENTAL_HEALTH', sentiment: 'NEGATIVE', source: 'reddit', content: 'Peer pressure at DTU is intense. Everyone is either doing competitive coding, building startups, or preparing for MBA. If you are not doing something productive every minute, you feel left behind. Counseling services are basically non-existent.', title: 'DTU Mental Health', author: 'Anonymous' },

  // NSUT Delhi
  { collegeSlug: 'nsut-delhi', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'NSUT placements have been on a strong upward trend. CS batch got 90%+ placement rate. Companies like Google, Microsoft, Samsung, PayPal visit. Average CTC for IT branches was around 16-18 LPA. Non-CS placements are decent too.', title: 'NSUT Placements', author: 'NSUT Student' },
  { collegeSlug: 'nsut-delhi', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'NSUT (Dwarka campus) has a modern feel. CrossRoads fest, Moksha - all are fun. Being in Dwarka means metro connectivity is excellent. The coding culture is very strong with clubs like Enigma and GDSC being highly active.', title: 'NSUT Campus', author: 'Anonymous' },
  { collegeSlug: 'nsut-delhi', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'NSUT hostel situation is bad. Limited hostel seats mean many students have to find PGs. The existing hostels are overcrowded. Mess food quality fluctuates wildly week to week. The canteen is the saving grace.', title: 'NSUT Hostel issues', author: 'Anonymous' },
  { collegeSlug: 'nsut-delhi', category: 'PROFESSORS', sentiment: 'NEUTRAL', source: 'reddit', content: 'NSUT faculty is a mixed bag. Some CS professors are excellent and have industry connections. But many core department professors lack practical knowledge. The saving grace is that students learn more from peers and online resources anyway.', title: 'NSUT Faculty', author: 'Anonymous' },
  { collegeSlug: 'nsut-delhi', category: 'INFRASTRUCTURE', sentiment: 'NEUTRAL', source: 'shiksha', content: 'The Dwarka campus is relatively new and well-maintained. Classrooms are okay but could use better AV equipment. Labs are decently equipped. The sports facilities are basic but functional. Library is small compared to IITs but adequate.', title: 'NSUT Infrastructure', author: 'Anonymous' },

  // Christ University
  { collegeSlug: 'christ-university', category: 'PLACEMENTS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Christ placements are average for engineering but good for management and commerce. MNCs like Deloitte, EY, KPMG recruit from the MBA program. Engineering placements are mostly mass recruiters. Average package for BBA/BCom is around 5-6 LPA.', title: 'Christ University Placements', author: 'Christ Student' },
  { collegeSlug: 'christ-university', category: 'RESTRICTIONS', sentiment: 'NEGATIVE', source: 'quora', content: 'Christ University is literally a PRISON. Formal dress code daily, no ripped jeans, no colored hair, attendance monitored to the minute, CCTV everywhere, no PDA on campus, phone confiscated if used in corridors. They call parents for EVERYTHING. Worst college rules in India.', title: 'Christ restrictions are insane', author: 'Frustrated Christite' },
  { collegeSlug: 'christ-university', category: 'PROFESSORS', sentiment: 'POSITIVE', source: 'shiksha', content: 'One positive thing about Christ - the faculty is genuinely good, especially in the Commerce and Management departments. Professors are knowledgeable, well-prepared, and actually care about teaching. The strict academic culture ensures quality education.', title: 'Christ Faculty', author: 'Anonymous' },
  { collegeSlug: 'christ-university', category: 'CAMPUS_LIFE', sentiment: 'NEUTRAL', source: 'reddit', content: 'Campus life is restricted but Blossoms fest is actually good. Cultural activities are encouraged within limits. Being in Bangalore means weekends can be fun if you are a day scholar. Hostel students have curfew though.', title: 'Christ Campus Life', author: 'Anonymous' },
  { collegeSlug: 'christ-university', category: 'INFRASTRUCTURE', sentiment: 'POSITIVE', source: 'shiksha', content: 'Christ campus is beautiful and well-maintained. The Bangalore main campus, Kengeri campus, and Lavasa campus all look premium. AC classrooms, good auditoriums, clean washrooms - infrastructure is one of their strongest points.', title: 'Christ Infrastructure', author: 'Anonymous' },
  { collegeSlug: 'christ-university', category: 'MENTAL_HEALTH', sentiment: 'NEGATIVE', source: 'reddit', content: 'The constant surveillance and strict rules take a serious toll on mental health. Students feel suffocated. The counseling center exists but reporting mental health issues sometimes leads to parents being called, which discourages students from seeking help.', title: 'Mental health at Christ', author: 'Anonymous' },

  // Amity Noida
  { collegeSlug: 'amity-noida', category: 'PLACEMENTS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Amity placements are heavily marketed but reality is different. Mass recruiters like TCS (3.3 LPA) form the bulk. Average is around 4-5 LPA for most branches. A few students crack good packages but they are self-prepared, not because of Amity.', title: 'Amity Placement truth', author: 'Amity Grad' },
  { collegeSlug: 'amity-noida', category: 'CAMPUS_LIFE', sentiment: 'NEUTRAL', source: 'quora', content: 'Amity campus is huge and looks impressive. Fests are decent. The crowd is a mix of genuinely talented students and people who got in just because of money. If you find the right friend circle, it can be enjoyable. Noida location is convenient.', title: 'Amity Campus Life', author: 'Anonymous' },
  { collegeSlug: 'amity-noida', category: 'PROFESSORS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Most Amity professors are hired at low salaries so quality suffers. They read from PPTs downloaded from the internet. Few professors genuinely care. The ones who are good eventually leave for better-paying institutions.', title: 'Amity Faculty problems', author: 'Anonymous' },
  { collegeSlug: 'amity-noida', category: 'INFRASTRUCTURE', sentiment: 'POSITIVE', source: 'shiksha', content: 'If there is one thing Amity does well, it is infrastructure. The campus looks like a corporate office. AC classrooms, well-furnished labs, impressive buildings. They spend a lot on appearances which helps with marketing.', title: 'Amity Infrastructure', author: 'Anonymous' },
  { collegeSlug: 'amity-noida', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'For the fees they charge (15-20L for 4 years), the hostel and mess quality is embarrassing. Small rooms, basic amenities, and mess food that even the canteen dog avoids. Most students eventually move to nearby PGs.', title: 'Amity Hostel', author: 'Anonymous' },
  { collegeSlug: 'amity-noida', category: 'RESTRICTIONS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Amity is moderately strict. Attendance is mandatory (75%). Dress code exists but is loosely enforced. Hostel rules are standard. The admin can be bureaucratic but it is not as suffocating as Christ or VIT.', title: 'Amity Rules', author: 'Anonymous' },

  // LPU Punjab
  { collegeSlug: 'lpu-punjab', category: 'PLACEMENTS', sentiment: 'NEUTRAL', source: 'reddit', content: 'LPU placement numbers look good on paper because of the massive student body. A few students get great packages (20L+) but they are exceptional self-learners. Average is around 4-5 LPA. Mass recruiters dominate. Marketing team works overtime on LinkedIn.', title: 'LPU Placement reality', author: 'LPU Grad' },
  { collegeSlug: 'lpu-punjab', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'LPU campus is absolutely massive - largest single campus in India. One World fest attracts big Bollywood celebrities. The campus feels like a small city. Unipolis (food court) has tons of options. Diverse student body from all over India and abroad.', title: 'LPU Campus', author: 'Anonymous' },
  { collegeSlug: 'lpu-punjab', category: 'HOSTEL_MESS', sentiment: 'NEUTRAL', source: 'reddit', content: 'LPU hostels vary widely. Premium hostels are actually good with AC and attached washrooms. Regular hostels are basic. Mess food is average Punjabi fare - at least the parathas are decent. Unipolis food court is the real savior.', title: 'LPU Hostel', author: 'Anonymous' },
  { collegeSlug: 'lpu-punjab', category: 'PROFESSORS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Faculty quality at LPU is below average overall. Many young teachers with limited experience. Some departments have good faculty but they are the exception. The university hires in bulk which affects quality. Self-study is essential.', title: 'LPU Faculty', author: 'Anonymous' },
  { collegeSlug: 'lpu-punjab', category: 'INFRASTRUCTURE', sentiment: 'POSITIVE', source: 'shiksha', content: 'LPU infrastructure is world-class. Shanti Devi Mittal Auditorium is massive. Sports facilities include Olympic-size pool, cricket stadium. The campus design is modern. They keep investing in new buildings and facilities.', title: 'LPU Infrastructure', author: 'Anonymous' },
  { collegeSlug: 'lpu-punjab', category: 'RESTRICTIONS', sentiment: 'NEGATIVE', source: 'reddit', content: 'LPU has gotten stricter over the years. Biometric attendance, strict hostel timings, no outside food delivery after certain hours. The rural location means you are dependent on campus facilities. They monitor social media posts about the university.', title: 'LPU Restrictions', author: 'Anonymous' },

  // Chandigarh University
  { collegeSlug: 'chandigarh-university', category: 'PLACEMENTS', sentiment: 'NEUTRAL', source: 'reddit', content: 'CU placements are decent for a private university. TCS, Infosys, Wipro form the bulk. Some students crack Amazon, Microsoft but they are outliers. The university claims high placement percentage but includes service-based companies at 3-4 LPA.', title: 'CU Placements', author: 'CU Student' },
  { collegeSlug: 'chandigarh-university', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'CU campus is beautiful. TechNovate and cultural fests are well-organized. Being near Chandigarh city is a huge advantage. The student body is very diverse. Clubs and societies are active. Weekend trips to Chandigarh/Shimla are common.', title: 'CU Campus Life', author: 'Anonymous' },
  { collegeSlug: 'chandigarh-university', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'CU hostel mess food quality has declined over the years. Portions are small, variety is limited. The hostels themselves are okay but maintenance is an issue. Water supply problems in summer. They keep increasing hostel fees without improving quality.', title: 'CU Hostel', author: 'Anonymous' },
  { collegeSlug: 'chandigarh-university', category: 'PROFESSORS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Faculty is average. Some departments like CS have brought in good professors recently. But many teachers are inexperienced. The university is growing too fast and hiring cannot keep up with quality standards. Industry guest lectures partly compensate.', title: 'CU Faculty', author: 'Anonymous' },
  { collegeSlug: 'chandigarh-university', category: 'RESTRICTIONS', sentiment: 'NEGATIVE', source: 'reddit', content: 'CU has strict rules. Attendance is mandatory, hostel curfew at 8 PM for girls. They have faced controversies regarding student privacy. The administration can be authoritarian. Questioning rules is not encouraged.', title: 'CU Restrictions', author: 'Anonymous' },
  { collegeSlug: 'chandigarh-university', category: 'NEWS_CONTROVERSY', sentiment: 'NEGATIVE', source: 'news', content: 'Chandigarh University faced major controversy in 2022 regarding student privacy issues that led to widespread protests. The incident raised serious concerns about student safety and administrative accountability at the university.', title: 'CU Controversy 2022', author: 'News Report' },

  // Symbiosis Pune
  { collegeSlug: 'symbiosis-pune', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'Symbiosis MBA (SIBM) placements are excellent - average around 25-28 LPA. Engineering placements at SIT are more modest but decent. Law school placements are among the best in India. The Symbiosis brand carries weight in the corporate world.', title: 'Symbiosis Placements', author: 'SIBM Alum' },
  { collegeSlug: 'symbiosis-pune', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'Symbiosis Lavale campus is stunning. Multiple colleges on one campus creates a vibrant mix of students. Pune city adds to the experience - great weather, food scene, and nightlife. Fests like Confluence and Synapse are well-organized.', title: 'Symbiosis Life', author: 'Anonymous' },
  { collegeSlug: 'symbiosis-pune', category: 'PROFESSORS', sentiment: 'POSITIVE', source: 'shiksha', content: 'Faculty quality at Symbiosis is above average, especially in management and law. Many professors have industry experience. Teaching methodology is case-study based which is effective. International faculty exchange programs add value.', title: 'Symbiosis Faculty', author: 'Anonymous' },
  { collegeSlug: 'symbiosis-pune', category: 'HOSTEL_MESS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Symbiosis hostels are decent - not luxury but comfortable. Mess food is average Maharashtrian fare. Pune has amazing food delivery options which most students use. The Lavale campus hostel is better than the city campus ones.', title: 'Symbiosis Hostel', author: 'Anonymous' },
  { collegeSlug: 'symbiosis-pune', category: 'INFRASTRUCTURE', sentiment: 'POSITIVE', source: 'shiksha', content: 'Symbiosis campuses are well-designed and maintained. The Lavale hill-top campus is architecturally impressive. Good auditoriums, libraries, and sports facilities. IT infrastructure is modern. The campus design promotes collaboration.', title: 'Symbiosis Infra', author: 'Anonymous' },
  { collegeSlug: 'symbiosis-pune', category: 'RESTRICTIONS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Symbiosis is moderately liberal. Attendance requirements exist but are reasonable. No strict dress code. Hostel timings are standard. The international student presence creates a more open-minded environment overall.', title: 'Symbiosis Rules', author: 'Anonymous' },

  // KIIT Bhubaneswar
  { collegeSlug: 'kiit-bhubaneswar', category: 'PLACEMENTS', sentiment: 'NEUTRAL', source: 'reddit', content: 'KIIT placements are improving year by year. CS branch gets decent placements with average around 7-8 LPA. Companies like Deloitte, Accenture, TCS, Infosys are regular recruiters. Top students crack 15-20 LPA. Volume-wise, placement numbers are good.', title: 'KIIT Placements', author: 'KIIT Student' },
  { collegeSlug: 'kiit-bhubaneswar', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'quora', content: 'KIIT has transformed Bhubaneswar. The campus is like a small city with hospitals, shopping areas, and multiple schools. Fests like Kiit Fest are getting bigger each year. The student community is friendly and diverse.', title: 'KIIT Campus', author: 'Anonymous' },
  { collegeSlug: 'kiit-bhubaneswar', category: 'HOSTEL_MESS', sentiment: 'NEUTRAL', source: 'reddit', content: 'KIIT hostels are decent for the price. Mess food is average but consistent. The food courts on campus offer variety. Newer hostels (Campus 15-20) are well-furnished. Older hostels are basic but functional.', title: 'KIIT Hostel', author: 'Anonymous' },
  { collegeSlug: 'kiit-bhubaneswar', category: 'PROFESSORS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Faculty quality at KIIT varies significantly across departments. CS and IT departments have some good professors. But rapid expansion means many new hires are not experienced enough. Labs are well-equipped though.', title: 'KIIT Faculty', author: 'Anonymous' },
  { collegeSlug: 'kiit-bhubaneswar', category: 'INFRASTRUCTURE', sentiment: 'POSITIVE', source: 'shiksha', content: 'KIIT infrastructure is genuinely impressive. Modern buildings, well-equipped labs, massive library, good sports complex. The campus looks like a tech park. They keep investing in new facilities. Wi-Fi coverage is campus-wide.', title: 'KIIT Infra', author: 'Anonymous' },
  { collegeSlug: 'kiit-bhubaneswar', category: 'SPORTS', sentiment: 'POSITIVE', source: 'reddit', content: 'KIIT has strong sports culture. Multiple sports facilities including swimming pool, indoor stadium, cricket ground. KIIT students regularly participate in university-level championships. The sports scholarship program attracts good athletes.', title: 'KIIT Sports', author: 'Anonymous' },

  // Thapar Patiala
  { collegeSlug: 'thapar-patiala', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'Thapar placements are strong for a private university in Punjab. CS average is around 12-15 LPA. Companies like Microsoft, Amazon, Goldman Sachs visit campus. The alumni network in the tech industry is growing. PPO conversion rate is high.', title: 'Thapar Placements', author: 'Thapar Student' },
  { collegeSlug: 'thapar-patiala', category: 'CAMPUS_LIFE', sentiment: 'NEUTRAL', source: 'quora', content: 'Thapar is in Patiala which is a small city. Campus life revolves around the college itself. Fests like Spirits are fun but limited by the location. The coding culture is very strong. Late night chai at the dhaba outside campus is a tradition.', title: 'Thapar Life', author: 'Anonymous' },
  { collegeSlug: 'thapar-patiala', category: 'HOSTEL_MESS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Thapar mess food is decent Punjabi food - better than most colleges honestly. The parathas and rajma are good. Hostel rooms are standard. J and K hostels are the newest and best. The campus cafeteria (Nescafe) is a popular hangout.', title: 'Thapar Hostel', author: 'Anonymous' },
  { collegeSlug: 'thapar-patiala', category: 'PROFESSORS', sentiment: 'POSITIVE', source: 'shiksha', content: 'Thapar faculty is one of its strongest points. Especially CS, ECE, and Chemical departments. Many professors have research publications in top journals. They are approachable and supportive. Academic rigor is maintained well.', title: 'Thapar Faculty', author: 'Anonymous' },
  { collegeSlug: 'thapar-patiala', category: 'INFRASTRUCTURE', sentiment: 'POSITIVE', source: 'shiksha', content: 'Thapar campus is compact but well-maintained. The new Learning Resource Center (library) is excellent. Labs are modern and well-equipped. Sports facilities are good with a cricket ground, basketball courts, and gym.', title: 'Thapar Infra', author: 'Anonymous' },
  { collegeSlug: 'thapar-patiala', category: 'RESTRICTIONS', sentiment: 'NEUTRAL', source: 'reddit', content: 'Thapar is moderately strict. 75% attendance mandatory. Hostel timings exist (10 PM for freshers, 11 PM for seniors). No alcohol on campus obviously. The rules are reasonable and not overly suffocating compared to VIT or Christ.', title: 'Thapar Rules', author: 'Anonymous' },
]

async function seed() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    console.log('Clearing existing data...')
    await College.deleteMany({})
    await Post.deleteMany({})

    // Seed colleges
    console.log('Seeding colleges...')
    const createdColleges = await College.insertMany(
      colleges.map((c) => ({
        ...c,
        categories: {
          placements: { score: 0, count: 0 },
          hostel: { score: 0, count: 0 },
          mess: { score: 0, count: 0 },
          professors: { score: 0, count: 0 },
          mentalHealth: { score: 0, count: 0 },
          campusLife: { score: 0, count: 0 },
          sports: { score: 0, count: 0 },
          restrictions: { score: 0, count: 0 },
          infrastructure: { score: 0, count: 0 },
        },
        overallScore: 0,
        totalPosts: 0,
      }))
    )
    console.log(`Created ${createdColleges.length} colleges`)

    // Create a slug-to-college map
    const collegeMap = new Map<string, any>()
    for (const college of createdColleges) {
      collegeMap.set(college.slug, college)
    }

    // Seed posts
    console.log('Seeding posts...')
    const postsToCreate = posts.map((p) => {
      const college = collegeMap.get(p.collegeSlug)
      return {
        collegeId: college._id,
        collegeName: college.name,
        collegeSlug: p.collegeSlug,
        category: p.category,
        sentiment: p.sentiment,
        source: p.source,
        sourceUrl: '',
        content: p.content,
        title: p.title,
        upvotes: Math.floor(Math.random() * 50),
        author: p.author,
        verified: true,
        isApproved: true,
      }
    })

    await Post.insertMany(postsToCreate)
    console.log(`Created ${postsToCreate.length} posts`)

    // Update college scores based on posts
    console.log('Updating college scores...')
    const categoryToField: Record<string, string> = {
      PLACEMENTS: 'placements',
      HOSTEL_MESS: 'hostel',
      PROFESSORS: 'professors',
      MENTAL_HEALTH: 'mentalHealth',
      CAMPUS_LIFE: 'campusLife',
      SPORTS: 'sports',
      RESTRICTIONS: 'restrictions',
      INFRASTRUCTURE: 'infrastructure',
    }

    function sentimentToScore(sentiment: string): number {
      switch (sentiment) {
        case 'POSITIVE': return 8
        case 'NEGATIVE': return 3
        case 'NEUTRAL': return 5
        default: return 5
      }
    }

    for (const college of createdColleges) {
      const collegePosts = posts.filter((p) => p.collegeSlug === college.slug)
      const categories: Record<string, { total: number; count: number }> = {}

      for (const post of collegePosts) {
        const field = categoryToField[post.category]
        if (field) {
          if (!categories[field]) categories[field] = { total: 0, count: 0 }
          categories[field].total += sentimentToScore(post.sentiment)
          categories[field].count++
        }
      }

      const updateObj: Record<string, any> = { totalPosts: collegePosts.length }
      const scores: number[] = []

      for (const [field, data] of Object.entries(categories)) {
        const avgScore = Math.round((data.total / data.count) * 10) / 10
        updateObj[`categories.${field}.score`] = avgScore
        updateObj[`categories.${field}.count`] = data.count
        scores.push(avgScore)
      }

      if (scores.length > 0) {
        updateObj.overallScore =
          Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      }

      await College.findByIdAndUpdate(college._id, { $set: updateObj })
    }

    console.log('Seed complete!')
    console.log(`Total colleges: ${createdColleges.length}`)
    console.log(`Total posts: ${postsToCreate.length}`)

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    await mongoose.disconnect()
    process.exit(1)
  }
}

seed()
