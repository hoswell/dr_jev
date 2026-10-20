"""Pure eval logic: normalising assessment fields, matching labels, calibration."""

from dataclasses import dataclass

from backend.schemas import ChoiceResult, JevAssessment, NoulResult, ScoreResult

FIELDS = tuple(JevAssessment.model_fields)

CALIBRATION_BINS = (0.0, 0.5, 0.8, 0.95, 1.0)

type Expected = bool | int | float | str | list[int | float] | list[str]


@dataclass(frozen=True)
class Graded:
    value: bool | int | str
    confidence: float


def flatten(assessment: JevAssessment) -> dict[str, Graded]:
    """Reduce every assessment field to a (value, confidence) pair, whatever its type."""
    graded: dict[str, Graded] = {}
    for name in FIELDS:
        result = getattr(assessment, name)
        match result:
            case ScoreResult():
                graded[name] = Graded(result.score, result.confidence)
            case ChoiceResult():
                graded[name] = Graded(str(result.choice), result.confidence)
            case NoulResult():
                # Noul has no confidence; |2p - 1| is the docs' confidence-style stand-in
                graded[name] = Graded(result.noul, abs(2 * result.probability - 1))
            case _:
                raise TypeError(f"Unsupported result type for {name}: {type(result)}")
    return graded


def _is_number(x: object) -> bool:
    return isinstance(x, int | float) and not isinstance(x, bool)


def validate_expected(field: str, expected: object) -> None:
    if field not in FIELDS:
        raise ValueError(f"Unknown field {field!r}; expected one of {FIELDS}")
    if isinstance(expected, bool | str) or _is_number(expected):
        return
    if isinstance(expected, list) and expected:
        if all(isinstance(x, str) for x in expected):
            return
        if len(expected) == 2 and all(_is_number(x) for x in expected):
            return
    raise ValueError(
        f"Bad expected value for {field!r}: {expected!r} "
        "(use a bool, string, number, [lo, hi] range or list of strings)"
    )


def matches(expected: Expected, value: bool | int | str) -> bool:
    """bool/str/number -> equality, [lo, hi] -> inclusive range, list[str] -> any-of."""
    if isinstance(expected, list):
        if all(isinstance(x, str) for x in expected):
            return value in expected
        lo, hi = expected
        return _is_number(value) and lo <= value <= hi
    return value == expected


def calibration(
    samples: list[tuple[float, bool]], edges: tuple[float, ...] = CALIBRATION_BINS
) -> list[dict]:
    """Per confidence bin: how many answers, mean confidence, and actual accuracy."""
    rows = []
    for i, (lo, hi) in enumerate(zip(edges, edges[1:])):
        last = i == len(edges) - 2
        in_bin = [
            (conf, ok) for conf, ok in samples if lo <= conf < hi or (last and conf == hi)
        ]
        n = len(in_bin)
        rows.append(
            {
                "lo": lo,
                "hi": hi,
                "n": n,
                "mean_confidence": sum(c for c, _ in in_bin) / n if n else None,
                "accuracy": sum(ok for _, ok in in_bin) / n if n else None,
            }
        )
    return rows
