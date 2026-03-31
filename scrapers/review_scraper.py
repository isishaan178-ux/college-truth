"""
Review Scraper for College Sach
Scrapes student reviews from CollegeDunia and Shiksha.
"""

import os
import re
import time
import logging
import requests
from typing import Optional
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("review_scraper")

# ── Configuration ────────────────────────────────────────────────────────────

API_BASE = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
INGEST_URL = f"{API_BASE}/api/scrape/ingest"
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# Mapping of college names to their CollegeDunia and Shiksha slugs
COLLEGES = {
    "IIT Bombay": {
        "collegedunia": "iit-bombay",
        "shiksha": "iit-bombay",
    },
    "IIT Delhi": {
        "collegedunia": "iit-delhi",
        "shiksha": "iit-delhi",
    },
    "IIT Madras": {
        "collegedunia": "iit-madras",
        "shiksha": "iit-madras",
    },
    "IIT Kanpur": {
        "collegedunia": "iit-kanpur",
        "shiksha": "iit-kanpur",
    },
    "IIT Kharagpur": {
        "collegedunia": "iit-kharagpur",
        "shiksha": "iit-kharagpur",
    },
    "BITS Pilani": {
        "collegedunia": "bits-pilani",
        "shiksha": "bits-pilani",
    },
    "NIT Trichy": {
        "collegedunia": "nit-trichy",
        "shiksha": "nit-trichy",
    },
    "NIT Warangal": {
        "collegedunia": "nit-warangal",
        "shiksha": "nit-warangal",
    },
    "NIT Surathkal": {
        "collegedunia": "nit-surathkal",
        "shiksha": "nit-surathkal",
    },
    "VIT Vellore": {
        "collegedunia": "vit-vellore",
        "shiksha": "vit-vellore",
    },
    "SRM": {
        "collegedunia": "srm-institute-of-science-and-technology-chennai",
        "shiksha": "srm-university-chennai",
    },
    "Manipal": {
        "collegedunia": "manipal-institute-of-technology-manipal",
        "shiksha": "manipal-institute-of-technology-mit-manipal",
    },
    "DTU": {
        "collegedunia": "delhi-technological-university-delhi",
        "shiksha": "dtu-delhi",
    },
    "NSUT": {
        "collegedunia": "netaji-subhas-university-of-technology-delhi",
        "shiksha": "nsut-delhi",
    },
    "IIIT Hyderabad": {
        "collegedunia": "iiit-hyderabad",
        "shiksha": "iiit-hyderabad",
    },
    "Thapar": {
        "collegedunia": "thapar-institute-of-engineering-and-technology-patiala",
        "shiksha": "thapar-university-patiala",
    },
    "Jadavpur University": {
        "collegedunia": "jadavpur-university-kolkata",
        "shiksha": "jadavpur-university-kolkata",
    },
    "Christ University": {
        "collegedunia": "christ-university-bangalore",
        "shiksha": "christ-university-bangalore",
    },
    "Amity University": {
        "collegedunia": "amity-university-noida",
        "shiksha": "amity-university-noida",
    },
    "LPU": {
        "collegedunia": "lovely-professional-university-jalandhar",
        "shiksha": "lovely-professional-university-jalandhar",
    },
    "KIIT": {
        "collegedunia": "kiit-university-bhubaneswar",
        "shiksha": "kiit-university-bhubaneswar",
    },
    "Chandigarh University": {
        "collegedunia": "chandigarh-university-chandigarh",
        "shiksha": "chandigarh-university-mohali",
    },
}

# ── Category Mapping ─────────────────────────────────────────────────────────

