"""Company settings API smoke test."""


def test_company_settings_get_and_update(client):
    from app.core.database import SessionLocal
    from app.core.seed_roles import seed_roles
    from app.core.seed_tenant import seed_tenant
    from app.core.seed_users import seed_admin_user

    db = SessionLocal()
    try:
        seed_tenant(db)
        seed_roles(db)
        seed_admin_user(db)
    finally:
        db.close()

    login = client.post(
        "/auth/login",
        json={"email": "admin@smrt.local", "password": "admin123"},
    )
    assert login.status_code == 200, login.text
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    get_resp = client.get("/settings/company", headers=headers)
    assert get_resp.status_code == 200, get_resp.text
    data = get_resp.json()
    assert "tenant_id" in data

    put_resp = client.put(
        "/settings/company",
        headers=headers,
        json={"company_name": "SMRT Manufacturing Pvt Ltd"},
    )
    assert put_resp.status_code == 200, put_resp.text
    assert put_resp.json()["company_name"] == "SMRT Manufacturing Pvt Ltd"
