"""
Reddit Scraper for College Sach
Scrapes Indian college-related subreddits for posts and categorizes them.
"""

import os
import re
import time
import logging
import requests
from typing import Optional
from dotenv import load_dotenv

import praw

load_dotenv()

# ── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("reddit_scraper")

# ── Configuration ────────────────────────────────────────────────────────────

API_BASE = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
INGEST_URL = f"{API_BASE}/api/scrape/ingest"
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

SUBREDDITS = [
    "indian_academia",
    "Btechtards",
    "JEENEETards",
    "BITSPilani",
    "IITD",
    "IITBombay",
    "mumbai",
    "hyderabad",
    "chennai",
    "bangalore",
    "india",
    "IndianStudents",
    "IndiaCareers",
    "CBSE",
    "CATpreparation",
]

# Indian colleges and their common abbreviations/names
COLLEGE_NAMES = {
    "IIT Bombay": ["iit bombay", "iitb", "iit-b", "iit mumbai"],
    "IIT Delhi": ["iit delhi", "iitd", "iit-d"],
    "IIT Madras": ["iit madras", "iitm", "iit-m", "iit chennai"],
    "IIT Kanpur": ["iit kanpur", "iitk", "iit-k"],
    "IIT Kharagpur": ["iit kharagpur", "iitkgp", "iit-kgp"],
    "IIT Roorkee": ["iit roorkee", "iitr", "iit-r"],
    "IIT Guwahati": ["iit guwahati", "iitg", "iit-g"],
    "IIT Hyderabad": ["iit hyderabad", "iith", "iit-h"],
    "IIT BHU": ["iit bhu", "iit varanasi"],
    "IIT ISM Dhanbad": ["iit ism", "iit dhanbad", "ism dhanbad"],
    "IIT Indore": ["iit indore"],
    "IIT Mandi": ["iit mandi"],
    "IIT Patna": ["iit patna"],
    "IIT Jodhpur": ["iit jodhpur"],
    "IIT Tirupati": ["iit tirupati"],
    "IIT Palakkad": ["iit palakkad"],
    "IIT Goa": ["iit goa"],
    "IIT Jammu": ["iit jammu"],
    "IIT Dharwad": ["iit dharwad"],
    "IIT Bhilai": ["iit bhilai"],
    "BITS Pilani": ["bits pilani", "bits", "birla institute"],
    "BITS Goa": ["bits goa"],
    "BITS Hyderabad": ["bits hyderabad", "bits hyd"],
    "NIT Trichy": ["nit trichy", "nitt", "nit tiruchirappalli"],
    "NIT Warangal": ["nit warangal", "nitw"],
    "NIT Surathkal": ["nit surathkal", "nitk", "nit karnataka"],
    "NIT Calicut": ["nit calicut", "nitc"],
    "NIT Rourkela": ["nit rourkela", "nitr"],
    "NIT Allahabad": ["nit allahabad", "mnnit"],
    "NIT Jaipur": ["nit jaipur", "mnit"],
    "NIT Kurukshetra": ["nit kurukshetra", "nitkkr"],
    "NIT Nagpur": ["nit nagpur", "vnit"],
    "NIT Durgapur": ["nit durgapur", "nitdgp"],
    "NIT Silchar": ["nit silchar", "nits"],
    "NIT Srinagar": ["nit srinagar"],
    "NIT Hamirpur": ["nit hamirpur", "nith"],
    "DTU": ["dtu", "delhi technological university", "delhi tech"],
    "NSUT": ["nsut", "netaji subhas", "nsit"],
    "IIIT Hyderabad": ["iiit hyderabad", "iiith", "iiit-h"],
    "IIIT Delhi": ["iiit delhi", "iiitd", "iiit-d"],
    "IIIT Bangalore": ["iiit bangalore", "iiitb", "iiit-b"],
    "IIIT Allahabad": ["iiit allahabad", "iiita"],
    "VIT Vellore": ["vit vellore", "vit", "vellore institute"],
    "SRM": ["srm", "srm university", "srm institute", "srmist"],
    "Manipal": ["manipal", "manipal institute", "mit manipal", "mahe"],
    "Amity University": ["amity", "amity university", "amity noida"],
    "LPU": ["lpu", "lovely professional"],
    "Thapar": ["thapar", "thapar university", "thapar institute"],
    "Jadavpur University": ["jadavpur", "ju kolkata"],
    "Anna University": ["anna university", "anna univ"],
    "Delhi University": ["delhi university", "du", "delhi uni"],
    "Mumbai University": ["mumbai university", "mu"],
    "Pune University": ["pune university", "sppu", "savitribai phule"],
    "Christ University": ["christ university", "christ bangalore"],
    "Symbiosis": ["symbiosis", "siu", "symbiosis pune"],
    "KIIT": ["kiit", "kalinga institute"],
    "Chandigarh University": ["chandigarh university", "cu chandigarh"],
    "Shiv Nadar": ["shiv nadar", "snu"],
    "Ashoka University": ["ashoka university", "ashoka"],
    "FLAME University": ["flame university", "flame pune"],
    "Presidency University": ["presidency", "presidency kolkata"],
    "St. Xavier's": ["xaviers", "st xavier", "st. xavier"],
    "IIM Ahmedabad": ["iim ahmedabad", "iima", "iim-a"],
    "IIM Bangalore": ["iim bangalore", "iimb", "iim-b"],
    "IIM Calcutta": ["iim calcutta", "iimc", "iim-c"],
    "IIM Lucknow": ["iim lucknow", "iiml", "iim-l"],
    "IIM Kozhikode": ["iim kozhikode", "iimk", "iim-k"],
    "IIM Indore": ["iim indore", "iimi"],
    "ISB Hyderabad": ["isb", "indian school of business"],
    "XLRI": ["xlri", "xlri jamshedpur"],
    "FMS Delhi": ["fms delhi", "fms", "faculty of management studies"],
    "JBIMS": ["jbims", "jamnalal bajaj"],
    "AIIMS Delhi": ["aiims delhi", "aiims"],
    "MAMC": ["mamc", "maulana azad medical"],
    "CMC Vellore": ["cmc vellore", "christian medical college"],
    "AFMC Pune": ["afmc", "armed forces medical"],
    "ILS Pune": ["ils pune", "indian law society"],
    "NLU Delhi": ["nlu delhi", "nlud", "national law university delhi"],
    "NLSIU Bangalore": ["nlsiu", "national law school"],
    "NALSAR Hyderabad": ["nalsar", "nalsar hyderabad"],
}

