import os
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

try:
    import faiss
    import numpy as np
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    logger.warning("faiss not available — vector search disabled")


class ObsidianMemory:
    def __init__(self, vault_path: str, enabled: bool = True):
        self.vault_path = Path(vault_path)
        self.enabled = enabled
        self._index = None
        self._documents: List[Dict[str, Any]] = []
        self._dimension = 384

        if self.enabled:
            self._ensure_vault_dirs()
            self._load_existing_notes()

    def _ensure_vault_dirs(self):
        dirs = [
            self.vault_path / "knowledge",
            self.vault_path / "trajectory",
            self.vault_path / "patterns",
            self.vault_path / "decisions",
            self.vault_path / "scan-history",
        ]
        for d in dirs:
            d.mkdir(parents=True, exist_ok=True)

    def _load_existing_notes(self):
        if not FAISS_AVAILABLE:
            return
        knowledge_dir = self.vault_path / "knowledge"
        if not knowledge_dir.exists():
            return
        for md_file in knowledge_dir.glob("*.md"):
            try:
                content = md_file.read_text(encoding="utf-8")
                doc = {
                    "id": md_file.stem,
                    "content": content,
                    "file": str(md_file),
                    "timestamp": md_file.stat().st_mtime,
                }
                self._documents.append(doc)
            except Exception as e:
                logger.warning(f"Failed to load note {md_file}: {e}")

    def remember(self, key: str, value: Any, tags: Optional[List[str]] = None) -> str:
        if not self.enabled:
            return ""
        note_id = f"{key}-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"
        tags_str = " ".join(f"#{t}" for t in (tags or []))
        timestamp = datetime.now(timezone.utc).isoformat()
        content = f"# {key}\n\n**Timestamp**: {timestamp}\n**Tags**: {tags_str}\n\n{json.dumps(value, default=str, indent=2)}\n"
        note_path = self.vault_path / "knowledge" / f"{note_id}.md"
        note_path.write_text(content, encoding="utf-8")
        self._documents.append({"id": note_id, "content": content, "file": str(note_path), "timestamp": note_path.stat().st_mtime})
        return note_id

    def recall(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        if not self.enabled or not self._documents:
            return []
        results = []
        for doc in self._documents:
            if query.lower() in doc["content"].lower():
                results.append(doc)
        return results[:limit]

    def record_trajectory(self, action: str, result: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        if not self.enabled:
            return ""
        timestamp = datetime.now(timezone.utc).isoformat()
        entry = {
            "timestamp": timestamp,
            "action": action,
            "result": result,
            "metadata": metadata or {},
        }
        entry_id = f"traj-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"
        note_path = self.vault_path / "trajectory" / f"{entry_id}.md"
        content = f"# {action}\n\n**Timestamp**: {timestamp}\n\n**Result**: {result}\n\n**Metadata**:\n```json\n{json.dumps(metadata, default=str, indent=2)}\n```\n"
        note_path.write_text(content, encoding="utf-8")
        return entry_id

    def record_pattern(self, pattern_type: str, description: str, data: Optional[Dict[str, Any]] = None) -> str:
        if not self.enabled:
            return ""
        timestamp = datetime.now(timezone.utc).isoformat()
        entry_id = f"pat-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"
        note_path = self.vault_path / "patterns" / f"{entry_id}.md"
        content = f"# Pattern: {pattern_type}\n\n**Timestamp**: {timestamp}\n\n{description}\n\n**Data**:\n```json\n{json.dumps(data, default=str, indent=2)}\n```\n"
        note_path.write_text(content, encoding="utf-8")
        return entry_id

    def get_scan_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        if not self.enabled:
            return []
        history = []
        scan_dir = self.vault_path / "scan-history"
        if not scan_dir.exists():
            return history
        for md_file in sorted(scan_dir.glob("*.md"), reverse=True)[:limit]:
            try:
                content = md_file.read_text(encoding="utf-8")
                history.append({"id": md_file.stem, "content": content, "file": str(md_file)})
            except Exception:
                pass
        return history

    def record_scan(self, file_name: str, result: Dict[str, Any]) -> str:
        if not self.enabled:
            return ""
        timestamp = datetime.now(timezone.utc).isoformat()
        entry_id = f"scan-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"
        note_path = self.vault_path / "scan-history" / f"{entry_id}.md"
        content = f"# Scan: {file_name}\n\n**Timestamp**: {timestamp}\n\n**Result**:\n```json\n{json.dumps(result, default=str, indent=2)}\n```\n"
        note_path.write_text(content, encoding="utf-8")
        return entry_id

    def get_stats(self) -> Dict[str, Any]:
        return {
            "enabled": self.enabled,
            "vault_path": str(self.vault_path),
            "total_documents": len(self._documents),
            "faiss_available": FAISS_AVAILABLE,
            "dirs": {
                "knowledge": str(self.vault_path / "knowledge"),
                "trajectory": str(self.vault_path / "trajectory"),
                "patterns": str(self.vault_path / "patterns"),
                "scan-history": str(self.vault_path / "scan-history"),
            },
        }


obsidian_memory = ObsidianMemory(
    vault_path=Path(os.getenv("OBSIDIAN_VAULT_PATH", "./cvber-brain")),
    enabled=os.getenv("OBSIDIAN_MEMORY_ENABLED", "true").lower() in ("1", "true", "yes"),
)