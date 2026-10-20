from backend.schemas import Question

QUESTIONS: list[Question] = [
    Question(
        id="q1", text="What brings you into the clinic today, and where does it hurt?"
    ),
    Question(
        id="q2",
        text="How long have you been experiencing these symptoms, and how sudden was the onset?",
    ),
    Question(
        id="q3", text="On a scale of 1 to 10, how severe is your discomfort right now?"
    ),
    Question(
        id="q4",
        text="Have you taken any medications, remedies, or unusual substances in the last 24 hours?",
    ),
    Question(
        id="q5",
        text="Is there anything else about your lifestyle or medical history you might be holding back?",
    ),
]

QUESTIONS_BY_ID: dict[str, Question] = {q.id: q for q in QUESTIONS}
