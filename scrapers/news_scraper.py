"""
News Scraper for College Sach
Searches Google for verified news articles about student suicides and deaths
at Indian colleges. Reads colleges from MongoDB, parses Google search results,
and stores incidents back to MongoDB.
"""

import hashlib
import logging
import os
import random
import re
import sys
import time
from datetime import datetime, timezone
from typing import Any, Optional
from urllib.parse import unquote, urlparse

import requests
from bs4 import BeautifulSoup
from ddgs import DDGS
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("news_scraper")

# ── Configuration ────────────────────────────────────────────────────────────

MONGO_URI = os.environ.get("MONGO_URI", "")
if not MONGO_URI:
    print("ERROR: MONGO_URI environment variable is not set. Exiting.")
    sys.exit(1)

DDG_SEARCH_URL = "https://lite.duckduckgo.com/lite/"

# Search query templates — {college} is replaced with the college name
SEARCH_TEMPLATES = [
    '{college} student suicide',
    '{college} student death',
    '{college} student died',
    '{college} student suicide news india',
    '{college} student death news india',
    '{college} ragging death',
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 OPR/108.0.0.0",
]

REQUEST_DELAY = 5       # base seconds between Google requests
REQUEST_JITTER = 3      # random extra seconds (0 to this value)
RATE_LIMIT_WAIT = 60    # seconds to wait if rate-limited
MAX_RETRIES = 3
MAX_RESULTS_PER_QUERY = 20  # Google results per page (num param)

# Known news source domains -> display names
NEWS_SOURCE_MAP = {
    "ndtv.com": "NDTV",
    "timesofindia.indiatimes.com": "Times of India",
    "indianexpress.com": "Indian Express",
    "thehindu.com": "The Hindu",
    "hindustantimes.com": "Hindustan Times",
    "news18.com": "News18",
    "livemint.com": "Mint",
    "scroll.in": "Scroll.in",
    "thequint.com": "The Quint",
    "deccanherald.com": "Deccan Herald",
    "telegraphindia.com": "The Telegraph",
    "firstpost.com": "Firstpost",
    "theprint.in": "The Print",
    "thewire.in": "The Wire",
    "bbc.com": "BBC",
    "bbc.co.uk": "BBC",
    "reuters.com": "Reuters",
    "economictimes.indiatimes.com": "Economic Times",
    "moneycontrol.com": "Moneycontrol",
    "outlookindia.com": "Outlook India",
    "indiatoday.in": "India Today",
    "aninews.in": "ANI",
    "ptinews.com": "PTI",
    "wionews.com": "WION",
    "dnaindia.com": "DNA India",
    "mid-day.com": "Mid-Day",
    "mumbaimirror.indiatimes.com": "Mumbai Mirror",
    "newindianexpress.com": "New Indian Express",
    "tribuneindia.com": "Tribune India",
    "freepressjournal.in": "Free Press Journal",
}

# Keywords to classify incident type
SUICIDE_KEYWORDS = [
    "suicide", "hanged", "hanging", "jumped", "jump", "self-harm",
    "took own life", "ended life", "killed himself", "killed herself",
    "found dead in hostel", "found hanging", "poisoned himself",
    "poisoned herself", "consumed poison", "slit wrist",
]
DEATH_KEYWORDS = [
    "death", "died", "dead", "demise", "killed", "accident",
    "ragging", "murdered", "drowned", "electrocuted", "collapsed",
    "fatal", "body found", "passed away",
]

# ── HTTP Session ─────────────────────────────────────────────────────────────


def _get_session() -> requests.Session:
    """Create a requests session with browser-like headers."""
    session = requests.Session()
    session.headers.update({
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    })
    return session


def _ddg_search(query: str, max_results: int = 15) -> list[dict[str, Any]]:
    """
    Search DuckDuckGo using the ddgs package.
    Returns list of {title, url, snippet, date_text}.
    """
    results = []
    for attempt in range(MAX_RETRIES):
        try:
            raw = DDGS().text(query, max_results=max_results)
            for r in raw:
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("href", ""),
                    "snippet": r.get("body", ""),
                    "date_text": "",
                })
            return results
        except Exception as e:
            logger.warning(f"DDG search error (attempt {attempt + 1}): {e}")
            time.sleep(REQUEST_DELAY * (attempt + 1))

    return results


