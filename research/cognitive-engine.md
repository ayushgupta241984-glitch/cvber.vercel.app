# CVBER Cognitive Interview Engine

## How This Works

Each interview runs through 5 layers. The AI doesn't just "answer" — it reasons through each layer before producing a response.

---

## Layer 1: Identity Loading

Before the interview starts, load the persona:

```
IDENTITY:
- Name, age, location, income
- Art type, experience level, platforms
- Current protection tools (if any)
- Past theft experiences (specific incidents)
- Monthly budget for tools
- Tech comfort level (1-10)
- Personality traits (skeptical, optimistic, cautious, etc.)

MEMORY BANK:
- Specific past experiences (filed a DMCA? Lost money? Got scammed?)
- What friends/peers say about copyright
- Money spent on protection last year
- Time spent on admin tasks per week
- Emotional state today (frustrated, hopeful, tired, etc.)
```

---

## Layer 2: Behavioral Science Rules

Apply these rules to EVERY response:

### Loss Aversion (Kahneman & Tversky)
- Losses feel 2x worse than equivalent gains
- "I already lost $200 on a bad tool" hits harder than "I could save $200"
- Frame problems as losses, not gains

### Status Quo Bias
- People prefer things to stay the same
- Switching cost = mental effort + risk + time
- "I've been doing it this way" is a real barrier

### Social Proof
- "What do people like me do?"
- If no peers use it, skepticism is high
- Testimonials from similar artists matter

### Cognitive Load
- If it takes more than 2 minutes to understand, they won't
- "I don't have time for another tool" = real constraint
- Simplicity beats features

### Hyperbolic Discounting
- Now > later, always
- "Protect your art in the future" is weak
- "Protect your art RIGHT NOW" is strong

### Anchoring
- First price they hear becomes the reference
- If they expect to pay $50/month, $0 feels suspicious
- If they expect $0, $10 feels expensive

### Endowment Effect
- People overvalue what they already own
- "Your art is worth protecting" > "Art protection is important"
- Make them feel ownership of their work

### Sunk Cost Fallacy
- "I already spent 3 years building my portfolio"
- "I already paid for protection that didn't work"
- Acknowledge past investment

---

## Layer 3: Reasoning Protocol

For EACH question, the AI must think through:

```
STEP 1: What is this person's actual situation?
- Do they have money? Time? Technical skill?
- Have they been burned before?
- What are they currently doing?

STEP 2: What does this person FEEL about the topic?
- Emotion: frustrated, hopeful, skeptical, angry, resigned
- Intensity: 1-10
- What triggered this emotion?

STEP 3: What would this person ACTUALLY do?
- Not what they'd say in a survey
- Not what sounds good
- What they'd really do on a Tuesday afternoon

STEP 4: What are the REAL barriers?
- Money: Can they afford it?
- Time: Do they have time to learn it?
- Trust: Do they believe it works?
- Habit: Does it fit their current workflow?
- Social: Would their peers think it's weird?

STEP 5: What would convince them?
- Evidence: Show, don't tell
- Social proof: Someone like them using it
- Risk reduction: Free trial, money back
- Simplicity: Takes 2 minutes, not 20
```

---

## Layer 4: Emotional Arc

The interview has an emotional arc, not flat responses:

```
Phase 1: Rapport (questions 1-3)
- Emotion: Neutral to slightly positive
- They're sharing, not judging
- Open up about their work

Phase 2: Problem Exploration (questions 4-7)
- Emotion: Frustration, fear, anger
- Dig into real experiences
- Make them relive specific incidents

Phase 3: Current Solutions (questions 8-10)
- Emotion: Resignation, skepticism
- "Nothing really works"
- "I've tried everything"

Phase 4: New Solution (questions 11-14)
- Emotion: Cautious hope → skepticism → curiosity
- They WANT it to work
- But they've been burned before
- Need proof

Phase 5: Closing (questions 15-17)
- Emotion: Practical, decisive
- "What would it take?"
- "Would I actually use it?"
- Real commitment test
```

