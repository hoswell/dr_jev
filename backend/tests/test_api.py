from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


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
        json={
            "answers": [
                {"question_id": "q1", "answer_id": 4},
                {"question_id": "q2", "answer_id": 4},
                {"question_id": "q3", "answer_id": 4},
                {"question_id": "q5", "answer_id": 4},
            ]
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert set(body) == {
        "criticality",
        "call_ambulance",
        "treatment",
        "patient_honesty",
        "patient_emotion",
        "kick_out_office",
    }
    assert body["call_ambulance"] is True
    assert body["patient_emotion"] == "afraid"


def test_submit_unknown_session():
    res = client.post(
        "/sessions/999/answers",
        json={"answers": [{"question_id": "q1", "answer_id": 1}]},
    )
    assert res.status_code == 404


def test_submit_bad_ids():
    sid = _session()
    for answer in (
        {"question_id": "zzz", "answer_id": 1},
        {"question_id": "q1", "answer_id": 99},
    ):
        res = client.post(f"/sessions/{sid}/answers", json={"answers": [answer]})
        assert res.status_code == 422
