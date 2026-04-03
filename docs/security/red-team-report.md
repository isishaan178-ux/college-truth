# Red Team Security Report -- College Sach

**Date:** 2026-04-02
**Auditor:** Red Team Agent

## Summary
- 4 P0 (Critical) findings
- 5 P1 (High) findings
- 6 P2 (Medium) findings

---

## P0 -- Critical

### [P0-1] Hardcoded MongoDB Atlas Credentials in Scrapers
**File:** `scrapers/news_scraper.py` (line 34-37), `scrapers/reddit_scraper_v2.py` (line 30-33)
**Issue:** Production MongoDB Atlas connection string with username and password is hardcoded in plain text in two scraper files.
**Impact:** Anyone with read access to the repository can connect to the production database, read all data, modify records, drop collections, or exfiltrate the entire database. The credentials (`college:truth`) are trivially weak.
**Evidence:**
```python
# news_scraper.py lines 34-37
MONGO_URI = (
    "mongodb+srv://college:truth@college-truth.rehagna.mongodb.net/"
    "college-truth?retryWrites=true&w=majority&appName=college-truth"
)
```
```python
# reddit_scraper_v2.py lines 30-33
MONGO_URI = (
    "mongodb+srv://college:truth@college-truth.rehagna.mongodb.net/"
    "college-truth?retryWrites=true&w=majority&appName=college-truth"
)
```

### [P0-2] Unauthenticated Scrape Ingest Endpoint Auto-Approves Posts
**File:** `src/app/api/scrape/ingest/route.ts` (lines 41-95)
**Issue:** The POST handler for `/api/scrape/ingest` has **zero authentication**. It accepts an array of posts and inserts them directly into the database with `verified: true` and `isApproved: true`. There is no rate limiting.
**Impact:** Any attacker can POST arbitrary content to the database, and it will immediately appear as approved, verified content on the public site. This enables mass defacement, disinformation injection, SEO spam, or injecting malicious content attributed to any college.
**Evidence:**
```typescript
// No auth check anywhere in the function
export async function POST(request: Request) {
  try {
    await connectDB()
    const body = await request.json()
    const { posts }: { posts: IngestPost[] } = body
    // ...
    await Post.create({
      // ...
      verified: true,
      isApproved: true,  // Auto-approved with no auth!
    })
```

### [P0-3] Unauthenticated Public POST on /api/posts Creates Auto-Approved Posts
**File:** `src/app/api/posts/route.ts` (lines 48-92)
**Issue:** The POST handler on `/api/posts` has no authentication. When the `source` field is set to anything other than `user_submission` (e.g., `"reddit"`), the post is created with `verified: true` and `isApproved: true`, bypassing all moderation.
**Impact:** An attacker can submit posts that appear immediately on the site as verified content by simply setting `source: "reddit"` in the request body. Combined with arbitrary `collegeName`, `content`, and `category` fields, this allows full content injection.
**Evidence:**
```typescript
export async function POST(request: Request) {
  // NO AUTH CHECK
  try {
    // ...
    const post = await Post.create({
      // ...
      verified: source !== 'user_submission',      // attacker sets source="reddit" -> verified=true
      isApproved: source !== 'user_submission',     // attacker sets source="reddit" -> approved=true
    })
```

### [P0-4] Unauthenticated PATCH on /api/submissions/[id] -- Anyone Can Approve Submissions
**File:** `src/app/api/submissions/[id]/route.ts` (lines 6-76)
**Issue:** The PATCH handler that approves or rejects user submissions has **no authentication**. Anyone who knows or guesses a submission ID can approve it, which creates a public Post and updates college stats.
**Impact:** An attacker can: (1) submit malicious content via `/api/submissions` POST, (2) immediately approve it via PATCH with the returned ID. This is a two-step full content injection bypass of any moderation workflow.
**Evidence:**
```typescript
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // NO AUTH CHECK -- anyone can approve/reject submissions
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()
    const { status, adminNote } = body
    // ...
    if (status === 'approved') {
      // Creates a Post visible on the public site
      await Post.create({ ... isApproved: true })
    }
```

---

## P1 -- High

### [P1-1] Non-Timing-Safe Token Comparison in Admin Auth
**File:** `src/lib/admin-auth.ts` (line 4)
**Issue:** The admin token is compared using JavaScript's `===` operator, which is not constant-time. This makes the authentication vulnerable to timing side-channel attacks where an attacker can progressively guess the token character by character by measuring response times.
**Impact:** An attacker can potentially recover the `ADMIN_SECRET` token by sending many requests and measuring response time differences, though this requires a low-latency network position.
**Evidence:**
```typescript
return auth.split(' ')[1] === process.env.ADMIN_SECRET
```
**Fix:** Use `crypto.timingSafeEqual()` with Buffer comparison.

