// Quick seed script to test MongoDB connection and add sample data
import mongoose from 'mongoose'

const MONGODB_URI = 'mongodb+srv://college:truth@college-truth.rehagna.mongodb.net/college-truth?retryWrites=true&w=majority&appName=college-truth'

const CollegeSchema = new mongoose.Schema({
  name: String, slug: { type: String, unique: true }, city: String, state: String,
  type: { type: String, enum: ['private', 'government', 'deemed', 'autonomous'] },
  established: Number, description: String, overallScore: { type: Number, default: 0 },
  totalPosts: { type: Number, default: 0 },
  categories: {
    placements: { score: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    hostel: { score: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    mess: { score: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    professors: { score: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    mentalHealth: { score: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    campusLife: { score: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    sports: { score: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    restrictions: { score: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
    infrastructure: { score: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  },
}, { timestamps: true })

const PostSchema = new mongoose.Schema({
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  collegeName: String, collegeSlug: String,
  category: String, sentiment: String, source: String,
  sourceUrl: { type: String, default: '' },
  content: String, title: { type: String, default: '' },
  upvotes: { type: Number, default: 0 }, author: { type: String, default: 'Anonymous' },
  verified: { type: Boolean, default: true }, isApproved: { type: Boolean, default: true },
}, { timestamps: true })

const College = mongoose.model('College', CollegeSchema)
const Post = mongoose.model('Post', PostSchema)

const colleges = [
  { name: 'IIT Bombay', slug: 'iit-bombay', city: 'Mumbai', state: 'Maharashtra', type: 'government', established: 1958, description: 'Indian Institute of Technology Bombay' },
  { name: 'IIT Delhi', slug: 'iit-delhi', city: 'New Delhi', state: 'Delhi', type: 'government', established: 1961, description: 'Indian Institute of Technology Delhi' },
  { name: 'BITS Pilani', slug: 'bits-pilani', city: 'Pilani', state: 'Rajasthan', type: 'deemed', established: 1964, description: 'Birla Institute of Technology and Science' },
  { name: 'VIT Vellore', slug: 'vit-vellore', city: 'Vellore', state: 'Tamil Nadu', type: 'private', established: 1984, description: 'Vellore Institute of Technology' },
  { name: 'NIT Trichy', slug: 'nit-trichy', city: 'Tiruchirappalli', state: 'Tamil Nadu', type: 'government', established: 1964, description: 'National Institute of Technology Tiruchirappalli' },
  { name: 'SRM Chennai', slug: 'srm-chennai', city: 'Chennai', state: 'Tamil Nadu', type: 'private', established: 1985, description: 'SRM Institute of Science and Technology' },
  { name: 'DTU Delhi', slug: 'dtu-delhi', city: 'New Delhi', state: 'Delhi', type: 'government', established: 1941, description: 'Delhi Technological University' },
  { name: 'IIT Madras', slug: 'iit-madras', city: 'Chennai', state: 'Tamil Nadu', type: 'government', established: 1959, description: 'Indian Institute of Technology Madras' },
  { name: 'Manipal Institute of Technology', slug: 'manipal', city: 'Manipal', state: 'Karnataka', type: 'private', established: 1957, description: 'Manipal Institute of Technology' },
  { name: 'Lovely Professional University', slug: 'lpu', city: 'Jalandhar', state: 'Punjab', type: 'private', established: 2005, description: 'Lovely Professional University' },
  { name: 'Amity University Noida', slug: 'amity-noida', city: 'Noida', state: 'Uttar Pradesh', type: 'private', established: 2005, description: 'Amity University' },
  { name: 'Chandigarh University', slug: 'chandigarh-university', city: 'Mohali', state: 'Punjab', type: 'private', established: 2012, description: 'Chandigarh University' },
]

const posts = [
  { collegeSlug: 'iit-bombay', category: 'PLACEMENTS', sentiment: 'NEGATIVE', source: 'reddit', content: 'The placement season this year was brutal. Only top CSE students got the dream offers. Most mechanical and civil branches struggled to even get shortlisted. The median package dropped by 2 LPA compared to last year. Companies are cutting back on hiring and the placement cell is sugar coating numbers as usual.', title: 'IIT Bombay Placements Reality 2025', upvotes: 234 },
  { collegeSlug: 'iit-bombay', category: 'MENTAL_HEALTH', sentiment: 'NEGATIVE', source: 'reddit', content: 'The academic pressure here is no joke. Two of my batchmates had to take a semester break for mental health reasons. The counseling center exists but the wait time is 3 weeks. We need more therapists on campus. The competitive environment makes it worse - everyone is comparing CGPA and internships.', title: 'Mental health crisis at IITB', upvotes: 312 },
  { collegeSlug: 'iit-bombay', category: 'INFRASTRUCTURE', sentiment: 'POSITIVE', source: 'reddit', content: 'The new hostel blocks are amazing. AC rooms, individual study tables, high speed WiFi. The library is world class with 24/7 access. Labs are well equipped especially for CS and EE departments. The sports complex was recently renovated.', title: 'IITB infrastructure is genuinely top notch', upvotes: 189 },
  { collegeSlug: 'bits-pilani', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'reddit', content: 'BITS fest culture is genuinely unmatched. BOSM and Oasis were incredible this year. The freedom here is something you won\'t find at any IIT. No attendance policy, no curfew, complete autonomy. It teaches you responsibility and time management better than any course.', title: 'Why BITS campus life is the best', upvotes: 187 },
  { collegeSlug: 'bits-pilani', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'Practice School is a game changer. 6 months of actual industry experience before placements. Companies love BITS grads because we come with real work experience. Median package for CS is around 25 LPA. Even non-CS branches do well compared to most NITs.', title: 'BITS placements and PS advantage', upvotes: 156 },
  { collegeSlug: 'vit-vellore', category: 'RESTRICTIONS', sentiment: 'NEGATIVE', source: 'reddit', content: 'They literally lock the hostel gates at 9 PM. If you\'re caught outside after curfew, they call your parents. In 2026. A so-called \'university\'. The biometric attendance system tracks your every move. You need permission to leave campus on weekdays. It feels like a prison not a college.', title: 'VIT restrictions are insane', upvotes: 445 },
  { collegeSlug: 'vit-vellore', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Mess food is consistently terrible. Found insects in dal twice this semester. The hygiene standards are non-existent. They charge 90K per year for this garbage. The only saving grace is the Darling canteen outside campus. Hostel rooms are cramped - 3 people in a tiny room.', title: 'VIT mess food horror stories', upvotes: 312 },
  { collegeSlug: 'nit-trichy', category: 'HOSTEL_MESS', sentiment: 'POSITIVE', source: 'quora', content: 'The new hostel block is surprisingly good. AC rooms, attached bathrooms, decent WiFi. Mess food is still the same old dal-chawal story but at least the living conditions have improved. 7/10 would recommend. The campus is green and beautiful, especially during monsoon.', title: 'NIT Trichy hostel life honest review', upvotes: 98 },
  { collegeSlug: 'nit-trichy', category: 'PROFESSORS', sentiment: 'POSITIVE', source: 'reddit', content: 'Some of the best professors I\'ve ever met are here. The CS department has amazing faculty who are actually passionate about teaching. Research output is on par with IITs. The only issue is some older professors who still use outdated curricula in mechanical department.', title: 'NIT Trichy professors are underrated', upvotes: 134 },
  { collegeSlug: 'srm-chennai', category: 'PROFESSORS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Half the professors just read from slides. The other half don\'t even show up. Had a course where the prof came for 12 out of 40 lectures. The internal marks are completely arbitrary. Pay 20L fees for a degree where you have to learn everything from YouTube.', title: 'SRM teaching quality is terrible', upvotes: 567 },
  { collegeSlug: 'srm-chennai', category: 'PLACEMENTS', sentiment: 'NEGATIVE', source: 'reddit', content: 'SRM inflates their placement numbers massively. They count 3.5 LPA mass recruiter offers as "placed". The actual good placements are only for top 5% of the batch. Don\'t believe their brochures. Most students end up in service companies like TCS, Infosys at 3-4 LPA.', title: 'The truth about SRM placements', upvotes: 423 },
  { collegeSlug: 'iit-delhi', category: 'MENTAL_HEALTH', sentiment: 'NEGATIVE', source: 'news', content: 'The academic pressure at IIT Delhi has been increasingly concerning. Multiple students have reported severe anxiety and depression. The administration has launched new mental health initiatives but students say it\'s too little too late. The competitive cutthroat environment needs systemic change not band-aid solutions.', title: 'IIT Delhi mental health concerns grow', upvotes: 289 },
  { collegeSlug: 'iit-delhi', category: 'PLACEMENTS', sentiment: 'POSITIVE', source: 'reddit', content: 'IIT Delhi placement season was solid this year. Microsoft, Google, Goldman Sachs all came. CSE median was around 35 LPA. Even EE and Maths students got decent offers. The alumni network is incredibly strong - most of my seniors helped with referrals. Brand value is unmatched.', title: 'IITD placements 2025 honest review', upvotes: 201 },
  { collegeSlug: 'dtu-delhi', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'reddit', content: 'Being in Delhi gives you access to everything. Internship opportunities are endless because every company has an office here. The cultural fests are great, Engifest draws huge crowds. The campus itself is spacious and well connected by metro. Weekend scene in CP is amazing.', title: 'DTU Delhi advantage is real', upvotes: 167 },
  { collegeSlug: 'dtu-delhi', category: 'INFRASTRUCTURE', sentiment: 'NEGATIVE', source: 'reddit', content: 'The infrastructure is falling apart. WiFi barely works in most buildings. The library needs serious upgrades. Some classrooms don\'t even have working projectors in 2026. For a government college in the capital city, this is embarrassing. The only thing they invest in is building new gates.', title: 'DTU infrastructure is a joke', upvotes: 234 },
  { collegeSlug: 'lpu', category: 'PLACEMENTS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Mass recruitment inflates placement stats. Actual median is below 4 LPA. They count every internship conversion as a placement. The brochure shows "highest package 1 Cr" but that was ONE person out of 30,000 students. Don\'t fall for the marketing.', title: 'LPU placement reality check', upvotes: 389 },
  { collegeSlug: 'amity-noida', category: 'PROFESSORS', sentiment: 'NEGATIVE', source: 'reddit', content: 'High faculty turnover, many visiting lecturers with no industry experience. Some professors are fresh MTech graduates who struggle to answer student questions. The curriculum is outdated by at least 5 years. You\'re essentially paying for a degree certificate, not education.', title: 'Amity Noida professors honest review', upvotes: 278 },
  { collegeSlug: 'chandigarh-university', category: 'RESTRICTIONS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Extreme surveillance, mandatory attendance biometrics, phone restrictions in class, can\'t leave campus without written permission. They treat engineering students like school children. The fine system is ridiculous - late to class? 500 Rs fine. Miss a workshop? 2000 Rs fine.', title: 'CU restrictions are next level', upvotes: 334 },
  { collegeSlug: 'manipal', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'reddit', content: 'Manipal is basically a mini city. Everything you need is within walking distance. The food scene is incredible - from beach shacks to fine dining. End Point beach sunsets are therapeutic. The diverse student body from all over India makes it culturally rich. Best 4 years of my life.', title: 'Manipal campus life is unmatched', upvotes: 256 },
  { collegeSlug: 'manipal', category: 'HOSTEL_MESS', sentiment: 'NEGATIVE', source: 'reddit', content: 'Hostel mess food is bland and repetitive. Same menu every week. For the fees they charge (15L+ per year), the food quality should be much better. Most students survive on Swiggy and outside food. The hostel rooms in older blocks are tiny and poorly ventilated.', title: 'Manipal hostel mess reality', upvotes: 178 },
  { collegeSlug: 'iit-madras', category: 'CAMPUS_LIFE', sentiment: 'POSITIVE', source: 'reddit', content: 'Living inside a national park is surreal. Deer casually walk around campus. The greenery is therapeutic after a stressful exam. IIT Madras campus is the most beautiful campus in India, no debate. The institute fest Saarang is world class. Research culture is the best among all IITs.', title: 'IIT Madras campus is paradise', upvotes: 345 },
  { collegeSlug: 'iit-madras', category: 'SPORTS', sentiment: 'POSITIVE', source: 'reddit', content: 'Sports facilities are top tier. Olympic size swimming pool, multiple basketball and tennis courts, a full cricket ground, gym with modern equipment. Inter-IIT sports is taken very seriously here. Many students go on to represent at national level. The sports culture is genuinely strong.', title: 'IIT Madras sports facilities review', upvotes: 167 },
]

async function seed() {
  console.log('Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('Connected!')

  // Clear existing data
  await College.deleteMany({})
  await Post.deleteMany({})
  console.log('Cleared existing data')

  // Insert colleges
  const insertedColleges = await College.insertMany(colleges)
  console.log(`Inserted ${insertedColleges.length} colleges`)

  // Create slug -> id map
  const slugToId = {}
  for (const c of insertedColleges) {
    slugToId[c.slug] = c._id
  }

  // Insert posts with college references
  const postsWithIds = posts.map(p => ({
    ...p,
    collegeId: slugToId[p.collegeSlug],
    collegeName: colleges.find(c => c.slug === p.collegeSlug)?.name || p.collegeSlug,
  }))
  const insertedPosts = await Post.insertMany(postsWithIds)
  console.log(`Inserted ${insertedPosts.length} posts`)

  // Update college scores based on posts
  for (const college of insertedColleges) {
    const collegePosts = posts.filter(p => p.collegeSlug === college.slug)
    const catMap = { PLACEMENTS: 'placements', HOSTEL_MESS: 'hostel', PROFESSORS: 'professors', MENTAL_HEALTH: 'mentalHealth', CAMPUS_LIFE: 'campusLife', SPORTS: 'sports', RESTRICTIONS: 'restrictions', INFRASTRUCTURE: 'infrastructure', NEWS_CONTROVERSY: 'news' }
    const sentimentScore = { POSITIVE: 8, NEGATIVE: 3, NEUTRAL: 5 }

    const updates = { totalPosts: collegePosts.length, categories: {} }
    for (const [postCat, dbCat] of Object.entries(catMap)) {
      const catPosts = collegePosts.filter(p => p.category === postCat)
      if (catPosts.length > 0) {
        const avgScore = catPosts.reduce((sum, p) => sum + sentimentScore[p.sentiment], 0) / catPosts.length
        updates.categories[dbCat] = { score: Math.round(avgScore * 10) / 10, count: catPosts.length }
      }
    }

    // Calculate overall score
    const scores = Object.values(updates.categories).map(c => c.score).filter(s => s > 0)
    if (scores.length > 0) {
      updates.overallScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    }

    await College.findByIdAndUpdate(college._id, { $set: updates })
  }
  console.log('Updated college scores')

  console.log('Seed complete!')
  await mongoose.disconnect()
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1) })