# ── Category Keywords ────────────────────────────────────────────────────────

CATEGORY_KEYWORDS = {
    "PLACEMENTS": [
        "placement", "package", "ctc", "offer", "recruit", "hire", "company",
        "tcs", "infosys", "wipro", "google", "microsoft", "amazon", "lpa",
        "salary", "internship", "placed", "onsite", "offsite", "ppo",
        "dream company", "mass recruit", "superdream", "median package",
        "average package", "highest package",
    ],
    "HOSTEL_MESS": [
        "hostel", "mess", "food", "room", "wifi", "water", "laundry",
        "canteen", "warden", "roommate", "sharing", "single room",
        "triple sharing", "mess food", "hygiene", "cockroach", "rat",
        "cleanliness", "washing machine",
    ],
    "PROFESSORS": [
        "professor", "faculty", "teacher", "hod", "attendance", "marks",
        "internal", "grades", "cgpa", "sgpa", "relative grading", "lecture",
        "teaching", "class", "viva", "practical", "exam", "midsem",
        "endsem", "backlog", "kt",
    ],
    "MENTAL_HEALTH": [
        "suicide", "depression", "anxiety", "stress", "pressure",
        "mental health", "counselor", "dropout", "ragging", "bullying",
        "therapy", "burnout", "lonely", "isolation", "help", "panic",
        "overwhelm",
    ],
    "CAMPUS_LIFE": [
        "fest", "cultural", "club", "society", "campus", "event",
        "freshers", "farewell", "techfest", "literary", "dance", "music",
        "drama", "dj night", "college life", "experience",
    ],
    "SPORTS": [
        "sports", "ground", "gym", "cricket", "football", "basketball",
        "swimming", "badminton", "volleyball", "athletics", "stadium",
        "sports complex", "inter-college", "tournament",
    ],
    "RESTRICTIONS": [
        "curfew", "dress code", "attendance", "phone", "visitor",
        "girls hostel", "boys hostel", "gate pass", "in-time", "out-time",
        "permission", "leave", "outing", "night out", "strict",
        "rules", "fine", "penalty",
    ],
    "INFRASTRUCTURE": [
        "lab", "library", "classroom", "wifi", "computer", "building",
        "ac", "ventilation", "projector", "smart class", "auditorium",
        "parking", "transport", "bus", "connectivity",
    ],
    "NEWS_CONTROVERSY": [
        "scam", "fraud", "fake", "protest", "strike", "controversy",
        "news", "police", "fir", "death", "accident", "complaint",
        "rti", "expose", "viral", "media",
    ],
}

# ── Sentiment Keywords ───────────────────────────────────────────────────────

POSITIVE_WORDS = [
    "great", "amazing", "excellent", "good", "love", "best", "awesome",
    "fantastic", "wonderful", "top", "brilliant", "happy", "recommend",
    "worth", "satisfied", "decent", "nice", "helpful", "supportive",
    "quality", "clean", "improved", "opportunity",
]

