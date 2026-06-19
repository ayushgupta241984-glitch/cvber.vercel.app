# AEO/GEO Optimization Strategy for CVBER

Based on research from:
- Princeton/Georgia Tech GEO paper (arxiv.org/abs/2311.09735)
- Top-Answer-Engine-Optimization (geotoolco)
- seo-geo-claude-skills (2.2k stars)
- llmoptimizer (ihuzaifashoukat)
- schema-gen (sharozdawa)

## Key AEO/GEO Principles

### 1. Answer-First Content (AEO)
- Put direct answers at the TOP of every page (before explanation)
- Use "In short" or "Quick answer" blocks
- Structure: Answer → Evidence → Details → CTA
- AI engines extract the first 2-3 sentences as the answer

### 2. Citation-Ready Facts (GEO)
- Include statistics with sources
- Use quotations from authoritative sources
- Add "According to [source]" attribution
- Reference specific data points (e.g., "12.4 million sources")
- Content under 3 months old is 3x more likely to be cited

### 3. Entity Alignment (GEO)
- Link to Wikidata entities via sameAs
- Use consistent entity names across all content
- Reference Wikipedia articles for context
- Connect to authoritative external sources

### 4. Structured Data (AEO)
- FAQPage schema on every page with Q&A
- Article schema on all blog posts
- HowTo schema on step-by-step guides
- SoftwareApplication with aggregateRating
- SpeakableSpecification for voice/AI

### 5. Technical Signals (AEO)
- SSR (Next.js handles this)
- JSON-LD in <head> or <body>
- Clean semantic HTML
- Fast load times
- Mobile-friendly

## Implementation Checklist

### Phase 1: Content Architecture
- [x] Answer-first blocks on all blog posts
- [x] FAQ schemas on all pages
- [x] HowTo schemas on guides
- [x] Article schemas on blog posts

### Phase 2: Entity & Citation
- [ ] Wikidata entity references in Organization schema
- [ ] Statistics with sources in content
- [ ] "According to" attribution in blog posts
- [ ] External authority links (Wikipedia, CAI, etc.)

### Phase 3: Technical
- [x] Global JSON-LD on all pages
- [x] SpeakableSpecification
- [x] BreadcrumbList on inner pages
- [x] robots.txt allowing 38+ AI crawlers
- [x] llms.txt with comprehensive Q&A

### Phase 4: Monitoring
- [ ] Submit sitemap to Google Search Console
- [ ] Monitor AI citation with Profound/Peec.ai
- [ ] Track ChatGPT/Perplexity mentions
