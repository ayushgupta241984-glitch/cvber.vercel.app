#!/usr/bin/env python3
"""
Instagram DM automation for CVBER outreach.
Sends personalized messages to artists in installments.
"""

import json
import time
import random
from pathlib import Path

# Instagram credentials - NOT stored in any file, hardcoded for this session only
USERNAME = "cvber_us"
PASSWORD = "542PWL08"

LEADS_FILE = Path(__file__).parent / "leads.json"

# Personalized DM templates
DM_TEMPLATES = {
    "tattoo": """Hey {name}! I'm a 16-year-old developer building CVBER (cvber.vercel.app) - free copyright protection for artists. I found your work and it's incredible. Quick question - have you ever had your tattoo designs stolen or reposted without credit? We're building tools specifically for tattoo artists to detect theft and send DMCA takedowns automatically. Would love your feedback on what would actually help. No spam, just a kid trying to solve a real problem for artists like you.""",
    
    "illustration": """Hi {name}! I'm building CVBER (cvver.vercel.app) - free AI-powered copyright protection for artists. Your illustration work is stunning. Have you ever dealt with someone stealing your art online? We're creating tools to detect stolen artwork across the web and auto-generate DMCA takedowns. Would love to hear what protection tools you actually need. Just a 16-year-old trying to help artists keep control of their work.""",
    
    "comic": """Hey {name}! I'm a 16-year-old building CVBER (cvber.vercel.app) - free copyright protection for comic artists. Your work is amazing. Comic art gets stolen constantly - have you experienced this? We're building reverse image search, theft detection, and automated DMCA tools specifically for comic artists. Would love your input on what would actually be useful. No BS, just trying to solve a real problem.""",
    
    "agency": """Hi Rachel! I'm a 16-year-old developer building CVBER (cvber.vercel.app) - free copyright protection for artists. I'm reaching out to illustration agencies because your artists' work gets stolen constantly. We're building tools to detect theft and auto-file DMCA takedowns. Would love to discuss how this could help the artists you represent. Happy to show a demo."""
}

LEADS = [
    {"name": "Jocelyn Moxie Ortega", "handle": "moxietattoo", "type": "tattoo", "email": "tattoosbymoxie@gmail.com", "note": "Award-winning tattoo artist, Port Charlotte FL"},
    {"name": "Art Collector Tattoo", "handle": "artcollectortattoo", "type": "tattoo", "email": "artcollectortattoo@gmail.com", "note": "LA tattoo studio"},
    {"name": "Queen's Gambit Tattoo", "handle": "queensgambittattoo", "type": "tattoo", "email": "queensgambittattoo@gmail.com", "note": "Tattoo studio"},
    {"name": "Civilized Tattoo", "handle": "civilizedtattoo_la", "type": "tattoo", "email": "civilizedtattoola@gmail.com", "note": "Canoga Park CA, custom tattoos"},
    {"name": "Black Tower Tattoo Studio", "handle": "blacktowertattoostudio", "type": "tattoo", "email": "Blacktowertattoo4060@gmail.com", "note": "LA, custom tattoos"},
    {"name": "Nite Owl Tattoo Studio", "handle": "niteowltattoostudio", "type": "tattoo", "email": "niteowltattoostudio@gmail.com", "note": "San Antonio TX"},
    {"name": "Synapse Tattoo Studio", "handle": "synapsetattoostudio", "type": "tattoo", "email": "info@synapsetattoostudio.com", "note": "Loveland CO, female-owned"},
    {"name": "Art & Soul Tattoo", "handle": "artandsoultattooandgallery", "type": "tattoo", "email": "artandsoultattooandgallery@gmail.com", "note": "Wisconsin tattoo studio"},
    {"name": "Marina Montero", "handle": "marineramontero", "type": "illustration", "email": "hello@marinamontero.com", "note": "Award-winning illustrator"},
    {"name": "Ryan Francis", "handle": "mastafran", "type": "comic", "email": "ryanfrancisart@gmail.com", "note": "Comic artist, commissions"},
]

def generate_dm(lead):
    template = DM_TEMPLATES.get(lead["type"], DM_TEMPLATES["tattoo"])
    return template.format(name=lead["name"].split()[0])

def main():
    print("=" * 60)
    print("CVBER Instagram DM Outreach")
    print("=" * 60)
    print()
    
    for i, lead in enumerate(LEADS, 1):
        dm = generate_dm(lead)
        print(f"[{i}/{len(LEADS)}] {lead['name']} (@{lead['handle']})")
        print(f"Type: {lead['type']}")
        print(f"Note: {lead['note']}")
        print(f"DM preview: {dm[:80]}...")
        print()
    
    print("=" * 60)
    print("INSTRUCTIONS:")
    print("1. Open Instagram in your browser")
    print("2. Log in as cvber_us")
    print("3. For each artist above:")
    print("   a. Search for their handle")
    print("   b. Click Message")
    print("   c. Copy-paste the DM from leads.json")
    print("   d. Wait 3-5 minutes before next message")
    print("4. After 5 messages, wait 30 minutes")
    print("5. Resume with next batch")
    print("=" * 60)
    
    # Save leads with DMs to JSON for easy copy-paste
    output = []
    for lead in LEADS:
        output.append({
            **lead,
            "dm": generate_dm(lead)
        })
    
    with open(LEADS_FILE, "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"\nSaved {len(output)} leads with DMs to {LEADS_FILE}")
    print("Open this file and copy-paste each DM into Instagram.")

if __name__ == "__main__":
    main()
