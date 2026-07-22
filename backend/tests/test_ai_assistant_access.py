def test_ai_assistant_rejects_non_operator_users(client, register_admin):
    admin = register_admin()

    response = client.post(
        "/ai/chat",
        json={"message": "Hello"},
        headers=admin["headers"],
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Operator access is required to use the AI assistant."


def test_ai_assistant_allows_operator_users(client, register_admin, make_restricted_user):
    admin = register_admin()
    restricted = make_restricted_user(admin["user"]["tenant_id"], [])

    response = client.post(
        "/ai/chat",
        json={"message": "Show my work orders"},
        headers=restricted["headers"],
    )

    assert response.status_code == 200
    body = response.json()
    assert body["conversation_id"]
    assert body["message"]


def test_ai_assistant_answers_general_operator_status_questions(client, register_admin, make_restricted_user):
    admin = register_admin()
    restricted = make_restricted_user(admin["user"]["tenant_id"], [])

    response = client.post(
        "/ai/chat",
        json={"message": "What is happening today?"},
        headers=restricted["headers"],
    )

    assert response.status_code == 200
    body = response.json()
    assert body["message"]
    assert "Work Orders" in body["message"] or "Production" in body["message"] or "Machine" in body["message"]
