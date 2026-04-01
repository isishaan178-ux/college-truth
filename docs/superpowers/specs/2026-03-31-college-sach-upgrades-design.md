# College Sach Upgrades — Design Spec

## Overview
Three upgrades to College Sach: Reddit web scraper for real content, admin panel redesign for per-college review, and fixes for compare page + site speed.

## 1. Reddit Web Scraper

### Strategy
- **No API key required** — scrapes old.reddit.com via HTTP requests
- **Dynamic college list** — reads colleges from MongoDB, not hardcoded
- **Broad search** — searches ALL of Reddit for college names, not just fixed subreddits
- **Unfiltered** — no content censorship, captures dark side, confessions, suicides, ragging, everything
- **Admin gated** — all posts land as pending, admin approves/deletes

### Search Strategy
For each college in the database:

1. **Global Reddit search**: `old.reddit.com/search?q="college name"&sort=relevance&t=all`
2. **Keyword variants**: append `review`, `confession`, `truth`, `experience`, `hostel`, `placements`, `suicide`, `ragging`, `honest`
3. **Auto-discover subreddits**: search for `r/{collegeslug}`, `r/{collegename}`, `r/{abbreviation}confessions` — if they exist, crawl top posts directly
4. **Comment extraction**: for each post, grab top 5–10 comments (often more truthful than the post)

### Data Extracted Per Post
- title, body text, top comments (as separate posts)
- subreddit name, post URL, author (anonymized), upvotes, date
- college slug (matched from search query)

### Processing
- Deduplication: SHA256 hash of content, skip if already in DB
- Min length: skip posts < 30 characters
- Basic keyword categorization:
  - PLACEMENTS: placement, package, lpa, recruit, hire, offer, ctc, internship
  - HOSTEL_MESS: hostel, mess, food, canteen, room, warden, curfew
  - PROFESSORS: professor, faculty, teaching, lecture, attendance, syllabus
  - MENTAL_HEALTH: mental, depression, suicide, anxiety, stress, pressure, counseling
  - CAMPUS_LIFE: campus, fest, culture, club, society, event, party
  - SPORTS: sports, gym, ground, cricket, football, swimming, fitness
  - RESTRICTIONS: restriction, rule, curfew, fine, biometric, permission, surveillance
  - INFRASTRUCTURE: wifi, library, lab, building, classroom, infra, renovate
  - NEWS_CONTROVERSY: controversy, scandal, news, protest, strike, viral
- Basic sentiment: count positive vs negative keywords, assign POSITIVE/NEGATIVE/NEUTRAL
- All posts sent to `/api/scrape/ingest` with `isApproved: false`

### Tech
- Python 3 with `requests` + `BeautifulSoup4`
- Rate limiting: 2-second delay between requests
- User-Agent rotation to avoid blocks
- Can run locally via `python scrapers/reddit_scraper_v2.py` or via GitHub Actions cron

## 2. Admin Panel Redesign

### Current State
Flat list of all submissions. No way to review by college.

### New Design

**Dashboard view:**
- Grid of college cards, each showing: name, city, pending count badge
- Search/filter colleges
- "Add College" button (name, city, state, type form)

**College detail view (click a college):**
- Shows all pending posts for that college
- Each post card: content preview (expandable), source, category guess, date, upvotes
- Two buttons: Approve (green) / Delete (red)
- "Approve All" bulk action button
- Back to dashboard button

### API Changes
- `GET /api/admin/pending-by-college` — returns colleges with pending post counts
- `PATCH /api/posts/[id]/approve` — approve a single post
- `DELETE /api/posts/[id]` — delete a post
- `POST /api/admin/colleges` — create a new college from admin
- `POST /api/posts/bulk-approve` — approve all pending posts for a college

## 3. Compare Page Fix
- Handle missing/zero category scores gracefully (show "No data" or dash)
- Don't break when a college has no posts in a category
- Show a message when fewer than 2 colleges are selected

## 4. Site Speed Fix
- Add `export const revalidate = 300` to college detail page (5 min ISR cache)
- Ensure `.lean()` on all Mongoose queries
- Verify MongoDB indexes exist (slug, collegeSlug+category)

## Implementation Order
1. Reddit scraper (Python script)
2. Update `/api/scrape/ingest` to support pending posts
3. Admin panel redesign (dashboard + college detail view)
4. Compare page fix
5. Site speed fix
6. Test end-to-end, push to GitHub
