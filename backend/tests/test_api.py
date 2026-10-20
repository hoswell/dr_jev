import pytest
from fastapi.testclient import TestClient
from typesafe_sdk import SystemOneResponse

from backend import jev
from backend.main import app

client = TestClient(app)


class FakeClient:
    states: list = []

    def __init__(self, **_):
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_):
        return None

    async def system_one(self, state, questions):
        assert set(questions) == {
            "criticality",
            "call_ambulance",
            "treatment",
            "patient_honesty",
            "patient_emotion",
            "kick_out_office",
        }
        self.states.append(state)
        return SystemOneResponse.model_validate(
            {
                "model": "jev-test",
                "usage": {"input_tokens": 10, "output_tokens": 1},
                "answers": {
                    "criticality": {
                        "type": "score",
                        "score": 7.6,
                        "confidence": 0.9,
                        "legend": {7: "Urgent"},
                        "probabilities": {7: 0.4, 8: 0.6},
                    },
                    "patient_honesty": {
                        "type": "score",
                        "score": 2.2,
                        "confidence": 0.9,
                        "legend": {2: "Lying"},
                        "probabilities": {2: 0.8, 3: 0.2},
                    },
                    "call_ambulance": {"type": "noul", "noul": 0.6},
                    "kick_out_office": {"type": "noul", "noul": 0.1},
                    "treatment": {
                        "type": "choice",
                        "choice": "hospital_visit",
                        "confidence": 0.9,
                        "probabilities": {"hospital_visit": 0.9, "rest": 0.1},
                    },
                    "patient_emotion": {
                        "type": "choice",
                        "choice": "afraid",
                        "confidence": 0.9,
                        "probabilities": {"afraid": 0.9, "calm": 0.1},
                    },
                },
            }
        )


@pytest.fixture(autouse=True)
def fake_jev(monkeypatch):
    FakeClient.states = []
    monkeypatch.setattr(jev, "AsyncTypeSafeClient", FakeClient)


def _session() -> int:
    res = client.post("/sessions")
    assert res.status_code == 201
    return res.json()["session_id"]


def test_session_ids_increment():
    first = _session()
    assert _session() == first + 1


def test_get_questions():
    res = client.get("/questions")
    assert res.status_code == 200
    questions = res.json()
    assert len(questions) > 0
    assert questions[0].keys() == {"id", "text"}


def test_submit_answers():
    sid = _session()
    res = client.post(
        f"/sessions/{sid}/answers",
        json={"answers": [{"question_id": "q1", "answer": "it hurts a lot"}]},
    )
    assert res.status_code == 200
    assert res.json() == {
        "criticality": 8,
        "call_ambulance": True,
        "treatment": "hospital_visit",
        "patient_honesty": 2,
        "patient_emotion": "afraid",
        "kick_out_office": False,
    }


def test_submit_unknown_session():
    res = client.post(
        "/sessions/999/answers",
        json={"answers": [{"question_id": "q1", "answer": "x"}]},
    )
    assert res.status_code == 404


def test_submit_unknown_question():
    sid = _session()
    res = client.post(
        f"/sessions/{sid}/answers",
        json={"answers": [{"question_id": "zzz", "answer": "x"}]},
    )
    assert res.status_code == 422


def _submit(sid: int, question_id: str, answer: str):
    res = client.post(
        f"/sessions/{sid}/answers",
        json={"answers": [{"question_id": question_id, "answer": answer}]},
    )
    assert res.status_code == 200


def test_answers_accumulate_per_session():
    first, other = _session(), _session()

    _submit(first, "q1", "chest pain")
    _submit(first, "q2", "an hour")
    _submit(other, "q1", "headache")

    answers = [[s["patient_answer"] for s in state] for state in FakeClient.states]
    assert answers == [["chest pain"], ["chest pain", "an hour"], ["headache"]]


def test_invalid_submission_is_not_appended():
    sid = _session()
    _submit(sid, "q1", "chest pain")

    res = client.post(
        f"/sessions/{sid}/answers",
        json={"answers": [{"question_id": "zzz", "answer": "x"}]},
    )
    assert res.status_code == 422

    _submit(sid, "q2", "an hour")
    assert [s["patient_answer"] for s in FakeClient.states[-1]] == ["chest pain", "an hour"]
