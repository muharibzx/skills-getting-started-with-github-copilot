from fastapi.testclient import TestClient

from src.app import app, activities


client = TestClient(app)


def test_unregister_participant_removes_student_from_activity():
    activity = activities["Chess Club"]
    original_participants = list(activity["participants"])

    try:
        response = client.delete(
            "/activities/Chess%20Club/unregister?email=michael@mergington.edu"
        )

        assert response.status_code == 200
        assert response.json()["message"] == "Unregistered michael@mergington.edu from Chess Club"
        assert "michael@mergington.edu" not in activity["participants"]
        assert activity["participants"] == ["daniel@mergington.edu"]
    finally:
        activity["participants"] = original_participants