### [P1-2] Duplicate Inline Auth in stats/route.ts (Inconsistent, Same Vulnerability)
**File:** `src/app/api/admin/stats/route.ts` (lines 6-11)
**Issue:** Instead of using the shared `verifyAdmin()` function, this route implements its own inline `checkAuth()` with the same timing-unsafe `===` comparison. This duplicates the vulnerability and creates maintenance risk -- if `verifyAdmin` is fixed, this route remains vulnerable.
**Impact:** Same timing attack as P1-1, plus divergent auth logic increases the chance of future auth bypass bugs.
**Evidence:**
```typescript
function checkAuth(request: Request): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token === process.env.ADMIN_SECRET  // timing-unsafe, duplicated logic
}
```

### [P1-3] Regex Injection / ReDoS in Search Endpoint
**File:** `src/app/api/search/route.ts` (line 15-17), `src/app/api/colleges/route.ts` (lines 18-19, 24)
**Issue:** User-supplied search queries are passed directly into MongoDB `$regex` without escaping special regex characters. An attacker can craft a malicious regex pattern that causes catastrophic backtracking (ReDoS), or use regex operators to extract data.
**Impact:** Denial of service via ReDoS (e.g., sending `(a+)+$` as a search query). Potential information leakage through regex-based oracle attacks.
**Evidence:**
```typescript
// search/route.ts
const colleges = await College.find({
  name: { $regex: q, $options: 'i' },  // q is raw user input, not escaped
})

// colleges/route.ts
if (search) {
  filter.name = { $regex: search, $options: 'i' }  // raw user input
}
if (state) {
  filter.state = { $regex: state, $options: 'i' }  // raw user input
}
```

### [P1-4] No Input Sanitization -- Stored XSS via Post Content
**File:** `src/app/api/scrape/ingest/route.ts`, `src/app/api/posts/route.ts`, `src/app/api/submissions/route.ts`
**Issue:** None of the POST handlers sanitize or escape HTML/JavaScript in user-supplied fields (`content`, `title`, `author`, `collegeName`). If the frontend renders this content without escaping (e.g., using `dangerouslySetInnerHTML` or a rich-text renderer), stored XSS is possible.
**Impact:** An attacker can inject `<script>` tags or event handlers into post content. When other users (including admins) view these posts, the malicious script executes in their browser, enabling session hijacking, admin token theft, or defacement.
**Evidence:**
```typescript
// posts/route.ts -- no sanitization on any field
const post = await Post.create({
  content,          // raw user input
  title: title || '',  // raw user input
  author: author || 'Anonymous',  // raw user input
  // ...
})
```

### [P1-5] NoSQL Injection via Query Parameters
**File:** `src/app/api/posts/route.ts` (lines 10-21), `src/app/api/submissions/route.ts` (lines 8-14)
**Issue:** Query parameters like `collegeSlug`, `category`, `sentiment`, `source`, and `status` are passed directly into MongoDB filter objects without validation. An attacker can send JSON objects (e.g., `collegeSlug[$ne]=null`) to inject MongoDB operators.
**Impact:** An attacker can bypass filters to access data they shouldn't see, extract all posts regardless of approval status, or enumerate data using `$regex` and `$gt` operators.
**Evidence:**
```typescript
// posts/route.ts
const filter: Record<string, any> = { isApproved: true }
if (collegeSlug) filter.collegeSlug = collegeSlug  // could be { $ne: null }
if (category) filter.category = category            // could be { $exists: true }
if (sentiment) filter.sentiment = sentiment
if (source) filter.source = source
```
Note: Express/Next.js query string parsing can convert `?collegeSlug[$ne]=x` into `{ "$ne": "x" }` depending on the query parser configuration.

---

## P2 -- Medium

### [P2-1] Error Message Leakage Across All Routes
**File:** Every API route in `src/app/api/`
**Issue:** All catch blocks return `error.message` directly to the client. MongoDB errors can leak internal details such as collection names, field names, index names, query structures, and connection strings.
**Impact:** Information disclosure that aids further attacks. For example, a duplicate key error reveals the index structure; a validation error reveals the schema.
**Evidence:**
```typescript
// This pattern appears in EVERY route:
} catch (error: any) {
  return Response.json(
    { success: false, error: error.message },  // leaks internal error details
    { status: 500 }
  )
}
```

