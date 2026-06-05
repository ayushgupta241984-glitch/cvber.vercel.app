"""
CVBER Backlink Opportunity Finder
Finds high-authority sites where you can get backlinks for free.
Run: python backlink_finder.py
"""

import requests
from typing import List, Dict
import json

# Sites where CVBER can get free backlinks (manually curated)
BACKLINK_OPPORTUNITIES = [
    # AI Tool Directories (High DA)
    {"site": "There's An AI For That", "url": "https://theresanaiforthat.com/submit/", "da": 80, "type": "ai-directory", "status": "pending"},
    {"site": "Futurepedia", "url": "https://futurepedia.io/submit-tool", "da": 70, "type": "ai-directory", "status": "pending"},
    {"site": "TopAI.tools", "url": "https://topai.tools/submit", "da": 60, "type": "ai-directory", "status": "pending"},
    {"site": "AI Scout", "url": "https://aiscout.net/submit", "da": 60, "type": "ai-directory", "status": "pending"},
    {"site": "ToolPilot", "url": "https://toolpilot.ai/submit", "da": 55, "type": "ai-directory", "status": "pending"},
    
    # Product/Startup Directories
    {"site": "Product Hunt", "url": "https://www.producthunt.com/posts/new", "da": 90, "type": "product-launch", "status": "pending"},
    {"site": "AlternativeTo", "url": "https://alternativeto.net/add-app/", "da": 90, "type": "alternative-listing", "status": "pending"},
    {"site": "Indie Hackers", "url": "https://www.indiehackers.com/product/new", "da": 70, "type": "community", "status": "pending"},
    {"site": "Betalist", "url": "https://betalist.com/submit", "da": 65, "type": "startup-directory", "status": "pending"},
    {"site": "BetaPage", "url": "https://betapage.co/startup-submission", "da": 55, "type": "startup-directory", "status": "pending"},
    
    # Design/Art Directories
    {"site": "Dribbble", "url": "https://dribbble.com/shots/new", "da": 90, "type": "design-community", "status": "pending"},
    {"site": "Behance", "url": "https://www.behance.net/projects/new", "da": 90, "type": "portfolio", "status": "pending"},
    {"site": "Muzli", "url": "https://muzli.com/submit", "da": 65, "type": "design-inspiration", "status": "pending"},
    
    # Developer Communities
    {"site": "Hacker News", "url": "https://news.ycombinator.com/submit", "da": 90, "type": "community", "status": "pending"},
    {"site": "Dev.to", "url": "https://dev.to/new", "da": 80, "type": "blog-platform", "status": "pending"},
    {"site": "Hashnode", "url": "https://hashnode.com/create", "da": 75, "type": "blog-platform", "status": "pending"},
    {"site": "Lobste.rs", "url": "https://lobste.rs/new", "da": 60, "type": "community", "status": "pending"},
    
    # Reddit (multiple subreddits)
    {"site": "r/SideProject", "url": "https://reddit.com/r/SideProject", "da": 80, "type": "reddit", "status": "pending"},
    {"site": "r/ArtistLounge", "url": "https://reddit.com/r/ArtistLounge", "da": 80, "type": "reddit", "status": "pending"},
    {"site": "r/DigitalArt", "url": "https://reddit.com/r/DigitalArt", "da": 80, "type": "reddit", "status": "pending"},
    {"site": "r/indiehackers", "url": "https://reddit.com/r/indiehackers", "da": 75, "type": "reddit", "status": "pending"},
    {"site": "r/webdev", "url": "https://reddit.com/r/webdev", "da": 85, "type": "reddit", "status": "pending"},
    {"site": "r/InternetIsBeautiful", "url": "https://reddit.com/r/InternetIsBeautiful", "da": 85, "type": "reddit", "status": "pending"},
    
    # Content Platforms
    {"site": "Medium", "url": "https://medium.com/new-story", "da": 95, "type": "blog-platform", "status": "pending"},
    {"site": "LinkedIn Articles", "url": "https://linkedin.com/publish/new", "da": 98, "type": "professional-network", "status": "pending"},
    
    # GitHub (already have repo)
    {"site": "GitHub README", "url": "https://github.com", "da": 95, "type": "code-repository", "status": "completed"},
]

def display_opportunities():
    print("\n" + "="*60)
    print("CVBER BACKLINK OPPORTUNITIES")
    print("="*60)
    
    by_type = {}
    for opp in BACKLINK_OPPORTUNITIES:
        if opp["type"] not in by_type:
            by_type[opp["type"]] = []
        by_type[opp["type"]].append(opp)
    
    for opp_type, opps in sorted(by_type.items()):
        print(f"\n--- {opp_type.upper().replace('-', ' ')} ---")
        for opp in sorted(opps, key=lambda x: x["da"], reverse=True):
            status = "[DONE]" if opp["status"] == "completed" else "[TODO]"
            print(f"  {status} DA {opp['da']:3d} | {opp['site']}")
            print(f"       {opp['url']}")
    
    print("\n" + "="*60)
    print("PRIORITY ORDER: Submit to highest DA sites first")
    print("="*60)

def generate_outreach_email(site_name: str, site_url: str) -> str:
    return f"""Subject: Free AI Art Protection Tool — CVBER

Hi {site_name} Team,

I built CVBER (https://cvber.vercel.app), a free AI-powered art protection platform that helps digital artists protect their work from AI scraping and theft.

What it does:
- Free C2PA certificates (same standard as Adobe/Microsoft)
- Automated DMCA takedown generation
- 24/7 theft monitoring across social media
- Blockchain ownership attestation

It's already helping artists protect their creative work. Would you consider adding it to your directory/list?

Happy to provide any additional information.

Best,
[Your Name]
CVBER Team"""

if __name__ == "__main__":
    display_opportunities()