CATEGORY_KEYWORDS = {
    "PLACEMENTS": [
        "placement", "package", "ctc", "recruit", "hire", "salary",
        "internship", "job", "career", "company",
    ],
    "HOSTEL_MESS": [
        "hostel", "mess", "food", "room", "accommodation", "canteen",
        "cafeteria", "warden",
    ],
    "PROFESSORS": [
        "professor", "faculty", "teacher", "teaching", "curriculum",
        "course", "academic", "exam", "attendance",
    ],
    "CAMPUS_LIFE": [
        "campus", "fest", "club", "event", "life", "culture",
        "environment", "experience", "peer",
    ],
    "INFRASTRUCTURE": [
        "infrastructure", "lab", "library", "building", "facility",
        "wifi", "computer", "classroom",
    ],
    "SPORTS": [
        "sports", "gym", "ground", "fitness",
    ],
    "RESTRICTIONS": [
        "rules", "strict", "curfew", "dress code", "restriction",
    ],
    "MENTAL_HEALTH": [
        "stress", "pressure", "mental", "counselor", "support",
    ],
    "NEWS_CONTROVERSY": [
        "controversy", "scam", "fraud", "news", "protest",
    ],
}

POSITIVE_WORDS = [
    "great", "amazing", "excellent", "good", "love", "best", "awesome",
    "fantastic", "wonderful", "top", "recommend", "satisfied", "nice",
    "quality", "clean", "helpful",
]

NEGATIVE_WORDS = [
    "bad", "worst", "terrible", "horrible", "hate", "poor", "waste",
    "pathetic", "disgusting", "avoid", "regret", "disappointed",
    "dirty", "broken", "useless",
]


def classify_category(text: str) -> str:
    """Classify review into a category."""
    text_lower = text.lower()
    scores: dict[str, int] = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[category] = score
    if not scores:
        return "CAMPUS_LIFE"
    return max(scores, key=scores.get)  # type: ignore


def detect_sentiment(text: str) -> str:
    """Simple keyword-based sentiment detection."""
    text_lower = text.lower()
    pos = sum(1 for w in POSITIVE_WORDS if w in text_lower)
    neg = sum(1 for w in NEGATIVE_WORDS if w in text_lower)
    if pos > neg:
        return "POSITIVE"
    elif neg > pos:
        return "NEGATIVE"
    return "NEUTRAL"


def send_to_api(posts: list[dict]) -> bool:
    """Send scraped reviews to the ingest API."""
    if not posts:
        return True
    try:
        response = requests.post(
            INGEST_URL,
            json={"posts": posts},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {ADMIN_PASSWORD}",
            },
            timeout=30,
        )
        if response.status_code == 201:
            data = response.json()
            logger.info(
                f"Ingested {data.get('data', {}).get('created', 0)} reviews"
            )
            return True
        else:
            logger.error(f"API returned {response.status_code}: {response.text}")
            return False
    except requests.RequestException as e:
        logger.error(f"Failed to send to API: {e}")
        return False


# ── CollegeDunia Scraper ─────────────────────────────────────────────────────


def scrape_collegedunia(college_name: str, slug: str) -> list[dict]:
    """Scrape reviews from CollegeDunia for a single college."""
    reviews: list[dict] = []
    base_url = f"https://collegedunia.com/college/{slug}/reviews"

    for page in range(1, 4):  # Scrape up to 3 pages
        try:
            url = f"{base_url}?page={page}" if page > 1 else base_url
            logger.info(f"  CollegeDunia: {college_name} page {page}")

            response = requests.get(url, headers=HEADERS, timeout=15)
            if response.status_code != 200:
                logger.warning(f"  Got status {response.status_code} for {url}")
                break

            soup = BeautifulSoup(response.text, "lxml")

            # Find review containers
            review_cards = soup.select(".review_container, .college_review_container, [class*='review']")

            if not review_cards:
                # Try alternative selectors
                review_cards = soup.find_all("div", class_=re.compile(r"review", re.I))

            if not review_cards:
                logger.info(f"  No reviews found on page {page}, stopping")
                break

            for card in review_cards:
                try:
                    # Extract review text
                    text_el = card.select_one(
                        ".review_text, .review_content, p, [class*='content']"
                    )
                    if not text_el:
                        continue
                    review_text = text_el.get_text(strip=True)
                    if len(review_text) < 20:
                        continue

                    # Extract rating if available
                    rating_el = card.select_one(
                        ".rating, [class*='rating'], [class*='star']"
                    )
                    rating_text = rating_el.get_text(strip=True) if rating_el else ""

                    category = classify_category(review_text)
                    sentiment = detect_sentiment(review_text)

                    reviews.append({
                        "collegeName": college_name,
                        "category": category,
                        "content": review_text[:2000],
                        "source": "collegedunia",
                        "sourceUrl": url,
                        "sentiment": sentiment,
                        "title": f"Review of {college_name}",
                        "author": "CollegeDunia User",
                    })
                except Exception as e:
                    logger.warning(f"  Error parsing review card: {e}")
                    continue

            time.sleep(2)  # Rate limiting

        except requests.RequestException as e:
            logger.error(f"  Request error for {college_name}: {e}")
            break

    return reviews


