"""
Reddit Scraper v2 for College Sach
Scrapes old.reddit.com directly via HTTP requests — NO API key needed.
Reads colleges from MongoDB, searches Reddit, and stores posts back to MongoDB.
"""

import hashlib
import logging
import random
import re
import time
from datetime import datetime, timezone
from typing import Any, Optional

import requests
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("reddit_scraper_v2")

# ── Configuration ────────────────────────────────────────────────────────────

MONGO_URI = (
    "mongodb+srv://college:truth@college-truth.rehagna.mongodb.net/"
    "college-truth?retryWrites=true&w=majority&appName=college-truth"
)

BASE_URL = "https://old.reddit.com"

SEARCH_VARIANTS = [
    "",
    "review experience",
    "confession truth",
    "hostel placements",
    "suicide ragging",
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
]

REQUEST_DELAY = 5  # base seconds between requests
REQUEST_JITTER = 4  # random extra seconds (0 to this value)
RATE_LIMIT_WAIT = 90  # seconds to wait on 429
MAX_RETRIES = 3
MAX_COMMENTS_PER_POST = 5
COMMENT_MIN_SCORE = 3

# ── Category Keywords ────────────────────────────────────────────────────────

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "PLACEMENTS": [
        "placement", "package", "lpa", "recruit", "hire", "offer", "ctc",
        "internship", "company", "salary", "job",
    ],
    "HOSTEL_MESS": [
        "hostel", "mess", "food", "canteen", "room", "warden", "curfew",
        "roommate", "pg", "tiffin",
    ],
    "PROFESSORS": [
        "professor", "faculty", "teaching", "lecture", "attendance",
        "syllabus", "marks", "exam", "grade", "cgpa",
    ],
    "MENTAL_HEALTH": [
        "mental", "depression", "suicide", "anxiety", "stress", "pressure",
        "counseling", "therapy", "breakdown", "lonely",
    ],
    "CAMPUS_LIFE": [
        "campus", "fest", "culture", "club", "society", "event", "party",
        "friend", "senior", "junior", "rag",
    ],
    "SPORTS": [
        "sports", "gym", "ground", "cricket", "football", "swimming",
        "fitness", "tournament", "team",
    ],
    "RESTRICTIONS": [
        "restriction", "rule", "curfew", "fine", "biometric", "permission",
        "surveillance", "gate", "lock", "ban",
    ],
    "INFRASTRUCTURE": [
        "wifi", "library", "lab", "building", "classroom", "infra",
        "renovate", "ac", "electricity", "water",
    ],
    "NEWS_CONTROVERSY": [
        "controversy", "scandal", "news", "protest", "strike", "viral",
        "media", "expose",
    ],
}

POSITIVE_WORDS = [
    "good", "great", "amazing", "best", "love", "excellent", "awesome",
    "fantastic", "helpful", "recommend", "worth", "improved", "beautiful",
]

NEGATIVE_WORDS = [
    "bad", "worst", "terrible", "horrible", "hate", "awful", "pathetic",
    "scam", "fraud", "waste", "avoid", "disgusting", "poor", "useless",
    "broken", "dirty",
]

# ── HTTP Session ─────────────────────────────────────────────────────────────


def _get_session() -> requests.Session:
    """Create a requests session with a random User-Agent."""
    session = requests.Session()
    session.headers.update({
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
    })
    return session


