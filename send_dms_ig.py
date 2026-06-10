"""
CVBER Instagram DM Automation - Two-step login
Step 1: Trigger challenge (save settings)
Step 2: User confirms on phone, then we retry
"""

import json
import time
import random
import os
from pathlib import Path
from instagrapi import Client

USERNAME = "cvber_us"
PASSWORD = "Aayush@1983"
SESSION_FILE = "ig_session.json"

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
session_path = Path(__file__).parent / SESSION_FILE

def load_sent():
    if SENT_LOG.exists():
        with open(SENT_LOG) as f:
            return json.load(f)
    return []

def save_sent(sent):
    with open(SENT_LOG, "w") as f:
        json.dump(sent, f, indent=2)

def login():
    cl = Client()
    
    # Load existing session if available
    if session_path.exists():
        print("[*] Loading saved session...")
        cl.load_settings(session_path)
    
    try:
        cl.login(USERNAME, PASSWORD)
        cl.dump_settings(session_path)
        print("[+] Login successful!")
        return cl, True
    except Exception as e:
        error = str(e)
        print(f"[!] Login needs attention: {error[:100]}")
        
        # Save settings anyway for retry
        try:
            cl.dump_settings(session_path)
            print("[*] Settings saved for retry")
        except:
            pass
        
        return cl, False

def send_all_dms(cl):
    sent = load_sent()
    sent_handles = {s["handle"] for s in sent}
    unsent = [l for l in LEADS if l["handle"] not in sent_handles]
    
    if not unsent:
        print("[*] All DMs already sent!")
        return
    
    total = len(unsent)
    print(f"\n[*] Sending {total} DMs (batches: 3, 3, {total-6 if total>6 else 0})")
    
    for i, lead in enumerate(unsent, 1):
        try:
            print(f"  [{i}/{total}] @{lead['handle']} ({lead['name']})...", end=" ", flush=True)
            
            user_id = cl.user_id_from_username(lead["handle"])
            cl.direct_send(lead["dm"], [user_id])
            
            sent.append({"handle": lead["handle"], "name": lead["name"]})
            save_sent(sent)
            print("OK")
            
            # Batch pauses
            if i in [3, 6] and total > i:
                mins = 30
                print(f"  Batch done. Waiting {mins} min...")
                for m in range(mins, 0, -1):
                    print(f"  {m} min remaining...")
                    time.sleep(60)
                print("  Resuming...")
            elif i < total:
                wait = random.randint(90, 150)
                print(f"  Wait {wait}s")
                time.sleep(wait)
                
        except Exception as e:
            print(f"FAIL: {str(e)[:60]}")
            time.sleep(30)
    
    print(f"\n[+] Done! Sent {len(sent)} DMs.")
    cl.dump_settings(session_path)

if __name__ == "__main__":
    print("=" * 60)
    print("CVBER Instagram DM Automation")
    print("=" * 60)
    print()
    
    cl, logged_in = login()
    
    if not logged_in:
        print()
        print("=" * 60)
        print("STEP 1: Open Instagram on your PHONE")
        print("STEP 2: You should see a login approval notification")
        print("STEP 3: Tap 'Yes, it was me' or 'Confirm Login'")
        print("STEP 4: Come back here and re-run the script")
        print("=" * 60)
        print()
        print("After confirming, run again: python send_dms_ig.py")
        exit()
    
    send_all_dms(cl)
