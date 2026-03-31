"""
Main scraper runner for College Sach.
Runs all scrapers sequentially and logs results.
Can be called from GitHub Actions or run manually.
"""

import sys
import logging
import time
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("scraper_runner")


def main():
    logger.info("=" * 60)
    logger.info("College Sach Scraper Runner")
    logger.info(f"Started at: {datetime.utcnow().isoformat()}Z")
    logger.info("=" * 60)

    results = {}
    exit_code = 0

    # ── Reddit Scraper ────────────────────────────────────────────────────
    logger.info("")
    logger.info(">>> Running Reddit Scraper...")
    logger.info("-" * 40)
    try:
        from reddit_scraper import scrape_reddit
        start = time.time()
        count = scrape_reddit()
        elapsed = round(time.time() - start, 1)
        results["reddit"] = {"count": count, "time": elapsed, "status": "success"}
        logger.info(f"Reddit scraper finished: {count} posts in {elapsed}s")
    except Exception as e:
        logger.error(f"Reddit scraper failed: {e}")
        results["reddit"] = {"count": 0, "time": 0, "status": f"error: {e}"}
        exit_code = 1

    # ── Review Scraper ────────────────────────────────────────────────────
    logger.info("")
    logger.info(">>> Running Review Scraper (CollegeDunia + Shiksha)...")
    logger.info("-" * 40)
    try:
        from review_scraper import scrape_reviews
        start = time.time()
        count = scrape_reviews()
        elapsed = round(time.time() - start, 1)
        results["reviews"] = {"count": count, "time": elapsed, "status": "success"}
        logger.info(f"Review scraper finished: {count} reviews in {elapsed}s")
    except Exception as e:
        logger.error(f"Review scraper failed: {e}")
        results["reviews"] = {"count": 0, "time": 0, "status": f"error: {e}"}
        exit_code = 1

    # ── Summary ───────────────────────────────────────────────────────────
    logger.info("")
    logger.info("=" * 60)
    logger.info("SCRAPING SUMMARY")
    logger.info("=" * 60)

    total_posts = 0
    for name, result in results.items():
        status_icon = "OK" if result["status"] == "success" else "FAIL"
        logger.info(
            f"  [{status_icon}] {name}: {result['count']} posts "
            f"({result['time']}s) - {result['status']}"
        )
        total_posts += result["count"]

    logger.info(f"  Total posts scraped: {total_posts}")
    logger.info(f"  Finished at: {datetime.utcnow().isoformat()}Z")
    logger.info("=" * 60)

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