# ── Shiksha Scraper ──────────────────────────────────────────────────────────


def scrape_shiksha(college_name: str, slug: str) -> list[dict]:
    """Scrape reviews from Shiksha for a single college."""
    reviews: list[dict] = []
    base_url = f"https://www.shiksha.com/college/{slug}/reviews"

    for page in range(1, 4):  # Up to 3 pages
        try:
            url = f"{base_url}?page={page}" if page > 1 else base_url
            logger.info(f"  Shiksha: {college_name} page {page}")

            response = requests.get(url, headers=HEADERS, timeout=15)
            if response.status_code != 200:
                logger.warning(f"  Got status {response.status_code} for {url}")
                break

            soup = BeautifulSoup(response.text, "lxml")

            # Find review blocks
            review_blocks = soup.select(
                ".review-block, .student-review, [class*='review'], .rev-card"
            )

            if not review_blocks:
                review_blocks = soup.find_all("div", class_=re.compile(r"review", re.I))

            if not review_blocks:
                logger.info(f"  No reviews found on page {page}, stopping")
                break

            for block in review_blocks:
                try:
                    # Extract review text
                    text_el = block.select_one(
                        ".review-text, .rev-desc, p, [class*='desc'], [class*='content']"
                    )
                    if not text_el:
                        continue
                    review_text = text_el.get_text(strip=True)
                    if len(review_text) < 20:
                        continue

                    category = classify_category(review_text)
                    sentiment = detect_sentiment(review_text)

                    reviews.append({
                        "collegeName": college_name,
                        "category": category,
                        "content": review_text[:2000],
                        "source": "shiksha",
                        "sourceUrl": url,
                        "sentiment": sentiment,
                        "title": f"Student Review - {college_name}",
                        "author": "Shiksha User",
                    })
                except Exception as e:
                    logger.warning(f"  Error parsing review block: {e}")
                    continue

            time.sleep(2)

        except requests.RequestException as e:
            logger.error(f"  Request error for {college_name}: {e}")
            break

    return reviews


# ── Main ─────────────────────────────────────────────────────────────────────


def scrape_reviews():
    """Main function to scrape all reviews."""
    total_scraped = 0
    batch: list[dict] = []
    batch_size = 25

    for college_name, slugs in COLLEGES.items():
        logger.info(f"Scraping reviews for {college_name}...")

        # CollegeDunia
        if slugs.get("collegedunia"):
            cd_reviews = scrape_collegedunia(college_name, slugs["collegedunia"])
            batch.extend(cd_reviews)
            total_scraped += len(cd_reviews)
            logger.info(f"  CollegeDunia: {len(cd_reviews)} reviews")

        # Shiksha
        if slugs.get("shiksha"):
            sh_reviews = scrape_shiksha(college_name, slugs["shiksha"])
            batch.extend(sh_reviews)
            total_scraped += len(sh_reviews)
            logger.info(f"  Shiksha: {len(sh_reviews)} reviews")

        # Send batch when full
        if len(batch) >= batch_size:
            send_to_api(batch)
            batch = []

        # Rate limiting between colleges
        time.sleep(3)

    # Send remaining
    if batch:
        send_to_api(batch)

    logger.info(f"Review scraping complete. Total reviews scraped: {total_scraped}")
    return total_scraped


if __name__ == "__main__":
    scrape_reviews()