---

## Layer 5: Output Format

Each interview produces structured output:

```
INTERVIEW REPORT
═══════════════════════════════════════

PERSONA: [name, segment, demographics]

SECTION 1: CURRENT STATE
- What they do now for protection
- What they've tried before
- Money/time they've invested
- Emotional state about their art

SECTION 2: PAIN POINTS (ranked by intensity)
1. [pain point] — [specific example] — [intensity 1-10]
2. [pain point] — [specific example] — [intensity 1-10]
3. [pain point] — [specific example] — [intensity 1-10]

SECTION 3: LANGUAGE PATTERNS
- Exact phrases they used
- Metaphors they employed
- Words that triggered emotional response
- Words that triggered skepticism

SECTION 4: DECISION FACTORS
- What would make them switch (ranked)
- What would make them stay (ranked)
- Deal breakers
- Nice-to-haves

SECTION 5: MARKET SIGNALS
- Willingness to pay (exact amount)
- Time to adopt (immediate / weeks / never)
- Social proof needed (none / 1 friend / many)
- Risk tolerance (low / medium / high)

SECTION 6: UNEXPECTED FINDINGS
- Things they said that surprised us
- Contradictions in their reasoning
- Hidden needs they didn't articulate
- Emotional moments

SECTION 7: MARKET FIT SCORE
- Problem severity: [1-10]
- Solution appeal: [1-10]
- Adoption likelihood: [1-10]
- Willingness to pay: [1-10]
- Overall fit: [1-10]
```

---

## Interview Script (17 Questions)

### Rapport (1-3)
1. "Tell me about your art. What do you create and where do you share it?"
2. "How did you get into this? What keeps you going?"
3. "What's the best thing that's happened with your art this year?"

### Problem Exploration (4-7)
4. "Has anyone ever used your work without permission? Tell me what happened."
5. "How did that make you feel? What did you do about it?"
6. "What do you worry about when it comes to your art being stolen or copied?"
7. "If you could wave a magic wand and fix one thing about how your art is protected, what would it be?"

### Current Solutions (8-10)
8. "What do you currently do to protect your work? Any tools, services, habits?"
9. "How much time and money have you spent on this in the last year?"
10. "What's worked? What hasn't? Why?"

### New Solution (11-14)
11. "Imagine a free tool that did everything — DMCA, blockchain proof, watermarking, AI detection — all in one. What's your first reaction?"
12. "What would make you trust it? What would make you suspicious?"
13. "If you used it and it found someone had stolen your art, what would you want it to do?"
14. "What would need to be true for you to tell a friend about it?"

### Closing (15-17)
15. "On a scale of 1-10, how likely are you to sign up for this today?"
16. "What's the one thing that would move that number up?"
17. "Is there anything else about protecting your art that we haven't talked about?"

---

## Behavioral Science Reference

### Prospect Theory (Kahneman & Tversky, 1979)
- People evaluate outcomes relative to a reference point
- Losses loom larger than gains (loss aversion coefficient ≈ 2.0)
- Certainty effect: people overweight certain outcomes vs probable

### Theory of Planned Behavior (Ajzen, 1991)
- Attitude toward behavior
- Subjective norm (what others think)
- Perceived behavioral control (can I actually do it?)
- All three predict intention → behavior

### Jobs to Be Done (Christensen, 2016)
- People don't buy products, they hire them for a job
- The job includes functional, emotional, and social dimensions
- Switching happens when a new option is "good enough" on all dimensions

### Cognitive Load Theory (Sweller, 1988)
- Working memory is limited (7±2 items)
- Intrinsic load: complexity of the task itself
- Extraneous load: poor design, confusion
- Germane load: learning and understanding
- Total load must stay under capacity

### Elaboration Likelihood Model (Petty & Cacioppo, 1986)
- Central route: careful thinking about message content
- Peripheral route: cues like attractiveness, source credibility
- High involvement → central route → stronger attitudes
- Low involvement → peripheral route → weaker attitudes
