import itertools

from backend.schemas import Answer

SESSIONS: dict[int, list[Answer]] = {}
_session_ids = itertools.count(1)


def create_session() -> int:
    session_id = next(_session_ids)
    SESSIONS[session_id] = []
    return session_id
