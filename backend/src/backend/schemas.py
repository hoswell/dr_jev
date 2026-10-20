from enum import StrEnum

from pydantic import BaseModel, Field


class Treatment(StrEnum):
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


class JevAssessment(BaseModel):
    criticality: int = Field(ge=0, le=9)
    call_ambulance: bool
    treatment: Treatment
    patient_honesty: int = Field(ge=0, le=9)
    patient_emotion: Emotion
    doctor_emotion: Emotion
    kick_out_office: bool
