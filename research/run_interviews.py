#!/usr/bin/env python3
"""
CVBER Research — Cognitive Interview Runner
Runs deep synthetic interviews using behavioral science.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# ─── Configuration ───────────────────────────────────────────────

RESEARCH_DIR = Path(__file__).parent
PERSONAS_DIR = RESEARCH_DIR / "personas"
DATA_DIR = RESEARCH_DIR / "data"
RESULTS_DIR = RESEARCH_DIR / "results"

# Interview questions
QUESTIONS = [
    # Rapport (1-3)
    {"phase": "rapport", "q": "Tell me about your art. What do you create and where do you share it?"},
    {"phase": "rapport", "q": "How did you get into this? What keeps you going?"},
    {"phase": "rapport", "q": "What's the best thing that's happened with your art this year?"},
    # Problem Exploration (4-7)
    {"phase": "problem", "q": "Has anyone ever used your work without permission? Tell me what happened."},
    {"phase": "problem", "q": "How did that make you feel? What did you do about it?"},
    {"phase": "problem", "q": "What do you worry about when it comes to your art being stolen or copied?"},
    {"phase": "problem", "q": "If you could wave a magic wand and fix one thing about how your art is protected, what would it be?"},
    # Current Solutions (8-10)
    {"phase": "solutions", "q": "What do you currently do to protect your work? Any tools, services, habits?"},
    {"phase": "solutions", "q": "How much time and money have you spent on this in the last year?"},
    {"phase": "solutions", "q": "What's worked? What hasn't? Why?"},
    # New Solution (11-14)
    {"phase": "solution", "q": "Imagine a free tool that did everything — DMCA, blockchain proof, watermarking, AI detection — all in one. What's your first reaction?"},
    {"phase": "solution", "q": "What would make you trust it? What would make you suspicious?"},
    {"phase": "solution", "q": "If you used it and it found someone had stolen your art, what would you want it to do?"},
    {"phase": "solution", "q": "What would need to be true for you to tell a friend about it?"},
    # Closing (15-17)
    {"phase": "closing", "q": "On a scale of 1-10, how likely are you to sign up for this today?"},
    {"phase": "closing", "q": "What's the one thing that would move that number up?"},
    {"phase": "closing", "q": "Is there anything else about protecting your art that we haven't talked about?"},
]

# Behavioral science rules (embedded in prompts)
BEHAVIORAL_RULES = """
BEHAVIORAL SCIENCE RULES — apply to every response:

1. LOSS AVERSION: Losses feel 2x worse than gains. Frame as losses.
2. STATUS QUO BIAS: People prefer things to stay the same. Switching is hard.
3. SOCIAL PROOF: "What do people like me do?" matters enormously.
4. COGNITIVE LOAD: If it takes >2 min to understand, they won't.
5. HYPERBOLIC DISCOUNTING: Now > later, always.
6. ANCHORING: First price heard becomes the reference.
7. ENDOWMENT EFFECT: People overvalue what they own.
8. SUNK COST: "I already invested X" is a real barrier.
"""

# Cognitive reasoning protocol
REASONING_PROTOCOL = """
Before answering, think through:

