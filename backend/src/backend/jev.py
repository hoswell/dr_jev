import json
import logging
import time

from dotenv import load_dotenv
from typesafe_sdk import AsyncTypeSafeClient, Choice, Noul, Score

from backend.questions import QUESTIONS_BY_ID
from backend.schemas import Answer, Emotion, JevAssessment, Treatment

load_dotenv()  # TYPESAFE_API_KEY

logger = logging.getLogger(__name__)

MODEL = "jev-latest"

# probability of "yes" above which a noul counts as true; ambulance errs on the side of calling
AMBULANCE_THRESHOLD = 0.5
KICK_OUT_THRESHOLD = 0.5

EMOTION_CRITERIA = {
    Emotion.CALM: "Relaxed, composed, unbothered",
    Emotion.ANXIOUS: "Worried, nervous, on edge",
    Emotion.ANGRY: "Irritated, hostile, aggressive",
    Emotion.SAD: "Low, upset, tearful",
    Emotion.AFRAID: "Frightened, panicking",
}

QUESTIONS = {
    "criticality": Score(
        instructions="How medically critical is this patient's condition?",
        criteria=[
            "No medical concern",
            "Very minor, self-resolving",
            "Minor, can wait weeks",
            "Mild, should see a doctor this month",
            "Moderate, should see a doctor this week",
            "Concerning, should be seen in the next few days",
            "Serious, should be seen within a day",
            "Urgent, needs same-day hospital care",
            "Severe, needs emergency care within the hour",
            "Life-threatening, needs immediate emergency intervention",
        ],
    ),
    "call_ambulance": Noul(
        instructions="Does this patient need an ambulance called right now?",
    ),
    "treatment": Choice(
        instructions="What is the most appropriate treatment for this patient?",
        criteria={
            Treatment.REST: "Rest and self-care at home is enough",
            Treatment.MEDICATION: "Medication is needed, but no hospital visit",
            Treatment.HOSPITAL_VISIT: "The patient needs to be seen at a hospital",
            Treatment.SURGERY: "The patient needs surgery",
        },
    ),
    "patient_honesty": Score(
        instructions="How honest and candid is the patient being in their answers?",
        criteria=[
            "Clearly lying",
            "Almost certainly lying",
            "Very likely hiding important facts",
            "Probably hiding or distorting facts",
            "Somewhat evasive",
            "Mostly honest with some doubtful details",
            "Honest, minor omissions",
            "Honest and fairly forthcoming",
            "Very honest and forthcoming",
            "Completely candid and truthful",
        ],
    ),
    "patient_emotion": Choice(
        instructions="What is the patient's dominant emotion?",
        criteria=EMOTION_CRITERIA,
    ),
    "doctor_emotion": Choice(
        instructions=(
            "What is the doctor's dominant emotion as they listen to the patient's answers?"
        ),
        criteria=EMOTION_CRITERIA,
    ),
    "kick_out_office": Noul(
        instructions=(
            "Is this patient abusive, hostile or disruptive enough that they "
            "should be removed from the doctor's office?"
        ),
    ),
}


def _state(answers: list[Answer]) -> list[dict[str, str]]:
    return [
        {"question": QUESTIONS_BY_ID[a.question_id].text, "patient_answer": a.answer}
        for a in answers
    ]


def _pretty(obj: object) -> str:
    return json.dumps(obj, indent=2, default=str)


async def ask_jev(answers: list[Answer]) -> JevAssessment:
    state = _state(answers)
    logger.info(
        "Jev request (model=%s)\nstate:\n%s\nquestions:\n%s",
        MODEL,
        _pretty(state),
        _pretty(
            {
                k: q.model_dump(mode="json", exclude_none=True)
                for k, q in QUESTIONS.items()
            }
        ),
    )

    start = time.perf_counter()
    async with AsyncTypeSafeClient(model=MODEL) as client:
        response = await client.system_one(state, QUESTIONS)
    elapsed = time.perf_counter() - start

    logger.info(
        "Jev response (%.2fs, model=%s, usage=%s)\nanswers:\n%s",
        elapsed,
        response.model,
        response.usage.model_dump(mode="json"),
        _pretty({k: a.model_dump(mode="json") for k, a in response.answers.items()}),
    )

    assessment = JevAssessment(
        criticality=round(response.scores["criticality"].score),
        call_ambulance=response.nouls["call_ambulance"].noul >= AMBULANCE_THRESHOLD,
        treatment=Treatment(response.choices["treatment"].choice),
        patient_honesty=round(response.scores["patient_honesty"].score),
        patient_emotion=Emotion(response.choices["patient_emotion"].choice),
        doctor_emotion=Emotion(response.choices["doctor_emotion"].choice),
        kick_out_office=response.nouls["kick_out_office"].noul >= KICK_OUT_THRESHOLD,
    )
    logger.info(
        "Assessment (ambulance threshold=%s, kick-out threshold=%s): %s",
        AMBULANCE_THRESHOLD,
        KICK_OUT_THRESHOLD,
        assessment.model_dump_json(),
    )
    return assessment
