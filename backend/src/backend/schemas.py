from enum import StrEnum

from pydantic import BaseModel, Field


class Treatment(StrEnum):
    NONE = "none"
    REST = "rest"
    MEDICATION = "medication"
    HOSPITAL_VISIT = "hospital_visit"
    SURGERY = "surgery"


class Emotion(StrEnum):
    CALM = "calm"
    ANXIOUS = "anxious"
    ANGRY = "angry"
    SAD = "sad"
    AFRAID = "afraid"


class SessionCreated(BaseModel):
    session_id: int


class Question(BaseModel):
    id: str
    text: str


class Answer(BaseModel):
    question_id: str
    answer: str


class SubmitAnswers(BaseModel):
    answers: list[Answer] = Field(min_length=1)


class ScoreResult(BaseModel):
    score: int = Field(ge=0, le=9)
    confidence: float = Field(ge=0, le=1)


class ChoiceResult[T: StrEnum](BaseModel):
    choice: T
    confidence: float = Field(ge=0, le=1)


class NoulResult(BaseModel):
    """Jev gives yes/no answers a yes-probability but no confidence."""

    noul: bool
    probability: float = Field(ge=0, le=1)


class JevAssessment(BaseModel):
    criticality: ScoreResult
    call_ambulance: NoulResult
    treatment: ChoiceResult[Treatment]
    patient_honesty: ScoreResult
    patient_emotion: ChoiceResult[Emotion]
    doctor_emotion: ChoiceResult[Emotion]
    kick_out_office: NoulResult
