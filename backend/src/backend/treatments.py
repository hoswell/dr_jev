import json
from enum import StrEnum
from pathlib import Path

TREATMENTS_FILE = (
    Path(__file__).resolve().parents[2]
    / "examples"
    / "jev_treatment_classification_request.json"
)

MAX_CHOICES = 255  # Jev's Choice question limit


def _load() -> list[tuple[str, str]]:
    entries = json.loads(TREATMENTS_FILE.read_text())
    ids = [e["id"] for e in entries]
    labels = [e["label"] for e in entries]
    if len(set(ids)) != len(ids) or len(set(labels)) != len(labels):
        raise ValueError(f"Duplicate treatment ids or labels in {TREATMENTS_FILE}")
    if not 1 <= len(entries) <= MAX_CHOICES:
        raise ValueError(f"Expected 1-{MAX_CHOICES} treatments, got {len(entries)}")
    return list(zip(ids, labels))


# Members are named after the file's ids (TX_001...); values are the human-readable
# labels, which are what Jev chooses between and what the API returns.
Treatment = StrEnum("Treatment", {tid.upper(): label for tid, label in _load()})

# Choice criteria: the label is the option itself, so no separate description
TREATMENT_CRITERIA: dict[Treatment, None] = {t: None for t in Treatment}
