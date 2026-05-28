"""Self-improving agent system — inspired by Hermes Agent (Nous Research).
Stores skills, trajectories, and memory locally as JSON files.
The agent learns from past search results to improve future searches."""

import json
import os
import logging
import time
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

MEMORY_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".cvber_memory")

STRATEGIES_FILE = os.path.join(MEMORY_DIR, "strategies.json")
TRAJECTORIES_FILE = os.path.join(MEMORY_DIR, "trajectories.json")
MEMORY_FILE = os.path.join(MEMORY_DIR, "memory.json")
MAX_TRAJECTORIES = 500


def _ensure_dir():
    os.makedirs(MEMORY_DIR, exist_ok=True)


def _load_json(path: str, default):
    try:
        if os.path.exists(path):
            with open(path, "r") as f:
                return json.load(f)
    except Exception as e:
        logger.warning(f"Failed to load {path}: {e}")
    return default


def _save_json(path: str, data):
    try:
        _ensure_dir()
        with open(path, "w") as f:
            json.dump(data, f, indent=2, default=str)
    except Exception as e:
        logger.warning(f"Failed to save {path}: {e}")


# ─── Strategies (Skills) ───────────────────────────────────────────────

def load_strategies() -> list:
    return _load_json(STRATEGIES_FILE, [])


