from fastapi import APIRouter, HTTPException

from backend import store
from backend.jev import ask_jev
from backend.questions import QUESTION_IDS, QUESTIONS
from backend.schemas import JevAssessment, Question, SessionCreated, SubmitAnswers

router = APIRouter()


@router.post("/sessions", response_model=SessionCreated, status_code=201)
def create_session() -> SessionCreated:
    return SessionCreated(session_id=store.create_session())


@router.get("/questions", response_model=list[Question])
def get_questions() -> list[Question]:
    return QUESTIONS


@router.post("/sessions/{session_id}/answers", response_model=JevAssessment)
def submit_answers(session_id: int, body: SubmitAnswers) -> JevAssessment:
    if session_id not in store.SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")

    for answer in body.answers:
        if answer.question_id not in QUESTION_IDS:
            raise HTTPException(
                status_code=422, detail=f"Unknown question_id: {answer.question_id}"
            )

    store.SESSIONS[session_id] = body.answers
    return ask_jev(body.answers)