### [P2-2] No Security Headers in next.config.ts
**File:** `next.config.ts`
**Issue:** The Next.js configuration is completely empty -- no security headers are configured. Missing headers include: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`.
**Impact:** The site is vulnerable to clickjacking (no X-Frame-Options), MIME-type sniffing attacks, and lacks CSP to mitigate XSS. No HSTS means users can be downgraded to HTTP.
**Evidence:**
```typescript
const nextConfig: NextConfig = {
  /* config options here */
};
```

### [P2-3] No Rate Limiting on Any Endpoint
**File:** All API routes
**Issue:** No rate limiting is implemented on any endpoint. The unauthenticated POST endpoints (`/api/posts`, `/api/scrape/ingest`, `/api/submissions`) are especially vulnerable.
**Impact:** An attacker can flood the database with garbage data, perform brute-force attacks against admin auth, or cause resource exhaustion (denial of service) on the MongoDB Atlas cluster.

### [P2-4] No ObjectId Validation on ID Parameters
**File:** `src/app/api/admin/posts/[id]/route.ts`, `src/app/api/admin/posts/[id]/approve/route.ts`, `src/app/api/submissions/[id]/route.ts`
**Issue:** The `id` parameter from the URL is passed directly to `findById()` / `findByIdAndUpdate()` without validating it is a valid MongoDB ObjectId. Invalid IDs cause Mongoose CastErrors that leak error details.
**Impact:** Error-based information disclosure. An attacker can probe the API with invalid IDs to confirm endpoints exist and extract error details about the database schema.
**Evidence:**
```typescript
// admin/posts/[id]/route.ts
const { id } = await params
const post = await Post.findById(id)  // no validation that id is a valid ObjectId
```

### [P2-5] Weak MongoDB Credentials
**File:** `scrapers/news_scraper.py`, `scrapers/reddit_scraper_v2.py`
**Issue:** The MongoDB credentials are `college:truth` -- an extremely weak username/password combination that could be guessed or brute-forced even without source code access.
**Impact:** If the MongoDB Atlas cluster is exposed to the internet (which Atlas clusters are by default when IP allowlisting is not strict), an attacker could guess these credentials.
**Evidence:**
```
mongodb+srv://college:truth@college-truth.rehagna.mongodb.net/
```

### [P2-6] Submissions GET Endpoint Exposes All Submissions Without Auth
**File:** `src/app/api/submissions/route.ts` (lines 4-37)
**Issue:** The GET handler for `/api/submissions` has no authentication. Anyone can enumerate all user submissions, including pending ones with author names and email addresses.
**Impact:** Privacy violation -- user emails and submission content are exposed to any unauthenticated request. An attacker can harvest email addresses and personal information.
**Evidence:**
```typescript
export async function GET(request: Request) {
  // NO AUTH CHECK
  try {
    await connectDB()
    // Returns all submissions including emails
    const [submissions, total] = await Promise.all([
      Submission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      // ...
    ])
```

---

## Additional Notes

### Config Audit
- **`.gitignore`**: Correctly excludes `.env*` files. However, the hardcoded credentials in Python scrapers make this moot -- the secrets are in tracked source files.
- **`package.json`**: Dependencies appear reasonably up-to-date. `next-auth` is listed as a dependency but does not appear to be used in any of the audited routes -- all auth is a custom Bearer token check.
- **`next.config.ts`**: Empty configuration with no security headers, no CORS restrictions, and no CSP.

### Auth Coverage Matrix

| Route | Has Auth? | Method |
|-------|-----------|--------|
| `admin/colleges` GET/POST | Yes (verifyAdmin) | Bearer token |
| `admin/colleges/[slug]/posts` GET | Yes (verifyAdmin) | Bearer token |
| `admin/posts/bulk-approve` POST | Yes (verifyAdmin) | Bearer token |
| `admin/posts/[id]/approve` PATCH | Yes (verifyAdmin) | Bearer token |
| `admin/posts/[id]` DELETE | Yes (verifyAdmin) | Bearer token |
| `admin/stats` GET | Yes (inline checkAuth) | Bearer token (duplicated logic) |
| **`scrape/ingest` POST** | **NO** | -- |
| **`submissions` GET** | **NO** | -- |
| **`submissions` POST** | **NO** | -- |
| **`submissions/[id]` PATCH** | **NO** | -- |
| **`posts` GET** | No (public, filtered) | -- |
| **`posts` POST** | **NO** | -- |
| `search` GET | No (public, read-only) | -- |
| `colleges` GET | No (public, read-only) | -- |
| `colleges/[slug]` GET | No (public, read-only) | -- |
| `colleges/[slug]/incidents` GET | No (public, read-only) | -- |
| `incidents` GET | No (public, read-only) | -- |

### Recommended Priority Actions
1. **Immediately rotate** the MongoDB credentials (`college:truth`) and move all secrets to environment variables.
2. **Add authentication** to `/api/scrape/ingest`, `/api/posts` POST, and `/api/submissions/[id]` PATCH.
3. **Add rate limiting** middleware (e.g., `express-rate-limit` equivalent for Next.js).
4. **Sanitize all user input** -- escape HTML, validate ObjectIds, escape regex special characters.
5. **Use `crypto.timingSafeEqual()`** for token comparison in `admin-auth.ts`.
6. **Add security headers** in `next.config.ts`.
7. **Replace `error.message`** with generic error messages in all catch blocks.