def _make_request(
    session: requests.Session,
    url: str,
    params: Optional[dict[str, str]] = None,
) -> Optional[dict[str, Any]]:
    """
    Make a rate-limited GET request to old.reddit.com.
    Handles 429 rate limiting with retries.
    Returns parsed JSON or None on failure.
    """
    for attempt in range(MAX_RETRIES):
        try:
            # Rotate User-Agent on each request
            session.headers["User-Agent"] = random.choice(USER_AGENTS)
            response = session.get(url, params=params, timeout=30)

            if response.status_code == 200:
                time.sleep(REQUEST_DELAY + random.uniform(0, REQUEST_JITTER))
                return response.json()
            elif response.status_code == 429:
                wait_time = RATE_LIMIT_WAIT * (attempt + 1)
                logger.warning(f"Rate limited (429). Waiting {wait_time}s before retry...")
                time.sleep(wait_time)
                continue
            elif response.status_code == 404:
                return None
            elif response.status_code == 403:
                logger.warning(f"Forbidden (403) for {url}. Skipping.")
                return None
            else:
                logger.warning(f"HTTP {response.status_code} for {url}")
                time.sleep(REQUEST_DELAY + random.uniform(0, REQUEST_JITTER))
                return None

        except requests.exceptions.Timeout:
            logger.warning(f"Timeout for {url} (attempt {attempt + 1}/{MAX_RETRIES})")
            time.sleep(REQUEST_DELAY + random.uniform(0, REQUEST_JITTER))
        except requests.exceptions.RequestException as e:
            logger.warning(f"Request error for {url}: {e}")
            time.sleep(REQUEST_DELAY + random.uniform(0, REQUEST_JITTER))
            return None
        except ValueError:
            logger.warning(f"Invalid JSON response from {url}")
            return None

    logger.error(f"Failed after {MAX_RETRIES} retries: {url}")
    return None


# ── Content Hashing ──────────────────────────────────────────────────────────


def _hash_content(content: str) -> str:
    """Generate SHA256 hash of content for deduplication."""
    return hashlib.sha256(content.strip().encode("utf-8")).hexdigest()


# ── Classification ───────────────────────────────────────────────────────────


def classify_category(text: str) -> str:
    """Classify text into a category based on keyword hit count."""
    text_lower = text.lower()
    scores: dict[str, int] = {}

    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[category] = score

    if not scores:
        return "CAMPUS_LIFE"

    return max(scores, key=lambda k: scores[k])


def detect_sentiment(text: str) -> str:
    """Simple sentiment detection using keyword counting."""
    text_lower = text.lower()
    pos = sum(1 for w in POSITIVE_WORDS if w in text_lower)
    neg = sum(1 for w in NEGATIVE_WORDS if w in text_lower)

    if pos > neg:
        return "POSITIVE"
    elif neg > pos:
        return "NEGATIVE"
    return "NEUTRAL"


# ── MongoDB ──────────────────────────────────────────────────────────────────


def connect_to_mongodb() -> tuple[Any, Any, Any]:
    """Connect to MongoDB Atlas and return (client, colleges_collection, posts_collection)."""
    logger.info("Connecting to MongoDB Atlas...")
    client = MongoClient(MONGO_URI)

    # Verify connection
    try:
        client.admin.command("ping")
        logger.info("MongoDB connection successful.")
    except ConnectionFailure:
        logger.error("Failed to connect to MongoDB Atlas.")
        raise

    db = client["college-truth"]
    return client, db["colleges"], db["posts"]


def get_colleges(colleges_col: Any) -> list[dict[str, str]]:
    """Fetch all colleges with their name and slug."""
    colleges = []
    for doc in colleges_col.find({}, {"name": 1, "slug": 1, "_id": 1}):
        name = doc.get("name", "")
        slug = doc.get("slug", "")
        if name and slug:
            colleges.append({"name": name, "slug": slug, "_id": doc["_id"]})
    logger.info(f"Loaded {len(colleges)} colleges from MongoDB.")
    return colleges


def content_hash_exists(posts_col: Any, content_hash: str) -> bool:
    """Check if a post with this content hash already exists."""
    return posts_col.find_one({"contentHash": content_hash}) is not None


def insert_post(posts_col: Any, post: dict[str, Any]) -> bool:
    """Insert a post into MongoDB. Returns True if inserted, False if duplicate."""
    try:
        posts_col.insert_one(post)
        return True
    except DuplicateKeyError:
        return False
    except Exception as e:
        logger.warning(f"Error inserting post: {e}")
        return False


# ── Reddit Scraping ──────────────────────────────────────────────────────────


