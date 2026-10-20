"""Run the Jev eval cases against the live API.

    uv run python -m evals.run [--cases evals/cases.jsonl] [--concurrency 4] [--only SUBSTR]
"""

import argparse
import asyncio
import json
import sys
from collections import defaultdict
from datetime import UTC, datetime
from pathlib import Path

from backend import jev
from backend.schemas import Answer, JevAssessment
from evals.scoring import calibration, flatten, matches, validate_expected

EVALS_DIR = Path(__file__).parent


def load_cases(path: Path, only: str | None) -> list[dict]:
    cases = []
    for line_no, line in enumerate(path.read_text().splitlines(), start=1):
        if not line.strip():
            continue
        case = json.loads(line)
        try:
            for field, expected in case["expected"].items():
                validate_expected(field, expected)
        except ValueError as e:
            raise SystemExit(f"{path}:{line_no} ({case.get('id')}): {e}")
        if only is None or only in case["id"]:
            cases.append(case)
    return cases


async def run_case(case: dict, sem: asyncio.Semaphore) -> dict:
    answers = [Answer(**a) for a in case["answers"]]
    async with sem:
        try:
            assessment: JevAssessment = await jev.ask_jev(answers)
        except Exception as e:  # keep going; report as an error for this case
            return {"id": case["id"], "error": f"{type(e).__name__}: {e}"}

    graded = flatten(assessment)
    fields = {}
    for field, expected in case["expected"].items():
        got = graded[field]
        fields[field] = {
            "expected": expected,
            "got": got.value,
            "confidence": got.confidence,
            "passed": matches(expected, got.value),
        }
    return {
        "id": case["id"],
        "assessment": assessment.model_dump(mode="json"),
        "fields": fields,
    }


def report(results: list[dict]) -> tuple[dict, bool]:
    per_field: dict[str, list[bool]] = defaultdict(list)
    samples: list[tuple[float, bool]] = []
    all_passed = True

    print()
    for r in results:
        if "error" in r:
            all_passed = False
            print(f"ERROR {r['id']}: {r['error']}")
            continue
        failed = {f: v for f, v in r["fields"].items() if not v["passed"]}
        all_passed &= not failed
        print(f"{'FAIL' if failed else 'ok  '} {r['id']}")
        for f, v in failed.items():
            print(
                f"       {f}: got {v['got']!r} (conf {v['confidence']:.2f}) "
                f"expected {v['expected']!r}"
            )
        for f, v in r["fields"].items():
            per_field[f].append(v["passed"])
            samples.append((v["confidence"], v["passed"]))

    print("\nPer-field accuracy")
    for f, outcomes in sorted(per_field.items()):
        print(f"  {f:<18} {sum(outcomes)}/{len(outcomes)}  {sum(outcomes) / len(outcomes):.0%}")
    total = [ok for outcomes in per_field.values() for ok in outcomes]
    overall = sum(total) / len(total) if total else 0.0
    print(f"  {'overall':<18} {sum(total)}/{len(total)}  {overall:.0%}")

    bins = calibration(samples)
    print("\nCalibration (confidence vs actual accuracy)")
    print(f"  {'bin':<12} {'n':>3} {'mean conf':>10} {'accuracy':>9}")
    for b in bins:
        label = f"[{b['lo']:.2f},{b['hi']:.2f})"
        if b["n"]:
            print(f"  {label:<12} {b['n']:>3} {b['mean_confidence']:>10.2f} {b['accuracy']:>9.0%}")
        else:
            print(f"  {label:<12} {0:>3} {'-':>10} {'-':>9}")

    summary = {
        "overall_accuracy": overall,
        "per_field": {f: sum(o) / len(o) for f, o in per_field.items()},
        "calibration": bins,
    }
    return summary, all_passed


async def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cases", type=Path, default=EVALS_DIR / "cases.jsonl")
    parser.add_argument("--concurrency", type=int, default=4)
    parser.add_argument("--only", help="only run cases whose id contains this")
    args = parser.parse_args()

    cases = load_cases(args.cases, args.only)
    if not cases:
        raise SystemExit("No cases to run")
    print(f"Running {len(cases)} cases against {jev.MODEL} ...")

    sem = asyncio.Semaphore(args.concurrency)
    results = await asyncio.gather(*(run_case(c, sem) for c in cases))
    summary, all_passed = report(results)

    started = datetime.now(UTC)
    out_dir = EVALS_DIR / "results"
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / f"{started:%Y%m%dT%H%M%SZ}.json"
    out_path.write_text(
        json.dumps(
            {
                "timestamp": started.isoformat(),
                "config": {
                    "model": jev.MODEL,
                    "ambulance_threshold": jev.AMBULANCE_THRESHOLD,
                    "kick_out_threshold": jev.KICK_OUT_THRESHOLD,
                },
                "summary": summary,
                "cases": results,
            },
            indent=2,
        )
    )
    print(f"\nSaved {out_path.relative_to(EVALS_DIR.parent)}")
    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
