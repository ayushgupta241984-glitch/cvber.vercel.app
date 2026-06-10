"""
CVBER DM - Waits for you to complete any security challenges, then sends
"""

import json, time, random, asyncio
from pathlib import Path
from playwright.async_api import async_playwright

LEADS = [
    {"name":"Jocelyn Moxie Ortega","handle":"moxietattoo","dm":"Hey Jocelyn! I came across your work and that water dragon piece is incredible. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo artists. Have you ever had your designs stolen or reposted without credit? We're building tools to detect theft and auto-send DMCA takedowns. Would love your feedback on what would actually help. Just a 16-year-old trying to solve a real problem."},
    {"name":"Civilized Tattoo","handle":"civilizedtattoo_la","dm":"Hey! Found Civilized Tattoo - Blitz's black and grey pieces are insane. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo studios. Has your shop ever dealt with clients bringing in stolen designs? We build reverse image search and DMCA tools for tattoo artists. Would love your take on what would help."},
    {"name":"Black Tower Tattoo","handle":"blacktowertattoostudio","dm":"Hey! Found Black Tower - your artists do amazing custom work. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo studios. Had flash sheets or custom designs stolen? We detect theft across the web and auto-file DMCA takedowns. Would love your input."},
    {"name":"Nite Owl Tattoo Studio","handle":"niteowltattoostudio","dm":"Hey! Found Nite Owl through your San Antonio work - love the two-location setup. I'm building CVBER (cvber.vercel.app) - free copyright protection. Had designs stolen or clients with stolen reference images? We do reverse image search + DMCA automation. Would love your input."},
    {"name":"Synapse Tattoo Studio","handle":"synapsetattoostudio","dm":"Hey! Found Synapse - love the female-owned, values-driven approach. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo artists. Dealt with design theft? We detect stolen artwork and auto-send DMCA notices. Would love feedback from a studio that cares about artist rights."},
    {"name":"Art & Soul Tattoo","handle":"tattoowisconsin","dm":"Hey! Found Art & Soul - love the gallery-tattoo hybrid concept. I'm building CVBER (cvber.vercel.app) - free copyright protection. Had art theft or unauthorized reproductions? We build reverse image search + DMCA tools. Would love to hear how you think about protecting original work."},
    {"name":"Marina Montero","handle":"marineramontero","dm":"Hi Marina! Found your work - congrats on the Premio Andersen win and BCBF selection! I'm building CVBER (cvber.vercel.app) - free copyright protection for illustrators. Had your illustrations stolen online? We detect stolen art across the web and auto-generate DMCA takedowns. Would love your take."},
    {"name":"Ryan Francis","handle":"mastafran","dm":"Hey Ryan! Found your comic work through MastaFran Comics. I'm building CVBER (cvber.vercel.app) - free copyright protection for comic artists. Comic art gets stolen constantly - experienced this? We build reverse image search + DMCA tools for comic artists. Would love your input."},
    {"name":"Art Collector Tattoo","handle":"artcollectortattoo","dm":"Hey! Art Collector - your LA studio looks amazing. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo studios. Had custom designs or flash stolen? We detect theft across the web and auto-file DMCA takedowns. Would love your take."},
    {"name":"Queen's Gambit Tattoo","handle":"queensgambittattoo","dm":"Hey! Queen's Gambit - love the chess-inspired concept. I'm building CVBER (cvber.vercel.app) - free copyright protection. Had design theft or clients with stolen reference images? We do reverse image search + DMCA for tattoo shops. Would love to hear what you'd use."},
]

SENT_LOG = Path("dm_sent.json")

def load_sent():
    if SENT_LOG.exists():
        with open(SENT_LOG) as f: return json.load(f)
    return []

def save_sent(sent):
    with open(SENT_LOG, "w") as f: json.dump(sent, f, indent=2)

async def wait_for_home(page):
    """Wait until we see the Instagram home feed (no login/challenge page)"""
    print("[*] Waiting for Instagram home feed...")
    while True:
        try:
            url = page.url
            if any(x in url for x in ["auth_platform", "accounts/login", "accounts/signup", "challenge"]):
                print("  [Instagram needs you to complete a challenge in the browser]")
                await page.wait_for_timeout(3000)
                continue
            if "instagram.com" in url and "accounts" not in url:
                # Check no login button visible
                btn = page.locator('button:has-text("Log in")').first
                if not await btn.is_visible(timeout=1000):
                    return True
        except: pass
        await page.wait_for_timeout(2000)

async def send_dm(page, handle, dm_text):
    """Send a DM to one user"""
    # Go to profile first
    await page.goto(f"https://www.instagram.com/{handle}/")
    await page.wait_for_timeout(4000)
    
    # Check if challenge appeared
    if "auth_platform" in page.url or "challenge" in page.url:
        print("CHALLENGE - waiting for you to complete it...")
        await wait_for_home(page)
        # Retry
        await page.goto(f"https://www.instagram.com/{handle}/")
        await page.wait_for_timeout(4000)
    
    # Click Message button
    try:
        btn = page.locator('div[role="button"]:has-text("Message")').first
        if await btn.is_visible(timeout=3000):
            await btn.click()
            await page.wait_for_timeout(3000)
        else:
            return False
    except:
        return False
    
    # Type message
    try:
        msg = page.locator('[aria-label="Message"]').first
        if await msg.is_visible(timeout=5000):
            await msg.fill(dm_text)
            await page.wait_for_timeout(500)
            await msg.press("Enter")
            await page.wait_for_timeout(2000)
            return True
    except:
        pass
    
    # Fallback keyboard approach
    try:
        await page.keyboard.type(dm_text, delay=30)
        await page.wait_for_timeout(500)
        await page.keyboard.press("Enter")
        await page.wait_for_timeout(2000)
        return True
    except:
        return False

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch_persistent_context(
            user_data_dir="C:\\Users\\manoj\\Downloads\\cvber\\chrome_profile",
            channel="chrome",
            headless=False,
            args=["--no-sandbox"],
            viewport={"width":1280,"height":900}
        )
        page = browser.pages[0] if browser.pages else await browser.new_page()
        
        await page.goto("https://www.instagram.com/")
        
        print("="*60)
        print("Instagram is open in Chrome.")
        print("If it asks for a security code -> enter it.")
        print("Once you see your home feed -> I'll start.")
        print("="*60)
        
        await wait_for_home(page)
        print("[+] Home feed detected! Starting DMs...")
        await browser.storage_state(path="ig_storage.json")
        
        sent = load_sent()
        sent_handles = {s["handle"] for s in sent}
        unsent = [l for l in LEADS if l["handle"] not in sent_handles]
        
        if not unsent: print("[*] All sent!"); return
        
        total = len(unsent)
        for i, lead in enumerate(unsent, 1):
            print(f"[{i}/{total}] @{lead['handle']}...", end=" ", flush=True)
            ok = await send_dm(page, lead["handle"], lead["dm"])
            if ok:
                sent.append({"handle":lead["handle"],"name":lead["name"]})
                save_sent(sent)
                print("OK")
            else:
                print("FAIL")
            
            if i in [3,6] and total > i:
                print(f"\nBatch. 30min...")
                for _ in range(30):
                    print(f"  {30-_}min")
                    await page.wait_for_timeout(60000)
                print("Resuming...\n")
            elif i < total:
                w = random.randint(120,180)
                print(f"Wait {w}s")
                await page.wait_for_timeout(w*1000)
        
        print(f"\n[+] DONE! Sent {len(sent)} DMs.")

if __name__ == "__main__":
    asyncio.run(main())
