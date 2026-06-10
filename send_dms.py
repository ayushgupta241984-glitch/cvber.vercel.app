"""
CVBER Instagram DM Automation
Sends personalized DMs to artists in installments with delays.
"""

import json
import time
import random
import sys
from pathlib import Path

USERNAME = "cvber_us"
PASSWORD = "Aayush@1983"

LEADS = [
    {"name": "Jocelyn Moxie Ortega", "handle": "moxietattoo", "dm": "Hey Jocelyn! I came across your work and that water dragon piece is incredible. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo artists. Have you ever had your designs stolen or reposted without credit? We're building tools to detect theft and auto-send DMCA takedowns. Would love your feedback on what would actually help. Just a 16-year-old trying to solve a real problem."},
    {"name": "Civilized Tattoo", "handle": "civilizedtattoo_la", "dm": "Hey! Found Civilized Tattoo through your LA work - Blitz's black and grey pieces are insane. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo studios. Has your shop ever dealt with clients bringing in stolen designs from Pinterest or other artists' work? We're building reverse image search and DMCA tools specifically for tattoo artists. Would love your take on what would actually be useful."},
    {"name": "Black Tower Tattoo", "handle": "blacktowertattoostudio", "dm": "Hey! Found Black Tower through your Instagram - your artists do amazing custom work. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo studios. Have any of your artists had their flash sheets or custom designs stolen and reposted? We're building tools to detect theft across the web and auto-file DMCA takedowns. Would love to hear what protection tools you'd actually use."},
    {"name": "Nite Owl Tattoo Studio", "handle": "niteowltattoostudio", "dm": "Hey! Found Nite Owl through your San Antonio work - love the two-location setup. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo studios. Have you ever had artists' designs stolen or clients bringing in stolen reference images? We're building reverse image search and DMCA automation specifically for tattoo shops. Would love your input on what would actually help your studio."},
    {"name": "Synapse Tattoo Studio", "handle": "synapsetattoostudio", "dm": "Hey! Found Synapse through your Instagram - love that it's female-owned with such a strong values-driven approach. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo artists. Have you or your artists ever dealt with design theft? We're building tools to detect stolen artwork and auto-send DMCA takedowns. Would love feedback from a studio that clearly cares about artist rights."},
    {"name": "Art & Soul Tattoo", "handle": "tattoowisconsin", "dm": "Hey! Found Art & Soul through your Wisconsin gallery-tattoo hybrid concept - really cool combination. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo artists. Has your gallery side ever dealt with art theft or unauthorized reproductions? We're building reverse image search and DMCA tools. Would love to hear how a gallery-tattoo studio thinks about protecting original work."},
    {"name": "Marina Montero", "handle": "marineramontero", "dm": "Hi Marina! Found your work through your illustration portfolio - congratulations on the Premio Andersen win and BCBF selection! I'm building CVBER (cvber.vercel.app) - free AI-powered copyright protection for illustrators. Have you ever dealt with someone stealing your illustrations online? We're building tools to detect stolen art across the web and auto-generate DMCA takedowns. Would love to hear what protection tools you'd actually find useful."},
    {"name": "Ryan Francis", "handle": "mastafran", "dm": "Hey Ryan! Found your comic work through MastaFran Comics - love the commission work and your art style. I'm building CVBER (cvber.vercel.app) - free copyright protection for comic artists. Comic art gets stolen constantly - have you experienced this? We're building reverse image search, theft detection, and automated DMCA tools specifically for comic artists. Would love your input on what would actually be useful for your workflow."},
    {"name": "Art Collector Tattoo", "handle": "artcollectortattoo", "dm": "Hey! Found Art Collector through your LA studio - love the name and concept. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo studios. Have any of your artists had their custom designs or flash sheets stolen and reposted online? We're building tools to detect theft across the web and auto-file DMCA takedowns. Would love your take on what would actually help your studio."},
    {"name": "Queen's Gambit Tattoo", "handle": "queensgambittattoo", "dm": "Hey! Found Queen's Gambit through your tattoo work - really cool chess-inspired concept. I'm building CVBER (cvber.vercel.app) - free copyright protection for tattoo studios. Have you ever dealt with design theft or clients bringing in stolen reference images? We're building reverse image search and DMCA automation specifically for tattoo shops. Would love to hear what protection tools you'd actually use."},
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

def main():
    print("[CVBER] Instagram DM Automation\n")
    
    # Login
    print("[1/4] Logging in as @cvber_us...")
    try:
        from instagrapi import Client
        cl = Client()
        cl.login(USERNAME, PASSWORD)
        print("       Logged in successfully!")
    except Exception as e:
        print(f"       Login failed: {e}")
        print("       Check credentials or try again later.")
        sys.exit(1)
    
    # Load already sent
    sent = load_sent()
    sent_handles = {s["handle"] for s in sent}
    
    # Filter unsent leads
    unsent = [l for l in LEADS if l["handle"] not in sent_handles]
    
    if not unsent:
        print("\n[!] All DMs already sent!")
        return
    
    total = len(unsent)
    print(f"\n[2/4] {total} DMs to send (in installments)")
    print(f"       Batch size: 3, then 3, then {total - 6 if total > 6 else 0} (30min gap)\n")
    
    # Send in batches
    for i, lead in enumerate(unsent, 1):
        try:
            user_id = cl.user_id_from_username(lead["handle"])
            cl.direct_send(lead["dm"], [user_id])
            
            # Log sent
            sent.append({"handle": lead["handle"], "name": lead["name"]})
            save_sent(sent)
            
            print(f"  [{i}/{total}] ✓ Sent to @{lead['handle']} ({lead['name']})")
            
            # Batch pause logic
            if i == 3 and total > 3:
                print("       Batch 1 done. Waiting 30 minutes before batch 2...")
                time.sleep(1800)  # 30 min
            elif i == 6 and total > 6:
                print("       Batch 2 done. Waiting 30 minutes before batch 3...")
                time.sleep(1800)  # 30 min
            elif i < total:
                wait = random.randint(90, 180)
                print(f"       Waiting {wait}s before next...")
                time.sleep(wait)
                
        except Exception as e:
            print(f"  [{i}/{total}] ✗ Failed @{lead['handle']}: {e}")
            print("       Waiting 60s and continuing...")
            time.sleep(60)
    
    print(f"\n[3/4] Done! Sent {len(sent)} DMs total.")
    print(f"       Log saved to dm_sent.json")
    
    # Logout
    print("[4/4] Logging out...")
    cl.logout()
    print("     Done!")

if __name__ == "__main__":
    main()