1. SITUATION: What is this person's actual situation? (money, time, skill, past experiences)
2. EMOTION: What do they FEEL about this topic? (frustrated, hopeful, skeptical, angry)
3. ACTION: What would they ACTUALLY DO? (not what they'd say in a survey)
4. BARRIERS: What are the REAL barriers? (money, time, trust, habit, social)
5. CONVICTION: What would actually convince them? (evidence, social proof, simplicity)
"""


def load_personas(segment: str) -> list:
    """Load persona files for a segment."""
    persona_file = PERSONAS_DIR / f"{segment}.json"
    if not persona_file.exists():
        print(f"No personas found for {segment}")
        return []
    with open(persona_file) as f:
        return json.load(f)


def build_interview_prompt(persona: dict, question: str, history: list) -> str:
    """Build the full prompt for one interview turn."""
    
    history_text = ""
    for h in history:
        history_text += f"\nInterviewer: {h['question']}\n"
        history_text += f"{persona['name']}: {h['answer']}\n"
    
    return f"""You are conducting a deep user research interview.

PERSONA IDENTITY:
{json.dumps(persona, indent=2)}

{BEHAVIORAL_RULES}

{REASONING_PROTOCOL}

CONVERSATION SO FAR:
{history_text}

CURRENT QUESTION: {question}

Think through the 5 reasoning steps first (situation, emotion, action, barriers, conviction), then respond as this persona. Be specific, emotional, contradictory, and real. Include exact numbers, specific incidents, and real language they'd use.

Response as {persona['name']}:"""


def analyze_interview(persona: dict, responses: list) -> dict:
    """Analyze a completed interview and extract structured insights."""
    
    # Build analysis prompt
    responses_text = ""
    for r in responses:
        responses_text += f"\nQ: {r['question']}\nA: {r['answer']}\n"
    
    analysis_prompt = f"""Analyze this interview and extract structured insights.

PERSONA: {json.dumps(persona, indent=2)}

INTERVIEW:
{responses_text}

Extract and return a JSON object with:
1. pain_points: array of {{point, example, intensity_1_10}}
2. language_patterns: array of exact phrases used
3. decision_factors: {{would_switch: [], would_stay: [], deal_breakers: [], nice_to_haves: []}}
4. market_signals: {{willingness_to_pay, time_to_adopt, social_proof_needed, risk_tolerance}}
5. market_fit_scores: {{problem_severity, solution_appeal, adoption_likelihood, willingness_to_pay, overall_fit}} (all 1-10)
6. unexpected_findings: array of strings
7. emotional_arc: description of how emotions changed through interview

Return ONLY valid JSON:"""
    
    return analysis_prompt


def run_analysis_pipeline(segment_results: list) -> dict:
    """Aggregate results across all interviews in a segment."""
    
    total = len(segment_results)
    
    # Aggregate pain points
    all_pain_points = []
    for r in segment_results:
        all_pain_points.extend(r.get("pain_points", []))
    
    # Aggregate market fit scores
    scores = []
    for r in segment_results:
        scores.append(r.get("market_fit_scores", {}))
    
    avg_scores = {}
    if scores:
        for key in ["problem_severity", "solution_appeal", "adoption_likelihood", "willingness_to_pay", "overall_fit"]:
            values = [s.get(key, 0) for s in scores if key in s]
            avg_scores[key] = round(sum(values) / len(values), 2) if values else 0
    
    return {
        "segment": segment_results[0].get("segment", "unknown") if segment_results else "unknown",
        "total_interviews": total,
        "average_scores": avg_scores,
        "top_pain_points": sorted(all_pain_points, key=lambda x: x.get("intensity_1_10", 0), reverse=True)[:10],
        "aggregated_at": datetime.now().isoformat(),
    }


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python run_interviews.py <segment> [--count N]")
        print("Segments: freelance-illustrator, digital-painter, photographer, graphic-designer,")
        print("          comic-manga-artist, 3d-artist, tattoo-artist, ai-assisted-creator")
        sys.exit(1)
    
    segment = sys.argv[1]
    count = 150  # default
    
    if "--count" in sys.argv:
        idx = sys.argv.index("--count")
        count = int(sys.argv[idx + 1])
    
    print(f"CVBER Research — Running {count} interviews for: {segment}")
    print(f"Results will be saved to: {RESULTS_DIR / segment}")
    
    # Load personas
    personas = load_personas(segment)
    if not personas:
        print(f"No personas found. Create {PERSONAS_DIR / segment}.json first.")
        sys.exit(1)
    
    print(f"Loaded {len(personas)} personas")
    print(f"Running {count} interviews...")
    print()
    
    # Interviews would run here via LLM API
    # For now, output the framework
    print("To run interviews, use one of:")
    print("  1. Tell the AI: 'Run 10 interviews for segment [X]'")
    print("  2. Connect an LLM API key and modify this script")
    print("  3. Use Cookiy AI platform with the interview guide")
    print()
    print(f"Interview guide: {RESEARCH_DIR / 'cognitive-engine.md'}")
    print(f"Personas: {PERSONAS_DIR / segment}.json")
    print(f"Questions: {len(QUESTIONS)} per interview")


if __name__ == "__main__":
    main()