def search_reddit(
    session: requests.Session,
    query: str,
) -> list[dict[str, Any]]:
    """Search all of Reddit for a query string. Returns list of post data dicts."""
    url = f"{BASE_URL}/search.json"
    params = {
        "q": query,
        "sort": "relevance",
        "t": "all",
        "limit": "100",
    }
    data = _make_request(session, url, params)
    if not data:
        return []

    posts = []
    try:
        children = data.get("data", {}).get("children", [])
        for child in children:
            if child.get("kind") == "t3":
                posts.append(child.get("data", {}))
    except (AttributeError, TypeError):
        pass

    return posts


def fetch_subreddit_posts(
    session: requests.Session,
    subreddit: str,
    sort: str = "top",
) -> list[dict[str, Any]]:
    """Fetch posts from a subreddit listing (top/hot/new)."""
    if sort == "top":
        url = f"{BASE_URL}/r/{subreddit}/top.json"
        params = {"t": "all", "limit": "100"}
    else:
        url = f"{BASE_URL}/r/{subreddit}/{sort}.json"
        params = {"limit": "100"}

    data = _make_request(session, url, params)
    if not data:
        return []

    posts = []
    try:
        children = data.get("data", {}).get("children", [])
        for child in children:
            if child.get("kind") == "t3":
                posts.append(child.get("data", {}))
    except (AttributeError, TypeError):
        pass

    return posts


def check_subreddit_exists(session: requests.Session, subreddit: str) -> bool:
    """Check if a subreddit exists by requesting its JSON endpoint."""
    url = f"{BASE_URL}/r/{subreddit}.json"
    data = _make_request(session, url, {"limit": "1"})
    return data is not None


def fetch_post_comments(
    session: requests.Session,
    permalink: str,
) -> list[dict[str, Any]]:
    """Fetch top comments for a post by its permalink."""
    url = f"{BASE_URL}{permalink}.json"
    params = {"limit": str(MAX_COMMENTS_PER_POST), "sort": "top"}
    data = _make_request(session, url, params)
    if not data or not isinstance(data, list) or len(data) < 2:
        return []

    comments = []
    try:
        comment_listing = data[1].get("data", {}).get("children", [])
        for child in comment_listing[:MAX_COMMENTS_PER_POST]:
            if child.get("kind") == "t1":
                cdata = child.get("data", {})
                score = cdata.get("score", 0)
                if score >= COMMENT_MIN_SCORE:
                    comments.append(cdata)
    except (AttributeError, TypeError, IndexError):
        pass

    return comments


def _generate_subreddit_variants(slug: str, name: str) -> list[str]:
    """Generate possible subreddit name variants for a college."""
    variants = set()

    # Direct slug
    variants.add(slug)

    # Remove hyphens
    variants.add(slug.replace("-", ""))

    # Common suffixes
    for suffix in ["confessions", "memes", "students"]:
        variants.add(f"{slug.replace('-', '')}{suffix}")
        variants.add(f"{slug}{suffix}")

    # Build abbreviation from name (e.g., "IIT Bombay" -> "iitb", "iitbombay")
    parts = name.lower().split()
    if len(parts) >= 2:
        abbrev = "".join(p[0] for p in parts)
        variants.add(abbrev)
        # First part + first letter of second (common pattern like "iitb")
        variants.add(parts[0] + parts[1][0])
        # Joined name
        variants.add("".join(parts))

    # Filter out very short or very long variants
    return [v for v in variants if 2 < len(v) < 30]


# ── Post Processing ──────────────────────────────────────────────────────────


