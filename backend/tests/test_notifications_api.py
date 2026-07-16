"""Tests for /api/notifications endpoints."""

from app.core.database import SessionLocal
from app.services.notification_management_service import NotificationManagementService


def _unwrap(response):
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["success"] is True
    assert "data" in body
    assert "timestamp" in body
    return body["data"]


def _create_notifications(db, tenant_id: int, user_id: int, count: int = 3):
    for i in range(count):
        NotificationManagementService.create_for_user(
            db,
            tenant_id=tenant_id,
            user_id=user_id,
            title=f"Notification {i + 1}",
            message=f"Message {i + 1}",
            type="information",
            priority="medium",
            module="system",
            action_url="/",
            created_by="System",
        )


def test_list_notifications_empty(register_admin, client):
    auth = register_admin()
    data = _unwrap(client.get("/api/notifications", headers=auth["headers"]))
    assert data["items"] == []
    assert data["unread_count"] == 0


def test_unread_count_and_mark_read(register_admin, client):
    auth = register_admin()
    db = SessionLocal()
    try:
        _create_notifications(db, auth["user"]["tenant_id"], auth["user"]["id"], 3)
    finally:
        db.close()

    count_data = _unwrap(client.get("/api/notifications/unread-count", headers=auth["headers"]))
    assert count_data["unread_count"] == 3

    list_data = _unwrap(client.get("/api/notifications", headers=auth["headers"]))
    first_id = list_data["items"][0]["id"]

    mark_data = _unwrap(
        client.put(f"/api/notifications/{first_id}/read", headers=auth["headers"])
    )
    assert mark_data["unread_count"] == 2
    assert mark_data["notification"]["is_read"] is True

    # Reading again must not change count
    again = _unwrap(client.put(f"/api/notifications/{first_id}/read", headers=auth["headers"]))
    assert again["unread_count"] == 2


def test_mark_all_read(register_admin, client):
    auth = register_admin()
    db = SessionLocal()
    try:
        _create_notifications(db, auth["user"]["tenant_id"], auth["user"]["id"], 2)
    finally:
        db.close()

    data = _unwrap(client.put("/api/notifications/read-all", headers=auth["headers"]))
    assert data["unread_count"] == 0
    assert all(item["is_read"] for item in data["items"])


def test_delete_notification(register_admin, client):
    auth = register_admin()
    db = SessionLocal()
    try:
        _create_notifications(db, auth["user"]["tenant_id"], auth["user"]["id"], 2)
    finally:
        db.close()

    list_data = _unwrap(client.get("/api/notifications", headers=auth["headers"]))
    notification_id = list_data["items"][0]["id"]

    delete_data = _unwrap(
        client.delete(f"/api/notifications/{notification_id}", headers=auth["headers"])
    )
    assert delete_data["deleted"] is True
    assert delete_data["total"] == 1


def test_clear_notifications(register_admin, client):
    auth = register_admin()
    db = SessionLocal()
    try:
        _create_notifications(db, auth["user"]["tenant_id"], auth["user"]["id"], 4)
    finally:
        db.close()

    data = _unwrap(client.delete("/api/notifications/clear", headers=auth["headers"]))
    assert data["unread_count"] == 0
    assert data["items"] == []
    assert data["total"] == 0


def test_user_isolation(register_admin, client):
    user_a = register_admin()
    user_b = register_admin()

    db = SessionLocal()
    try:
        _create_notifications(db, user_a["user"]["tenant_id"], user_a["user"]["id"], 1)
        _create_notifications(db, user_b["user"]["tenant_id"], user_b["user"]["id"], 1)
    finally:
        db.close()

    a_list = _unwrap(client.get("/api/notifications", headers=user_a["headers"]))
    b_list = _unwrap(client.get("/api/notifications", headers=user_b["headers"]))

    assert len(a_list["items"]) == 1
    assert len(b_list["items"]) == 1
    assert a_list["items"][0]["id"] != b_list["items"][0]["id"]

    other_id = b_list["items"][0]["id"]
    resp = client.put(f"/api/notifications/{other_id}/read", headers=user_a["headers"])
    assert resp.status_code == 404


def test_requires_auth(client):
    resp = client.get("/api/notifications")
    assert resp.status_code == 401
