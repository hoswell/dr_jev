import pytest

from backend.schemas import (
    ChoiceResult,
    Emotion,
    JevAssessment,
    NoulResult,
    ScoreResult,
    Treatment,
)
from evals.scoring import FIELDS, calibration, flatten, matches, validate_expected


def _assessment() -> JevAssessment:
    return JevAssessment(
        criticality=ScoreResult(score=8, confidence=0.9),
        call_ambulance=NoulResult(noul=True, probability=0.9),
        treatment=ChoiceResult[Treatment](choice=Treatment.TX_003, confidence=0.8),
        patient_honesty=ScoreResult(score=2, confidence=0.7),
        patient_stability=ScoreResult(score=6, confidence=0.88),
        patient_emotion=ChoiceResult[Emotion](choice=Emotion.AFRAID, confidence=0.6),
        doctor_emotion=ChoiceResult[Emotion](choice=Emotion.ANXIOUS, confidence=0.5),
        kick_out_office=NoulResult(noul=False, probability=0.25),
    )


def test_flatten_covers_every_field_and_result_type():
    graded = flatten(_assessment())

    assert set(graded) == set(FIELDS)
    assert (graded["criticality"].value, graded["criticality"].confidence) == (8, 0.9)
    assert (graded["treatment"].value, graded["treatment"].confidence) == ("Get checked in the emergency room", 0.8)
    assert graded["call_ambulance"].value is True
    assert graded["call_ambulance"].confidence == pytest.approx(0.8)  # |2*0.9 - 1|
    assert graded["kick_out_office"].value is False
    assert graded["kick_out_office"].confidence == pytest.approx(0.5)  # |2*0.25 - 1|


@pytest.mark.parametrize(
    ("expected", "value", "ok"),
    [
        (True, True, True),
        (True, False, False),
        ("afraid", "afraid", True),
        ("afraid", "calm", False),
        (["afraid", "anxious"], "anxious", True),
        (["afraid", "anxious"], "calm", False),
        ([7, 9], 7, True),
        ([7, 9], 9, True),
        ([7, 9], 6, False),
        ([7, 9], 10, False),
        (5, 5, True),
        (5, 6, False),
    ],
)
def test_matches(expected, value, ok):
    assert matches(expected, value) is ok


def test_matches_range_does_not_accept_bools():
    assert matches([0, 1], True) is False


def test_validate_expected_accepts_good_values():
    for field, expected in [
        ("criticality", [7, 9]),
        ("criticality", 8),
        ("call_ambulance", True),
        ("treatment", "Rest and recover (cozy-mode bonus)"),
        ("patient_emotion", ["angry", "afraid"]),
    ]:
        validate_expected(field, expected)


@pytest.mark.parametrize(
    ("field", "expected"),
    [
        ("nope", True),
        ("criticality", [1, 2, 3]),
        ("criticality", []),
        ("criticality", None),
        ("criticality", ["a", 1]),
    ],
)
def test_validate_expected_rejects_bad_values(field, expected):
    with pytest.raises(ValueError):
        validate_expected(field, expected)


def test_calibration_bins():
    samples = [(0.1, False), (0.4, True), (0.6, True), (0.9, True), (0.9, False), (1.0, True)]

    bins = calibration(samples)

    assert [b["n"] for b in bins] == [2, 1, 2, 1]  # 1.0 lands in the last (closed) bin
    assert bins[0]["accuracy"] == 0.5
    assert bins[0]["mean_confidence"] == pytest.approx(0.25)
    assert bins[2]["accuracy"] == 0.5
    assert bins[3]["accuracy"] == 1.0


def test_calibration_empty_bin_is_none():
    bins = calibration([(0.9, True)])

    assert bins[0]["n"] == 0
    assert bins[0]["accuracy"] is None