def save_strategy(name: str, image_type_hint: str, trigger_keywords: list,
                  strategy: dict, success: bool = True):
    strategies = load_strategies()
    existing = None
    for s in strategies:
        if s.get("name") == name:
            existing = s
            break
    if existing:
        existing["success_count"] = existing.get("success_count", 1) + (1 if success else 0)
        existing["failure_count"] = existing.get("failure_count", 0) + (0 if success else 1)
        existing["last_used"] = datetime.now(timezone.utc).isoformat()
        existing["strategy"] = strategy
    else:
        strategies.append({
            "name": name,
            "image_type_hint": image_type_hint,
            "trigger_keywords": trigger_keywords,
            "strategy": strategy,
            "success_count": 1 if success else 0,
            "failure_count": 0 if success else 1,
            "last_used": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    _save_json(STRATEGIES_FILE, strategies)
    return strategies


def find_strategy(image_type: str, vision_desc: str) -> Optional[dict]:
    """Find the best matching strategy based on image type and description."""
    strategies = load_strategies()
    if not strategies:
        return None

    desc_lower = vision_desc.lower() if vision_desc else ""
    scored = []

    for s in strategies:
        score = 0
        hint = s.get("image_type_hint", "")
        if hint and hint == image_type:
            score += 3
        for kw in s.get("trigger_keywords", []):
            if kw.lower() in desc_lower:
                score += 1
        success_rate = s.get("success_count", 1) / max(s.get("success_count", 1) + s.get("failure_count", 0), 1)
        score += success_rate * 2
        scored.append((score, s))

    scored.sort(key=lambda x: -x[0])
    best = scored[0][1]
    if scored[0][0] >= 2:
        logger.info(f"Found strategy '{best['name']}' (score={scored[0][0]:.1f})")
        return best
    return None


# ─── Trajectories (Search History) ─────────────────────────────────────

def load_trajectories(limit: int = 20) -> list:
    return _load_json(TRAJECTORIES_FILE, [])[:limit]


def save_trajectory(scan_id: str, file_name: str, image_type: str,
                    vision_description: str, keywords_used: str,
                    engines_used: list, threshold_used: float,
                    result_count: int, match_count: int, similar_count: int,
                    top_scores: list, was_successful: bool = None,
                    strategy_name: str = None):
    trajectories = _load_json(TRAJECTORIES_FILE, [])
    trajectories.insert(0, {
        "scan_id": scan_id,
        "file_name": file_name,
        "image_type": image_type,
        "vision_description": vision_description[:200] if vision_description else "",
        "keywords_used": keywords_used,
        "engines_used": engines_used,
        "threshold_used": threshold_used,
        "result_count": result_count,
        "match_count": match_count,
        "similar_count": similar_count,
        "top_scores": [round(s, 3) for s in (top_scores or [])][:10],
        "was_successful": was_successful,
        "strategy_name": strategy_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    # Trim to max
    if len(trajectories) > MAX_TRAJECTORIES:
        trajectories = trajectories[:MAX_TRAJECTORIES]
    _save_json(TRAJECTORIES_FILE, trajectories)
    return trajectories


def get_recent_trajectories(limit: int = 5) -> list:
    return load_trajectories(limit)


def get_success_rate() -> dict:
    """Calculate success rate from recent trajectories."""
    trajs = load_trajectories(50)
    total = len(trajs)
    if total == 0:
        return {"total": 0, "successful": 0, "rate": 0, "avg_match_count": 0}

    successful = sum(1 for t in trajs if t.get("was_successful") is True)
    failed = sum(1 for t in trajs if t.get("was_successful") is False)
    match_counts = [t.get("match_count", 0) for t in trajs if t.get("match_count", 0) > 0]

    return {
        "total": total,
        "successful": successful,
        "failed": failed,
        "rate": round(successful / max(total, 1), 3),
        "avg_match_count": round(sum(match_counts) / max(len(match_counts), 1), 1) if match_counts else 0,
    }


# ─── Agent Memory (Key-Value) ──────────────────────────────────────────

def load_memory() -> dict:
    return _load_json(MEMORY_FILE, {})


def remember(key: str, value: str):
    memory = load_memory()
    memory[key] = {"value": value, "updated_at": datetime.now(timezone.utc).isoformat()}
    _save_json(MEMORY_FILE, memory)


def recall(key: str) -> Optional[str]:
    memory = load_memory()
    entry = memory.get(key)
    return entry.get("value") if entry else None


def recall_all(category: str = None) -> dict:
    memory = load_memory()
    if category:
        return {k: v for k, v in memory.items() if v.get("value", "").startswith(f"[{category}]")}
    return memory


# ─── Learning Engine ────────────────────────────────────────────────────

def learn_from_search(scan_id: str, file_name: str, image_type: str,
                      vision_description: str, keywords_used: str,
                      engines_used: list, threshold_used: float,
                      matches: list, similar: list, ris_results: dict):
    """Analyze search outcome, extract strategy, and save as skill."""
    result_count = len(matches) + len(similar)
    match_count = len(matches)
    similar_count = len(similar)
    top_scores = [m.get("score", 0) for m in (matches + similar) if m.get("score")]

    # Determine if search was successful
    was_successful = match_count > 0

    # Find existing strategy
    strategy_name = None
    strategy = find_strategy(image_type, vision_description)
    if strategy:
        strategy_name = strategy["name"]
    elif was_successful:
        # Extract the winning pattern as a new strategy
        name = f"search_{file_name.rsplit('.',1)[0][:20]}_{image_type}"
        trigger_kw = []
        if keywords_used:
            trigger_kw = keywords_used.split()[:5]
        strategy_data = {
            "engines": engines_used,
            "threshold": threshold_used,
            "keyword_enabled": bool(keywords_used),
        }
        save_strategy(name, image_type, trigger_kw, strategy_data, success=True)
        strategy_name = name
        logger.info(f"Created new search strategy: '{name}'")

    # Save trajectory
    save_trajectory(
        scan_id=scan_id, file_name=file_name, image_type=image_type,
        vision_description=vision_description, keywords_used=keywords_used,
        engines_used=engines_used, threshold_used=threshold_used,
        result_count=result_count, match_count=match_count,
        similar_count=similar_count, top_scores=top_scores,
        was_successful=was_successful, strategy_name=strategy_name,
    )

    # Store lessons
    if was_successful:
        remember(f"last_successful_search_{scan_id[:8]}", json.dumps({
            "file": file_name,
            "type": image_type,
            "engines": engines_used,
            "threshold": threshold_used,
            "keywords": keywords_used,
            "match_count": match_count,
        }))

    # Log lessons learned
    lessons = []
    if match_count == 0 and result_count > 0:
        lessons.append(f"threshold_{threshold_used}_too_high_for_{image_type}")
        remember(f"lesson:threshold:{image_type}", f"Threshold {threshold_used} yielded 0 matches for {image_type}. Consider lowering.")
    if result_count == 0:
        lessons.append(f"no_results_for_{image_type}")
        remember(f"lesson:engine:{image_type}", f"Engines {engines_used} yielded 0 results for {image_type}. Try alternative engines.")
    if match_count > 0:
        avg_score = sum(top_scores) / len(top_scores) if top_scores else 0
        remember(f"lesson:good_threshold:{image_type}", f"Threshold {threshold_used} worked for {image_type} (avg score {avg_score:.3f})")

    return {
        "result_count": result_count,
        "match_count": match_count,
        "was_successful": was_successful,
        "strategy_used": strategy_name,
        "lessons": lessons,
    }


def get_adaptive_threshold(image_type: str, vision_description: str,
                           default_threshold: float = 0.75) -> float:
    """Get an adaptive threshold based on past search success for this image type."""
    # Check if we have a lesson about this
    lesson = recall(f"lesson:threshold:{image_type}")
    if lesson:
        logger.info(f"Adaptive threshold: found lesson for '{image_type}': {lesson[:80]}")
        # If we learned it's too high, lower it
        if "too_high" in lesson.lower() or "0 matches" in lesson:
            return max(0.4, default_threshold - 0.15)

    # Check if we have a good threshold
    good = recall(f"lesson:good_threshold:{image_type}")
    if good:
        logger.info(f"Adaptive threshold: found good threshold lesson for '{image_type}'")

    # Check if a strategy exists with a custom threshold
    strategy = find_strategy(image_type, vision_description)
    if strategy and "threshold" in strategy.get("strategy", {}):
        custom_t = strategy["strategy"]["threshold"]
        logger.info(f"Adaptive threshold: using strategy '{strategy['name']}' threshold={custom_t}")
        return custom_t

    return default_threshold


def get_search_report() -> str:
    """Generate a human-readable report of the agent's self-improvement status."""
    stats = get_success_rate()
    strategies = load_strategies()
    trajectories = get_recent_trajectories(5)
    memory = load_memory()

    lines = [
        "=== Agent Self-Improvement Report ===",
        f"Success rate: {stats['rate']*100:.0f}% ({stats['successful']}/{stats['total']} searches)",
        f"Avg matches per search: {stats['avg_match_count']}",
        f"Strategies learned: {len(strategies)}",
        f"Memory entries: {len(memory)}",
        "",
    ]

    if strategies:
        lines.append("-- Strategies --")
        for s in strategies[:5]:
            sr = s.get("success_count", 1) / max(s.get("success_count", 1) + s.get("failure_count", 0), 1)
            lines.append(f"  {s['name']}: {s.get('success_count',0)} ok, {s.get('failure_count',0)} fail (rate {sr*100:.0f}%)")
        lines.append("")

    if trajectories:
        lines.append("-- Recent Searches --")
        for t in trajectories[:3]:
            ok = "OK" if t.get("was_successful") else "FAIL" if t.get("was_successful") is False else "?"
            lines.append(f"  {ok} {t.get('file_name','?')} -> {t.get('match_count',0)}m/{t.get('similar_count',0)}s (th={t.get('threshold_used','?')})")
        lines.append("")

    lessons = [(k, v) for k, v in memory.items() if k.startswith("lesson:")]
    if lessons:
        lines.append("-- Lessons Learned --")
        for k, v in lessons[:5]:
            short_k = k.replace("lesson:", "").replace(":", " -> ")
            lines.append(f"  {short_k}: {v.get('value','')[:80] if isinstance(v, dict) else str(v)[:80]}")

    return "\n".join(lines)
