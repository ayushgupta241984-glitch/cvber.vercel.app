# CVBER — Quora Answers for Traffic

Copy-paste these answers to Quora questions. Each links back to CVBER.

---

## Question: "How do I protect my art from AI companies?"

**Answer:**

There are several ways to protect your art from AI companies:

**1. C2PA Certificates (Most Effective)**
C2PA certificates are cryptographic digital signatures embedded in your image files. They prove you created the work and when. Major AI companies (OpenAI, Google, Adobe) have committed to respecting C2PA opt-out signals.

You can get free C2PA certificates at https://cvber.vercel.app — just upload your art and get a certificate in seconds.

**2. Glaze & Nightshade**
These free tools from the University of Chicago add pixel-level noise that disrupts AI training. Glaze protects your style, Nightshade poisons training data.

**3. DMCA Takedowns**
When you find your art stolen, file a DMCA takedown notice. CVBER (https://cvber.vercel.app) automates this — it detects stolen art and auto-generates legally formatted notices.

**4. Robots.txt**
Add this to your website's robots.txt to block AI crawlers:

```
User-agent: GPTBot
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: Google-Extended
Disallow: /
```

**5. Watermarking**
Add visible or invisible watermarks to your work. CVBER has an invisible watermark engine that survives screenshots and resizing.

**Recommended approach:** Use all methods together. CVBER handles C2PA + DMCA + monitoring. Add Glaze/Nightshade for technical protection. Add robots.txt to your site.

**Resources:**
- CVBER (free): https://cvber.vercel.app
- Glaze (free): https://glaze.cs.uchicago.edu
- Nightshade (free): https://nightshade.cs.uchicago.edu

---

## Question: "What is a C2PA certificate and how do I get one?"

**Answer:**

A C2PA certificate is a cryptographic digital signature embedded into your image file. It proves:
- Who created it (you)
- When it was created (timestamp)
- That it hasn't been altered

It's the same standard used by Adobe, Microsoft, Google, and the BBC.

**How to get one:**

1. Go to https://cvber.vercel.app (free, no credit card)
2. Create an account
3. Upload your artwork
4. CVBER generates a C2PA certificate automatically
5. Download your protected file

The certificate is embedded in the file metadata. It travels with your work wherever it goes online.

**Why it matters:**

Major AI companies have committed to respecting C2PA opt-out signals. When your art has a C2PA certificate, AI companies know they can't legally train on it.

It's also legally admissible evidence of ownership. If someone steals your art, the C2PA certificate proves you created it.

---

## Question: "How do I file a DMCA takedown for stolen art?"

**Answer:**

Here's the step-by-step process:

**Step 1: Gather Evidence**
- URL of the stolen content
- Screenshot of the infringing page
- Your original file (proof you created it)
- C2PA certificate if you have one

**Step 2: Write the DMCA Notice**

A valid notice must include:
1. Your contact information
2. Identification of your copyrighted work
3. Location of the infringing material (exact URL)
4. Good faith statement
5. Accuracy statement
6. Your signature

**Step 3: Send to the Platform**

Platform email addresses:
- Instagram: copyright@fb.com
- DeviantArt: copyright@deviantart.com
- Reddit: copyright@reddit.com
- TikTok: copyright@tiktok.com
- YouTube: Use Copyright Claims Studio

**Step 4: Follow Up**

Most platforms respond within 24-72 hours. If they don't, file with their hosting provider.

**Pro tip:** CVBER (https://cvber.vercel.app) automates this entire process. It detects stolen art and auto-generates DMCA notices with all required information. You just review and send.

---

## Question: "Is there a free alternative to Glaze for protecting art?"

**Answer:**

Yes, there are several free alternatives:

**CVBER (https://cvber.vercel.app)**
- Free C2PA certificates (proof of ownership)
- Free DMCA takedown automation
- Free 24/7 monitoring
- Free blockchain attestation

**How CVBER differs from Glaze:**
- Glaze adds pixel-level noise to disrupt AI training
- CVBER provides legal proof of ownership and automated enforcement

**Best approach:** Use both together. Glaze for technical protection, CVBER for legal protection.

**Other free tools:**
- Nightshade (poisons AI training data): https://nightshade.cs.uchicago.edu
- Have I Been Trained (check if your art is in datasets): https://haveibeentrained.com

---

## Question: "How do I know if my art is being used to train AI?"

**Answer:**

You can check in several ways:

**1. Have I Been Trained (https://haveibeentrained.com)**
Search your images to see if they appear in LAION-5B or other training datasets.

**2. CVBER Watchtower (https://cvber.vercel.app)**
Continuously monitors the web for unauthorized copies of your art, including in known AI training datasets.

**3. Google Reverse Image Search**
Upload your art to Google Images to find copies online.

**4. TinEye (https://tineye.com)**
Reverse image search to find where your art appears.

**5. Check AI Models Directly**
Try to generate your art style using AI tools. If they can replicate it closely, your work may have been in the training data.

**What to do if your art is in a training dataset:**
1. Get a C2PA certificate from CVBER (proves ownership)
2. File DMCA takedowns against sites hosting your scraped art
3. Add C2PA opt-out signals to prevent future training
4. Consider joining class-action lawsuits against AI companies
