from backend.schemas import Answer, JevAssessment, PatientEmotion, Treatment

_EMOTIONS = {
    1: PatientEmotion.CALM,
    2: PatientEmotion.ANXIOUS,
    3: PatientEmotion.ANGRY,
    4: PatientEmotion.AFRAID,
}


def ask_jev(answers: list[Answer]) -> JevAssessment:
    """Placeholder heuristic: replace with the real assessment logic."""
    by_question = {a.question_id: a.answer_id for a in answers}

    # answer_id 1..4 -> 0..3 severity per answered question
    severity = [aid - 1 for qid, aid in by_question.items() if qid in {"q1", "q2", "q3"}]
    criticality = min(10, round(sum(severity) * 10 / 9)) if severity else 0

    if criticality >= 8:
        treatment = Treatment.SURGERY
    elif criticality >= 5:
        treatment = Treatment.HOSPITAL_VISIT
    elif criticality >= 2:
        treatment = Treatment.MEDICATION
    else:
        treatment = Treatment.REST

    honesty = {1: 10, 2: 4, 3: 8, 4: 3}[by_question.get("q4", 1)]

    emotion = _EMOTIONS[by_question.get("q5", 1)]

    return JevAssessment(
        criticality=criticality,
        call_ambulance=criticality >= 8,
        treatment=treatment,
        patient_honesty=honesty,
        patient_emotion=emotion,
        kick_out_office=emotion == PatientEmotion.ANGRY and honesty <= 4,
    )
