from backend.schemas import Question

QUESTIONS: list[Question] = [
    Question(id="q1", text="How would you describe your pain right now?"),
    Question(id="q2", text="How long have you had these symptoms?"),
    Question(id="q3", text="Are you having trouble breathing?"),
    Question(id="q4", text="Have you taken any medication for this?"),
    Question(id="q5", text="How are you feeling emotionally?"),
]

QUESTION_IDS: set[str] = {q.id for q in QUESTIONS}
