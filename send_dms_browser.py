"""
CVBER Instagram DM Automation - waits 5 min for you to log in.
No automation detection, no browser interaction until you're done.
"""

import json
import time
import random
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

LEADS = [
    {"name": "Jocelyn Moxie Ortega", "handle": "moxietattoo", "dm": "Hey Jocelyn! I came across your work and that water dragon piece is incredible. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo artists. Have you ever had your designs stolen or reposted without credit? We're building tools to detect theft and auto-send DMCA takedowns. Would love your feedback on what would actually help. Just a 16-year-old trying to solve a real problem."},
    {"name": "Civilized Tattoo", "handle": "civilizedtattoo_la", "dm": "Hey! Found Civilized Tattoo - Blitz's black and grey pieces are insane. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo studios. Has your shop ever dealt with clients bringing in stolen designs? We build reverse image search and DMCA tools for tattoo artists. Would love your take on what would help."},
    {"name": "Black Tower Tattoo", "handle": "blacktowertattoostudio", "dm": "Hey! Found Black Tower - your artists do amazing custom work. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo studios. Had flash sheets or custom designs stolen? We detect theft across the web and auto-file DMCA takedowns. Would love your input."},
    {"name": "Nite Owl Tattoo Studio", "handle": "niteowltattoostudio", "dm": "Hey! Found Nite Owl through your San Antonio work - love the two-location setup. I'm building CVBER (cvber.vercel.app) - free copyright protection. Had designs stolen or clients with stolen reference images? We do reverse image search + DMCA automation. Would love your input."},
    {"name": "Synapse Tattoo Studio", "handle": "synapsetattoostudio", "dm": "Hey! Found Synapse - love the female-owned, values-driven approach. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo artists. Dealt with design theft? We detect stolen artwork and auto-send DMCA notices. Would love feedback from a studio that cares about artist rights."},
    {"name": "Art & Soul Tattoo", "handle": "tattoowisconsin", "dm": "Hey! Found Art & Soul - love the gallery-tattoo hybrid concept. I'm building CVBER (cvber.vercel.app) - free copyright protection. Had art theft or unauthorized reproductions? We build reverse image search + DMCA tools. Would love to hear how you think about protecting original work."},
    {"name": "Marina Montero", "handle": "marineramontero", "dm": "Hi Marina! Found your work - congrats on the Premio Andersen win and BCBF selection! I'm building CVBER (cvber.vercel.app) - free copyright protection for illustrators. Had your illustrations stolen online? We detect stolen art across the web and auto-generate DMCA takedowns. Would love your take."},
    {"name": "Ryan Francis", "handle": "mastafran", "dm": "Hey Ryan! Found your comic work through MastaFran Comics. I'm building CVBER (cvber.vercel.app) - free copyright protection for comic artists. Comic art gets stolen constantly - experienced this? We build reverse image search + DMCA tools for comic artists. Would love your input."},
    {"name": "Art Collector Tattoo", "handle": "artcollectortattoo", "dm": "Hey! Found Art Collector through your LA studio. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo studios. Had custom designs or flash stolen? We detect theft across the web and auto-file DMCA takedowns. Would love your take."},
    {"name": "Queen's Gambit Tattoo", "handle": "queensgambittattoo", "dm": "Hey! Found Queen's Gambit - love the chess-inspired concept. I'm building CVBER (cvber.vercel.app) - free copyright protection. Had design theft or clients with stolen reference images? We do reverse image search + DMCA for tattoo shops. Would love to hear what you'd use."},
]

SENT_LOG = Path(__file__).parent / "dm_sent.json"

def load_sent():
    if SENT_LOG.exists():
        with open(SENT_LOG) as f:
            return json.load(f)
    return []

def save_sent(sent):
    with open(SENT_LOG, "w") as f:
        json.dump(sent, f, indent=2)

async def main():
    print("=" * 60)
    print("CVBER Instagram DM Automation")
    print("=" * 60)
    print()
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-automation",
                "--no-sandbox",
            ]
        )
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            locale="en-US",
            timezone_id="America/New_York",
        )
        
        # Remove automation detection
        await context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        """)
        
        page = await context.new_page()
        
        print("Opening blank page... Navigate to instagram.com yourself.")
        await page.goto("about:blank")
        
        print()
        print("=" * 60)
        print("INSTRUCTIONS:")
        print("1. In the browser window, go to instagram.com")
        print("2. Log in normally (handle reCAPTCHA, verification, etc.)")
        print("3. Wait until you see your Instagram feed/home page")
        print("4. Then come back to this terminal window")
        print()
        print("The script will wait 5 minutes before starting.")
        print("=" * 60)
        print()
        
        # Wait 5 full minutes - no interaction at all
        for m in range(5, 0, -1):
            print(f"  Waiting {m} min before starting DM automation...")
            await page.wait_for_timeout(60000)
        
        print()
        print("Starting DM automation now...")
        print()
        
        # Load sent log
        sent = load_sent()
        sent_handles = {s["handle"] for s in sent}
        unsent = [l for l in LEADS if l["handle"] not in sent_handles]
        
        if not unsent:
            print("All DMs already sent!")
            await browser.close()
            return
        
        total = len(unsent)
        print(f"Sending {total} DMs (batch of 3, then 3, then {total - 6 if total > 6 else 0})")
        print()
        
        for i, lead in enumerate(unsent, 1):
            try:
                print(f"[{i}/{total}] @{lead['handle']} ({lead['name']})...", end=" ", flush=True)
                
                # Go to DM inbox
                await page.goto("https://www.instagram.com/direct/inbox/")
                await page.wait_for_timeout(4000)
                
                # Click new message button
                new_msg = page.locator('[aria-label="New message"]')
                await new_msg.click(timeout=10000)
                await page.wait_for_timeout(2000)
                
                # Type handle
                search = page.locator('input[placeholder="Search..."]')
                await search.fill(lead["handle"])
                await page.wait_for_timeout(2000)
                
                # Click on user
                user_result = page.locator(f'text={lead["handle"]}').first
                await user_result.click(timeout=5000)
                await page.wait_for_timeout(1000)
                
                # Go to chat
                chat_btn = page.locator('[aria-label="Chat"]').first
                await chat_btn.click(timeout=5000)
                await page.wait_for_timeout(2000)
                
                # Type message
                msg_area = page.locator('[aria-label="Message"]').first
                await msg_area.fill(lead["dm"])
                await page.wait_for_timeout(500)
                
                # Send
                await msg_area.press("Enter")
                await page.wait_for_timeout(2000)
                
                sent.append({"handle": lead["handle"], "name": lead["name"]})
                save_sent(sent)
                print("OK")
                
                # Batch pauses
                if i in [3, 6] and total > i:
                    mins = 30
                    print(f"\n  Batch done. Waiting {mins} min...")
                    for m2 in range(mins, 0, -1):
                        print(f"  {m2} min remaining...")
                        await page.wait_for_timeout(60000)
                    print("  Resuming...\n")
                elif i < total:
                    wait = random.randint(90, 150)
                    print(f"  Wait {wait}s")
                    await page.wait_for_timeout(wait * 1000)
                    
            except Exception as e:
                print(f"FAIL: {e}")
                print("  Waiting 30s...")
                await page.wait_for_timeout(30000)
        
        print(f"\nDONE! Sent {len(sent)} DMs.")
        print(f"Saved to dm_sent.json")
        
        # Keep browser open so user can see
        await page.wait_for_timeout(10000)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