def process_reddit_post(
    post_data: dict[str, Any],
    college: dict[str, str],
) -> Optional[dict[str, Any]]:
    """Convert raw Reddit post data into our MongoDB document format."""
    title = post_data.get("title", "").strip()
    selftext = post_data.get("selftext", "").strip()
    permalink = post_data.get("permalink", "")

    content = selftext if selftext else title
    if not content:
        return None

    full_text = f"{title} {selftext}"
    content_hash = _hash_content(f"{title}|{selftext}")

    created_utc = post_data.get("created_utc", 0)
    created_at = (
        datetime.fromtimestamp(created_utc, tz=timezone.utc)
        if created_utc
        else datetime.now(timezone.utc)
    )

    return {
        "collegeId": college["_id"],
        "collegeName": college["name"],
        "collegeSlug": college["slug"],
        "title": title[:300],
        "content": content[:5000],
        "category": classify_category(full_text),
        "sentiment": detect_sentiment(full_text),
        "source": "reddit",
        "sourceUrl": f"https://old.reddit.com{permalink}" if permalink else "",
        "author": post_data.get("author", "[deleted]") or "[deleted]",
        "upvotes": post_data.get("score", 0),
        "subreddit": post_data.get("subreddit", ""),
        "contentHash": content_hash,
        "isApproved": False,
        "verified": False,
        "createdAt": created_at,
        "scrapedAt": datetime.now(timezone.utc),
    }


def process_comment_as_post(
    comment_data: dict[str, Any],
    college: dict[str, str],
    parent_title: str,
) -> Optional[dict[str, Any]]:
    """Convert a high-scoring Reddit comment into its own post entry."""
    body = comment_data.get("body", "").strip()
    if not body or body == "[deleted]" or body == "[removed]":
        return None

    content_hash = _hash_content(body)
    permalink = comment_data.get("permalink", "")

    created_utc = comment_data.get("created_utc", 0)
    created_at = (
        datetime.fromtimestamp(created_utc, tz=timezone.utc)
        if created_utc
        else datetime.now(timezone.utc)
    )

    return {
        "collegeId": college["_id"],
        "collegeName": college["name"],
        "collegeSlug": college["slug"],
        "title": f"Re: {parent_title[:280]}",
        "content": body[:5000],
        "category": classify_category(body),
        "sentiment": detect_sentiment(body),
        "source": "reddit",
        "sourceUrl": f"https://old.reddit.com{permalink}" if permalink else "",
        "author": comment_data.get("author", "[deleted]") or "[deleted]",
        "upvotes": comment_data.get("score", 0),
        "subreddit": comment_data.get("subreddit", ""),
        "contentHash": content_hash,
        "isApproved": False,
        "verified": False,
        "createdAt": created_at,
        "scrapedAt": datetime.now(timezone.utc),
    }


# ── Main Scraper ─────────────────────────────────────────────────────────────


def scrape_college(
    session: requests.Session,
    posts_col: Any,
    college: dict[str, str],
    existing_hashes: set[str],
) -> tuple[int, int, int]:
    """
    Scrape Reddit for a single college.
    Returns (total_found, new_inserted, duplicates_skipped).
    """
    total_found = 0
    new_inserted = 0
    duplicates_skipped = 0
    seen_ids: set[str] = set()  # Track Reddit post IDs to avoid processing dupes within a run

    def _process_posts(raw_posts: list[dict[str, Any]]) -> None:
        nonlocal total_found, new_inserted, duplicates_skipped

        for post_data in raw_posts:
            post_id = post_data.get("id", "")
            if post_id in seen_ids:
                continue
            seen_ids.add(post_id)

            total_found += 1
            doc = process_reddit_post(post_data, college)
            if not doc:
                continue

            # Deduplication check
            if doc["contentHash"] in existing_hashes:
                duplicates_skipped += 1
                continue

            if insert_post(posts_col, doc):
                existing_hashes.add(doc["contentHash"])
                new_inserted += 1
            else:
                duplicates_skipped += 1

            # Fetch and process top comments
            permalink = post_data.get("permalink", "")
            if permalink and post_data.get("num_comments", 0) > 0:
                comments = fetch_post_comments(session, permalink)
                for cdata in comments:
                    comment_doc = process_comment_as_post(
                        cdata, college, post_data.get("title", "")
                    )
                    if not comment_doc:
                        continue

                    total_found += 1
                    if comment_doc["contentHash"] in existing_hashes:
                        duplicates_skipped += 1
                        continue

                    if insert_post(posts_col, comment_doc):
                        existing_hashes.add(comment_doc["contentHash"])
                        new_inserted += 1
                    else:
                        duplicates_skipped += 1

    # ── Step 1: Search all of Reddit with keyword variants ───────────────
    college_name = college["name"]
    for variant in SEARCH_VARIANTS:
        if variant:
            query = f'"{college_name}" {variant}'
        else:
            query = f'"{college_name}"'

        logger.info(f"  Searching: {query}")
        posts = search_reddit(session, query)
        _process_posts(posts)

    # ── Step 2: Auto-discover college-specific subreddits ────────────────
    subreddit_variants = _generate_subreddit_variants(college["slug"], college_name)
    for sub_name in subreddit_variants:
        logger.info(f"  Checking subreddit: r/{sub_name}")
        if check_subreddit_exists(session, sub_name):
            logger.info(f"  Found subreddit r/{sub_name} — crawling...")
            for sort in ["top", "hot", "new"]:
                posts = fetch_subreddit_posts(session, sub_name, sort)
                _process_posts(posts)
        # Delay even for 404s to avoid detection
        time.sleep(REQUEST_DELAY + random.uniform(0, REQUEST_JITTER))

    return total_found, new_inserted, duplicates_skipped