NEGATIVE_WORDS = [
    "bad", "worst", "terrible", "horrible", "hate", "poor", "waste",
    "pathetic", "disgusting", "scam", "fraud", "avoid", "regret",
    "disappointed", "dirty", "broken", "useless", "corrupt", "toxic",
    "unsafe", "overrated", "expensive", "not worth",
]

# ── Helper Functions ─────────────────────────────────────────────────────────


def detect_college(text: str) -> Optional[str]:
    """Detect which college a post is about using fuzzy keyword matching."""
    text_lower = text.lower()
    for college_name, aliases in COLLEGE_NAMES.items():
        for alias in aliases:
            # Use word boundary matching for short aliases
            if len(alias) <= 4:
                pattern = r"\b" + re.escape(alias) + r"\b"
                if re.search(pattern, text_lower):
                    return college_name
            else:
                if alias in text_lower:
                    return college_name
    return None


def classify_category(text: str) -> str:
    """Classify text into a category based on keyword matching."""
    text_lower = text.lower()
    scores: dict[str, int] = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[category] = score

    if not scores:
        return "CAMPUS_LIFE"  # default

    return max(scores, key=scores.get)  # type: ignore


def detect_sentiment(text: str) -> str:
    """Simple sentiment detection using keyword matching."""
    text_lower = text.lower()
    pos_score = sum(1 for w in POSITIVE_WORDS if w in text_lower)
    neg_score = sum(1 for w in NEGATIVE_WORDS if w in text_lower)

    if pos_score > neg_score:
        return "POSITIVE"
    elif neg_score > pos_score:
        return "NEGATIVE"
    return "NEUTRAL"


def send_to_api(posts: list[dict]) -> bool:
    """Send scraped posts to the ingest API endpoint."""
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
                f"Ingested {data.get('data', {}).get('created', 0)} posts, "
                f"{data.get('data', {}).get('collegesCreated', 0)} new colleges"
            )
            return True
        else:
            logger.error(f"Ingest API returned {response.status_code}: {response.text}")
            return False
    except requests.RequestException as e:
        logger.error(f"Failed to send to API: {e}")
        return False


# ── Main Scraper ─────────────────────────────────────────────────────────────


def scrape_reddit():
    """Main Reddit scraping function."""
    client_id = os.getenv("REDDIT_CLIENT_ID")
    client_secret = os.getenv("REDDIT_CLIENT_SECRET")
    user_agent = os.getenv("REDDIT_USER_AGENT", "CollegeSach/1.0")

    if not client_id or not client_secret:
        logger.error("Reddit API credentials not set. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET.")
        return 0

    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent,
    )

    total_scraped = 0
    batch: list[dict] = []
    batch_size = 25

    for subreddit_name in SUBREDDITS:
        logger.info(f"Scraping r/{subreddit_name}...")
        try:
            subreddit = reddit.subreddit(subreddit_name)

            # Get hot and new posts
            for listing_type in ["hot", "new"]:
                try:
                    if listing_type == "hot":
                        posts = subreddit.hot(limit=50)
                    else:
                        posts = subreddit.new(limit=50)

                    for submission in posts:
                        try:
                            # Combine title and selftext for analysis
                            full_text = f"{submission.title} {submission.selftext}"

                            # Detect college
                            college_name = detect_college(full_text)
                            if not college_name:
                                continue

                            # Classify and analyze
                            category = classify_category(full_text)
                            sentiment = detect_sentiment(full_text)

                            post_data = {
                                "collegeName": college_name,
                                "category": category,
                                "content": submission.selftext[:2000] if submission.selftext else submission.title,
                                "source": "reddit",
                                "sourceUrl": f"https://reddit.com{submission.permalink}",
                                "sentiment": sentiment,
                                "title": submission.title[:200],
                                "author": str(submission.author) if submission.author else "Anonymous",
                            }

                            batch.append(post_data)
                            total_scraped += 1

                            # Send batch when full
                            if len(batch) >= batch_size:
                                send_to_api(batch)
                                batch = []

                        except Exception as e:
                            logger.warning(f"Error processing submission: {e}")
                            continue

                except Exception as e:
                    logger.warning(f"Error fetching {listing_type} from r/{subreddit_name}: {e}")
                    continue

            # Rate limiting between subreddits
            time.sleep(2)

        except Exception as e:
            logger.error(f"Error accessing r/{subreddit_name}: {e}")
            continue

    # Send remaining batch
    if batch:
        send_to_api(batch)

    logger.info(f"Reddit scraping complete. Total posts scraped: {total_scraped}")
    return total_scraped


if __name__ == "__main__":
    scrape_reddit()