def _extract_source_name(url: str) -> str:
    """Extract a human-readable news source name from a URL."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        # Remove www.
        if domain.startswith("www."):
            domain = domain[4:]

        # Check known sources
        for known_domain, name in NEWS_SOURCE_MAP.items():
            if known_domain in domain:
                return name

        # Fallback: use domain
        return domain
    except Exception:
        return "Unknown"


def _classify_incident_type(title: str, snippet: str) -> str:
    """Classify whether the incident is a suicide or general death."""
    combined = (title + " " + snippet).lower()

    for kw in SUICIDE_KEYWORDS:
        if kw in combined:
            return "suicide"

    for kw in DEATH_KEYWORDS:
        if kw in combined:
            return "death"

    return "death"  # default


def _extract_date_from_text(text: str) -> Optional[datetime]:
    """
    Try to extract a date from snippet text.
    Handles common patterns found in Google snippets and news articles.
    """
    text_lower = text.lower().strip()

    # Pattern: "Jan 15, 2024" or "January 15, 2024"
    match = re.search(
        r"(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|"
        r"Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|"
        r"Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})",
        text, re.IGNORECASE,
    )
    if match:
        try:
            return datetime.strptime(
                f"{match.group(1)} {match.group(2)} {match.group(3)}",
                "%b %d %Y" if len(match.group(1)) == 3 else "%B %d %Y",
            ).replace(tzinfo=timezone.utc)
        except ValueError:
            pass

    # Pattern: "15 Jan 2024" or "15 January 2024"
    match = re.search(
        r"(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|"
        r"Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|"
        r"Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})",
        text, re.IGNORECASE,
    )
    if match:
        try:
            return datetime.strptime(
                f"{match.group(1)} {match.group(2)} {match.group(3)}",
                "%d %b %Y" if len(match.group(2)) == 3 else "%d %B %Y",
            ).replace(tzinfo=timezone.utc)
        except ValueError:
            pass

    # Pattern: "2024-01-15" (ISO)
    match = re.search(r"(\d{4})-(\d{2})-(\d{2})", text)
    if match:
        try:
            return datetime(
                int(match.group(1)), int(match.group(2)), int(match.group(3)),
                tzinfo=timezone.utc,
            )
        except ValueError:
            pass

    # Pattern: "15/01/2024" or "15-01-2024" (DD/MM/YYYY)
    match = re.search(r"(\d{1,2})[/-](\d{1,2})[/-](\d{4})", text)
    if match:
        try:
            day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
            if 1 <= month <= 12 and 1 <= day <= 31:
                return datetime(year, month, day, tzinfo=timezone.utc)
        except ValueError:
            pass

    # Google snippet date prefix: "3 days ago", "2 hours ago", etc.
    match = re.search(r"(\d+)\s+(day|hour|minute|week|month)s?\s+ago", text_lower)
    if match:
        # We can't compute exact dates reliably, so skip these
        pass

    return None


# parse_google_results removed — using DuckDuckGo lite instead


# ── Content Hashing ──────────────────────────────────────────────────────────


def _hash_content(url: str, title: str) -> str:
    """Generate SHA256 hash from URL + title for deduplication."""
    content = f"{url.strip()}|{title.strip()}".lower()
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


# ── MongoDB ──────────────────────────────────────────────────────────────────


def connect_to_mongodb():
    """Connect to MongoDB Atlas and return (client, colleges_col, incidents_col)."""
    logger.info("Connecting to MongoDB Atlas...")

    # Use Google DNS to resolve SRV records (avoids local DNS timeout issues)
    import dns.resolver
    dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
    dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4']

    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=30000)

    try:
        client.admin.command("ping")
        logger.info("MongoDB connection successful.")
    except ConnectionFailure:
        logger.error("Failed to connect to MongoDB Atlas.")
        raise

    db = client["college-truth"]
    return client, db["colleges"], db["incidents"]


def get_colleges(colleges_col, slug_filter: str = "") -> list[dict[str, Any]]:
    """Fetch colleges with their name, slug, and _id. Optionally filter by slug."""
    query = {"slug": slug_filter} if slug_filter else {}
    colleges = []
    for doc in colleges_col.find(query, {"name": 1, "slug": 1, "_id": 1}):
        name = doc.get("name", "")
        slug = doc.get("slug", "")
        if name and slug:
            colleges.append({"name": name, "slug": slug, "_id": doc["_id"]})
    logger.info(f"Loaded {len(colleges)} colleges from MongoDB." + (f" (filter: {slug_filter})" if slug_filter else ""))
    return colleges


def insert_incident(incidents_col, incident: dict[str, Any]) -> bool:
    """Insert an incident into MongoDB. Returns True if inserted, False if duplicate."""
    try:
        incidents_col.insert_one(incident)
        return True
    except DuplicateKeyError:
        return False
    except Exception as e:
        logger.warning(f"Error inserting incident: {e}")
        return False


# ── Scraping Logic ───────────────────────────────────────────────────────────


def _is_relevant_result(title: str, snippet: str, college_name: str) -> bool:
    """Check if a search result is actually relevant to the college and topic."""
    combined = (title + " " + snippet).lower()
    college_lower = college_name.lower()

    # Must mention something related to the college
    # Check for college name or its key parts
    name_parts = college_lower.split()
    college_mentioned = False

    if college_lower in combined:
        college_mentioned = True
    else:
        # Check if significant parts of the name appear (at least 2 words)
        matching_parts = sum(1 for p in name_parts if len(p) > 2 and p in combined)
        if matching_parts >= 2:
            college_mentioned = True

    if not college_mentioned:
        return False

    # Must mention death or suicide related keywords
    all_keywords = SUICIDE_KEYWORDS + DEATH_KEYWORDS
    topic_relevant = any(kw in combined for kw in all_keywords)

    return topic_relevant


def scrape_college_news(
    session: requests.Session,
    incidents_col,
    college: dict[str, Any],
    existing_hashes: set[str],
) -> tuple[int, int, int]:
    """
    Search Google for news about incidents at a single college.
    Returns (total_found, new_inserted, duplicates_skipped).
    """
    total_found = 0
    new_inserted = 0
    duplicates_skipped = 0
    seen_urls: set[str] = set()  # avoid processing same URL twice within a run

    college_name = college["name"]
    college_slug = college["slug"]
    college_id = college["_id"]

    def _process_results(results: list[dict[str, Any]], query: str) -> None:
        nonlocal total_found, new_inserted, duplicates_skipped

        for result in results:
            title = result["title"]
            snippet = result["snippet"]
            url = result["url"]
            date_text = result.get("date_text", "")

            # Skip already-seen URLs this run
            if url in seen_urls:
                continue
            seen_urls.add(url)

            # Relevance check
            if not _is_relevant_result(title, snippet, college_name):
                continue

            total_found += 1

            # Content hash for dedup
            content_hash = _hash_content(url, title)
            if content_hash in existing_hashes:
                duplicates_skipped += 1
                continue

            # Classify type
            incident_type = _classify_incident_type(title, snippet)

            # Extract date
            incident_date = None
            if date_text:
                incident_date = _extract_date_from_text(date_text)
            if not incident_date:
                incident_date = _extract_date_from_text(title + " " + snippet)

            # Extract source name
            source_name = _extract_source_name(url)

            # Build document
            doc = {
                "collegeId": college_id,
                "collegeName": college_name,
                "collegeSlug": college_slug,
                "title": title,
                "content": snippet,
                "source": "news",
                "sourceName": source_name,
                "sourceUrl": url,
                "date": incident_date,
                "verified": True,
                "type": incident_type,
                "contentHash": content_hash,
                "scrapedAt": datetime.now(timezone.utc),
                "searchQuery": query,
            }

            if insert_incident(incidents_col, doc):
                existing_hashes.add(content_hash)
                new_inserted += 1
                logger.info(
                    f"    + NEW [{incident_type}] {source_name}: {title[:80]}..."
                    if len(title) > 80 else
                    f"    + NEW [{incident_type}] {source_name}: {title}"
                )
            else:
                duplicates_skipped += 1

    # ── Search DuckDuckGo for each query template ──────────────────────
    for template in SEARCH_TEMPLATES:
        query = template.format(college=college_name)
        logger.info(f"  Searching: {query}")

        results = _ddg_search(query)
        logger.info(f"    Found {len(results)} raw results")
        _process_results(results, query)

        # Rate limiting with jitter
        delay = REQUEST_DELAY + random.uniform(0, REQUEST_JITTER)
        time.sleep(delay)

    return total_found, new_inserted, duplicates_skipped


# ── Main ─────────────────────────────────────────────────────────────────────


def main() -> None:
    """Main entry point for the news scraper."""
    logger.info("=" * 60)
    logger.info("College Sach -- News Incident Scraper")
    logger.info("=" * 60)

    # Connect to MongoDB
    client, colleges_col, incidents_col = connect_to_mongodb()

    # Ensure index on contentHash for fast dedup
    incidents_col.create_index("contentHash", unique=True, sparse=True)
    # Additional useful indexes
    incidents_col.create_index("collegeId")
    incidents_col.create_index("type")
    incidents_col.create_index("source")

    # Parse --college argument
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--college", default="", help="Slug of a specific college to scrape")
    args = parser.parse_args()

    try:
        # Load colleges
        colleges = get_colleges(colleges_col, slug_filter=args.college)
        if not colleges:
            logger.error("No colleges found in MongoDB." + (f" (slug: {args.college})" if args.college else ""))
            return

        # Pre-load existing content hashes for fast deduplication
        logger.info("Loading existing content hashes for deduplication...")
        existing_hashes: set[str] = set()
        for doc in incidents_col.find(
            {"contentHash": {"$exists": True}}, {"contentHash": 1}
        ):
            h = doc.get("contentHash")
            if h:
                existing_hashes.add(h)
        logger.info(f"Loaded {len(existing_hashes)} existing hashes.")

        # Create HTTP session
        session = _get_session()

        # Per-college stats for summary
        college_stats: list[dict[str, Any]] = []
        grand_total = 0
        grand_new = 0
        grand_dupes = 0

        # Scrape each college
        for i, college in enumerate(colleges, 1):
            logger.info("-" * 50)
            logger.info(
                f"[{i}/{len(colleges)}] Scraping news for: "
                f"{college['name']} ({college['slug']})"
            )
            logger.info("-" * 50)

            try:
                found, new, dupes = scrape_college_news(
                    session, incidents_col, college, existing_hashes
                )
                grand_total += found
                grand_new += new
                grand_dupes += dupes

                college_stats.append({
                    "name": college["name"],
                    "found": found,
                    "new": new,
                    "dupes": dupes,
                })

                logger.info(
                    f"  >> {college['name']}: {found} found, "
                    f"{new} new, {dupes} duplicates skipped"
                )
            except Exception as e:
                logger.error(f"Error scraping news for {college['name']}: {e}")
                college_stats.append({
                    "name": college["name"],
                    "found": 0,
                    "new": 0,
                    "dupes": 0,
                    "error": str(e),
                })
                continue

        # ── Final Summary ────────────────────────────────────────────────
        logger.info("")
        logger.info("=" * 60)
        logger.info("SCRAPING COMPLETE -- SUMMARY")
        logger.info("=" * 60)
        logger.info("")

        # Per-college breakdown
        logger.info(f"{'College':<40} {'Found':>6} {'New':>6} {'Dupes':>6}")
        logger.info("-" * 60)
        for stat in college_stats:
            error_flag = " (ERROR)" if "error" in stat else ""
            logger.info(
                f"{stat['name'][:40]:<40} {stat['found']:>6} "
                f"{stat['new']:>6} {stat['dupes']:>6}{error_flag}"
            )
        logger.info("-" * 60)
        logger.info(
            f"{'TOTAL':<40} {grand_total:>6} {grand_new:>6} {grand_dupes:>6}"
        )
        logger.info("")
        logger.info(f"Total incidents found:        {grand_total}")
        logger.info(f"Total new incidents inserted:  {grand_new}")
        logger.info(f"Total duplicates skipped:      {grand_dupes}")
        logger.info("=" * 60)

    finally:
        client.close()
        logger.info("MongoDB connection closed.")


if __name__ == "__main__":
    main()