def main() -> None:
    """Main entry point for the Reddit scraper."""
    logger.info("=" * 60)
    logger.info("College Sach — Reddit Scraper v2 (No API)")
    logger.info("=" * 60)

    # Connect to MongoDB
    client, colleges_col, posts_col = connect_to_mongodb()

    # Ensure index on contentHash for fast dedup lookups
    posts_col.create_index("contentHash", unique=True, sparse=True)

    # Migrate old posts: rename 'college' -> 'collegeId', 'score' -> 'upvotes'
    migrated = posts_col.update_many(
        {"college": {"$exists": True}},
        {"$rename": {"college": "collegeId"}},
    )
    if migrated.modified_count > 0:
        logger.info(f"Migrated {migrated.modified_count} posts: college -> collegeId")
    migrated2 = posts_col.update_many(
        {"score": {"$exists": True}},
        {"$rename": {"score": "upvotes"}},
    )
    if migrated2.modified_count > 0:
        logger.info(f"Migrated {migrated2.modified_count} posts: score -> upvotes")

    try:
        # Load colleges
        colleges = get_colleges(colleges_col)
        if not colleges:
            logger.error("No colleges found in MongoDB. Exiting.")
            return

        # Pre-load existing content hashes for fast deduplication
        logger.info("Loading existing content hashes for deduplication...")
        existing_hashes: set[str] = set()
        for doc in posts_col.find({"contentHash": {"$exists": True}}, {"contentHash": 1}):
            h = doc.get("contentHash")
            if h:
                existing_hashes.add(h)
        logger.info(f"Loaded {len(existing_hashes)} existing hashes.")

        # Create HTTP session
        session = _get_session()

        # Stats
        grand_total = 0
        grand_new = 0
        grand_dupes = 0

        # Scrape each college
        for i, college in enumerate(colleges, 1):
            logger.info("-" * 50)
            logger.info(f"[{i}/{len(colleges)}] Scraping: {college['name']} ({college['slug']})")
            logger.info("-" * 50)

            try:
                found, new, dupes = scrape_college(session, posts_col, college, existing_hashes)
                grand_total += found
                grand_new += new
                grand_dupes += dupes

                logger.info(
                    f"  >> {college['name']}: {found} found, "
                    f"{new} new, {dupes} duplicates skipped"
                )
            except Exception as e:
                logger.error(f"Error scraping {college['name']}: {e}")
                continue

        # Final summary
        logger.info("=" * 60)
        logger.info("SCRAPING COMPLETE — SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Total posts found:        {grand_total}")
        logger.info(f"Total new posts inserted:  {grand_new}")
        logger.info(f"Total duplicates skipped:  {grand_dupes}")
        logger.info("=" * 60)

    finally:
        client.close()
        logger.info("MongoDB connection closed.")


if __name__ == "__main__":
    main()
